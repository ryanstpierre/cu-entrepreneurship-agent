// Progressive depth-aware crawler for the CU entrepreneurship ecosystem.
// Usage: node scripts/crawl/crawler.mjs [--pages N]
// Resumable: full state persists in scripts/crawl/state/crawl-state.json;
// each batch exports trimmed views to public/data/crawl/ for the Pages site.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SEEDS, ALLOW_EXTERNAL, RELEVANCE_TERMS, URL_BLOCKLIST, LIMITS } from './seeds.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STATE_DIR = join(__dirname, 'state')
const STATE_FILE = join(STATE_DIR, 'crawl-state.json')
const OUT_DIR = join(__dirname, '..', '..', 'public', 'data', 'crawl')
const UA = 'CU-Entrepreneurship-ResourceMap/1.0 (research; contact: ryan@thresholdlabs.io)'

const argPages = process.argv.indexOf('--pages')
const BATCH_PAGES = argPages > -1 ? parseInt(process.argv[argPages + 1], 10) : LIMITS.maxPagesPerBatch

// ---------- state ----------

function loadState() {
  if (existsSync(STATE_FILE)) return JSON.parse(readFileSync(STATE_FILE, 'utf8'))
  return {
    startedAt: new Date().toISOString(),
    batches: 0,
    visited: {},        // url -> { status, depth, at }
    frontier: [],       // { url, depth, parent, via, priority }
    resources: {},      // id -> resource
    edges: {},          // "from|to|kind" -> weight
    externals: {},      // host -> { count, examples: [] }
    analysisQueue: {},  // url -> { reason, relevance, depth }
    hostCounts: {},
    robots: {},         // host -> [disallow prefixes]
    sitemapsDone: [],
    recent: [],
    errors: 0,
  }
}

function saveState(s) {
  mkdirSync(STATE_DIR, { recursive: true })
  writeFileSync(STATE_FILE, JSON.stringify(s))
}

// ---------- url utilities ----------

function normalize(raw, base) {
  try {
    const u = new URL(raw, base)
    if (!/^https?:$/.test(u.protocol)) return null
    u.hash = ''
    // strip tracking params
    for (const p of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_)/.test(p)) u.searchParams.delete(p)
    }
    let s = u.toString()
    if (s.endsWith('/') && u.pathname !== '/') s = s.slice(0, -1)
    return s
  } catch { return null }
}

function hostOf(url) { try { return new URL(url).hostname } catch { return '' } }

function inScope(url) {
  const h = hostOf(url)
  if (!h) return false
  if (h.endsWith('colorado.edu')) return true
  return ALLOW_EXTERNAL.includes(h)
}

function blocked(url) {
  const low = url.toLowerCase()
  return URL_BLOCKLIST.some(b => low.includes(b))
}

function relevance(url, anchorText = '') {
  const hay = (url + ' ' + anchorText).toLowerCase()
  let score = 0
  for (const t of RELEVANCE_TERMS) if (hay.includes(t)) score += 1
  return score
}

function orgOf(url) {
  const u = new URL(url)
  const seg = u.pathname.split('/').filter(Boolean)
  if (u.hostname.endsWith('colorado.edu') && seg.length) {
    if (seg[0] === 'center' || seg[0] === 'lab' || seg[0] === 'program') {
      return `colorado.edu/${seg.slice(0, 2).join('/')}`
    }
    return `colorado.edu/${seg[0]}`
  }
  return u.hostname.replace(/^www\./, '')
}

function slug(url) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '').toLowerCase().slice(0, 80)
}

// ---------- robots ----------

async function robotsFor(state, host) {
  if (state.robots[host]) return state.robots[host]
  let dis = []
  try {
    const res = await fetch(`https://${host}/robots.txt`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(8000) })
    if (res.ok) {
      const txt = await res.text()
      let applies = false
      for (const line of txt.split('\n')) {
        const l = line.trim()
        if (/^user-agent:/i.test(l)) applies = /:\s*\*\s*$/.test(l)
        else if (applies && /^disallow:/i.test(l)) {
          const p = l.split(':')[1]?.trim()
          if (p) dis.push(p)
        }
      }
    }
  } catch { /* no robots -> allow */ }
  state.robots[host] = dis
  return dis
}

function robotsAllowed(state, url) {
  const u = new URL(url)
  const dis = state.robots[u.hostname] || []
  return !dis.some(p => u.pathname.startsWith(p))
}

// ---------- extraction ----------

const strip = h => h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
const text = h => strip(h).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#039;|&#8217;/g, "'").replace(/\s+/g, ' ').trim()

