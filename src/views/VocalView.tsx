import { For, createMemo, Show } from 'solid-js'
import type { Component } from 'solid-js'
import TunerDial from '../components/TunerDial'
import NoteDisplay from '../components/NoteDisplay'
import CentsIndicator from '../components/CentsIndicator'
import { appStore } from '../stores/appStore'
import { midiToHz } from '../audio/NoteUtils'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const LADDER_RANGE = 5  // semitones above and below detected note

const VocalView: Component = () => {
  const detected = () => appStore.detectedNote()

  const ladderNotes = createMemo(() => {
    const note = detected()
    if (!note) return []
    const center = note.midiNote
    return Array.from({ length: LADDER_RANGE * 2 + 1 }, (_, i) => {
      const midi = center - LADDER_RANGE + i
      const name = NOTE_NAMES[midi % 12]
      const oct  = Math.floor(midi / 12) - 1
      const hz   = midiToHz(midi)
      const dist = midi - center  // semitones from detected
      return { midi, name, oct, hz, dist }
    }).reverse()  // highest note first
  })

  return (
    <div class="view">
      <TunerDial />
      <NoteDisplay />
      <CentsIndicator />

      <Show when={detected()}>
        <div class="chromatic-ladder">
          <For each={ladderNotes()}>
            {(row) => {
              const isActive = row.dist === 0
              const proximity = Math.max(0, 1 - Math.abs(row.dist) / LADDER_RANGE)
              return (
                <div class={`chromatic-row${isActive ? ' active' : ''}`}>
                  <span class="chromatic-note-name">{row.name}<sub>{row.oct}</sub></span>
                  <div class="chromatic-bar-track">
                    <div
                      class="chromatic-bar-fill"
                      style={{
                        width: `${proximity * 100}%`,
                        background: isActive ? 'var(--in-tune)' : 'var(--accent)',
                        opacity: proximity,
                      }}
                    />
                  </div>
                  <span style={{
                    'font-family': 'var(--font-mono)',
                    'font-size': '10px',
                    color: 'var(--text-muted)',
                    width: '44px',
                    'text-align': 'right',
                  }}>
                    {row.hz.toFixed(1)}
                  </span>
                </div>
              )
            }}
          </For>
        </div>
      </Show>
    </div>
  )
}

export default VocalView
