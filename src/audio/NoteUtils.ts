import { resolveNote } from '../data/notes'

export interface DetectedNote {
  note: string
  octave: number
  cents: number
  frequency: number
  midiNote: number
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function hzToMidi(hz: number): number {
  return 12 * Math.log2(hz / 440) + 69
}

export function hzToNote(hz: number): DetectedNote | null {
  if (hz <= 0) return null

  const midiFloat = hzToMidi(hz)
  const midiNote = Math.round(midiFloat)
  const cents = (midiFloat - midiNote) * 100  // keep precision; round at display layer
  const octave = Math.floor(midiNote / 12) - 1
  const note = NOTE_NAMES[midiNote % 12]

  return { note, octave, cents, frequency: hz, midiNote }
}

export function noteRefToHz(note: string, octave: number): number {
  const resolved = resolveNote(note)
  const noteIndex = NOTE_NAMES.indexOf(resolved)
  if (noteIndex === -1) return 0
  const midi = (octave + 1) * 12 + noteIndex
  return midiToHz(midi)
}

export function centsToColor(cents: number): string {
  const abs = Math.abs(cents)
  if (abs <= 5) return 'var(--in-tune)'
  if (abs <= 20) return 'var(--close)'
  return 'var(--off)'
}
