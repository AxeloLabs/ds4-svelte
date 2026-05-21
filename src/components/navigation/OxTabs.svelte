<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxTabs — DS-4 Tabs (MD3)
   * │ Powered by @zag-js/tabs
   * │ Ref: https://m3.material.io/components/tabs/guidelines
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id       — unique id (required)
   *   items    — array of { value, label, icon? }
   *   value    — active tab value (bindable)
   *   variant  — 'primary' | 'secondary' (default: 'primary')
   *   children — snippet for tab content
   */
  import * as tabs from '@zag-js/tabs'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import type { Snippet } from 'svelte'

  interface TabItem {
    value: string
    label: string
    icon?: string
  }

  interface Props {
    id: string
    items: TabItem[]
    value?: string
    variant?: 'primary' | 'secondary'
    children?: Snippet
  }

  let {
    id,
    items,
    value = $bindable(items[0]?.value ?? ''),
    variant = 'primary',
    children,
  }: Props = $props()

  const service = useMachine(tabs.machine, () => ({
    id,
    value,
    onValueChange: (d: { value: string }) => {
      value = d.value
    },
  }))

  const api = $derived(tabs.connect(service, normalizeProps))

  $effect(() => {
    if (value !== api.value) {
      api.setValue(value)
    }
  })
</script>

<div
  class="ox-tabs"
  class:ox-tabs-secondary={variant === 'secondary'}
  {...api.getRootProps()}
  data-ui="ox-tabs"
>
  <div class="ox-tabs-list" {...api.getListProps()}>
    {#each items as item}
      <button
        class="ox-tabs-trigger"
        data-ui="tab-{item.value}"
        {...api.getTriggerProps({ value: item.value })}
      >
        {#if item.icon}
          <span class="ox-tabs-icon">{item.icon}</span>
        {/if}
        <span class="ox-tabs-label">{item.label}</span>
        <!-- MD3 active indicator bar — per-trigger fallback -->
        <span class="ox-tabs-bar"></span>
      </button>
    {/each}
    <!-- Zag sliding indicator (animated left/width) -->
    <div class="ox-tabs-indicator" {...api.getIndicatorProps()}></div>
  </div>
  {#if children}
    <div class="ox-tabs-content">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .ox-tabs {
    width: 100%;
    overflow-x: hidden;
    font-family: system-ui, sans-serif;
    color: var(--ox-on-surface, #1C1B1F);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TAB LIST
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-tabs-list {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    flex-shrink: 0;
    background: var(--ox-surface, #FFFBFE);
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TRIGGER — PRIMARY (default)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-tabs-trigger {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 14px 16px 14px;
    border: none;
    background: none;
    cursor: pointer;
    position: relative;
    user-select: none;
    transition: background 120ms;
    min-height: 48px;
  }

  /* State layer on hover */
  .ox-tabs-trigger:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
  }
  .ox-tabs-trigger:active {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 12%, transparent);
  }

  .ox-tabs-trigger[data-disabled] {
    opacity: 0.38;
    cursor: not-allowed;
  }

  /* ── Icon ── */
  .ox-tabs-icon {
    font-size: 20px;
    line-height: 1;
    color: var(--ox-on-surface-variant, #49454F);
    transition: color 150ms;
  }
  .ox-tabs-trigger[data-selected] .ox-tabs-icon {
    color: var(--ox-primary, #6750A4);
  }

  /* ── Label ── */
  .ox-tabs-label {
    font: 500 14px system-ui;
    letter-spacing: 0.1px;
    color: var(--ox-on-surface-variant, #49454F);
    white-space: nowrap;
    transition: color 150ms;
  }
  .ox-tabs-trigger[data-selected] .ox-tabs-label {
    color: var(--ox-primary, #6750A4);
    font-weight: 600;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ACTIVE BAR — per-trigger indicator (always works)
     MD3: 3px primary bar at bottom of active tab
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-tabs-bar {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 3px;
    background: var(--ox-primary, #6750A4);
    border-radius: 3px 3px 0 0;
    transition: width 250ms cubic-bezier(0.2, 0, 0, 1),
                left 250ms cubic-bezier(0.2, 0, 0, 1);
  }
  .ox-tabs-trigger[data-selected] .ox-tabs-bar {
    left: 0;
    width: 100%;
  }

  /* ── Zag sliding indicator (hidden — we use per-trigger bar) ── */
  .ox-tabs-indicator {
    display: none;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     SECONDARY VARIANT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-tabs-secondary .ox-tabs-trigger {
    flex-direction: row;
    gap: 8px;
    padding: 12px 24px;
  }
  .ox-tabs-secondary .ox-tabs-trigger[data-selected] .ox-tabs-label {
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-tabs-secondary .ox-tabs-trigger[data-selected] .ox-tabs-icon {
    color: var(--ox-on-surface, #1C1B1F);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     CONTENT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-tabs-content {
    padding: 16px 0;
  }
</style>
