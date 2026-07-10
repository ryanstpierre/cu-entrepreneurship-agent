// Cloudflare Worker for CU Entrepreneurship Agent
// Deploy with: wrangler deploy
// Supports both local llama-server and Anthropic API

import Anthropic from '@anthropic-ai/sdk'

const getClient = (env: any) => {
  const localClaudeUrl = env.LOCAL_CLAUDE_URL || 'http://localhost:9090/v1'
  const useLocal = env.USE_LOCAL_CLAUDE === 'true'

  if (useLocal) {
    // Use local llama-server (OpenAI-compatible API)
    return {
      isLocal: true,
      baseURL: localClaudeUrl,
      apiKey: 'local'
    }
  } else {
    // Use Anthropic API
    return {
      isLocal: false,
      client: new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    }
  }
}

const KNOWLEDGE_BASE = `
You are an expert advisor for CU Boulder's entrepreneurship ecosystem. Help users navigate 80+ startup programs.

KEY PROGRAMS:
- New Venture Challenge: $325K+ in prizes, open to all CU students
- Deming Center for Entrepreneurship: One-stop hub in Leeds School of Business
- Venture Partners at CU Boulder: Support for university-originated startups
- Catalyze CU: Summer accelerator for engineering startups
- ATLAS Institute: Design and technology programs
- Idea Forge: Prototyping space in engineering
- Boulder Venture Club: Student networking community
- Entrepreneurial Law Clinic: Free legal support for startups

STAGES:
1. Beginning & Cultivating - Explore ideas, learn fundamentals
2. Conceiving & Exploring - Validate ideas, understand markets
3. Building & Testing - Prototype, get feedback
4. Launching & Growing - Raise capital, scale

OPPORTUNITIES:
- Funding & Financing
- Mentorship & Advising
- Entrepreneurial Training
- IP Support
- Prototyping
- Team Building & Networking

SECTORS COVERED:
AI/ML, Biotech, Hardware, Aerospace, Cybersecurity, EdTech, Fintech, Climate/Sustainability, Food & Ag, Health & Wellness, Quantum, Smart Cities, Social Enterprise, Arts & Culture

Source: https://www.colorado.edu/innovate/on-campus-resources
`

interface AgentRequest {
  query: string
  userType?: 'student' | 'faculty' | 'staff' | 'community' | 'coordinator'
}

interface AgentResponse {
  response: string
  programs: string[]
  nextSteps: string[]
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // CORS headers for preflight
    if (request.method === 'OPTIONS') {
      return new globalThis.Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    // Health check endpoint
    if (request.method === 'GET' && new URL(request.url).pathname === '/') {
      return new globalThis.Response(JSON.stringify({ status: 'ok', message: 'CU Entrepreneurship Agent is running' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    if (request.method !== 'POST') {
      return new globalThis.Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    try {
      const { query, userType = 'student' } = (await request.json()) as AgentRequest

      const systemPrompt = `
${KNOWLEDGE_BASE}

You are helping a ${userType} navigate CU Boulder's entrepreneurship resources.

When responding:
1. Understand their stage and needs
2. Recommend 2-3 most relevant programs
3. Explain why each program is a good fit
4. Provide specific next steps (contact info, website, deadline)
5. Connect related programs that work together

Be encouraging, specific, and practical. Format responses in clear sections.
`

      const inference = getClient(env)
      let response = ''

      if (inference.isLocal) {
        // Call local llama-server (OpenAI-compatible format)
        const localResponse = await fetch(`${inference.baseURL}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'local',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: query }
            ],
            max_tokens: 1024,
            temperature: 0.7
          })
        })

        const data = (await localResponse.json()) as any
        response = data.choices?.[0]?.message?.content || ''
      } else {
        // Use Anthropic API
        const message = await inference.client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: query
            }
          ]
        })

        response = message.content[0].type === 'text' ? message.content[0].text : ''
      }

      // Extract programs mentioned
      const programPatterns = [
        'Deming Center',
        'New Venture Challenge',
        'Venture Partners',
        'Catalyze CU',
        'ATLAS',
        'Idea Forge',
        'Boulder Venture Club',
        'Law Clinic'
      ]

      const mentionedPrograms = programPatterns.filter(prog =>
        response.toLowerCase().includes(prog.toLowerCase())
      )

      return new globalThis.Response(
        JSON.stringify({
          response,
          programs: mentionedPrograms,
          nextSteps: [
            'Visit https://www.colorado.edu/innovate/on-campus-resources',
            'Contact Deming Center: deming@colorado.edu',
            'Join Boulder Venture Club (CU Boulder Campus, Fall/Spring)'
          ]
        } as AgentResponse),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    } catch (error) {
      console.error(error)
      return new globalThis.Response('Error processing request', { status: 500 })
    }
  }
}

