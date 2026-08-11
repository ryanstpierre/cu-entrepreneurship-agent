# CU Entrepreneurship Ecosystem — Data API

A read-only JSON API over a deep crawl of the CU Boulder (+ Colorado)
entrepreneurship ecosystem: 4,767 pages crawled to link-depth 8 across
colorado.edu subsites and 9 promoted external ecosystem domains, distilled to
~1,800 unique resources with typed relationships.

**Base URL:** `https://cu-entrepreneurship-agent.pages.dev/data/crawl/`

All endpoints are static JSON, CORS-enabled (`Access-Control-Allow-Origin: *`),
cached ~5 min. No auth, no rate limits beyond politeness. Live dashboard over
the same data: https://cu-entrepreneurship-agent.pages.dev/crawl

## Endpoints

| Endpoint | What it is |
|---|---|
| `summary.json` | Totals, depth histogram + saturation, per-org depth, type/org breakdowns |
| `resources.json` | The catalogue — every resource, sorted by specificity (desc) |
| `relationships.json` | Typed edges between resources, weight-sorted |
| `enriched.json` | LLM-generated summaries + extracted entities per resource |
| `analysis-queue.json` | Pages flagged for deeper extraction (incl. PDFs), relevance-sorted |
| `discovery-queue.json` | External domains cited by the ecosystem, citation-count-sorted |
| `recent.json` | Last ~60 catalogued finds (feed) |

## Resource object (`resources.json`)

```jsonc
{
  "id": "colorado-edu-nvc",              // stable slug — join key across all files
  "url": "https://www.colorado.edu/nvc",
  "title": "New Venture Challenge",
  "org": "colorado.edu/nvc",             // owning subsite/org
  "type": "competition",                 // program|center|funding|competition|course|
                                         // event|space|community|service|reference
  "description": "…",
  "audience": ["students", "faculty"],   // detected eligibility
  "stage": ["explore", "build"],         // explore|validate|build|launch
  "sectors": ["deep tech"],
  "contacts": ["nvc@colorado.edu"],
  "funding": ["$325,000"],               // dollar amounts found on page
  "deadlines": ["Applications due …"],   // deadline snippets with context
  "specificity": 8,                      // 0–10 actionability (contacts+dollars+
                                         // deadlines+apply-links+eligibility)
  "depth": 1,                            // link-depth at discovery
  "discoveredVia": "seed|sitemap|link",
  "parent": "https://…",                 // page that linked here
  "alsoSeenOn": ["colorado.edu/business"], // orgs where duplicate copies were collapsed
  "needsAnalysis": false
}
```

## Relationship edge (`relationships.json`)

```jsonc
{ "from": "colorado-edu-nvc", "to": "colorado-edu-business-deming",
  "kind": "links_to" /* or "mentions" */, "weight": 4 }
```

`from`/`to` are resource `id`s. Weight = number of times observed.

## Enrichment (`enriched.json`)

Keyed by resource `id`:

```jsonc
{ "colorado-edu-nvc": {
    "summary": "Two-sentence plain-language summary of what it offers and for whom.",
    "entities": {
      "people": ["Jane Doe (director)"],
      "orgs": ["Deming Center"],
      "programs": ["Women Founders Competition"],
      "amounts": ["$325,000 total prizes"],
      "dates": ["finals in April"],
      "eligibility": ["all CU Boulder students"]
    }
} }
```

## Recipes

Fetch + filter (works in browser or Node 18+):

```js
const BASE = 'https://cu-entrepreneurship-agent.pages.dev/data/crawl/'
const resources = await (await fetch(BASE + 'resources.json')).json()

// Actionable funding for students
const funding = resources.filter(r =>
  ['funding', 'competition'].includes(r.type) &&
  r.audience.includes('students') && r.specificity >= 6)

// Build an adjacency map for pathfinding ("what's next after NVC?")
const edges = await (await fetch(BASE + 'relationships.json')).json()
const next = Object.groupBy(edges, e => e.from)
```

RAG over the catalogue: embed each resource's `title + description + funding +
deadlines` (the dataset is small enough to embed in one pass with any
sentence-transformer), retrieve top-k, and hand the matching resource objects —
URLs, contacts, deadlines included — to your model as grounding context.

Depth-audit your own crawls against `summary.json`: `saturation[d]` is
fetched/discovered at each depth — if it collapses after depth 2, the crawl was
superficial. This crawl holds 1.0 at every depth through 8.

## Provenance & freshness

Crawled 2026-08-11 with a politeness-limited crawler (robots.txt honored,
~4 req/s). `summary.json.updatedAt` stamps every regeneration. Source of truth
is the crawler in the repo: `scripts/crawl/` (github.com/ryanstpierre/cu-entrepreneurship-agent).
