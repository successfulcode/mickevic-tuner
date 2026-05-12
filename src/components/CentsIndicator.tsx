import { createMemo, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { appStore } from '../stores/appStore'

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

const CentsIndicator: Component = () => {
  const active = () => appStore.isListening() && appStore.detectedNote() !== null

  const cents = createMemo(() => {
    const note = appStore.detectedNote()
    const tHz  = appStore.targetHz()
    if (!note) return 0
    return tHz !== null
      ? 1200 * Math.log2(note.frequency / tHz)
      : note.cents
  })

  const absCents = createMemo(() => Math.abs(cents()))

  const color = createMemo(() => {
    const a = absCents()
    if (a <= 5)  return 'var(--in-tune)'
    if (a <= 20) return 'var(--close)'
    return 'var(--off)'
  })

  const needleLeft = createMemo(() =>
    `${50 + (clamp(cents(), -50, 50) / 50) * 50}%`
  )

  const centsLabel = createMemo(() => {
    if (!active()) return ''
    const c = Math.round(cents())
    if (Math.abs(c) <= 2) return 'In tune'
    return `${c > 0 ? '+' : ''}${c}¢`
  })

  return (
    <div class="cents-indicator">
      <div class="cents-track">
        <Show when={active()}>
          <div
            class="cents-needle"
            style={{
              left: needleLeft(),
              background: color(),
              'box-shadow': `0 0 8px ${color()}`,
            }}
          />
        </Show>
      </div>
      <div class="cents-labels">
        <span class="cents-label-edge">-50¢</span>
        <span class="cents-label-edge">+50¢</span>
      </div>
      <div class="cents-value" style={{ color: active() ? color() : 'var(--text-muted)' }}>
        {centsLabel()}
      </div>
    </div>
  )
}

export default CentsIndicator
