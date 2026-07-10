#!/bin/bash

# This script completes the Pages setup
# First, build the project
npm run build

# Deploy to Pages (creates a new preview deployment)
wrangler pages deploy dist/ --project-name=cu-entrepreneurship-agent

echo "✅ Pages deployment complete!"
echo ""
echo "To set up automatic git deployment:"
echo "1. Visit: https://dash.cloudflare.com/pages"
echo "2. Click on 'cu-entrepreneurship-agent' project"
echo "3. Go to 'Settings' → 'Builds & deployments' → 'GitHub'"
echo "4. Click 'Connect GitHub' and authorize"
echo "5. Select: ryanstpierre/cu-entrepreneurship-agent"
echo "6. Configure build settings:"
echo "   - Build command: npm run build"
echo "   - Build output dir: dist"
echo "7. Add environment variables:"
echo "   - USE_LOCAL_CLAUDE: true"
echo "   - LOCAL_CLAUDE_URL: https://8ea4-174-29-96-84.ngrok-free.app/v1"
echo ""
echo "Production URL: https://cu-entrepreneurship-agent.pages.dev"
