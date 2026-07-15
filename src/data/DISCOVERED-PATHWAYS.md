# CU Entrepreneurship Program Pathways
## Entity Relationships & Discovery Guide

### Discovered Relationship #1: Venture Partners as Ecosystem Hub
**Weight**: Critical | **Edges**: 11 (6 contains + 5 complements)

Venture Partners at CU Boulder is not a single program but an umbrella organization coordinating research commercialization. Six specialized sub-programs work in concert:

```
VENTURE PARTNERS ECOSYSTEM
│
├─ ASCENT DEEP TECH ACCELERATOR
│  └─ Spring cohort-based acceleration for research teams
│  └─ Stages: Building & Testing → Launching & Growing
│  └─ Focus: Hardware, AI/ML, Aerospace, Biotech
│
├─ LAB VENTURE CHALLENGE
│  └─ Faculty/researcher pitch competition
│  └─ Stage: Conceiving & Exploring → Building & Testing
│  └─ Focus: Research commercialization
│
├─ EMBARK DEEP TECH
│  └─ IP-to-founder matching service
│  └─ Stage: Conceiving & Exploring → Building & Testing
│  └─ Unique: Matches university IP with entrepreneurs
│
├─ CENTER FOR TRANSLATIONAL RESEARCH
│  └─ Gateway to research commercialization
│  └─ Identifies which research is commercially viable
│  └─ Stage: Early identification
│
├─ NSF I-CORPS HUB: WEST
│  └─ Federal NSF-funded program
│  └─ Training: Lean innovation methodology
│  └─ Available to all sectors
│
└─ DESTINATION STARTUP
   └─ Attracts external entrepreneurs to Boulder
   └─ Offers relocation support and resources
```

**Why It Matters**: If your startup is deep tech and university-connected, the Venture Partners ecosystem is your primary resource hub, not a single program.

---

### Discovered Relationship #2: Stage-Based Progression
**Weight**: Critical | **Edges**: 11 sequence + 2 stage_progression edges

CU's programs intentionally form a **stage-appropriate ladder**:

```
STAGE 1: BEGINNING & CULTIVATING
═══════════════════════════════════
Get Seed Funding ($500)
    ↓
Idea Forge (prototype)
    ↓
Boulder Venture Club (network & learn)
    ↓
Deming Center (entrepreneurship education)

STAGE 2: CONCEIVING & EXPLORING
═══════════════════════════════════
ATLAS Institute (if design/research focus)
    ↓
Embark Deep Tech (if university IP)
    ↓
Lab Venture Challenge (if research-based)
    ↓
Entrepreneurial Law Clinic (if IP needs protection)

STAGE 3: BUILDING & TESTING
═══════════════════════════════════
Catalyze CU (summer accelerator)
    ↓
New Venture Challenge (competition → funding)
    ↓
Ascent Deep Tech (if deep tech, high growth)

STAGE 4: LAUNCHING & GROWING
═══════════════════════════════════
Venture Partners (non-dilutive funding & support)
    ↓
Series A / Institutional funding
```

**Recommended Speed**: 
- Stage 1 → 2: 3-6 months (validate problem)
- Stage 2 → 3: 3-6 months (build MVP)
- Stage 3 → 4: 6-12 months (prove market)

**Skipping Stages**: Not recommended. Each stage builds founder credibility for the next. Exception: established founders can compress 1-2.

---

### Discovered Relationship #3: Research-to-Startup Pipeline
**Weight**: Critical | **Edges**: 6 (4 complement + 2 sector_overlap)

**For CU Faculty & PhD Students with Commercializable Research**

```
YOUR RESEARCH (Lab Discovery)
    │
    ▼
CENTER FOR TRANSLATIONAL RESEARCH
    ├─ Assessment: Is this commercially viable?
    ├─ Input: Your research findings, IP potential
    └─ Output: Commercialization roadmap
    │
    ▼
EMBARK DEEP TECH
    ├─ Matching: Find entrepreneurial co-founder
    ├─ Or: You transition to founder role
    └─ Output: Founding team + IP assignment agreement
    │
    ▼
LAB VENTURE CHALLENGE
    ├─ Pitch: Convince judges your startup solves real problem
    ├─ Prize: $$ to cover initial commercialization
    └─ Output: Funded proof-of-concept
    │
    ▼
ASCENT DEEP TECH ACCELERATOR
    ├─ Next level: Structured 4-month acceleration
    ├─ Network: Connect with investors, industry partners
    └─ Output: Ready for Series A / institutional funding
```

**Timeline**: 18-24 months from discovery to investor-ready

**Key Differentiator**: CU pays special attention to research founders. The pipeline accommodates researchers who aren't professional entrepreneurs.

**Success Examples** (implicit in program descriptions):
- Medical device research → commercial venture
- Materials science discovery → hardware company
- CS research → deep tech startup

---

### Discovered Relationship #4: Support Services Layer
**Weight**: High | **Edges**: 7 complement relationships (0.65-0.75 weight each)

Three critical services operate horizontally and can be added to ANY primary pathway:

```
PRIMARY PROGRAMS (e.g., Catalyze, Deming, NVC)
    │
    ├─────────────────────────────────────┐
    │                                     │
    ▼                                     ▼
ENTREPRENEURIAL LAW CLINIC          IDEA FORGE
    │                                     │
    ├─ IP protection                     ├─ Prototyping equipment
    ├─ Founder agreements                ├─ Cross-disciplinary space
    ├─ Investment docs                   ├─ Design thinking facilitation
    └─ (Universal need)                  └─ (Especially hardware)
    │                                     │
    └─────────────────────────────────────┘
                  │
                  ▼
        BOULDER VENTURE CLUB
            │
            ├─ Peer mentorship
            ├─ Guest speakers (investors, founders)
            ├─ Networking events
            └─ Sustained learning community
```

