import { detectPitch } from './PitchDetector'
import { hzToNote } from './NoteUtils'
import type { DetectedNote } from './NoteUtils'

export type PitchCallback = (note: DetectedNote | null) => void

const FFT_SIZE = 4096

export class AudioEngine {
  private static instance: AudioEngine | null = null

  private context: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private stream: MediaStream | null = null
  private rafId: number | null = null
  private buffer: Float32Array<ArrayBuffer> | null = null
  private callback: PitchCallback | null = null
  private running = false

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) AudioEngine.instance = new AudioEngine()
    return AudioEngine.instance
  }

  async start(callback: PitchCallback): Promise<void> {
    if (this.running) return
    this.callback = callback

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      this.context = new AudioContext()
      await this.context.resume()

      this.analyser = this.context.createAnalyser()
      this.analyser.fftSize = FFT_SIZE
      this.analyser.smoothingTimeConstant = 0

      this.source = this.context.createMediaStreamSource(this.stream)
      this.source.connect(this.analyser)

      this.buffer = new Float32Array(this.analyser.fftSize) as Float32Array<ArrayBuffer>
      this.running = true
      this.loop()
    } catch (e) {
      this.cleanup()
      throw e
    }
  }

  stop(): void {
    this.running = false
    this.cleanup()
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser
  }

  suspend(): void {
    this.context?.suspend()
  }

  resume(): void {
    this.context?.resume()
  }

  private cleanup(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.source?.disconnect()
    this.source = null
    this.stream?.getTracks().forEach(t => t.stop())
    this.stream = null
    this.context?.close()
    this.context = null
    this.analyser = null
    this.buffer = null
    this.callback = null
  }

  private loop(): void {
    if (!this.running) return
    this.rafId = requestAnimationFrame(() => this.loop())

    if (!this.analyser || !this.buffer || !this.callback || !this.context) return
    this.analyser.getFloatTimeDomainData(this.buffer)

    const hz = detectPitch(this.buffer, this.context.sampleRate)
    this.callback(hz !== null ? hzToNote(hz) : null)
  }
}
