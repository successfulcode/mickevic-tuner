# mickevic-tuner

A browser-based instrument tuner built with SolidJS and the Web Audio API. No backend, no installs — just open it and tune.

**Live:** [mickevic-tuner.netlify.app](https://mickevic-tuner.netlify.app/)

---

## Features

- **Real-time pitch detection** via autocorrelation on a 4096-sample buffer — accurate down to E2 (82 Hz)
- **Three modes** — Guitar/Instrument, Vocal, and a generic Instrument view
- **19 tuning presets** across 7 instruments: Guitar (10), Bass (3), Ukulele (2), Violin, Cello, Banjo, Mandolin
- **Cents indicator** with colour feedback: green (±5¢ in tune), amber (±20¢ close), red (>20¢ off)
- **Animated TunerDial and WaveformStrip** rendered on Canvas
- **PWA support** — installable as a standalone app on mobile and desktop

## Instruments & presets

| Instrument | Presets |
|---|---|
| Guitar | Standard, Drop D, DADGAD, Open G, Open D, Open E, Open A, Half Step Down, Full Step Down, Double Drop D |
| Bass | Standard, Drop D, 5-String |
| Ukulele | Standard (GCEA), Baritone (DGBE) |
| Violin | Standard (GDAE) |
| Cello | Standard (CGDA) |
| Banjo | Standard Open G |
| Mandolin | Standard (GDAE) |

## Tech stack

- [SolidJS](https://solidjs.com/) — reactive UI, no virtual DOM
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) — `AudioContext`, `AnalyserNode`, `getUserMedia`
- TypeScript + Vite
- CSS custom properties design system

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```

Microphone access is required. On first load the browser will prompt for permission — pitch detection starts after you grant it.

## Architecture

```
Mic → AudioEngine (AudioContext + AnalyserNode)
    → PitchDetector (autocorrelation, rAF loop)
    → NoteUtils (Hz → note / octave / cents)
    → SolidJS signals
    → UI components
```

Global state lives in `src/stores/appStore.ts`. All tuning presets are in `src/data/tunings.ts` (strings ordered low to high).

## License

MIT
