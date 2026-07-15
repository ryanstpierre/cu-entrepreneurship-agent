/**
 * Test and Demonstration of Relevance Prompts
 *
 * This file shows:
 * 1. How to use the three prompt generators
 * 2. Example outputs for each prompt type
 * 3. Sample LLM responses (simulated)
 * 4. Edge cases and customization
 */

import {
  getRelevanceExplanation,
  getNextStepsExplanation,
  getPathPlanningExplanation,
  generateMockPrompts,
  formatPromptForDisplay,
  MOCK_USER_PROFILE,
  MOCK_PROGRAM_NVC,
  MOCK_PROGRAM_DEMING,
  MOCK_RELATED_PROGRAMS,
  MOCK_COMPLETED_PROGRAM,
  type UserProfile,
  type Program
} from './relevancePrompts'

// ============================================================================
// DEMONSTRATION: PROMPT GENERATION & SAMPLE OUTPUTS
// ============================================================================

/**
 * DEMO 1: Why This Program - Single Program Relevance
 *
 * User: Undergrad with AI startup idea, no funding/mentorship
 * Program: New Venture Challenge
 */
export function demo1_WhyThisProgram() {
  console.log('\n' + '='.repeat(80))
  console.log('DEMO 1: WHY THIS PROGRAM')
  console.log('='.repeat(80))

  const explanation = getRelevanceExplanation(
    MOCK_PROGRAM_NVC,
    MOCK_USER_PROFILE
  )

  console.log(formatPromptForDisplay(explanation))

  console.log('\n--- SAMPLE LLM RESPONSE ---\n')
  const sampleResponse = `
NVC is perfectly positioned for you right now. With $325K in prizes available for
early-stage AI ventures, it can solve your funding constraint while connecting you
with mentors and other founders—addressing both your immediate needs. The program
explicitly supports the "Building and Testing" stage, which is where you'll be once
you validate your customer service idea.
  `
  console.log(sampleResponse.trim())
}

/**
 * DEMO 2: Next Steps - Career Progression
 *
 * User: Just completed Deming Center, now ready to build
 * Shows logical progression to NVC and Catalyze
 */
export function demo2_NextSteps() {
  console.log('\n' + '='.repeat(80))
  console.log('DEMO 2: NEXT STEPS AFTER COMPLETING A PROGRAM')
  console.log('='.repeat(80))

  const updatedProfile: UserProfile = {
    ...MOCK_USER_PROFILE,
    stage: '3: Building and Testing',
    constraints: ['funding', 'prototyping'],
    specificGoal: 'Build MVP and raise pre-seed'
  }

  const explanation = getNextStepsExplanation(
    MOCK_COMPLETED_PROGRAM,
    updatedProfile,
    MOCK_RELATED_PROGRAMS
  )

  console.log(formatPromptForDisplay(explanation))

  console.log('\n--- SAMPLE LLM RESPONSE ---\n')
  const sampleResponse = `
Here's your recommended path forward:

1. **Catalyze CU** (Priority: HIGH, Timeline: 12 weeks)
   Why now: You have a validated idea and team, but need hardware/infrastructure to
   prototype. Catalyze's maker resources and investor network are designed for exactly
   this phase. They'll help you build the MVP that proves your concept works.

2. **New Venture Challenge Spring Round** (Priority: HIGH, Timeline: 6-9 months)
   Why after Catalyze: With a working prototype, you'll be a much stronger NVC
   competitor. Winning helps validate your business model and gives you capital for
   the next stage. Many NVC winners go on to Venture Partners support.

3. **Get Seed Funding Micro-Grants** (Priority: MEDIUM, Timeline: Rolling)
   Why in parallel: Apply for the $500-2K grants while building. These bridge
   early cash needs and don't require a perfect product—just a credible team.

Total estimated timeline: 6-9 months to have MVP + pre-seed capital.
  `
  console.log(sampleResponse.trim())
}

