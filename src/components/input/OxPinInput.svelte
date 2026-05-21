<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxPinInput — PIN / OTP code input
   * │ Powered by @zag-js/pin-input
   * └─────────────────────────────────────────────────────────┘
   */
  import * as pinInput from '@zag-js/pin-input'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id: string
    length?: number
    placeholder?: string
    mask?: boolean
    otp?: boolean
    onValueComplete?: (details: { value: string[]; valueAsString: string }) => void
  }

  let {
    id,
    length = 4,
    placeholder = '○',
    mask = false,
    otp = false,
    onValueComplete,
  }: Props = $props()

  const service = useMachine(pinInput.machine, () => ({
    id,
    placeholder,
    mask,
    otp,
    onValueComplete,
  }))

  const api = $derived(pinInput.connect(service, normalizeProps))
  const indices = $derived(Array.from({ length }, (_, i) => i))
</script>

<div class="ox-pin" data-ui="ox-pin-input">
  <div class="ox-pin-root" {...api.getRootProps()}>
    {#each indices as i}
      <input class="ox-pin-input" {...api.getInputProps({ index: i })} />
    {/each}
  </div>
  <button class="ox-pin-clear" type="button" onclick={api.clearValue}>Clear</button>
</div>

<style>
  .ox-pin { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 8px; font-family: system-ui, sans-serif; }
  .ox-pin-root { display: flex; gap: 8px; }
  .ox-pin-input {
    width: 48px;
    height: 56px;
    border: 1px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-sm, 8px);
    background: var(--ox-surface, #FFFBFE);
    font: 600 24px/1 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    text-align: center;
    outline: none;
    caret-color: var(--ox-primary, #6750A4);
    transition: border-color 150ms;
  }
  .ox-pin-input:focus {
    border-color: var(--ox-primary, #6750A4);
    border-width: 2px;
  }
  .ox-pin-input[data-complete] {
    border-color: var(--ox-primary, #6750A4);
    background: color-mix(in srgb, var(--ox-primary, #6750A4) 6%, var(--ox-surface, #FFFBFE));
  }
  .ox-pin-clear {
    border: none;
    background: none;
    font: 500 12px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--ox-shape-xs, 4px);
    transition: color 120ms;
  }
  .ox-pin-clear:hover { color: var(--ox-error, #B3261E); }
</style>
