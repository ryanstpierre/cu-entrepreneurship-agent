// Generate machine-readable docs from the live data so schemas never drift:
// - public/data/crawl/schema.json — per-endpoint field docs + ACTUAL enum values
//   and value distributions pulled from the data (for LLM query construction)
// - public/llms.txt — root-level orientation file for LLM agents

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'public', 'data', 'crawl')
const j = f => JSON.parse(readFileSync(join(OUT_DIR, f), 'utf8'))

const resources = j('resources.json')
const people = j('people.json')
const courses = j('courses.json')
const graph = j('entity-graph.json')
const seq = j('sequence-edges.json')
const evalData = j('persona-eval.json')
let companies = null
try { companies = j('company-journeys.json') } catch {}

const count = (arr) => {
  const c = {}
  for (const v of arr) if (v) c[v] = (c[v] || 0) + 1
  return Object.fromEntries(Object.entries(c).sort((a, b) => b[1] - a[1]))
}
const BASE = 'https://cu-entrepreneurship-agent.pages.dev/data/crawl/'

const schema = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE,
  cors: 'Access-Control-Allow-Origin: * — fetchable from any origin, no auth',
  joinKeys: {
    'resource.id': 'primary key; referenced by relationships(from/to), enriched (object key), entity-graph entities[].resources, people[].resources[].id and affinity.programs[].id, sequence-edges (from/to)',
    'person name': 'people[].name matches entity-graph person entities and enriched entities.people surface forms (fuzzy — surface forms may include roles)',
    'course id': "courses.json courses[].id === resources.json id for type='course' entries ('course-<code>')",
  },
  endpoints: {
    'resources.json': {
      description: 'The catalogue. Array of resource objects.',
      rows: resources.length,
      fields: {
        id: 'string, stable slug, primary join key',
        url: 'string (empty for courses)',
        title: 'string',
        org: { description: 'owning subsite/domain', values: count(resources.map(r => r.org)) },
        type: { description: 'resource kind', values: count(resources.map(r => r.type)) },
        audience: { description: 'detected eligibility (array)', values: count(resources.flatMap(r => r.audience || [])) },
        access: { description: 'verbatim access tags from CU System impact dashboard (array)', values: count(resources.flatMap(r => r.access || [])) },
        stage: { description: 'startup-journey stage (array)', values: count(resources.flatMap(r => r.stage || [])) },
        sectors: { description: 'sector tags (array)', values: count(resources.flatMap(r => r.sectors || [])) },
        specificity: 'int 0–10: actionability score (contacts+dollars+deadlines+apply-links+eligibility). >=6 is highly actionable.',
        depth: 'int: link-depth at discovery (0 = seed/dashboard)',
        funding: 'string[]: dollar amounts found on page',
        deadlines: 'string[]: deadline snippets with context',
        contacts: 'string[]: emails found on page',
        summary: 'string: LLM-written 1-2 sentence summary (most rows)',
        sources: { description: 'provenance (absent = crawl)', values: count(resources.flatMap(r => r.sources || ['crawl'])) },
      },
    },
    'people.json': {
      description: 'University people extracted from page text with affinity scores. Object: {generatedAt, stats, people[]}.',
      rows: people.people.length,
      fields: {
        roleClass: { description: 'classified university role', values: people.stats.byRoleClass },
        'affinity.orgs/types': 'top-5 {name, score} — specificity-weighted appearance counts',
        'affinity.programs': 'up to 8 {id, title, weight} — programs/centers/funding this person appears on',
        resources: 'up to 10 {id, title, url} they were seen on',
      },
    },
    'courses.json': {
      description: 'CU Boulder I&E courses (from the CU System impact dashboard) + search vocabulary. Object: {courses[], searchTerms[]}.',
      rows: courses.courses.length,
      fields: {
        'courses[].level': { values: count(courses.courses.map(c => c.level)) },
        'courses[].college': { values: count(courses.courses.map(c => c.college)) },
        searchTerms: 'top course-title terms {term, courses, examples[]} — use for query expansion',
      },
    },
    'relationships.json': { description: 'Typed link edges between resources: {from, to, kind, weight}. kind=links_to mostly; use for adjacency/pathfinding.', rows: j('relationships.json').length },
    'enriched.json': { description: 'Object keyed by resource id: {summary, entities:{people, orgs, programs, amounts, dates, eligibility}} — all string arrays.', rows: Object.keys(j('enriched.json')).length },
    'entity-graph.json': {
      description: 'Consolidated entities + co-occurrence. {entities[], cooccurrence[], programMentions[], inLinkTop[]}.',
      rows: graph.entities.length,
      fields: { 'entities[].type': { values: graph.stats.byType } },
    },
    'sequence-edges.json': {
      description: 'Program sequencing: {from, to, fromName, toName, kind, confidence, evidence}. Sparse but high-precision.',
      rows: seq.length,
      kinds: count(seq.map(e => e.kind)),
    },
    'persona-eval.json': {
      description: '44 personas × ~7 queries evaluated against the live RAG stack. {summary, personas[], results[]}.',
      rows: evalData.results.length,
      note: 'results[].weak=true rows are known retrieval gaps — useful as a test set',
    },
    ...(companies ? { 'company-journeys.json': {
      description: 'Golden test set: historical companies with the programs/entities they touched + outcomes with verbatim evidence. {stats, programEfficacy[], companies[]}.',
      rows: companies.companies.length,
      outcomeKinds: companies.stats.byOutcomeKind,
      note: 'programEfficacy[] = per-program company counts + funding/exit counts. Coverage bounded by crawled narratives — absence is not evidence of absence.',
    } } : {}),
    'summary.json': { description: 'Crawl totals, depth histogram + saturation, per-org depth.' },
    'analysis-queue.json': { description: 'Pages flagged for deeper extraction (PDFs etc), relevance-sorted.' },
    'discovery-queue.json': { description: 'External domains cited by the ecosystem, citation-count-sorted.' },
  },
}
writeFileSync(join(OUT_DIR, 'schema.json'), JSON.stringify(schema, null, 1))

