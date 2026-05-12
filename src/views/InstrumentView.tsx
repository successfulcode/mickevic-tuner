import { createEffect, Show } from 'solid-js'
import type { Component } from 'solid-js'
import TunerDial from '../components/TunerDial'
import NoteDisplay from '../components/NoteDisplay'
import CentsIndicator from '../components/CentsIndicator'
import StringSelector from '../components/StringSelector'
import TuningSelector from '../components/TuningSelector'
import InstrumentPicker from '../components/InstrumentPicker'
import { appStore } from '../stores/appStore'
import { noteRefToHz } from '../audio/NoteUtils'
import type { Instrument } from '../data/tunings'

const InstrumentView: Component = () => {
  const hasStrings = () => {
    const inst = appStore.selectedInstrument()
    return inst !== null && inst !== 'chromatic'
  }

  // Auto-detect closest string whenever a note is detected (same logic as GuitarView)
  createEffect(() => {
    const tuning = appStore.selectedTuning()
    const note   = appStore.detectedNote()
    if (!tuning || !note) return

    let closestIdx  = 0
    let closestDist = Infinity

    tuning.strings.forEach((s, i) => {
      const hz   = noteRefToHz(s.note, s.octave)
      const dist = Math.abs(Math.log2(note.frequency / hz))
      if (dist < closestDist) {
        closestDist = dist
        closestIdx  = i
      }
    })

    const target = tuning.strings[closestIdx]
    appStore.setActiveStringIndex(closestIdx)
    appStore.setTargetHz(noteRefToHz(target.note, target.octave))
  })

  // When tuning changes (user picked a different preset), reset string target
  createEffect(() => {
    const tuning = appStore.selectedTuning()
    if (!tuning) { appStore.setTargetHz(null); return }
    const s = tuning.strings[0]
    appStore.setActiveStringIndex(0)
    appStore.setTargetHz(noteRefToHz(s.note, s.octave))
  })

  return (
    <div class="view">
      <TunerDial />
      <NoteDisplay />
      <CentsIndicator />

      <div class="instrument-section">
        <InstrumentPicker />

        <Show when={hasStrings()}>
          <StringSelector />
          <TuningSelector instrument={appStore.selectedInstrument() as Instrument} />
        </Show>

        <Show when={appStore.selectedInstrument() === null}>
          <p class="view-placeholder">Pick an instrument to begin</p>
        </Show>

        <Show when={appStore.selectedInstrument() === 'chromatic'}>
          <p class="chromatic-hint">
            Detecting nearest chromatic note — works with any instrument.
          </p>
        </Show>
      </div>
    </div>
  )
}

export default InstrumentView
