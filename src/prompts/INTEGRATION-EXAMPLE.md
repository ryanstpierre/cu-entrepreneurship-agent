# Integration Examples — Relevance Prompts

Quick examples of how to integrate the three relevance prompt templates into your CU Entrepreneurship Navigator app.

## Example 1: React Component Integration

```typescript
// In your program card component
import { getRelevanceExplanation } from './prompts/relevancePrompts'
import type { UserProfile, Program } from './prompts/relevancePrompts'

function ProgramCard({ program, userProfile }: { program: Program; userProfile: UserProfile }) {
  const [explanation, setExplanation] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleExplainRelevance = async () => {
    setLoading(true)
    try {
      // Generate the prompt
      const prompt = getRelevanceExplanation(program, userProfile)

      // Call your API endpoint
      const response = await fetch('/api/explain-relevance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
      })

      const data = await response.json()
      setExplanation(data.explanation)
    } catch (error) {
      console.error('Failed to get explanation:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="program-card">
      <h3>{program.name}</h3>
      <p>{program.description}</p>

      <button onClick={handleExplainRelevance} disabled={loading}>
        {loading ? 'Loading...' : 'Why This Program?'}
      </button>

      {explanation && (
        <div className="explanation-highlight">
          <strong>Why it's relevant:</strong> {explanation}
        </div>
      )}
    </div>
  )
}
```

## Example 2: API Endpoint (worker.ts)

```typescript
// In worker.ts or your API routes file
import { getRelevanceExplanation, getNextStepsExplanation, getPathPlanningExplanation } from './prompts/relevancePrompts'
import type { RelevanceExplanation } from './prompts/relevancePrompts'

export async function explainRelevance(req: Request): Promise<Response> {
  try {
    const body = await req.json() as RelevanceExplanation

    // Send to Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 512,
        system: body.systemPrompt,
        messages: [
          {
            role: 'user',
            content: body.userPrompt
          }
        ]
      })
    })

    const data = await response.json() as any

    return new Response(
      JSON.stringify({
        explanation: data.content[0]?.text || ''
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Add route handler
router.post('/api/explain-relevance', explainRelevance)
```

## Example 3: Discovery Modal Integration

```typescript
// In DiscoveryModal.tsx
import { getRelevanceExplanation } from './prompts/relevancePrompts'
import type { UserProfile } from './prompts/relevancePrompts'

interface DiscoveryModalProps {
  stage?: 'idea' | 'validation' | 'prototype' | 'launching'
  userProfile?: UserProfile
  isOpen: boolean
  onClose: () => void
}

const stageToPathway = {
  'idea': '1: Beginning and Cultivating',
  'validation': '2: Conceiving and Exploring',
  'prototype': '3: Building and Testing',
  'launching': '4: Launching and Growing'
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
  stage,
  userProfile,
  isOpen,
  onClose
}) => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [relevanceExplanation, setRelevanceExplanation] = useState('')

  const handleSelectProgram = async (program: Program) => {
    if (!userProfile) return

    setSelectedProgram(program)

    // Generate relevance explanation
    const prompt = getRelevanceExplanation(program, userProfile)

    try {
      const response = await fetch('/api/explain-relevance', {
        method: 'POST',
        body: JSON.stringify(prompt)
      })
      const data = await response.json()
      setRelevanceExplanation(data.explanation)
    } catch (error) {
      console.error('Failed to load explanation:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* ... modal content ... */}

      <ProgramList>
        {programs.map(program => (
          <ProgramItem
            key={program.id}
            program={program}
            onClick={() => handleSelectProgram(program)}
          />
        ))}
      </ProgramList>

      {selectedProgram && relevanceExplanation && (
        <RelevanceCard>
          <h4>Why {selectedProgram.name}?</h4>
          <p>{relevanceExplanation}</p>
        </RelevanceCard>
      )}
    </Modal>
  )
}
```

## Example 4: Next Steps Feature

```typescript
// When showing "What's next?" recommendations
import { getNextStepsExplanation } from './prompts/relevancePrompts'
import type { CompletedProgram, UserProfile, Program } from './prompts/relevancePrompts'

async function showNextStepsRecommendations(
  completedProgram: CompletedProgram,
  updatedUserProfile: UserProfile,
  availablePrograms: Program[]
) {
  const prompt = getNextStepsExplanation(
    completedProgram,
    updatedUserProfile,
    availablePrograms
  )

  const response = await fetch('/api/explain-relevance', {
    method: 'POST',
    body: JSON.stringify(prompt)
  })

  const data = await response.json()

  // Display the recommendations
  return {
    title: `What's Next After ${completedProgram.name}?`,
    recommendations: data.explanation
  }
}
```

## Example 5: Path Planning Feature

```typescript
// Show complete learning path for a new user
import { getPathPlanningExplanation } from './prompts/relevancePrompts'
import type { UserProfile, Program } from './prompts/relevancePrompts'

