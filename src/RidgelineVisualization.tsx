import React, { useEffect, useRef, useState } from 'react'
import './RidgelineVisualization.css'

interface RidgelineVisualizationProps {
  userProfile?: any
  onTrackChange?: (track: 'founder' | 'commercialization') => void
  onStageChange?: (stageIndex: number) => void
}

const RidgelineVisualization: React.FC<RidgelineVisualizationProps> = ({ userProfile, onTrackChange, onStageChange }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const terrainRef = useRef<HTMLCanvasElement>(null)
  const [activeTrack, setActiveTrack] = useState<'founder' | 'commercialization'>('founder')
  const [lightAz, setLightAz] = useState(-Math.PI * 0.5)
  const [currentStage, setCurrentStage] = useState(0)
  const stageLabels = ['Have an Idea', 'Validate', 'Build the MVP', 'Find Mentorship']

  const palette = {
    light: {
      h: 36, s: 54, l0: 44, lr: 30, edge: 'rgba(122,86,26,0.5)', glow: false
    },
    deep: {
      h: 260, s: 40, l0: 28, lr: 28, edge: 'rgba(180,160,220,0.4)', ridgeGlow: 'rgba(200,180,240,0.8)'
    }
  }

  const ridge = (x: number, seed: number, sharp: number): number => {
    let v = 0
    v += 0.5 * Math.abs(Math.sin(x * 3.1 + seed))
    v += 0.28 * Math.abs(Math.sin(x * 6.7 + seed * 1.7))
    v += 0.14 * Math.abs(Math.sin(x * 13.3 + seed * 2.3))
    return Math.min(1, Math.pow(v / 0.92, sharp))
  }

  const fold = (i: number, j: number, seed: number): number => {
    return Math.sin(i * 0.9 + seed) + Math.cos(j * 1.3 + seed * 1.7) + Math.sin((i + j) * 0.7 + seed * 0.6)
  }

  const h2 = (a: number, b: number): number => {
    const val = Math.sin(a * 127.1 + b * 311.7) * 43758.5
    return val - Math.floor(val)
  }

  const norm3 = (x: number, y: number, z: number): [number, number, number] => {
    const l = Math.hypot(x, y, z) || 1
    return [x / l, y / l, z / l]
  }

  const drawFaceted = () => {
    const canvas = terrainRef.current
    const container = containerRef.current
    if (!canvas || !container) {
      console.warn('[RidgelineVisualization] Missing refs:', { canvas: !!canvas, container: !!container })
      return
    }

    const W = container.clientWidth
    const H = container.clientHeight
    if (!W || !H) {
      console.warn('[RidgelineVisualization] Container has 0 dimensions:', { W, H })
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
    canvas.width = Math.floor(W * dpr)
    canvas.height = Math.floor(H * dpr)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    const F = palette.deep
    const am = 0.85
    const az = lightAz + currentStage * 0.3
    const light = norm3(Math.cos(az) * 0.7, -0.6, Math.sin(az) * 0.5 + 0.35)

    const cols = 22
    const rows = 7
    const layers = [
      { seed: 2.1, amp: 0.3, base: 0.5, foldAmp: 70, alpha: 0.5, jit: 0.4 },
      { seed: 5.4, amp: 0.42, base: 0.66, foldAmp: 95, alpha: 1.0, jit: 0.55 }
    ]

    layers.forEach((Ly) => {
      const topBase = H * Ly.base
      const ampPx = Ly.amp * H
      const botY = H * 1.08
      const P: any[] = []

      for (let i = 0; i <= cols; i++) {
        P[i] = []
        const x0 = (i / cols) * W
        const topy = topBase - ampPx * ridge(i / cols, Ly.seed, 1.35)

        for (let j = 0; j <= rows; j++) {
          const fr = j / rows
          const jx = (h2(i * 1.3 + Ly.seed, j * 2.1) - 0.5) * (W / cols) * Ly.jit * (j < rows ? 1 : 0)
          const jy = (h2(i * 2.7, j * 1.7 + Ly.seed) - 0.5) * (H / 28) * (j > 0 && j < rows ? 1 : 0)
          const y = topy + (botY - topy) * fr + jy
          const z = Ly.foldAmp * fold(i, j, Ly.seed) * (1 - fr * 0.5)
          P[i][j] = [x0 + jx, y, z]
        }
      }

      const tri = (a: any, b: any, c: any, fr: number) => {
        const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
        const e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
        const n = norm3(
          e1[1] * e2[2] - e1[2] * e2[1],
          e1[2] * e2[0] - e1[0] * e2[2],
          e1[0] * e2[1] - e1[1] * e2[0]
        )

        let br = Math.abs(n[0] * light[0] + n[1] * light[1] + n[2] * light[2])
        br = Math.pow(br, 0.85)
        const l = F.l0 + br * F.lr - fr * 10

        ctx.beginPath()
        ctx.moveTo(a[0], a[1])
        ctx.lineTo(b[0], b[1])
        ctx.lineTo(c[0], c[1])
        ctx.closePath()

        ctx.globalAlpha = Ly.alpha * am
        ctx.fillStyle = `hsl(${F.h}, ${F.s}%, ${Math.max(12, Math.min(85, l))}%)`
        ctx.fill()

        ctx.globalAlpha = Ly.alpha * am
        ctx.strokeStyle = F.edge
        ctx.lineWidth = 0.85
        ctx.stroke()
      }

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const fr = j / rows
          tri(P[i][j], P[i + 1][j], P[i][j + 1], fr)
          tri(P[i + 1][j], P[i + 1][j + 1], P[i][j + 1], fr)
        }
      }

      // Ridge highlight line
      ctx.globalAlpha = Ly.alpha * am * 0.8
      ctx.beginPath()
      for (let i = 0; i <= cols; i++) {
        const pt = P[i][0]
        if (i === 0) ctx.moveTo(pt[0], pt[1])
        else ctx.lineTo(pt[0], pt[1])
      }
      ctx.strokeStyle = (F as any).ridgeGlow || 'rgba(200,180,240,0.8)'
      ctx.lineWidth = 1.6
      ctx.stroke()
    })

    ctx.globalAlpha = 1
  }

  useEffect(() => {
    drawFaceted()
    const resizeObs = new ResizeObserver(() => drawFaceted())
    if (containerRef.current) resizeObs.observe(containerRef.current)
    return () => resizeObs.disconnect()
  }, [lightAz, currentStage])

  const handleTrackChange = (track: 'founder' | 'commercialization') => {
    setActiveTrack(track)
    onTrackChange?.(track)
  }

  const handleStageClick = (stageIndex: number) => {
    setCurrentStage(stageIndex)
    onStageChange?.(stageIndex)
  }

  return (
    <div ref={containerRef} className="ridgeline-container">
      <canvas
        ref={terrainRef}
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
          {stageLabels.map((label, idx) => (
            <div
              key={idx}
              className={`stage-marker ${currentStage === idx ? 'active' : ''}`}
              onClick={() => handleStageClick(idx)}
            >
              <span className="stage-name">{label}</span>
              <span className="elevation">{[5300, 6800, 8200, 10000][idx]} FT</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RidgelineVisualization
