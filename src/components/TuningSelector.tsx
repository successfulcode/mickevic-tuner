import { createSignal, For, Show } from 'solid-js'
import type { Component } from 'solid-js'
import { appStore } from '../stores/appStore'
import { getTuningsByInstrument } from '../data/tunings'
import type { TuningPreset, Instrument } from '../data/tunings'
import { noteRefToHz } from '../audio/NoteUtils'

const TAG_COLORS: Record<string, string> = {
  rock:      '#ff6655',
  metal:     '#cc3344',
  blues:     '#ffaa00',
  folk:      '#44cc88',
  celtic:    '#44ddaa',
  slide:     '#aa88ff',
  open:      '#66aaff',
  bluegrass: '#ffcc44',
}

const INSTRUMENT_TUNINGS: Record<string, Instrument> = {
  guitar:     'guitar',
  bass:       'bass',
  ukulele:    'ukulele',
  violin:     'violin',
  cello:      'cello',
  banjo:      'banjo',
  mandolin:   'mandolin',
}

function notesLabel(preset: TuningPreset): string {
  return preset.strings.map(s => s.note).join(' ')
}

const TuningSelector: Component<{ instrument?: Instrument }> = (props) => {
  const [open, setOpen] = createSignal(false)

  const instrument = () => props.instrument ?? 'guitar'
  const presets    = () => getTuningsByInstrument(INSTRUMENT_TUNINGS[instrument()] ?? 'guitar')
  const selected   = () => appStore.selectedTuning()

  const selectTuning = (preset: TuningPreset) => {
    appStore.setSelectedTuning(preset)
    appStore.setActiveStringIndex(0)
    appStore.setTargetHz(noteRefToHz(preset.strings[0].note, preset.strings[0].octave))
    setOpen(false)
  }

  return (
    <div class="tuning-selector">
      {/* ── Trigger button ── */}
      <button class="tuning-trigger" onClick={() => setOpen(v => !v)}>
        <div class="tuning-trigger-left">
          <span class="tuning-trigger-name">{selected()?.name ?? '—'}</span>
          <span class="tuning-trigger-notes">{selected() ? notesLabel(selected()!) : ''}</span>
        </div>
        <span class={`tuning-chevron${open() ? ' open' : ''}`}>›</span>
      </button>

      {/* ── Description for selected tuning ── */}
      <Show when={selected()?.description && !open()}>
        <p class="tuning-description">{selected()!.description}</p>
        <Show when={selected()?.tags?.length}>
          <div class="tuning-tags">
            <For each={selected()!.tags}>
              {tag => (
                <span class="tuning-tag" style={{ background: `${TAG_COLORS[tag] ?? '#555577'}22`, color: TAG_COLORS[tag] ?? 'var(--text-dim)', 'border-color': `${TAG_COLORS[tag] ?? '#555577'}55` }}>
                  {tag}
                </span>
              )}
            </For>
          </div>
        </Show>
      </Show>

      {/* ── Preset list ── */}
      <Show when={open()}>
        <div class="tuning-list">
          <For each={presets()}>
            {(preset) => (
              <button
                class={`tuning-row${selected()?.id === preset.id ? ' active' : ''}`}
                onClick={() => selectTuning(preset)}
              >
                <div class="tuning-row-left">
                  <span class="tuning-row-name">{preset.name}</span>
                  <Show when={preset.tags?.length}>
                    <div class="tuning-tags" style={{ 'margin-top': '2px' }}>
                      <For each={preset.tags}>
                        {tag => (
                          <span class="tuning-tag" style={{ background: `${TAG_COLORS[tag] ?? '#555577'}22`, color: TAG_COLORS[tag] ?? 'var(--text-dim)', 'border-color': `${TAG_COLORS[tag] ?? '#555577'}55` }}>
                            {tag}
                          </span>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
                <span class="tuning-row-notes">{notesLabel(preset)}</span>
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

export default TuningSelector
