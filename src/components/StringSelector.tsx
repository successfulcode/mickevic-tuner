import { For, createMemo } from 'solid-js'
import type { Component } from 'solid-js'
import { appStore } from '../stores/appStore'
import { noteRefToHz } from '../audio/NoteUtils'

const StringSelector: Component = () => {
  const tuning = () => appStore.selectedTuning()

  const stringStates = createMemo(() => {
    const t    = tuning()
    const note = appStore.detectedNote()
    const tHz  = appStore.targetHz()
    if (!t) return []

    return t.strings.map((s, i) => {
      const hz        = noteRefToHz(s.note, s.octave)
      const isActive  = appStore.activeStringIndex() === i
      const targetCents = (isActive && note && tHz)
        ? Math.round(1200 * Math.log2(note.frequency / tHz))
        : null

      const inTune = targetCents !== null && Math.abs(targetCents) <= 5

      return { ...s, hz, index: i, isActive, inTune, targetCents }
    })
  })

  return (
    <div class="string-selector">
      <For each={stringStates()}>
        {(s) => (
          <button
            class={`string-btn${s.isActive ? ' active' : ''}${s.inTune ? ' in-tune' : ''}`}
            onClick={() => {
              const t = appStore.selectedTuning()
              if (!t) return
              appStore.setActiveStringIndex(s.index)
              appStore.setTargetHz(noteRefToHz(t.strings[s.index].note, t.strings[s.index].octave))
            }}
            title={`${s.note}${s.octave} — ${s.hz.toFixed(1)} Hz`}
          >
            <span class="string-note">{s.note}</span>
            <span class="string-octave">{s.octave}</span>
          </button>
        )}
      </For>
    </div>
  )
}

export default StringSelector
