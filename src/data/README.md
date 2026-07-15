# CU Entrepreneurship Entity Relationship Graph

## What Is This?

This directory contains a comprehensive **entity relationship graph** for CU Entrepreneurship programs. Rather than treating programs as isolated offerings, the graph reveals how they connect, complement, and sequence together to form a coherent ecosystem.

**Quick Stats**:
- **15 Programs** (10 primary + 5 sub-programs)
- **12 Organizations** (schools, centers, external partners)
- **45 Relationship Edges** (prerequisites, sequences, complements)
- **5 Critical Discoveries** (major patterns in the ecosystem)

---

## Files in This Directory

### `entity-graph.json` ⭐ **START HERE**
**The core data file.** Contains:
- All 15 programs with metadata (stage, eligibility, opportunities, sectors, contacts)
- All 12 entities (organizations and opportunity types)
- All 45 edges (relationships) with types and weights
- 5 discovered relationships (top insights)

**Structure**: 
```json
{
  "metadata": { ... },
  "programs": [ ... ],
  "entities": [ ... ],
  "edges": [ ... ],
  "discovered_relationships": [ ... ]
}
```

**Use When**:
- Building a navigator that recommends programs
- Creating search functionality
- Visualizing the ecosystem
- Finding prerequisites or next steps

---

### `ENTITY-GRAPH-ANALYSIS.md` 📊 **Deep Dive**
**Detailed analysis of what the graph reveals.** Contains:
- Explanation of each relationship type and count
- Network statistics and centrality analysis
- Recommended pathways by founder type (4 templates)
- Organizational structure breakdown
- Gaps and opportunities for enhancement

**Read When**:
- You want to understand WHY programs are connected
- You're designing the navigator's recommendation engine
- You're building product documentation
- You want context for the graph beyond raw data

**Key Sections**:
1. **Top 5 Discovered Relationships** - The critical patterns
2. **Relationship Types & Counts** - What edges mean
3. **Recommended Pathways** - 4 founder-type templates
4. **Gap Analysis** - Ecosystem weaknesses

---

### `DISCOVERED-PATHWAYS.md` 🗺️ **Visual Guides**
**Illustrated pathways and routing logic.** Contains:
- Visual ASCII diagrams of each major pathway
- Stage-by-stage breakdowns
- Sector-specific stacking recommendations
- Network connectivity statistics
- Integration hints for product

**Read When**:
- You're building UI components to show pathways
- You want to explain relationships to users
- You're debugging navigation logic
- You need visual reference for documentation

**Key Content**:
- `STAGE 1-4` progression flowcharts
- Research-to-startup pipeline diagram
- Support services stacking strategies
- Sector-specific clustering visual

---

### `INTEGRATION-GUIDE.md` 💻 **Code Reference**
**Implementation guide for developers.** Contains:
- TypeScript/JavaScript code examples
- Common query patterns (next steps, complements, etc.)
- API response format examples
- Full-text search implementations
- Graph visualization data format
- Testing and validation scripts

**Read When**:
- You're implementing the navigator in code
- You need to query the graph from Node/TypeScript
- You're building search functionality
- You need API response format examples

**Includes Examples For**:
- Finding next programs in sequence
- Building complete pathways
- Faceted filtering
- Network visualization data format
- Orphan reference detection

---

## Quick Reference: Program List

| ID | Name | Stage | Parent/Hub |
|----|------|-------|-----------|
| **get-seed-funding** | Get Seed Funding | Early | Innovation Initiative |
| **deming-center** | Deming Center | All | Leeds Business |
| **boulder-venture-club** | Boulder Venture Club | Early | Student club |
| **idea-forge** | Idea Forge | Early | Engineering |
| **atlas-institute** | ATLAS Institute | Early-Growth | Engineering |
| **new-venture-challenge** | NVC | Growth | Innovation Initiative |
| **catalyze-cu** | Catalyze CU | Growth | Engineering |
| **entrepreneurial-law-clinic** | Law Clinic | Support | Law School |
| **venture-partners** | Venture Partners (Hub) | Growth-Scale | Multiple |
| **ascent-deep-tech** | Ascent Deep Tech | Growth-Scale | Venture Partners |
| **embark-deep-tech** | Embark Deep Tech | Early-Growth | Venture Partners |
| **center-for-translational-research** | CTR | Early-Growth | Venture Partners |
| **lab-venture-challenge** | Lab Venture Challenge | Early-Growth | Venture Partners |
| **nsf-i-corps-hub-west** | NSF I-Corps | All | Venture Partners |
| **destination-startup** | Destination Startup | Growth | Venture Partners |

---

## The 5 Discovered Relationships (Summary)

### 1. **Venture Partners as Ecosystem Hub** ⭐⭐⭐⭐⭐
Venture Partners isn't a single program—it's an umbrella coordinating 6 specialized deep tech programs. Think of it as the "destination" for serious deep tech startups.

### 2. **Stage-Based Progression Pathway** ⭐⭐⭐⭐⭐
Programs intentionally form a ladder: Begin & Cultivate → Conceive & Explore → Build & Test → Launch & Grow. Each stage prepares you for the next.

### 3. **Research-to-Startup Pipeline** ⭐⭐⭐⭐⭐
Four programs (CTR → Embark → Lab Venture Challenge → Ascent) explicitly convert university research into commercial ventures. This is CU's unique advantage.

### 4. **Support Services Layer** ⭐⭐⭐⭐
Law Clinic, Idea Forge, and Boulder Venture Club enhance ALL other programs. Stack them in, don't choose between them.

### 5. **Sector-Specific Clustering** ⭐⭐⭐⭐
Different sectors have optimal program combinations. Hardware ≠ Biotech ≠ Software. Choose the cluster, not random programs.

