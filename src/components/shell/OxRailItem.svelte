<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxRailItem — Canonical rail/drawer button
   * │
   * │ Same visual style as OxNavigationDrawer items:
   * │   collapsed=true  → 56x56 square (rail mode)
   * │   collapsed=false → 56h pill with label (sidebar mode)
   * │
   * │ Active state uses MD3 secondary-container.
   * └─────────────────────────────────────────────────────────┘
   */
  import type { Snippet } from 'svelte'

  interface Props {
    label: string
    active?: boolean
    collapsed?: boolean
    onClick?: () => void
    icon: Snippet
  }

  let { label, active = false, collapsed = false, onClick, icon }: Props = $props()
</script>

<button
  class="ox-rail-item"
  class:active
  class:collapsed
  onclick={onClick}
  aria-label={label}
  aria-current={active ? 'page' : undefined}
  title={collapsed ? label : undefined}
  data-ui="ox-rail-item"
>
  <span class="ox-rail-icon">{@render icon()}</span>
  {#if !collapsed}
    <span class="ox-rail-label">{label}</span>
  {/if}
</button>

<style>
  .ox-rail-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    height: 56px;
    width: 100%;
    border-radius: var(--ox-shape-full, 999px);
    border: none;
    background: transparent;
    cursor: pointer;
    font: 500 14px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    transition: background 120ms, color 120ms;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
  }
  .ox-rail-item.collapsed {
    width: 56px;
    height: 56px;
    padding: 0;
    justify-content: center;
    border-radius: var(--ox-shape-lg, 16px);
  }
  .ox-rail-item:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 16%, transparent);
  }
  .ox-rail-item.active {
    background: var(--ox-secondary-container, #E8DEF8);
    color: var(--ox-on-secondary-container, #1D192B);
    font-weight: 600;
  }
  .ox-rail-item.active:hover {
    background: color-mix(in srgb, var(--ox-secondary-container, #E8DEF8) 90%, var(--ox-on-secondary-container, #1D192B));
  }
  .ox-rail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 20px;
    line-height: 1;
  }
  .ox-rail-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
