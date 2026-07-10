import React, { useState, useEffect } from 'react'
import './InteractiveGraph.css'

interface Node {
  id: string
  label: string
  type: 'program' | 'stage' | 'sector' | 'opportunity'
  description: string
  metadata?: Record<string, string>
  x?: number
  y?: number
}

interface Link {
  source: string
  target: string
  label: string
}

interface InteractiveGraphProps {
  userProfile?: {
    stage?: string
    sectors?: string[]
    constraints?: string[]
  }
  onSelectNode?: (node: Node) => void
}

const InteractiveGraph = ({ userProfile, onSelectNode }: InteractiveGraphProps) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([])
  const [svgDimensions, setSvgDimensions] = useState({ width: 1200, height: 700 })

  // Sample knowledge graph — will be expanded with crawled data
  const allNodes: Node[] = [
    // Entry stages
    { id: 'idea', label: 'Have an Idea', type: 'stage', description: 'Early stage with concept' },
    { id: 'validate', label: 'Validating', type: 'stage', description: 'Testing market fit' },
    { id: 'build', label: 'Building MVP', type: 'stage', description: 'Creating prototype' },
    { id: 'launch', label: 'Launching', type: 'stage', description: 'Going to market' },

    // Core programs
    { id: 'deming', label: 'Deming Center', type: 'program', description: 'One-stop entrepreneurship hub' },
    { id: 'nvc', label: 'New Venture Challenge', type: 'program', description: '$325K in prizes' },
    { id: 'catalyze', label: 'Catalyze CU', type: 'program', description: 'Summer accelerator' },
    { id: 'forge', label: 'Idea Forge', type: 'program', description: 'Prototyping space' },
    { id: 'atlas', label: 'ATLAS Institute', type: 'program', description: 'Design & technology' },
    { id: 'vp', label: 'Venture Partners', type: 'program', description: 'Mentorship & network' },

    // Sectors
    { id: 'ai', label: 'AI/ML', type: 'sector', description: 'Artificial intelligence' },
    { id: 'biotech', label: 'Biotech', type: 'sector', description: 'Life sciences' },
    { id: 'hardware', label: 'Hardware', type: 'sector', description: 'Physical products' },
    { id: 'climate', label: 'Climate', type: 'sector', description: 'Sustainability' },

    // Resources/Opportunities
    { id: 'funding', label: 'Funding', type: 'opportunity', description: 'Capital & grants' },
    { id: 'mentorship', label: 'Mentorship', type: 'opportunity', description: 'Expert guidance' },
    { id: 'workspace', label: 'Workspace', type: 'opportunity', description: 'Office & lab space' },
    { id: 'network', label: 'Network', type: 'opportunity', description: 'Connections' },
  ]

  const links: Link[] = [
    // Stage → Program flows
    { source: 'idea', target: 'deming', label: 'starts' },
    { source: 'idea', target: 'forge', label: 'explores' },
    { source: 'validate', target: 'vp', label: 'seeks' },
    { source: 'build', target: 'atlas', label: 'designs' },
    { source: 'launch', target: 'nvc', label: 'competes' },

    // Program → Opportunities
    { source: 'deming', target: 'mentorship', label: 'provides' },
    { source: 'deming', target: 'network', label: 'enables' },
    { source: 'nvc', target: 'funding', label: 'awards' },
    { source: 'catalyze', target: 'funding', label: 'grants' },
    { source: 'forge', target: 'workspace', label: 'offers' },

    // Sector pathways
    { source: 'ai', target: 'atlas', label: 'specializes' },
    { source: 'biotech', target: 'deming', label: 'supported' },
    { source: 'hardware', target: 'forge', label: 'works-in' },
    { source: 'climate', target: 'catalyze', label: 'eligible' },
  ]

  // Position nodes using force-directed simulation
  useEffect(() => {
    const positioned = positionNodes(allNodes, links)
    let filtered = positioned

    // Filter based on user profile
    if (userProfile?.stage) {
      const stageNode = positioned.find(n => n.id === userProfile.stage)
      if (stageNode) {
        // Include stage and connected nodes
        const connectedIds = new Set<string>([stageNode.id])
        links.forEach(link => {
          if (link.source === stageNode.id) connectedIds.add(link.target)
          if (link.target === stageNode.id) connectedIds.add(link.source)
        })
        filtered = positioned.filter(n => connectedIds.has(n.id) || n.type === 'program' || n.type === 'opportunity')
      }
    }

    if (userProfile?.sectors && userProfile.sectors.length > 0) {
      const sectorIds = new Set(userProfile.sectors)
      const connectedToSectors = new Set<string>()
      links.forEach(link => {
        if (sectorIds.has(link.source)) connectedToSectors.add(link.target)
        if (sectorIds.has(link.target)) connectedToSectors.add(link.source)
      })
      filtered = positioned.filter(n =>
        userProfile.sectors?.includes(n.label) || connectedToSectors.has(n.id) || n.type === 'program'
      )
    }

    setFilteredNodes(filtered.length > 0 ? filtered : positioned)
  }, [userProfile])

  const positionNodes = (nodes: Node[], links: Link[]): Node[] => {
    // Simple force-directed positioning
    const positioned = nodes.map(node => ({
      ...node,
      x: Math.random() * 1000 + 100,
      y: Math.random() * 600 + 50
    }))

    // Multiple iterations of force-directed simulation
    for (let iter = 0; iter < 50; iter++) {
      positioned.forEach((node, i) => {
        let fx = 0, fy = 0

        // Repulsion from other nodes
        positioned.forEach((other, j) => {
          if (i !== j) {
            const dx = (node.x ?? 0) - (other.x ?? 0)
            const dy = (node.y ?? 0) - (other.y ?? 0)
            const dist = Math.sqrt(dx * dx + dy * dy) + 1
            const repulsion = 100 / (dist * dist)
            fx += (dx / dist) * repulsion
            fy += (dy / dist) * repulsion
          }
        })

        // Attraction to linked nodes
        links.forEach(link => {
          if (link.source === node.id || link.target === node.id) {
            const other = positioned.find(n => n.id === (link.source === node.id ? link.target : link.source))
            if (other) {
              const dx = (other.x ?? 0) - (node.x ?? 0)
              const dy = (other.y ?? 0) - (node.y ?? 0)
              const dist = Math.sqrt(dx * dx + dy * dy) + 1
              const attraction = dist / 200
              fx += (dx / dist) * attraction * 0.5
              fy += (dy / dist) * attraction * 0.5
            }
          }
        })

        // Apply forces with damping
        if (node.x !== undefined && node.y !== undefined) {
          node.x += fx * 0.1
          node.y += fy * 0.1

          // Bounds checking
          node.x = Math.max(50, Math.min(svgDimensions.width - 50, node.x))
          node.y = Math.max(50, Math.min(svgDimensions.height - 50, node.y))
        }
      })
    }

    return positioned
  }

  const getNodeColor = (node: Node) => {
    const colors: Record<string, string> = {
      program: '#667eea',
      stage: '#ff9f43',
      sector: '#26de81',
      opportunity: '#ee5a6f'
    }
    return colors[node.type] || '#999'
  }

  const getNodeSize = (node: Node) => {
    const sizes: Record<string, number> = {
      program: 35,
      stage: 28,
      sector: 28,
      opportunity: 28
    }
    return sizes[node.type] || 25
  }

  return (
    <div className="interactive-graph-container">
      <div className="graph-header">
        <h2>🌐 Explore the Ecosystem</h2>
        <p>Click any node to learn more. Nodes are connected by opportunity and resource flows.</p>
      </div>

      <div className="graph-canvas">
        <svg width="100%" height="100%" viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}>
          <defs>
            <linearGradient id="graphBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f8f9fa', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f0f4f8', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          <rect width={svgDimensions.width} height={svgDimensions.height} fill="url(#graphBg)" />

          {/* Links */}
          {links.map((link, i) => {
            const sourceNode = filteredNodes.find(n => n.id === link.source)
            const targetNode = filteredNodes.find(n => n.id === link.target)
            if (!sourceNode || !targetNode) return null

            return (
              <g key={`link-${i}`} opacity={0.3}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#ccc"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
              </g>
            )
          })}

          {/* Nodes */}
          {filteredNodes.map(node => (
            <g
              key={node.id}
              className={`graph-node ${selectedNode?.id === node.id ? 'selected' : ''} ${hoveredNode === node.id ? 'hovered' : ''}`}
              onClick={() => {
                setSelectedNode(node)
                onSelectNode?.(node)
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={getNodeSize(node)}
                fill={getNodeColor(node)}
                opacity={hoveredNode === node.id || selectedNode?.id === node.id ? 1 : 0.8}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="node-label"
                fontSize="11"
                fontWeight="600"
                fill="white"
              >
                {node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="graph-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#667eea' }}></div>
          <span>Program</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#ff9f43' }}></div>
          <span>Stage</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#26de81' }}></div>
          <span>Sector</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#ee5a6f' }}></div>
          <span>Opportunity</span>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <div className="graph-detail-panel">
          <button className="close-panel" onClick={() => setSelectedNode(null)}>×</button>
          <h3>{selectedNode.label}</h3>
          <div className="detail-badge">{selectedNode.type}</div>
          <p>{selectedNode.description}</p>

          {/* Show related items */}
          <div className="related-items">
            <h4>Connected to:</h4>
            <ul>
              {links
                .filter(link => link.source === selectedNode.id || link.target === selectedNode.id)
                .map((link, i) => (
                  <li key={i}>
                    {link.label} → {link.source === selectedNode.id ? link.target : link.source}
                  </li>
                ))}
            </ul>
          </div>

          <button className="action-btn">Learn More</button>
        </div>
      )}
    </div>
  )
}

export default InteractiveGraph
