import React, { useState, useMemo } from 'react'
import './ResourcesPanel.css'
import { CorpusLoader } from './CorpusLoader'

interface ResourcesPanelProps {
  stage?: 'idea' | 'validation' | 'prototype' | 'launching'
  onQuery?: (query: string) => void
  loading?: boolean
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

const ResourcesPanel: React.FC<ResourcesPanelProps> = ({ stage, onQuery, loading }) => {
  const [input, setInput] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null)

  const programs = useMemo(() => {
    if (!stage) return []

    const allPrograms = CorpusLoader.getDefaultDocuments()
    const targetPathway = stageToPathway[stage]

    // Filter by stage/pathway
    const filtered = allPrograms.filter(doc => {
      const pathways = doc.metadata.pathways || []
      return pathways.includes(targetPathway)
    })

    return filtered
  }, [stage])

  const opportunities = useMemo(() => {
    const allOps = new Set<string>()
    programs.forEach(p => {
      (p.metadata.opportunities || []).forEach(op => allOps.add(op))
    })
    return Array.from(allOps).sort()
  }, [programs])

  const handleSend = () => {
    if (!input.trim()) return
    onQuery?.(input)
    setInput('')
  }

  if (!stage) {
    return (
      <div className="resources-panel empty-state">
        <div className="empty-content">
          <p className="empty-icon">🏔️</p>
          <p className="empty-text">Click a stage on the mountain to explore resources</p>
        </div>
      </div>
    )
  }

  return (
    <div className="resources-panel">
      <div className="panel-header">
        <h3>Resources for: <span className="stage-highlight">{stageLabel[stage]}</span></h3>
        <p className="panel-subtitle">{programs.length} opportunities available</p>
      </div>

      <div className="panel-content">
        <div className="opportunities-grid">
          {opportunities.map(opp => (
            <button
              key={opp}
              className={`opportunity-badge ${selectedOpportunity === opp ? 'active' : ''}`}
              onClick={() => setSelectedOpportunity(selectedOpportunity === opp ? null : opp)}
            >
              {opp}
            </button>
          ))}
        </div>

        <div className="programs-list">
          {programs
            .filter(p => !selectedOpportunity || (p.metadata.opportunities || []).includes(selectedOpportunity))
            .map(p => (
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

      <div className="panel-footer">
        <div className="input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask about resources for ${stageLabel[stage].toLowerCase()}...`}
            disabled={loading}
            className="follow-up-input"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="send-btn"
          >
            {loading ? '...' : '→'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResourcesPanel
