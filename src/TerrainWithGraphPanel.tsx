import React, { useState, useCallback } from 'react'
import './TerrainWithGraphPanel.css'
import RidgelineVisualization from './RidgelineVisualization'
import InteractiveGraph from './InteractiveGraph'
import { CorpusLoader } from './CorpusLoader'

interface TerrainWithGraphPanelProps {
  userProfile?: any
  onStageChange?: (stage: 'idea' | 'validation' | 'prototype' | 'launching') => void
  onQuery?: (query: string) => void
}

const TerrainWithGraphPanel: React.FC<TerrainWithGraphPanelProps> = ({
  userProfile,
  onStageChange,
  onQuery
}) => {
  const [selectedProgram, setSelectedProgram] = useState<any>(null)
  const [activeStage, setActiveStage] = useState(0)

  const handleStageClick = useCallback((stageIndex: number) => {
    setActiveStage(stageIndex)
    const stages: Array<'idea' | 'validation' | 'prototype' | 'launching'> = [
      'idea',
      'validation',
      'prototype',
      'launching'
    ]
    onStageChange?.(stages[stageIndex])
  }, [onStageChange])

  const handleNodeSelect = useCallback((node: any) => {
    if (node.type === 'program') {
      // Find the full program object from corpus
      const allPrograms = CorpusLoader.getDefaultDocuments()
      const program = allPrograms.find(p => p.metadata.name === node.label)
      setSelectedProgram(program)
    }
  }, [])

  return (
    <div className="terrain-with-graph-panel">
      {/* Left Sidebar: Resource Graph */}
      <aside className="graph-sidebar">
        <InteractiveGraph
          userProfile={userProfile}
          onSelectNode={handleNodeSelect}
        />
      </aside>

      {/* Center: Terrain Visualization */}
      <main className="terrain-main">
        <RidgelineVisualization
          userProfile={userProfile}
          onStageChange={handleStageClick}
        />
      </main>

      {/* Right Panel: Selected Program Details */}
      {selectedProgram && (
        <aside className="program-details-panel">
          <button
            className="close-details"
            onClick={() => setSelectedProgram(null)}
            aria-label="Close program details"
          >
            ×
          </button>

          <div className="details-content">
            <h3 className="program-name">{selectedProgram.metadata.name}</h3>

            <div className="program-meta">
              {selectedProgram.metadata.season && (
                <span className="season-badge">
                  {(selectedProgram.metadata.season || [])[0]}
                </span>
              )}
            </div>

            {selectedProgram.metadata.description && (
              <p className="program-description">
                {selectedProgram.metadata.description}
              </p>
            )}

            {selectedProgram.metadata.opportunities && (
              <div className="opportunities-section">
                <h4>Opportunities</h4>
                <div className="opportunities-list">
                  {selectedProgram.metadata.opportunities.map((opp: string) => (
                    <span key={opp} className="opportunity-tag">
                      {opp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedProgram.metadata.sectors && (
              <div className="sectors-section">
                <h4>Sectors</h4>
                <div className="sectors-list">
                  {selectedProgram.metadata.sectors.map((sector: string) => (
                    <span key={sector} className="sector-tag">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedProgram.metadata.pathways && (
              <div className="pathways-section">
                <h4>Relevant Stages</h4>
                <ul className="pathways-list">
                  {selectedProgram.metadata.pathways.map((pathway: string) => (
                    <li key={pathway}>{pathway}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="learn-more-btn"
              onClick={() => onQuery?.(`Tell me more about ${selectedProgram.metadata.name}`)}
            >
              Ask about this program
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}

export default TerrainWithGraphPanel
