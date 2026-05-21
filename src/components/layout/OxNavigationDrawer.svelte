<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxNavigationDrawer — MD3 Navigation Drawer
   * │ Ref: https://m3.material.io/components/navigation-drawer/specs
   * │
   * │ 3 modes:
   * │   sidebar  — fixed column in layout (collapsible → rail)
   * │   sheet    — overlay with scrim (no collapse)
   * │   rail     — icon-only vertical bar (no expand)
   * │
   * │ Responsive (sidebar mode only):
   * │   Desktop   → full drawer
   * │   Tablet    → collapsed rail
   * │   Mobile    → hidden, replaced by App Bar + sheet
   * └─────────────────────────────────────────────────────────┘
   */
  import type { Snippet } from 'svelte'
  import { ChevronLeft, ChevronRight, X, Menu } from '@lucide/svelte'

  interface NavDrawerItem {
    id: string
    icon: string
    label: string
  }

  interface Props {
    items: NavDrawerItem[]
    activeId?: string
    mode?: 'sidebar' | 'sheet' | 'rail'
    open?: boolean
    collapsed?: boolean
    title?: string
    onNavigate?: (id: string) => void
    onExpand?: () => void
    bottom?: Snippet
    children?: Snippet
  }

  let {
    items,
    activeId = $bindable(items[0]?.id ?? ''),
    mode = 'sidebar',
    open = $bindable(false),
    collapsed = $bindable(false),
    title,
    onNavigate,
    onExpand,
    bottom,
    children,
  }: Props = $props()

  function handleClick(id: string) {
    activeId = id
    onNavigate?.(id)
    if (mode === 'sheet') open = false
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    let target = -1
    if (e.key === 'ArrowDown') target = (index + 1) % items.length
    else if (e.key === 'ArrowUp') target = (index - 1 + items.length) % items.length
    if (target >= 0) {
      e.preventDefault()
      const btns = (e.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('.ox-drawer-item')
      btns?.[target]?.focus()
    }
  }

  const isRailMode = $derived(mode === 'rail')
  const isSheet = $derived(mode === 'sheet')
  const isSidebar = $derived(mode === 'sidebar')
  const showRail = $derived(isRailMode || (isSidebar && collapsed))
</script>

<!-- SHEET SCRIM -->
{#if isSheet && open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="ox-drawer-scrim"
    onclick={() => open = false}
    role="presentation"
    aria-hidden="true"
    data-ui="ox-navigation-drawer"
  ></div>
{/if}

<!-- DRAWER -->
<nav
  class="ox-drawer"
  class:ox-drawer-sidebar={isSidebar}
  class:ox-drawer-sheet={isSheet}
  class:ox-drawer-rail={showRail && !isSheet}
  class:ox-drawer-sheet-open={isSheet && open}
  class:ox-drawer-sheet-closed={isSheet && !open}
  data-ui="drawer"
>
  <!-- Header -->
  {#if !showRail}
    <div class="ox-drawer-header">
      {#if title}
        <span class="ox-drawer-title">{title}</span>
      {/if}
      {#if isSidebar}
        <button
          class="ox-drawer-collapse-btn"
          onclick={() => collapsed = true}
          aria-label="Collapse"
          data-ui="drawer-collapse"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
      {/if}
      {#if isSheet}
        <button
          class="ox-drawer-close-btn"
          onclick={() => open = false}
          aria-label="Close"
          data-ui="drawer-close"
        >
          <X size={20} strokeWidth={2} />
        </button>
      {/if}
    </div>
  {:else}
    <!-- Rail header: expand button -->
    {#if isSidebar}
      <div class="ox-drawer-rail-header">
        <button
          class="ox-drawer-expand-btn"
          onclick={() => { if (onExpand) onExpand(); else collapsed = false }}
          aria-label="Expand"
          data-ui="drawer-expand"
        >
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>
    {/if}
  {/if}

  <!-- Items -->
  <div class="ox-drawer-items">
    {#each items as item, i}
      <button
        class="ox-drawer-item"
        class:ox-drawer-item-active={activeId === item.id}
        data-ui="drawer-item-{item.id}"
        onclick={() => handleClick(item.id)}
        onkeydown={(e) => handleKeydown(e, i)}
        aria-current={activeId === item.id ? 'page' : undefined}
        title={showRail ? item.label : undefined}
      >
        <span class="ox-drawer-item-icon">{item.icon}</span>
        {#if !showRail}
          <span class="ox-drawer-item-label">{item.label}</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if bottom}
    <div class="ox-drawer-bottom" data-ui="drawer-bottom">
      {@render bottom()}
    </div>
  {/if}
</nav>

<!-- MOBILE APP BAR (sidebar mode only, visible on compact screens) -->
{#if isSidebar}
  <header class="ox-drawer-appbar" data-ui="drawer-appbar">
    <button
      class="ox-drawer-appbar-btn"
      onclick={() => open = !open}
      aria-label="Menu"
      data-ui="drawer-appbar-menu"
    >
      <Menu size={24} strokeWidth={2} />
    </button>
    {#if title}
      <span class="ox-drawer-appbar-title">{title}</span>
    {/if}
  </header>

  <!-- Mobile sheet drawer (reuses same items) -->
  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="ox-drawer-mobile-scrim" onclick={() => open = false} role="presentation" aria-hidden="true"></div>
    <nav class="ox-drawer-mobile-sheet" data-ui="drawer-mobile-sheet">
      {#if title}
        <div class="ox-drawer-header">
          <span class="ox-drawer-title">{title}</span>
          <button class="ox-drawer-close-btn" onclick={() => open = false} aria-label="Close">
            <X size={20} strokeWidth={2} />
          </button>
        </div>
      {/if}
      <div class="ox-drawer-items">
        {#each items as item, i}
          <button
            class="ox-drawer-item"
            class:ox-drawer-item-active={activeId === item.id}
            onclick={() => handleClick(item.id)}
            onkeydown={(e) => handleKeydown(e, i)}
          >
            <span class="ox-drawer-item-icon">{item.icon}</span>
            <span class="ox-drawer-item-label">{item.label}</span>
          </button>
        {/each}
      </div>
    </nav>
  {/if}
{/if}

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     DRAWER — shared base
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-drawer {
    display: flex;
    flex-direction: column;
    background: var(--ox-surface-1, #F4EEFF);
    font-family: system-ui, sans-serif;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .ox-drawer::-webkit-scrollbar { width: 4px; }
  .ox-drawer::-webkit-scrollbar-thumb { background: var(--ox-outline-variant); border-radius: 2px; }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     MODE: SIDEBAR — fixed column
     MD3: 360px max, 256px standard
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-drawer-sidebar {
    width: var(--ox-drawer-width, 256px);
    flex-shrink: 0;
    border-right: 1px solid var(--ox-outline-variant, #CAC4D0);
    height: 100%;
    transition: width 250ms cubic-bezier(0.2, 0, 0, 1);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     MODE: RAIL — 80px icon column
     MD3: 80px width, icons centered
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-drawer-rail {
    width: 80px;
    flex-shrink: 0;
    border-right: 1px solid var(--ox-outline-variant, #CAC4D0);
    height: 100%;
    align-items: center;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     MODE: SHEET — overlay from left
     MD3: 360px max, elevation-1, rounded right
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-drawer-sheet {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    max-width: 85vw;
    z-index: 200;
    border-radius: 0 var(--ox-shape-lg, 16px) var(--ox-shape-lg, 16px) 0;
    box-shadow: var(--ox-elevation-1);
    transform: translateX(-100%);
    transition: transform 300ms cubic-bezier(0.2, 0, 0, 1);
  }
  .ox-drawer-sheet-open {
    transform: translateX(0);
  }

  .ox-drawer-scrim {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.32);
    z-index: 199;
    animation: ox-drawer-scrim-in 200ms ease-out;
  }
  @keyframes ox-drawer-scrim-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     HEADER
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 8px;
    min-height: 56px;
  }
  .ox-drawer-title {
    font: 500 18px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ox-drawer-collapse-btn,
  .ox-drawer-close-btn,
  .ox-drawer-expand-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    background: var(--ox-surface, #fff);
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    border-radius: 50%;
    flex-shrink: 0;
    transition: background 120ms;
  }
  .ox-drawer-collapse-btn:hover,
  .ox-drawer-close-btn:hover,
  .ox-drawer-expand-btn:hover {
    background: var(--ox-surface-2, #ebe6ee);
  }
  .ox-drawer-collapse-btn svg,
  .ox-drawer-close-btn svg,
  .ox-drawer-expand-btn svg {
    display: block;
  }

  .ox-drawer-rail-header {
    display: flex;
    justify-content: center;
    padding: 12px 0;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ITEMS
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-drawer-items {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 12px 12px;
  }

  .ox-drawer-rail .ox-drawer-items {
    padding: 0 8px 12px;
    align-items: center;
  }

  .ox-drawer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    height: 56px;
    border-radius: var(--ox-shape-full, 999px);
    border: none;
    background: transparent;
    cursor: pointer;
    font: 500 14px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    transition: background 120ms, color 120ms;
    width: 100%;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
  }

  /* Rail item — centered, square-ish */
  .ox-drawer-rail .ox-drawer-item {
    width: 56px;
    height: 56px;
    padding: 0;
    justify-content: center;
    border-radius: var(--ox-shape-lg, 16px);
  }

  .ox-drawer-item:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 16%, transparent);
  }

  .ox-drawer-item-active {
    background: var(--ox-secondary-container, #E8DEF8);
    color: var(--ox-on-secondary-container, #1D192B);
    font-weight: 600;
  }
  .ox-drawer-item-active:hover {
    background: color-mix(in srgb, var(--ox-secondary-container, #E8DEF8) 90%, var(--ox-on-secondary-container));
  }

  .ox-drawer-item-icon {
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
  }

  .ox-drawer-item-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     BOTTOM ZONE
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-drawer-bottom {
    margin-top: auto;
    padding: 8px 12px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .ox-drawer-rail .ox-drawer-bottom {
    padding: 8px 8px 12px;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     MOBILE APP BAR — visible on compact screens (sidebar mode)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-drawer-appbar {
    display: none;
    align-items: center;
    gap: 4px;
    height: 56px;
    padding: 0 4px;
    background: var(--ox-surface, #FFFBFE);
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    flex-shrink: 0;
  }
  .ox-drawer-appbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: none;
    background: none;
    color: var(--ox-on-surface, #1C1B1F);
    cursor: pointer;
    border-radius: 50%;
    transition: background 120ms;
  }
  .ox-drawer-appbar-btn:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
  }
  .ox-drawer-appbar-title {
    font: 500 22px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
  }

  .ox-drawer-mobile-scrim {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.32);
    z-index: 199;
  }
  .ox-drawer-mobile-sheet {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    max-width: 85vw;
    z-index: 200;
    background: var(--ox-surface-1, #F4EEFF);
    border-radius: 0 var(--ox-shape-lg, 16px) var(--ox-shape-lg, 16px) 0;
    box-shadow: var(--ox-elevation-1);
    flex-direction: column;
    overflow-y: auto;
    animation: ox-drawer-slide-in 300ms cubic-bezier(0.2, 0, 0, 1);
  }
  @keyframes ox-drawer-slide-in {
    from { transform: translateX(-100%); }
    to   { transform: translateX(0); }
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RESPONSIVE — sidebar mode transforms
     Compact (<600px): hide drawer, show app bar + mobile sheet
     Medium (600-839px): collapse to rail
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  @media (max-width: 839px) {
    .ox-drawer-sidebar {
      width: 80px;
      align-items: center;
    }
    .ox-drawer-sidebar .ox-drawer-header { display: none; }
    .ox-drawer-sidebar .ox-drawer-items { padding: 0 8px 12px; align-items: center; }
    .ox-drawer-sidebar .ox-drawer-item {
      width: 56px;
      height: 56px;
      padding: 0;
      justify-content: center;
      border-radius: var(--ox-shape-lg, 16px);
    }
    .ox-drawer-sidebar .ox-drawer-item-label { display: none; }
  }

  @media (max-width: 599px) {
    .ox-drawer-sidebar { display: none; }
    .ox-drawer-appbar { display: flex; }
    .ox-drawer-mobile-scrim { display: block; }
    .ox-drawer-mobile-sheet { display: flex; }
  }

  /* Rail mode — never changes on responsive */
  @media (max-width: 599px) {
    .ox-drawer-rail { /* stays as rail */ }
  }
</style>