function extractLinks(html, base) {
  const out = []
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m
  while ((m = re.exec(html))) {
    const url = normalize(m[1], base)
    if (url) out.push({ url, anchor: text(m[2]).slice(0, 120) })
  }
  return out
}

const AUDIENCE = {
  'undergraduate': 'undergrads', 'graduate student': 'grad students',
  'postdoc': 'postdocs', 'faculty': 'faculty', 'staff': 'staff',
  'alumni': 'alumni', 'community': 'community', 'high school': 'high school',
  'student': 'students', 'researcher': 'researchers',
}
const STAGES = {
  'explore': 'explore', 'ideation': 'explore', 'learn': 'explore',
  'validate': 'validate', 'customer discovery': 'validate',
  'prototype': 'build', 'build': 'build', 'mvp': 'build',
  'launch': 'launch', 'scale': 'launch', 'raise': 'launch', 'invest': 'launch',
}
const SECTORS = ['ai', 'biotech', 'bioscience', 'aerospace', 'hardware', 'climate',
  'quantum', 'fintech', 'edtech', 'health', 'social enterprise', 'food', 'energy',
  'cybersecurity', 'deep tech', 'arts', 'medtech', 'space']

const TYPE_RULES = [
  ['competition', /competition|challenge|pitch|prize|demo day/i],
  ['funding', /\bfund(ing)?\b|grant|seed|award|fellowship|scholarship|sbir|sttr/i],
  ['course', /course|class|curriculum|certificate|minor\b|degree|syllabus/i],
  ['event', /event|workshop|summit|conference|meetup|series|speaker/i],
  ['space', /makerspace|prototyp|lab space|facility|equipment|workspace/i],
  ['community', /club|community|network|society|association|cohort/i],
  ['center', /center|institute|initiative|office of/i],
  ['program', /program|accelerator|incubator|bootcamp|internship/i],
  ['service', /advis|consult|clinic|mentor|support|office hours|licens/i],
]

function classify(t) {
  for (const [type, re] of TYPE_RULES) if (re.test(t)) return type
  return 'reference'
}

function extractResource(url, html, depth, via, parent) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')
    .replace(/\s*\|\s*University of Colorado Boulder.*$/i, '').trim()
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] || ''
  const body = text(html).slice(0, 20000)
  const low = body.toLowerCase()

  const contacts = [...new Set((body.match(/[\w.+-]+@colorado\.edu|[\w.+-]+@[\w-]+\.(?:org|com|edu)/g) || []).slice(0, 5))]
  const funding = [...new Set((body.match(/\$[\d,]+(?:\.\d+)?(?:\s?[KkMm](?:illion)?)?/g) || []).slice(0, 6))]
  const deadlineCtx = body.match(/(?:deadline|due|apply by|applications? (?:open|close|due))[^.]{0,80}/gi) || []
  const deadlines = [...new Set(deadlineCtx.map(s => s.trim().slice(0, 100)).slice(0, 4))]

  const audience = [...new Set(Object.entries(AUDIENCE).filter(([k]) => low.includes(k)).map(([, v]) => v))]
  const stage = [...new Set(Object.entries(STAGES).filter(([k]) => low.includes(k)).map(([, v]) => v))]
  const sectors = SECTORS.filter(s => low.includes(s))

  const hasApply = /apply now|application|register|sign up|get started|submit/i.test(body)
  const specificity = Math.min(10,
    (contacts.length ? 2 : 0) + (funding.length ? 2 : 0) + (deadlines.length ? 2 : 0) +
    (hasApply ? 2 : 0) + (audience.length ? 1 : 0) + (metaDesc ? 1 : 0))

  const rel = relevance(url, title + ' ' + metaDesc)
  const type = classify(title + ' ' + url + ' ' + metaDesc)

  // catalogue only pages that look like actual resources, not nav/news chrome
  const isResource = rel >= 1 && title && (specificity >= 2 || type !== 'reference')
  if (!isResource) return { resource: null, relevance: rel, body }

  const desc = metaDesc || body.split(/(?<=[.!?])\s+/).find(s => s.length > 60)?.slice(0, 300) || ''
  return {
    resource: {
      id: slug(url), url, title: title.slice(0, 140), org: orgOf(url), type,
      description: desc, audience, stage, sectors, contacts, funding, deadlines,
      specificity, depth, discoveredVia: via, parent,
      fetchedAt: new Date().toISOString(),
      needsAnalysis: rel >= 3 && specificity < 4,
    },
    relevance: rel, body,
  }
}

// ---------- sitemaps ----------

