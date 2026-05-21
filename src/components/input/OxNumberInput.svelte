<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxNumberInput — Numeric input with inc/dec buttons
   * │ Powered by @zag-js/number-input
   * └─────────────────────────────────────────────────────────┘
   */
  import * as numberInput from '@zag-js/number-input'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { MinusIcon, PlusIcon } from '@lucide/svelte'

  interface Props {
    id: string
    label?: string
    min?: number
    max?: number
    step?: number
    value?: number
  }

  let {
    id,
    label = '',
    min,
    max,
    step = 1,
    value,
  }: Props = $props()

  const service = useMachine(numberInput.machine, () => ({
    id,
    min,
    max,
    step,
    value: value !== undefined ? String(value) : undefined,
  }))

  const api = $derived(numberInput.connect(service, normalizeProps))
</script>

<div class="ox-number" data-ui="ox-number-input" {...api.getRootProps()}>
  {#if label}
    <label class="ox-number-label" {...api.getLabelProps()}>{label}</label>
  {/if}
  <div class="ox-number-control">
    <button class="ox-number-btn" {...api.getDecrementTriggerProps()}>
      <MinusIcon size={18} strokeWidth={2} />
    </button>
    <input class="ox-number-input" {...api.getInputProps()} />
    <button class="ox-number-btn" {...api.getIncrementTriggerProps()}>
      <PlusIcon size={18} strokeWidth={2} />
    </button>
  </div>
</div>

<style>
  .ox-number { display: inline-flex; flex-direction: column; gap: 6px; font-family: system-ui, sans-serif; }
  .ox-number-label {
    font: 500 13px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-number-control {
    display: flex;
    align-items: center;
    border: 1px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-sm, 8px);
    background: var(--ox-surface, #FFFBFE);
    overflow: hidden;
  }
  .ox-number-control:focus-within {
    border-color: var(--ox-primary, #6750A4);
    border-width: 2px;
  }
  .ox-number-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 48px;
    border: none;
    background: var(--ox-surface-1, #F4EEFF);
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    transition: background 120ms, color 120ms;
    flex-shrink: 0;
  }
  .ox-number-btn:hover {
    background: var(--ox-surface-2);
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-number-btn:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }
  .ox-number-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font: 500 16px/1 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    text-align: center;
    padding: 12px 8px;
    min-width: 60px;
  }
</style>
