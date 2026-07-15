# Entity-Graph Integration Guide

## File Structure

```
src/data/
├── entity-graph.json              # Core data: programs, entities, edges, relationships
├── ENTITY-GRAPH-ANALYSIS.md       # Deep analysis of discovered relationships
├── DISCOVERED-PATHWAYS.md         # Visual pathways and routing logic
├── INTEGRATION-GUIDE.md           # This file
└── (original knowledge-base.json in root - remains for compatibility)
```

## Using entity-graph.json in Code

### Basic Imports (Node/TypeScript)

```typescript
const graph = require('./src/data/entity-graph.json');

// Access programs
const programs = graph.programs;  // Array of 15 program objects
const programById = (id) => programs.find(p => p.id === id);

// Access entities (organizations)
const entities = graph.entities;  // Array of 12 entity objects
const entityById = (id) => entities.find(e => e.id === id);

// Access relationships
const edges = graph.edges;  // Array of 45 relationship edges
```

### Common Query Patterns

#### 1. Find All Programs for a Specific Stage
```typescript
const earlyStagePrograms = graph.programs.filter(p => 
  p.stage === 'early' || p.stage === 'all_stages'
);

const deepTechPrograms = graph.programs.filter(p =>
  p.sectors && (p.sectors.includes('Hardware') || p.sectors.includes('Biotech'))
);
```

#### 2. Find Recommended Next Step
```typescript
function nextPrograms(currentProgramId) {
  return graph.edges
    .filter(e => e.source === currentProgramId && e.type === 'sequence')
    .map(e => programById(e.target))
    .sort((a, b) => b.weight - a.weight);  // Highest weight first
}

// Usage
nextPrograms('get-seed-funding');  // Returns: [new-venture-challenge, ...]
```

#### 3. Find Complementary Programs
```typescript
function complementaryPrograms(currentProgramId) {
  return graph.edges
    .filter(e => 
      (e.source === currentProgramId || e.target === currentProgramId) 
      && e.type === 'complement'
    )
    .map(e => e.source === currentProgramId ? e.target : e.source)
    .map(id => programById(id))
    .sort((a, b) => b.weight - a.weight);
}

// Usage
complementaryPrograms('catalyze-cu');  // Returns: [ascent-deep-tech, idea-forge, ...]
```

#### 4. Find Sub-Programs of Parent
```typescript
function subPrograms(parentId) {
  const parentProgram = programById(parentId);
  if (!parentProgram.sub_programs) return [];
  
  return parentProgram.sub_programs
    .map(id => programById(id))
    .filter(p => p);
}

// Usage
subPrograms('venture-partners');  
// Returns: [ascent-deep-tech, center-for-translational-research, ...]
```

#### 5. Find All Programs by Opportunity Type
```typescript
function programsByOpportunity(opportunityType) {
  return graph.programs.filter(p =>
    p.opportunities && p.opportunities.includes(opportunityType)
  );
}

// Usage
programsByOpportunity('Mentorship and Advising');
// Returns: [deming-center, venture-partners, nvc, ...]
```

#### 6. Find Programs by Sector
```typescript
function programsBySector(sector) {
  return graph.programs.filter(p =>
    p.sectors && (
      p.sectors.includes('All') || 
      p.sectors.includes(sector) ||
      p.sectors.includes('All deep tech')
    )
  );
}

// Usage
programsBySector('Biotech');
// Returns: [ascent-deep-tech, lab-venture-challenge, venture-partners, ...]
```

#### 7. Build Complete Pathway for Founder Type
```typescript
function getPathway(founderProfile) {
  const { stage, sector, hasResearch } = founderProfile;
  
  if (hasResearch && sector === 'Biotech') {
    // Research biotech pathway
    return [
      'center-for-translational-research',
      'embark-deep-tech',
      'lab-venture-challenge',
      'ascent-deep-tech'
    ].map(programById);
  }
  
  if (sector === 'Hardware') {
    // Hardware pathway
    return [
      'idea-forge',
      'catalyze-cu',
      'new-venture-challenge',
      'ascent-deep-tech'
    ].map(programById);
  }
  
  // Default: general startup
  return [
    'get-seed-funding',
    'deming-center',
    'boulder-venture-club',
    'new-venture-challenge'
  ].map(programById);
}
```

