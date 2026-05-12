import { createSignal, For, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { appStore } from '../stores/appStore'
import type { InstrumentMode } from '../stores/appStore'
import { getTuningsByInstrument } from '../data/tunings'
import type { Instrument } from '../data/tunings'
import { noteRefToHz } from '../audio/NoteUtils'

interface InstrumentDef {
  id:     InstrumentMode
  label:  string
  symbol: string
  range:  string
}

const INSTRUMENTS: InstrumentDef[] = [
  { id: 'bass',      label: 'Bass Guitar', symbol: '𝄢',  range: 'B0 – G2'  },
  { id: 'ukulele',   label: 'Ukulele',     symbol: '♬',  range: 'G4 – A4'  },
  { id: 'violin',    label: 'Violin',      symbol: '𝄞',  range: 'G3 – E5'  },
  { id: 'cello',     label: 'Cello',       symbol: '𝄡',  range: 'C2 – A3'  },
  { id: 'banjo',     label: 'Banjo',       symbol: '♩',  range: 'G3 – D4'  },
  { id: 'mandolin',  label: 'Mandolin',    symbol: '♫',  range: 'G3 – E5'  },
  { id: 'chromatic', label: 'Chromatic',   symbol: '◈',  range: 'Any pitch' },
]

const InstrumentPicker: Component = () => {
  const [open, setOpen] = createSignal(false)
  const selected = () => appStore.selectedInstrument()

  const currentDef = () => INSTRUMENTS.find(i => i.id === selected()) ?? null

  const pick = (def: InstrumentDef) => {
    appStore.setSelectedInstrument(def.id)
    appStore.setActiveStringIndex(0)

    if (def.id === 'chromatic') {
      appStore.setSelectedTuning(null)
      appStore.setTargetHz(null)
    } else {
      const presets = getTuningsByInstrument(def.id as Instrument)
      const first   = presets[0] ?? null
      appStore.setSelectedTuning(first)
      if (first) {
        const s = first.strings[0]
        appStore.setTargetHz(noteRefToHz(s.note, s.octave))
      }
    }
    setOpen(false)
  }

  return (
    <div class="instrument-picker">
      {/* ── Trigger ── */}
      <button class="instrument-trigger" onClick={() => setOpen(v => !v)}>
        <Show
          when={currentDef()}
          fallback={<span class="instrument-trigger-placeholder">Select an instrument</span>}
        >
          <div class="instrument-trigger-left">
            <span class="instrument-trigger-symbol">{currentDef()!.symbol}</span>
            <div class="instrument-trigger-info">
              <span class="instrument-trigger-name">{currentDef()!.label}</span>
              <span class="instrument-trigger-range">{currentDef()!.range}</span>
            </div>
          </div>
        </Show>
        <span class={`tuning-chevron${open() ? ' open' : ''}`}>›</span>
      </button>

      {/* ── List ── */}
      <Show when={open()}>
        <div class="instrument-list">
          <For each={INSTRUMENTS}>
            {(def) => (
              <button
                class={`instrument-row${selected() === def.id ? ' active' : ''}`}
                onClick={() => pick(def)}
              >
                <span class="instrument-row-symbol">{def.symbol}</span>
                <div class="instrument-row-info">
                  <span class="instrument-row-name">{def.label}</span>
                  <span class="instrument-row-range">{def.range}</span>
                </div>
                <Show when={def.id !== 'chromatic'}>
                  <span class="instrument-row-count">
                    {getTuningsByInstrument(def.id as Instrument).length} tunings
                  </span>
                </Show>
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

export default InstrumentPicker
