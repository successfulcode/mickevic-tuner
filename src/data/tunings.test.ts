import { describe, it, expect } from 'vitest'
import { TUNINGS, getTuningsByInstrument } from './tunings'
import type { Instrument } from './tunings'

describe('TUNINGS data integrity', () => {
  it('every preset has a unique id', () => {
    const ids = TUNINGS.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every preset has at least one string', () => {
    for (const t of TUNINGS) {
      expect(t.strings.length).toBeGreaterThan(0)
    }
  })

  it('every string has a note and an octave', () => {
    for (const t of TUNINGS) {
      for (const s of t.strings) {
        expect(typeof s.note).toBe('string')
        expect(s.note.length).toBeGreaterThan(0)
        expect(typeof s.octave).toBe('number')
      }
    }
  })

  it('every preset has a non-empty name and description', () => {
    for (const t of TUNINGS) {
      expect(t.name.trim().length).toBeGreaterThan(0)
      expect(t.description.trim().length).toBeGreaterThan(0)
    }
  })

  it('contains expected instrument counts', () => {
    const counts: Record<string, number> = {}
    for (const t of TUNINGS) {
      counts[t.instrument] = (counts[t.instrument] ?? 0) + 1
    }
    expect(counts['guitar']).toBe(10)
    expect(counts['bass']).toBe(3)
    expect(counts['ukulele']).toBe(2)
    expect(counts['violin']).toBe(1)
    expect(counts['cello']).toBe(1)
    expect(counts['banjo']).toBe(1)
    expect(counts['mandolin']).toBe(1)
  })

  it('guitar-standard has the canonical EADGBE strings', () => {
    const std = TUNINGS.find(t => t.id === 'guitar-standard')!
    expect(std).toBeDefined()
    const notes = std.strings.map(s => s.note)
    expect(notes).toEqual(['E', 'A', 'D', 'G', 'B', 'E'])
  })

  it('bass-standard has 4 strings in E1 A1 D2 G2', () => {
    const bass = TUNINGS.find(t => t.id === 'bass-standard')!
    expect(bass.strings).toEqual([
      { note: 'E', octave: 1 },
      { note: 'A', octave: 1 },
      { note: 'D', octave: 2 },
      { note: 'G', octave: 2 },
    ])
  })
})

describe('getTuningsByInstrument', () => {
  const instruments: Instrument[] = ['guitar', 'bass', 'ukulele', 'violin', 'cello', 'banjo', 'mandolin']

  for (const instrument of instruments) {
    it(`returns only ${instrument} presets`, () => {
      const result = getTuningsByInstrument(instrument)
      expect(result.length).toBeGreaterThan(0)
      for (const t of result) {
        expect(t.instrument).toBe(instrument)
      }
    })
  }

  it('union of all instruments equals TUNINGS', () => {
    const all = instruments.flatMap(i => getTuningsByInstrument(i))
    expect(all.length).toBe(TUNINGS.length)
  })
})