async function ingestSitemaps(state) {
  const roots = [...new Set(SEEDS.map(s => { const u = new URL(s); return u.origin + '/' + (u.pathname.split('/').filter(Boolean)[0] || '') }))]
  for (const root of roots) {
    const smUrl = root.replace(/\/$/, '') + '/sitemap.xml'
    if (state.sitemapsDone.includes(smUrl)) continue
    state.sitemapsDone.push(smUrl)
    try {
      const res = await fetch(smUrl, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10000) })
      if (!res.ok) continue
      const xml = await res.text()
      const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
      const scored = locs.filter(u => inScope(u) && !blocked(u))
        .map(u => ({ u, r: relevance(u) })).sort((a, b) => b.r - a.r)
        .slice(0, LIMITS.maxSitemapUrls)
      let added = 0
      for (const { u, r } of scored) {
        const n = normalize(u)
        if (n && !state.visited[n] && !state.frontier.some(f => f.url === n)) {
          state.frontier.push({ url: n, depth: 1, parent: smUrl, via: 'sitemap', priority: r })
          added++
        }
      }
      console.log(`[sitemap] ${smUrl}: +${added} urls (of ${locs.length})`)
    } catch { /* many subsites have no sitemap */ }
  }
}

// ---------- crawl loop ----------

async function crawl() {
  const state = loadState()
  mkdirSync(OUT_DIR, { recursive: true })

  if (state.batches === 0) {
    for (const s of SEEDS) {
      const n = normalize(s)
      if (n) state.frontier.push({ url: n, depth: 0, parent: null, via: 'seed', priority: 100 })
    }
    await ingestSitemaps(state)
  }

  let fetched = 0
  const inFlight = new Set()

  async function worker(wid) {
    while (fetched < BATCH_PAGES) {
      // priority order: relevance first, shallow depth as tiebreak
      state.frontier.sort((a, b) => b.priority - a.priority || a.depth - b.depth)
      const item = state.frontier.find(f => !inFlight.has(f.url))
      if (!item) return
      state.frontier.splice(state.frontier.indexOf(item), 1)
      const { url, depth, via, parent } = item
      if (state.visited[url] || !inScope(url) || blocked(url) || depth > LIMITS.maxDepth) continue
      const host = hostOf(url)
      if ((state.hostCounts[host] || 0) >= LIMITS.maxPagesPerHost) continue
      await robotsFor(state, host)
      if (!robotsAllowed(state, url)) { state.visited[url] = { status: 'robots', depth }; continue }

      inFlight.add(url)
      fetched++
      try {
        const res = await fetch(url, {
          headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' },
          redirect: 'follow', signal: AbortSignal.timeout(LIMITS.fetchTimeoutMs),
        })
        state.hostCounts[host] = (state.hostCounts[host] || 0) + 1
        const ctype = res.headers.get('content-type') || ''
        if (!res.ok) {
          state.visited[url] = { status: res.status, depth }
        } else if (ctype.includes('pdf')) {
          state.visited[url] = { status: 'pdf', depth }
          state.analysisQueue[url] = { reason: 'pdf-needs-extraction', relevance: relevance(url), depth }
        } else if (!ctype.includes('html')) {
          state.visited[url] = { status: 'skip-' + ctype.split(';')[0], depth }
        } else {
          const html = await res.text()
          const { resource, relevance: rel, body } = extractResource(url, html, depth, via, parent)
          state.visited[url] = { status: 200, depth, at: new Date().toISOString() }

          if (resource) {
            const isNew = !state.resources[resource.id]
            state.resources[resource.id] = resource
            if (resource.needsAnalysis) {
              state.analysisQueue[url] = { reason: 'high-relevance-low-extraction', relevance: rel, depth }
            }
            if (isNew) {
              state.recent.unshift({ id: resource.id, title: resource.title, type: resource.type, org: resource.org, depth, specificity: resource.specificity, at: resource.fetchedAt })
              state.recent = state.recent.slice(0, 60)
              console.log(`[+${wid}] d${depth} s${resource.specificity} ${resource.type.padEnd(11)} ${resource.title.slice(0, 60)}`)
            }
          }

          // relationship edges: this page's org/resource → mentioned resources
          if (resource && body) {
            const lowBody = body.toLowerCase()
            for (const r of Object.values(state.resources)) {
              if (r.id !== resource.id && r.title.length > 8 && lowBody.includes(r.title.toLowerCase())) {
                const k = `${resource.id}|${r.id}|mentions`
                state.edges[k] = (state.edges[k] || 0) + 1
              }
            }
          }

          // frontier expansion + external discovery
          for (const { url: link, anchor } of extractLinks(html, url)) {
            if (blocked(link)) continue
            if (!inScope(link)) {
              const h = hostOf(link)
              if (h && !h.endsWith('colorado.edu') && relevance(link, anchor) >= 1) {
                const e = state.externals[h] || { count: 0, examples: [] }
                e.count++
                if (e.examples.length < 3 && !e.examples.includes(link)) e.examples.push(link)
                state.externals[h] = e
              }
              continue
            }
            if (state.visited[link] || state.frontier.length > 20000) continue
            if (state.frontier.some(f => f.url === link)) continue
            const r = relevance(link, anchor)
            if (r === 0 && depth >= 2) continue // stay focused when deep
            state.frontier.push({ url: link, depth: depth + 1, parent: url, via: 'link', priority: r * 2 - depth * 0.5 })
            if (resource) {
              const targetId = slug(link)
              if (state.resources[targetId]) {
                const k = `${resource.id}|${targetId}|links_to`
                state.edges[k] = (state.edges[k] || 0) + 1
              }
            }
          }
        }
      } catch (e) {
        state.errors++
        state.visited[url] = { status: 'error:' + (e.name || 'unknown'), depth }
      } finally {
        inFlight.delete(url)
      }
      await new Promise(r => setTimeout(r, LIMITS.politeDelayMs))
    }
  }

  await Promise.all(Array.from({ length: LIMITS.concurrency }, (_, i) => worker(i)))
  state.batches++
  saveState(state)
  exportViews(state)
  const nRes = Object.keys(state.resources).length
  console.log(`\nBatch ${state.batches} done: fetched ${fetched}, resources ${nRes}, frontier ${state.frontier.length}, errors ${state.errors}`)
}

