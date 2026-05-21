<script lang="ts" module>
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // PUBLIC TYPES
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  export interface OxSearchItem {
    id: string
    title: string
    excerpt?: string
    category?: string
    url?: string
    meta?: Record<string, string>
  }

  export interface OxSearchCategory {
    value: string
    label: string
    count?: number
  }
</script>

<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxSearchPalette
   * │ Command Palette / Spotlight-style search popup
   * │ Powered by @zag-js/combobox + native <dialog>
   * │ The parent provides the filtered items (via query bind)
   * │ — agnostic of the backend (Pagefind, Algolia, Firestore…)
   * └─────────────────────────────────────────────────────────┘
   */
  import * as combobox from '@zag-js/combobox'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { onMount } from 'svelte'
  import { Search } from '@lucide/svelte'

  interface Props {
    open: boolean
    items: OxSearchItem[]
    query?: string
    placeholder?: string
    emptyLabel?: string
    loading?: boolean
    categories?: OxSearchCategory[]
    activeCategories?: string[]
    showShortcut?: boolean
    onSelect?: (item: OxSearchItem) => void
    onClose?: () => void
  }

  let {
    open = $bindable(false),
    items,
    query = $bindable(''),
    placeholder = 'Rechercher…',
    emptyLabel = 'Aucun résultat.',
    loading = false,
    categories = [],
    activeCategories = $bindable([]),
    showShortcut = true,
    onSelect,
    onClose,
  }: Props = $props()

  const id = `ox-search-${Math.random().toString(36).slice(2, 8)}`
  let dialogEl = $state<HTMLDialogElement | undefined>(undefined)
  let mounted = $state(false)

  onMount(() => { mounted = true })

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // DIALOG OPEN / CLOSE
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  $effect(() => {
    if (!mounted || !dialogEl) return
    if (open) {
      if (!dialogEl.open) dialogEl.showModal()
    } else {
      if (dialogEl.open) dialogEl.close()
    }
  })

  function handleClose() {
    open = false
    query = ''
    onClose?.()
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === dialogEl) handleClose()
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // COMBOBOX MACHINE — autocomplete + keyboard nav
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  const collection = $derived(
    combobox.collection({
      items,
      itemToValue: (item) => item.id,
      itemToString: (item) => item.title,
    })
  )

  const service = useMachine(combobox.machine, () => ({
    id,
    collection,
    inputValue: query,
    inputBehavior: 'none' as const,
    selectionBehavior: 'preserve' as const,
    openOnClick: false,
    loopFocus: true,
    onInputValueChange: (d: { inputValue: string }) => {
      query = d.inputValue
    },
    onValueChange: (d: { value: string[] }) => {
      const picked = items.find((it) => it.id === d.value[0])
      if (picked) {
        onSelect?.(picked)
        handleClose()
      }
    },
  }))

  const api = $derived(combobox.connect(service, normalizeProps))

  // Force the listbox to stay open while the dialog is open (so users see results
  // immediately, without needing to click the input first)
  $effect(() => {
    if (open && api && !api.open) {
      api.setOpen(true)
    }
  })

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // CATEGORY FILTERS
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  function toggleCategory(value: string) {
    activeCategories = activeCategories.includes(value)
      ? activeCategories.filter((c) => c !== value)
      : [...activeCategories, value]
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialogEl}
  class="ox-sp"
  data-ui="ox-search-palette"
  aria-label={placeholder}
  onclick={handleBackdropClick}
  onclose={handleClose}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="ox-sp-inner" {...api.getRootProps()} onclick={(e) => e.stopPropagation()}>

    <!-- ── Search input row ──────────────────────────── -->
    <div class="ox-sp-input-row" {...api.getControlProps()}>
      <Search class="ox-sp-icon" size={18} strokeWidth={2} />
      <input
        class="ox-sp-input"
        data-ui="search-palette-input"
        type="search"
        autocomplete="off"
        spellcheck="false"
        {placeholder}
        {...api.getInputProps()}
      />
      {#if loading}
        <span class="ox-sp-spinner" aria-hidden="true"></span>
      {:else if showShortcut}
        <kbd class="ox-sp-kbd">Esc</kbd>
      {/if}
    </div>

    <!-- ── Category filter chips ─────────────────────── -->
    {#if categories.length > 0}
      <div class="ox-sp-filters" data-ui="search-palette-filters">
        {#each categories as cat}
          {@const active = activeCategories.includes(cat.value)}
          <button
            class="ox-sp-chip"
            class:active
            data-ui="search-palette-chip-{cat.value}"
            type="button"
            onclick={() => toggleCategory(cat.value)}
          >
            {cat.label}
            {#if cat.count != null}
              <span class="ox-sp-chip-count">{cat.count}</span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}

    <!-- ── Results list ──────────────────────────────── -->
    <div class="ox-sp-positioner" {...api.getPositionerProps()}>
      <ul class="ox-sp-list" {...api.getContentProps()}>
        {#if items.length === 0 && !loading}
          <li class="ox-sp-empty" data-ui="search-palette-empty">{emptyLabel}</li>
        {:else}
          {#each items as item}
            <li
              class="ox-sp-item"
              data-ui="search-palette-item-{item.id}"
              {...api.getItemProps({ item })}
            >
              <div class="ox-sp-item-main">
                <span class="ox-sp-item-title">{item.title}</span>
                {#if item.excerpt}
                  <span class="ox-sp-item-excerpt">{@html item.excerpt}</span>
                {/if}
              </div>
              {#if item.category}
                <span class="ox-sp-item-cat">{item.category}</span>
              {/if}
            </li>
          {/each}
        {/if}
      </ul>
    </div>

    <!-- ── Footer hints ──────────────────────────────── -->
    {#if showShortcut}
      <div class="ox-sp-footer">
        <span><kbd class="ox-sp-kbd">↵</kbd> sélectionner</span>
        <span><kbd class="ox-sp-kbd">↑</kbd><kbd class="ox-sp-kbd">↓</kbd> naviguer</span>
        <span><kbd class="ox-sp-kbd">Esc</kbd> fermer</span>
      </div>
    {/if}

  </div>
</dialog>

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   * Dialog shell
   * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-sp {
    padding: 0;
    border: none;
    border-radius: var(--ox-shape-lg, 16px);
    background: var(--ox-surface, #FFFBFE);
    box-shadow: var(--ox-elevation-3,
      0 4px 16px 4px rgba(0,0,0,.12),
      0 2px 6px rgba(0,0,0,.18));
    width: min(640px, 92vw);
    max-height: 70vh;
    overflow: hidden;
    /* Top-anchored, like Linear / Raycast */
    position: fixed;
    top: 14vh;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    display: none;
  }
  .ox-sp[open] {
    display: flex;
    animation: ox-sp-in 160ms cubic-bezier(0.2, 0, 0, 1);
  }
  @keyframes ox-sp-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .ox-sp::backdrop {
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(2px);
  }
  .ox-sp:focus { outline: none; }

  .ox-sp-inner {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 70vh;
    overflow: hidden;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   * Input row
   * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-sp-input-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
  }

  :global(.ox-sp-icon) {
    width: 18px;
    height: 18px;
    color: var(--ox-on-surface-variant, #49454F);
    flex-shrink: 0;
  }

  .ox-sp-input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: none;
    font: 400 16px/1.4 system-ui, sans-serif;
    color: var(--ox-on-surface, #1C1B1F);
    padding: 0;
  }
  .ox-sp-input::placeholder {
    color: var(--ox-on-surface-variant, #49454F);
  }
  .ox-sp-input::-webkit-search-cancel-button { display: none; }

  .ox-sp-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--ox-outline-variant, #CAC4D0);
    border-top-color: var(--ox-primary, #6750A4);
    border-radius: 50%;
    animation: ox-sp-spin 600ms linear infinite;
    flex-shrink: 0;
  }
  @keyframes ox-sp-spin { to { transform: rotate(360deg); } }

  .ox-sp-kbd {
    font: 500 11px/1 system-ui, sans-serif;
    padding: 3px 6px;
    background: var(--ox-surface-2, #F4EEFF);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: 5px;
    color: var(--ox-on-surface-variant, #49454F);
    flex-shrink: 0;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   * Filter chips
   * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-sp-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px 18px;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
  }

  .ox-sp-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: 999px;
    background: transparent;
    color: var(--ox-on-surface-variant, #49454F);
    font: 500 12px/1.2 system-ui, sans-serif;
    cursor: pointer;
    transition: background 120ms, border-color 120ms, color 120ms;
  }
  .ox-sp-chip:hover {
    background: var(--ox-surface-2, #F4EEFF);
  }
  .ox-sp-chip.active {
    background: var(--ox-primary, #6750A4);
    border-color: var(--ox-primary, #6750A4);
    color: var(--ox-on-primary, #FFFFFF);
  }
  .ox-sp-chip-count {
    font-size: 10px;
    opacity: 0.7;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   * Results list
   * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-sp-positioner {
    flex: 1;
    overflow: hidden;
    position: unset;
  }

  .ox-sp-list {
    list-style: none;
    margin: 0;
    padding: 6px;
    overflow-y: auto;
    max-height: 100%;
  }
  .ox-sp-list[hidden] { display: none; }

  .ox-sp-empty {
    padding: 32px 16px;
    text-align: center;
    color: var(--ox-on-surface-variant, #49454F);
    font: 400 14px/1.4 system-ui, sans-serif;
  }

  .ox-sp-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 100ms;
  }
  .ox-sp-item[data-highlighted] {
    background: var(--ox-surface-2, #F4EEFF);
  }
  .ox-sp-item-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .ox-sp-item-title {
    font: 500 14px/1.3 system-ui, sans-serif;
    color: var(--ox-on-surface, #1C1B1F);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ox-sp-item-excerpt {
    font: 400 12px/1.4 system-ui, sans-serif;
    color: var(--ox-on-surface-variant, #49454F);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  /* Pagefind injects <mark> tags inside the excerpt — style them here */
  .ox-sp-item-excerpt :global(mark) {
    background: transparent;
    color: var(--ox-primary, #6750A4);
    font-weight: 600;
  }
  .ox-sp-item-cat {
    font: 500 10px/1 system-ui, sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    padding: 3px 8px;
    background: var(--ox-surface-2, #F4EEFF);
    color: var(--ox-on-surface-variant, #49454F);
    border-radius: 999px;
    flex-shrink: 0;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   * Footer
   * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-sp-footer {
    display: flex;
    gap: 16px;
    padding: 8px 18px;
    border-top: 1px solid var(--ox-outline-variant, #CAC4D0);
    background: var(--ox-surface-1, #F7F2FA);
    font: 400 11px/1.2 system-ui, sans-serif;
    color: var(--ox-on-surface-variant, #49454F);
  }
  .ox-sp-footer span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
</style>
