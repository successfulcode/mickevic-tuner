import { createEffect, onMount, onCleanup } from 'solid-js'
import type { Component } from 'solid-js'
import { appStore } from '../stores/appStore'

const LOGICAL_W = 420
const LOGICAL_H = 240
const CX = LOGICAL_W / 2
const CY = LOGICAL_H
const R  = LOGICAL_H - 14

const START_DEG  = 200
const END_DEG    = 340
const SWEEP_DEG  = 70

const STIFFNESS = 0.12
const DAMPING   = 0.72

type RGB = [number, number, number]
const C_IN_TUNE: RGB = [0,   255, 136]
const C_CLOSE:   RGB = [255, 170,   0]
const C_OFF:     RGB = [255,  68,  85]

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function getColorRgb(absCents: number): RGB {
  if (absCents <= 5)  return C_IN_TUNE
  if (absCents <= 20) return lerpRgb(C_IN_TUNE, C_CLOSE, (absCents - 5) / 15)
  if (absCents <= 50) return lerpRgb(C_CLOSE, C_OFF, (absCents - 20) / 30)
  return C_OFF
}

function rgb(c: RGB, a = 1) { return `rgba(${c[0]},${c[1]},${c[2]},${a})` }
function toRad(deg: number)  { return (deg * Math.PI) / 180 }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

interface SpringState {
  current:     number
  velocity:    number
  target:      number
  absCents:    number
  active:      boolean
  targetLabel: string
}

function drawDial(ctx: CanvasRenderingContext2D, s: SpringState) {
  ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H)

  const color    = s.active ? getColorRgb(s.absCents) : ([51, 51, 85] as RGB)
  const startRad = toRad(START_DEG)
  const endRad   = toRad(END_DEG)

  // ── Outer halo (only when active) ───────────────────────
  if (s.active) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(CX, CY, R + 12, startRad, endRad)
    ctx.strokeStyle = rgb(color)
    ctx.lineWidth   = 30
    ctx.globalAlpha = 0.03
    ctx.stroke()
    ctx.restore()
  }

  // ── Background arc track ─────────────────────────────────
  ctx.beginPath()
  ctx.arc(CX, CY, R, startRad, endRad)
  ctx.strokeStyle = '#15151f'
  ctx.lineWidth   = 4
  ctx.stroke()

  // ── In-tune zone (±5¢ green band) ───────────────────────
  const zoneHalf = (5 / 50) * SWEEP_DEG
  ctx.save()
  ctx.beginPath()
  ctx.arc(CX, CY, R, toRad(270 - zoneHalf), toRad(270 + zoneHalf))
  ctx.strokeStyle = rgb(C_IN_TUNE, 0.15)
  ctx.lineWidth   = 6
  ctx.stroke()
  ctx.restore()

  // ── Tick marks ───────────────────────────────────────────
  const ticks = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50]
  for (const c of ticks) {
    const rad    = toRad(270 + (c / 50) * SWEEP_DEG)
    const center = c === 0
    const major  = c % 20 === 0 || center
    const innerR = center ? R - 22 : major ? R - 15 : R - 9
    const outerR = R + 2

    ctx.beginPath()
    ctx.moveTo(CX + innerR * Math.cos(rad), CY + innerR * Math.sin(rad))
    ctx.lineTo(CX + outerR * Math.cos(rad), CY + outerR * Math.sin(rad))
    ctx.strokeStyle = center ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.09)'
    ctx.lineWidth   = center ? 2 : 1
    ctx.stroke()
  }

  // ── ♭ / ♯ arc labels ────────────────────────────────────
  const labelR = R + 20
  ctx.font         = '11px system-ui'
  ctx.fillStyle    = 'rgba(255,255,255,0.18)'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  for (const [c, glyph] of [[-50, '♭'], [50, '♯']] as [number, string][]) {
    const rad = toRad(270 + (c / 50) * SWEEP_DEG)
    ctx.fillText(glyph, CX + labelR * Math.cos(rad), CY + labelR * Math.sin(rad))
  }

  // ── Target note label (center of arc area) ───────────────
  if (s.targetLabel && s.active) {
    const labelY = CY - Math.round(R * 0.48)
    ctx.font         = `600 13px 'Space Mono', monospace`
    ctx.fillStyle    = 'rgba(255,255,255,0.28)'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(s.targetLabel, CX, labelY)
  }

  if (!s.active) return

  // ── Needle (multi-pass glow) ─────────────────────────────
  const angle  = toRad(270 + clamp(s.current, -SWEEP_DEG, SWEEP_DEG))
  const tipR   = R - 18
  const tipX   = CX + tipR * Math.cos(angle)
  const tipY   = CY + tipR * Math.sin(angle)
  const baseR  = 10
  const baseX  = CX + baseR * Math.cos(angle)
  const baseY  = CY + baseR * Math.sin(angle)

  ctx.save()
  for (const [blur, alpha, width] of [[26, 0.2, 6], [14, 0.4, 3], [6, 0.65, 2], [0, 1, 1.5]]) {
    ctx.beginPath()
    ctx.moveTo(baseX, baseY)
    ctx.lineTo(tipX, tipY)
    ctx.strokeStyle = rgb(color)
    ctx.lineWidth   = width as number
    ctx.globalAlpha = alpha as number
    ctx.shadowBlur  = blur as number
    ctx.shadowColor = rgb(color)
    ctx.lineCap     = 'round'
    ctx.stroke()
  }
  ctx.restore()

  // ── Tip dot ──────────────────────────────────────────────
  ctx.save()
  ctx.beginPath()
  ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2)
  ctx.fillStyle   = rgb(color)
  ctx.shadowBlur  = 20
  ctx.shadowColor = rgb(color)
  ctx.fill()
  ctx.restore()

  // ── Pivot ────────────────────────────────────────────────
  ctx.beginPath()
  ctx.arc(CX, CY, 6, 0, Math.PI * 2)
  ctx.fillStyle = '#1c1c2a'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(CX, CY, 3.5, 0, Math.PI * 2)
  ctx.fillStyle = '#4a4a66'
  ctx.fill()
}

