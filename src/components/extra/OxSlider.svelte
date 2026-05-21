<script lang="ts">
  /**
   * OxSlider — DS-4 Slider
   * Powered by @zag-js/slider v1.38
   *
   * Props:
   *   id    — unique id (required)
   *   min   — minimum value (default 0)
   *   max   — maximum value (default 100)
   *   value — current value (bindable)
   *   step  — step increment (default 1)
   *   label — optional label with current value display
   */
  import * as slider from '@zag-js/slider'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id: string
    min?: number
    max?: number
    value?: number
    step?: number
    label?: string
  }

  let {
    id,
    min = 0,
    max = 100,
    value = $bindable(0),
    step = 1,
    label,
  }: Props = $props()

  const service = useMachine(slider.machine, () => ({
    id,
    min,
    max,
    step,
    value: [value],
    onValueChange: (d: { value: number[] }) => {
      value = d.value[0]
    },
  }))

  const api = $derived(slider.connect(service, normalizeProps))

  // Sync controlled prop → machine
  $effect(() => {
    if (api.value[0] !== value) {
      api.setValue([value])
    }
  })
</script>

<div class="ox-slider" data-ui="ox-slider" {...api.getRootProps()}>
  {#if label}
    <div class="ox-sl-header">
      <label class="ox-sl-label" {...api.getLabelProps()}>{label}</label>
      <output class="ox-sl-output" {...api.getValueTextProps()}>{value}</output>
    </div>
  {/if}

  <div class="ox-sl-control" {...api.getControlProps()}>
    <div class="ox-sl-track" {...api.getTrackProps()}>
      <div class="ox-sl-range" {...api.getRangeProps()}></div>
    </div>
    {#each api.value as _, index}
      <div class="ox-sl-thumb" {...api.getThumbProps({ index })}>
        <input {...api.getHiddenInputProps({ index })} />
      </div>
    {/each}
  </div>
</div>

<style>
  .ox-slider {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    font-family: system-ui, sans-serif;
  }

  .ox-sl-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ox-sl-label {
    font: 500 13px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
  }

  .ox-sl-output {
    font: 500 13px system-ui;
    color: var(--ox-primary, #6750A4);
    min-width: 28px;
    text-align: right;
  }

  .ox-sl-control {
    position: relative;
    display: flex;
    align-items: center;
    height: 20px;
    cursor: pointer;
  }

  .ox-sl-track {
    position: relative;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--ox-surface-3, #E7E0EC);
    overflow: hidden;
  }

  .ox-sl-range {
    height: 100%;
    background: var(--ox-primary, #6750A4);
    border-radius: 3px;
  }

  .ox-sl-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--ox-primary, #6750A4);
    box-shadow: var(--ox-elevation-1,
      0 1px 3px 1px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
    cursor: grab;
    outline: none;
    transition: box-shadow 150ms;
  }
  .ox-sl-thumb:hover {
    box-shadow: var(--ox-elevation-2,
      0 2px 6px 2px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
  }
  .ox-sl-thumb:active { cursor: grabbing; }
  .ox-sl-thumb:focus-visible {
    outline: 2px solid var(--ox-primary, #6750A4);
    outline-offset: 2px;
  }
</style>
