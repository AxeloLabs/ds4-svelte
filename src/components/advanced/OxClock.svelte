<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxClock — DS-4 Live Wall Clock
   * │ Affiche l'heure actuelle dans un fuseau horaire donné.
   * │ Même design que OxTimer (segments monospace).
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   timezone — IANA timezone (default: 'America/Manaus')
   *   size     — 'sm' | 'md' | 'lg' (default: 'md')
   */
  import { onMount } from 'svelte'

  interface Props {
    timezone?: string
    size?: 'sm' | 'md' | 'lg'
  }

  let { timezone = 'America/Manaus', size = 'md' }: Props = $props()

  let hours = $state('--')
  let minutes = $state('--')
  let seconds = $state('--')

  function tick() {
    const now = new Date()
    const parts = new Intl.DateTimeFormat('fr-FR', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(now)

    for (const p of parts) {
      if (p.type === 'hour')   hours   = p.value
      if (p.type === 'minute') minutes = p.value
      if (p.type === 'second') seconds = p.value
    }
  }

  onMount(() => {
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  })
</script>

<div
  class="ox-clock"
  class:ox-clock-sm={size === 'sm'}
  class:ox-clock-lg={size === 'lg'}
  data-ui="ox-clock"
>
  <div class="ox-clock-display">
    <span class="ox-clock-segment" data-ui="clock-hours">{hours}</span>
    <span class="ox-clock-sep">:</span>
    <span class="ox-clock-segment" data-ui="clock-minutes">{minutes}</span>
    <span class="ox-clock-sep">:</span>
    <span class="ox-clock-segment" data-ui="clock-seconds">{seconds}</span>
  </div>
  <div class="ox-clock-tz" data-ui="clock-tz">{timezone.split('/')[1]?.replace('_', ' ') ?? timezone}</div>
</div>

<style>
  .ox-clock {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  /* ── Display ── */
  .ox-clock-display {
    display: flex;
    align-items: baseline;
    gap: 2px;
    background: var(--ox-surface-1);
    border: 1px solid var(--ox-outline-variant);
    border-radius: var(--ox-shape-lg, 16px);
    padding: 12px 20px;
  }

  .ox-clock-segment {
    font: 600 32px/1 'SF Mono', 'Fira Code', ui-monospace, monospace;
    color: var(--ox-on-surface);
    min-width: 2ch;
    text-align: center;
    letter-spacing: -0.5px;
  }

  .ox-clock-sep {
    font: 400 28px/1 system-ui;
    color: var(--ox-on-surface-variant);
    opacity: 0.5;
    padding: 0 2px;
    animation: blink 1s step-start infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 0.15; }
  }

  /* ── Timezone label ── */
  .ox-clock-tz {
    font: 500 10px system-ui;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ox-on-surface-variant);
    opacity: 0.6;
  }

  /* ── Size sm ── */
  .ox-clock-sm .ox-clock-display {
    padding: 8px 14px;
    border-radius: var(--ox-shape-md, 12px);
  }
  .ox-clock-sm .ox-clock-segment { font-size: 20px; }
  .ox-clock-sm .ox-clock-sep    { font-size: 18px; }

  /* ── Size lg ── */
  .ox-clock-lg .ox-clock-display {
    padding: 20px 32px;
    border-radius: var(--ox-shape-xl, 28px);
  }
  .ox-clock-lg .ox-clock-segment { font-size: 48px; }
  .ox-clock-lg .ox-clock-sep    { font-size: 40px; padding: 0 4px; }
</style>
