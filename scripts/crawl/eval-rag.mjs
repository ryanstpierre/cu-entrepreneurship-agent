// Evaluate persona query sets against the site's actual retrieval stack:
// same model (Xenova/all-MiniLM-L6-v2), same corpus (src/data/corpus-embeddings.json),
// same cosine top-k. Scores each query's top-5 against the persona's `expect`
// annotations (type + org hits) and writes public/data/crawl/persona-eval.json.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const PERSONA_DIR = join(__dirname, 'state', 'personas')

// crawl type -> chat-corpus category (mirror of generate-embeddings.js)
const TYPE_TO_CATEGORY = {
  funding: 'Funding & Prizes', competition: 'Funding & Prizes',
  program: 'Accelerator', center: 'Entrepreneurship Hub',
  course: 'Entrepreneurial Training', event: 'Events & Workshops',
  space: 'Space & Resources', community: 'Community & Networking',
  service: 'Mentorship & Advising',
}

const corpus = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'corpus-embeddings.json'), 'utf8'))
const personas = readdirSync(PERSONA_DIR).filter(f => f.startsWith('personas-'))
  .flatMap(f => JSON.parse(readFileSync(join(PERSONA_DIR, f), 'utf8')))

console.log(`corpus: ${corpus.length} docs, personas: ${personas.length}`)

const { pipeline } = await import('@xenova/transformers')
const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')

const cos = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s }

const results = []
let qn = 0
for (const p of personas) {
  for (const q of p.queries || []) {
    const text = typeof q === 'string' ? q : q.query || q.q || q.text
    if (!text) continue
    const out = await extractor(text, { pooling: 'mean', normalize: true })
    const qe = Array.from(out.data)
    const top5 = corpus.map(d => ({ d, score: cos(qe, d.embedding) }))
      .sort((a, b) => b.score - a.score).slice(0, 5)
      .map(({ d, score }) => ({
        name: d.metadata.name, category: d.metadata.category,
        website: d.metadata.website || '', score: +score.toFixed(3),
      }))

    const expect = q.expect || {}
    const expCats = [...new Set((expect.types || []).map(t => TYPE_TO_CATEGORY[t] || t))]
    const typeHit = expCats.length === 0 ? null :
      top5.some(r => expCats.includes(r.category))
    const orgHit = !(expect.orgs || []).length ? null :
      top5.some(r => (expect.orgs || []).some(o =>
        (r.website + ' ' + r.name).toLowerCase().includes(o.toLowerCase().replace(/^www\./, '').split('/')[0].split(' ')[0])))
    const topScore = top5[0]?.score ?? 0

    results.push({
      persona: p.id, role: p.role, query: text,
      expect: { types: expect.types || [], orgs: expect.orgs || [], note: expect.note || '' },
      top5, typeHit, orgHit, topScore,
      weak: topScore < 0.45 || typeHit === false,
    })
    if (++qn % 50 === 0) console.log(`  … ${qn} queries`)
  }
}

const scored = results.filter(r => r.typeHit !== null)
const summary = {
  generatedAt: new Date().toISOString(),
  personas: personas.length,
  queries: results.length,
  typeHitRate: +(scored.filter(r => r.typeHit).length / Math.max(1, scored.length)).toFixed(3),
  orgHitRate: +(results.filter(r => r.orgHit).length / Math.max(1, results.filter(r => r.orgHit !== null).length)).toFixed(3),
  weakQueries: results.filter(r => r.weak).length,
  byRole: {},
}
for (const r of scored) {
  const b = summary.byRole[r.role] = summary.byRole[r.role] || { n: 0, hits: 0 }
  b.n++; if (r.typeHit) b.hits++
}
for (const b of Object.values(summary.byRole)) b.rate = +(b.hits / b.n).toFixed(3)

writeFileSync(join(ROOT, 'public', 'data', 'crawl', 'persona-eval.json'), JSON.stringify({
  summary,
  personas: personas.map(p => ({
    id: p.id, name: p.name, role: p.role, affiliation: p.affiliation,
    background: p.background, journey_so_far: p.journey_so_far, goals: p.goals,
    constraints: p.constraints, stage: p.stage, sectors: p.sectors, peers: p.peers,
  })),
  results,
}, null, 1))
console.log(JSON.stringify(summary, null, 1))
