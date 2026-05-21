<script lang="ts" module>
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // TYPES & HELPERS
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  export interface OxEntityAction {
    label: string
    href: string
    icon?: string  // SVG inline string OU emoji
    variant?: 'primary' | 'neutral' | 'danger' | 'dark' | 'light'
    title?: string // tooltip natif
    /** Optionnel : numéro de l'entité référencée (ex "2025-007"). Affiché à droite du label. */
    num?: string
    /** Empêche la navigation : utilisé pour les actions JS (modal, etc.).
     *  Le href sert juste de hint visuel ; au clic on stoppe l'event. */
    noNav?: boolean
  }

  /**
   * Sérialise un tableau d'actions en HTML pour la colonne `_actions` d'OxEntityTable.
   * À utiliser dans render() d'une OxTableColumn :
   *   { key: '_actions', label: '', render: (_, row) => entityActionsHtml([...]) }
   *
   * Support du format Axelo "voir <abr> <num?>" via variant: 'dark' + num.
   */
  export function entityActionsHtml(actions: OxEntityAction[]): string {
    if (!actions.length) return ''
    const items = actions
      .map((a) => {
        const v = a.variant ?? 'neutral'
        const t = a.title ? ` title="${escapeAttr(a.title)}"` : ''
        const icon = a.icon ? `<span class="ox-ea-icon">${a.icon}</span>` : ''
        const num = a.num ? `<span class="ox-ea-num">${escapeHtml(a.num)}</span>` : ''
        const dataNoNav = a.noNav ? ' data-no-nav="1"' : ''
        return `<a class="ox-ea-btn ox-ea-btn--${v}" href="${escapeAttr(a.href)}"${t}${dataNoNav}>${icon}<span class="ox-ea-label">${escapeHtml(a.label)}</span>${num}</a>`
      })
      .join('')
    return `<div class="ox-ea-row">${items}</div>`
  }

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
  function escapeAttr(s: string): string {
    return escapeHtml(s).replace(/"/g, '&quot;')
  }

  /**
   * Variante dropdown : 1 bouton trigger + popover natif HTML (no JS).
   * Utile quand >3 actions saturent la colonne. `popoverId` doit être unique
   * par row (ex: `acts-${row.id}`).
   */
  export function entityActionsDropdownHtml(
    actions: OxEntityAction[],
    popoverId: string,
  ): string {
    if (!actions.length) return ''
    const items = actions
      .map((a) => {
        const v = a.variant ?? 'neutral'
        return `<a class="ox-ea-menu-item ox-ea-menu-item--${v}" href="${escapeAttr(a.href)}">${escapeHtml(a.label)}</a>`
      })
      .join('')
    const id = escapeAttr(popoverId)
    return (
      `<div class="ox-ea-row">` +
        `<button type="button" class="ox-ea-btn ox-ea-btn--neutral" popovertarget="${id}" aria-label="Actions" title="Actions">⋯</button>` +
        `<div popover id="${id}" class="ox-ea-menu">${items}</div>` +
      `</div>`
    )
  }
</script>

<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxEntityTable — DS-4 Admin Entity Table                 │
   * │                                                         │
   * │ Pattern 3 niveaux pour les listes admin :                │
   * │   1. Toolbar : recherche + bouton "Ajouter"             │
   * │   2. Filtres : chips toggle group                       │
   * │   3. Tableau : OxTable + footer count + pagination      │
   * └─────────────────────────────────────────────────────────┘
   */

  import OxTable, { type OxTableColumn, type OxTableFilter } from './OxTable.svelte'
  import OxButton from '../buttons/OxButton.svelte'
  import { Search, X } from '@lucide/svelte'

  interface Props {
    columns: OxTableColumn[]
    rows: Record<string, any>[]
    searchPlaceholder?: string
    addLabel?: string
    onAdd?: () => void
    filters?: OxTableFilter[]
    filterField?: string
    pageSize?: number
    striped?: boolean
    compact?: boolean
    caption?: string
    onRowClick?: (row: Record<string, any>) => void
    /** Borne basse de l'effort visuel : si false, search bar masquée. */
    searchable?: boolean
  }

  let {
    columns,
    rows,
    searchPlaceholder = 'Rechercher…',
    addLabel,
    onAdd,
    filters = [],
    filterField,
    pageSize = 25,
    striped = true,
    compact = false,
    caption,
    onRowClick,
    searchable = true,
  }: Props = $props()

  let query        = $state('')
  let activeFilter = $state('')

  // ── Pipeline filter+search appliqué AVANT OxTable (qui restera passif) ──
  const filteredRows = $derived.by(() => {
    let result = rows
    if (activeFilter && filterField) {
      result = result.filter((r) => String(r[filterField]) === activeFilter)
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      result = result.filter((r) =>
        columns.some((col) => String(r[col.key] ?? '').toLowerCase().includes(q))
      )
    }
    return result
  })
</script>

<div class="ox-entity-table" data-ui="ox-entity-table">
  <!-- ── Niveau 1 : Toolbar (Add à gauche, Search à droite) ── -->
  {#if searchable || onAdd}
    <div class="ox-entity-toolbar">
      {#if onAdd}
        <OxButton variant="filled" size="sm" onclick={onAdd}>
          {addLabel ?? '+ Ajouter'}
        </OxButton>
      {:else}
        <span></span>
      {/if}

      {#if searchable}
        <div class="ox-entity-search">
          <Search class="ox-entity-search-icon" size={16} strokeWidth={2} />
          <input
            class="ox-entity-search-input"
            type="search"
            placeholder={searchPlaceholder}
            bind:value={query}
            aria-label={searchPlaceholder}
          />
          {#if query}
            <button class="ox-entity-search-clear" onclick={() => (query = '')} aria-label="Effacer"><X size={14} strokeWidth={2} /></button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <!-- ── Niveau 2 : Filtres chips (centrés horizontalement) ── -->
  {#if filters.length > 0}
    <div class="ox-entity-filters" role="group" aria-label="Filtres">
      <button
        class="ox-entity-filter-btn"
        class:active={activeFilter === ''}
        onclick={() => (activeFilter = '')}
      >
        Tous
      </button>
      {#each filters as f (f.value)}
        <button
          class="ox-entity-filter-btn"
          class:active={activeFilter === f.value}
          onclick={() => (activeFilter = f.value)}
        >
          {f.label}
        </button>
      {/each}
    </div>
  {/if}

  <!-- ── Niveau 3 : Table + footer count (interne OxTable) ── -->
  <OxTable
    {columns}
    rows={filteredRows}
    {pageSize}
    {striped}
    {compact}
    {caption}
    {onRowClick}
    searchable={false}
    filters={[]}
  />
</div>

<style>
  .ox-entity-table {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    font-family: system-ui, sans-serif;
  }

  /* ── Niveau 1 : Toolbar (Add à gauche, Search à droite) ── */
  .ox-entity-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .ox-entity-search {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 240px;
    max-width: 360px;
    margin-left: auto;
  }
  :global(.ox-entity-search-icon) {
    position: absolute;
    left: 12px;
    color: var(--ox-on-surface-variant, #49454F);
    pointer-events: none;
    flex-shrink: 0;
  }
  .ox-entity-search-input {
    width: 100%;
    padding: 9px 36px 9px 36px;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-full, 999px);
    background: #FFFFFF;
    color: var(--ox-on-surface, #1C1B1F);
    font: 400 14px system-ui;
    outline: none;
    transition: border-color 150ms, box-shadow 150ms;
    appearance: none;
  }
  .ox-entity-search-input::-webkit-search-cancel-button { display: none; }
  .ox-entity-search-input:focus {
    border-color: var(--ox-primary, #6750A4);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ox-primary) 15%, transparent);
  }
  .ox-entity-search-input::placeholder {
    color: var(--ox-on-surface-variant, #49454F);
    opacity: 0.7;
  }
  .ox-entity-search-clear {
    position: absolute;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 50%;
    background: var(--ox-surface-3, #E6DEFF);
    color: var(--ox-on-surface-variant, #49454F);
    font-size: 10px;
    cursor: pointer;
    padding: 0;
    transition: background 100ms;
  }
  .ox-entity-search-clear:hover {
    background: var(--ox-outline-variant);
  }

  /* ── Niveau 2 : Filtres chips (centrés horizontalement) ── */
  .ox-entity-filters {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .ox-entity-filter-btn {
    padding: 6px 14px;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-full, 999px);
    background: var(--ox-surface, #FFFBFE);
    font: 500 13px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    transition: background 120ms, color 120ms, border-color 120ms;
    white-space: nowrap;
  }
  .ox-entity-filter-btn:hover {
    background: var(--ox-surface-2, #EDE8F5);
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-entity-filter-btn.active {
    background: var(--ox-primary, #6750A4);
    border-color: var(--ox-primary, #6750A4);
    color: var(--ox-on-primary, #FFFFFF);
    font-weight: 600;
  }

  /* ── Actions row (rendu via entityActionsHtml() dans une colonne render) ── */
  :global(.ox-ea-row) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
    justify-content: flex-end;
  }
  :global(.ox-ea-btn) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: var(--ox-shape-full, 999px);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-on-surface, #1C1B1F);
    font: 500 12px system-ui;
    text-decoration: none;
    white-space: nowrap;
    transition: background 100ms, border-color 100ms, color 100ms;
  }
  :global(.ox-ea-btn:hover) {
    background: var(--ox-surface-2, #EDE8F5);
    border-color: var(--ox-outline);
  }
  :global(.ox-ea-btn--primary) {
    background: var(--ox-primary-container, #EADDFF);
    border-color: transparent;
    color: var(--ox-on-primary-container, #21005D);
  }
  :global(.ox-ea-btn--primary:hover) {
    background: color-mix(in srgb, var(--ox-primary) 30%, var(--ox-primary-container));
  }
  :global(.ox-ea-btn--danger) {
    color: var(--ox-error, #B3261E);
    border-color: color-mix(in srgb, var(--ox-error) 30%, transparent);
  }
  :global(.ox-ea-btn--danger:hover) {
    background: color-mix(in srgb, var(--ox-error) 8%, transparent);
  }
  /* Format Axelo : bouton noir/blanc + numéro à droite (ex : "voir fac 2025-007").
     Convention guideline : --dark = lien EXTERNAL (autre entité).
     cf apps/1-axelo/0-doc/admin-buttons-guideline.md */
  :global(.ox-ea-btn--dark) {
    background: #111;
    color: #fff;
    border-color: #111;
    border-radius: 8px;
    padding: 5px 10px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }
  :global(.ox-ea-btn--dark:hover) {
    background: #000;
    border-color: #000;
    color: #fff;
  }
  :global(.ox-ea-btn--dark .ox-ea-num) {
    margin-left: 6px;
    padding-left: 6px;
    border-left: 1px solid color-mix(in srgb, #fff 30%, transparent);
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    opacity: .85;
  }
  /* Pendant blanc : --light = lien SELF (même entité). Symétrique à --dark.
     cf apps/1-axelo/0-doc/admin-buttons-guideline.md */
  :global(.ox-ea-btn--light) {
    background: #fff;
    color: #111;
    border-color: #111;
    border-radius: 8px;
    padding: 5px 10px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }
  :global(.ox-ea-btn--light:hover) {
    background: #f4f4f4;
    border-color: #000;
    color: #000;
  }
  :global(.ox-ea-btn--light .ox-ea-num) {
    margin-left: 6px;
    padding-left: 6px;
    border-left: 1px solid color-mix(in srgb, #111 25%, transparent);
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    opacity: .75;
  }
  :global(.ox-ea-icon) {
    display: inline-flex;
    align-items: center;
    line-height: 1;
  }

  /* ── Variant dropdown : popover natif (no JS) ── */
  :global(.ox-ea-menu) {
    margin: 0;
    padding: 6px;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-md, 12px);
    background: var(--ox-surface, #FFFBFE);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06);
    min-width: 160px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  :global(.ox-ea-menu:popover-open) {
    animation: ox-ea-menu-in 120ms ease-out;
  }
  @keyframes ox-ea-menu-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  :global(.ox-ea-menu-item) {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: var(--ox-shape-sm, 8px);
    color: var(--ox-on-surface, #1C1B1F);
    text-decoration: none;
    font: 500 13px system-ui;
    transition: background 100ms;
  }
  :global(.ox-ea-menu-item:hover) {
    background: var(--ox-surface-2, #EDE8F5);
  }
  :global(.ox-ea-menu-item--primary) {
    color: var(--ox-on-primary-container, #21005D);
  }
  :global(.ox-ea-menu-item--danger) {
    color: var(--ox-error, #B3261E);
  }
  :global(.ox-ea-menu-item--danger:hover) {
    background: color-mix(in srgb, var(--ox-error) 8%, transparent);
  }
</style>
