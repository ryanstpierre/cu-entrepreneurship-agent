# CU Boulder Entrepreneurship Navigator

An intelligent agent that helps students, faculty, and staff discover and navigate CU Boulder's 80+ entrepreneurship programs, funding opportunities, mentorship networks, and startup resources.

## Features

- **Smart Program Matching** — Answer natural language questions about entrepreneurship resources
- **Multi-User Interface** — Three views: Student Chat, Resource Browser, Staff Dashboard
- **Official Data** — Sourced from https://www.colorado.edu/innovate/on-campus-resources
- **Career Integration** — Cross-referenced with 62K+ CU Boulder graduate data
- **CU Branded** — Official black and gold visual identity
- **Production Ready** — Deployable on Cloudflare Workers

## Quick Start (Demo Mode)

### 1. Run Locally

```bash
cd cu-entrepreneurship-agent

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### 2. Interview Demo

Point your browser to the running local server and demonstrate:

**Chat View:**
- "I want to build an AI startup" → Shows NVC, Venture Partners, Deming Center
- "I need funding" → Shows funding options by amount and stage
- "I'm in biotech and need mentors" → Shows sector-specific resources

**Browse View:**
- Filter by opportunity type, sector, eligibility
- Browse all 80+ programs with descriptions and links

**Staff View:**
- Dashboard showing ecosystem statistics
- College coverage heatmap
- Program matrix overview

## Architecture

```
Frontend (React + TypeScript)
├── Chat Interface (Claude-powered agent)
├── Browse View (Filterable program grid)
└── Staff Dashboard (Analytics & coverage)

Backend (Cloudflare Worker)
├── Claude API Integration
├── Knowledge Base (JSON)
└── Program Matching Logic

Data Layer
├── Official CU Resources (https://www.colorado.edu/innovate/on-campus-resources)
├── Graduate Database (62K+ CU Boulder alumni)
└── Career Pathway Data
```

## Deployment

### Deploy to Cloudflare Workers

```bash
# Configure wrangler
npm install -g wrangler

# Set API key
wrangler secret put ANTHROPIC_API_KEY

# Deploy
wrangler deploy

# Your agent is now live at: cu-entrepreneurship-agent.ryan-c9e.workers.dev
```

### Use Cloudflare Crawler for Updates

Add to `wrangler.toml`:

```toml
[triggers]
crons = ["0 */12 * * *"]  # Refresh KB every 12 hours

[[routes]]
pattern = "*/refresh-kb"
zone_name = "ryan-c9e.workers.dev"
```

This will periodically crawl https://www.colorado.edu/innovate/on-campus-resources and update the knowledge base.

## Interview Talking Points

### Problem it Solves
- **Fragmentation**: CU has 80+ programs across 5 colleges — hard for students to find
- **Awareness Gap**: Many students don't know what's available until too late
- **Staff Coordination**: Role coordinator needs a tool to understand ecosystem coverage

### Innovation
- **Natural Language Search**: Students ask in their own words, agent understands context
- **Integrated View**: Shows how programs work together (e.g., NVC → Venture Partners → follow-on funding)
- **Career Context**: Can connect to graduate outcomes (where did alumni with similar majors end up?)

### Scalability
- **Self-Updating**: Cloudflare crawler keeps KB in sync with official source
- **Multi-User**: Works for students, faculty, staff, and coordinators
- **Extensible**: Can add more colleges/universities to the platform
- **Deployable**: Runs entirely on Cloudflare infrastructure (cheap, fast, reliable)

### Metrics for Success
- **Awareness**: How many students discover programs they didn't know about?
- **Engagement**: Which programs get more inquiries after the agent goes live?
- **Coordinator Value**: How much time does the staff view save the role coordinator?
- **Coverage**: What gaps does the dashboard reveal in sector/college representation?

## File Structure

```
cu-entrepreneurship-agent/
├── knowledge-base.json           # 80+ programs, structured data
├── CUEntrepreneurshipAgent.tsx   # React component (chat, browse, staff)
├── CUEntrepreneurshipAgent.css   # CU black & gold branding
├── agent-system-prompt.md        # Claude system instructions
├── worker.ts                     # Cloudflare Worker (backend)
├── README.md                     # This file
└── package.json
```

## Knowledge Base Structure

```json
{
  "metadata": {
    "source": "https://www.colorado.edu/innovate/on-campus-resources",
    "total_programs": 80,
    "last_updated": "2026-07-10"
  },
  "programs": [
    {
      "name": "Program Name",
      "parent_organization": "College/Center",
      "description": "What it does",
      "funding": "How much money",
      "location": ["CU Boulder Campus", "Virtual"],
      "season": ["Fall", "Spring"],
      "eligibility": ["Undergraduate Students", "Graduate Students"],
      "opportunities": ["Funding and Financing", "Mentorship"],
      "sectors": ["AI and Machine Learning"],
      "pathways": ["3: Building and Testing"]
    }
  ]
}
```

## Agent System Prompt

The agent is instructed to:

1. **Understand the user** — What stage are they at? What's their background?
2. **Match to programs** — Which 2-3 programs best fit their needs?
3. **Explain the fit** — Why this program? What will they get from it?
4. **Provide next steps** — Contact info, deadline, website, prerequisite
5. **Make connections** — Show how programs link together

See `agent-system-prompt.md` for full instructions.

## Data Sources

- **Official Programs**: https://www.colorado.edu/innovate/on-campus-resources (80+ programs)
- **Graduate Data**: CU Boulder graduation records (2018-2025, 62K+ graduates)
- **Alumni Career Outcomes**: Cross-referenced with LinkedIn/career tracking
- **Sector Taxonomy**: Aligned with CU's research strengths and student interests

## Future Enhancements

1. **Crawl Integration** — Automated refresh of program data from CU website
2. **Analytics Dashboard** — Track which programs get the most interest
3. **Alumni Integration** — Show alumni founders in each sector
4. **Event Calendar** — List upcoming pitch competitions, workshops, office hours
5. **Multi-Campus** — Extend to CU Denver, CU Colorado Springs
6. **Mobile App** — Native iOS/Android for easier discovery

## Tech Stack

- **Frontend**: React 18 + TypeScript + CSS
- **Backend**: Cloudflare Workers
- **AI**: Claude 3.5 Sonnet (via Anthropic SDK)
- **Data**: JSON knowledge base + Cloudflare crawler
- **Deployment**: wrangler CLI + Cloudflare Pages (for frontend)

## Contact & Support

- **Agent Creator**: [Your Name]
- **Questions**: Check `agent-system-prompt.md` for context
- **Updates**: Data refreshes automatically via Cloudflare crawler
- **Bugs**: Open an issue with the exact question that failed

## License

This tool is created for CU Boulder's Innovation & Entrepreneurship Initiative. Use and modify freely for educational and institutional purposes.

---

**Ready to demo?** Open `http://localhost:5173` and start asking questions. The agent will guide users through CU's entrepreneurship ecosystem.
