import { For } from 'solid-js'
import type { Component } from 'solid-js'
import { appStore } from '../stores/appStore'
import type { AppMode } from '../stores/appStore'
import { TUNINGS } from '../data/tunings'

const guitarDefault = TUNINGS.find(t => t.id === 'guitar-standard') ?? null

const MODES: { id: AppMode; label: string; symbol: string }[] = [
  { id: 'guitar',     label: 'Guitar',     symbol: '𝄞' },
  { id: 'vocal',      label: 'Vocal',      symbol: '◎' },
  { id: 'instrument', label: 'Instrument', symbol: '♩' },
]

const ModeSelector: Component = () => (
  <nav class="mode-selector">
    <For each={MODES}>
      {(m) => (
        <button
          class={`mode-btn${appStore.mode() === m.id ? ' active' : ''}`}
          onClick={() => {
            if (appStore.mode() === m.id) return
            appStore.setMode(m.id)
            appStore.setDetectedNote(null)
            appStore.setTargetHz(null)
            appStore.setActiveStringIndex(0)
            if (m.id === 'guitar') {
              appStore.setSelectedTuning(guitarDefault)
              appStore.setSelectedInstrument(null)
            } else if (m.id === 'instrument') {
              appStore.setSelectedTuning(null)
            } else {
              appStore.setSelectedTuning(null)
              appStore.setSelectedInstrument(null)
            }
          }}
        >
          <span class="mode-icon">{m.symbol}</span>
          <span class="mode-label">{m.label}</span>
        </button>
      )}
    </For>
  </nav>
)

export default ModeSelector
