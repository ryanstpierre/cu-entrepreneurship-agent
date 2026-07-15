# Relevance Prompts Guide — CU Entrepreneurship Navigator

## Overview

The relevance prompts system provides three LLM prompt templates for explaining program relevance to users based on their specific context. These prompts are designed to generate personalized explanations that connect users' goals, constraints, and stage to specific CU entrepreneurship programs.

## Features

- **Context-Aware**: Adapts to user's entrepreneurial stage, sectors, constraints, and eligibility
- **Personalized**: Generates 1-2 sentence explanations specific to individual circumstances
- **Composable**: System and user prompts separate for flexibility
- **Testable**: Includes mock data and comprehensive test suite
- **Production-Ready**: Full TypeScript support with type safety

---

## Three Prompt Templates

### 1. Why This Program (Single Program Relevance)

**Use Case:** Explain why a specific program is relevant to a user right now.

**Inputs:**
- Program (name, description, opportunities, sectors, pathways, funding, etc.)
- UserProfile (stage, sectors, constraints, eligibility)

**Output:** 1-2 sentence explanation connecting program features to user's situation

**File:** `src/prompts/relevancePrompts.ts` → `getRelevanceExplanation()`

---

### 2. Next Steps (Career Progression)

**Use Case:** Recommend what a user should do after completing a program or reaching a milestone.

**Inputs:**
- CompletedProgram (program + completion outcomes)
- UserProfile (updated stage and goals)
- RelatedPrograms (list of potential next programs)

**Output:** 2-3 prioritized recommendations with reasoning for the sequence

**File:** `src/prompts/relevancePrompts.ts` → `getNextStepsExplanation()`

---

### 3. Path Planning (Complete Learning Journey)

**Use Case:** Show a founder their complete pathway from "I have an idea" through scaling.

**Inputs:**
- UserProfile (stage, goals, sectors, constraints)
- Programs (full list of available programs)

**Output:** Sequenced learning path with 4-6 programs, stage descriptions, transitions, and timeline

**File:** `src/prompts/relevancePrompts.ts` → `getPathPlanningExplanation()`

---

## Data Structures

### UserProfile

```typescript
interface UserProfile {
  stage: EntrepreneurialStage  // "1: Beginning and Cultivating" | "2: Conceiving and Exploring" | etc.
  sectors: Sector[]            // ["AI and Machine Learning", "Biotech", ...]
  constraints: Constraint[]    // ["funding", "mentorship", "prototyping", ...]
  eligibility?: string         // "Undergraduate", "Graduate", "Faculty", etc.
  yearsOfExperience?: number
  hasTeam?: boolean
  hasFunding?: boolean
  specificGoal?: string
}
```

### Program

```typescript
interface Program {
  id: string
  name: string
  description: string
  opportunities?: Opportunity[]      // ["Funding and Financing", "Mentorship and Advising", ...]
  sectors?: Sector[]
  pathways?: EntrepreneurialStage[]
  funding?: string                   // "$325,000+ in prizes"
  eligibility?: string[]
  website?: string
  parentOrganization?: string
  timeline?: string[]                // ["Fall", "Spring"]
  contact?: string
  subPrograms?: string[]
}
```

### RelevanceExplanation

```typescript
interface RelevanceExplanation {
  systemPrompt: string              // Instructions for the LLM
  userPrompt: string                // Context and query for the LLM
  context: {
    stage: string
    sectors: string[]
    constraints: string[]
  }
}
```

---

## Mock Data & Examples

Three complete mock datasets are included for testing and demonstration:

### Example 1: Student with AI Startup Idea

**Profile:**
- Stage: "1: Beginning and Cultivating"
- Sectors: ["AI and Machine Learning"]
- Constraints: ["funding", "mentorship", "team"]
- Eligibility: Undergraduate
- Goal: "Build and launch an AI-powered customer service tool"

**Program:** New Venture Challenge ($325K competition)

**Generated Explanation:**
> "NVC is perfectly positioned for you right now. With $325K in prizes available for early-stage AI ventures, it can solve your funding constraint while connecting you with mentors and other founders—addressing both your immediate needs. The program explicitly supports the 'Building and Testing' stage, which is where you'll be once you validate your customer service idea."

---

### Example 2: Career Progression After Completion

