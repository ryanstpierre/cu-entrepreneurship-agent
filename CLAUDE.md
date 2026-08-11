# CU Entrepreneurship Agent

Chat-navigable catalogue of CU-system innovation & entrepreneurship resources.
Live site: https://cu-entrepreneurship-agent.pages.dev

## Docs must stay current (hard rule)

The dataset ships with three doc surfaces that other people and LLMs build on:

- `public/data/crawl/API.md` — human/LLM guide (schemas, join keys, query cookbook)
- `public/data/crawl/schema.json` — machine-readable schema with **live enum values**
- `public/llms.txt` — LLM orientation file (counts, endpoint map, query procedure)

**Any change to the data pipeline or the JSON outputs in `public/data/crawl/`
REQUIRES regenerating and redeploying these docs in the same session:**

1. `node scripts/crawl/gen-docs.mjs` — regenerates schema.json + llms.txt from the live data
2. Hand-update API.md if fields/endpoints/semantics changed (gen-docs does not write it)
3. Deploy (see below) so `/docs`, `schema.json`, and `llms.txt` match the published data

Never let published data and published docs diverge — downstream consumers
(Julie's tooling, LLM agents reading llms.txt/schema.json) construct queries
from the docs, not the data.

## Deploy path (the ONLY one that works)

GitHub pushes do NOT trigger Cloudflare Pages builds for this project. Deploy with:

```sh
npm run build
cp public/{crawl,personas,people,docs}.html public/_headers public/llms.txt dist/
mkdir -p dist/data && cp -r public/data/crawl dist/data/
npx wrangler pages deploy dist/ --project-name=cu-entrepreneurship-agent --commit-dirty=true
```

Pages serves clean URLs (`/crawl`, not `/crawl.html`). The production alias lags
the deployment-hash URL by a few minutes of edge cache.

## Pipeline map

All in `scripts/crawl/`: crawler → dedupe → fetch-text → agent enrichment
(validate with check-shards.mjs) → merge-enrichment → entity-graph →
people-affinity → ingest-impact (Boulder-only filter) → merge-companies (golden
company-journey set) → gen-docs → eval-rag. Scope: CU Boulder only — other CU
campuses are out of scope (boulder-focus.mjs applied the one-time cut). Chat corpus:
`scripts/generate-embeddings.js` → `src/data/corpus-embeddings.json`.
