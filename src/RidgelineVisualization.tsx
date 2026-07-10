import React, { useEffect, useRef, useState } from 'react'
import './RidgelineVisualization.css'

interface RidgelineVisualizationProps {
  userProfile?: any
  onTrackChange?: (track: 'founder' | 'commercialization') => void
}

// Generate procedural terrain using Perlin-like noise
const generateTerrainTriangles = (width: number, height: number, resolution: number) => {
  const triangles: Array<{x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, color: string}> = []
  const rows = Math.floor(height / resolution)
  const cols = Math.floor(width / resolution)

  // Color palette (warm earth tones)
  const colors = ['#A87C2C', '#8B6A25', '#C4956A', '#D4A574', '#B8956B', '#9D7D55', '#6E6552']

  // Simple noise function (pseudo-random based on coordinates)
  const noise = (x: number, y: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    return n - Math.floor(n)
  }

  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const x = col * resolution
      const y = row * resolution

      // Vary height based on noise
      const heightVariation = noise(col * 0.5, row * 0.5)
      const yOffset = heightVariation * 40 - 20

      // Create two triangles for each grid cell
      const x1 = x
      const y1 = y + yOffset
      const x2 = x + resolution
      const y2 = y + resolution + (noise(col + 1, row + 1) * 40 - 20)
      const x3 = x + resolution
      const y3 = y + (noise(col + 1, row) * 40 - 20)

      const colorIdx = Math.floor(noise(col, row) * colors.length)
      const color = colors[colorIdx % colors.length]

      triangles.push({ x1, y1, x2, y2, x3, y3, color })

      // Second triangle
      const x4 = x
      const y4 = y + yOffset
      const x5 = x
      const y5 = y + resolution + (noise(col, row + 1) * 40 - 20)
      const x6 = x + resolution
      const y6 = y + resolution + (noise(col + 1, row + 1) * 40 - 20)

      const colorIdx2 = Math.floor(noise(col + 0.5, row + 0.5) * colors.length)
      const color2 = colors[colorIdx2 % colors.length]

      triangles.push({ x1: x4, y1: y4, x2: x5, y2: y5, x3: x6, y3: y6, color: color2 })
    }
  }

  return triangles
}

const RidgelineVisualization: React.FC<RidgelineVisualizationProps> = ({ userProfile, onTrackChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTrack, setActiveTrack] = useState<'founder' | 'commercialization'>('founder')
  const [triangles, setTriangles] = useState<any[]>([])

  // Generate terrain on mount and window resize
  useEffect(() => {
    if (!canvasRef.current) return

    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const terrain = generateTerrainTriangles(width, height, 60)
    setTriangles(terrain)
  }, [])

  // Render terrain
  useEffect(() => {
    if (!canvasRef.current || triangles.length === 0) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Draw triangles
    triangles.forEach(tri => {
      ctx.fillStyle = tri.color
      ctx.beginPath()
      ctx.moveTo(tri.x1, tri.y1)
      ctx.lineTo(tri.x2, tri.y2)
      ctx.lineTo(tri.x3, tri.y3)
      ctx.closePath()
      ctx.fill()

      // Add subtle border for polygon effect
      ctx.strokeStyle = 'rgba(52, 49, 42, 0.08)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    })
  }, [triangles])

  const handleTrackChange = (track: 'founder' | 'commercialization') => {
    setActiveTrack(track)
    onTrackChange?.(track)
  }

  return (
    <div className="ridgeline-container">
      <canvas
        ref={canvasRef}
        width={1400}
        height={500}
        className="ridgeline-canvas"
      />

      <div className="ridgeline-overlay">
        <div className="track-switcher">
          <button
            className={`track-btn ${activeTrack === 'founder' ? 'active' : ''}`}
            onClick={() => handleTrackChange('founder')}
          >
            Founder
          </button>
          <button
            className={`track-btn ${activeTrack === 'commercialization' ? 'active' : ''}`}
            onClick={() => handleTrackChange('commercialization')}
          >
            Commercialization
          </button>
        </div>

        <div className="terrain-labels">
          <div className="stage-marker">
            <span className="stage-name">Have an Idea</span>
            <span className="elevation">5300 FT</span>
          </div>
          <div className="stage-marker">
            <span className="stage-name">Validate</span>
            <span className="elevation">6800 FT</span>
          </div>
          <div className="stage-marker">
            <span className="stage-name">Build the MVP</span>
            <span className="elevation">8200 FT</span>
          </div>
          <div className="stage-marker">
            <span className="stage-name">Find Mentorship</span>
            <span className="elevation">10000 FT</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RidgelineVisualization
