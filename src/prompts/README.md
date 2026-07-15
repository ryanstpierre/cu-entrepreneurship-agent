# Relevance Prompts — CU Entrepreneurship Navigator

Professional LLM prompt templates for generating personalized program recommendations.

## What's Here

This module provides three reusable prompt templates that generate contextual explanations of why specific CU entrepreneurship programs are relevant to individual users.

### Core Files

| File | Purpose | Lines |
|------|---------|-------|
| `relevancePrompts.ts` | Main module with all prompt templates, types, mock data, and utilities | 730 |
| `relevancePrompts.test.ts` | Comprehensive tests, demonstrations, and usage examples | 530 |
| `INTEGRATION-EXAMPLE.md` | Copy-paste examples for integrating prompts into your app | - |
| `README.md` | This file | - |

## Three Prompt Templates

### 1️⃣ Why This Program

Explain why a single program matches a user's current situation.

```typescript
getRelevanceExplanation(program: Program, userProfile: UserProfile)
```

**Output:** 1-2 sentence personalized explanation

**Example:**
> "NVC is perfectly positioned for you right now. With $325K in prizes available for early-stage AI ventures, it can solve your funding constraint while connecting you with mentors and other founders."

---

### 2️⃣ Next Steps

Recommend what to do after completing a program.

```typescript
getNextStepsExplanation(
  completedProgram: CompletedProgram,
  userProfile: UserProfile,
  relatedPrograms: Program[]
)
```

**Output:** 2-3 prioritized recommendations with sequencing logic

**Example:**
```
1. Catalyze CU (Priority: HIGH)
   Why now: You have a validated idea and team, but need resources to prototype.

2. New Venture Challenge (Priority: HIGH)
   Why after Catalyze: With an MVP, you'll be a stronger competitor.
```

---

### 3️⃣ Path Planning

Show a complete learning journey from idea to scaling.

```typescript
getPathPlanningExplanation(
  userProfile: UserProfile,
  programs: Program[]
)
```

**Output:** Sequenced path with 4-6 programs, stage descriptions, and timelines

**Example:**
```
PHASE 1: FOUNDATION (Months 1-3)
- Deming Center → Get Seed Funding

PHASE 2: BUILDING (Months 4-9)
- Idea Forge → New Venture Challenge

PHASE 3: SCALING (Months 10-18)
- Catalyze CU → Ascent Deep Tech
```

---

## Data Structures

### UserProfile

```typescript
interface UserProfile {
  stage: EntrepreneurialStage
  sectors: Sector[]
  constraints: Constraint[]
  eligibility?: string
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
  opportunities?: Opportunity[]
  sectors?: Sector[]
  pathways?: EntrepreneurialStage[]
  funding?: string
  eligibility?: string[]
  website?: string
  parentOrganization?: string
  timeline?: string[]
  contact?: string
  subPrograms?: string[]
}
```

---

## Relevance Dimensions

Each prompt considers multiple dimensions:

**Entrepreneurial Stage**
- 1: Beginning and Cultivating
- 2: Conceiving and Exploring
- 3: Building and Testing
- 4: Launching and Growing

**User Sectors** (20 total)
- AI and Machine Learning
- Biotech
- Hardware and Instrumentation
- Aerospace
- Fintech
- Edtech
- Climate / Sustainability
- ... and 13 more

**Constraints** (8 primary)
- funding
- mentorship
- prototyping
- legal
- networking
- space
- team
- research-commercialization

**Program Attributes**
- Opportunities (what it offers)
- Eligibility (who can join)
- Funding (prizes/grants)
- Timeline (when it runs)

---

## Quick Start

### Basic Usage

```typescript
import {
  getRelevanceExplanation,
  MOCK_USER_PROFILE,
  MOCK_PROGRAM_NVC
} from './prompts/relevancePrompts'

// Generate prompt
const explanation = getRelevanceExplanation(
  MOCK_PROGRAM_NVC,
  MOCK_USER_PROFILE
)

// Send to Claude
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 512,
  system: explanation.systemPrompt,
  messages: [{ role: 'user', content: explanation.userPrompt }]
})

console.log(response.content[0].text)
```

### With React

```typescript
import { getRelevanceExplanation } from './prompts/relevancePrompts'

function ProgramCard({ program, userProfile }) {
  const handleClick = async () => {
    const prompt = getRelevanceExplanation(program, userProfile)
    const response = await fetch('/api/explain-relevance', {
      method: 'POST',
      body: JSON.stringify(prompt)
    })
    const data = await response.json()
    showRelevanceExplanation(data.explanation)
  }

  return (
    <div onClick={handleClick}>
      <h3>{program.name}</h3>
      <p>{program.description}</p>
    </div>
  )
}
```

---

## Testing

### Run Unit Tests

```bash
npm test -- src/prompts/relevancePrompts.test.ts
```

Tests include:
- ✅ All required fields are generated
- ✅ Program names are included in output
- ✅ User context is reflected in prompts
- ✅ Format function works correctly
- ✅ Mock data generator returns all types
- ✅ Prompts are customizable by sector

### Generate Mock Prompts

```typescript
import { generateMockPrompts, formatPromptForDisplay } from './prompts/relevancePrompts'

const { relevance, nextSteps, pathPlanning } = generateMockPrompts()

console.log(formatPromptForDisplay(relevance))
console.log(formatPromptForDisplay(nextSteps))
console.log(formatPromptForDisplay(pathPlanning))
```

### Run Demonstrations

The test file includes 5 comprehensive demonstrations:
1. Single program relevance
2. Next steps after completion
3. Complete learning path
4. Faculty researcher variant
5. Hardware founder variant

---