**Completed Program:** Deming Center
- Completed: Entrepreneurial Studies Certificate
- Outcomes: Assembled team, validated market with 50 customer interviews

**Updated Profile:**
- Stage: "3: Building and Testing"
- Goal: "Prepare to raise pre-seed funding"
- Constraints: ["funding", "prototyping"]

**Related Programs to Choose From:**
- New Venture Challenge (competition, $325K)
- Catalyze CU (accelerator with maker resources)
- Get Seed Funding ($500-2K micro-grants)
- Venture Partners (research commercialization)

**Generated Recommendations:**

```
1. Catalyze CU (Priority: HIGH, Timeline: 12 weeks)
   Why now: You have a validated idea and team, but need hardware/infrastructure
   to prototype. Catalyze's maker resources and investor network are designed for
   exactly this phase. They'll help you build the MVP that proves your concept works.

2. New Venture Challenge Spring Round (Priority: HIGH, Timeline: 6-9 months)
   Why after Catalyze: With a working prototype, you'll be a much stronger NVC
   competitor. Winning helps validate your business model and gives you capital
   for the next stage. Many NVC winners go on to Venture Partners support.

3. Get Seed Funding Micro-Grants (Priority: MEDIUM, Timeline: Rolling)
   Why in parallel: Apply for the $500-2K grants while building. These bridge
   early cash needs and don't require a perfect product—just a credible team.

Total estimated timeline: 6-9 months to have MVP + pre-seed capital.
```

---

### Example 3: Complete Learning Path

**User Profile:**
- Stage: "1: Beginning and Cultivating"
- Sectors: ["AI and Machine Learning"]
- Constraints: ["funding", "mentorship", "team"]
- Eligibility: Undergraduate

**Generated Learning Path:**

```
PHASE 1: FOUNDATION (Months 1-3)
1. Deming Center for Entrepreneurship
   - What you'll do: Entrepreneurial Studies Certificate, weekly mentorship, pitch practice
   - Why: Build fundamentals, get connected to CU's founder network, validate problem
   - Effort: 3-5 hrs/week
   - Success metric: 50+ customer conversations, identified co-founders

2. Get Seed Funding (parallel)
   - What you'll do: Write brief proposal for $500-2K non-dilutive grant
   - Why: Cover initial costs (customer interviews, tools, travel) without giving up equity
   - Effort: 2 hrs for application
   - Success metric: $1K in seed funding

PHASE 2: BUILDING (Months 4-9)
3. Idea Forge (as needed)
   - What you'll do: Access to design tools, prototyping equipment, workspace
   - Why: Build your first working prototype, test core assumptions
   - Effort: 5-10 hrs/week (on demand)
   - Success metric: Functional MVP validated with early users

4. New Venture Challenge (Spring Round)
   - What you'll do: Pitch competition, 12-week program with mentor assignments
   - Why: Get feedback from experienced judges, compete for $5-50K, network with other AI founders
   - Effort: 8-10 hrs/week
   - Success metric: Top 20 finalist status, $10-25K prize, investor introductions

PHASE 3: SCALING (Months 10-18)
5. Catalyze CU
   - What you'll do: Intensive 12-week accelerator with weekly mentorship
   - Why: Prepare for fundraising, refine go-to-market, connect with VCs
   - Effort: 15-20 hrs/week
   - Success metric: Product-market fit signals, $50-100K pre-seed raised

6. Ascent Deep Tech (if raising)
   - What you'll do: Ongoing mentor support from serial founders and operators
   - Why: Navigate Series A preparation, board dynamics, scaling challenges
   - Effort: 5 hrs/week check-ins
   - Success metric: Strong advisor network, clear growth metrics

TOTAL TIMELINE: 12-18 months from idea to pre-seed capital

KEY DECISION POINTS:
- After Deming: Is your problem worth solving? If no, pivot or pause.
- After NVC: Did you place well? Use momentum for fundraising or go back to building.
- After Catalyze: Are investors interested? If not, what's the gap?

SECTOR-SPECIFIC NOTES FOR AI:
- CU is strong in AI/ML given the CS and engineering programs
- Emphasis on technical founders—use Ascent and Catalyze to bring in business co-founder if needed
- Many AI exits in Boulder; strong mentor network available
- Consider focusing on B2B or enterprise—higher LTV, more mature fundraising
```

