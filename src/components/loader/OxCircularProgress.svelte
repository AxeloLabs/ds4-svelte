<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxCircularProgress — DS-4 Circular Progress Indicator
   * │ Powered by @zag-js/progress (same as OxProgress)
   * │ Ref: https://m3.material.io/components/progress-indicators
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id    — unique id (required)
   *   value — current progress 0-100 (omit for indeterminate)
   *   max   — maximum value (default 100)
   *   size  — 'sm' (32) | 'md' (48) | 'lg' (64) (default: 'md')
   *   thickness — stroke width in px (default: 4)
   *   label — optional center label
   *   showValue — show percentage in center (default: false)
   */
  import * as progress from '@zag-js/progress'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id: string
    value?: number | null
    max?: number
    size?: 'sm' | 'md' | 'lg'
    thickness?: number
    label?: string
    showValue?: boolean
  }

  let {
    id,
    value = null,
    max = 100,
    size = 'md',
    thickness = 4,
    label,
    showValue = false,
  }: Props = $props()

  const sizeMap = { sm: 32, md: 48, lg: 64 } as const
  const fontMap = { sm: 9, md: 12, lg: 16 } as const
  const px = $derived(sizeMap[size])

  const service = useMachine(progress.machine, () => ({
    id,
    value,
    max,
  }))

  const api = $derived(progress.connect(service, normalizeProps))

  $effect(() => {
    if (value !== null && value !== api.value) {
      api.setValue(value)
    }
  })
</script>

<div
  class="ox-circular"
  class:ox-circular-indeterminate={value === null}
  {...api.getRootProps()}
  data-ui="ox-circular-progress"
  style="--ox-circ-size:{px}px; --ox-circ-thickness:{thickness}px; --ox-circ-font:{fontMap[size]}px; --size:{px}px; --thickness:{thickness}px"
>
  {#if label}
    <span class="ox-circular-label" {...api.getLabelProps()}>{label}</span>
  {/if}

  <div class="ox-circular-indicator">
    <svg {...api.getCircleProps()}>
      <circle {...api.getCircleTrackProps()} />
      <circle {...api.getCircleRangeProps()} />
    </svg>

    {#if showValue && value !== null}
      <span class="ox-circular-value" {...api.getValueTextProps()}>
        {Math.round(value)}%
      </span>
    {/if}
  </div>
</div>

<style>
  .ox-circular {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-family: system-ui, sans-serif;
  }

  .ox-circular-label {
    font: 500 var(--ox-circ-font) system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }

  .ox-circular-indicator {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ox-circ-size);
    height: var(--ox-circ-size);
  }

  .ox-circular-indicator svg {
    width: var(--ox-circ-size);
    height: var(--ox-circ-size);
  }

  /* Track */
  .ox-circular-indicator svg circle:first-child {
    stroke: var(--ox-surface-3, #E7E0EC);
    fill: none;
    stroke-width: var(--ox-circ-thickness);
  }

  /* Range */
  .ox-circular-indicator svg circle:last-child {
    stroke: var(--ox-primary, #6750A4);
    fill: none;
    stroke-width: var(--ox-circ-thickness);
    stroke-linecap: round;
    transition: stroke-dashoffset 300ms cubic-bezier(0.2, 0, 0, 1);
  }

  /* Value text in center */
  .ox-circular-value {
    position: absolute;
    font: 600 var(--ox-circ-font) system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    user-select: none;
  }

  /* Indeterminate spin */
  .ox-circular-indeterminate .ox-circular-indicator svg {
    animation: ox-circ-spin 1.4s linear infinite;
  }
  .ox-circular-indeterminate .ox-circular-indicator svg circle:last-child {
    stroke-dasharray: 80, 200;
    animation: ox-circ-dash 1.4s ease-in-out infinite;
  }

  @keyframes ox-circ-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes ox-circ-dash {
    0%   { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
    50%  { stroke-dasharray: 100, 200; stroke-dashoffset: -15; }
    100% { stroke-dasharray: 100, 200; stroke-dashoffset: -125; }
  }
</style>
