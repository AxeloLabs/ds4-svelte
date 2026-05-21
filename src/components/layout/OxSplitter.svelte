<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxSplitter — DS-4 Resizable Split Panes
   * │ Powered by @zag-js/splitter
   * │ Horizontal or vertical split with draggable resize bar
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id           — unique id (required)
   *   orientation  — 'horizontal' | 'vertical' (default: 'horizontal')
   *   defaultSize  — initial sizes in % (default: [50, 50])
   *   minSize      — min size for each panel in % (default: 10)
   *   panelA       — snippet for left/top panel
   *   panelB       — snippet for right/bottom panel
   */
  import * as splitter from '@zag-js/splitter'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    id: string
    orientation?: 'horizontal' | 'vertical'
    defaultSize?: [number, number]
    minSize?: number
    panelA: Snippet
    panelB: Snippet
  }

  let {
    id,
    orientation = 'horizontal',
    defaultSize = [50, 50],
    minSize = 10,
    panelA,
    panelB,
  }: Props = $props()

  const service = useMachine(splitter.machine, () => ({
    id,
    orientation,
    defaultSize,
    panels: [
      { id: 'a', minSize },
      { id: 'b', minSize },
    ],
  }))

  const api = $derived(splitter.connect(service, normalizeProps))
</script>

<div
  class="ox-splitter"
  class:ox-splitter-vertical={orientation === 'vertical'}
  data-ui="ox-splitter"
  {...api.getRootProps()}
>
  <div class="ox-splitter-panel" {...api.getPanelProps({ id: 'a' })}>
    {@render panelA()}
  </div>

  <div class="ox-splitter-bar" {...api.getResizeTriggerProps({ id: 'a:b' })}>
    <div class="ox-splitter-handle"></div>
  </div>

  <div class="ox-splitter-panel" {...api.getPanelProps({ id: 'b' })}>
    {@render panelB()}
  </div>
</div>

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ROOT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-splitter {
    display: flex;
    width: 100%;
    height: 100%;
    border: 1px solid var(--ox-outline-variant);
    border-radius: var(--ox-shape-lg, 16px);
    overflow: hidden;
    background: var(--ox-surface, #FFFBFE);
  }

  .ox-splitter-vertical {
    flex-direction: column;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     PANELS
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-splitter-panel {
    overflow: auto;
    min-width: 0;
    min-height: 0;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RESIZE BAR — horizontal (default)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-splitter-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 12px;
    cursor: col-resize;
    background: var(--ox-surface-1);
    border-left: 1px solid var(--ox-outline-variant);
    border-right: 1px solid var(--ox-outline-variant);
    transition: background 120ms;
    touch-action: none;
  }

  .ox-splitter-bar:hover,
  .ox-splitter-bar[data-focus] {
    background: var(--ox-surface-2);
  }

  .ox-splitter-bar:active,
  .ox-splitter-bar[data-dragging] {
    background: var(--ox-primary-container);
  }

  /* ── Handle grip (dots) ── */
  .ox-splitter-handle {
    width: 4px;
    height: 32px;
    border-radius: 2px;
    background: var(--ox-outline, #79747E);
    opacity: 0.4;
    transition: opacity 150ms, height 150ms;
  }

  .ox-splitter-bar:hover .ox-splitter-handle,
  .ox-splitter-bar[data-focus] .ox-splitter-handle {
    opacity: 0.7;
    height: 40px;
  }

  .ox-splitter-bar:active .ox-splitter-handle,
  .ox-splitter-bar[data-dragging] .ox-splitter-handle {
    opacity: 1;
    background: var(--ox-primary);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RESIZE BAR — vertical
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-splitter-vertical .ox-splitter-bar {
    width: auto;
    height: 12px;
    cursor: row-resize;
    border-left: none;
    border-right: none;
    border-top: 1px solid var(--ox-outline-variant);
    border-bottom: 1px solid var(--ox-outline-variant);
  }

  .ox-splitter-vertical .ox-splitter-handle {
    width: 32px;
    height: 4px;
  }

  .ox-splitter-vertical .ox-splitter-bar:hover .ox-splitter-handle,
  .ox-splitter-vertical .ox-splitter-bar[data-focus] .ox-splitter-handle {
    width: 40px;
    height: 4px;
  }
</style>
