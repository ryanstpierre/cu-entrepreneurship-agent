// Re-fetch page text for every catalogued resource, sharded for the
// enrichment (summary + entity extraction) pass.
// Output: scripts/crawl/state/text-shards/shard-NN.json
//   [{ id, url, title, type, org, text }]  (text trimmed to ~3500 chars)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RES_FILE = join(__dirname, '..', '..', 'public', 'data', 'crawl', 'resources.json')
const OUT_DIR = join(__dirname, 'state', 'text-shards')
const UA = 'CU-Entrepreneurship-ResourceMap/1.0 (research; contact: ryan@thresholdlabs.io)'
const SHARD_SIZE = 90
const CONCURRENCY = 8

const resources = JSON.parse(readFileSync(RES_FILE, 'utf8'))
mkdirSync(OUT_DIR, { recursive: true })

const strip = h => h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<nav[\s\S]*?<\/nav>/gi, '').replace(/<footer[\s\S]*?<\/footer>/gi, '')
  .replace(/<header[\s\S]*?<\/header>/gi, '')
const toText = h => strip(h).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#039;|&#8217;/g, "'").replace(/\s+/g, ' ').trim()

let idx = 0, done = 0, failed = 0
const results = []

async function worker() {
  while (idx < resources.length) {
    const r = resources[idx++]
    try {
      const res = await fetch(r.url, {
        headers: { 'user-agent': UA, accept: 'text/html' },
        redirect: 'follow', signal: AbortSignal.timeout(15000),
      })
      const ctype = res.headers.get('content-type') || ''
      if (res.ok && ctype.includes('html')) {
        const main = (await res.text())
        // prefer main-content region when present
        const region = main.match(/<main[\s\S]*?<\/main>/i)?.[0]
          || main.match(/<article[\s\S]*?<\/article>/i)?.[0] || main
        results.push({ id: r.id, url: r.url, title: r.title, type: r.type, org: r.org, text: toText(region).slice(0, 3500) })
      } else failed++
    } catch { failed++ }
    if (++done % 200 === 0) console.log(`  … ${done}/${resources.length} (${failed} failed)`)
    await new Promise(s => setTimeout(s, 120))
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))

let shard = 0
for (let i = 0; i < results.length; i += SHARD_SIZE) {
  writeFileSync(join(OUT_DIR, `shard-${String(shard).padStart(2, '0')}.json`),
    JSON.stringify(results.slice(i, i + SHARD_SIZE)))
  shard++
}
console.log(`✓ ${results.length} pages fetched (${failed} failed) → ${shard} shards in ${OUT_DIR}`)
