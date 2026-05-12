import { createSignal } from 'solid-js'
import type { DetectedNote } from '../audio/NoteUtils'
import type { TuningPreset, Instrument } from '../data/tunings'
import { TUNINGS } from '../data/tunings'

export type AppMode = 'guitar' | 'vocal' | 'instrument'
export type InstrumentMode = Instrument | 'chromatic'

const defaultTuning = TUNINGS.find(t => t.id === 'guitar-standard') ?? null

const [mode,               setMode]               = createSignal<AppMode>('guitar')
const [detectedNote,       setDetectedNote]        = createSignal<DetectedNote | null>(null)
const [selectedTuning,     setSelectedTuning]      = createSignal<TuningPreset | null>(defaultTuning)
const [activeStringIndex,  setActiveStringIndex]   = createSignal<number>(0)
const [targetHz,           setTargetHz]            = createSignal<number | null>(null)
const [isListening,        setIsListening]         = createSignal<boolean>(false)
const [error,              setError]               = createSignal<string | null>(null)
const [selectedInstrument, setSelectedInstrument]  = createSignal<InstrumentMode | null>(null)

export const appStore = {
  mode,               setMode,
  detectedNote,       setDetectedNote,
  selectedTuning,     setSelectedTuning,
  activeStringIndex,  setActiveStringIndex,
  targetHz,           setTargetHz,
  isListening,        setIsListening,
  error,              setError,
  selectedInstrument, setSelectedInstrument,
}
