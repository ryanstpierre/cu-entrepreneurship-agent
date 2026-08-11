# CU Entrepreneurship Crawl — Catalogue Schema

All crawl output lives in `public/data/crawl/` and is served on the Pages site.
The crawler (`scripts/crawl/crawler.mjs`) maintains full state in
`scripts/crawl/state/crawl-state.json` and exports trimmed views per batch.

## Files exported per batch

| File | Purpose |
|------|---------|
| `summary.json` | Top-line metrics + depth analysis (dashboard header) |
| `resources.json` | Catalogued resources (the actual entity list) |
| `relationships.json` | Edges between resources |
| `analysis-queue.json` | Pages/domains queued for deeper analysis |
| `discovery-queue.json` | External domains found via open-ended discovery |
| `recent.json` | Rolling feed of the last ~50 finds (live ticker) |

## Resource

```jsonc
{
  "id": "colorado-edu-nvc",            // slug of canonical URL
  "url": "https://www.colorado.edu/nvc/",
  "title": "New Venture Challenge",
  "org": "colorado.edu/nvc",            // subsite / owning org key
  "type": "competition",                // program | center | funding | competition |
                                        // course | event | space | community | service | reference
  "description": "…",                   // meta description or first meaningful paragraph
  "audience": ["students","faculty"],   // detected eligibility signals
  "stage": ["explore","build","launch"],// pathway-stage signals
  "sectors": ["deep tech"],             // sector keywords found
  "contacts": ["nvc@colorado.edu"],
  "funding": ["$325,000"],              // dollar amounts detected
  "deadlines": ["April 12"],            // date-like strings near deadline language
  "specificity": 7,                     // 0–10: actionability score (contacts + dollars +
                                        // dates + apply-links + eligibility language)
  "depth": 2,                           // link-depth from seed at first discovery
  "discoveredVia": "link|sitemap|seed",
  "parent": "https://…",                // page that linked to it
  "fetchedAt": "2026-08-11T…",
  "needsAnalysis": false                // true → also present in analysis-queue
}
```

## Relationship edge

```jsonc
{ "from": "colorado-edu-nvc", "to": "colorado-edu-demingcenter",
  "kind": "links_to | mentions | same_org", "weight": 3 }
```

## Depth metrics (in summary.json)

- `depthHistogram`: per depth → { discovered, fetched, pending }
- `maxDepthReached`, `frontierSize`, `saturation`: fetched/discovered per depth —
  the "are we actually deep or just wide?" metric. A depth is *saturated* when
  pending ≈ 0; the crawl is superficial if saturation collapses after depth 1–2.
- `perOrgDepth`: max depth reached inside each subsite/org — flags subsites that
  were only skimmed.

## Queues

- **analysis-queue**: high-relevance pages the heuristic extractor couldn't
  confidently catalogue (PDFs, event calendars, ambiguous pages). Each entry:
  `{ url, reason, relevance, depth }`. Consumed by a later LLM pass.
- **discovery-queue**: external domains seen from crawled pages, ranked by
  citation count. Promoting a domain into `ALLOW_EXTERNAL` (seeds.mjs) admits it
  into the next crawl round — this is the open-ended widening loop.
