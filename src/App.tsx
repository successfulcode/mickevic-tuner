import { Show, Switch, Match, createMemo } from 'solid-js'
import type { Component } from 'solid-js'
import { AudioEngine } from './audio/AudioEngine'
import { appStore } from './stores/appStore'
import ModeSelector from './components/ModeSelector'
import WaveformStrip from './components/WaveformStrip'
import GuitarView from './views/GuitarView'
import VocalView from './views/VocalView'
import InstrumentView from './views/InstrumentView'
import './styles/global.css'

type GlowState = 'idle' | 'in-tune' | 'close' | 'off'

const App: Component = () => {
  const glowState = createMemo((): GlowState => {
    if (!appStore.isListening() || !appStore.detectedNote()) return 'idle'
    const note  = appStore.detectedNote()!
    const tHz   = appStore.targetHz()
    const cents = tHz !== null ? 1200 * Math.log2(note.frequency / tHz) : note.cents
    const abs   = Math.abs(cents)
    if (abs <= 5)  return 'in-tune'
    if (abs <= 20) return 'close'
    return 'off'
  })

  const toggleListening = async () => {
    const engine = AudioEngine.getInstance()
    if (appStore.isListening()) {
      engine.stop()
      appStore.setIsListening(false)
      appStore.setDetectedNote(null)
      return
    }
    try {
      appStore.setError(null)
      await engine.start((note) => appStore.setDetectedNote(note))
      appStore.setIsListening(true)
    } catch {
      appStore.setError('Microphone access denied. Allow mic access and try again.')
    }
  }

  return (
    <div class="app">
      {/* Ambient glow layers — each cross-fades independently */}
      <div class={`glow-layer glow-idle${glowState() === 'idle' ? ' visible' : ''}`} />
      <div class={`glow-layer glow-in-tune${glowState() === 'in-tune' ? ' visible' : ''}`} />
      <div class={`glow-layer glow-close${glowState() === 'close' ? ' visible' : ''}`} />
      <div class={`glow-layer glow-off${glowState() === 'off' ? ' visible' : ''}`} />

      <header class="app-header">
        <span class="logo">MICKEVIC TUNER</span>
      </header>

      <ModeSelector />

      <main class="app-main">
        <Show when={appStore.error()}>
          <div class="error-banner">{appStore.error()}</div>
        </Show>

        <Switch>
          <Match when={appStore.mode() === 'guitar'}>
            <GuitarView />
          </Match>
          <Match when={appStore.mode() === 'vocal'}>
            <VocalView />
          </Match>
          <Match when={appStore.mode() === 'instrument'}>
            <InstrumentView />
          </Match>
        </Switch>
      </main>

      <WaveformStrip />

      <div class="listen-controls">
        <button
          class={`listen-btn${appStore.isListening() ? ' active' : ''}`}
          onClick={toggleListening}
        >
          <span class="listen-dot" />
          {appStore.isListening() ? 'Stop' : 'Start Tuning'}
        </button>
      </div>
    </div>
  )
}

export default App
