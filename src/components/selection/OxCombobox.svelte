<script lang="ts">
  /**
   * OxCombobox — DS-4 Combobox
   * Powered by @zag-js/combobox v1.38
   *
   * Props:
   *   id          — unique id (required)
   *   items       — array of { value, label }
   *   value       — selected value (bindable)
   *   placeholder — input placeholder text
   */
  import * as combobox from '@zag-js/combobox'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { ChevronDown } from '@lucide/svelte'

  interface ComboItem {
    value: string
    label: string
  }

  interface Props {
    id: string
    items: ComboItem[]
    value?: string
    placeholder?: string
    /** Stratégie de positionnement Zag/Floating UI :
     *  - 'absolute' (défaut) : positioner inline dans le DOM, peut être clippé
     *    par un ancêtre `overflow:hidden` ou créer un scroll-container.
     *  - 'fixed' : positioner relatif au viewport, échappe les clippings →
     *    obligatoire pour les usages en table cell ou dans un wrap clippé. */
    positioningStrategy?: 'absolute' | 'fixed'
  }

  let {
    id,
    items,
    value = $bindable(''),
    placeholder = '',
    positioningStrategy = 'absolute',
  }: Props = $props()

  /** Label initial affiché dans l'input — Zag combobox n'auto-sync pas
   *  `value` vers `inputValue`, il faut le passer explicitement à l'init. */
  const initialInputValue = items.find((i) => i.value === value)?.label ?? ''

  let filteredItems = $state<ComboItem[]>([])
  $effect(() => { filteredItems = items })

  const collection = $derived(
    combobox.collection({
      items: filteredItems,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    })
  )

  const service = useMachine(combobox.machine, () => ({
    id,
    collection,
    value: value ? [value] : [],
    defaultInputValue: initialInputValue,
    inputBehavior: 'autohighlight' as const,
    openOnClick: true,
    positioning: { strategy: positioningStrategy },
    onValueChange: (d: { value: string[] }) => {
      value = d.value[0] ?? ''
    },
    onInputValueChange: (d: { inputValue: string }) => {
      const query = d.inputValue.toLowerCase()
      filteredItems = items.filter((item) =>
        item.label.toLowerCase().includes(query)
      )
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<div class="ox-combobox" data-ui="ox-combobox" {...api.getRootProps()}>
  <div class="ox-cb-control" {...api.getControlProps()}>
    <input
      class="ox-cb-input"
      data-ui="combobox-input-{id}"
      placeholder={placeholder}
      {...api.getInputProps()}
    />
    <button class="ox-cb-trigger" {...api.getTriggerProps()}>
      <ChevronDown size={16} strokeWidth={1.5} />
    </button>
  </div>

  <div class="ox-cb-positioner" {...api.getPositionerProps()}>
    {#if filteredItems.length > 0}
      <ul class="ox-cb-content" {...api.getContentProps()}>
        {#each filteredItems as item}
          <li
            class="ox-cb-item"
            data-ui="combobox-item-{item.value}"
            {...api.getItemProps({ item })}
          >{item.label}</li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .ox-combobox {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    font-family: system-ui, sans-serif;
    width: 100%;
  }

  .ox-cb-control {
    display: flex;
    align-items: center;
    border: 1.5px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-sm, 8px);
    background: var(--ox-surface, #FFFBFE);
    transition: border-color 150ms;
    overflow: hidden;
  }
  .ox-cb-control:focus-within {
    border-color: var(--ox-primary, #6750A4);
    outline: 1px solid var(--ox-primary, #6750A4);
  }

  .ox-cb-input {
    flex: 1;
    border: none;
    outline: none;
    background: none;
    padding: 8px 12px;
    font: 400 14px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    min-width: 0;
  }
  .ox-cb-input::placeholder {
    color: var(--ox-on-surface-variant, #49454F);
  }

  .ox-cb-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    flex-shrink: 0;
    transition: color 150ms;
  }
  .ox-cb-trigger:hover {
    color: var(--ox-primary, #6750A4);
  }

  /* Dropdown */
  /* Zag positioner — let Zag handle position (fixed/absolute via its own styles) */
  .ox-cb-positioner {
    position: unset;
  }

  .ox-cb-content {
    min-width: 200px;
    max-height: 220px;
    overflow-y: auto;
    background: var(--ox-surface, #FFFBFE);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-sm, 8px);
    box-shadow: var(--ox-elevation-2,
      0 2px 6px 2px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
    list-style: none;
    margin: 0;
    padding: 4px;
    z-index: 50;
  }
  .ox-cb-content[hidden] { display: none; }

  .ox-cb-item {
    padding: 8px 12px;
    border-radius: 6px;
    font: 400 14px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    cursor: pointer;
    transition: background 120ms;
  }
  .ox-cb-item[data-highlighted] {
    background: var(--ox-surface-2, #F4EEFF);
  }
  .ox-cb-item[data-state="checked"] {
    background: var(--ox-primary-container, #EADDFF);
    color: var(--ox-on-primary-container, #21005D);
  }
</style>