const TunerDial: Component = () => {
  let canvas!: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D

  const spring: SpringState = {
    current: 0, velocity: 0, target: 0,
    absCents: 100, active: false, targetLabel: '',
  }

  createEffect(() => {
    const note    = appStore.detectedNote()
    const tHz     = appStore.targetHz()
    const listen  = appStore.isListening()
    const tuning  = appStore.selectedTuning()
    const idx     = appStore.activeStringIndex()

    spring.active = listen

    if (note) {
      const cents     = tHz !== null ? 1200 * Math.log2(note.frequency / tHz) : note.cents
      spring.target   = (clamp(cents, -50, 50) / 50) * SWEEP_DEG
      spring.absCents = Math.abs(cents)
    } else {
      spring.target   = 0
      spring.absCents = 100
    }

    if (tuning?.strings[idx]) {
      const s = tuning.strings[idx]
      spring.targetLabel = `${s.note}${s.octave}`
    } else {
      spring.targetLabel = ''
    }
  })

  onMount(() => {
    const dpr     = window.devicePixelRatio || 1
    canvas.width  = LOGICAL_W * dpr
    canvas.height = LOGICAL_H * dpr
    ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    let rafId: number
    const loop = () => {
      spring.velocity = spring.velocity * DAMPING + (spring.target - spring.current) * STIFFNESS
      spring.current += spring.velocity
      drawDial(ctx, spring)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    onCleanup(() => cancelAnimationFrame(rafId))
  })

  return (
    <div class="tuner-dial-wrapper">
      <canvas ref={canvas} class="tuner-dial-canvas" />
    </div>
  )
}

export default TunerDial