---

## API Response Format Examples

### Example 1: Single Program with All Relationships
```json
{
  "program": {
    "id": "catalyze-cu",
    "name": "Catalyze CU",
    "stage": "growth",
    "location": "CU Boulder Campus",
    "website": "https://www.colorado.edu/catalyzecu/",
    "funding_amount": "No direct funding, but prep for NVC",
    "opportunities": ["Entrepreneurial Training", "Mentorship and Advising", "Funding and Financing"]
  },
  "relationships": {
    "prerequisites": [
      { "program_id": "idea-forge", "reasoning": "Build before you accelerate" },
      { "program_id": "deming-center", "reasoning": "Learn fundamentals first" }
    ],
    "sequences": [
      { "program_id": "new-venture-challenge", "reasoning": "Access capital after acceleration" },
      { "program_id": "ascent-deep-tech", "reasoning": "Scale if deep tech focus" }
    ],
    "complements": [
      { "program_id": "ascent-deep-tech", "weight": 0.8, "reason": "Same sectors" },
      { "program_id": "entrepreneurial-law-clinic", "weight": 0.7, "reason": "Legal support" },
      { "program_id": "idea-forge", "weight": 0.75, "reason": "Prototyping support" }
    ]
  }
}
```

### Example 2: Founder Pathway Recommendation
```json
{
  "founder_profile": {
    "type": "first_time",
    "has_product": false,
    "has_team": false,
    "has_research": false,
    "sector": "AI/ML"
  },
  "recommended_pathway": [
    {
      "stage": 1,
      "program_id": "get-seed-funding",
      "duration_months": 3,
      "purpose": "Validate idea with $500 seed"
    },
    {
      "stage": 1,
      "program_id": "deming-center",
      "duration_months": 6,
      "purpose": "Learn entrepreneurship fundamentals"
    },
    {
      "stage": 2,
      "program_id": "boulder-venture-club",
      "duration_months": 9,
      "purpose": "Network with peers and mentors"
    },
    {
      "stage": 3,
      "program_id": "catalyze-cu",
      "duration_months": 12,
      "purpose": "Accelerate with summer cohort"
    },
    {
      "stage": 3,
      "program_id": "new-venture-challenge",
      "duration_months": 12,
      "purpose": "Compete for $25-100k+ capital"
    }
  ],
  "support_services": [
    {
      "service_id": "entrepreneurial-law-clinic",
      "when": "After first NVC win",
      "purpose": "Protect IP and structure equity"
    }
  ],
  "total_timeline_months": 18,
  "estimated_capital_by_stage": {
    "stage1": 500,
    "stage3": 50000
  }
}
```

---

## Graph Visualization Data

For rendering the entity-graph as a network visualization (D3, Cytoscape, Vis.js):

```javascript
const graphData = {
  nodes: graph.programs.map(p => ({
    id: p.id,
    label: p.name,
    stage: p.stage,
    size: countEdges(p.id),  // Larger if more connected
    color: stageColor(p.stage)
  })),
  edges: graph.edges.map(e => ({
    source: e.source,
    target: e.target,
    type: e.type,
    weight: e.weight,
    label: e.type,
    width: e.weight * 5  // Line thickness by importance
  }))
};
```

Color scheme by stage:
- Early: `#FF6B6B` (red)
- Growth: `#4ECDC4` (teal)
- Scaling: `#45B7D1` (blue)
- All Stages: `#FFA500` (orange)

---

## Search & Filtering

