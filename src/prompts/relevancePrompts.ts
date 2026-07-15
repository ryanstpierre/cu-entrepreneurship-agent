/**
 * Relevance Prompts for CU Entrepreneurship Navigator
 *
 * Generates personalized LLM prompts that explain program relevance to users
 * based on their specific context: stage, sectors, constraints, and goals.
 *
 * Three prompt templates:
 * 1. Why this program (single program relevance)
 * 2. Next steps (career progression after completing a program)
 * 3. Path planning (learning journey across multiple programs)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User's entrepreneurial journey stage
 */
export type EntrepreneurialStage =
  | '1: Beginning and Cultivating'
  | '2: Conceiving and Exploring'
  | '3: Building and Testing'
  | '4: Launching and Growing'

/**
 * Entrepreneurship constraint or need
 */
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

/**
 * Industry or domain sector
 */
export type Sector =
  | 'AI and Machine Learning'
  | 'Aerospace'
  | 'Advanced Materials'
  | 'Augmented Reality/Virtual Reality'
  | 'Biotech'
  | 'Civic Engagement and Government'
  | 'Cybersecurity'
  | 'Education Technology'
  | 'Environmentalism and Sustainability'
  | 'Fashion and Design'
  | 'Financial Technology (Fintech)'
  | 'Food and Agriculture'
  | 'Hardware and Instrumentation'
  | 'Health and Wellness'
  | 'Manufacturing'
  | 'Quantum'
  | 'Smart Cities'
  | 'Social Enterprise'
  | 'Sports and Recreation'
  | 'Arts and Culture'

/**
 * Opportunity or service type
 */
export type Opportunity =
  | 'Intellectual Property (IP) Support'
  | 'Entrepreneurial Training'
  | 'Mentorship and Advising'
  | 'Funding and Financing'
  | 'Licensing and Industry Partnerships'
  | 'Prototyping'
  | 'Team Building and Networking'

/**
 * User's profile and context
 */
export interface UserProfile {
  stage: EntrepreneurialStage
  sectors: Sector[]
  constraints: Constraint[]
  eligibility?: string // e.g., "Undergraduate", "Graduate", "Faculty"
  yearsOfExperience?: number
  hasTeam?: boolean
  hasFunding?: boolean
  specificGoal?: string
}

/**
 * Program or resource in the CU ecosystem
 */
