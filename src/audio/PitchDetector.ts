const SILENCE_THRESHOLD = 0.01
const CLARITY_THRESHOLD = 0.9
const SMOOTH_FRAMES = 4

const recentHz: number[] = []

export function detectPitch(buffer: Float32Array<ArrayBuffer>, sampleRate: number): number | null {
  let rmsSum = 0
  for (let i = 0; i < buffer.length; i++) rmsSum += buffer[i] * buffer[i]
  const rms = Math.sqrt(rmsSum / buffer.length)

  if (rms < SILENCE_THRESHOLD) {
    recentHz.length = 0
    return null
  }

  const hz = autocorrelate(buffer, rms, sampleRate)
  if (hz === null) return null

  recentHz.push(hz)
  if (recentHz.length > SMOOTH_FRAMES) recentHz.shift()

  return recentHz.reduce((a, b) => a + b, 0) / recentHz.length
}

function autocorrelate(buffer: Float32Array<ArrayBuffer>, rms: number, sampleRate: number): number | null {
  const n = buffer.length

  // Normalise using the already-computed RMS
  const buf = new Float32Array(n)
  for (let i = 0; i < n; i++) buf[i] = buffer[i] / rms

  let bestLag = -1
  let bestCorrelation = 0
  let lastCorrelation = 1
  let foundGoodCorrelation = false

  for (let lag = 0; lag < n / 2; lag++) {
    let correlation = 0
    for (let i = 0; i < n / 2; i++) correlation += buf[i] * buf[i + lag]
    correlation = (2 * correlation) / n

    if (correlation > CLARITY_THRESHOLD && correlation > lastCorrelation) {
      foundGoodCorrelation = true
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation
        bestLag = lag
      }
    } else if (foundGoodCorrelation) {
      // Parabolic interpolation around the peak for sub-sample accuracy
      const prev = bestLag > 0 ? corrAt(buf, bestLag - 1) : 0
      const curr = corrAt(buf, bestLag)
      const next = corrAt(buf, bestLag + 1)
      const denom = 2 * (2 * curr - next - prev)
      const shift = denom !== 0 ? (next - prev) / denom : 0
      return sampleRate / (bestLag + shift)
    }

    lastCorrelation = correlation
  }

  if (bestLag === -1) return null
  return sampleRate / bestLag
}

function corrAt(buf: Float32Array, lag: number): number {
  const n = buf.length
  let sum = 0
  for (let i = 0; i < n / 2; i++) sum += buf[i] * buf[i + lag]
  return (2 * sum) / n
}