---

## Usage

### Basic Usage

```typescript
import {
  getRelevanceExplanation,
  getNextStepsExplanation,
  getPathPlanningExplanation,
  type UserProfile,
  type Program
} from './prompts/relevancePrompts'

// Define user and program
const userProfile: UserProfile = {
  stage: '1: Beginning and Cultivating',
  sectors: ['AI and Machine Learning'],
  constraints: ['funding', 'mentorship'],
  eligibility: 'Undergraduate'
}

const program: Program = {
  id: 'new-venture-challenge',
  name: 'New Venture Challenge (NVC)',
  description: 'Competition with cash prizes up to $325,000...',
  funding: '$325,000+ in prizes',
  eligibility: ['Undergraduate Students', 'Graduate Students'],
  opportunities: ['Funding and Financing', 'Mentorship and Advising']
}

// Generate explanation
const explanation = getRelevanceExplanation(program, userProfile)

// Send to Claude
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  system: explanation.systemPrompt,
  messages: [
    {
      role: 'user',
      content: explanation.userPrompt
    }
  ]
})

console.log(response.content[0].text)
```

### In React Components

```typescript
import { getRelevanceExplanation } from './prompts/relevancePrompts'

function ProgramCard({ program, userProfile }) {
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  const handleShowRelevance = async () => {
    setLoading(true)
    const prompt = getRelevanceExplanation(program, userProfile)
    
    // Call your API endpoint
    const response = await fetch('/api/explain-relevance', {
      method: 'POST',
      body: JSON.stringify(prompt)
    })
    
    const data = await response.json()
    setExplanation(data.explanation)
    setLoading(false)
  }

  return (
    <div>
      <h3>{program.name}</h3>
      <p>{program.description}</p>
      <button onClick={handleShowRelevance} disabled={loading}>
        Why This Program?
      </button>
      {explanation && <p className="highlight">{explanation}</p>}
    </div>
  )
}
```

---

## Relevance Dimensions

The system considers multiple dimensions when personalizing explanations:

### 1. Entrepreneurial Stage

```
1: Beginning and Cultivating      → Exploration, learning, ideation
2: Conceiving and Exploring       → Validation, problem understanding
3: Building and Testing           → Prototyping, MVP development
4: Launching and Growing          → Fundraising, scaling, growth
```

### 2. User Sectors

20 industry sectors from AI/ML to Arts & Culture. Programs are tagged by sector to enable precise matching.

### 3. Constraints & Needs

Eight primary constraints:
- **funding** — Need capital (grants, prizes, investor connections)
- **mentorship** — Need advisor guidance and experienced founders
- **prototyping** — Need maker space, equipment, or design resources
- **legal** — Need IP strategy, patent help, or incorporation advice
- **networking** — Need to meet other founders, investors, or partners
- **space** — Need physical workspace or lab access
- **team** — Need co-founder or team member connections
- **research-commercialization** — Need to spin out lab discoveries

### 4. Program Attributes

Each program is characterized by:
- **Opportunities**: What services/support it provides
- **Sectors**: Which industries it serves
- **Pathways**: Which entrepreneurial stages it supports
- **Funding**: Prize money or grants available
- **Eligibility**: Who can participate (students, faculty, etc.)
- **Timeline**: When it runs (year-round, seasonal, rolling)

---

## Relevance Matching Logic

The prompt templates implement implicit matching:

1. **Constraint → Opportunity**: If user needs "funding", prioritize programs offering "Funding and Financing"
2. **Sector → Sector**: If user is in "Biotech", highlight biotech-focused programs
3. **Stage → Pathways**: If user is in "Building and Testing", show programs designed for that stage
4. **Eligibility**: Acknowledge if user is at boundary (e.g., "as a Faculty member, you have access to...")
5. **Timeline**: Note if program's season matches user's urgency

---

## Testing

The test file (`src/prompts/relevancePrompts.test.ts`) includes:

### 5 Comprehensive Demonstrations
1. Why This Program (single program)
2. Next Steps (career progression)
3. Path Planning (complete journey)
4. Variant: Faculty Researcher (different user type)
5. Variant: Hardware Founder (constraint-focused)

