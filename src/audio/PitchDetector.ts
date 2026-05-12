const SILENCE_THRESHOLD = 0.025  // ignore quiet background noise / finger taps

// Musical range: low B on 5-string bass (≈61 Hz) to high E on guitar (≈1319 Hz)
const MIN_FREQ = 55
const MAX_FREQ = 1400

// McLeod Pitch Method key parameter: first peak must be within this fraction of
// the highest peak. 0.93 is the recommended value from the original paper.
const MPM_K = 0.95  // slightly stricter — only accept very clean peaks

// EMA smoothing
const EMA_ALPHA = 0.15  // slower response = more stable needle
const JUMP_SEMITONES = 1.0  // must move at least 1 semitone to reset EMA

let emaHz: number | null = null

export function detectPitch(buffer: Float32Array<ArrayBuffer>, sampleRate: number): number | null {
  let rmsSum = 0
  for (let i = 0; i < buffer.length; i++) rmsSum += buffer[i] * buffer[i]
  const rms = Math.sqrt(rmsSum / buffer.length)

  if (rms < SILENCE_THRESHOLD) {
    emaHz = null
    return null
  }

  const hz = mcLeod(buffer, sampleRate)
  if (hz === null) return null

  if (emaHz === null) {
    emaHz = hz
  } else {
    const semitoneJump = Math.abs(12 * Math.log2(hz / emaHz))
    if (semitoneJump > JUMP_SEMITONES) {
      emaHz = hz
    } else {
      emaHz = EMA_ALPHA * hz + (1 - EMA_ALPHA) * emaHz
    }
  }

  return emaHz
}

// Normalised Square Difference Function value at a given lag.
// Returns a value in [-1, 1]; 1.0 = perfectly periodic at this lag.
function nsdfAt(buf: Float32Array<ArrayBuffer>, lag: number): number {
  const n = buf.length
  const len = n - lag
  let acf = 0
  let energy = 0
  for (let i = 0; i < len; i++) {
    acf += buf[i] * buf[i + lag]
    energy += buf[i] * buf[i] + buf[i + lag] * buf[i + lag]
  }
  return energy === 0 ? 0 : (2 * acf) / energy
}

function mcLeod(buffer: Float32Array<ArrayBuffer>, sampleRate: number): number | null {
  const n = buffer.length
  const minLag = Math.floor(sampleRate / MAX_FREQ)
  const maxLag = Math.min(Math.ceil(sampleRate / MIN_FREQ), n - 2)

  // Build NSDF and collect all local maxima
  const nsdf = new Float32Array(maxLag + 2)
  for (let lag = minLag; lag <= maxLag + 1; lag++) {
    nsdf[lag] = nsdfAt(buffer, lag)
  }

  // Collect positive local maxima
  const peaks: Array<{ lag: number; val: number }> = []
  for (let lag = minLag + 1; lag <= maxLag; lag++) {
    if (nsdf[lag] > 0 && nsdf[lag] > nsdf[lag - 1] && nsdf[lag] >= nsdf[lag + 1]) {
      peaks.push({ lag, val: nsdf[lag] })
    }
  }

  if (peaks.length === 0) return null

  // MPM: find the highest peak, then take the FIRST peak above K * highest
  const highestVal = peaks.reduce((m, p) => Math.max(m, p.val), -Infinity)
  const threshold = MPM_K * highestVal
  const chosen = peaks.find((p) => p.val >= threshold)
  if (!chosen || chosen.val <= 0) return null

  // Parabolic interpolation for sub-sample accuracy
  const { lag } = chosen
  const prev = nsdf[lag - 1]
  const curr = nsdf[lag]
  const next = nsdf[lag + 1]
  const denom = 2 * (2 * curr - next - prev)
  const shift = denom !== 0 ? (next - prev) / denom : 0

  return sampleRate / (lag + shift)
}
