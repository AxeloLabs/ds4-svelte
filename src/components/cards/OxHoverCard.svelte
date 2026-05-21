<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxHoverCard — DS-4 Hover Card
   * │ Powered by @zag-js/hover-card
   * │ Shows a rich preview card on trigger hover.
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id        — unique id (required)
   *   openDelay — ms before showing (default: 500)
   *   closeDelay— ms before hiding (default: 200)
   *   children  — trigger element (Snippet)
   *   content   — card content (Snippet)
   */
  import * as hoverCard from '@zag-js/hover-card'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    id: string
    openDelay?: number
    closeDelay?: number
    children: Snippet
    content: Snippet
  }

  let {
    id,
    openDelay = 500,
    closeDelay = 200,
    children,
    content,
  }: Props = $props()

  const service = useMachine(hoverCard.machine, () => ({
    id,
    openDelay,
    closeDelay,
  }))

  const api = $derived(hoverCard.connect(service, normalizeProps))
</script>

<span class="ox-hovercard-trigger" data-ui="ox-hover-card" {...api.getTriggerProps()}>
  {@render children()}
</span>

{#if api.open}
  <div {...api.getPositionerProps()}>
    <div class="ox-hovercard" {...api.getContentProps()}>
      <div class="ox-hovercard-arrow" {...api.getArrowProps()}>
        <div {...api.getArrowTipProps()}></div>
      </div>
      {@render content()}
    </div>
  </div>
{/if}

<style>
  .ox-hovercard-trigger {
    display: inline-flex;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     CARD — MD3 elevated surface
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-hovercard {
    z-index: 100;
    background: var(--ox-surface-1, #F4EEFF);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-lg, 16px);
    box-shadow: var(--ox-elevation-2,
      0 2px 6px 2px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
    padding: 16px;
    max-width: 360px;
    min-width: 200px;
    font-family: system-ui, sans-serif;
    color: var(--ox-on-surface, #1C1B1F);
    animation: ox-hovercard-in 200ms cubic-bezier(0.2, 0, 0, 1);
  }

  .ox-hovercard[hidden] { display: none; }

  @keyframes ox-hovercard-in {
    from { opacity: 0; transform: scale(0.96) translateY(4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* ── Arrow ── */
  .ox-hovercard-arrow {
    --arrow-size: 8px;
    --arrow-bg: var(--ox-surface-1, #F4EEFF);
  }
</style>