const llms = `# CU Entrepreneurship Ecosystem Dataset

> ${resources.length} catalogued CU Boulder innovation & entrepreneurship resources from a
> depth-8 saturated crawl of 4,700+ pages plus the CU System I&E impact dashboard
> (filtered to Boulder). Includes ${people.people.length} tagged people, ${courses.courses.length} courses,
> LLM summaries, entities, sequencing edges, and a persona eval set.
> All JSON, CORS-open, no auth. Base: ${BASE}

## Start here
- ${BASE}schema.json — machine-readable field docs with ACTUAL enum values and counts. Fetch this first to construct valid filters.
- ${BASE}API.md — human-oriented guide: schemas, join keys, query recipes.

## Data
- ${BASE}resources.json — the catalogue (join key: id)
- ${BASE}relationships.json — link edges between resources
- ${BASE}enriched.json — LLM summaries + entities per resource
- ${BASE}entity-graph.json — consolidated people/org/program entities + co-occurrence
- ${BASE}people.json — faculty/staff/mentors with program affinity scores
- ${BASE}courses.json — CU Boulder I&E courses + search vocabulary
- ${BASE}sequence-edges.json — which programs precede/feed into which
- ${BASE}persona-eval.json — 44 personas, 322 queries, RAG hit rates (weak rows = known gaps)
${companies ? `- ${BASE}company-journeys.json — ${companies.companies.length} historical company journeys: programs touched + outcomes (golden test set)` : ''}
- ${BASE}summary.json — crawl stats and depth-saturation proof

## How to query (for LLM agents)
1. Fetch schema.json for valid field values — do not guess enum strings.
2. Filter resources.json client-side (it is a plain array; ~2MB).
   Typical filters: type, audience[], stage[], sectors[], specificity>=6, funding.length>0.
3. Resolve names→people via people.json (roleClass: faculty|staff|mentor|founder-alum).
4. For "what comes next" questions use sequence-edges.json, then stage[] ordering
   (explore→validate→build→launch), then funding amounts ascending.
5. For course questions filter courses.json by level; use searchTerms for synonyms.

## Interfaces
- / — chat navigator (client-side RAG over this dataset)
- /crawl — live crawl dashboard
- /personas — persona & eval explorer
- /people — people & course explorer
`
writeFileSync(join(__dirname, '..', '..', 'public', 'llms.txt'), llms)
console.log('✓ schema.json + llms.txt generated')