### 6 Unit Tests
1. Relevance explanation generates all required fields
2. Next steps prompt includes program names
3. Path planning includes user context
4. Format function produces correctly structured output
5. Mock prompt generator returns all three types
6. Prompts are customizable by sector

**Run tests:**
```bash
npm test -- src/prompts/relevancePrompts.test.ts
```

**Run demonstrations:**
```bash
ts-node src/prompts/relevancePrompts.test.ts
```

---

## Integration Points

### With Discovery Modal

```typescript
import { DiscoveryModal } from './DiscoveryModal'
import { getRelevanceExplanation } from './prompts/relevancePrompts'

function App() {
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [relevanceExplanation, setRelevanceExplanation] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const handleProgramSelect = async (program: Program) => {
    if (userProfile) {
      const explanation = getRelevanceExplanation(program, userProfile)
      // Send to Claude and get response
      const response = await getRelevanceFromClaude(explanation)
      setRelevanceExplanation(response)
    }
  }

  return (
    <>
      <DiscoveryModal
        stage={userProfile?.stage}
        onSelectProgram={handleProgramSelect}
      />
      {relevanceExplanation && (
        <div className="relevance-card">{relevanceExplanation}</div>
      )}
    </>
  )
}
```

### As API Endpoint

```typescript
// pages/api/explain-relevance.ts
export async function POST(req: Request) {
  const { program, userProfile } = await req.json()

  const explanation = getRelevanceExplanation(program, userProfile)

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 512,
    system: explanation.systemPrompt,
    messages: [
      {
        role: 'user',
        content: explanation.userPrompt
      }
    ]
  })

  return Response.json({
    explanation: message.content[0].type === 'text' ? message.content[0].text : ''
  })
}
```

---

## Customization

### Modify System Prompt

Edit the system prompt strings in each function to change tone, emphasis, or instructions:

```typescript
// In getRelevanceExplanation()
const systemPrompt = `You are a startup advisor at CU Boulder...
// Customize this string to change LLM behavior
```

### Add New Constraints

Update the `Constraint` type union to include new needs:

```typescript
export type Constraint =
  | 'funding'
  | 'mentorship'
  | 'prototyping'
  | 'legal'
  | 'networking'
  | 'space'
  | 'team'
  | 'research-commercialization'
  | 'pitch-coaching'
  | 'market-validation'
  | 'your-new-constraint'  // Add here
```

### Add New Sectors

Expand the `Sector` type:

```typescript
export type Sector =
  | 'AI and Machine Learning'
  | 'Biotech'
  // ... existing sectors ...
  | 'Your New Sector'  // Add here
```

---

## Design Principles

1. **Conciseness**: Explanations are 1-2 sentences, not essays
2. **Specificity**: Connect program features to user's situation, not generic advice
3. **Respect Eligibility**: Never recommend programs the user can't access
4. **Build Momentum**: Path planning shows progression, not random ordering
5. **Actionable**: Focus on "what to do next", not just "what you could do"
6. **Sector-Aware**: Highlight programs particularly strong in user's sector
7. **Honest**: Acknowledge competition, effort, and likelihood of success

---

## Next Steps for Integration

1. **Connect to Discovery Modal**: Wire `getRelevanceExplanation()` into program card click handlers
2. **Create API Endpoint**: Build `/api/explain-relevance` endpoint in `worker.ts`
3. **Add Follow-up UI**: Show relevance explanation in expanded card or modal
4. **Test with Real Users**: Gather feedback on explanation quality and accuracy
5. **Expand Mock Programs**: Add all 80 CU programs to test suite
6. **Track Usefulness**: Log which explanations are most helpful (A/B test variants)

---

## Files

- **Core**: `/src/prompts/relevancePrompts.ts` (700 lines, fully typed)
- **Tests**: `/src/prompts/relevancePrompts.test.ts` (400 lines, 6 unit tests + 5 demos)
- **Integration**: Hook into `DiscoveryModal.tsx` or create `/api/explain-relevance` endpoint
- **Types**: All TypeScript interfaces defined, no external type dependencies

---

## Version

- Version: 1.0
- Created: July 14, 2024
- TypeScript: 4.0+
- Claude API: 3.5 Sonnet or later

---

## Questions?

See embedded JSDoc comments in `relevancePrompts.ts` for additional guidance on each function.