### Full-Text Search Across Programs
```typescript
function search(query) {
  const q = query.toLowerCase();
  return graph.programs.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.opportunities.some(opp => opp.toLowerCase().includes(q)) ||
    p.sectors.some(sec => sec.toLowerCase().includes(q))
  );
}

// Usage
search('biotech');  // Finds all biotech programs
search('mentorship');  // Finds all programs offering mentorship
search('law');  // Finds entrepreneurial law clinic
```

### Faceted Filtering
```typescript
function filter(criteria) {
  return graph.programs.filter(p => {
    if (criteria.stage && p.stage !== criteria.stage) return false;
    if (criteria.sector && !p.sectors?.includes(criteria.sector)) return false;
    if (criteria.opportunity && !p.opportunities?.includes(criteria.opportunity)) return false;
    if (criteria.eligibility && !criteria.eligibility.some(e => p.eligibility?.includes(e))) return false;
    return true;
  });
}

// Usage
filter({
  stage: 'growth',
  sector: 'Hardware',
  opportunity: 'Mentorship and Advising',
  eligibility: ['Undergraduate Students']
});
```

---

## Discovered Relationships Usage

The `discovered_relationships` array contains the 5 key insights:

```typescript
// Show top discovered relationships to new users
function getDiscoveredRelationships() {
  return graph.discovered_relationships.sort((a, b) => a.rank - b.rank);
}

// Example: Show Venture Partners hub explanation
const vpHub = graph.discovered_relationships.find(r => 
  r.title.includes('Ecosystem Hub')
);
console.log(vpHub.description);
// Output: "Venture Partners at CU Boulder functions as the central hub..."
```

---

## Metadata & Stats

```typescript
// Get graph metadata
const stats = {
  total_programs: graph.metadata.total_programs,
  total_entities: graph.metadata.total_entities,
  total_edges: graph.metadata.total_edges,
  edge_types: graph.metadata.edge_types,
  generated: graph.metadata.generated
};

// Use in UI: "Mapped 15 programs across 45 relationships..."
```

---

## Edge Cases & Notes

1. **Sub-Programs**: Some programs (like Ascent Deep Tech) appear both as standalone AND as sub-programs of Venture Partners. Include both in results.

2. **"All Sectors" Programs**: Deming Center, NVC, Boulder Venture Club serve all sectors. Include them in sector-specific searches.

3. **Eligibility**: Some programs say "Year-Round" while others have specific seasons. Filter by availability if building calendar view.

4. **Weight Interpretation**:
   - 1.0 = Definitive containment relationship
   - 0.8-0.9 = Strong complementarity or sequence
   - 0.7-0.8 = Moderate complementarity
   - <0.7 = Weak but valid relationship

5. **Sector "All deep tech"**: Embark and some programs use this. Treat as: AI, Aerospace, Biotech, Hardware, Advanced Materials.

---

## Testing & Validation

Verify entity-graph.json integrity:

```bash
# Validate JSON structure
node -e "const g = require('./src/data/entity-graph.json'); console.log('✓ Valid'); console.log('Programs:', g.programs.length); console.log('Entities:', g.entities.length); console.log('Edges:', g.edges.length);"

# Check for orphaned programs (programs referenced in edges but not in programs array)
node -e "
const g = require('./src/data/entity-graph.json');
const programIds = new Set(g.programs.map(p => p.id));
const edgeRefs = new Set();
g.edges.forEach(e => { edgeRefs.add(e.source); edgeRefs.add(e.target); });
const orphans = [...edgeRefs].filter(id => !programIds.has(id));
if (orphans.length) console.log('⚠ Orphaned:', orphans);
else console.log('✓ No orphaned references');
"
```

---

## Future Enhancements

1. **Temporal Data**: Add "best_season" and "application_deadline" fields
2. **Success Metrics**: Track % of founders who progress through each sequence
3. **Cost/Time Estimates**: Add effort estimates for each program
4. **Alumni Outcomes**: Track where founders go after each program
5. **Partner Integrations**: Link to application URLs and automated enrollment
6. **Mentor Profiles**: Map specific mentors/advisors to programs
7. **Cohort Data**: Current and past cohort sizes and composition
