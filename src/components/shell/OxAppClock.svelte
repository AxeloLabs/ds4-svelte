<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxClock — DS-4 Live Clock                               │
   * │                                                         │
   * │ Détecte automatiquement la timezone du navigateur.      │
   * │ Affiche HH:MM + abréviation timezone (CET, EST, etc.)  │
   * │                                                         │
   * │ Props:                                                   │
   * │   showSeconds — affiche les secondes (default false)    │
   * │   showTz      — affiche l'abréviation TZ (default true) │
   * └─────────────────────────────────────────────────────────┘
   */
  import { onMount } from 'svelte'
  import { Clock } from '@lucide/svelte'

  interface Props {
    showSeconds?: boolean
    showTz?: boolean
    showIcon?: boolean
  }

  let { showSeconds = false, showTz = true, showIcon = true }: Props = $props()

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // TIMEZONE DETECTION — via Intl API, zéro géoloc
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  function detectTzAbbr(): string {
    try {
      // "America/Sao_Paulo" → parts will include timeZoneName: 'BRT', 'BRST', 'CET', 'EST'...
      const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
        .formatToParts(new Date())
      const tzPart = parts.find(p => p.type === 'timeZoneName')?.value ?? ''
      // Normalise: "UTC+1" → "UTC+1", "Central European Time" → keep as-is if short
      // Keep it concise: max 6 chars
      return tzPart.length <= 6 ? tzPart : tzPart.slice(0, 6)
    } catch {
      return ''
    }
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // STATE
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let timeStr  = $state('--:--')
  let tzAbbr   = $state('')

  function tick() {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    const s = String(now.getSeconds()).padStart(2, '0')
    timeStr = showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
  }

  onMount(() => {
    tzAbbr = detectTzAbbr()
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  })
</script>

<div class="ox-clock" data-ui="ox-clock" aria-label="Heure locale" aria-live="off">
  {#if showIcon}
    <Clock class="ox-clock-icon" size={13} strokeWidth={2} />
  {/if}
  <span class="ox-clock-time">{timeStr}</span>
  {#if showTz && tzAbbr}
    <span class="ox-clock-tz">{tzAbbr}</span>
  {/if}
</div>

<style>
  .ox-clock {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-family: system-ui, sans-serif;
    flex-shrink: 0;
  }

  .ox-clock-icon {
    color: var(--ox-outline, #79747E);
    flex-shrink: 0;
  }

  .ox-clock-time {
    font: 600 13px/1 'SF Mono', ui-monospace, 'Cascadia Code', monospace;
    color: var(--ox-on-surface, #1C1B1F);
    letter-spacing: 0.5px;
    /* Prevent layout shift when seconds tick */
    font-variant-numeric: tabular-nums;
  }

  .ox-clock-tz {
    font: 500 9px/1 system-ui;
    text-transform: uppercase;
    color: var(--ox-outline, #79747E);
    letter-spacing: 0.5px;
    align-self: flex-end;
    margin-bottom: 1px;
  }
</style>