---

## How to Use This in the Navigator

### User Asks: "What programs should I do?"
```
1. Detect user type (first-time founder, researcher, etc.)
2. Detect user sector (hardware, biotech, AI, etc.)
3. Look up recommended_pathways in DISCOVERED-PATHWAYS.md
4. Return programs in sequence with reasoning
5. Add support services (Law Clinic, Idea Forge, Boulder VC Club)
```

### User Asks: "What comes after [program]?"
```
1. Query edges where type="sequence" and source=[program_id]
2. Sort by weight (higher = more important)
3. Return next program(s) with reasoning
4. Optional: Also show "complement" edges as parallel options
```

### User Asks: "These programs complement each other?"
```
1. Query edges where type="complement" and involves=[program_id]
2. Return pairs of programs with combined benefit description
```

### Search: "I need prototyping"
```
1. Full-text search for "prototyping" across program descriptions/opportunities
2. Result: Idea Forge (primary), ATLAS Institute (secondary)
3. Optional: Recommend as complement to other programs
```

---

## Product Recommendations

### For the Navigator Agent
1. **Show Pathways**: Use `DISCOVERED-PATHWAYS.md` templates to recommend sequences
2. **Explain Relationships**: Display why programs are connected (from edges.reasoning)
3. **Flag Shortcuts**: Alert if users skip recommended stages
4. **Layer Support**: Always suggest Law Clinic for IP startups, Idea Forge for hardware

### For UI/UX
1. **Pathway Visualization**: Render the stage-based progression as a flowchart
2. **Network Graph**: Show Venture Partners hub and its spokes
3. **Sector Filter**: Gate programs by sector selection
4. **Timeline**: Show recommended time spent at each stage (from DISCOVERED-PATHWAYS)

### For Data Quality
1. **Monitor**: Track which edge types are most traveled (usage metrics)
2. **Validate**: Use INTEGRATION-GUIDE.md test scripts to check data integrity
3. **Update**: When programs change, update entity-graph.json and regenerate docs

---

## Implementation Checklist

- [ ] Load `entity-graph.json` in navigator backend
- [ ] Implement query functions (INTEGRATION-GUIDE.md examples)
- [ ] Build search indexing (full-text examples provided)
- [ ] Create pathway recommendation engine (templates in DISCOVERED-PATHWAYS.md)
- [ ] Display relationships in UI (example formats in INTEGRATION-GUIDE.md)
- [ ] Add validation tests (scripts in INTEGRATION-GUIDE.md)
- [ ] Document API responses based on examples
- [ ] Create user-facing pathway guides (derived from ENTITY-GRAPH-ANALYSIS.md)

---

## Questions This Data Answers

| Question | File | Location |
|----------|------|----------|
| "What programs exist?" | entity-graph.json | .programs array |
| "Which program comes after X?" | entity-graph.json | .edges (type: sequence) |
| "What sector is this program?" | entity-graph.json | .programs[].sectors |
| "How do programs connect?" | ENTITY-GRAPH-ANALYSIS.md | Top 5 Discovered |
| "What's the typical founder path?" | DISCOVERED-PATHWAYS.md | Recommended Pathways section |
| "How do I implement search?" | INTEGRATION-GUIDE.md | Search & Filtering |
| "What program for biotech?" | DISCOVERED-PATHWAYS.md | Sector-Specific Clustering |
| "What's the org structure?" | ENTITY-GRAPH-ANALYSIS.md | Organizational Structure |

---

## Data Quality Notes

✅ **Complete**: All 15 programs from knowledge-base.json plus 5 Venture Partners sub-programs

✅ **Validated**: JSON structure validated, no orphaned references

✅ **Weighted**: All edges assigned weights (1.0 = definitive, 0.65-0.9 = relationship strength)

✅ **Sourced**: Derived from knowledge-base.json + program description analysis + ecosystem understanding

⚠️ **Living Document**: Entity relationships may evolve as CU programs change. Update process:
1. Modify entity-graph.json
2. Regenerate ENTITY-GRAPH-ANALYSIS.md if structure changes
3. Update DISCOVERED-PATHWAYS.md if pathways shift
4. Increment version in metadata

---

## Support & Questions

**For Graph Logic**: See ENTITY-GRAPH-ANALYSIS.md "Discovered Relationships" section

**For Code Examples**: See INTEGRATION-GUIDE.md "Using entity-graph.json in Code"

**For Pathways**: See DISCOVERED-PATHWAYS.md "Recommended Pathways by Founder Type"

**For Structure**: See entity-graph.json metadata and schema

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-14 | Initial entity graph built from knowledge-base.json analysis. 15 programs, 45 edges, 5 discovered relationships. |

---

## Related Files

- **Original source**: `/knowledge-base.json` (root)
- **Project docs**: `/README.md`, `/INTERVIEW-DEMO.md`
- **Navigator code**: `/CUEntrepreneurshipAgent.tsx`

---

## How This Graph Was Built

1. **Analysis**: Examined knowledge-base.json to identify program metadata, sectors, opportunities
2. **Discovery**: Inferred relationships from:
   - Parent organization references (contains edges)
   - Sector overlaps (sector_overlap edges)
   - Stage progressions (pathway positions)
   - Opportunity matches (opportunity_overlap edges)
   - Logical sequencing (sequence edges)
3. **Validation**: Cross-referenced program websites and descriptions to confirm relationships
4. **Documentation**: Created 3 companion guides (analysis, pathways, integration) to explain the graph

---

**Generated**: 2026-07-14  
**Graph Version**: 1.0  
**Total Content**: 1,718 lines across 4 markdown files + 656 lines JSON
