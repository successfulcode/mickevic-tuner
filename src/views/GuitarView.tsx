import { createEffect, onMount } from 'solid-js'
import type { Component } from 'solid-js'
import TunerDial from '../components/TunerDial'
import NoteDisplay from '../components/NoteDisplay'
import CentsIndicator from '../components/CentsIndicator'
import StringSelector from '../components/StringSelector'
import TuningSelector from '../components/TuningSelector'
import { appStore } from '../stores/appStore'
import { noteRefToHz } from '../audio/NoteUtils'

const GuitarView: Component = () => {
  // Initialise targetHz from the default tuning on first mount
  onMount(() => {
    const tuning = appStore.selectedTuning()
    if (tuning) {
      const s = tuning.strings[appStore.activeStringIndex()]
      appStore.setTargetHz(noteRefToHz(s.note, s.octave))
    }
  })

  // Auto-detect closest string whenever a new pitch is detected
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

    const targetString = tuning.strings[closestIdx]
    appStore.setActiveStringIndex(closestIdx)
    appStore.setTargetHz(noteRefToHz(targetString.note, targetString.octave))
  })

  return (
    <div class="view">
      <TunerDial />
      <NoteDisplay />
      <CentsIndicator />
      <StringSelector />
      <TuningSelector instrument="guitar" />
    </div>
  )
}

export default GuitarView
