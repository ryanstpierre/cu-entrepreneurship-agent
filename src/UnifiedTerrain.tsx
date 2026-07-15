import React, { useState, useRef, useEffect } from 'react'
import './UnifiedTerrain.css'
import RidgelineVisualization from './RidgelineVisualization'
import { CorpusLoader } from './CorpusLoader'

interface ProgramNode {
  id: string
  name: string
  stage: number
  x: number
  y: number
  sectors: string[]
  opportunities: string[]
  season: string[]
  description: string
}

interface UnifiedTerrainProps {
  userProfile?: any
  onTrackChange?: (track: 'founder' | 'commercialization') => void
  onStageChange?: (stageIndex: number) => void
  onProgramSelect?: (program: any) => void
  onQuery?: (query: string) => void
}

const UnifiedTerrain: React.FC<UnifiedTerrainProps> = ({
  userProfile,
  onTrackChange,
  onStageChange,
  onProgramSelect,
  onQuery
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [programs, setPrograms] = useState<ProgramNode[]>([])
  const [selectedProgram, setSelectedProgram] = useState<ProgramNode | null>(null)
  const [hoveredProgram, setHoveredProgram] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Load programs and compute waypoint positions
  useEffect(() => {
    const allPrograms = CorpusLoader.getDefaultDocuments()
    const stageMap = {
      '1: Beginning and Cultivating': 0,
      '2: Conceiving and Exploring': 1,
      '3: Building and Testing': 2,
      '4: Launching and Growing': 3
    }

    const programNodes: ProgramNode[] = allPrograms.map((doc, idx) => {
      const pathways = doc.metadata.pathways || []
      const stage = Object.entries(stageMap).find(([pathway]) =>
        pathways.includes(pathway)
      )?.[1] ?? 0

      // Position programs within their stage region
      // x: based on stage (0-3 maps to left-right on canvas)
      // y: scattered within stage region for visual interest
      const stageWidth = 0.25 // Each stage gets ~25% of width
      const baseX = stage * stageWidth + stageWidth * 0.5
      const offsetX = (Math.random() - 0.5) * stageWidth * 0.4 // Scatter within stage
      const offsetY = (Math.random() - 0.5) * 0.15 // Scatter vertically

      return {
        id: doc.metadata.name,
        name: doc.metadata.name,
        stage,
        x: Math.max(0.05, Math.min(0.95, baseX + offsetX)),
        y: Math.max(0.25, Math.min(0.75, 0.45 + offsetY)),
        sectors: doc.metadata.sectors || [],
        opportunities: doc.metadata.opportunities || [],
        season: doc.metadata.season || ['Year-Round'],
        description: doc.metadata.description
      }
    })

    setPrograms(programNodes)
  }, [])

  // Draw waypoints on canvas overlay
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const W = container.clientWidth
    const H = container.clientHeight

    const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
    canvas.width = Math.floor(W * dpr)
    canvas.height = Math.floor(H * dpr)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    // Draw program waypoints
    programs.forEach(prog => {
      const screenX = prog.x * W
      const screenY = prog.y * H
      const isSelected = selectedProgram?.id === prog.id
      const isHovered = hoveredProgram === prog.id

      // Draw node circle
      ctx.beginPath()
      ctx.arc(screenX, screenY, isSelected ? 12 : isHovered ? 9 : 6, 0, Math.PI * 2)
      ctx.fillStyle = isSelected
        ? '#d4a5ff'
        : isHovered
          ? '#e8c4ff'
          : '#c8a8f0'
      ctx.fill()
      ctx.strokeStyle = 'rgba(200, 180, 240, 0.6)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw connecting line to nearest stage marker (optional visual anchor)
      if (isSelected) {
        ctx.strokeStyle = 'rgba(212, 165, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        // Line goes down to stage marker area
        const stageMarkerY = H * 0.92
        ctx.moveTo(screenX, screenY)
        ctx.lineTo(screenX, stageMarkerY)
        ctx.stroke()
        ctx.setLineDash([])
      }
    })
  }, [programs, selectedProgram, hoveredProgram])

  // Handle mouse interactions on waypoints
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current) return

    const rect = canvasRef.current!.getBoundingClientRect()
    // Mouse coordinates are in CSS pixels, no need to adjust for dpr
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePos({ x, y })

    // Check if hovering over a program node
    let hoveredId: string | null = null
    for (const prog of programs) {
      const screenX = prog.x * containerRef.current.clientWidth
      const screenY = prog.y * containerRef.current.clientHeight
      const dist = Math.hypot(x - screenX, y - screenY)

      if (dist < 10) {
        hoveredId = prog.id
        break
      }
    }

    setHoveredProgram(hoveredId)

    // Update cursor
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hoveredId ? 'pointer' : 'default'
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    // Mouse coordinates are in CSS pixels, no need to adjust for dpr
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on a program node
    for (const prog of programs) {
      const screenX = prog.x * containerRef.current!.clientWidth
      const screenY = prog.y * containerRef.current!.clientHeight
      const dist = Math.hypot(x - screenX, y - screenY)

      if (dist < 10) {
        setSelectedProgram(prog)
        onProgramSelect?.(prog)
        return
      }
    }

    // Clicking empty space deselects
    setSelectedProgram(null)
  }

  return (
    <div className="unified-terrain" ref={containerRef}>
      <RidgelineVisualization
        userProfile={userProfile}
        onTrackChange={onTrackChange}
        onStageChange={onStageChange}
      />
      {/* Interactive terrain with waypoint canvas and labels */}

      {/* Overlay canvas for program waypoints */}
      <canvas
        ref={canvasRef}
        className="waypoint-canvas"
        onMouseMove={handleCanvasMouseMove}
        onClick={handleCanvasClick}
      />

      {/* Details Panel - slides in from right on selection */}
      {selectedProgram && (
        <div className="details-panel">
          <button
            className="close-btn"
            onClick={() => {
              setSelectedProgram(null)
            }}
          >
            ×
          </button>

          <div className="program-details">
            <h3>{selectedProgram.name}</h3>
            <p className="season-badge">{selectedProgram.season?.[0] || 'Year-Round'}</p>
            {selectedProgram.description && (
              <p className="description">{selectedProgram.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Program labels on waypoints */}
      {programs.map(prog => {
        const screenX = prog.x * (containerRef.current?.clientWidth || 1)
        const screenY = prog.y * (containerRef.current?.clientHeight || 1)
        return (
          <div
            key={prog.id}
            className="waypoint-label"
            style={{
              left: `${screenX}px`,
              top: `${screenY + 15}px`
            }}
          >
            {prog.name}
          </div>
        )
      })}

      {/* Tooltip on hover */}
      {hoveredProgram && !selectedProgram && (
        <div
          className="tooltip"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 30}px`
          }}
        >
          {programs.find(p => p.id === hoveredProgram)?.name}
        </div>
      )}
    </div>
  )
}

export default UnifiedTerrain
