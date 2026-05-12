import { describe, it, expect } from 'vitest'
import { midiToHz, hzToMidi, hzToNote, noteRefToHz, centsToColor } from './NoteUtils'

describe('midiToHz', () => {
  it('A4 = 440 Hz (MIDI 69)', () => {
    expect(midiToHz(69)).toBeCloseTo(440, 4)
  })

  it('A3 = 220 Hz (MIDI 57)', () => {
    expect(midiToHz(57)).toBeCloseTo(220, 4)
  })

  it('C4 = 261.63 Hz (MIDI 60)', () => {
    expect(midiToHz(60)).toBeCloseTo(261.63, 1)
  })

  it('each octave step doubles the frequency', () => {
    const low = midiToHz(45)
    const high = midiToHz(57)
    expect(high / low).toBeCloseTo(2, 5)
  })
})

describe('hzToMidi', () => {
  it('440 Hz → MIDI 69', () => {
    expect(hzToMidi(440)).toBeCloseTo(69, 5)
  })

  it('220 Hz → MIDI 57', () => {
    expect(hzToMidi(220)).toBeCloseTo(57, 5)
  })

  it('is the inverse of midiToHz', () => {
    for (const midi of [36, 48, 60, 69, 72, 84]) {
      expect(hzToMidi(midiToHz(midi))).toBeCloseTo(midi, 8)
    }
  })
})

describe('hzToNote', () => {
  it('returns null for zero or negative frequency', () => {
    expect(hzToNote(0)).toBeNull()
    expect(hzToNote(-1)).toBeNull()
  })

  it('identifies A4 correctly', () => {
    const result = hzToNote(440)!
    expect(result.note).toBe('A')
    expect(result.octave).toBe(4)
    expect(result.cents).toBeCloseTo(0, 1)
    expect(result.frequency).toBe(440)
    expect(result.midiNote).toBe(69)
  })

  it('identifies E2 (low guitar string) correctly', () => {
    const result = hzToNote(82.41)!
    expect(result.note).toBe('E')
    expect(result.octave).toBe(2)
    expect(Math.abs(result.cents)).toBeLessThan(2)
  })

  it('cents are positive when slightly sharp', () => {
    const sharpA4 = midiToHz(69) * Math.pow(2, 10 / 1200)
    const result = hzToNote(sharpA4)!
    expect(result.cents).toBeCloseTo(10, 0)
  })

  it('cents are negative when slightly flat', () => {
    const flatA4 = midiToHz(69) * Math.pow(2, -15 / 1200)
    const result = hzToNote(flatA4)!
    expect(result.cents).toBeCloseTo(-15, 0)
  })

  it('cents stay within ±50 for any frequency', () => {
    const freqs = [82.41, 110, 165.41, 261.63, 329.63, 440, 659.25, 987.77]
    for (const hz of freqs) {
      const result = hzToNote(hz)!
      expect(Math.abs(result.cents)).toBeLessThanOrEqual(50)
    }
  })
})

describe('noteRefToHz', () => {
  it('A4 → 440 Hz', () => {
    expect(noteRefToHz('A', 4)).toBeCloseTo(440, 4)
  })

  it('E2 → ~82.41 Hz (low guitar string)', () => {
    expect(noteRefToHz('E', 2)).toBeCloseTo(82.41, 1)
  })

  it('resolves flat enharmonics via resolveNote', () => {
    expect(noteRefToHz('Bb', 4)).toBeCloseTo(noteRefToHz('A#', 4), 4)
    expect(noteRefToHz('Db', 4)).toBeCloseTo(noteRefToHz('C#', 4), 4)
  })

  it('returns 0 for unknown note names', () => {
    expect(noteRefToHz('X', 4)).toBe(0)
  })
})

describe('centsToColor', () => {
  it('returns --in-tune for 0 cents', () => {
    expect(centsToColor(0)).toBe('var(--in-tune)')
  })

  it('returns --in-tune at the ±5 boundary', () => {
    expect(centsToColor(5)).toBe('var(--in-tune)')
    expect(centsToColor(-5)).toBe('var(--in-tune)')
  })

  it('returns --close between 5 and 20 cents', () => {
    expect(centsToColor(6)).toBe('var(--close)')
    expect(centsToColor(-6)).toBe('var(--close)')
    expect(centsToColor(20)).toBe('var(--close)')
    expect(centsToColor(-20)).toBe('var(--close)')
  })

  it('returns --off beyond 20 cents', () => {
    expect(centsToColor(21)).toBe('var(--off)')
    expect(centsToColor(-21)).toBe('var(--off)')
    expect(centsToColor(50)).toBe('var(--off)')
  })
})
