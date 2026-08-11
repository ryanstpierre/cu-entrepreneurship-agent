// Forward/backward pass over the enriched dataset:
// - consolidate entities (people/orgs/programs) into a typed graph with
//   resource membership + co-occurrence edges
// - resolve program-name mentions to catalogue resource ids (forward)
// - compute in-links per resource from the relationship edges (backward)
// - extract sequencing-candidate sentences from stored page text
// Outputs: public/data/crawl/entity-graph.json, sequence-candidates.json (state)

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'public', 'data', 'crawl')
const TEXT_DIR = join(__dirname, 'state', 'text-shards')

const enriched = JSON.parse(readFileSync(join(OUT_DIR, 'enriched.json'), 'utf8'))
const resources = JSON.parse(readFileSync(join(OUT_DIR, 'resources.json'), 'utf8'))
const relationships = JSON.parse(readFileSync(join(OUT_DIR, 'relationships.json'), 'utf8'))
const byId = Object.fromEntries(resources.map(r => [r.id, r]))

const norm = s => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

// ---- entity nodes ----
const nodes = {} // key -> {name, type, count, resources:Set}
function addEntity(raw, type, rid) {
  if (typeof raw !== 'string') return // a few agents emitted objects; skip
  const clean = raw.replace(/\s+/g, ' ').trim()
  if (clean.length < 3 || clean.length > 90) return
  const key = type + '|' + norm(clean)
  if (!norm(clean)) return
  const n = nodes[key] || { name: clean, type, count: 0, resources: new Set() }
  n.count++
  n.resources.add(rid)
  // prefer the longest observed surface form (usually includes role)
  if (clean.length > n.name.length) n.name = clean
  nodes[key] = n
}

for (const [rid, e] of Object.entries(enriched)) {
  for (const p of e.entities?.people || []) addEntity(p, 'person', rid)
  for (const o of e.entities?.orgs || []) addEntity(o, 'org', rid)
  for (const p of e.entities?.programs || []) addEntity(p, 'program', rid)
}

// drop noise: entities seen once with very generic names
const GENERIC = /^(cu boulder|university of colorado|students?|faculty|staff|colorado|the university)$/
const kept = Object.entries(nodes).filter(([k, n]) =>
  !GENERIC.test(norm(n.name)) && (n.count >= 2 || n.type === 'person'))

// ---- forward pass: resolve program entities to catalogue resources ----
const titleIndex = {}
for (const r of resources) {
  const t = norm(r.title)
  if (t.length >= 8) titleIndex[t] = r.id
}
const mentionEdges = []
for (const [key, n] of kept) {
  if (n.type !== 'program') continue
  const resolved = titleIndex[norm(n.name)]
  if (resolved) {
    for (const rid of n.resources) {
      if (rid !== resolved) mentionEdges.push({ from: rid, to: resolved, kind: 'mentions_program', via: n.name })
    }
  }
}

// ---- co-occurrence edges between entities (same resource) ----
const cooc = {}
const byResource = {}
for (const [key, n] of kept) {
  for (const rid of n.resources) (byResource[rid] = byResource[rid] || []).push(key)
}
for (const keys of Object.values(byResource)) {
  for (let i = 0; i < keys.length && i < 25; i++)
    for (let j = i + 1; j < keys.length && j < 25; j++) {
      const k = [keys[i], keys[j]].sort().join('||')
      cooc[k] = (cooc[k] || 0) + 1
    }
}

// ---- backward pass: in-link degree per resource ----
const inLinks = {}
for (const e of relationships) inLinks[e.to] = (inLinks[e.to] || 0) + e.weight

// ---- sequencing candidates from stored page text ----
const SEQ_MARKERS = /(after (completing|participating|winning|graduating)|alumni of|graduates? of|next step|prepares (you|teams|students) for|feeder|pipeline (to|into)|leads? (to|into)|before applying|prerequisite|first step|then apply|advance[sd]? to|winners? (go on|advance|receive)|continue[sd]? (on )?to)/i
const candidates = []
for (const f of readdirSync(TEXT_DIR).filter(f => f.endsWith('.jsonl'))) {
  for (const line of readFileSync(join(TEXT_DIR, f), 'utf8').trim().split('\n')) {
    const item = JSON.parse(line)
    if (!byId[item.id]) continue
    for (const sent of item.text.split(/(?<=[.!?])\s+/)) {
      if (sent.length > 30 && sent.length < 400 && SEQ_MARKERS.test(sent)) {
        candidates.push({ resource: item.id, title: item.title, sentence: sent.trim() })
      }
    }
  }
}

// ---- exports ----
const entityList = kept.map(([key, n]) => ({
  id: key, name: n.name, type: n.type, count: n.count, resources: [...n.resources].slice(0, 30),
})).sort((a, b) => b.count - a.count)

const coocEdges = Object.entries(cooc).filter(([, w]) => w >= 2)
  .map(([k, w]) => { const [a, b] = k.split('||'); return { a, b, weight: w } })
  .sort((a, b) => b.weight - a.weight).slice(0, 4000)

writeFileSync(join(OUT_DIR, 'entity-graph.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  stats: {
    entities: entityList.length,
    byType: entityList.reduce((a, e) => (a[e.type] = (a[e.type] || 0) + 1, a), {}),
    coocEdges: coocEdges.length,
    programMentionEdges: mentionEdges.length,
  },
  entities: entityList,
  cooccurrence: coocEdges,
  programMentions: mentionEdges,
  inLinkTop: Object.entries(inLinks).sort((a, b) => b[1] - a[1]).slice(0, 50)
    .map(([id, w]) => ({ id, inWeight: w, title: byId[id]?.title })),
}, null, 1))

writeFileSync(join(__dirname, 'state', 'sequence-candidates.json'), JSON.stringify(candidates, null, 1))
console.log(`✓ entities: ${entityList.length} (${JSON.stringify(entityList.reduce((a, e) => (a[e.type] = (a[e.type] || 0) + 1, a), {}))})`)
console.log(`✓ cooc edges: ${coocEdges.length}, program-mention edges: ${mentionEdges.length}`)
console.log(`✓ sequencing candidates: ${candidates.length}`)
