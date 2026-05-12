import { createEffect, onMount, onCleanup } from 'solid-js'
import type { Component } from 'solid-js'
import { AudioEngine } from '../audio/AudioEngine'
import { appStore } from '../stores/appStore'

const LOGICAL_W = 420
const LOGICAL_H = 52

type RGB = [number, number, number]
const C_IN_TUNE: RGB = [0,   255, 136]
const C_CLOSE:   RGB = [255, 170,   0]
const C_OFF:     RGB = [255,  68,  85]
const C_IDLE:    RGB = [80,   80, 120]

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function getWaveColor(absCents: number): RGB {
  if (absCents <= 5)  return C_IN_TUNE
  if (absCents <= 20) return lerpRgb(C_IN_TUNE, C_CLOSE, (absCents - 5) / 15)
  if (absCents <= 50) return lerpRgb(C_CLOSE, C_OFF, (absCents - 20) / 30)
  return C_OFF
}

const WaveformStrip: Component = () => {
  let canvas!: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D

  // Mutable ref updated by reactive context, read by RAF
  const state = { absCents: 100, active: false }

  createEffect(() => {
    const note  = appStore.detectedNote()
    const tHz   = appStore.targetHz()
    state.active = appStore.isListening()

    if (note) {
      const cents = tHz !== null ? 1200 * Math.log2(note.frequency / tHz) : note.cents
      state.absCents = Math.abs(cents)
    } else {
      state.absCents = 100
    }
  })

  onMount(() => {
    const dpr     = window.devicePixelRatio || 1
    canvas.width  = LOGICAL_W * dpr
    canvas.height = LOGICAL_H * dpr
    ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    const buf = new Float32Array(512)
    let rafId: number

    const loop = () => {
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H)
      const analyser = AudioEngine.getInstance().getAnalyser()

      if (analyser && state.active) {
        analyser.getFloatTimeDomainData(buf)

        const c     = getWaveColor(state.absCents)
        const color = `rgba(${c[0]},${c[1]},${c[2]},0.75)`

        ctx.save()
        ctx.beginPath()
        ctx.shadowBlur  = 10
        ctx.shadowColor = `rgba(${c[0]},${c[1]},${c[2]},0.5)`
        ctx.strokeStyle = color
        ctx.lineWidth   = 1.5
        ctx.lineCap     = 'round'
        ctx.lineJoin    = 'round'

        const step = LOGICAL_W / buf.length
        const mid  = LOGICAL_H / 2
        for (let i = 0; i < buf.length; i++) {
          const x = i * step
          const y = mid + buf[i] * mid * 0.7
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.restore()
      } else {
        // Flat idle line
        const [r, g, b] = C_IDLE
        ctx.beginPath()
        ctx.moveTo(0, LOGICAL_H / 2)
        ctx.lineTo(LOGICAL_W, LOGICAL_H / 2)
        ctx.strokeStyle = `rgba(${r},${g},${b},0.12)`
        ctx.lineWidth   = 1
        ctx.stroke()
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    onCleanup(() => cancelAnimationFrame(rafId))
  })

  return (
    <div class="waveform-strip">
      <canvas ref={canvas} class="waveform-canvas" />
    </div>
  )
}

export default WaveformStrip
