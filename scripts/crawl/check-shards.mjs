// Validate enriched shards: flag shards whose "summaries" are verbatim
// prefixes of the source text (an extraction agent that scripted its way out
// instead of summarizing) or that miss ids.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEXT_DIR = join(__dirname, 'state', 'text-shards')
const ENR_DIR = join(__dirname, 'state', 'enriched-shards')

const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

for (const f of readdirSync(TEXT_DIR).filter(f => f.endsWith('.jsonl')).sort()) {
  const name = f.replace('.jsonl', '.json')
  const enrPath = join(ENR_DIR, name)
  if (!existsSync(enrPath)) { console.log(`${name}: MISSING`); continue }
  const inputs = readFileSync(join(TEXT_DIR, f), 'utf8').trim().split('\n').map(l => JSON.parse(l))
  let enriched
  try { enriched = JSON.parse(readFileSync(enrPath, 'utf8')) } catch { console.log(`${name}: PARSE-ERROR`); continue }

  let verbatim = 0, missing = 0, empty = 0
  for (const inp of inputs) {
    const e = enriched[inp.id]
    if (!e || !e.summary) { missing++; continue }
    if (e.summary.length < 15) empty++
    const s = norm(e.summary).slice(0, 60)
    if (s && norm(inp.text).startsWith(s)) verbatim++
  }
  const bad = verbatim / inputs.length > 0.3 || missing / inputs.length > 0.2
  console.log(`${name}: ${inputs.length} in, ${Object.keys(enriched).length} out, ${verbatim} verbatim, ${missing} missing, ${empty} thin ${bad ? '→ REDO' : '✓'}`)
}