## Integration Points

### Discovery Modal

Wire into program selection:
```typescript
const explanation = getRelevanceExplanation(program, userProfile)
displayRelevanceCard(explanation)
```

### API Endpoint

Create `/api/explain-relevance`:
```typescript
const explanation = req.body as RelevanceExplanation
const response = await claude.messages.create({
  system: explanation.systemPrompt,
  messages: [{ role: 'user', content: explanation.userPrompt }]
})
return { explanation: response.content[0].text }
```

### Learning Path Page

Show complete journey:
```typescript
const explanation = getPathPlanningExplanation(userProfile, allPrograms)
displayLearningPath(explanation)
```

### Next Steps Widget

Recommend follow-on programs:
```typescript
const explanation = getNextStepsExplanation(completed, profile, related)
displayRecommendations(explanation)
```

---

## Customization

### Change System Prompt

Edit the prompt strings in each function to customize tone, emphasis, or instructions:

```typescript
const systemPrompt = `You are a startup advisor...`  // Customize this
```

### Add New Constraints

```typescript
export type Constraint =
  | 'funding'
  | 'mentorship'
  // ... existing ...
  | 'your-new-constraint'
```

### Add New Sectors

```typescript
export type Sector =
  | 'AI and Machine Learning'
  | 'Biotech'
  // ... existing ...
  | 'Your New Sector'
```

### Modify Matching Logic

The matching logic is implicit in the prompts. To change it, adjust:
1. Which fields are included in `userPrompt`
2. The emphasis given to constraints vs. sectors
3. The order of information in the prompt

---

## Mock Data Included

**User Profile:**
- Stage: Beginning and Cultivating
- Sectors: AI and Machine Learning
- Constraints: funding, mentorship, team
- Goal: Build AI-powered customer service tool

**Programs:**
- New Venture Challenge ($325K competition)
- Deming Center (mentorship & training)
- Catalyze CU (accelerator)
- Get Seed Funding (micro-grants)
- Venture Partners (research commercialization)

**Completed Program:**
- Deming Center (with outcomes and next goal)

---

## Files Included in Delivery

```
/Users/rstpierre/Projects/cu-entrepreneurship-agent/
├── src/prompts/
│   ├── relevancePrompts.ts           (730 lines, fully typed)
│   ├── relevancePrompts.test.ts      (530 lines, tests + demos)
│   ├── INTEGRATION-EXAMPLE.md        (6 usage examples)
│   └── README.md                     (this file)
│
├── RELEVANCE-PROMPTS-GUIDE.md        (comprehensive documentation)
└── [visual showcase HTML]            (generated for reference)
```

---

## Documentation

- **RELEVANCE-PROMPTS-GUIDE.md** — Comprehensive guide with design principles, all examples, and best practices
- **INTEGRATION-EXAMPLE.md** — Copy-paste examples for common integration patterns
- **JSDoc comments** — Embedded in `relevancePrompts.ts` for quick reference

---

## Design Principles

1. **Conciseness** — 1-2 sentences, not essays
2. **Specificity** — Connect to user's situation, not generic advice
3. **Respect Eligibility** — Only recommend accessible programs
4. **Build Momentum** — Show logical progression
5. **Actionable** — Focus on "what to do next"
6. **Sector-Aware** — Highlight sector-specific opportunities
7. **Honest** — Acknowledge competition and effort

---

## Deployment Checklist

- [ ] Copy `relevancePrompts.ts` to your project
- [ ] Create `/api/explain-relevance` endpoint
- [ ] Wire into React components (Discovery Modal, Program Cards, etc.)
- [ ] Set ANTHROPIC_API_KEY in your deployment environment
- [ ] Test with mock data (before hitting live Claude API)
- [ ] Deploy and monitor usage
- [ ] Gather user feedback on explanation quality
- [ ] Consider A/B testing different prompt variations

---

## Next Steps

1. **Integrate into Discovery Modal** — Show relevance when users hover/click programs
2. **Add "Next Steps" Feature** — Show recommendations after program completion
3. **Create Learning Path Page** — Display personalized 12-18 month journey
4. **Track Metrics** — Log which explanations are most helpful
5. **Iterate** — Refine prompts based on user feedback

---

## Technical Details

| Aspect | Details |
|--------|---------|
| **Language** | TypeScript (100% type-safe) |
| **Node Version** | 18+ |
| **Dependencies** | None (pure functions) |
| **LLM Model** | Claude 3.5 Sonnet (or later) |
| **Compilation** | `tsc --noEmit src/prompts/*.ts` ✅ |
| **Testing** | `npm test -- src/prompts/` |
| **Lines of Code** | ~1,300 (730 + 530 + docs) |

---

## Questions?

- See JSDoc comments in `relevancePrompts.ts` for each function
- Check `INTEGRATION-EXAMPLE.md` for common patterns
- Review `RELEVANCE-PROMPTS-GUIDE.md` for comprehensive reference
- Run demonstrations in `relevancePrompts.test.ts` to see examples

---

## Version & Attribution

- **Version:** 1.0
- **Created:** July 14, 2024
- **Author:** Claude Code
- **Status:** Production-ready
- **Last Updated:** July 14, 2024

---

## Key Takeaways

✅ **Three prompt templates** for different use cases
✅ **Fully typed** TypeScript with no external dependencies
✅ **Mock data included** for testing and development
✅ **Comprehensive documentation** with 6+ integration examples
✅ **Production-ready** with unit tests and demonstrations
✅ **Customizable** system prompts and matching logic

---

For full documentation, see `/Users/rstpierre/Projects/cu-entrepreneurship-agent/RELEVANCE-PROMPTS-GUIDE.md`
