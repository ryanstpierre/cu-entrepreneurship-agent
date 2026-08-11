// Tag university people (faculty/staff/mentors) with program/resource affinity.
// Base: person entities from entity-graph.json (extracted from page text).
// For each person: split name/role from the surface form, classify their
// university role, and score affinity to orgs + resource types + specific
// programs from the resources they appear on (weighted by resource specificity).
// Output: public/data/crawl/people.json

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', '..', 'public', 'data', 'crawl')

const graph = JSON.parse(readFileSync(join(OUT_DIR, 'entity-graph.json'), 'utf8'))
const resources = JSON.parse(readFileSync(join(OUT_DIR, 'resources.json'), 'utf8'))
const byId = Object.fromEntries(resources.map(r => [r.id, r]))

// surface forms often carry the role: "Jane Doe, Director of X" / "Dr. Jane Doe (Faculty Director)"
function splitNameRole(s) {
  let m = s.match(/^(.{3,60}?),\s+(.{3,70})$/) || s.match(/^(.{3,60}?)\s*\((.{3,70})\)$/)
  if (m) return { name: m[1].trim(), role: m[2].trim() }
  m = s.match(/^(.{3,70}?)\s+(Jane|John)?\b/) // no-op fallback shape
  return { name: s.trim(), role: '' }
}

const ROLE_CLASS = [
  [/professor|faculty|instructor|lecturer|dean|chair|phd|dr\.|researcher|scientist/i, 'faculty'],
  [/director|manager|coordinator|advisor|officer|administrator|dean of|staff|specialist|associate vice|provost|chancellor/i, 'staff'],
  [/mentor|entrepreneur.in.residence|eir|investor|venture partner|advisor/i, 'mentor'],
  [/founder|ceo|cto|co-founder|alumnus|alumna|alum/i, 'founder-alum'],
  [/student/i, 'student'],
]
function classifyRole(role, name) {
  const s = role + ' ' + name
  for (const [re, cls] of ROLE_CLASS) if (re.test(s)) return cls
  return 'unknown'
}

// context pass: page text around a person's name often names their title even
// when the extracted entity string doesn't ("..., PhD, associate professor of...")
const TEXT_DIR = join(__dirname, 'state', 'text-shards')
const textByResource = {}
for (const f of readdirSync(TEXT_DIR).filter(f => f.endsWith('.jsonl'))) {
  for (const line of readFileSync(join(TEXT_DIR, f), 'utf8').trim().split('\n')) {
    try { const it = JSON.parse(line); textByResource[it.id] = it.text } catch {}
  }
}
function classifyFromContext(name, resourceIds) {
  for (const rid of resourceIds) {
    const t = textByResource[rid]
    if (!t) continue
    const i = t.indexOf(name)
    if (i < 0) continue
    const ctx = t.slice(Math.max(0, i - 40), i + name.length + 120)
    for (const [re, cls] of ROLE_CLASS) {
      const m = ctx.match(re)
      if (m) return { cls, hint: m[0].toLowerCase() }
    }
  }
  return null
}

const people = []
for (const e of graph.entities) {
  if (e.type !== 'person') continue
  const { name, role } = splitNameRole(e.name)
  if (name.split(' ').length < 2 || name.split(' ').length > 5) continue // require plausible full name
  const res = (e.resources || []).map(id => byId[id]).filter(Boolean)
  if (!res.length) continue

  // affinity scores: weight each appearance by resource specificity
  const orgs = {}, types = {}
  const programs = []
  for (const r of res) {
    const w = 1 + (r.specificity || 0) / 10
    orgs[r.org] = (orgs[r.org] || 0) + w
    types[r.type] = (types[r.type] || 0) + w
    if (['program', 'center', 'competition', 'funding'].includes(r.type))
      programs.push({ id: r.id, title: r.title.split('|')[0].trim(), weight: +w.toFixed(2) })
  }
  const top = obj => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([k, v]) => ({ name: k, score: +v.toFixed(2) }))

  let roleClass = classifyRole(role, e.name)
  let roleHint = ''
  if (roleClass === 'unknown') {
    const c = classifyFromContext(name, e.resources || [])
    if (c) { roleClass = c.cls; roleHint = c.hint }
  }
  people.push({
    name, role: role || roleHint, roleClass,
    mentions: e.count,
    resourceCount: res.length,
    affinity: {
      orgs: top(orgs),
      types: top(types),
      programs: programs.sort((a, b) => b.weight - a.weight).slice(0, 8),
    },
    resources: res.slice(0, 10).map(r => ({ id: r.id, title: r.title.split('|')[0].trim(), url: r.url })),
  })
}

people.sort((a, b) => b.resourceCount - a.resourceCount || b.mentions - a.mentions)

const byClass = people.reduce((a, p) => (a[p.roleClass] = (a[p.roleClass] || 0) + 1, a), {})
writeFileSync(join(OUT_DIR, 'people.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  stats: { people: people.length, byRoleClass: byClass },
  people,
}, null, 1))
console.log(`✓ people: ${people.length}`, JSON.stringify(byClass))
console.log('top:', people.slice(0, 8).map(p => `${p.name} [${p.roleClass}] ×${p.resourceCount}`).join(' | '))