/**
 * DEMO 3: Path Planning - Full Learning Journey
 *
 * User: Fresh AI founder at "Idea" stage
 * Shows complete pathway from beginning through scaling
 */
export function demo3_PathPlanning() {
  console.log('\n' + '='.repeat(80))
  console.log('DEMO 3: COMPLETE LEARNING PATH')
  console.log('='.repeat(80))

  const allPrograms: Program[] = [
    MOCK_PROGRAM_DEMING,
    MOCK_PROGRAM_NVC,
    {
      id: 'idea-forge',
      name: 'Idea Forge',
      description:
        'Makerspace and design studio for rapid prototyping and hardware development.',
      opportunities: ['Prototyping'],
      sectors: ['Hardware and Instrumentation', 'AI and Machine Learning'],
      pathways: ['2: Conceiving and Exploring', '3: Building and Testing']
    },
    {
      id: 'catalyze-cu',
      name: 'Catalyze CU',
      description:
        'Accelerator program for deep tech and hardware startups. Provides mentorship, prototyping resources, and investor connections.',
      opportunities: [
        'Mentorship and Advising',
        'Prototyping',
        'Team Building and Networking'
      ],
      sectors: ['AI and Machine Learning', 'Hardware and Instrumentation'],
      pathways: ['3: Building and Testing', '4: Launching and Growing']
    },
    {
      id: 'ascent-deep-tech',
      name: 'Ascent Deep Tech',
      description:
        'Mentorship program connecting founders with experienced entrepreneurs in deep tech.',
      opportunities: [
        'Mentorship and Advising',
        'Funding and Financing',
        'Team Building and Networking'
      ],
      sectors: ['AI and Machine Learning', 'Biotech'],
      pathways: ['4: Launching and Growing']
    }
  ]

  const explanation = getPathPlanningExplanation(MOCK_USER_PROFILE, allPrograms)

  console.log(formatPromptForDisplay(explanation))

  console.log('\n--- SAMPLE LLM RESPONSE ---\n')
  const sampleResponse = `
Your AI founder journey at CU Boulder:

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

RECOMMENDED TIMELINE:
Start with Deming immediately (Fall or Spring). Parallel track Get Seed Funding. Hit
NVC in the spring (12 months in). Then Catalyze (18 months). You'll be fundraising
by month 12-15, well-positioned.
  `
  console.log(sampleResponse.trim())
}

/**
 * DEMO 4: Variant - Faculty Researcher Commercializing a Lab Breakthrough
 *
 * Shows how the prompts adapt for different user types
 */
export function demo4_VariantFacultyPath() {
  console.log('\n' + '='.repeat(80))
  console.log('DEMO 4: VARIANT - FACULTY RESEARCHER WITH LAB BREAKTHROUGH')
  console.log('='.repeat(80))

  const facultyProfile: UserProfile = {
    stage: '2: Conceiving and Exploring',
    sectors: ['Biotech'],
    constraints: [
      'mentorship',
      'legal',
      'research-commercialization',
      'funding'
    ],
    eligibility: 'Faculty',
    specificGoal:
      'Spin out biotech company from lab discovery; maintain research program'
  }

  const venturePartnersProgram: Program = {
    id: 'venture-partners',
    name: 'Venture Partners at CU Boulder',
    description:
      'Connects innovative research with experienced entrepreneurs to accelerate commercialization. Provides legal, business, and fundraising support for researchers.',
    opportunities: [
      'Mentorship and Advising',
      'Funding and Financing',
      'Intellectual Property (IP) Support',
      'Licensing and Industry Partnerships'
    ],
    sectors: ['Biotech', 'AI and Machine Learning', 'Advanced Materials'],
    pathways: ['2: Conceiving and Exploring', '3: Building and Testing'],
    eligibility: ['Faculty', 'Postdocs'],
    website: 'https://www.colorado.edu/venturepartners',
    parentOrganization: 'Innovation & Entrepreneurship Initiative'
  }

  const explanation = getRelevanceExplanation(venturePartnersProgram, facultyProfile)

  console.log(formatPromptForDisplay(explanation))

  console.log('\n--- SAMPLE LLM RESPONSE ---\n')
  const sampleResponse = `
Venture Partners is built specifically for your situation. They specialize in helping
faculty researchers navigate IP strategy, legal entity formation, and fundraising—all
without forcing you to leave your lab. They'll pair you with an experienced biotech
entrepreneur-in-residence who can handle the business side while you focus on science,
and their legal network covers patent strategy and licensing deals.
  `
  console.log(sampleResponse.trim())
}

