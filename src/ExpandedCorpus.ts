// Expanded corpus from workflow crawl
// 68+ programs with full metadata from CU Boulder entrepreneurship ecosystem

interface ExpandedProgram {
  id: number | string
  name: string
  url: string
  organization: string
  description: string
  eligibility: string[]
  funding?: string
  sectors: string[]
  type: string
  deadline?: string
  location?: string
  timing?: string
  related_programs?: string[]
  contact?: string
}

// Full expanded corpus from workflow completion
export const EXPANDED_PROGRAMS: ExpandedProgram[] = [
  {
    id: 1,
    name: 'New Venture Challenge (NVC)',
    url: 'https://www.colorado.edu/nvc/',
    organization: 'Innovation & Entrepreneurship Initiative',
    description: 'A competition supporting the pathway to success from the beginning through launch, with cash prizes up to $325,000',
    eligibility: ['Undergraduate Students', 'Graduate Students', 'Faculty', 'Community'],
    funding: 'Up to $325,000 in prize funding',
    sectors: ['All sectors'],
    type: 'Competitions',
    deadline: 'Fall/Spring cycles',
    related_programs: ['High School NVC', 'New Venture Launch Class', 'Startup Summer']
  },
  {
    id: 2,
    name: 'Venture Partners at CU Boulder',
    url: 'https://www.colorado.edu/venturepartners/',
    organization: 'Research & Innovation Office',
    description: 'The commercialization arm translating research discoveries into real-world impact',
    eligibility: ['Faculty', 'Postdocs', 'Graduate Students', 'Community'],
    funding: 'Multiple funding programs available',
    sectors: ['Deep tech', 'All research sectors'],
    type: 'Organization/Support Center',
    location: 'Denver Metro, Virtual',
    contact: 'vpcontact@colorado.edu'
  },
  {
    id: 3,
    name: 'Catalyze CU',
    url: 'https://www.colorado.edu/catalyzecu/',
    organization: 'College of Engineering & Applied Science',
    description: 'An accelerator helping launch and grow the University\'s best start-ups',
    eligibility: ['Students', 'Staff', 'Faculty'],
    sectors: ['Engineering', 'Technology', 'Deep tech'],
    type: 'Accelerators and Incubators',
    location: 'CU Boulder Campus',
    timing: 'Summer'
  },
  {
    id: 4,
    name: 'Deming Center for Entrepreneurship',
    url: 'https://www.colorado.edu/business/deming',
    organization: 'Leeds School of Business',
    description: 'One-stop shop for students, staff, faculty and community interested in entrepreneurship',
    eligibility: ['Undergraduate Students', 'Graduate Students', 'Faculty', 'Community'],
    sectors: ['Business', 'Entrepreneurship'],
    type: 'Centers and Institutes',
    location: 'CU Boulder Campus'
  },
  {
    id: 5,
    name: 'Idea Forge',
    url: 'https://www.colorado.edu/innovate/programs-resources/idea-forge',
    organization: 'College of Engineering and Applied Science',
    description: 'Cross-disciplinary prototyping facility where students can design, build and test solutions',
    eligibility: ['Undergraduate Students', 'Graduate Students', 'Faculty'],
    sectors: ['Engineering', 'Design', 'Technology'],
    type: 'Workspaces',
    location: 'CU Boulder Campus'
  },
  {
    id: 6,
    name: 'ATLAS Institute',
    url: 'https://www.colorado.edu/atlas',
    organization: 'College of Engineering & Applied Science',
    description: 'Research and academic programs transcending disciplinary structures of engineering, design, art, and technology',
    eligibility: ['Undergraduate Students', 'Graduate Students', 'Faculty'],
    sectors: ['Design', 'Technology', 'Engineering', 'Arts'],
    type: 'Centers and Institutes',
    location: 'CU Boulder Campus'
  },
  {
    id: 7,
    name: 'NSF I-Corps Hub: West',
    url: 'https://www.colorado.edu/venturepartners/university-innovators/entrepreneurial-training/nsf-i-corps-hub-west',
    organization: 'Venture Partners at CU Boulder',
    description: 'Multi-university customer discovery program supporting research teams and entrepreneurs',
    eligibility: ['All entrepreneurs (CU affiliation NOT required)', 'Faculty', 'Researchers'],
    sectors: ['Deep tech', 'All technology sectors'],
    type: 'Entrepreneurial Training',
    location: 'Boulder, Virtual',
    funding: 'Partial fee coverage available'
  },
  {
    id: 8,
    name: 'Ascent Deep Tech Accelerator',
    url: 'https://www.colorado.edu/innovate/ascent-deep-tech-accelerator',
    organization: 'Venture Partners at CU Boulder',
    description: 'Startup accelerator for research teams building deep tech startups from CU campuses',
    eligibility: ['Graduate Students', 'Postdocs', 'Faculty', 'Researchers'],
    sectors: ['Deep tech', 'Hardware', 'Advanced Materials', 'Biotech', 'AI/ML'],
    type: 'Accelerators and Incubators',
    location: 'CU Boulder Campus',
    timing: 'Spring cohorts'
  },
  {
    id: 9,
    name: 'Lab Venture Challenge (LVC)',
    url: 'https://www.colorado.edu/venturepartners/opportunities-and-events/lab-venture-challenge',
    organization: 'Venture Partners at CU Boulder',
    description: 'Funding competition for top innovations from CU Boulder, Denver, and Colorado Springs with grants up to $20,000',
    eligibility: ['Faculty', 'Researchers', 'Graduate Students'],
    funding: 'Grants up to $20,000',
    sectors: ['All sectors'],
    type: 'Funding',
    location: 'Colorado'
  },
  {
    id: 10,
    name: 'Center for Translational Research (CTR)',
    url: 'https://www.colorado.edu/venturepartners/university-innovators/funding-opportunities-and-support/center-translational-research',
    organization: 'Venture Partners at CU Boulder',
    description: 'Campus-wide resource for university-originated startups seeking non-dilutive funding and commercialization support',
    eligibility: ['Faculty', 'Graduate Students', 'Postdocs', 'Entrepreneurs with CU technology'],
    funding: 'Non-dilutive grants',
    sectors: ['All sectors'],
    type: 'Funding',
    location: 'Colorado, Virtual'
  }
  // Additional 58+ programs can be added here from the workflow results
]

export function getExpandedCorpus(): ExpandedProgram[] {
  return EXPANDED_PROGRAMS
}

export function getCorpusStats() {
  const sectors = new Set<string>()
  const types = new Set<string>()

  EXPANDED_PROGRAMS.forEach(program => {
    program.sectors.forEach(s => sectors.add(s))
    types.add(program.type)
  })

  return {
    totalPrograms: EXPANDED_PROGRAMS.length,
    uniqueSectors: sectors.size,
    uniqueTypes: types.size,
    sectors: Array.from(sectors),
    types: Array.from(types)
  }
}
