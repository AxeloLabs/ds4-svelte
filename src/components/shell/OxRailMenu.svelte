<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxRailMenu — Toolbar rail strip (horizontal)
   * │
   * │ Equivalent icone-only des composants Switch, ToggleGroup
   * │ et Segmented pour utilisation dans les rails horizontaux.
   * │
   * │ mode='segment'  → single-select (radio)
   * │ mode='toggle'   → multi-select (checkbox group)
   * │ mode='switch'   → 1 item on/off
   * │
   * │ showLabels=true → segment bordé icon+texte en toolbar,
   * │                   replie automatiquement en icon-only
   * │                   quand OxRailContextProvider collapsed=true
   * │
   * │ Chaque item = bouton carré + OxTooltip (placement top)
   * └─────────────────────────────────────────────────────────┘
   */
  import { getContext, type Component } from 'svelte'
  import OxTooltip from '../notifications/OxTooltip.svelte'

  interface RailMenuItem {
    value: string
    iconComponent?: Component<any>
    label: string      // tooltip text
    disabled?: boolean
  }

  interface Props {
    id: string
    items: RailMenuItem[]
    value?: string | string[]
    mode?: 'segment' | 'toggle' | 'switch'
    size?: 'sm' | 'md'
    showLabels?: boolean  // segment style icon+texte, replie en icon-only si rail collapsed
  }

  let {
    id,
    items,
    value = $bindable(),
    mode = 'segment',
    size = 'md',
    showLabels = false,
  }: Props = $props()

  // ── Rail context awareness ──
  const rail = getContext<{ collapsed: boolean } | undefined>('ox-rail')
  const railCollapsed = $derived(rail?.collapsed === true)
  const labelsVisible = $derived(showLabels && !railCollapsed)

  // ── Init default value ──
  $effect(() => {
    if (value === undefined) {
      if (mode === 'segment') value = items[0]?.value ?? ''
      else value = []
    }
  })

  function isActive(itemValue: string): boolean {
    if (mode === 'segment' || mode === 'switch') {
      return value === itemValue
    }
    return Array.isArray(value) && value.includes(itemValue)
  }

  function handleClick(itemValue: string) {
    if (mode === 'segment') {
      value = itemValue
    } else if (mode === 'switch') {
      value = value === itemValue ? '' : itemValue
    } else {
      // toggle
      const arr = Array.isArray(value) ? [...value] : []
      const idx = arr.indexOf(itemValue)
      if (idx >= 0) arr.splice(idx, 1)
      else arr.push(itemValue)
      value = arr
    }
  }
</script>

<div
  class="ox-rail-menu"
  class:ox-rail-menu--sm={size === 'sm'}
  class:ox-rail-menu--labels={labelsVisible}
  data-ui="ox-rail-menu"
  role="toolbar"
  aria-label={id}
>
  {#each items as item}
    <OxTooltip id="{id}-tip-{item.value}" label={item.label} placement="top">
      {#snippet children()}
        <button
          type="button"
          class="ox-rail-menu-item"
          class:active={isActive(item.value)}
          class:disabled={item.disabled}
          aria-label={item.label}
          aria-pressed={isActive(item.value)}
          disabled={item.disabled}
          data-ui="rail-menu-item-{item.value}"
          onclick={() => handleClick(item.value)}
        >
          {#if item.iconComponent}{@const IconC = item.iconComponent}<span class="ox-rail-menu-icon"><IconC size={size === 'sm' ? 18 : 20} strokeWidth={2} /></span>{/if}
          {#if labelsVisible}
            <span class="ox-rail-menu-label">{item.label}</span>
          {/if}
        </button>
      {/snippet}
    </OxTooltip>
  {/each}
</div>

<style>
  .ox-rail-menu {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: system-ui, sans-serif;
  }

  .ox-rail-menu-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: var(--ox-shape-lg, 16px);
    background: transparent;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    transition: background 120ms, color 120ms;
    padding: 0;
    flex-shrink: 0;
  }

  .ox-rail-menu--sm .ox-rail-menu-item {
    width: 36px;
    height: 36px;
    border-radius: var(--ox-shape-md, 12px);
  }

  .ox-rail-menu-item:hover:not(.disabled) {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 16%, transparent);
  }

  .ox-rail-menu-item.active {
    background: #0f172a;
    color: #ffffff;
  }

  .ox-rail-menu-item.active:hover:not(.disabled) {
    background: color-mix(in srgb, #0f172a 90%, white);
  }

  .ox-rail-menu-item.disabled {
    opacity: 0.38;
    cursor: not-allowed;
    pointer-events: none;
  }

  .ox-rail-menu-icon {
    font-size: 20px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    pointer-events: none;
  }

  .ox-rail-menu--sm .ox-rail-menu-icon {
    font-size: 18px;
  }

  /* ── Segment style avec labels ── */
  .ox-rail-menu--labels {
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-sm, 8px);
    gap: 0;
    overflow: hidden;
    background: transparent;
  }

  .ox-rail-menu--labels .ox-rail-menu-item {
    border-radius: 0;
    height: 30px;
    width: auto;
    padding: 0 10px;
    gap: 5px;
    min-width: 0;
    flex-shrink: 0;
  }

  .ox-rail-menu--sm.ox-rail-menu--labels .ox-rail-menu-item {
    height: 28px;
    border-radius: 0;
  }

  :global(.ox-rail-menu--labels .ox-rail-menu-item + .ox-rail-menu-item) {
    border-left: 1px solid var(--ox-outline-variant, #CAC4D0);
  }

  .ox-rail-menu-label {
    font: 500 11px system-ui;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
  }

  .ox-rail-menu--sm .ox-rail-menu-label {
    font-size: 11px;
  }
</style>
