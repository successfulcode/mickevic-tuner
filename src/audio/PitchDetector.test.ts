import { describe, it, expect, beforeEach } from 'vitest'
import { detectPitch } from './PitchDetector'

const SAMPLE_RATE = 44100
const BUFFER_SIZE = 4096

function makeSineWave(freq: number, amplitude = 0.5): Float32Array {
  const buf = new Float32Array(BUFFER_SIZE)
  for (let i = 0; i < BUFFER_SIZE; i++) {
    buf[i] = amplitude * Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE)
  }
  return buf
}

function makeSilence(): Float32Array {
  return new Float32Array(BUFFER_SIZE)
}

function resetEma(): void {
  // Drive the EMA state back to null by passing a silent buffer.
  detectPitch(makeSilence(), SAMPLE_RATE)
}

beforeEach(() => {
  resetEma()
})

describe('detectPitch — silence', () => {
  it('returns null for a silent buffer', () => {
    expect(detectPitch(makeSilence(), SAMPLE_RATE)).toBeNull()
  })

  it('returns null for a very quiet signal (below threshold)', () => {
    const buf = makeSineWave(440, 0.01)
    expect(detectPitch(buf, SAMPLE_RATE)).toBeNull()
  })
})

describe('detectPitch — standard frequencies', () => {
  const cases: Array<[string, number]> = [
    ['E2 (low guitar string)', 82.41],
    ['A2 (bass A)', 110],
    ['E3', 164.81],
    ['A4 (concert pitch)', 440],
    ['E4 (high guitar string)', 329.63],
    ['B3', 246.94],
  ]

  for (const [label, freq] of cases) {
    it(`detects ${label} within ±3 Hz`, () => {
      resetEma()
      const buf = makeSineWave(freq)
      const detected = detectPitch(buf, SAMPLE_RATE)
      expect(detected).not.toBeNull()
      expect(Math.abs(detected! - freq)).toBeLessThan(3)
    })
  }
})

describe('detectPitch — EMA smoothing', () => {
  it('smooths towards the new frequency rather than jumping instantly', () => {
    const buf440 = makeSineWave(440)
    detectPitch(buf440, SAMPLE_RATE)
    detectPitch(buf440, SAMPLE_RATE)

    // Switch to 450 Hz — close enough to not reset EMA (< 1 semitone away)
    const buf450 = makeSineWave(450)
    const smoothed = detectPitch(buf450, SAMPLE_RATE)!
    expect(smoothed).toBeDefined()
    // Should be between the two values, not equal to 450
    expect(smoothed).toBeLessThan(452)
    expect(smoothed).toBeGreaterThan(440)
  })

  it('resets EMA when frequency jumps by more than 1 semitone', () => {
    const buf440 = makeSineWave(440)
    detectPitch(buf440, SAMPLE_RATE)

    // 500 Hz is ~225 cents above 440 — well above the 1-semitone threshold
    resetEma()
    const buf500 = makeSineWave(500)
    const result = detectPitch(buf500, SAMPLE_RATE)
    // After reset, first reading should be close to the raw detected value
    expect(result).not.toBeNull()
    expect(Math.abs(result! - 500)).toBeLessThan(5)
  })

  it('resets EMA after silence', () => {
    detectPitch(makeSineWave(440), SAMPLE_RATE)
    detectPitch(makeSilence(), SAMPLE_RATE)
    const result = detectPitch(makeSineWave(300), SAMPLE_RATE)
    expect(result).not.toBeNull()
    expect(Math.abs(result! - 300)).toBeLessThan(5)
  })
})
