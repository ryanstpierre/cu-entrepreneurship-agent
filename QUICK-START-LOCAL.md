# Quick Start — Local Claude Setup

**TL;DR**: Run this to get the agent working with your local Claude instance:

```bash
cd ~/Projects/cu-entrepreneurship-agent
chmod +x test-local-claude.sh
./test-local-claude.sh
```

This will:
1. Check your llama-server is running (port 9090)
2. Test the local Claude endpoint
3. Build the TypeScript
4. Start a local Wrangler dev server

Then open a new terminal and start the React frontend:

```bash
cd ~/Projects/cu-entrepreneurship-agent
npm run dev
```

Open `http://localhost:5173` and start asking questions!

---

## What You Have

| File | Purpose |
|------|---------|
| `worker.ts` | Cloudflare Worker that routes to local/Anthropic Claude based on env |
| `knowledge-base.json` | 80+ CU programs with semantic embeddings |
| `CUEntrepreneurshipAgent.tsx` | React frontend (chat, browse, staff views) |
| `LOCAL-DEPLOYMENT.md` | Detailed deployment guide |
| `wrangler.toml` | Configuration for local vs production |
| `test-local-claude.sh` | Automated test script |

## System Architecture

```
React Frontend (localhost:5173)
    ↓ (API calls)
Wrangler Dev Server (localhost:8787)
    ↓ (routes to configured Claude)
Your Local llama-server (localhost:9090)
    ↓ (generates responses)
Knowledge Base (80+ programs with embeddings)
```

## How It Works

1. **User enters query** in React UI (chat, browse, or staff view)
2. **Frontend sends to Worker** at `http://localhost:8787/api/agent`
3. **Worker reads config** (`USE_LOCAL_CLAUDE=true`) from `wrangler.toml`
4. **Worker calls local Claude** at `http://localhost:9090/v1/chat/completions`
5. **Local Claude generates response** using knowledge base + system prompt
6. **Worker returns structured response** (response, programs, nextSteps)
7. **Frontend renders** with semantic embedding highlights

## Semantic Embeddings

The knowledge base includes intelligent categorization:

- **Query**: "I need funding"
  - **Matches**: New Venture Challenge, Get Seed Funding, Catalyze CU, Ascent Deep Tech, Lab Venture Challenge

- **Query**: "I'm in biotech"
  - **Matches**: Ascent Deep Tech, Lab Venture Challenge, Venture Partners

- **Query**: "I need legal help"
  - **Matches**: Entrepreneurial Law Clinic, Silicon Flatirons

Your local Claude uses these embeddings for better matching!

## Performance

- **Local llama-server** (Qwen2.5-Coder-7B): 5-15s per response (free, private)
- **Anthropic API** (Claude 3.5 Sonnet): 1-3s per response (costs money, cloud)

Start with local for testing/demo. Switch to production Claude when you need it.

## Troubleshooting

### "llama-server not found"
Check it's running:
```bash
ps aux | grep llama-server
```

Start it:
```bash
llama-server --model /Users/rstpierre/.cache/lm-studio/models/lmstudio-community/Qwen2.5-Coder-7B-Instruct-GGUF/Qwen2.5-Coder-7B-Instruct-Q4_K_M.gguf \
  --host 0.0.0.0 \
  --port 9090 \
  --ctx-size 4096
```

### "Build failed"
```bash
cd ~/Projects/cu-entrepreneurship-agent
npm install
npm run build
```

### "Frontend can't connect to worker"
Make sure both are running:
- Terminal 1: `wrangler dev --env local` (port 8787)
- Terminal 2: `npm run dev` (port 5173)

Check the frontend code uses correct API endpoint:
```typescript
const API_URL = 'http://localhost:8787';
```

## Next: Deploy to Production

When ready to share with your friend:

1. **Set API key**:
   ```bash
   wrangler secret put ANTHROPIC_API_KEY --env production
   ```

2. **Deploy**:
   ```bash
   wrangler deploy --env production
   ```

3. **Update frontend** to point to production:
   ```typescript
   const API_URL = 'https://cu-entrepreneurship-agent.ryan-c9e.workers.dev';
   ```

4. **Deploy frontend** to Cloudflare Pages (automatic via wrangler.toml)

5. **Share the URL**!

---

**Ready?** Run `./test-local-claude.sh` and you're live in 30 seconds.
