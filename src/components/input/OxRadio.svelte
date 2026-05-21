<script lang="ts" module>
  export interface OxRadioItem {
    value: string
    label: string
    helper?: string
    disabled?: boolean
  }
</script>

<script lang="ts">
  /**
   * OxRadio — DS-4 Radio Group
   * Powered by @zag-js/radio-group (a11y + keyboard navigation).
   *
   * Props:
   *   id          — id unique du groupe (requis)
   *   items       — OxRadioItem[]
   *   value       — valeur sélectionnée (bindable: bind:value)
   *   name        — name HTML pour formulaire
   *   orientation — 'vertical' (default) | 'horizontal'
   *   disabled    — désactive tout le groupe
   *   error       — affichage erreur sur tous les radios
   */
  import * as radio from '@zag-js/radio-group'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id: string
    items: OxRadioItem[]
    value?: string | null
    name?: string
    orientation?: 'vertical' | 'horizontal'
    disabled?: boolean
    error?: boolean
  }

  let {
    id,
    items,
    value = $bindable(null),
    name,
    orientation = 'vertical',
    disabled = false,
    error = false,
  }: Props = $props()

  const service = useMachine(radio.machine, () => ({
    id,
    name,
    value,
    disabled,
    orientation,
    onValueChange: (d: { value: string }) => {
      value = d.value
    },
  }))

  const api = $derived(radio.connect(service, normalizeProps))
</script>

<div data-ui="ox-radio"
  class="ox-radio-group ox-radio-group-{orientation}"
  class:ox-radio-error={error}
  {...api.getRootProps()}
>
  {#each items as item (item.value)}
    <label
      class="ox-radio"
      class:ox-radio-disabled={item.disabled || disabled}
      {...api.getItemProps({ value: item.value, disabled: item.disabled })}
    >
      <span class="ox-radio-control" {...api.getItemControlProps({ value: item.value })}>
        <span class="ox-radio-dot" aria-hidden="true"></span>
      </span>
      <span class="ox-radio-labels">
        <span class="ox-radio-label" {...api.getItemTextProps({ value: item.value })}>{item.label}</span>
        {#if item.helper}<span class="ox-radio-helper">{item.helper}</span>{/if}
      </span>
      <input {...api.getItemHiddenInputProps({ value: item.value, disabled: item.disabled })} />
    </label>
  {/each}
</div>

<style>
  .ox-radio-group {
    display: flex;
    gap: 12px;
  }
  .ox-radio-group-vertical   { flex-direction: column; }
  .ox-radio-group-horizontal { flex-direction: row; flex-wrap: wrap; }

  .ox-radio {
    display: inline-flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
    font: var(--ox-body-md);
    color: var(--ox-on-surface);
    user-select: none;
  }
  .ox-radio-disabled { cursor: not-allowed; opacity: 0.5; }

  .ox-radio-control {
    position: relative;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 1px;
    border: 2px solid var(--ox-on-surface-variant);
    border-radius: var(--ox-shape-full);
    background: transparent;
    transition: border-color var(--ox-duration-short2) var(--ox-easing-standard);
  }
  .ox-radio-error .ox-radio-control { border-color: var(--ox-error); }

  .ox-radio-dot {
    position: absolute;
    inset: 3px;
    border-radius: var(--ox-shape-full);
    background: transparent;
    transition:
      background var(--ox-duration-short2) var(--ox-easing-standard),
      transform var(--ox-duration-short2) var(--ox-easing-standard);
    transform: scale(0);
  }
  .ox-radio [data-state='checked'] {
    border-color: var(--ox-primary);
  }
  .ox-radio [data-state='checked'] .ox-radio-dot {
    background: var(--ox-primary);
    transform: scale(1);
  }
  .ox-radio-error [data-state='checked'] {
    border-color: var(--ox-error);
  }
  .ox-radio-error [data-state='checked'] .ox-radio-dot {
    background: var(--ox-error);
  }

  .ox-radio [data-focus-visible='true'] {
    outline: var(--ox-focus-ring);
    outline-offset: 2px;
  }

  .ox-radio-labels { display: flex; flex-direction: column; gap: 2px; }
  .ox-radio-label  { font: var(--ox-body-md); }
  .ox-radio-helper { font: var(--ox-body-sm); color: var(--ox-on-surface-variant); }
</style>
