// Post-crawl dedupe: collapse resources sharing a normalized title
// (CU news syndication publishes the same article across many subsites).
// Keeps the copy with highest specificity / shallowest depth, records the
// collapsed copies' orgs, and rewrites the exported views.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STATE_FILE = join(__dirname, 'state', 'crawl-state.json')
const OUT_DIR = join(__dirname, '..', '..', 'public', 'data', 'crawl')

const state = JSON.parse(readFileSync(STATE_FILE, 'utf8'))
const norm = t => t.toLowerCase().replace(/\s*\|.*$/, '').replace(/[^a-z0-9]+/g, ' ').trim()

const byTitle = {}
for (const r of Object.values(state.resources)) {
  const k = norm(r.title)
  ;(byTitle[k] = byTitle[k] || []).push(r)
}

let collapsed = 0
const keep = {}
const idRemap = {}
for (const group of Object.values(byTitle)) {
  group.sort((a, b) => b.specificity - a.specificity || a.depth - b.depth)
  const primary = group[0]
  if (group.length > 1) {
    primary.alsoSeenOn = [...new Set(group.slice(1).map(r => r.org))]
    collapsed += group.length - 1
    for (const dup of group.slice(1)) idRemap[dup.id] = primary.id
  }
  keep[primary.id] = primary
}

// remap edges onto surviving ids, drop self-edges, merge weights
const edges = {}
for (const [k, w] of Object.entries(state.edges)) {
  let [from, to, kind] = k.split('|')
  from = idRemap[from] || from
  to = idRemap[to] || to
  if (from === to || !keep[from] || !keep[to]) continue
  const nk = `${from}|${to}|${kind}`
  edges[nk] = (edges[nk] || 0) + w
}

const resources = Object.values(keep).sort((a, b) => b.specificity - a.specificity)
const summary = JSON.parse(readFileSync(join(OUT_DIR, 'summary.json'), 'utf8'))
summary.resourcesCatalogued = resources.length
summary.duplicatesCollapsed = collapsed
summary.relationshipEdges = Object.keys(edges).length
summary.byType = resources.reduce((a, r) => (a[r.type] = (a[r.type] || 0) + 1, a), {})
summary.byOrg = resources.reduce((a, r) => (a[r.org] = (a[r.org] || 0) + 1, a), {})
summary.updatedAt = new Date().toISOString()

writeFileSync(join(OUT_DIR, 'resources.json'), JSON.stringify(resources, null, 1))
writeFileSync(join(OUT_DIR, 'relationships.json'), JSON.stringify(
  Object.entries(edges).map(([k, weight]) => {
    const [from, to, kind] = k.split('|')
    return { from, to, kind, weight }
  }).sort((a, b) => b.weight - a.weight), null, 1))
writeFileSync(join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 1))

console.log(`deduped: ${collapsed} copies collapsed → ${resources.length} unique resources, ${Object.keys(edges).length} edges`)
