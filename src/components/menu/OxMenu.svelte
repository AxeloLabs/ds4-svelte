<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxMenu — DS-4 Dropdown / Context Menu                   │
   * │ Powered by @zag-js/menu v1.38                           │
   * │                                                         │
   * │ Props:                                                   │
   * │   id         — unique id (required)                     │
   * │   trigger    — Snippet for trigger button               │
   * │   items      — OxMenuItem[]                             │
   * │   context    — use as context menu (right-click)        │
   * │   closeOnSelect — close after selection (default true)  │
   * │   onSelect   — callback(value: string)                  │
   * └─────────────────────────────────────────────────────────┘
   */
  import * as menu from '@zag-js/menu'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import type { Snippet } from 'svelte'
  import { CheckIcon, CircleIcon, SquareIcon, CheckSquareIcon, CircleDotIcon } from '@lucide/svelte'

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // TYPES
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  export interface OxMenuItem {
    value: string
    label?: string
    icon?: string
    disabled?: boolean
    separator?: boolean   // render divider before this item
    type?: 'item' | 'checkbox' | 'radio'
    checked?: boolean
    groupId?: string      // group membership
    onCheckedChange?: (checked: boolean) => void
  }

  export interface OxMenuGroup {
    id: string
    label?: string
  }

  interface Props {
    id: string
    trigger?: Snippet
    items: OxMenuItem[]
    groups?: OxMenuGroup[]
    context?: boolean       // right-click context menu
    closeOnSelect?: boolean
    onSelect?: (value: string) => void
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // STATE
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let { id, trigger, items, groups = [], context = false, closeOnSelect = true, onSelect }: Props = $props()

  // Local state for option items — intentional: capture initial value only
  // svelte-ignore state_referenced_locally
  const _initOptionStates = items.filter(i => i.type === 'checkbox' || i.type === 'radio').map(i => [i.value, i.checked ?? false])
  let optionStates = $state<Record<string, boolean>>(Object.fromEntries(_initOptionStates))

  const service = useMachine(menu.machine, () => ({
    id,
    closeOnSelect,
    onSelect: (d: { value: string }) => onSelect?.(d.value),
  }))

  const api = $derived(menu.connect(service, normalizeProps))

  // Grouped items helper
  function getGroupedItems(): Array<{ group: OxMenuGroup | null; items: OxMenuItem[] }> {
    if (!groups.length) return [{ group: null, items }]
    const result: Array<{ group: OxMenuGroup | null; items: OxMenuItem[] }> = []
    const ungrouped = items.filter(i => !i.groupId)
    if (ungrouped.length) result.push({ group: null, items: ungrouped })
    for (const g of groups) {
      result.push({ group: g, items: items.filter(i => i.groupId === g.id) })
    }
    return result
  }

  function handleOptionChange(item: OxMenuItem) {
    if (item.type === 'radio') {
      // Uncheck all radio in same group, check this one
      items.filter(i => i.type === 'radio' && i.groupId === item.groupId).forEach(i => {
        optionStates[i.value] = false
      })
      optionStates[item.value] = true
    } else {
      optionStates[item.value] = !optionStates[item.value]
    }
    item.onCheckedChange?.(optionStates[item.value])
  }
</script>

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     CONTEXT MENU
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
{#if context}
  <div class="ox-menu-root" data-ui="ox-menu">
    {#if trigger}
      <div class="ox-menu-context-area" {...api.getContextTriggerProps()}>
        {@render trigger()}
      </div>
    {/if}

    <div {...api.getPositionerProps()}>
      <ul class="ox-menu-content" {...api.getContentProps()}>
        {@render menuItems()}
      </ul>
    </div>
  </div>

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     DROPDOWN MENU
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
{:else}
  <div class="ox-menu-root" data-ui="menu-{id}">
    {#if trigger}
      <button class="ox-menu-trigger" {...api.getTriggerProps()}>
        {@render trigger()}
      </button>
    {/if}

    <div {...api.getPositionerProps()}>
      <ul class="ox-menu-content" {...api.getContentProps()}>
        {@render menuItems()}
      </ul>
    </div>
  </div>
{/if}

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     SNIPPET — menu items renderer
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
{#snippet menuItems()}
  {#each getGroupedItems() as section}
    {#if section.group}
      <li class="ox-menu-separator" role="separator"></li>
      <li class="ox-menu-group" {...api.getItemGroupProps({ id: section.group.id })}>
        {#if section.group.label}
          <span class="ox-menu-group-label" {...api.getItemGroupLabelProps({ htmlFor: section.group.id })}>
            {section.group.label}
          </span>
        {/if}
        {#each section.items as item}
          {@render renderItem(item)}
        {/each}
      </li>
    {:else}
      {#each section.items as item}
        {@render renderItem(item)}
      {/each}
    {/if}
  {/each}
{/snippet}

{#snippet renderItem(item: OxMenuItem)}
  {#if item.separator}
    <li class="ox-menu-separator" role="separator"></li>
  {/if}

  {#if item.type === 'checkbox' || item.type === 'radio'}
    <!-- Option item (checkbox / radio) -->
    <li
      class="ox-menu-item ox-menu-item-option"
      class:ox-menu-item-disabled={item.disabled}
      data-ui="menu-item-{item.value}"
      {...api.getOptionItemProps({
        value: item.value,
        type: item.type,
        checked: optionStates[item.value],
        onCheckedChange: () => handleOptionChange(item),
        disabled: item.disabled,
      })}
    >
      <span class="ox-menu-item-indicator" {...api.getItemIndicatorProps({ value: item.value })}>
        {#if item.type === 'checkbox'}
          {#if optionStates[item.value]}
            <CheckSquareIcon size={14} strokeWidth={2} />
          {:else}
            <SquareIcon size={14} strokeWidth={2} />
          {/if}
        {:else if optionStates[item.value]}
          <CircleDotIcon size={14} strokeWidth={2} />
        {:else}
          <CircleIcon size={14} strokeWidth={2} />
        {/if}
      </span>
      {#if item.icon}
        <span class="ox-menu-item-icon">{item.icon}</span>
      {/if}
      <span class="ox-menu-item-label" {...api.getItemTextProps({ value: item.value })}>
        {item.label}
      </span>
    </li>
  {:else}
    <!-- Regular item -->
    <li
      class="ox-menu-item"
      class:ox-menu-item-disabled={item.disabled}
      data-ui="menu-item-{item.value}"
      {...api.getItemProps({ value: item.value, disabled: item.disabled })}
    >
      {#if item.icon}
        <span class="ox-menu-item-icon">{item.icon}</span>
      {/if}
      <span class="ox-menu-item-label" {...api.getItemTextProps({ value: item.value })}>
        {item.label}
      </span>
    </li>
  {/if}
{/snippet}

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ROOT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-menu-root {
    position: relative;
    display: inline-flex;
    font-family: system-ui, sans-serif;
  }

  .ox-menu-context-area {
    width: 100%;
    height: 100%;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TRIGGER
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-menu-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-sm, 8px);
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-on-surface, #1C1B1F);
    font: 500 14px system-ui;
    cursor: pointer;
    transition: background 120ms;
  }
  .ox-menu-trigger:hover {
    background: color-mix(in srgb, var(--ox-on-surface) 8%, var(--ox-surface));
  }
  .ox-menu-trigger[data-state="open"] {
    background: var(--ox-surface-2, #EDE8F5);
    border-color: var(--ox-primary, #6750A4);
    color: var(--ox-on-surface, #1C1B1F);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     CONTENT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-menu-content {
    min-width: 180px;
    background: var(--ox-surface, #FFFBFE);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-md, 12px);
    box-shadow:
      0 4px 8px 3px rgba(0,0,0,.12),
      0 1px 3px rgba(0,0,0,.2);
    list-style: none;
    margin: 0;
    padding: 6px;
    z-index: 50;
    outline: none;
    animation: ox-menu-in 130ms cubic-bezier(0.2, 0, 0, 1);
  }
  .ox-menu-content[hidden] { display: none; }

  @keyframes ox-menu-in {
    from { opacity: 0; transform: scale(0.96) translateY(-4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ITEMS
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: var(--ox-shape-sm, 8px);
    font: 400 14px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    cursor: pointer;
    transition: background 100ms;
    list-style: none;
    user-select: none;
  }
  .ox-menu-item[data-highlighted] {
    background: color-mix(in srgb, var(--ox-on-surface) 10%, var(--ox-surface));
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-menu-item-disabled {
    opacity: 0.38;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Option items */
  .ox-menu-item-option {
    padding-left: 10px;
  }

  .ox-menu-item-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: var(--ox-on-surface-variant, #49454F);
    opacity: 0.6;
  }
  .ox-menu-item-indicator[data-state="checked"] {
    color: var(--ox-primary, #6750A4);
    opacity: 1;
  }

  .ox-menu-item-icon {
    font-size: 15px;
    line-height: 1;
    flex-shrink: 0;
  }
  .ox-menu-item-label {
    flex: 1;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     SEPARATOR & GROUPS
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-menu-separator {
    height: 1px;
    background: var(--ox-outline-variant, #CAC4D0);
    margin: 4px 8px;
    list-style: none;
  }

  .ox-menu-group {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .ox-menu-group-label {
    display: block;
    font: 500 11px system-ui;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: var(--ox-on-surface-variant, #49454F);
    padding: 4px 12px 2px;
    pointer-events: none;
  }
</style>