**Stacking Strategy**: 
- **Founder doing Catalyze?** Add Idea Forge + Law Clinic
- **Researcher in Lab Venture Challenge?** Add Law Clinic + Deming courses
- **Early idea in Get Seed Funding?** Add Boulder Venture Club for accountability

**Cost**: Most free to CU students/faculty

---

### Discovered Relationship #5: Sector-Specific Clustering
**Weight**: High | **Edges**: 5 sector_overlap relationships (0.85-0.9 weight)

Different sectors thrive with different program combinations:

#### HARDWARE & DEEP TECH HARDWARE
```
Ideal Stack:
  • Idea Forge (physical prototyping)
  • Catalyze CU (summer cohort, hardware focus)
  • Ascent Deep Tech (growth acceleration)
  
Timeline: 18 months seed → institutional capital
Funding: $500 → $25k (NVC) → institutional
```

#### BIOTECH & ADVANCED MATERIALS
```
Ideal Stack:
  • Center for Translational Research (identify commercial research)
  • Embark Deep Tech (match with entrepreneur)
  • Lab Venture Challenge (commercialization competition)
  • Ascent Deep Tech (growth)
  
Timeline: 24 months research → funded venture
Funding: Grant → LVC prize → Ascent sponsorship
Special: Best for researcher founders
```

#### SOFTWARE / AI / FINTECH
```
Ideal Stack:
  • Deming Center (learn SaaS metrics, unit economics)
  • Boulder Venture Club (network with investors)
  • Catalyze CU (AI track accelerator)
  • New Venture Challenge (growth capital)
  
Timeline: 12 months idea → growth funding
Funding: $500 → $50k (NVC) → angel/seed
```

#### GENERAL STARTUP (ALL SECTORS)
```
Ideal Stack:
  • Get Seed Funding (validate)
  • Deming Center (learn fundamentals)
  • New Venture Challenge (raise $25-100k)
  • Entrepreneurial Law Clinic (structure)
  
Timeline: 12 months startup → growth stage
Funding: $500 → $25-100k
Accessibility: Highest
```

---

## Network Statistics

**Connectivity by Program**:
```
Venture Partners           (11 edges) ★★★★★ Hub
New Venture Challenge      (8 edges)  ★★★★
Deming Center             (7 edges)  ★★★★
Catalyze CU              (7 edges)  ★★★★
Ascent Deep Tech         (7 edges)  ★★★★
Entrepreneurial Law      (6 edges)  ★★★
Embark Deep Tech         (5 edges)  ★★★
Lab Venture Challenge    (5 edges)  ★★★
Idea Forge               (5 edges)  ★★★
ATLAS Institute          (4 edges)  ★★
Boulder Venture Club     (4 edges)  ★★
Get Seed Funding         (4 edges)  ★★
Center for Translational (3 edges)  ★
NSF I-Corps              (3 edges)  ★
Destination Startup      (1 edge)   ·
```

**Most Common Relationship Types**:
1. Complement (18 edges, 40%) — Programs pair well
2. Sequence (11 edges, 24%) — Clear progression
3. Contains (6 edges, 13%) — Parent-child
4. Sector Overlap (5 edges, 11%) — Serve same sectors
5. Stage Progression (2 edges, 4%) — Different maturity
6. Opportunity Overlap (3 edges, 7%) — Offer same support

---

## Integration with Navigator Agent

**Search Query Examples** → Path Recommendations:

| Query | Recommended Path |
|-------|-----------------|
| "I have a hardware prototype" | Idea Forge → Catalyze CU → NVC → Ascent |
| "I'm a professor with an invention" | CTR → Embark → LVC → Ascent |
| "I have an AI idea but no code" | Deming → Catalyze AI track → NVC |
| "I want to build a biotech company" | LVC → Ascent → Venture Partners |
| "I'm a first-time founder" | Get Seed → Deming → Boulder VC Club → NVC |

**Stage Detection**:
- Early stage (no product): Get Seed, Deming, Idea Forge
- Growth stage (MVP/product): Catalyze, NVC, Ascent
- Scaling stage (traction): Venture Partners, institutional capital

---

## Key Insights for Product

### 1. **Non-Linear Pathways Are Valid**
While the stage-based progression is ideal, founders frequently jump between programs:
- A researcher might skip early stage and go direct to LVC
- A returning founder might skip Deming and go to Catalyze
- The graph should show "shortcuts" but flag them as atypical

### 2. **Support Services Are Multipliers**
Adding Entrepreneurial Law Clinic or Idea Forge to any path increases success likelihood. These should be recommended universally.

### 3. **Venture Partners is the "Destination"**
Most programs have edges leading toward Venture Partners. This is the most resource-rich ecosystem and the natural end-goal for serious startups.

### 4. **Sector Matters More Than Stage**
A deep tech hardware founder should prioritize sector-specific programs (Catalyze, Idea Forge, Ascent) over generalist programs (NVC, Deming), even if sector-specific is "harder."

### 5. **Research is a Superpower at CU**
CU's unique value is supporting research-to-startup conversion. This should be heavily featured in the navigator for faculty/PhD users.