/**
 * DEMO 5: Constraint-Focused Variant
 *
 * User with multiple specific constraints: no funding, no team, needs space
 */
export function demo5_ConstraintFocused() {
  console.log('\n' + '='.repeat(80))
  console.log('DEMO 5: CONSTRAINT-FOCUSED - HARDWARE FOUNDER, NEEDS SPACE')
  console.log('='.repeat(80))

  const hardwareProfile: UserProfile = {
    stage: '2: Conceiving and Exploring',
    sectors: ['Hardware and Instrumentation'],
    constraints: ['prototyping', 'mentorship', 'space'],
    eligibility: 'Graduate Student',
    hasTeam: true,
    hasFunding: false,
    specificGoal: 'Validate hardware design before fundraising'
  }

  const ideaForgeProgram: Program = {
    id: 'idea-forge',
    name: 'Idea Forge',
    description:
      'Makerspace and design studio for rapid prototyping and hardware development. Access to 3D printers, CNC machines, electronics lab, and design mentorship.',
    opportunities: ['Prototyping', 'Mentorship and Advising'],
    sectors: ['Hardware and Instrumentation', 'Aerospace'],
    pathways: ['2: Conceiving and Exploring', '3: Building and Testing'],
    eligibility: [
      'Undergraduate Students',
      'Graduate Students',
      'Faculty',
      'Community'
    ],
    website: 'https://www.colorado.edu/ideaforge',
    timeline: ['Year-Round']
  }

  const explanation = getRelevanceExplanation(ideaForgeProgram, hardwareProfile)

  console.log(formatPromptForDisplay(explanation))

  console.log('\n--- SAMPLE LLM RESPONSE ---\n')
  const sampleResponse = `
Idea Forge directly solves your immediate blocker: you need lab space to validate
your hardware design before investors will take you seriously. Beyond the 3D printers
and CNC access, their mentorship network includes hardware experts who've navigated
fundraising—they'll help you build the right prototype and story for pitch meetings.
  `
  console.log(sampleResponse.trim())
}

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Run all demonstrations
 */
export function runAllDemos() {
  try {
    demo1_WhyThisProgram()
    demo2_NextSteps()
    demo3_PathPlanning()
    demo4_VariantFacultyPath()
    demo5_ConstraintFocused()

    console.log('\n' + '='.repeat(80))
    console.log('ALL DEMONSTRATIONS COMPLETED SUCCESSFULLY')
    console.log('='.repeat(80))
  } catch (error) {
    console.error('Error running demonstrations:', error)
  }
}

/**
 * Unit tests for prompt generation
 */
