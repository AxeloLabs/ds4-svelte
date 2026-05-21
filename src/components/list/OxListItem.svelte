<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxListItem — DS-4 List Item (MD3)
   * │ Supports one-line, two-line, three-line layouts
   * │ with optional leading (avatar/icon) and trailing
   * │ (badge/icon/text) elements.
   * │ Ref: https://m3.material.io/components/lists/specs
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   headline     — primary text (required)
   *   supporting   — secondary text line
   *   tertiary     — third text line (three-line mode)
   *   leading      — snippet for left element (avatar, icon)
   *   trailing     — snippet for right element (badge, icon, text)
   *   dense        — compact mode (smaller padding)
   *   active       — highlight state
   *   disabled     — disabled state
   *   onclick      — click handler (makes item interactive)
   */
  import type { Snippet } from 'svelte'

  interface Props {
    headline: string
    supporting?: string
    tertiary?: string
    leading?: Snippet
    trailing?: Snippet
    dense?: boolean
    active?: boolean
    disabled?: boolean
    onclick?: () => void
  }

  let {
    headline,
    supporting,
    tertiary,
    leading,
    trailing,
    dense = false,
    active = false,
    disabled = false,
    onclick,
  }: Props = $props()

  const lines = $derived(tertiary ? 3 : supporting ? 2 : 1)
  const interactive = $derived(!!onclick)
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<li
  class="ox-list-item"
  data-ui="ox-list-item"
  class:ox-li-dense={dense}
  class:ox-li-active={active}
  class:ox-li-disabled={disabled}
  class:ox-li-interactive={interactive}
  class:ox-li-2={lines === 2}
  class:ox-li-3={lines === 3}
  role={interactive ? 'button' : 'listitem'}
  tabindex={interactive ? 0 : undefined}
  onclick={disabled ? undefined : onclick}
  onkeydown={interactive && !disabled ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onclick?.() } } : undefined}
>
  {#if leading}
    <div class="ox-li-leading">
      {@render leading()}
    </div>
  {/if}

  <div class="ox-li-body">
    <span class="ox-li-headline">{headline}</span>
    {#if supporting}
      <span class="ox-li-supporting">{supporting}</span>
    {/if}
    {#if tertiary}
      <span class="ox-li-tertiary">{tertiary}</span>
    {/if}
  </div>

  {#if trailing}
    <div class="ox-li-trailing">
      {@render trailing()}
    </div>
  {/if}
</li>

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     LIST ITEM — MD3 spec heights:
     one-line: 56px | two-line: 72px | three-line: 88px
     dense:    48px |            64px |              80px
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-list-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 16px;
    min-height: 56px;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    transition: background 120ms;
  }

  /* ── Lines ── */
  .ox-li-2 { min-height: 72px; align-items: flex-start; padding-top: 12px; padding-bottom: 12px; }
  .ox-li-3 { min-height: 88px; align-items: flex-start; padding-top: 12px; padding-bottom: 12px; }

  /* ── Dense ── */
  .ox-li-dense { min-height: 48px; padding: 4px 16px; gap: 12px; }
  .ox-li-dense.ox-li-2 { min-height: 64px; }
  .ox-li-dense.ox-li-3 { min-height: 80px; }

  /* ── States ── */
  .ox-li-interactive { cursor: pointer; }
  .ox-li-interactive:hover { background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent); }
  .ox-li-interactive:active { background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 12%, transparent); }
  .ox-li-active { background: var(--ox-secondary-container, #E8DEF8); }
  .ox-li-disabled { opacity: 0.38; pointer-events: none; }

  /* Remove last border */
  .ox-list-item:last-child { border-bottom: none; }

  /* ── Leading ── */
  .ox-li-leading {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
  }

  /* ── Body ── */
  .ox-li-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .ox-li-headline {
    font: 400 16px/24px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ox-li-supporting {
    font: 400 14px/20px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ox-li-tertiary {
    font: 400 12px/16px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Dense text sizes */
  .ox-li-dense .ox-li-headline { font-size: 14px; line-height: 20px; }
  .ox-li-dense .ox-li-supporting { font-size: 12px; line-height: 16px; }

  /* ── Trailing ── */
  .ox-li-trailing {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font: 400 12px/16px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }

  /* Focus ring for keyboard nav */
  .ox-li-interactive:focus-visible {
    outline: 2px solid var(--ox-primary, #6750A4);
    outline-offset: -2px;
    border-radius: 2px;
  }
</style>
