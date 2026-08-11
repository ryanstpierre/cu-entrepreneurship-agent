// Ingest the CU System I&E Impact dashboard dataset (state/impact-dashboard.json,
// extracted from https://2026-impact-production.up.railway.app/education-dashboard.html):
// - merge its 108 system-wide programs into resources.json (match by url/name;
//   new ones become resources with campus + access + category tags)
// - add its 275 I&E courses as `course` resources with campus/level/college
// - attach funding averages to matched programs
// - emit courses.json + a search-vocabulary file for query expansion
// Also updates summary.json counts so /crawl reflects the merge.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'public', 'data', 'crawl')

const impact = JSON.parse(readFileSync(join(__dirname, 'state', 'impact-dashboard.json'), 'utf8'))
const resources = JSON.parse(readFileSync(join(OUT_DIR, 'resources.json'), 'utf8'))

const CAMPUS = {
  'AMC': 'CU Anschutz', 'CU Anschutz Medical Campus': 'CU Anschutz',
  'CU Boulder': 'CU Boulder', 'CU Denver': 'CU Denver',
  'UCCS': 'UCCS', 'CU Colorado Springs': 'UCCS',
}
const CAT_TO_TYPE = {
  'Funding': 'funding', 'Mentorship & Support': 'service',
  'Academics & Learning': 'course', 'Community': 'community',
  'Events': 'event', 'Spaces & Resources': 'space',
}
const norm = s => (s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const normUrl = u => (u || '').toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/$/, '')

const byUrl = new Map(resources.map(r => [normUrl(r.url), r]))
const byTitle = new Map()
for (const r of resources) {
  const t = norm(r.title.split('|')[0])
  if (t.length >= 6 && !byTitle.has(t)) byTitle.set(t, r)
}

// audience normalization from the dashboard's access strings
function accessToAudience(access) {
  const out = new Set()
  for (const a of access || []) {
    const s = a.toLowerCase()
    if (/alumni/.test(s)) out.add('alumni')
    if (/faculty|medical professionals/.test(s)) out.add('faculty')
    if (/researcher/.test(s)) out.add('researchers')
    if (/graduate/.test(s)) out.add('grad students')
    if (/community/.test(s)) out.add('community')
    if (/student/.test(s)) out.add('students')
    if (/staff/.test(s)) out.add('staff')
  }
  return [...out]
}

// ---- merge programs ----
const funded = new Map((impact.FUNDING.funded || []).map(f => [norm(f.name), f]))
let matched = 0, added = 0
for (const p of impact.PROGRAMS) {
  const campuses = (p.schools || []).map(s => CAMPUS[s] || s)
  if (!campuses.includes('CU Boulder')) continue // Boulder focus
  const hit = byUrl.get(normUrl(p.url)) || byTitle.get(norm(p.name))
  const audience = accessToAudience(p.access)
  const fund = funded.get(norm(p.name))
  if (hit) {
    matched++
    hit.audience = [...new Set([...(hit.audience || []), ...audience])]
    hit.access = [...new Set([...(hit.access || []), ...(p.access || [])])]
    if (fund && !(hit.funding || []).length)
      hit.funding = [`$${fund.amount.toLocaleString()} (${fund.qualifier})`]
    hit.sources = [...new Set([...(hit.sources || ['crawl']), 'impact-dashboard'])]
  } else {
    added++
    resources.push({
      id: 'impact-' + norm(p.name).replace(/ /g, '-').slice(0, 60),
      url: p.url, title: p.name,
      org: normUrl(p.url).split('/')[0] || 'cu.edu',
      type: CAT_TO_TYPE[(p.categories || [])[0]] || 'program',
      description: `${p.name} — ${(p.categories || []).join(', ')} program at ${campuses.join(', ')}. ${(p.access || []).join('; ')}.`,
      audience, access: p.access || [],
      stage: [], sectors: [], contacts: [],
      funding: fund ? [`$${fund.amount.toLocaleString()} (${fund.qualifier})`] : [],
      deadlines: [], specificity: 4, depth: 0,
      sources: ['impact-dashboard'],
    })
  }
}

// ---- courses ----
const courses = impact.CLASSES.filter(c => (CAMPUS[c.campus] || c.campus) === 'CU Boulder')
  .map(c => ({
    id: 'course-' + c.code.toLowerCase().replace(/\s+/g, '-'),
    code: c.code, title: c.title, level: c.level, college: c.group,
  }))
const courseResources = courses.map(c => ({
  id: c.id, url: '', title: `${c.code}: ${c.title}`,
  org: 'CU Boulder', type: 'course',
  description: `${c.level} innovation & entrepreneurship course at CU Boulder (${c.college}).`,
  audience: [c.level === 'Graduate' ? 'grad students' : 'students'],
  access: [], stage: [], sectors: [], contacts: [],
  funding: [], deadlines: [], specificity: 3, depth: 0,
  sources: ['impact-dashboard'],
}))
const existingIds = new Set(resources.map(r => r.id))
let coursesAdded = 0
for (const cr of courseResources) if (!existingIds.has(cr.id)) { resources.push(cr); coursesAdded++ }

// ---- search vocabulary for query expansion ----
const STOP = new Set('the a an of and or in to for with intro introduction i ii iii'.split(' '))
const vocab = {}
for (const c of courses) {
  for (const w of norm(c.title).split(' ')) {
    if (w.length < 4 || STOP.has(w)) continue
    ;(vocab[w] = vocab[w] || []).push(c.code)
  }
}
const searchTerms = Object.entries(vocab).sort((a, b) => b[1].length - a[1].length)
  .map(([term, codes]) => ({ term, courses: codes.length, examples: codes.slice(0, 5) }))

// ---- write ----
writeFileSync(join(OUT_DIR, 'resources.json'), JSON.stringify(resources, null, 1))
writeFileSync(join(OUT_DIR, 'courses.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: 'https://2026-impact-production.up.railway.app/education-dashboard.html',
  scope: 'CU Boulder only',
  courses,
  searchTerms: searchTerms.slice(0, 200),
}, null, 1))

const summary = JSON.parse(readFileSync(join(OUT_DIR, 'summary.json'), 'utf8'))
summary.resourcesCatalogued = resources.length
summary.updatedAt = new Date().toISOString()
writeFileSync(join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 1))

console.log(`✓ programs: ${matched} matched, ${added} added; courses added: ${coursesAdded}`)
console.log(`✓ resources total: ${resources.length}; vocab terms: ${searchTerms.length}`)