async function generateLearningPath(
  userProfile: UserProfile,
  allPrograms: Program[]
) {
  const prompt = getPathPlanningExplanation(userProfile, allPrograms)

  const response = await fetch('/api/explain-relevance', {
    method: 'POST',
    body: JSON.stringify(prompt)
  })

  const data = await response.json()

  return {
    title: 'Your Entrepreneurship Journey at CU Boulder',
    path: data.explanation,
    userProfile: userProfile
  }
}
```

## Example 6: Testing Your Integration

```typescript
// Quick test of your integration
import { generateMockPrompts, formatPromptForDisplay } from './prompts/relevancePrompts'

function testIntegration() {
  // Generate mock prompts
  const { relevance, nextSteps, pathPlanning } = generateMockPrompts()

  // Log formatted prompts
  console.log('=== RELEVANCE PROMPT ===')
  console.log(formatPromptForDisplay(relevance))

  console.log('\n=== NEXT STEPS PROMPT ===')
  console.log(formatPromptForDisplay(nextSteps))

  console.log('\n=== PATH PLANNING PROMPT ===')
  console.log(formatPromptForDisplay(pathPlanning))

  // In your app, these would be sent to Claude API
}

// Run in development
if (import.meta.hot) {
  testIntegration()
}
```

## Step-by-Step Integration

### 1. Copy prompt files to your project

```bash
cp src/prompts/relevancePrompts.ts your-project/src/prompts/
cp src/prompts/relevancePrompts.test.ts your-project/src/prompts/  # Optional
```

### 2. Create API endpoint

Add to your `worker.ts` or API routes:
- Accept POST requests to `/api/explain-relevance`
- Extract systemPrompt and userPrompt from request
- Call Claude API with these prompts
- Return explanation in response

### 3. Update React components

Import `getRelevanceExplanation` (or other templates) where needed:
- Program card click handlers
- Discovery modal program selection
- Next steps recommendations page
- Learning path visualization

### 4. Test with mock data

Use `generateMockPrompts()` to test your integration without hitting Claude API:
- See `relevancePrompts.test.ts` for examples
- Verify prompts are formatted correctly
- Test error handling

### 5. Deploy and monitor

- Deploy the API endpoint
- Add logging for prompt usage and Claude API calls
- Track user feedback on explanation quality
- A/B test different prompt variations if desired

## Configuration

### API Key

```typescript
// In your worker.ts or config
const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY // From your secrets

// Or use:
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
```

### Model Selection

```typescript
// Change the model being called
const model = 'claude-3-5-sonnet-20241022'  // Current recommendation

// Or try:
// 'claude-3-opus-20240229'      // For complex reasoning
// 'claude-3-haiku-20240307'     // For quick responses
```

### Token Limits

```typescript
// Adjust based on your needs
const max_tokens = 512  // For single explanations
// Increase to 1024-2048 for longer path planning responses
```

## Customization Tips

### Modify System Prompt Tone

```typescript
// Make it more formal
const systemPrompt = `You are a professional business advisor...`

// Or more casual
const systemPrompt = `You're a peer mentor helping founders...`
```

### Add Constraints

```typescript
export type Constraint =
  | 'funding'
  | 'mentorship'
  | 'prototyping'
  | 'legal'
  | 'networking'
  | 'space'
  | 'team'
  | 'your-new-constraint'  // Add here
```

### Add Sectors

```typescript
export type Sector =
  | 'AI and Machine Learning'
  | 'Biotech'
  // ... existing sectors ...
  | 'Your New Sector'
```

## Troubleshooting

### "Type 'X' is not assignable to type 'Sector'"

Make sure you're using exact sector names from the type definition. Check `relevancePrompts.ts` for the full list.

### "undefined explanation in response"

Check that:
1. API endpoint is returning `{ explanation: "..." }`
2. Claude API call is successful (check status code)
3. Response content is being extracted correctly

### "Prompts are too generic"

Fine-tune the system prompt to be more specific to your use case, or:
- Add more context to the user prompt
- Include specific program details
- Reference CU-specific context

## Next Steps

1. ✅ Copy `relevancePrompts.ts` to your project
2. ✅ Create API endpoint for Claude calls
3. ✅ Wire into React components
4. ✅ Test with mock data
5. ✅ Deploy and monitor
6. 📊 Track usage metrics
7. 🔄 Iterate based on user feedback

---

For more detailed documentation, see: `/Users/rstpierre/Projects/cu-entrepreneurship-agent/RELEVANCE-PROMPTS-GUIDE.md`
