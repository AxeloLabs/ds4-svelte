<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxTimer — DS-4 Timer / Countdown / Stopwatch
   * │ Powered by @zag-js/timer
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id         — unique id (required)
   *   countdown  — true = countdown, false = stopwatch (default: false)
   *   startMs    — initial time in ms (countdown mode)
   *   targetMs   — target time in ms (stopwatch stop point)
   *   autoStart  — start immediately (default: false)
   *   showDays   — show days segment (default: false)
   *   size       — 'sm' | 'md' | 'lg' (default: 'md')
   *   onComplete — callback when timer reaches target
   */
  import * as timer from '@zag-js/timer'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { PauseIcon, PlayIcon, RotateCcwIcon } from '@lucide/svelte'

  interface Props {
    id: string
    countdown?: boolean
    startMs?: number
    targetMs?: number
    autoStart?: boolean
    showDays?: boolean
    size?: 'sm' | 'md' | 'lg'
    onComplete?: () => void
  }

  let {
    id,
    countdown = false,
    startMs,
    targetMs,
    autoStart = false,
    showDays = false,
    size = 'md',
    onComplete,
  }: Props = $props()

  const service = useMachine(timer.machine, () => ({
    id,
    countdown,
    startMs,
    targetMs,
    autoStart,
    onComplete,
  }))

  const api = $derived(timer.connect(service, normalizeProps))
</script>

<div
  class="ox-timer"
  class:ox-timer-sm={size === 'sm'}
  class:ox-timer-lg={size === 'lg'}
  data-ui="ox-timer"
>
  <!-- Display -->
  <div class="ox-timer-display" {...api.getRootProps()}>
    {#if showDays}
      <span class="ox-timer-segment" {...api.getItemProps({ type: 'days' })}>
        {api.formattedTime.days}
      </span>
      <span class="ox-timer-sep" {...api.getSeparatorProps()}>:</span>
    {/if}
    <span class="ox-timer-segment" {...api.getItemProps({ type: 'hours' })}>
      {api.formattedTime.hours}
    </span>
    <span class="ox-timer-sep" {...api.getSeparatorProps()}>:</span>
    <span class="ox-timer-segment" {...api.getItemProps({ type: 'minutes' })}>
      {api.formattedTime.minutes}
    </span>
    <span class="ox-timer-sep" {...api.getSeparatorProps()}>:</span>
    <span class="ox-timer-segment" {...api.getItemProps({ type: 'seconds' })}>
      {api.formattedTime.seconds}
    </span>
  </div>

  <!-- Controls -->
  <div class="ox-timer-controls">
    {#if api.running}
      <button class="ox-timer-btn ox-timer-btn-pause" onclick={api.pause} data-ui="timer-pause" aria-label="Pause">
        <PauseIcon size={16} strokeWidth={2} />
      </button>
    {:else}
      <button class="ox-timer-btn ox-timer-btn-start" onclick={api.start} data-ui="timer-start" aria-label="Start">
        <PlayIcon size={16} strokeWidth={2} />
      </button>
    {/if}
    <button class="ox-timer-btn ox-timer-btn-reset" onclick={api.reset} data-ui="timer-reset" aria-label="Reset">
      <RotateCcwIcon size={16} strokeWidth={2} />
    </button>
  </div>
</div>

<style>
  .ox-timer {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    font-family: system-ui, sans-serif;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     DISPLAY
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-timer-display {
    display: flex;
    align-items: baseline;
    gap: 2px;
    background: var(--ox-surface-1);
    border: 1px solid var(--ox-outline-variant);
    border-radius: var(--ox-shape-lg, 16px);
    padding: 12px 20px;
  }

  .ox-timer-segment {
    font: 600 32px/1 'SF Mono', 'Fira Code', ui-monospace, monospace;
    color: var(--ox-on-surface);
    min-width: 2ch;
    text-align: center;
    letter-spacing: -0.5px;
  }

  .ox-timer-sep {
    font: 400 28px/1 system-ui;
    color: var(--ox-on-surface-variant);
    opacity: 0.5;
    padding: 0 2px;
  }

  /* ── Size sm ── */
  .ox-timer-sm .ox-timer-display {
    padding: 8px 14px;
    border-radius: var(--ox-shape-md, 12px);
  }
  .ox-timer-sm .ox-timer-segment {
    font-size: 20px;
  }
  .ox-timer-sm .ox-timer-sep {
    font-size: 18px;
  }
  .ox-timer-sm .ox-timer-controls {
    gap: 6px;
  }
  .ox-timer-sm .ox-timer-btn {
    width: 32px;
    height: 32px;
  }

  /* ── Size lg ── */
  .ox-timer-lg .ox-timer-display {
    padding: 20px 32px;
    border-radius: var(--ox-shape-xl, 28px);
  }
  .ox-timer-lg .ox-timer-segment {
    font-size: 48px;
  }
  .ox-timer-lg .ox-timer-sep {
    font-size: 40px;
    padding: 0 4px;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     CONTROLS
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-timer-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ox-timer-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--ox-outline-variant);
    border-radius: var(--ox-shape-full, 999px);
    background: var(--ox-surface);
    color: var(--ox-on-surface-variant);
    cursor: pointer;
    transition: background 120ms, color 120ms, border-color 120ms;
  }

  .ox-timer-btn:hover {
    background: var(--ox-surface-2);
    color: var(--ox-on-surface);
  }

  .ox-timer-btn:active {
    transform: scale(0.95);
  }

  .ox-timer-btn-start {
    background: var(--ox-primary);
    border-color: var(--ox-primary);
    color: var(--ox-on-primary);
  }
  .ox-timer-btn-start:hover {
    background: color-mix(in srgb, var(--ox-primary) 88%, black);
    color: var(--ox-on-primary);
  }

  .ox-timer-btn-pause {
    background: var(--ox-secondary-container);
    border-color: var(--ox-secondary-container);
    color: var(--ox-on-secondary-container);
  }
  .ox-timer-btn-pause:hover {
    background: color-mix(in srgb, var(--ox-secondary-container) 85%, black);
    color: var(--ox-on-secondary-container);
  }

  .ox-timer-btn-reset:hover {
    border-color: var(--ox-error);
    color: var(--ox-error);
  }
</style>