export function runTests() {
  console.log('\n' + '='.repeat(80))
  console.log('RUNNING UNIT TESTS')
  console.log('='.repeat(80))

  let passCount = 0
  let failCount = 0

  // Test 1: Relevance explanation generates both prompts
  try {
    const explanation = getRelevanceExplanation(
      MOCK_PROGRAM_NVC,
      MOCK_USER_PROFILE
    )
    if (
      explanation.systemPrompt &&
      explanation.userPrompt &&
      explanation.context
    ) {
      console.log('✓ Test 1: Relevance explanation generates all required fields')
      passCount++
    } else {
      throw new Error('Missing fields')
    }
  } catch (e) {
    console.log('✗ Test 1 failed:', (e as Error).message)
    failCount++
  }

  // Test 2: Next steps explanation includes program names
  try {
    const explanation = getNextStepsExplanation(
      MOCK_COMPLETED_PROGRAM,
      MOCK_USER_PROFILE,
      MOCK_RELATED_PROGRAMS
    )
    const containsNVC = explanation.userPrompt.includes('New Venture Challenge')
    if (containsNVC) {
      console.log('✓ Test 2: Next steps prompt includes related programs')
      passCount++
    } else {
      throw new Error('Program names not included')
    }
  } catch (e) {
    console.log('✗ Test 2 failed:', (e as Error).message)
    failCount++
  }

  // Test 3: Path planning includes user profile context
  try {
    const explanation = getPathPlanningExplanation(
      MOCK_USER_PROFILE,
      [MOCK_PROGRAM_DEMING, MOCK_PROGRAM_NVC]
    )
    const includesStage = explanation.userPrompt.includes(
      MOCK_USER_PROFILE.stage
    )
    const includesSectors = explanation.userPrompt.includes(
      MOCK_USER_PROFILE.sectors[0]
    )
    if (includesStage && includesSectors) {
      console.log('✓ Test 3: Path planning includes user profile context')
      passCount++
    } else {
      throw new Error('User context not included')
    }
  } catch (e) {
    console.log('✗ Test 3 failed:', (e as Error).message)
    failCount++
  }

  // Test 4: Format function works
  try {
    const explanation = getRelevanceExplanation(
      MOCK_PROGRAM_NVC,
      MOCK_USER_PROFILE
    )
    const formatted = formatPromptForDisplay(explanation)
    if (
      formatted.includes('SYSTEM PROMPT') &&
      formatted.includes('USER PROMPT') &&
      formatted.includes('CONTEXT')
    ) {
      console.log('✓ Test 4: Format function produces correctly structured output')
      passCount++
    } else {
      throw new Error('Format missing sections')
    }
  } catch (e) {
    console.log('✗ Test 4 failed:', (e as Error).message)
    failCount++
  }

  // Test 5: generateMockPrompts returns all three types
  try {
    const { relevance, nextSteps, pathPlanning } = generateMockPrompts()
    if (relevance && nextSteps && pathPlanning) {
      console.log('✓ Test 5: generateMockPrompts returns all three prompt types')
      passCount++
    } else {
      throw new Error('Missing prompt type')
    }
  } catch (e) {
    console.log('✗ Test 5 failed:', (e as Error).message)
    failCount++
  }

  // Test 6: Prompts are customizable (sector-specific)
  try {
    const aiProfile: UserProfile = {
      ...MOCK_USER_PROFILE,
      sectors: ['AI and Machine Learning']
    }
    const bioProfile: UserProfile = {
      ...MOCK_USER_PROFILE,
      sectors: ['Biotech']
    }

    const aiPrompt = getRelevanceExplanation(MOCK_PROGRAM_NVC, aiProfile)
    const bioPrompt = getRelevanceExplanation(MOCK_PROGRAM_NVC, bioProfile)

    const aiIncludesAI = aiPrompt.userPrompt.includes('AI and Machine Learning')
    const bioIncludesBio = bioPrompt.userPrompt.includes('Biotech')

    if (aiIncludesAI && bioIncludesBio) {
      console.log('✓ Test 6: Prompts are sector-aware and customizable')
      passCount++
    } else {
      throw new Error('Sector customization not working')
    }
  } catch (e) {
    console.log('✗ Test 6 failed:', (e as Error).message)
    failCount++
  }

  console.log(
    `\n${passCount} passed, ${failCount} failed (${passCount}/${passCount + failCount})`
  )
  return failCount === 0
}

// ============================================================================
// EXPORT TEST RUNNER
// ============================================================================

if (typeof require !== 'undefined' && require.main === module) {
  console.log('Running relevancePrompts tests...\n')
  runTests()
  console.log('\n\nRunning demonstration prompts...\n')
  runAllDemos()
}