export interface Program {
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

/**
 * Completed program with outcomes
 */
export interface CompletedProgram extends Program {
  completionDate?: string
  outcomes?: string[]
  nextGoal?: string
}

/**
 * Output structure for all prompts
 */
export interface RelevanceExplanation {
  systemPrompt: string
  userPrompt: string
  context: {
    stage: string
    sectors: string[]
    constraints: string[]
  }
}

// ============================================================================
// PROMPT TEMPLATE 1: WHY THIS PROGRAM
// ============================================================================

/**
 * Generate a prompt explaining why a specific program is relevant to a user
 *
 * This prompt is designed to be sent to Claude, which will generate a
 * personalized 1-2 sentence explanation of program relevance.
 *
 * @param program - The program to explain
 * @param userProfile - The user's stage, goals, sectors, and constraints
 * @returns Object containing system prompt, user prompt, and context
 */
export function getRelevanceExplanation(
  program: Program,
  userProfile: UserProfile
): RelevanceExplanation {
  const systemPrompt = `You are a startup advisor at CU Boulder, part of a team helping students and founders navigate the university's 80+ entrepreneurship resources.

Your task: Given a user's stage in their entrepreneurial journey, their sectors of interest, and their immediate constraints/needs, explain why a specific program or resource would be valuable to them.

Guidelines:
- Be specific to their situation, not generic
- Reference actual program features that match their needs
- Keep explanations to 1-2 sentences maximum
- Highlight the immediate value or next step forward
- Acknowledge eligibility and any timing considerations if relevant`

  const constraintsList = userProfile.constraints
    .map(c => c.replace(/-/g, ' '))
    .join(', ')

  const sectorsList = userProfile.sectors.join(', ')

  const userPrompt = `Here's the user's profile:
- Entrepreneurial Stage: ${userProfile.stage}
- Interested in Sectors: ${sectorsList}
- Immediate Needs/Constraints: ${constraintsList}
${userProfile.eligibility ? `- Eligibility: ${userProfile.eligibility}` : ''}
${userProfile.specificGoal ? `- Specific Goal: ${userProfile.specificGoal}` : ''}

Here's the program:
- Name: ${program.name}
- Description: ${program.description}
${program.opportunities ? `- Offers: ${program.opportunities.join(', ')}` : ''}
${program.sectors ? `- Sector Focus: ${program.sectors.join(', ')}` : ''}
${program.pathways ? `- Best for Stages: ${program.pathways.join(', ')}` : ''}
${program.funding ? `- Funding: ${program.funding}` : ''}
${program.website ? `- Website: ${program.website}` : ''}

Why is this program relevant to this user? Provide a brief, specific explanation (1-2 sentences) that connects the program directly to their current situation and needs.`

  return {
    systemPrompt,
    userPrompt,
    context: {
      stage: userProfile.stage,
      sectors: userProfile.sectors,
      constraints: userProfile.constraints
    }
  }
}

// ============================================================================
// PROMPT TEMPLATE 2: NEXT STEPS
// ============================================================================

/**
 * Generate a prompt for recommending next programs after program completion
 *
 * Helps users understand where to go next in their journey after completing
 * a program or reaching a milestone.
 *
 * @param completedProgram - The program or milestone just completed
 * @param userProfile - Updated user profile (may have advanced stage)
 * @param relatedPrograms - List of potential next programs to choose from
 * @returns Object containing system prompt, user prompt, and context
 */
export function getNextStepsExplanation(
  completedProgram: CompletedProgram,
  userProfile: UserProfile,
  relatedPrograms: Program[]
): RelevanceExplanation {
  const systemPrompt = `You are a career advisor for startup founders at CU Boulder. Your role is to help entrepreneurs understand the logical next steps in their journey.

When a founder completes a program or reaches a milestone, they face a critical decision: What should they do next?

Your task: Given what they've just completed, their current situation, and available programs, recommend 2-3 next steps in order of priority. Explain the reasoning for each.

Guidelines:
- Show progression and building momentum
- Account for what they've already learned
- Sequence programs to reduce redundancy
- Highlight dependencies (e.g., "Get Seed Funding is a good follow-up to Deming Center because...")
- Be honest about timeline and difficulty escalation
- Consider their sector and constraints when available`

  const constraintsList = userProfile.constraints
    .map(c => c.replace(/-/g, ' '))
    .join(', ')
  const sectorsList = userProfile.sectors.join(', ')

  const relatedProgramsList = relatedPrograms
    .map(p => `- ${p.name}: ${p.description}`)
    .join('\n')

  const userPrompt = `User just completed: "${completedProgram.name}"
${completedProgram.outcomes ? `\nOutcomes: ${completedProgram.outcomes.join(', ')}` : ''}

Current profile:
- Stage: ${userProfile.stage}
- Sectors: ${sectorsList}
- Needs: ${constraintsList}
${userProfile.specificGoal ? `- Next Goal: ${userProfile.specificGoal}` : ''}

Available next steps:
${relatedProgramsList}

What should this user do next, and in what order? Provide 2-3 specific recommendations with brief reasoning for the sequence.`

  return {
    systemPrompt,
    userPrompt,
    context: {
      stage: userProfile.stage,
      sectors: userProfile.sectors,
      constraints: userProfile.constraints
    }
  }
}

// ============================================================================
// PROMPT TEMPLATE 3: PATH PLANNING
// ============================================================================

/**
 * Generate a prompt for showing a learning journey across multiple programs
 *
 * Helps users understand a complete pathway from their current stage
 * through eventual scaling, with programs sequenced logically.
 *
 * @param userProfile - User's current stage, goals, sectors, constraints
 * @param programs - All available programs to choose from for the path
 * @returns Object containing system prompt, user prompt, and context
 */
export function getPathPlanningExplanation(
  userProfile: UserProfile,
  programs: Program[]
): RelevanceExplanation {
  const systemPrompt = `You are a strategy advisor for CU Boulder's entrepreneurship ecosystem. Your job is to help people understand the complete journey from "I have an idea" to "I'm scaling a business."

Your task: Given a founder's current stage, goals, and constraints, design a recommended learning path through CU's programs. Show progression, explain why each step prepares them for the next, and highlight the key transitions.

Guidelines:
- Programs should progress logically through the entrepreneurial stages
- Each program should build on or complement previous ones
- Highlight which programs are "must-do" vs. "optional based on sector"
- Show estimated timelines and effort (e.g., "3 months, 5 hrs/week")
- Explain the "why" of the sequence, not just the "what"
- Account for their specific sector and constraints
- Be realistic about competition and eligibility
- Suggest exit points or alternative paths when appropriate`

  const constraintsList = userProfile.constraints
    .map(c => c.replace(/-/g, ' '))
    .join(', ')
  const sectorsList = userProfile.sectors.join(', ')

  const programsList = programs
    .map(
      p =>
        `- ${p.name} (${p.pathways?.join(', ') || 'General'}): ${p.description}`
    )
    .join('\n')

  const userPrompt = `Founder Profile:
- Current Stage: ${userProfile.stage}
- Sectors: ${sectorsList}
- Main Constraints: ${constraintsList}
${userProfile.eligibility ? `- Eligibility: ${userProfile.eligibility}` : ''}
${userProfile.specificGoal ? `- Vision: ${userProfile.specificGoal}` : ''}

Available Programs (from CU Boulder):
${programsList}

Design a learning path for this founder. Show:
1. Recommended sequence of 4-6 programs
2. What they'll achieve at each stage
3. How each program prepares them for the next
4. Key transitions and decision points
5. Sector-specific considerations
6. Estimated total timeline and effort

Format as a numbered journey with brief explanations.`

  return {
    systemPrompt,
    userPrompt,
    context: {
      stage: userProfile.stage,
      sectors: userProfile.sectors,
      constraints: userProfile.constraints
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format a prompt for display or debugging
 * @param explanation - The RelevanceExplanation to format
 * @returns Formatted string with system and user prompts
 */
export function formatPromptForDisplay(explanation: RelevanceExplanation): string {
  return `SYSTEM PROMPT:
${explanation.systemPrompt}

---

USER PROMPT:
${explanation.userPrompt}

---

CONTEXT:
Stage: ${explanation.context.stage}
Sectors: ${explanation.context.sectors.join(', ')}
Constraints: ${explanation.context.constraints.join(', ')}`
}

// ============================================================================
// MOCK DATA FOR TESTING
// ============================================================================

export const MOCK_USER_PROFILE: UserProfile = {
  stage: '1: Beginning and Cultivating',
  sectors: ['AI and Machine Learning'],
  constraints: ['funding', 'mentorship', 'team'],
  eligibility: 'Undergraduate',
  hasTeam: false,
  hasFunding: false,
  specificGoal: 'Build and launch an AI-powered customer service tool'
}

export const MOCK_PROGRAM_NVC: Program = {
  id: 'new-venture-challenge',
  name: 'New Venture Challenge (NVC)',
  description:
    'Competition with cash prizes up to $325,000 supporting the pathway from beginning through growth stages. Open to all CU students.',
  opportunities: [
    'Funding and Financing',
    'Mentorship and Advising',
    'Team Building and Networking'
  ],
  sectors: [
    'AI and Machine Learning',
    'Biotech',
    'Hardware and Instrumentation'
  ],
  pathways: ['3: Building and Testing', '4: Launching and Growing'],
  funding: '$325,000+ in prizes',
  eligibility: ['Undergraduate Students', 'Graduate Students'],
  website: 'https://www.colorado.edu/nvc',
  parentOrganization: 'Innovation & Entrepreneurship Initiative',
  timeline: ['Fall', 'Spring']
}

export const MOCK_PROGRAM_DEMING: Program = {
  id: 'deming-center',
  name: 'Deming Center for Entrepreneurship',
  description:
    'One-stop shop for students, staff, faculty and community members interested in entrepreneurship. Provides courses, mentorship, funding, and community.',
  opportunities: [
    'Entrepreneurial Training',
    'Mentorship and Advising',
    'Funding and Financing',
    'Team Building and Networking'
  ],
  sectors: ['AI and Machine Learning', 'Biotech', 'Financial Technology (Fintech)'],
  pathways: ['1: Beginning and Cultivating', '2: Conceiving and Exploring'],
  funding: '$500 micro-grants available',
  eligibility: [
    'Undergraduate Students',
    'Graduate Students',
    'Faculty',
    'Staff'
  ],
  website: 'https://www.colorado.edu/business/deming',
  parentOrganization: 'Leeds School of Business',
  timeline: ['Fall', 'Spring'],
  subPrograms: [
    'Entrepreneurial Studies Certificate',
    'New Venture Launch Class',
    'Startups & Sandwiches'
  ]
}

export const MOCK_PROGRAM_CATALYZE: Program = {
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
  pathways: ['3: Building and Testing', '4: Launching and Growing'],
  eligibility: ['Undergraduate Students', 'Graduate Students', 'Faculty'],
  website: 'https://www.colorado.edu/catalyzecu',
  parentOrganization: 'Technology Ventures',
  timeline: ['Spring']
}

export const MOCK_COMPLETED_PROGRAM: CompletedProgram = {
  ...MOCK_PROGRAM_DEMING,
  completionDate: '2024-05-01',
  outcomes: [
    'Completed Entrepreneurial Studies Certificate',
    'Pitched to mentors weekly',
    'Built founding team of 3 people',
    'Validated market need with 50 customer interviews'
  ],
  nextGoal: 'Prepare to raise pre-seed funding'
}

export const MOCK_RELATED_PROGRAMS: Program[] = [
  MOCK_PROGRAM_NVC,
  MOCK_PROGRAM_CATALYZE,
  {
    id: 'venture-partners',
    name: 'Venture Partners at CU Boulder',
    description:
      'Connects innovative research with experienced entrepreneurs to accelerate commercialization.',
    opportunities: [
      'Mentorship and Advising',
      'Funding and Financing',
      'Intellectual Property (IP) Support'
    ],
    sectors: ['AI and Machine Learning', 'Biotech'],
    pathways: ['3: Building and Testing', '4: Launching and Growing'],
    eligibility: ['Faculty', 'Postdocs'],
    website: 'https://www.colorado.edu/venturepartners'
  },
  {
    id: 'get-seed-funding',
    name: 'Get Seed Funding',
    description:
      'Micro-grant program offering $500-$2,000 in non-dilutive funding for early-stage ideas.',
    opportunities: ['Funding and Financing'],
    sectors: [
      'AI and Machine Learning',
      'Biotech',
      'Hardware and Instrumentation',
      'Social Enterprise'
    ],
    pathways: ['1: Beginning and Cultivating', '2: Conceiving and Exploring'],
    funding: '$500-$2,000 per team',
    eligibility: ['Undergraduate Students', 'Graduate Students'],
    website: 'https://www.colorado.edu/get-seed-funding'
  }
]

// ============================================================================
// TESTING FUNCTION
// ============================================================================

/**
 * Generate and display all three prompt types with mock data
 * Useful for testing and demonstration
 */
export function generateMockPrompts(): {
  relevance: RelevanceExplanation
  nextSteps: RelevanceExplanation
  pathPlanning: RelevanceExplanation
} {
  const relevance = getRelevanceExplanation(
    MOCK_PROGRAM_NVC,
    MOCK_USER_PROFILE
  )

  const nextSteps = getNextStepsExplanation(
    MOCK_COMPLETED_PROGRAM,
    { ...MOCK_USER_PROFILE, stage: '3: Building and Testing' },
    MOCK_RELATED_PROGRAMS
  )

  const pathPlanning = getPathPlanningExplanation(
    MOCK_USER_PROFILE,
    [
      MOCK_PROGRAM_DEMING,
      MOCK_PROGRAM_NVC,
      MOCK_PROGRAM_CATALYZE,
      ...MOCK_RELATED_PROGRAMS.slice(0, 2)
    ]
  )

  return { relevance, nextSteps, pathPlanning }
}
