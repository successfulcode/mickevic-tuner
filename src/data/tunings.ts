import type { NoteRef } from './notes'

export type Instrument = 'guitar' | 'bass' | 'ukulele' | 'violin' | 'cello' | 'banjo' | 'mandolin'

export interface TuningPreset {
  id: string
  instrument: Instrument
  name: string
  strings: NoteRef[]
  description: string
  tags?: string[]
}

export const TUNINGS: TuningPreset[] = [
  // ─── Guitar ──────────────────────────────────────────────────────────────
  {
    id: 'guitar-standard',
    instrument: 'guitar',
    name: 'Standard',
    strings: [
      { note: 'E', octave: 2 }, { note: 'A', octave: 2 }, { note: 'D', octave: 3 },
      { note: 'G', octave: 3 }, { note: 'B', octave: 3 }, { note: 'E', octave: 4 },
    ],
    description: 'The universal reference tuning for six-string guitar.',
  },
  {
    id: 'guitar-drop-d',
    instrument: 'guitar',
    name: 'Drop D',
    strings: [
      { note: 'D', octave: 2 }, { note: 'A', octave: 2 }, { note: 'D', octave: 3 },
      { note: 'G', octave: 3 }, { note: 'B', octave: 3 }, { note: 'E', octave: 4 },
    ],
    description: 'Lower the 6th string to D for easy one-finger power chords. Essential for rock and metal.',
    tags: ['rock', 'metal'],
  },
  {
    id: 'guitar-dadgad',
    instrument: 'guitar',
    name: 'DADGAD',
    strings: [
      { note: 'D', octave: 2 }, { note: 'A', octave: 2 }, { note: 'D', octave: 3 },
      { note: 'G', octave: 3 }, { note: 'A', octave: 3 }, { note: 'D', octave: 4 },
    ],
    description: 'Open modal tuning popularised by Davy Graham. A staple of Celtic and Middle-Eastern folk fingerstyle.',
    tags: ['folk', 'celtic', 'open'],
  },
  {
    id: 'guitar-open-g',
    instrument: 'guitar',
    name: 'Open G',
    strings: [
      { note: 'D', octave: 2 }, { note: 'G', octave: 2 }, { note: 'D', octave: 3 },
      { note: 'G', octave: 3 }, { note: 'B', octave: 3 }, { note: 'D', octave: 4 },
    ],
    description: 'Strumming open gives a G major chord. Favoured by Keith Richards and Delta blues slide players.',
    tags: ['blues', 'slide', 'open'],
  },
  {
    id: 'guitar-open-d',
    instrument: 'guitar',
    name: 'Open D',
    strings: [
      { note: 'D', octave: 2 }, { note: 'A', octave: 2 }, { note: 'D', octave: 3 },
      { note: 'F#', octave: 3 }, { note: 'A', octave: 3 }, { note: 'D', octave: 4 },
    ],
    description: 'Rich open D major resonance. Widely used in blues, folk, and slide guitar.',
    tags: ['blues', 'slide', 'folk', 'open'],
  },
  {
    id: 'guitar-open-e',
    instrument: 'guitar',
    name: 'Open E',
    strings: [
      { note: 'E', octave: 2 }, { note: 'B', octave: 2 }, { note: 'E', octave: 3 },
      { note: 'G#', octave: 3 }, { note: 'B', octave: 3 }, { note: 'E', octave: 4 },
    ],
    description: 'Sounds an E major open. A classic slide tuning — used by Duane Allman and Derek Trucks.',
    tags: ['slide', 'blues', 'open'],
  },
  {
    id: 'guitar-half-down',
    instrument: 'guitar',
    name: 'Half-step Down',
    strings: [
      { note: 'D#', octave: 2 }, { note: 'G#', octave: 2 }, { note: 'C#', octave: 3 },
      { note: 'F#', octave: 3 }, { note: 'A#', octave: 3 }, { note: 'D#', octave: 4 },
    ],
    description: 'Everything down a half-step. Eases string bending and adds darkness — Hendrix, SRV, Guns N\' Roses.',
    tags: ['rock'],
  },
  {
    id: 'guitar-full-down',
    instrument: 'guitar',
    name: 'Full-step Down',
    strings: [
      { note: 'D', octave: 2 }, { note: 'G', octave: 2 }, { note: 'C', octave: 3 },
      { note: 'F', octave: 3 }, { note: 'A', octave: 3 }, { note: 'D', octave: 4 },
    ],
    description: 'A full step down gives a heavier, darker tone. Common in grunge and hard rock.',
    tags: ['rock', 'metal'],
  },
  {
    id: 'guitar-drop-c',
    instrument: 'guitar',
    name: 'Drop C',
    strings: [
      { note: 'C', octave: 2 }, { note: 'G', octave: 2 }, { note: 'C', octave: 3 },
      { note: 'F', octave: 3 }, { note: 'A', octave: 3 }, { note: 'D', octave: 4 },
    ],
    description: 'Full-step down with 6th dropped to C. Massive sound for modern metal and djent.',
    tags: ['metal'],
  },
  {
    id: 'guitar-double-drop-d',
    instrument: 'guitar',
    name: 'Double Drop D',
    strings: [
      { note: 'D', octave: 2 }, { note: 'A', octave: 2 }, { note: 'D', octave: 3 },
      { note: 'G', octave: 3 }, { note: 'B', octave: 3 }, { note: 'D', octave: 4 },
    ],
    description: 'Both E strings dropped to D. Popular in folk-rock — Neil Young uses it extensively.',
    tags: ['folk', 'rock'],
  },

  // ─── Bass ─────────────────────────────────────────────────────────────────
  {
    id: 'bass-standard',
    instrument: 'bass',
    name: 'Standard',
    strings: [
      { note: 'E', octave: 1 }, { note: 'A', octave: 1 },
      { note: 'D', octave: 2 }, { note: 'G', octave: 2 },
    ],
    description: 'Standard four-string bass tuning.',
  },
  {
    id: 'bass-drop-d',
    instrument: 'bass',
    name: 'Drop D',
    strings: [
      { note: 'D', octave: 1 }, { note: 'A', octave: 1 },
      { note: 'D', octave: 2 }, { note: 'G', octave: 2 },
    ],
    description: 'Lower the E string to D for extended low-end reach.',
    tags: ['rock', 'metal'],
  },
  {
    id: 'bass-5string',
    instrument: 'bass',
    name: '5-String Standard',
    strings: [
      { note: 'B', octave: 1 }, { note: 'E', octave: 1 }, { note: 'A', octave: 1 },
      { note: 'D', octave: 2 }, { note: 'G', octave: 2 },
    ],
    description: 'Adds a low B string for extended range. Common in jazz, funk, and metal.',
  },

  // ─── Ukulele ──────────────────────────────────────────────────────────────
  {
    id: 'ukulele-standard',
    instrument: 'ukulele',
    name: 'Standard (GCEA)',
    strings: [
      { note: 'G', octave: 4 }, { note: 'C', octave: 4 },
      { note: 'E', octave: 4 }, { note: 'A', octave: 4 },
    ],
    description: 'Re-entrant high-G tuning. The classic soprano/concert/tenor uke sound.',
  },
  {
    id: 'ukulele-baritone',
    instrument: 'ukulele',
    name: 'Baritone (DGBE)',
    strings: [
      { note: 'D', octave: 3 }, { note: 'G', octave: 3 },
      { note: 'B', octave: 3 }, { note: 'E', octave: 4 },
    ],
    description: 'Same as guitar\'s top four strings. Deeper tone, easier for guitar players to adapt.',
  },

  // ─── Violin ───────────────────────────────────────────────────────────────
  {
    id: 'violin-standard',
    instrument: 'violin',
    name: 'Standard',
    strings: [
      { note: 'G', octave: 3 }, { note: 'D', octave: 4 },
      { note: 'A', octave: 4 }, { note: 'E', octave: 5 },
    ],
    description: 'Standard orchestral violin tuning in perfect fifths.',
  },

  // ─── Cello ────────────────────────────────────────────────────────────────
  {
    id: 'cello-standard',
    instrument: 'cello',
    name: 'Standard',
    strings: [
      { note: 'C', octave: 2 }, { note: 'G', octave: 2 },
      { note: 'D', octave: 3 }, { note: 'A', octave: 3 },
    ],
    description: 'Standard cello tuning in perfect fifths.',
  },

  // ─── Banjo ────────────────────────────────────────────────────────────────
  {
    id: 'banjo-open-g',
    instrument: 'banjo',
    name: 'Open G (5-string)',
    strings: [
      { note: 'G', octave: 4 }, { note: 'D', octave: 3 }, { note: 'G', octave: 3 },
      { note: 'B', octave: 3 }, { note: 'D', octave: 4 },
    ],
    description: 'Standard 5-string bluegrass banjo tuning. The short 5th string is the drone.',
    tags: ['folk', 'bluegrass'],
  },

  // ─── Mandolin ─────────────────────────────────────────────────────────────
  {
    id: 'mandolin-standard',
    instrument: 'mandolin',
    name: 'Standard',
    strings: [
      { note: 'G', octave: 3 }, { note: 'D', octave: 4 },
      { note: 'A', octave: 4 }, { note: 'E', octave: 5 },
    ],
    description: 'Same intervals as violin, tuned in perfect fifths. Paired strings (courses).',
  },
]

export function getTuningsByInstrument(instrument: Instrument): TuningPreset[] {
  return TUNINGS.filter(t => t.instrument === instrument)
}
