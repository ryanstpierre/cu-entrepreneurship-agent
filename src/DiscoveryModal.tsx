import React, { useState, useMemo, useEffect } from 'react'
import './DiscoveryModal.css'
import { CorpusLoader } from './CorpusLoader'
import { useSemanticSearch } from './useSemanticSearch'

interface FilterState {
  sector?: string
  funding?: string
  eligibility?: string
  timeline?: string
}

interface DiscoveryModalProps {
  stage?: 'idea' | 'validation' | 'prototype' | 'launching'
  isOpen: boolean
  onClose: () => void
  onQuery: (query: string) => void
  loading?: boolean
  onFilterChange?: (filters: FilterState) => void
}

const stageToPathway = {
  'idea': '1: Beginning and Cultivating',
  'validation': '2: Conceiving and Exploring',
  'prototype': '3: Building and Testing',
  'launching': '4: Launching and Growing'
}

const stageLabel = {
  'idea': 'Have an Idea',
  'validation': 'Validate',
  'prototype': 'Build the MVP',
  'launching': 'Find Mentorship'
}

const EXAMPLE_PROMPTS = [
  { category: 'Funding', prompts: ['Show me non-dilutive funding', 'What grants are available?', 'Find pre-seed funding'] },
  { category: 'Space', prompts: ['Where can I prototype?', 'Maker spaces near campus', 'Lab access for hardware'] },
  { category: 'Mentorship', prompts: ['Connect me with AI mentors', 'Find biotech advisors', 'Serial entrepreneur mentors'] },
  { category: 'Network', prompts: ['Investor pitch events', 'Meet other founders', 'Industry partnerships'] }
]

const SECTORS = ['AI', 'Biotech', 'Hardware', 'Climate', 'FinTech', 'EdTech']
const FUNDING_RANGES = ['Under $10K', '$10K-$50K', '$50K+', 'Non-dilutive']
const ELIGIBILITY = ['Students', 'Faculty', 'Alums', 'Community']
const TIMELINES = ['Year-Round', 'Summer Only', 'Rolling', 'Annual']

const DiscoveryModal: React.FC<DiscoveryModalProps> = ({ stage, isOpen, onClose, onQuery, loading, onFilterChange }) => {
  const [input, setInput] = useState('')
  const [filters, setFilters] = useState<FilterState>({})
  const [showPrompts, setShowPrompts] = useState(true)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const { search } = useSemanticSearch()

  const programs = useMemo(() => {
    if (!stage) return []
    const allPrograms = CorpusLoader.getDefaultDocuments()
    const targetPathway = stageToPathway[stage]

    return allPrograms.filter(doc => {
      const pathways = doc.metadata.pathways || []
      const matchesStage = pathways.includes(targetPathway)

      if (!matchesStage) return false

      if (filters.sector && !doc.metadata.sectors?.includes(filters.sector)) return false
      if (filters.eligibility) {
        const eligStr = (doc.metadata.metadata || '').toLowerCase()
        if (!eligStr.includes(filters.eligibility.toLowerCase())) return false
      }

      return true
    })
  }, [stage, filters])

  const opportunities = useMemo(() => {
    const allOps = new Set<string>()
    programs.forEach(p => {
      (p.metadata.opportunities || []).forEach(op => allOps.add(op))
    })
    return Array.from(allOps).sort()
  }, [programs])

  // Real-time search preview
  useEffect(() => {
    if (!input.trim()) {
      setSearchResults([])
      return
    }

    const debounce = setTimeout(async () => {
      try {
        const results = await search(input, 3)
        setSearchResults(results.map(r => r.document))
      } catch (err) {
        console.warn('Search failed:', err)
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [input, search])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value === 'all' ? undefined : value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleSend = () => {
    if (!input.trim()) return
    onQuery(input)
    setInput('')
    setShowPrompts(false)
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
    setTimeout(() => onQuery(prompt), 0)
  }

  if (!isOpen || !stage) return null

  return (
    <div className="discovery-modal-overlay" onClick={onClose}>
      <div className="discovery-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-title">
            <h2>Resources for: <span className="stage-highlight">{stageLabel[stage]}</span></h2>
            <p className="header-subtitle">{programs.length} opportunities available</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Filters */}
        <div className="filters-row">
          <select
            value={filters.sector || 'all'}
            onChange={(e) => handleFilterChange('sector', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Sectors</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filters.funding || 'all'}
            onChange={(e) => handleFilterChange('funding', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Funding</option>
            {FUNDING_RANGES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <select
            value={filters.eligibility || 'all'}
            onChange={(e) => handleFilterChange('eligibility', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Eligibility</option>
            {ELIGIBILITY.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <select
            value={filters.timeline || 'all'}
            onChange={(e) => handleFilterChange('timeline', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Timelines</option>
            {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Main Content */}
        <div className="modal-content">
          {/* Input + Search Preview */}
          <div className="search-section">
            <div className="input-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Ask about resources for ${stageLabel[stage].toLowerCase()}...`}
                disabled={loading}
                className="search-input"
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="search-btn"
              >
                {loading ? '...' : '→'}
              </button>
            </div>

            {/* Search Preview */}
            {input.trim() && searchResults.length > 0 && (
              <div className="search-preview">
                <p className="preview-label">Matching programs:</p>
                <div className="preview-items">
                  {searchResults.map(result => (
                    <div key={result.metadata.name} className="preview-item">
                      {result.metadata.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prompt Gallery or Programs List */}
          {showPrompts && !input.trim() ? (
            <div className="prompts-gallery">
              <p className="gallery-label">Try asking:</p>
              {EXAMPLE_PROMPTS.map(group => (
                <div key={group.category} className="prompt-group">
                  <p className="group-label">{group.category}</p>
                  <div className="prompts-list">
                    {group.prompts.map(prompt => (
                      <button
                        key={prompt}
                        className="prompt-btn"
                        onClick={() => handlePromptClick(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="programs-section">
              <div className="programs-list">
                {programs.map(p => (
                  <div key={p.metadata.name} className="program-item">
                    <div className="program-header">
                      <h4>{p.metadata.name}</h4>
                      <span className="program-season">{(p.metadata.season || ['Year-Round'])[0]}</span>
                    </div>
                    <p className="program-desc">{p.metadata.description}</p>
                    <div className="program-tags">
                      {(p.metadata.opportunities || []).slice(0, 2).map(op => (
                        <span key={op} className="tag">{op}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiscoveryModal
