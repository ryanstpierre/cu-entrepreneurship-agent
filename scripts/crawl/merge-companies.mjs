// Merge company-journey shards (state/company-shards/companies-*.json) into
// public/data/crawl/company-journeys.json:
// - consolidate duplicate companies across shards (normalized name)
// - canonicalize program names and resolve them to catalogue resource ids
// - compute per-program outcome stats (the "efficacy" view: which programs the
//   successful companies touched)

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHARD_DIR = join(__dirname, 'state', 'company-shards')
const OUT_DIR = join(__dirname, '..', '..', 'public', 'data', 'crawl')

const resources = JSON.parse(readFileSync(join(OUT_DIR, 'resources.json'), 'utf8'))
const norm = s => (s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

// canonical program names → catalogue resource id (best-effort)
const CANON = [
  [/new venture challenge|^nvc\b/i, 'New Venture Challenge'],
  [/catalyze/i, 'Catalyze CU'],
  [/venture partners|tech transfer|technology transfer/i, 'Venture Partners'],
  [/i-?corps/i, 'I-Corps'],
  [/lab venture challenge|lvc/i, 'Lab Venture Challenge'],
  [/embark/i, 'Embark Deep Tech Startup Creator'],
  [/ascent/i, 'Ascent Deep Tech Accelerator'],
  [/destination startup/i, 'Destination Startup'],
  [/starting blocks/i, 'Starting Blocks'],
  [/r2m|research.to.market/i, 'Research-to-Market'],
  [/innosphere/i, 'Innosphere Ventures'],
  [/techstars/i, 'Techstars'],
  [/boulder startup week/i, 'Boulder Startup Week'],
  [/deming/i, 'Deming Center'],
  [/silicon flatirons/i, 'Silicon Flatirons'],
  [/gap fund|venture capital fund|buff gold/i, 'CU Gap Fund'],
]
const canonName = p => { for (const [re, n] of CANON) if (re.test(p)) return n; return p.trim() }

const titleIndex = {}
for (const r of resources) {
  const t = norm(r.title.split('|')[0])
  if (t.length >= 4 && !titleIndex[t]) titleIndex[t] = r.id
}
const resolveProgram = name => titleIndex[norm(name)] || null

const companies = {}
for (const f of readdirSync(SHARD_DIR).filter(f => f.startsWith('companies-') && f.endsWith('.json')).sort()) {
  let arr
  try { arr = JSON.parse(readFileSync(join(SHARD_DIR, f), 'utf8')) } catch { console.warn(`⚠ ${f}: parse error, skipped`); continue }
  for (const c of arr) {
    if (!c?.name || !(c.programs || []).length) continue
    const key = norm(c.name)
    if (!key) continue
    const ex = companies[key] || { name: c.name, founders: [], sector: c.sector || '', programs: [], outcomes: [], sources: [] }
    if (c.name.length < ex.name.length) ex.name = c.name
    if (!ex.sector && c.sector) ex.sector = c.sector
    for (const fo of c.founders || []) if (!ex.founders.some(x => norm(x) === norm(fo))) ex.founders.push(fo)
    for (const p of c.programs || []) {
      const cn = canonName(p.program || '')
      if (!cn) continue
      const dup = ex.programs.find(x => x.program === cn)
      if (dup) { if ((p.detail || '').length > (dup.detail || '').length) { dup.detail = p.detail; dup.evidence = p.evidence } }
      else ex.programs.push({ program: cn, resourceId: resolveProgram(cn), detail: p.detail || '', evidence: p.evidence || '' })
    }
    for (const o of c.outcomes || []) {
      if (!ex.outcomes.some(x => x.kind === o.kind && norm(x.detail) === norm(o.detail)))
        ex.outcomes.push({ kind: o.kind, detail: o.detail || '', evidence: o.evidence || '' })
    }
    for (const s of c.sources || []) if (!ex.sources.includes(s)) ex.sources.push(s)
    companies[key] = ex
  }
}

const list = Object.values(companies).sort((a, b) => b.programs.length - a.programs.length || b.outcomes.length - a.outcomes.length)

// program efficacy: which programs appear in journeys, split by strongest outcome
const RANK = { ipo: 6, acquisition: 5, funding: 4, launch: 3, award: 2, active: 1, shutdown: 0 }
const best = c => c.outcomes.reduce((m, o) => Math.max(m, RANK[o.kind] ?? 0), -1)
const programStats = {}
for (const c of list) {
  const b = best(c)
  for (const p of c.programs) {
    const s = programStats[p.program] = programStats[p.program] || { program: p.program, resourceId: p.resourceId, companies: 0, withFundingOrExit: 0, examples: [] }
    s.companies++
    if (b >= 4) s.withFundingOrExit++
    if (s.examples.length < 6) s.examples.push(c.name)
  }
}
const stats = Object.values(programStats).sort((a, b) => b.companies - a.companies)

writeFileSync(join(OUT_DIR, 'company-journeys.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  note: 'Golden test set: historical companies extracted from crawled ecosystem pages with the programs they touched and observed outcomes. Evidence quotes are verbatim from source pages. Coverage is bounded by what the crawled pages narrate — absence of a program touchpoint is not evidence of absence.',
  stats: {
    companies: list.length,
    withMultiplePrograms: list.filter(c => c.programs.length >= 2).length,
    withOutcomes: list.filter(c => c.outcomes.length).length,
    byOutcomeKind: list.flatMap(c => c.outcomes.map(o => o.kind)).reduce((a, k) => (a[k] = (a[k] || 0) + 1, a), {}),
  },
  programEfficacy: stats,
  companies: list,
}, null, 1))

console.log(`✓ companies: ${list.length} (multi-program: ${list.filter(c => c.programs.length >= 2).length}, with outcomes: ${list.filter(c => c.outcomes.length).length})`)
console.log('top programs:', stats.slice(0, 8).map(s => `${s.program} ×${s.companies}`).join(' | '))
