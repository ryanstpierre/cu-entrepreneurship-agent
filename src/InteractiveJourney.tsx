import React, { useState } from 'react'
import './InteractiveJourney.css'

interface JourneyNode {
  id: string
  x: number
  y: number
  label: string
  type: 'start' | 'waypoint' | 'landmark' | 'destination'
  programs: Array<{ name: string; description: string; contact: string }>
  color: string
}

const InteractiveJourney = () => {
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const journeyMap: JourneyNode[] = [
    // START POINTS (left side)
    { id: 'idea', x: 50, y: 30, label: 'Have an Idea', type: 'start', color: '#FF6B6B',
      programs: [{ name: 'Idea Forge', description: 'Prototyping space', contact: 'ideaforge@colorado.edu' }] },
    { id: 'validation', x: 50, y: 50, label: 'Validating', type: 'start', color: '#4ECDC4',
      programs: [{ name: 'Boulder Venture Club', description: 'Student networking', contact: 'bvc@colorado.edu' }] },
    { id: 'prototype', x: 50, y: 70, label: 'Building MVP', type: 'start', color: '#45B7D1',
      programs: [{ name: 'ATLAS Institute', description: 'Design & tech', contact: 'atlas@colorado.edu' }] },
    { id: 'scaling', x: 50, y: 90, label: 'Ready to Scale', type: 'start', color: '#96CEB4',
      programs: [{ name: 'Accelerators', description: 'Growth programs', contact: 'accelerate@colorado.edu' }] },

    // WAYPOINTS (middle)
    { id: 'mentorship', x: 35, y: 40, label: 'Mentorship', type: 'waypoint', color: '#FFEAA7',
      programs: [
        { name: 'Deming Center', description: 'One-stop hub', contact: 'deming@colorado.edu' },
        { name: 'Venture Partners', description: 'Mentors & network', contact: 'vp@colorado.edu' }
      ] },
    { id: 'market-fit', x: 40, y: 60, label: 'Product-Market Fit', type: 'waypoint', color: '#DDA15E',
      programs: [{ name: 'Catalyze CU', description: 'Summer program', contact: 'catalyze@colorado.edu' }] },
    { id: 'funding', x: 35, y: 80, label: 'Funding Stage', type: 'waypoint', color: '#BC6C25',
      programs: [
        { name: 'New Venture Challenge', description: '$325K+ in prizes', contact: 'nvc@colorado.edu' },
        { name: 'Get Seed Funding', description: 'Seed round support', contact: 'seed@colorado.edu' }
      ] },

    // LANDMARKS (various sectors)
    { id: 'biotech', x: 65, y: 35, label: 'Biotech Path', type: 'landmark', color: '#8B5A8E',
      programs: [{ name: 'Ascent Deep Tech', description: 'Biotech focus', contact: 'ascent@colorado.edu' }] },
    { id: 'hardware', x: 70, y: 55, label: 'Hardware', type: 'landmark', color: '#5D576B',
      programs: [{ name: 'Lab Venture Challenge', description: 'Lab tech support', contact: 'lab@colorado.edu' }] },
    { id: 'ai-ml', x: 75, y: 75, label: 'AI/ML', type: 'landmark', color: '#3D3D3D',
      programs: [{ name: 'Embark Deep Tech', description: 'Deep tech support', contact: 'embark@colorado.edu' }] },
    { id: 'legal', x: 60, y: 90, label: 'Legal Support', type: 'landmark', color: '#6C757D',
      programs: [{ name: 'Entrepreneurial Law Clinic', description: 'Free legal help', contact: 'law@colorado.edu' }] },

    // IP & LICENSING
    { id: 'ip', x: 55, y: 45, label: 'IP & Patents', type: 'waypoint', color: '#F4A261',
      programs: [
        { name: 'Silicon Flatirons', description: 'IP/Tech law', contact: 'sf@colorado.edu' },
        { name: 'Invention Disclosure', description: 'Patent support', contact: 'patents@colorado.edu' }
      ] },

    // DESTINATIONS (right side)
    { id: 'startup', x: 90, y: 40, label: '🚀 Launch Startup', type: 'destination', color: '#FF6B6B',
      programs: [{ name: 'Founded Company', description: 'Your venture begins', contact: 'your-startup@startup.com' }] },
    { id: 'partnership', x: 90, y: 70, label: '🤝 Company Partnership', type: 'destination', color: '#4ECDC4',
      programs: [{ name: 'License Tech', description: 'Partner with existing company', contact: 'partners@colorado.edu' }] },
    { id: 'growth', x: 90, y: 90, label: '📈 Scale & Exit', type: 'destination', color: '#96CEB4',
      programs: [{ name: 'Mature Venture', description: 'Growth stage', contact: 'growth@colorado.edu' }] }
  ]

  const connections = [
    // Start to Mentorship
    { from: 'idea', to: 'mentorship' },
    { from: 'validation', to: 'mentorship' },
    { from: 'prototype', to: 'market-fit' },
    { from: 'scaling', to: 'funding' },

    // Mentorship paths
    { from: 'mentorship', to: 'ip' },
    { from: 'mentorship', to: 'market-fit' },

    // Market fit to sectors
    { from: 'market-fit', to: 'biotech' },
    { from: 'market-fit', to: 'hardware' },
    { from: 'market-fit', to: 'ai-ml' },

    // IP to funding
    { from: 'ip', to: 'funding' },

    // Funding to destinations
    { from: 'funding', to: 'startup' },
    { from: 'funding', to: 'partnership' },

    // Sector paths to destinations
    { from: 'biotech', to: 'startup' },
    { from: 'hardware', to: 'partnership' },
    { from: 'ai-ml', to: 'growth' },
    { from: 'legal', to: 'startup' }
  ]

  return (
    <div className="journey-container">
      <div className="journey-header">
        <h1>🏔️ Your CU Entrepreneurship Journey Map</h1>
        <p>Explore multiple paths from idea to impact. Click any landmark for details.</p>
      </div>

      <svg className="journey-map" viewBox="0 0 1000 600">
        {/* Background terrain */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#E3F2FD', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#F5F5F5', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="1000" height="600" fill="url(#skyGradient)" />

        {/* Mountain terrain pattern */}
        <g className="terrain" opacity="0.1">
          <path d="M 0 400 Q 200 200 400 300 T 800 250 L 1000 400 L 1000 600 L 0 600 Z" fill="#8B7355" />
        </g>

        {/* Connections */}
        {connections.map((conn, idx) => {
          const from = journeyMap.find(n => n.id === conn.from)
          const to = journeyMap.find(n => n.id === conn.to)
          return from && to ? (
            <line
              key={`conn-${idx}`}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              className="journey-path"
              stroke="#CCC"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          ) : null
        })}

        {/* Journey nodes */}
        {journeyMap.map(node => (
          <g
            key={node.id}
            className={`journey-node ${node.type} ${hoveredNode === node.id ? 'hovered' : ''} ${selectedNode?.id === node.id ? 'selected' : ''}`}
            onClick={() => setSelectedNode(node)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Node circle */}
            <circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="40"
              fill={node.color}
              stroke="#333"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
            />

            {/* Node label */}
            <text
              x={`${node.x}%`}
              y={`${node.y}%`}
              textAnchor="middle"
              dominantBaseline="middle"
              className="node-label"
              fontSize="14"
              fontWeight="bold"
              fill="#333"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item"><span className="dot" style={{ backgroundColor: '#FF6B6B' }}></span> Starting Point</div>
        <div className="legend-item"><span className="dot" style={{ backgroundColor: '#FFEAA7' }}></span> Waypoint</div>
        <div className="legend-item"><span className="dot" style={{ backgroundColor: '#8B5A8E' }}></span> Sector Path</div>
        <div className="legend-item"><span className="dot" style={{ backgroundColor: '#4ECDC4' }}></span> Destination</div>
      </div>

      {/* Detail panel */}
      {selectedNode && (
        <div className="detail-panel">
          <button className="close-btn" onClick={() => setSelectedNode(null)}>×</button>
          <h2>{selectedNode.label}</h2>
          <div className="programs-list">
            {selectedNode.programs.map((prog, idx) => (
              <div key={idx} className="program-card">
                <h3>{prog.name}</h3>
                <p>{prog.description}</p>
                <p className="contact">📧 {prog.contact}</p>
              </div>
            ))}
          </div>
          <button className="cta-btn">Get More Info</button>
        </div>
      )}
    </div>
  )
}

export default InteractiveJourney
