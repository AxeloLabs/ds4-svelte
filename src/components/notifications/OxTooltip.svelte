<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxTooltip — DS-4 Tooltip (MD3)
   * │ Powered by @zag-js/tooltip
   * │ Ref: https://m3.material.io/components/tooltips/guidelines
   * │ Plain (default) + Rich variant
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id          — unique id (required)
   *   label       — tooltip text (plain) or title (rich)
   *   description — supporting text (rich variant only)
   *   variant     — 'plain' | 'rich' (default: 'plain')
   *   placement   — positioning (default: 'top')
   *   children    — Snippet for the trigger element
   *   action      — Snippet for rich tooltip action button
   */
  import * as tooltip from '@zag-js/tooltip'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import type { Snippet } from 'svelte'

  type Placement = 'top' | 'bottom' | 'left' | 'right'
    | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

  interface Props {
    id: string
    label: string
    description?: string
    variant?: 'plain' | 'rich'
    placement?: Placement
    /** Render root as display:contents — trigger is invisible to layout (for use inside flex segments) */
    asContents?: boolean
    children: Snippet
    action?: Snippet
  }

  let {
    id,
    label,
    description,
    variant = 'plain',
    placement = 'top',
    asContents = false,
    children,
    action,
  }: Props = $props()

  // If description or action is provided, auto-switch to rich
  const isRich = $derived(variant === 'rich' || !!description || !!action)

  const service = useMachine(tooltip.machine, () => ({
    id,
    openDelay: isRich ? 500 : 300,
    closeDelay: isRich ? 200 : 100,
    positioning: {
      placement,
      flip: true,
      overflowPadding: 8,
      strategy: 'fixed' as const,
    },
  }))

  const api = $derived(tooltip.connect(service, normalizeProps))

  // strategy:'fixed' = positioned relative to viewport, no portal needed
</script>

<span class="ox-tooltip-root" class:ox-tooltip-contents={asContents} data-ui="ox-tooltip">
  <span {...(api.getTriggerProps() as Record<string, unknown>)}>
    {@render children()}
  </span>

</span>

{#if api.open}
<div {...api.getPositionerProps()}>
  <div class="ox-tooltip-arrow" class:rich={isRich} {...api.getArrowProps()}>
    <div class="ox-tooltip-arrow-tip" {...api.getArrowTipProps()}></div>
  </div>
  {#if isRich}
    <div class="ox-tooltip-rich" {...api.getContentProps()}>
      <div class="ox-tooltip-rich-title">{label}</div>
      {#if description}
        <div class="ox-tooltip-rich-desc">{description}</div>
      {/if}
      {#if action}
        <div class="ox-tooltip-rich-action">
          {@render action()}
        </div>
      {/if}
    </div>
  {:else}
    <div class="ox-tooltip-plain" {...api.getContentProps()}>
      {label}
    </div>
  {/if}
</div>
{/if}

<style>
  .ox-tooltip-root {
    display: inline-flex;
    position: relative;
  }

  /* asContents: outer wrapper transparent au layout — inner trigger span garde son box pour le positionnement zag */
  .ox-tooltip-contents {
    display: contents;
  }
  /* Le > span (trigger) reste un flex-item mesurable — sinon getBoundingClientRect() = 0 → tooltip (0,0) */
  .ox-tooltip-contents > span {
    display: inline-flex;
    align-items: stretch;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     PLAIN TOOLTIP — MD3 spec
     Inverse surface, label-sm, 4px radius, max 200px
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-tooltip-plain {
    z-index: 2147483647;
    background: var(--ox-inverse-surface, #313033);
    color: var(--ox-inverse-on-surface, #F4EFF4);
    font: 500 12px/1.4 system-ui;
    padding: 6px 12px;
    border-radius: var(--ox-shape-xs, 4px);
    white-space: normal;
    max-width: 280px;
    pointer-events: none;
    animation: ox-tooltip-in 150ms cubic-bezier(0.2, 0, 0, 1);
  }
  .ox-tooltip-plain[hidden] { display: none; }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RICH TOOLTIP — MD3 spec
     Surface-1, elevation-2, 12px radius, multi-line
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-tooltip-rich {
    z-index: 2147483647;
    background: var(--ox-surface-1, #F4EEFF);
    color: var(--ox-on-surface, #1C1B1F);
    border-radius: var(--ox-shape-md, 12px);
    padding: 12px 16px;
    max-width: 320px;
    min-width: 160px;
    box-shadow: var(--ox-elevation-2,
      0 2px 6px 2px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
    animation: ox-tooltip-in 200ms cubic-bezier(0.2, 0, 0, 1);
  }
  .ox-tooltip-rich[hidden] { display: none; }

  .ox-tooltip-rich-title {
    font: 600 14px/1.3 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    margin-bottom: 4px;
  }

  .ox-tooltip-rich-desc {
    font: 400 12px/1.5 system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }

  .ox-tooltip-rich-action {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ARROW — petit triangle qui pointe vers le trigger.
     Couleur héritée du fond du tooltip (plain = inverse-surface, rich = surface-1).
     z-index identique aux contents pour rester par-dessus le contexte page.
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-tooltip-arrow {
    --arrow-size: 8px;
    --arrow-background: var(--ox-inverse-surface, #313033);
    z-index: 2147483647;
  }
  .ox-tooltip-arrow.rich {
    --arrow-background: var(--ox-surface-1, #F4EEFF);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ANIMATION
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  @keyframes ox-tooltip-in {
    from { opacity: 0; transform: scale(0.96) translateY(2px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
</style>
