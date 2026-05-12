import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AudioEngine } from './AudioEngine'

function makeAnalyserMock() {
  return {
    fftSize: 0,
    smoothingTimeConstant: 0,
    getFloatTimeDomainData: vi.fn(),
  }
}

type ContextMock = ReturnType<typeof makeContextMock>

function makeContextMock(analyser: ReturnType<typeof makeAnalyserMock>) {
  return {
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createAnalyser: vi.fn().mockReturnValue(analyser),
    createMediaStreamSource: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
    sampleRate: 44100,
  }
}

function makeStreamMock() {
  return {
    getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
  }
}

// Returns a constructable AudioContext stub. Arrow functions cannot be used
// with `new`, so we use a regular function that returns the mock object.
function audioContextConstructor(ctx: ContextMock) {
  return function AudioContextMock() { return ctx } as unknown as typeof AudioContext
}

beforeEach(() => {
  ;(AudioEngine as unknown as Record<string, unknown>).instance = null
  vi.stubGlobal('requestAnimationFrame', vi.fn())
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('AudioEngine.getInstance', () => {
  it('always returns the same instance', () => {
    const a = AudioEngine.getInstance()
    const b = AudioEngine.getInstance()
    expect(a).toBe(b)
  })
})

describe('AudioEngine.start', () => {
  it('requests microphone access', async () => {
    const analyser = makeAnalyserMock()
    const context = makeContextMock(analyser)
    const stream = makeStreamMock()
    const getUserMedia = vi.fn().mockResolvedValue(stream)

    vi.stubGlobal('AudioContext', audioContextConstructor(context))
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })

    const engine = AudioEngine.getInstance()
    await engine.start(vi.fn())

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: false })
    engine.stop()
  })

  it('sets the analyser fftSize to 4096', async () => {
    const analyser = makeAnalyserMock()
    const context = makeContextMock(analyser)
    const stream = makeStreamMock()

    vi.stubGlobal('AudioContext', audioContextConstructor(context))
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    })

    const engine = AudioEngine.getInstance()
    await engine.start(vi.fn())

    expect(analyser.fftSize).toBe(4096)
    engine.stop()
  })

  it('disables analyser smoothing', async () => {
    const analyser = makeAnalyserMock()
    const context = makeContextMock(analyser)
    const stream = makeStreamMock()

    vi.stubGlobal('AudioContext', audioContextConstructor(context))
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    })

    const engine = AudioEngine.getInstance()
    await engine.start(vi.fn())

    expect(analyser.smoothingTimeConstant).toBe(0)
    engine.stop()
  })

  it('does not start twice if already running', async () => {
    const analyser = makeAnalyserMock()
    const context = makeContextMock(analyser)
    const stream = makeStreamMock()
    const getUserMedia = vi.fn().mockResolvedValue(stream)

    vi.stubGlobal('AudioContext', audioContextConstructor(context))
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })

    const engine = AudioEngine.getInstance()
    await engine.start(vi.fn())
    await engine.start(vi.fn())

    expect(getUserMedia).toHaveBeenCalledTimes(1)
    engine.stop()
  })

  it('throws and cleans up when getUserMedia is denied', async () => {
    vi.stubGlobal('AudioContext', audioContextConstructor(makeContextMock(makeAnalyserMock())))
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException('Permission denied')),
      },
    })

    const engine = AudioEngine.getInstance()
    await expect(engine.start(vi.fn())).rejects.toThrow()
    expect(engine.getAnalyser()).toBeNull()
  })
})

describe('AudioEngine.stop', () => {
  it('stops tracks and closes the AudioContext', async () => {
    const analyser = makeAnalyserMock()
    const context = makeContextMock(analyser)
    const track = { stop: vi.fn() }
    const stream = { getTracks: vi.fn().mockReturnValue([track]) }

    vi.stubGlobal('AudioContext', audioContextConstructor(context))
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    })

    const engine = AudioEngine.getInstance()
    await engine.start(vi.fn())
    engine.stop()

    expect(track.stop).toHaveBeenCalled()
    expect(context.close).toHaveBeenCalled()
    expect(engine.getAnalyser()).toBeNull()
  })

  it('cancels the rAF loop', async () => {
    const analyser = makeAnalyserMock()
    const context = makeContextMock(analyser)
    const stream = makeStreamMock()
    const cancelRaf = vi.fn()

    vi.stubGlobal('AudioContext', audioContextConstructor(context))
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    })
    vi.stubGlobal('cancelAnimationFrame', cancelRaf)

    const engine = AudioEngine.getInstance()
    await engine.start(vi.fn())
    engine.stop()

    expect(cancelRaf).toHaveBeenCalled()
  })
})

describe('AudioEngine.getAnalyser', () => {
  it('returns null before start', () => {
    expect(AudioEngine.getInstance().getAnalyser()).toBeNull()
  })

  it('returns the AnalyserNode after start', async () => {
    const analyser = makeAnalyserMock()
    const context = makeContextMock(analyser)
    const stream = makeStreamMock()

    vi.stubGlobal('AudioContext', audioContextConstructor(context))
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    })

    const engine = AudioEngine.getInstance()
    await engine.start(vi.fn())

    expect(engine.getAnalyser()).toBe(analyser)
    engine.stop()
  })
})

describe('AudioEngine.suspend / resume', () => {
  it('calls context.suspend and context.resume', async () => {
    const analyser = makeAnalyserMock()
    const context = makeContextMock(analyser)
    const stream = makeStreamMock()

    vi.stubGlobal('AudioContext', audioContextConstructor(context))
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    })

    const engine = AudioEngine.getInstance()
    await engine.start(vi.fn())
    engine.suspend()
    engine.resume()

    expect(context.suspend).toHaveBeenCalled()
    expect(context.resume).toHaveBeenCalledTimes(2) // once in start(), once via resume()
    engine.stop()
  })
})
