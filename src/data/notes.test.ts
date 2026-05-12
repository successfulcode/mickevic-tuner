import { describe, it, expect } from 'vitest'
import { resolveNote, CHROMATIC_SCALE, ENHARMONIC } from './notes'

describe('CHROMATIC_SCALE', () => {
  it('has 12 notes', () => {
    expect(CHROMATIC_SCALE).toHaveLength(12)
  })

  it('starts with C and ends with B', () => {
    expect(CHROMATIC_SCALE[0]).toBe('C')
    expect(CHROMATIC_SCALE[11]).toBe('B')
  })

  it('contains only sharps, no flats', () => {
    for (const note of CHROMATIC_SCALE) {
      expect(note).not.toMatch(/b/)
    }
  })
})

describe('resolveNote', () => {
  it('returns the note unchanged when it needs no resolution', () => {
    expect(resolveNote('C')).toBe('C')
    expect(resolveNote('G#')).toBe('G#')
    expect(resolveNote('A#')).toBe('A#')
  })

  it('resolves all flat enharmonic equivalents to sharps', () => {
    expect(resolveNote('Db')).toBe('C#')
    expect(resolveNote('Eb')).toBe('D#')
    expect(resolveNote('Fb')).toBe('E')
    expect(resolveNote('Gb')).toBe('F#')
    expect(resolveNote('Ab')).toBe('G#')
    expect(resolveNote('Bb')).toBe('A#')
    expect(resolveNote('Cb')).toBe('B')
  })

  it('covers every key in ENHARMONIC', () => {
    for (const [flat, sharp] of Object.entries(ENHARMONIC)) {
      expect(resolveNote(flat)).toBe(sharp)
    }
  })
})
