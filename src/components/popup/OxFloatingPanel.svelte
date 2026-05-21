<script lang="ts">
  /**
   * OxFloatingPanel — DS-4 Floating Panel
   * Powered by @zag-js/floating-panel v1.38
   *
   * Props:
   *   id            — unique id (required)
   *   title         — panel title
   *   open          — controlled open state (bindable)
   *   defaultOpen   — initial open (uncontrolled)
   *   defaultPosition — { x, y }
   *   defaultSize   — { width, height }, default 420×540
   *   minSize       — { width, height }, default 260×200
   *   draggable     — default true
   *   resizable     — default true
   *   accent        — CSS color for header accent
   *   scale         — visual zoom factor via CSS transform (default 1)
   *   onOpenChange  — callback(open: boolean)
   *
   * Snippets:
   *   trigger       — element that opens the panel (FAB, button…)
   *   headerExtra   — extra content beside title
   *   controls      — buttons before close (top-right)
   *   children      — panel body
   */
  import * as fp from '@zag-js/floating-panel'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'

  interface Size  { width: number; height: number }
  interface Point { x: number; y: number }

  interface Props {
    id: string
    title?: string
    open?: boolean
    defaultOpen?: boolean
    defaultPosition?: Point
    defaultSize?: Size
    minSize?: Size
    draggable?: boolean
    resizable?: boolean
    accent?: string
    scale?: number
    titleSize?: 'default' | 'large'
    autoHeight?: boolean
    maxHeight?: number
    width?: number
    defaultMinimized?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: Snippet
    headerExtra?: Snippet
    controls?: Snippet
    children?: Snippet
  }

  let {
    id,
    title = '',
    open = $bindable(false),
    defaultOpen = false,
    defaultPosition,
    defaultSize = { width: 420, height: 540 },
    minSize = { width: 260, height: 200 },
    draggable = true,
    resizable = true,
    accent,
    scale = 1,
    titleSize = 'default',
    autoHeight = false,
    maxHeight = 800,
    width: widthProp,
    defaultMinimized = false,
    onOpenChange,
    trigger,
    headerExtra,
    controls,
    children,
  }: Props = $props()

  // ── Zag machine ─────────────────────────────────────────
  const service = useMachine(fp.machine, () => ({
    id,
    open,
    defaultOpen,
    defaultPosition,
    defaultSize,
    minSize,
    draggable,
    resizable,
    onOpenChange: (d: { open: boolean }) => {
      open = d.open
      onOpenChange?.(d.open)
    },
  }))

  const api = $derived(fp.connect(service, normalizeProps))

  // Sync controlled prop → machine
  $effect(() => {
    if (open !== api.open) api.setOpen(open)
  })

  // Sync external width prop → panel (only widen, never shrink)
  $effect(() => {
    if (widthProp == null) return
    const cur = api.size
    if (!cur || cur.width >= widthProp) return
    api.setSize({ width: widthProp, height: cur.height })
  })

  const AXES: fp.ResizeTriggerAxis[] = ['n','s','e','w','ne','nw','se','sw']

  // Stage icons
  const ICONS = { minimized: '−', maximized: '⛶', default: '❐' }
  const LABELS = { minimized: 'Réduire', maximized: 'Plein écran', default: 'Restaurer' }

  // ── Stage: maximized → default → minimized ──
  // "−" goes down one step, "❐" restores to default
  // Uses zag-js native api.minimize/maximize/restore
  let localMinimized = $state(false)

  function handleReduce() {
    // Check if maximized via DOM (zag sets data-maximized)
    const maxed = !!positionerEl?.querySelector('[data-maximized]')
    if (maxed) {
      api.restore()
    } else {
      api.minimize()
      localMinimized = true
    }
  }

  function handleRestoreFromMin() {
    api.restore()
    localMinimized = false
  }

  // Portal: move positioner to document.body — UNLESS inside Shadow DOM
  let positionerEl = $state<HTMLElement | null>(null)
  let bodyEl = $state<HTMLElement | null>(null)
  onMount(() => {
    const isInShadow = positionerEl?.getRootNode() instanceof ShadowRoot
    if (!isInShadow && positionerEl && positionerEl.parentNode !== document.body) {
      document.body.appendChild(positionerEl)
    }
    if (defaultMinimized) {
      api.minimize()
      localMinimized = true
    }
    return () => { if (!isInShadow) positionerEl?.remove() }
  })

  // Auto-height: observe content wrapper and resize panel to fit (capped at maxHeight)
  let measureEl = $state<HTMLElement | null>(null)
  $effect(() => {
    if (!autoHeight || !measureEl) return
    let timer: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (!measureEl || localMinimized) return
        const headerH = 56
        const contentH = measureEl.scrollHeight
        const targetH = Math.min(contentH + headerH + 2, maxHeight)
        const currentH = api.size?.height ?? defaultSize.height
        if (Math.abs(targetH - currentH) > 4) {
          api.setSize({ width: api.size?.width ?? defaultSize.width, height: targetH })
        }
      }, 80)
    })
    ro.observe(measureEl)
    return () => { clearTimeout(timer); ro.disconnect() }
  })
