import { Show, createMemo } from 'solid-js'
import type { Component } from 'solid-js'
import { appStore } from '../stores/appStore'

const NoteDisplay: Component = () => {
  const note = () => appStore.detectedNote()

  const isInTune = createMemo(() => {
    const n   = note()
    const tHz = appStore.targetHz()
    if (!n || !appStore.isListening()) return false
    const cents = tHz !== null ? 1200 * Math.log2(n.frequency / tHz) : n.cents
    return Math.abs(cents) <= 5
  })

  return (
    <div class="note-display">
      <Show
        when={note()}
        fallback={<span class="note-name muted">—</span>}
      >
        <span class={`note-name${isInTune() ? ' in-tune' : ''}`}>
          {note()!.note}
        </span>
        <span class="note-octave">{note()!.octave}</span>
      </Show>
      <span class="note-hz">
        {note() ? `${note()!.frequency.toFixed(1)} Hz` : ''}
      </span>
    </div>
  )
}

export default NoteDisplay
