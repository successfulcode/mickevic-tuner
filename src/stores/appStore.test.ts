import { describe, it, expect } from 'vitest'
import { appStore } from './appStore'

describe('appStore initial state', () => {
  it('mode defaults to "guitar"', () => {
    expect(appStore.mode()).toBe('guitar')
  })

  it('detectedNote defaults to null', () => {
    expect(appStore.detectedNote()).toBeNull()
  })

  it('selectedTuning defaults to guitar-standard', () => {
    const tuning = appStore.selectedTuning()
    expect(tuning).not.toBeNull()
    expect(tuning!.id).toBe('guitar-standard')
    expect(tuning!.instrument).toBe('guitar')
  })

  it('activeStringIndex defaults to 0', () => {
    expect(appStore.activeStringIndex()).toBe(0)
  })

  it('targetHz defaults to null', () => {
    expect(appStore.targetHz()).toBeNull()
  })

  it('isListening defaults to false', () => {
    expect(appStore.isListening()).toBe(false)
  })

  it('error defaults to null', () => {
    expect(appStore.error()).toBeNull()
  })

  it('selectedInstrument defaults to null', () => {
    expect(appStore.selectedInstrument()).toBeNull()
  })
})

describe('appStore setters', () => {
  it('setMode updates mode signal', () => {
    appStore.setMode('vocal')
    expect(appStore.mode()).toBe('vocal')
    appStore.setMode('guitar')
  })

  it('setDetectedNote updates detectedNote signal', () => {
    const note = { note: 'A', octave: 4, cents: 0, frequency: 440, midiNote: 69 }
    appStore.setDetectedNote(note)
    expect(appStore.detectedNote()).toEqual(note)
    appStore.setDetectedNote(null)
  })

  it('setIsListening toggles correctly', () => {
    appStore.setIsListening(true)
    expect(appStore.isListening()).toBe(true)
    appStore.setIsListening(false)
    expect(appStore.isListening()).toBe(false)
  })

  it('setError stores and clears error messages', () => {
    appStore.setError('Microphone not found')
    expect(appStore.error()).toBe('Microphone not found')
    appStore.setError(null)
    expect(appStore.error()).toBeNull()
  })

  it('setActiveStringIndex updates the index', () => {
    appStore.setActiveStringIndex(3)
    expect(appStore.activeStringIndex()).toBe(3)
    appStore.setActiveStringIndex(0)
  })

  it('setTargetHz stores a frequency', () => {
    appStore.setTargetHz(440)
    expect(appStore.targetHz()).toBeCloseTo(440)
    appStore.setTargetHz(null)
  })
})
