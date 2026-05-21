<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxSegment — DS-4 Segmented Button (MD3)                │
   * │ Powered by @zag-js/radio-group                         │
   * │ Ref: https://m3.material.io/components/segmented-buttons
   * │                                                         │
   * │ variant="segment" (default) — MD3 pill style            │
   * │ variant="toggle"            — joined border style       │
   * │   (= ancien OxToggleGroup, désormais fusionné ici)      │
   * │                                                         │
   * │ Rail mode : automatique via CSS @container ox-toolbar  │
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id            — unique id (required)
   *   items         — array of { value, label, icon?, tooltip? }
   *   value         — selected value(s) (bindable)
   *   variant       — 'segment' | 'toggle' (default: 'segment')
   *   size          — 'sm' | 'md' (default: 'md')
   *   multi         — allow multi-select (default: false)
   *   orientation   — 'horizontal' | 'vertical' (default: 'horizontal')
   *   verticalBelow — switch to vertical when viewport < N px
   *   iconsOnly     — show only icons (compact mode)
   *   dock          — macOS-style magnification on hover
   */
  import * as radio from '@zag-js/radio-group'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import OxTooltip from '../notifications/OxTooltip.svelte'
  import type { Component } from 'svelte'

  interface SegmentItem {
    value: string
    label: string
    /** Composant Lucide (ou compatible) — recommandé */
    iconComponent?: Component<any>
    tooltip?: string
    disabled?: boolean
  }

  type Orientation = 'horizontal' | 'vertical'

  interface Props {
    id: string
    items: SegmentItem[]
    value?: string | string[]
    variant?: 'segment' | 'toggle'
    size?: 'sm' | 'md'
    multi?: boolean
    orientation?: Orientation
    /** If set, switches to vertical when window.innerWidth < verticalBelow (px) */
    verticalBelow?: number
    /** Show only icons (compact mode) */
    iconsOnly?: boolean
    dock?: boolean
    magnification?: number
    distance?: number
    onValueChange?: (value: string | string[]) => void
  }

  let {
    id,
    items,
    value = $bindable(),
    variant = 'segment',
    size = 'md',
    multi = false,
    orientation = 'horizontal',
    verticalBelow,
    iconsOnly = false,
    dock = false,
    magnification = 1.5,
    distance = 120,
    onValueChange,
  }: Props = $props()

  // Initialize default value if not set
  $effect(() => {
    if (value === undefined) {
      value = multi ? [] : (items[0]?.value ?? '')
    }
  })

  // ── Responsive orientation tracking ──
  let mediaVertical = $state(false)
  $effect(() => {
    if (typeof window === 'undefined' || !verticalBelow) return
    const mq = window.matchMedia(`(max-width: ${verticalBelow - 1}px)`)
    mediaVertical = mq.matches
    const handler = (e: MediaQueryListEvent) => { mediaVertical = e.matches }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  })

  const effectiveOrientation = $derived<Orientation>(
    verticalBelow && mediaVertical ? 'vertical' : orientation
  )
  const isVertical = $derived(effectiveOrientation === 'vertical')

  // ── Single-select via zag radio (only when !multi) ──
  const service = useMachine(radio.machine, () => ({
    id,
    value: multi ? '' : (typeof value === 'string' ? value : (value?.[0] ?? '')),
    orientation: 'horizontal' as const,
    onValueChange: (d: { value: string | null }) => {
      if (!multi) {
        value = d.value ?? ''
        onValueChange?.(value)
      }
    },
  }))

  const api = $derived(radio.connect(service, normalizeProps))

  $effect(() => {
    if (multi) return
    const v = Array.isArray(value) ? (value[0] ?? '') : (typeof value === 'string' ? value : '')
    if (api.value !== v) api.setValue(v)
  })

  // ── Multi-select handlers ──
  function isSelected(itemValue: string): boolean {
    if (multi) return Array.isArray(value) && value.includes(itemValue)
    return value === itemValue
  }

  function handleMultiClick(itemValue: string) {
    if (!multi) return
    const arr = Array.isArray(value) ? [...value] : []
    const idx = arr.indexOf(itemValue)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(itemValue)
    value = arr
    onValueChange?.(arr)
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // DOCK MAGNIFICATION
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let containerEl: HTMLDivElement | undefined = $state()
  let itemScales: number[] = $state([])
  $effect(() => { itemScales = items.map(() => 1) })

  function handleMouseMove(e: MouseEvent) {
    if (!dock || !containerEl) return
    const itemEls = containerEl.querySelectorAll<HTMLElement>('.ox-seg-item')
    const newScales: number[] = []
    for (const el of itemEls) {
      const rect = el.getBoundingClientRect()
      const itemCenterX = rect.left + rect.width / 2
      const dist = Math.abs(e.clientX - itemCenterX)
      const ratio = Math.max(0, 1 - dist / distance)
      const smoothRatio = ratio > 0 ? (1 + Math.cos(Math.PI * (1 - ratio))) / 2 : 0
      const scale = 1 + (magnification - 1) * smoothRatio
      newScales.push(scale)
    }
    itemScales = newScales
  }

  function handleMouseEnter() { if (dock) { /* isHovering = true */ } }
  function handleMouseLeave() { if (dock) { itemScales = items.map(() => 1) } }
</script>

<div
  class="ox-segment"
  class:ox-segment-sm={size === 'sm'}
  class:ox-segment-dock={dock}
  class:ox-segment-vertical={isVertical}
  class:ox-segment-icons-only={iconsOnly}
  class:ox-segment-multi={multi}
  class:ox-segment-toggle={variant === 'toggle'}
  data-ui="ox-segment"
  bind:this={containerEl}
  onmousemove={handleMouseMove}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  {...(multi ? {} : api.getRootProps())}
>
  {#if !dock && !multi}
    <div class="ox-seg-indicator" {...api.getIndicatorProps()}></div>
  {/if}
  {#each items as item, i}
    {#if multi}
      {#if item.tooltip}
        <OxTooltip id="seg-{id}-tt-{item.value}" label={item.tooltip} placement="bottom" asContents>
          {#snippet children()}
            <button
              type="button"
              class="ox-seg-item"
              class:ox-seg-first={i === 0}
              class:ox-seg-last={i === items.length - 1}
              class:ox-seg-checked={isSelected(item.value)}
              data-ui="segment-item-{item.value}"
              data-state={isSelected(item.value) ? 'checked' : 'unchecked'}
              onclick={() => handleMultiClick(item.value)}
              disabled={item.disabled}
            >
              {#if item.iconComponent}{@const IconC = item.iconComponent}<span class="ox-seg-icon"><IconC size={18} strokeWidth={2} /></span>{/if}
              {#if !iconsOnly}<span class="ox-seg-label">{item.label}</span>{/if}
            </button>
          {/snippet}
        </OxTooltip>
      {:else}
        <button
          type="button"
          class="ox-seg-item"
          class:ox-seg-first={i === 0}
          class:ox-seg-last={i === items.length - 1}
          class:ox-seg-checked={isSelected(item.value)}
          data-ui="segment-item-{item.value}"
          data-state={isSelected(item.value) ? 'checked' : 'unchecked'}
          title={item.label}
          onclick={() => handleMultiClick(item.value)}
          disabled={item.disabled}
        >
          {#if item.iconComponent}{@const IconC = item.iconComponent}<span class="ox-seg-icon"><IconC size={18} strokeWidth={2} /></span>{/if}
          {#if !iconsOnly}<span class="ox-seg-label">{item.label}</span>{/if}
        </button>
      {/if}
    {:else}
      {#if item.tooltip}
        <OxTooltip id="seg-{id}-tt-{item.value}" label={item.tooltip} placement="bottom" asContents>
          {#snippet children()}
            <label
              class="ox-seg-item"
              class:ox-seg-first={i === 0}
              class:ox-seg-last={i === items.length - 1}
              data-ui="segment-item-{item.value}"
              style={dock ? `transform: scale(${itemScales[i] ?? 1}); transform-origin: bottom center;` : ''}
              {...api.getItemProps({ value: item.value })}
            >
              {#if item.iconComponent}{@const IconC = item.iconComponent}<span class="ox-seg-icon"><IconC size={18} strokeWidth={2} /></span>{/if}
              {#if !iconsOnly}<span class="ox-seg-label" {...api.getItemTextProps({ value: item.value })}>{item.label}</span>{/if}
              <input {...api.getItemHiddenInputProps({ value: item.value })} />
            </label>
          {/snippet}
        </OxTooltip>
      {:else}
        <label
          class="ox-seg-item"
          class:ox-seg-first={i === 0}
          class:ox-seg-last={i === items.length - 1}
          data-ui="segment-item-{item.value}"
          title={item.label}
          style={dock ? `transform: scale(${itemScales[i] ?? 1}); transform-origin: bottom center;` : ''}
          {...api.getItemProps({ value: item.value })}
        >
          {#if item.iconComponent}{@const IconC = item.iconComponent}<span class="ox-seg-icon"><IconC size={18} strokeWidth={2} /></span>{/if}
          {#if !iconsOnly}<span class="ox-seg-label" {...api.getItemTextProps({ value: item.value })}>{item.label}</span>{/if}
          <input {...api.getItemHiddenInputProps({ value: item.value })} />
        </label>
      {/if}
    {/if}
  {/each}
</div>

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     VARIANT: segment — MD3 pill (défaut)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-segment {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-full, 999px);
    overflow: hidden;
    font-family: system-ui, sans-serif;
    position: relative;
    background: var(--ox-surface, #FFFBFE);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     VARIANT: toggle — joined borders (ex OxToggleGroup)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-segment-toggle {
    border-color: var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-sm, 8px);
  }
  .ox-segment-toggle .ox-seg-item {
    border-left: none;
    border-right: 1px solid var(--ox-outline-variant, #CAC4D0);
    padding: 8px 16px;
    font: 500 13px system-ui;
    min-width: 80px;
  }
  .ox-segment-toggle .ox-seg-item:last-child { border-right: none; }
  .ox-segment-toggle .ox-seg-indicator { display: none; }

  /* ── Sliding indicator (segment only) ── */
  .ox-seg-indicator {
    background: var(--ox-secondary-container, #E8DEF8);
    border-radius: var(--ox-shape-full, 999px);
  }

  /* ── Item ── */
  .ox-seg-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 24px;
    cursor: pointer;
    user-select: none;
    z-index: 2;
    transition: background 150ms, border-color 150ms;
    background: transparent;
    border: none;
    border-left: 1px solid var(--ox-outline, #79747E);
  }
  .ox-seg-first { border-left: none; }

  .ox-segment-sm .ox-seg-item { padding: 6px 16px; }

  .ox-seg-item:hover:not([data-state="checked"]):not(.ox-seg-checked) {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
  }
  .ox-seg-item[data-state="checked"] { background: var(--ox-secondary-container, #E8DEF8); }

  /* ── Icon ── */
  .ox-seg-icon {
    font-size: 18px;
    line-height: 1;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    pointer-events: none;
    vertical-align: middle;
  }

  /* ── Label ── */
  .ox-seg-label {
    font: 500 14px/1 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    white-space: nowrap;
    transition: color 150ms, font-weight 150ms;
    letter-spacing: 0.1px;
    pointer-events: none;
  }
  .ox-segment-sm .ox-seg-label { font-size: 13px; }
  .ox-seg-item[data-state="checked"] .ox-seg-label {
    color: var(--ox-on-secondary-container, #1D192B);
    font-weight: 600;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     DOCK MODE — macOS-style magnification
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-segment-dock {
    align-items: flex-end;
    overflow: visible;
    border: none;
    border-radius: 16px;
    background: var(--ox-surface, #FFFBFE);
    box-shadow:
      0 0 0 1px var(--ox-outline, rgba(0,0,0,.08)),
      0 4px 24px rgba(0,0,0,.08),
      0 1px 4px rgba(0,0,0,.04);
    padding: 6px 8px;
    gap: 2px;
  }
  .ox-segment-dock .ox-seg-item {
    padding: 8px 14px;
    border-left: none;
    border-radius: 10px;
    transition: transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1), background 150ms;
    will-change: transform;
  }
  .ox-segment-dock .ox-seg-item:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 6%, transparent);
  }
  .ox-segment-dock .ox-seg-item[data-state="checked"] {
    background: var(--ox-secondary-container, #E8DEF8);
    border-radius: 10px;
  }
  .ox-segment-dock .ox-seg-icon { font-size: 20px; }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     VERTICAL ORIENTATION
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-segment-vertical {
    flex-direction: column;
    border-radius: var(--ox-shape-md, 12px);
    width: max-content;
  }
  .ox-segment-vertical .ox-seg-item {
    border-left: none;
    border-top: 1px solid var(--ox-outline, #79747E);
    width: 100%;
    justify-content: flex-start;
  }
  .ox-segment-vertical .ox-seg-first { border-top: none; }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ICONS ONLY (compact / rail mode)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-segment-icons-only .ox-seg-item { padding: 10px 12px; justify-content: center; }
  .ox-segment-icons-only.ox-segment-vertical .ox-seg-item { width: 44px; }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     MULTI-SELECT MODE
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-segment-multi .ox-seg-item {
    background: transparent;
    border: none;
    border-left: 1px solid var(--ox-outline, #79747E);
    font: inherit;
  }
  .ox-segment-multi .ox-seg-item.ox-seg-first { border-left: none; }
  .ox-segment-multi.ox-segment-vertical .ox-seg-item {
    border-left: none;
    border-top: 1px solid var(--ox-outline, #79747E);
  }
  .ox-segment-multi.ox-segment-vertical .ox-seg-item.ox-seg-first { border-top: none; }
  .ox-segment-multi .ox-seg-item.ox-seg-checked {
    background: var(--ox-secondary-container, #E8DEF8);
  }
  .ox-segment-multi .ox-seg-item.ox-seg-checked .ox-seg-label {
    color: var(--ox-on-secondary-container, #1D192B);
    font-weight: 600;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RAIL MODE — CSS Container Queries (automatique)
     Breakpoints :
       ≤80px  = strip collapsed  → icône seule 48×44, title tooltip
       ≥81px  = overlay expanded → icône + label full-width
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */

  /* FOLD — collapsed strip (≤80px) */
  @container ox-toolbar (max-width: 80px) {
    .ox-segment {
      flex-direction: column;
      border: none;
      background: transparent;
      border-radius: 0;
      width: 100%;
      gap: 2px;
      overflow: visible;
    }
    .ox-segment .ox-seg-indicator { display: none; }
    /* Use .ox-segment .ox-seg-item (0,2,0) to beat .ox-segment-multi .ox-seg-item (0,2,0) via cascade order */
    .ox-segment .ox-seg-item {
      width: 48px;
      height: 44px;
      margin: 0 auto;
      padding: 0;
      justify-content: center;
      border: none;
      border-radius: var(--ox-shape-md, 8px);
    }
    .ox-segment .ox-seg-item:hover { background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent); }
    .ox-segment .ox-seg-item[data-state="checked"],
    .ox-segment .ox-seg-item.ox-seg-checked {
      background: var(--ox-secondary-container, #E8DEF8);
      color: var(--ox-on-secondary-container, #1D192B);
    }
    .ox-segment .ox-seg-label { display: none; }
    .ox-segment .ox-seg-icon { font-size: 20px; width: 20px; height: 20px; }
  }

  /* UNFOLD — expanded overlay (≥81px) */
  @container ox-toolbar (min-width: 81px) {
    .ox-segment {
      flex-direction: column;
      border: none;
      background: transparent;
      border-radius: 0;
      width: 100%;
      gap: 2px;
      overflow: visible;
    }
    .ox-segment .ox-seg-indicator { display: none; }
    .ox-segment .ox-seg-item {
      width: 100%;
      height: 40px;
      padding: 0 12px;
      justify-content: flex-start;
      gap: 10px;
      border: none;
      border-radius: var(--ox-shape-md, 8px);
    }
    .ox-segment .ox-seg-item:hover { background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent); }
    .ox-segment .ox-seg-item[data-state="checked"],
    .ox-segment .ox-seg-item.ox-seg-checked {
      background: var(--ox-secondary-container, #E8DEF8);
      color: var(--ox-on-secondary-container, #1D192B);
    }
    .ox-segment .ox-seg-label {
      display: block;
      font: 500 12px/1 system-ui;
      color: inherit;
    }
    .ox-segment .ox-seg-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
  }
</style>
