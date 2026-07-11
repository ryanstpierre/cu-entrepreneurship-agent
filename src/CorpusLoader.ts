import type { EmbeddingDocument } from './EmbeddingsService'

interface Program {
  id: string
  name: string
  description: string
  category?: string
  sectors?: string[]
  stage?: string[]
  contact?: string
  website?: string
}

// Default corpus from knowledge base
const DEFAULT_CORPUS: Program[] = [
  {
    id: 'nvc',
    name: 'New Venture Challenge',
    description: 'Annual student entrepreneurship competition with $325K+ in prizes. Open to all CU students with early-stage startup ideas.',
    category: 'Funding & Prizes',
    sectors: ['AI', 'Biotech', 'Hardware', 'Climate', 'FinTech'],
    stage: ['Idea', 'Validation', 'Prototype']
  },
  {
    id: 'deming',
    name: 'Deming Center for Entrepreneurship',
    description: 'One-stop resource hub for student entrepreneurs. Offers mentorship, workshops, and business plan feedback.',
    category: 'Entrepreneurship Hub',
    sectors: ['All'],
    stage: ['Idea', 'Validation', 'Prototype', 'Launching']
  },
  {
    id: 'catalyze',
    name: 'Catalyze CU',
    description: 'Intensive 10-week summer accelerator program. Provides mentorship, curriculum, and seed funding ($15K-$50K) for teams.',
    category: 'Accelerator',
    sectors: ['AI', 'Climate', 'Hardware'],
    stage: ['Validation', 'Prototype', 'Launching']
  },
  {
    id: 'forge',
    name: 'Idea Forge',
    description: 'Maker space and prototyping lab. Access to 3D printers, laser cutters, electronics, and wood shop equipment.',
    category: 'Space & Resources',
    sectors: ['Hardware', 'Climate'],
    stage: ['Idea', 'Prototype']
  },
  {
    id: 'atlas',
    name: 'ATLAS Institute',
    description: 'Design-centric innovation hub. Cross-disciplinary environment for tech + design projects. Offers courses and partnerships.',
    category: 'Design & Innovation',
    sectors: ['AI', 'Hardware', 'EdTech'],
    stage: ['Prototype', 'Launching']
  },
  {
    id: 'vp',
    name: 'Venture Partners at CU',
    description: 'Student-led venture fund investing in CU startups. Provides capital, mentorship, and network access to promising teams.',
    category: 'Funding & Mentorship',
    sectors: ['AI', 'Biotech', 'FinTech'],
    stage: ['Validation', 'Launching', 'Scaling']
  },
  {
    id: 'tbdc',
    name: 'Technology Business Development Center',
    description: 'Connects CU innovations with industry. Supports licensing, commercialization, and IP development.',
    category: 'IP & Commercialization',
    sectors: ['Biotech', 'Hardware', 'AI'],
    stage: ['Prototype', 'Launching']
  },
  {
    id: 'business-plan',
    name: 'Business Plan Competition',
    description: 'Biannual competition for detailed business plans. Cash prizes, investor pitch opportunities, and media exposure.',
    category: 'Funding & Prizes',
    sectors: ['All'],
    stage: ['Validation', 'Prototype']
  },
  {
    id: 'cisab',
    name: 'CU Silicon Valley',
    description: 'Residential program in Silicon Valley. Immersive experience connecting CU entrepreneurs with SV investors and mentors.',
    category: 'Immersion Program',
    sectors: ['AI', 'FinTech'],
    stage: ['Prototype', 'Launching']
  },
  {
    id: 'grad-accelerator',
    name: 'Graduate Student Accelerator',
    description: 'Tailored program for graduate researchers and grad student founders. Emphasizes research commercialization.',
    category: 'Accelerator',
    sectors: ['Biotech', 'Hardware'],
    stage: ['Idea', 'Validation', 'Prototype']
  }
]

export class CorpusLoader {
  static stageToPathways(stages: string[]): string[] {
    const stageMap: Record<string, string> = {
      'Idea': '1: Beginning and Cultivating',
      'Validation': '2: Conceiving and Exploring',
      'Prototype': '3: Building and Testing',
      'Launching': '4: Launching and Growing',
      'Scaling': '4: Launching and Growing'
    }
    return stages.map(s => stageMap[s] || '').filter(Boolean)
  }

  static categoryToOpportunities(category: string): string[] {
    const categoryMap: Record<string, string[]> = {
      'Funding & Prizes': ['Funding and Financing'],
      'Entrepreneurship Hub': ['Entrepreneurial Training', 'Mentorship and Advising'],
      'Accelerator': ['Mentorship and Advising', 'Funding and Financing', 'Entrepreneurial Training'],
      'Space & Resources': ['Prototyping', 'Team Building and Networking'],
      'Design & Innovation': ['Prototyping', 'Entrepreneurial Training'],
      'Funding & Mentorship': ['Funding and Financing', 'Mentorship and Advising'],
      'IP & Commercialization': ['IP Support', 'Licensing and Industry Partnerships'],
      'Immersion Program': ['Mentorship and Advising', 'Team Building and Networking'],
      'Other': ['Entrepreneurial Training']
    }
    return categoryMap[category] || ['Entrepreneurial Training']
  }

  static convertToDocuments(programs: Program[]): EmbeddingDocument[] {
    return programs.map(program => {
      const pathways = this.stageToPathways(program.stage || [])
      const opportunities = this.categoryToOpportunities(program.category || 'Other')
      return {
        id: program.id,
        text: `${program.name}. ${program.description}${program.sectors ? ` Sectors: ${program.sectors.join(', ')}.` : ''}${program.stage ? ` Stages: ${program.stage.join(', ')}.` : ''}`,
        type: 'program',
        metadata: {
          name: program.name,
          category: program.category || 'Other',
          sectors: program.sectors?.join(',') || 'All',
          stage: program.stage?.join(',') || 'All',
          pathways: pathways,
          opportunities: opportunities,
          season: ['Year-Round'],
          description: program.description,
          website: program.website || '',
          contact: program.contact || ''
        }
      }
    })
  }

  static getDefaultCorpus(): Program[] {
    return DEFAULT_CORPUS
  }

  static getDefaultDocuments(): EmbeddingDocument[] {
    return this.convertToDocuments(DEFAULT_CORPUS)
  }

  static mergeCorpora(corpus1: Program[], corpus2: Program[]): Program[] {
    const combined = [...corpus1, ...corpus2]
    const uniqueById = new Map<string, Program>()

    combined.forEach(program => {
      uniqueById.set(program.id, program)
    })

    return Array.from(uniqueById.values())
  }
}
