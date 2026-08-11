// Merge enriched shard outputs into the published dataset:
// - public/data/crawl/enriched.json  (id -> {summary, entities})
// - fold summary into resources.json entries (r.summary)

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHARD_DIR = join(__dirname, 'state', 'enriched-shards')
const OUT_DIR = join(__dirname, '..', '..', 'public', 'data', 'crawl')

const enriched = {}
let shards = 0
for (const f of readdirSync(SHARD_DIR).filter(f => f.endsWith('.json')).sort()) {
  try {
    Object.assign(enriched, JSON.parse(readFileSync(join(SHARD_DIR, f), 'utf8')))
    shards++
  } catch (e) { console.warn(`⚠ skipping ${f}: ${e.message}`) }
}

const resPath = join(OUT_DIR, 'resources.json')
const resources = JSON.parse(readFileSync(resPath, 'utf8'))
let folded = 0
for (const r of resources) {
  const e = enriched[r.id]
  if (e?.summary) { r.summary = e.summary; folded++ }
}

writeFileSync(join(OUT_DIR, 'enriched.json'), JSON.stringify(enriched, null, 1))
writeFileSync(resPath, JSON.stringify(resources, null, 1))

const summaryPath = join(OUT_DIR, 'summary.json')
const summary = JSON.parse(readFileSync(summaryPath, 'utf8'))
summary.enrichedCount = Object.keys(enriched).length
summary.updatedAt = new Date().toISOString()
writeFileSync(summaryPath, JSON.stringify(summary, null, 1))

console.log(`✓ merged ${shards} shards: ${Object.keys(enriched).length} enriched, ${folded} summaries folded into resources.json`)
