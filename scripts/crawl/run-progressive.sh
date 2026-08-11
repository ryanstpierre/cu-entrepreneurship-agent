#!/bin/bash
# Progressive deep-crawl runner: crawl a batch, commit fresh data, push
# (push triggers the Cloudflare Pages rebuild → live at /crawl.html).
# Usage: ./scripts/crawl/run-progressive.sh [num_batches] [pages_per_batch]
set -e
cd "$(dirname "$0")/../.."

BATCHES=${1:-6}
PAGES=${2:-250}

for i in $(seq 1 "$BATCHES"); do
  echo "=== batch $i/$BATCHES ($(date +%H:%M:%S)) ==="
  node scripts/crawl/crawler.mjs --pages "$PAGES"
  git add public/data/crawl/ scripts/crawl/state/
  if git diff --cached --quiet; then
    echo "no new data; frontier likely exhausted"; break
  fi
  RES=$(node -e "console.log(JSON.parse(require('fs').readFileSync('public/data/crawl/summary.json')).resourcesCatalogued)")
  DEPTH=$(node -e "console.log(JSON.parse(require('fs').readFileSync('public/data/crawl/summary.json')).maxDepthReached)")
  git commit -q -m "Crawl batch: ${RES} resources, max depth ${DEPTH}

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
  git push -q
  echo "=== pushed: ${RES} resources, depth ${DEPTH} ==="
done
echo "=== progressive crawl run complete ==="