</script>

<!-- Trigger (optional) -->
{#if trigger}
  <span {...(api.getTriggerProps() as Record<string, unknown>)}>
    {@render trigger()}
  </span>
{/if}

<div bind:this={positionerEl} {...api.getPositionerProps()}>

  <div class="ox-fp" class:ox-fp--minimized={localMinimized} data-ui="ox-floating-panel" {...api.getContentProps()} style:--ox-fp-accent={accent || null} style:--ox-fp-scale={scale}>

    <!-- Resize handles (8) -->
    {#if resizable}
      {#each AXES as axis}
        <div
          class="ox-fp-rz ox-fp-rz-{axis}"
          {...api.getResizeTriggerProps({ axis })}
        ></div>
      {/each}
    {/if}

    <!-- Header -->
    <header class="ox-fp-header" {...api.getHeaderProps()}>

      <!-- Drag zone (contains title) -->
      <div class="ox-fp-drag" {...api.getDragTriggerProps()}>
        <span class="ox-fp-title" class:ox-fp-title-lg={titleSize === 'large'} {...api.getTitleProps()}>{title}</span>
        {#if headerExtra}{@render headerExtra()}{/if}
      </div>

      <!-- Controls right side -->
      <div class="ox-fp-ctrl" {...api.getControlProps()}>

        <!-- Custom controls slot -->
        {#if controls}{@render controls()}{/if}

        <!-- Minimize / Restore toggle -->
        <button
          class="ox-fp-stage-btn"
          data-ui="fp-minimize"
          title={localMinimized ? 'Restaurer' : 'Réduire'}
          onclick={localMinimized ? handleRestoreFromMin : handleReduce}
        >{localMinimized ? '❐' : '−'}</button>

        <!-- Stage: maximize -->
        <button
          class="ox-fp-stage-btn"
          data-ui="fp-maximize"
          title={LABELS.maximized}
          {...api.getStageTriggerProps({ stage: 'maximized' })}
        >{ICONS.maximized}</button>

        <!-- Close -->
        <button
          class="ox-fp-close"
          data-ui="fp-close"
          {...api.getCloseTriggerProps()}
          aria-label="Fermer"
        >✕</button>

      </div>
    </header>

    <!-- Body (hidden when minimized) -->
    {#if !localMinimized}
      <div bind:this={bodyEl} class="ox-fp-body" {...api.getBodyProps()}>
        <div bind:this={measureEl} class="ox-fp-measure">
          {#if children}{@render children()}{/if}
        </div>
      </div>
    {/if}

  </div>
</div>

<style>
  /* ── Positioner — Zag injects position:fixed + top/left via CSS vars ── */
  [data-part="positioner"] {
    /* Zag sets: position:fixed; top:var(--y); left:var(--x) inline */
    z-index: 2147483646;
    pointer-events: none; /* positioner itself doesn't intercept clicks */
  }

  /* ── Panel content ── */
  .ox-fp {
    --ox-fp-accent: var(--ox-primary, #6750A4);
    --ox-fp-scale: 1;
    /* Zag sets: width:var(--width); height:var(--height) inline */
    transform: scale(var(--ox-fp-scale));
    transform-origin: top left;
    pointer-events: all;
    display: flex;
    flex-direction: column;
    background: var(--ox-surface, #FFFBFE);
    border-radius: var(--ox-shape-lg, 16px);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    box-shadow: var(--ox-elevation-3,
      0 4px 8px 3px rgba(0,0,0,.15),
      0 1px 3px rgba(0,0,0,.3));
    overflow: hidden;
    font-family: system-ui, sans-serif;
    color: var(--ox-on-surface, #1C1B1F);
    user-select: text;
    /* Smooth resize */
    transition: height 150ms ease, width 150ms ease;
  }

  /* Hidden when closed */
  .ox-fp[hidden] { display: none !important; }

  /* Maximized — fill viewport */
  .ox-fp[data-maximized] {
    border-radius: 0 !important;
    transition: none;
  }

  /* Minimized — show only header */
  .ox-fp[data-minimized] {
    overflow: hidden;
  }
  .ox-fp.ox-fp--minimized {
    height: auto !important;
    transition: none;
  }

  /* ── Header ── */
  .ox-fp-header {
    display: flex;
    align-items: stretch;
    min-height: var(--ox-fp-header-h, 44px);
    flex-shrink: 0;
    background: var(--ox-surface-1, #F4EEFF);
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
  }

  /* Drag zone */
  .ox-fp-drag {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    cursor: grab;
    user-select: none;
    border-left: 3px solid var(--ox-fp-accent);
  }
  .ox-fp-drag[data-disabled] { cursor: default; }
  [data-dragging] .ox-fp-drag { cursor: grabbing; }

  .ox-fp-title {
    font: 500 13px system-ui;
    color: var(--ox-fp-accent);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ox-fp-title-lg {
    font: 600 28px/1.2 system-ui;
  }

  /* ── Controls (right side) ── */
  .ox-fp-ctrl {
    display: flex;
    align-items: center;
    padding: 0 6px;
    gap: 1px;
    flex-shrink: 0;
  }

  /* Stage + close buttons */
  .ox-fp-stage-btn,
  .ox-fp-close {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: var(--ox-on-surface-variant, #49454F);
    font-size: 14px;
    cursor: pointer;
    border-radius: 6px;
    transition: background 120ms, color 120ms;
    user-select: none;
    flex-shrink: 0;
    line-height: 1;
  }
  .ox-fp-stage-btn:hover { background: rgba(0,0,0,.08); color: var(--ox-fp-accent); }
  .ox-fp-close:hover { background: color-mix(in srgb, var(--ox-error, #B3261E) 12%, transparent); color: var(--ox-error, #B3261E); }

  /* Hide restore btn when not staged */
  .ox-fp-stage-btn[hidden] { display: none; }

  /* ── Body ── */
  .ox-fp-body {
    flex: 1;
    overflow: auto;
    min-height: 0;
    position: relative;
    z-index: 0; /* Keep below resize handles */
  }

  /* Measure wrapper — natural height, not stretched by flex */
  .ox-fp-measure {
    display: flex;
    flex-direction: column;
  }

  /* ── Resize handles (8) ── */
  .ox-fp-rz {
    position: absolute;
    z-index: 100;
    background: transparent;
  }
  .ox-fp-rz:hover { background: color-mix(in srgb, var(--ox-fp-accent) 15%, transparent); border-radius: 2px; }

  /* Edges */
  .ox-fp-rz-n  { top:-4px;    left:16px;   right:16px;  height:10px; cursor:n-resize;  }
  .ox-fp-rz-s  { bottom:-4px; left:16px;   right:16px;  height:10px; cursor:s-resize;  }
  .ox-fp-rz-e  { right:-4px;  top:16px;    bottom:16px; width:10px;  cursor:e-resize;  }
  .ox-fp-rz-w  { left:-4px;   top:16px;    bottom:16px; width:10px;  cursor:w-resize;  }
  /* Corners */
  .ox-fp-rz-ne { top:-4px;    right:-4px;  width:22px;  height:22px; cursor:ne-resize; }
  .ox-fp-rz-nw { top:-4px;    left:-4px;   width:22px;  height:22px; cursor:nw-resize; }
  .ox-fp-rz-se { bottom:-4px; right:-4px;  width:22px;  height:22px; cursor:se-resize; }
  .ox-fp-rz-sw { bottom:-4px; left:-4px;   width:22px;  height:22px; cursor:sw-resize; }
</style>
