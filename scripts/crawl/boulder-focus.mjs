// One-off refocus pass: the catalogue is CU Boulder-focused. Remove resources
// solely associated with other CU campuses (Denver / UCCS / Anschutz):
// - courses not offered at CU Boulder
// - impact-dashboard programs whose campuses don't include CU Boulder
// - crawled cuanschutz.edu resources (promoted during widening, out of scope)
// Multi-campus resources that include Boulder stay. Campus annotations are
// dropped entirely (no longer needed). Also prunes relationships/enriched and
// rewrites courses.json Boulder-only.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'public', 'data', 'crawl')
const j = f => JSON.parse(readFileSync(join(OUT_DIR, f), 'utf8'))

const resources = j('resources.json')

const drop = r =>
  (r.id.startsWith('course-') && !(r.campus || []).includes('CU Boulder')) ||
  ((r.sources || []).join() === 'impact-dashboard' && !r.id.startsWith('course-') && !(r.campus || []).includes('CU Boulder')) ||
  /(^|\.)cuanschutz\.edu|ucdenver\.edu|uccs\.edu/.test(r.org)

const kept = resources.filter(r => !drop(r))
for (const r of kept) delete r.campus
const keptIds = new Set(kept.map(r => r.id))
console.log(`resources: ${resources.length} → ${kept.length} (removed ${resources.length - kept.length})`)
writeFileSync(join(OUT_DIR, 'resources.json'), JSON.stringify(kept, null, 1))

const rel = j('relationships.json').filter(e => keptIds.has(e.from) && keptIds.has(e.to))
writeFileSync(join(OUT_DIR, 'relationships.json'), JSON.stringify(rel, null, 1))

const enriched = j('enriched.json')
const enrichedKept = Object.fromEntries(Object.entries(enriched).filter(([id]) => keptIds.has(id)))
console.log(`enriched: ${Object.keys(enriched).length} → ${Object.keys(enrichedKept).length}`)
writeFileSync(join(OUT_DIR, 'enriched.json'), JSON.stringify(enrichedKept, null, 1))

const recent = j('recent.json').filter(r => keptIds.has(r.id))
writeFileSync(join(OUT_DIR, 'recent.json'), JSON.stringify(recent, null, 1))

// courses.json → Boulder-only, no campus field needed
const cd = j('courses.json')
const boulderCourses = cd.courses.filter(c => c.campus === 'CU Boulder').map(({ campus, ...c }) => c)
const STOP = new Set('the a an of and or in to for with intro introduction i ii iii'.split(' '))
const vocab = {}
for (const c of boulderCourses)
  for (const w of c.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ')) {
    if (w.length < 4 || STOP.has(w)) continue
    ;(vocab[w] = vocab[w] || []).push(c.code)
  }
writeFileSync(join(OUT_DIR, 'courses.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: cd.source, scope: 'CU Boulder only',
  courses: boulderCourses,
  searchTerms: Object.entries(vocab).sort((a, b) => b[1].length - a[1].length)
    .map(([term, codes]) => ({ term, courses: codes.length, examples: codes.slice(0, 5) })).slice(0, 200),
}, null, 1))
console.log(`courses: ${cd.courses.length} → ${boulderCourses.length}`)

const summary = j('summary.json')
summary.resourcesCatalogued = kept.length
summary.relationshipEdges = rel.length
summary.updatedAt = new Date().toISOString()
writeFileSync(join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 1))
console.log('✓ boulder focus applied')
