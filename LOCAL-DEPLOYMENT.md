# Running CU Entrepreneurship Agent with Local Claude

This guide shows how to run the agent with your local llama-server instance instead of the Anthropic API.

## Prerequisites

You need llama-server running locally. Check:

```bash
ps aux | grep llama-server
# Should show: /opt/homebrew/bin/llama-server --model ... --port 9090
```

If not running, start it:

```bash
llama-server --model /path/to/your/model \
  --host 0.0.0.0 \
  --port 9090 \
  --ctx-size 4096
```

## Option 1: Local Wrangler Dev Server

Deploy the worker locally and test against your local Claude:

```bash
cd ~/Projects/cu-entrepreneurship-agent

# Build TypeScript
npm run build

# Start local Wrangler dev server (uses --env local)
wrangler dev --env local
```

This will:
1. Start a local Cloudflare Worker environment on `http://localhost:8787`
2. Route requests to your local llama-server on port 9090
3. No Anthropic API needed

**Test it:**

```bash
curl -X POST http://localhost:8787/api/agent \
  -H "Content-Type: application/json" \
  -d '{"query": "I want to build an AI startup", "userType": "student"}'
```

Expected response from your local Claude:
```json
{
  "response": "Great! Here are the programs...",
  "programs": ["deming-center", "new-venture-challenge", ...],
  "nextSteps": [...]
}
```

## Option 2: Deploy to Cloudflare (Local Claude Mode)

Deploy to production but configure to use local Claude (useful for testing):

```bash
cd ~/Projects/cu-entrepreneurship-agent

# Deploy with local environment
wrangler deploy --env local

# Your URL: https://cu-entrepreneurship-agent.ryan-c9e.workers.dev (env: local)
```

This allows you to test the deployed version against local Claude.

## Option 3: Full Production (Anthropic API)

Deploy to production with Anthropic API:

```bash
cd ~/Projects/cu-entrepreneurship-agent

# Set your Anthropic API key
wrangler secret put ANTHROPIC_API_KEY --env production

# Deploy with production environment
wrangler deploy --env production
```

## Configuration

The `wrangler.toml` controls the environment:

```toml
[env.local]
vars = { USE_LOCAL_CLAUDE = "true", LOCAL_CLAUDE_URL = "http://localhost:9090/v1" }

[env.production]
vars = { USE_LOCAL_CLAUDE = "false" }
```

## Switching Between Modes

**To use local Claude:**
```bash
wrangler dev --env local
# or
wrangler deploy --env local
```

**To use Anthropic API:**
```bash
wrangler dev --env production
# or
wrangler deploy --env production
```

## Frontend Setup

The React frontend calls the backend API. No changes needed — it automatically uses whatever backend you deploy.

### Local Frontend + Local Backend

```bash
cd ~/Projects/cu-entrepreneurship-agent

# Terminal 1: Start the backend (Wrangler)
wrangler dev --env local
# Runs on http://localhost:8787

# Terminal 2: Start the frontend (Vite)
npm run dev
# Runs on http://localhost:5173
```

Open `http://localhost:5173` and test the chat/browse/staff views.

### Local Frontend + Deployed Backend

```bash
# Update CUEntrepreneurshipAgent.tsx to point to deployed worker
# Change: const API_URL = 'http://localhost:8787'
# To: const API_URL = 'https://cu-entrepreneurship-agent.ryan-c9e.workers.dev'

npm run dev
```

## Testing Semantic Embeddings

The knowledge base includes semantic embeddings for better program matching. Test queries:

```bash
# Funding-focused
"I need funding for my startup"
→ Should match: New Venture Challenge, Get Seed Funding, Catalyze CU

# Biotech-focused
"I'm in biotech and need mentors"
→ Should match: Ascent Deep Tech, Venture Partners, Lab Venture Challenge

# Deep tech-focused
"I want to build deep tech"
→ Should match: Ascent Deep Tech, Embark Deep Tech, Venture Partners

# Legal help
"I need legal support for my startup"
→ Should match: Entrepreneurial Law Clinic, Silicon Flatirons
```

## Debugging

### Check Local Claude Connection

```bash
curl -X POST http://localhost:9090/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

Should return a response from your local model.

### Check Worker Logs

```bash
# Local dev server logs
wrangler dev --env local

# Production logs
wrangler tail --env local
```

## Performance Notes

- **Local llama-server (Qwen2.5-Coder-7B)**: ~5-15 sec per response
- **Anthropic API (Claude 3.5 Sonnet)**: ~1-3 sec per response
- Local is slower but free and private. Good for testing/demo.

## Next Steps

Once you're happy with local testing:
1. Set ANTHROPIC_API_KEY via `wrangler secret put`
2. Deploy to production: `wrangler deploy --env production`
3. Update frontend to point to production API
4. Share `https://cu-entrepreneurship-agent.ryan-c9e.workers.dev` with your friend

---

**Questions?** Check `worker.ts` for the API routing logic, or test the endpoint directly with `curl`.
