<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxRailActionBtn — Bouton action context-aware           │
   * │                                                         │
   * │ Bouton d'action unique (non-stateful) qui s'adapte      │
   * │ au contexte OxRailContextProvider :                     │
   * │                                                         │
   * │ collapsed=true  → icon seule + OxTooltip (rail mode)   │
   * │ collapsed=false → icon + label (overlay mode)          │
   * │ hors contexte   → icon + label (toolbar mode)          │
   * │                                                         │
   * │ danger=true     → couleur rouge (action destructive)   │
   * └─────────────────────────────────────────────────────────┘
   */
  import { getContext, type Component } from 'svelte'
  import OxTooltip from '../notifications/OxTooltip.svelte'

  interface Props {
    id: string
    iconComponent?: Component<any>
    label: string
    onclick: () => void
    danger?: boolean
    black?: boolean
    size?: 'sm' | 'md'
  }

  let { id, iconComponent, label, onclick, danger = false, black = false, size = 'md' }: Props = $props()

  const rail = getContext<{ collapsed: boolean } | undefined>('ox-rail')
  const collapsed = $derived(rail?.collapsed === true)
</script>

{#if collapsed}
  <!-- Rail mode : icon seule + tooltip -->
  <OxTooltip id="ox-rail-action-tip-{id}" {label} placement="left">
    {#snippet children()}
      <button
        type="button"
        class="ox-rail-action-btn ox-rail-action-btn--icon"
        class:ox-rail-action-btn--sm={size === 'sm'}
        class:ox-rail-action-btn--danger={danger}
        class:ox-rail-action-btn--black={black}
        aria-label={label}
        data-ui="ox-rail-action-btn"
        {onclick}
      >
        {#if iconComponent}{@const IconC = iconComponent}<span class="ox-rail-action-icon"><IconC size={16} strokeWidth={2} /></span>{/if}
      </button>
    {/snippet}
  </OxTooltip>
{:else}
  <!-- Toolbar / overlay mode : icon + label -->
  <button
    type="button"
    class="ox-rail-action-btn ox-rail-action-btn--full"
    class:ox-rail-action-btn--sm={size === 'sm'}
    class:ox-rail-action-btn--danger={danger}
    class:ox-rail-action-btn--black={black}
    aria-label={label}
    data-ui="rail-action-{id}"
    {onclick}
  >
    {#if iconComponent}{@const IconC = iconComponent}<span class="ox-rail-action-icon"><IconC size={16} strokeWidth={2} /></span>{/if}
    <span class="ox-rail-action-label">{label}</span>
  </button>
{/if}

<style>
  /* ── Base ── */
  .ox-rail-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--ox-shape-sm, 8px);
    background: transparent;
    cursor: pointer;
    transition: background 120ms, color 120ms, border-color 120ms;
    flex-shrink: 0;
    font-family: system-ui, sans-serif;
    color: var(--ox-on-surface-variant, #49454F);
  }

  /* ── Icon-only (rail collapsed) ── */
  .ox-rail-action-btn--icon {
    width: 44px;
    height: 44px;
    padding: 0;
  }
  .ox-rail-action-btn--sm.ox-rail-action-btn--icon {
    width: 36px;
    height: 36px;
  }

  /* ── Full (toolbar / overlay) ── */
  .ox-rail-action-btn--full {
    gap: 5px;
    padding: 0 10px;
    height: 30px;
  }
  .ox-rail-action-btn--sm.ox-rail-action-btn--full {
    height: 28px;
    padding: 0 8px;
  }

  .ox-rail-action-icon {
    font-size: 16px;
    line-height: 1;
    user-select: none;
    pointer-events: none;
  }

  .ox-rail-action-label {
    font: 500 11px system-ui;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
  }

  /* ── Hover ── */
  .ox-rail-action-btn:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
  }

  /* ── Black variant ── */
  .ox-rail-action-btn--black {
    background: #000;
    color: #fff;
    border-color: #7f1d1d;
  }
  .ox-rail-action-btn--black .ox-rail-action-label {
    font-weight: 700;
  }
  .ox-rail-action-btn--black:hover {
    background: #222;
    border-color: #991b1b;
  }

  /* ── Danger variant ── */
  .ox-rail-action-btn--danger {
    color: #f38ba8;
    border-color: #f38ba855;
  }
  .ox-rail-action-btn--danger:hover {
    background: #f38ba820;
    border-color: #f38ba8;
  }
</style>
