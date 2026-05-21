<script lang="ts">
  /**
   * OxPopover — DS-4 Popover
   * Powered by @zag-js/popover v1.38
   *
   * Props:
   *   id       — unique id (required)
   *   trigger  — Snippet for the trigger element
   *   children — Snippet for popover content
   *   title    — optional popover title
   */
  import * as popover from '@zag-js/popover'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import type { Snippet } from 'svelte'

  interface PopoverTriggerCtx {
    open: boolean
  }

  interface Props {
    id: string
    /** Snippet du trigger. Reçoit un context `{ open }` pour permettre
     *  un chevron qui s'inverse, un état actif visuel, etc. Si le
     *  consommateur ne déstructure pas l'argument, il fonctionne quand
     *  même (Svelte 5 tolère les snippets appelés avec args ignorés). */
    trigger: Snippet<[PopoverTriggerCtx]>
    children: Snippet
    title?: string
    /**
     * Placement du popover par rapport au trigger (passé à zag-js).
     * Default zag = 'bottom' (centré horizontalement sous le trigger).
     * Variantes : 'bottom-start' | 'bottom-end' | 'top' | 'top-start' …
     */
    placement?: string
  }

  let { id, trigger, children, title, placement }: Props = $props()

  // ▎ strategy: 'fixed' = position relative à la viewport (au lieu de
  // l'offsetParent), corrige les bugs de placement quand le trigger a un
  // ancêtre transformé (translateX, scale, etc.) — cas du
  // .prospector-appbar-center qui a transform: translateX(-50%).
  const service = useMachine(popover.machine, () => ({
    id,
    positioning: {
      strategy: 'fixed' as const,
      placement: (placement ?? 'bottom') as any,
      // Gap entre trigger et popover (8px standard MD3)
      offset: { mainAxis: 8 },
    },
  }))
  const api = $derived(popover.connect(service, normalizeProps))
</script>

<div class="ox-popover-root" data-ui="ox-popover">
  <button class="ox-popover-trigger" {...api.getTriggerProps()}>
    {@render trigger({ open: api.open })}
  </button>

  <div {...api.getPositionerProps()}>
    <div class="ox-popover-content" {...api.getContentProps()}>
      {#if title}
        <div class="ox-popover-header">
          <span class="ox-popover-title" {...api.getTitleProps()}>{title}</span>
          <button class="ox-popover-close" {...api.getCloseTriggerProps()} aria-label="Fermer">✕</button>
        </div>
      {/if}
      <div class="ox-popover-body" {...api.getDescriptionProps()}>
        {@render children()}
      </div>
      <div class="ox-popover-arrow" {...api.getArrowProps()}>
        <div {...api.getArrowTipProps()}></div>
      </div>
    </div>
  </div>
</div>

<style>
  .ox-popover-root {
    position: relative;
    display: inline-flex;
    font-family: system-ui, sans-serif;
  }

  .ox-popover-trigger {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border: 1px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-sm, 8px);
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-on-surface, #1C1B1F);
    font: 500 14px system-ui;
    cursor: pointer;
    transition: background 120ms;
  }
  .ox-popover-trigger:hover { background: var(--ox-surface-2, #EDE8F5); }

  .ox-popover-content {
    position: absolute;
    z-index: 50;
    min-width: 220px;
    max-width: 320px;
    background: var(--ox-surface-3, #E6E0F2);
    border-radius: var(--ox-shape-lg, 16px);
    box-shadow: var(--ox-elevation-3, 0 4px 8px 3px rgba(0,0,0,.15));
    padding: 0;
    outline: none;
  }
  .ox-popover-content[hidden] { display: none; }

  .ox-popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 8px;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
  }
  .ox-popover-title {
    font: 500 14px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-popover-close {
    width: 24px; height: 24px;
    border: none; background: none;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer; border-radius: 50%;
    font-size: 11px;
    transition: background 120ms;
    display: flex; align-items: center; justify-content: center;
  }
  .ox-popover-close:hover { background: var(--ox-surface-variant, #E7E0EC); }

  .ox-popover-body {
    padding: 14px 16px;
    font: 400 14px/1.5 system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }

  /* Arrow */
  .ox-popover-arrow {
    --arrow-size: 8px;
    --arrow-bg: var(--ox-surface-3, #E6E0F2);
  }
</style>