// ---------- export ----------

function exportViews(state) {
  const resources = Object.values(state.resources).sort((a, b) => b.specificity - a.specificity)
  const visited = Object.values(state.visited)

  const depthHistogram = {}
  for (const v of visited) {
    const d = v.depth ?? 0
    depthHistogram[d] = depthHistogram[d] || { fetched: 0, discovered: 0, pending: 0 }
    depthHistogram[d].fetched++
    depthHistogram[d].discovered++
  }
  for (const f of state.frontier) {
    const d = f.depth
    depthHistogram[d] = depthHistogram[d] || { fetched: 0, discovered: 0, pending: 0 }
    depthHistogram[d].pending++
    depthHistogram[d].discovered++
  }
  const saturation = Object.fromEntries(Object.entries(depthHistogram)
    .map(([d, h]) => [d, +(h.fetched / Math.max(1, h.discovered)).toFixed(3)]))

  const perOrgDepth = {}
  for (const r of resources) {
    perOrgDepth[r.org] = Math.max(perOrgDepth[r.org] || 0, r.depth)
  }

  const summary = {
    updatedAt: new Date().toISOString(),
    startedAt: state.startedAt,
    batches: state.batches,
    pagesFetched: visited.length,
    resourcesCatalogued: resources.length,
    relationshipEdges: Object.keys(state.edges).length,
    frontierSize: state.frontier.length,
    analysisQueueSize: Object.keys(state.analysisQueue).length,
    externalDomainsFound: Object.keys(state.externals).length,
    errors: state.errors,
    maxDepthReached: Math.max(0, ...visited.map(v => v.depth ?? 0)),
    depthHistogram, saturation, perOrgDepth,
    byType: resources.reduce((a, r) => (a[r.type] = (a[r.type] || 0) + 1, a), {}),
    byOrg: resources.reduce((a, r) => (a[r.org] = (a[r.org] || 0) + 1, a), {}),
  }

  const edges = Object.entries(state.edges).map(([k, weight]) => {
    const [from, to, kind] = k.split('|')
    return { from, to, kind, weight }
  }).sort((a, b) => b.weight - a.weight)

  const discovery = Object.entries(state.externals)
    .map(([host, e]) => ({ host, ...e }))
    .sort((a, b) => b.count - a.count).slice(0, 100)

  const analysis = Object.entries(state.analysisQueue)
    .map(([url, q]) => ({ url, ...q }))
    .sort((a, b) => b.relevance - a.relevance)

  writeFileSync(join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 1))
  writeFileSync(join(OUT_DIR, 'resources.json'), JSON.stringify(resources, null, 1))
  writeFileSync(join(OUT_DIR, 'relationships.json'), JSON.stringify(edges, null, 1))
  writeFileSync(join(OUT_DIR, 'discovery-queue.json'), JSON.stringify(discovery, null, 1))
  writeFileSync(join(OUT_DIR, 'analysis-queue.json'), JSON.stringify(analysis, null, 1))
  writeFileSync(join(OUT_DIR, 'recent.json'), JSON.stringify(state.recent, null, 1))
}

crawl().catch(e => { console.error(e); process.exit(1) })
