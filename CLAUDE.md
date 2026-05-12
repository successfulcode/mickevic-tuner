# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`mickevic-tuner` — a SolidJS + TypeScript browser-based instrument tuner with Guitar, Vocal, and Instrument modes. No backend. Runs entirely on Web Audio API.

## Commands

```bash
npm run dev      # start Vite dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

Use `/dev`, `/build` skills as shortcuts.

## Architecture

### Audio pipeline

Mic → `AudioEngine` (AudioContext + AnalyserNode) → `PitchDetector` (autocorrelation on 4096-sample buffer) → Hz → `NoteUtils` (Hz → note/octave/cents) → SolidJS signals → UI

Autocorrelation is used (not FFT) for accurate detection of low-frequency fundamentals (E2 = 82 Hz). The loop runs in `requestAnimationFrame`. AudioContext must be started from a user gesture.

### State

Global app state lives in `src/stores/appStore.ts` as SolidJS signals. Components read signals reactively — no prop-drilling for mode/tuning/pitch state.

### Tuning data

All presets are in `src/data/tunings.ts`. Strings are ordered **low to high**. Use `/add-tuning` skill or spawn `tuning-curator` agent to add presets safely.

### Design system

CSS tokens in `src/styles/variables.css`. Never hardcode color hex values in components — always use `var(--token-name)`. Key tokens: `--in-tune` (green ±5¢), `--close` (amber ±20¢), `--off` (red >20¢).

Canvas elements (TunerDial, WaveformStrip) run their own `requestAnimationFrame` loops inside `createEffect`. Always cancel via `onCleanup`.

## Agents

Spawn these sub-agents for specialised work:

| Agent | When to use |
|---|---|
| `audio-engineer` | Pitch detection bugs, AudioContext issues, frequency math, autocorrelation tuning |
| `ui-architect` | SolidJS components, Canvas animations, design system, layout issues |
| `tuning-curator` | Adding/editing tuning presets, validating schema, instrument coverage |

## Skills (slash commands)

| Skill | Description |
|---|---|
| `/dev` | Start the dev server |
| `/build` | Production build |
| `/add-tuning` | Add a new tuning preset interactively |
| `/audio-debug` | Audit and fix pitch detection accuracy |
| `/design-review` | Review components against the design system |
