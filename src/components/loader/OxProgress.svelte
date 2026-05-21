<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxProgress — DS-4 Linear Progress Indicator
   * │ Powered by @zag-js/progress
   * │ Ref: https://m3.material.io/components/progress-indicators/specs
   * │ Determinate (value) or Indeterminate (value=null)
   * └─────────────────────────────────────────────────────────┘
   */
  import * as progress from '@zag-js/progress'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id?: string
    value?: number | null
    max?: number
    label?: string
  }

  let {
    id = `ox-progress-${Math.random().toString(36).slice(2, 9)}`,
    value = null,
    max = 100,
    label,
  }: Props = $props()

  const isIndeterminate = $derived(value === null)

  const service = useMachine(progress.machine, () => ({
    id,
    value: isIndeterminate ? null : value,
    max,
  }))

  const api = $derived(progress.connect(service, normalizeProps))

  $effect(() => {
    if (!isIndeterminate && value !== api.value) {
      api.setValue(value!)
    }
  })
</script>

<div
  class="ox-progress"
  class:ox-progress-indeterminate={isIndeterminate}
  {...api.getRootProps()}
  data-ui="ox-progress"
>
  {#if label}
    <div class="ox-progress-header">
      <span class="ox-progress-label" {...api.getLabelProps()}>{label}</span>
      {#if !isIndeterminate}
        <span class="ox-progress-value" {...api.getValueTextProps()}>
          {api.valueAsString}
        </span>
      {/if}
    </div>
  {/if}
  <div class="ox-progress-track" {...api.getTrackProps()}>
    <div class="ox-progress-fill" {...api.getRangeProps()}></div>
  </div>
</div>

<style>
  .ox-progress {
    width: 100%;
    font-family: system-ui, sans-serif;
  }

  .ox-progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .ox-progress-label {
    font: 500 13px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
  }

  .ox-progress-value {
    font: 400 12px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }

  /* ── Track — MD3: 4px height, surface-variant ── */
  .ox-progress-track {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: var(--ox-surface-variant, #E7E0EC);
    overflow: hidden;
    position: relative;
  }

  /* ── Determinate fill ── */
  .ox-progress-fill {
    height: 100%;
    border-radius: 2px;
    background: var(--ox-primary, #6750A4);
    transition: width 300ms cubic-bezier(0.2, 0, 0, 1);
  }

  /* ── Indeterminate animation — MD3 spec ── */
  .ox-progress-indeterminate .ox-progress-fill {
    width: 50% !important;
    animation: ox-linear-indeterminate 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  @keyframes ox-linear-indeterminate {
    0%   { transform: translateX(-100%); }
    50%  { transform: translateX(60%); }
    100% { transform: translateX(200%); }
  }
</style>
