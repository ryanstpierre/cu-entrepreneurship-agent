# CU Entrepreneurship Navigator — Interview Demo Guide

## What This Is

A prototype AI agent that helps students, faculty, and staff navigate CU Boulder's 80+ entrepreneurship programs. Built for the interview to demonstrate strategic thinking about your role.

## How to Use for Your Interview

### 1. Quick Start (5 minutes)

**Option A: HTML Demo (No Setup)**
```bash
# Just open the file in your browser
open /Users/rstpierre/Projects/cu-entrepreneurship-agent/demo.html
```

No npm, no build tools. Works immediately. Click through chat, browse, and staff views.

**Option B: Full React App (15 minutes)**
```bash
cd /Users/rstpierre/Projects/cu-entrepreneurship-agent
npm install
npm run dev
# Opens http://localhost:5173
```

### 2. Demo Flow (10 minutes)

**Segment 1: Student View (3 min)**
- Show the chat interface
- Ask: "I want to build an AI startup. What programs can help?"
- Point out: NVC, Venture Partners, Deming Center recommendations
- Explain: How the agent understands stage and sector

**Segment 2: Browse View (3 min)**
- Filter by sector (AI/ML, Biotech, etc.)
- Show 80+ programs catalog
- Explain: How this helps undiscovered resources surface

**Segment 3: Coordinator View (3 min)**
- Show the dashboard (80+ programs, $325K+ funding, 20+ sectors)
- Show coverage heatmap (which colleges are engaged?)
- Explain: How the role uses this to identify gaps and coordinate

**Segment 4: Strategic Points (1 min)**
- This scales to any user type (student, faculty, staff, community)
- Self-updating via Cloudflare crawler
- Integrates with career outcomes (CU's 62K+ graduate database)

## Interview Talking Points

### Problem You're Solving

> "CU has an incredible entrepreneurship ecosystem — but it's fragmented across 80+ programs in 5 colleges. Students don't know what's available. Staff spend time answering the same questions. There's no unified view of our coverage."

### Your Solution

> "This agent is both an internal coordination tool and a public-facing discovery platform. It understands context (what stage is the founder at? what sector? what resources are available?), connects programs that work together, and gives coordinators visibility into where we have gaps."

### Why It Matters for the Role

1. **Awareness** — Students find programs they'd otherwise miss
2. **Coordination** — You see which programs complement each other
3. **Coverage** — The dashboard shows gaps by college/sector
4. **Scalability** — Works for undergrads, grads, faculty, postdocs, staff
5. **Data-Driven** — Official source (colorado.edu), auto-updated, integrated with career outcomes

### Key Stats to Mention

- **80+ programs** across 5 colleges
- **$325K+** annual prize money (NVC alone)
- **20+ sectors** covered (AI/ML, Biotech, Hardware, Fintech, Climate, etc.)
- **62K+ alumni** in database (career outcome integration)
- **Fully deployable** on Cloudflare infrastructure (cheap, fast, reliable)

## File Structure

```
cu-entrepreneurship-agent/
├── demo.html                           # Standalone demo (open in browser)
├── knowledge-base.json                 # All 80+ programs
├── CUEntrepreneurshipAgent.tsx        # React component
├── CUEntrepreneurshipAgent.css        # CU black & gold branding
├── agent-system-prompt.md             # Claude instructions
├── worker.ts                          # Cloudflare Workers backend
├── README.md                          # Full documentation
├── INTERVIEW-DEMO.md                  # This file
└── package.json

Source data: https://www.colorado.edu/innovate/on-campus-resources
```

## Technical Highlights (If Asked)

**Architecture:**
- Frontend: React + TypeScript (mobile-responsive, CU branded)
- Backend: Cloudflare Workers (serverless, $5/month baseline)
- Agent: Claude 3.5 Sonnet (via Anthropic API)
- Data: JSON knowledge base + official CU crawl service

**Deployment:**
- Frontend: Cloudflare Pages
- Backend: Cloudflare Workers
- Knowledge Base: Auto-refresh via crawler (every 12 hours)
- Cost: ~$50/month at scale (student-heavy usage)

**Scalability:**
- Currently tuned for CU Boulder (80+ programs)
- Framework extends to other colleges/universities
- Multi-institution version: coordinate across CU system (Denver, Colorado Springs, etc.)

## What You Learned Building This

1. **Ecosystem Mapping** — How to understand and structure a fragmented system
2. **User Research** — Different interfaces for different roles (student vs. coordinator)
3. **Data Strategy** — Keep knowledge base current (crawler, official sources)
4. **Tool Evaluation** — Why Claude works for this (context understanding, natural language, extensible)
5. **Deployment** — How to ship quickly on modern infrastructure

## Questions You Might Get

**Q: How would you measure success?**
> Metrics: student discovery rate (% who learn about new programs), staff time saved (reduction in FAQ emails), and program engagement lift (do programs get more inquiries after launch).

**Q: What about privacy?**
> The agent learns from CU's public resources page and your graduate database (anonymized). No student data stored in the agent. Uses Claude API (Anthropic's standard terms).

**Q: How would you roll this out?**
> Phase 1: Soft launch to Deming Center (test with power users). Phase 2: Promote at orientation + events. Phase 3: Staff integration (coordinators use the dashboard). Phase 4: Expand to other colleges.

**Q: What's the competitive advantage?**
> Most universities don't have a unified entrepreneurship view. This changes the student experience from "where do I even start?" to "here are your best 3 options."

## The Bigger Vision

This is a proof-of-concept for a larger role:

> "Your job is to make CU Boulder the go-to entrepreneurship destination. That means not just running programs, but creating visibility, connecting them intelligently, and removing friction. This agent does that. It's a tool for the role itself — coordination, strategic planning, student outcomes."

---

**Ready?** Open `demo.html` in your browser and start asking questions. The demo includes canned responses for AI, biotech, funding, and mentorship—but the real version uses Claude to understand any query.

Good luck with the interview! 🚀
