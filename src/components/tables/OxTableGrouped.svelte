<script lang="ts" module>
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // TYPES (exported)
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  import type { Snippet } from 'svelte'

  export interface OxTableGroupedCellContext<R = Record<string, any>> {
    row: R
    value: unknown
    query: string
    rowIndex: number
  }

  export interface OxTableGroupedColumn<R = Record<string, any>> {
    key: string
    label: string
    sortable?: boolean
    align?: 'left' | 'center' | 'right'
    width?: string
    /** Snippet de rendu custom de la cellule (override default). */
    cell?: Snippet<[OxTableGroupedCellContext<R>]>
  }

  export interface OxTableGroupedFilter {
    label: string
    value: string
  }
</script>

<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxTableGrouped — DS-4 advanced data table              │
   * │                                                         │
   * │ Comme OxTable + : groupes, sub-categories chips,       │
   * │ letterpress, cellules customisables via snippets,      │
   * │ toggle "Grouper", row add/delete.                      │
   * │                                                         │
   * │ Pour les cas simples : utiliser OxTable (plus léger).  │
   * └─────────────────────────────────────────────────────────┘
   */
  import {
    SearchIcon, ChevronsUpDownIcon, ChevronUpIcon, ChevronDownIcon,
    PlusIcon, Trash2Icon,
  } from '@lucide/svelte'

  interface Props<R = Record<string, any>> {
    // Base (héritage OxTable)
    columns: OxTableGroupedColumn<R>[]
    rows: R[]
    searchable?: boolean
    /** $bindable — texte de recherche. Permet à un parent de piloter la
     *  search depuis l'extérieur (toolbar custom) sans utiliser l'input
     *  intégré (searchable=false). Filtre les rows ET alimente le `query`
     *  passé aux snippets de cellule pour le highlight. */
    query?: string
    filters?: OxTableGroupedFilter[]
    filterField?: string
    pageSize?: number
    striped?: boolean
    compact?: boolean
    stickyHeader?: boolean
    nowrap?: boolean
    caption?: string
    onRowClick?: (row: R) => void

    // Groupes
    groupBy?: (row: R) => string | null | undefined
    /** $bindable — true = mode groupé visible, false = flat. */
    groupingEnabled?: boolean
    showGroupingToggle?: boolean
    letterpressGroupHeaders?: boolean
    /** Template du label header de groupe — défaut: `${key} · N entrée(s)` */
    groupTitle?: (key: string, count: number) => string

    // Sub-categories chips (filtres rapides sous le header)
    subCategoryField?: string
    /** $bindable — clé active (null = toutes). */
    activeSubCategory?: string | null

    // Édition
    editable?: boolean
    onRowAdd?: () => void
    onRowDelete?: (row: R) => void

    // Theming
    categoryColor?: string
    categoryBg?: string
    headerBg?: string
    headerFg?: string

    // En-tête custom (section titre + email + ce que tu veux)
    title?: string
    sectionHeader?: Snippet
  }

  let {
    columns,
    rows,
    searchable = false,
    query = $bindable(''),
    filters = [],
    filterField,
    pageSize = 0,
    striped = false,
    compact = false,
    stickyHeader = false,
    nowrap = false,
    caption,
    onRowClick,
    groupBy,
    groupingEnabled = $bindable(false),
    showGroupingToggle = false,
    letterpressGroupHeaders = false,
    groupTitle,
    subCategoryField,
    activeSubCategory = $bindable(null),
    editable = false,
    onRowAdd,
    onRowDelete,
    categoryColor,
    categoryBg,
    headerBg,
    headerFg,
    title,
    sectionHeader,
  }: Props = $props()

  let activeFilter = $state('')
  let sortKey      = $state<string | null>(null)
  let sortDir      = $state<'asc' | 'desc'>('asc')
  let page         = $state(0)

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // Sub-categories disponibles (dédup + tri alpha)
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  const availableSubCategories = $derived.by<string[]>(() => {
    if (!subCategoryField) return []
    const set = new Set<string>()
    for (const r of rows) {
      const v = (r as any)[subCategoryField]
      if (typeof v === 'string' && v.trim()) set.add(v.trim())
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'fr'))
  })

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // Ordre des groupes = première apparition dans rows
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  const groupOrder = $derived.by<Map<string, number>>(() => {
    const map = new Map<string, number>()
    if (!groupBy) return map
    for (const r of rows) {
      const k = (groupBy(r) ?? '').toString().toLowerCase()
      if (!map.has(k)) map.set(k, map.size)
    }
    return map
  })

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // Pipeline : filter → sub-cat → search → sort
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  const filtered = $derived.by(() => {
    let result = rows

    if (activeFilter && filterField) {
      result = result.filter(r => String((r as any)[filterField]) === activeFilter)
    }

    if (subCategoryField && activeSubCategory) {
      result = result.filter(r => String((r as any)[subCategoryField] ?? '') === activeSubCategory)
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      result = result.filter(r =>
        columns.some(col => String((r as any)[col.key] ?? '').toLowerCase().includes(q))
      )
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        // Si grouping actif → tri primaire par clé de groupe (ordre première apparition)
        if (groupingEnabled && groupBy) {
          const ga = (groupBy(a) ?? '').toString().toLowerCase()
          const gb = (groupBy(b) ?? '').toString().toLowerCase()
          if (ga === '' && gb !== '') return 1
          if (gb === '' && ga !== '') return -1
          if (ga !== gb) {
            const oa = groupOrder.get(ga) ?? Number.MAX_SAFE_INTEGER
            const ob = groupOrder.get(gb) ?? Number.MAX_SAFE_INTEGER
            return oa - ob
          }
        }
        const va = (a as any)[sortKey!]
        const vb = (b as any)[sortKey!]
        const cmp = typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va ?? '').localeCompare(String(vb ?? ''), 'fr', { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    } else if (groupingEnabled && groupBy) {
      // Pas de tri user mais grouping → ordonner par clé de groupe (première apparition)
      result = [...result].sort((a, b) => {
        const ga = (groupBy(a) ?? '').toString().toLowerCase()
        const gb = (groupBy(b) ?? '').toString().toLowerCase()
        if (ga === '' && gb !== '') return 1
        if (gb === '' && ga !== '') return -1
        const oa = groupOrder.get(ga) ?? Number.MAX_SAFE_INTEGER
        const ob = groupOrder.get(gb) ?? Number.MAX_SAFE_INTEGER
        return oa - ob
      })
    }

    return result
  })

  const totalPages = $derived(pageSize > 0 ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1)
  const visible    = $derived(pageSize > 0 ? filtered.slice(page * pageSize, (page + 1) * pageSize) : filtered)

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // Rows avec séparateurs de groupe intercalés
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  type RowItem = { kind: 'row'; data: Record<string, any>; index: number }
  type HeaderItem = { kind: 'header'; tag: string; count: number }

  const rowsWithSeparators = $derived.by<Array<RowItem | HeaderItem>>(() => {
    if (!groupingEnabled || !groupBy) {
      return visible.map((r, i) => ({ kind: 'row' as const, data: r, index: i }))
    }
    const out: Array<RowItem | HeaderItem> = []
    let currentTag: string | null = null
    let currentHeader: HeaderItem | null = null
    for (let i = 0; i < visible.length; i++) {
      const r = visible[i]
      const rawTag = (groupBy(r) ?? '').toString().trim()
      const tag = rawTag || '(sans groupe)'
      if (tag !== currentTag) {
        currentTag = tag
        currentHeader = { kind: 'header', tag, count: 0 }
        out.push(currentHeader)
      }
      out.push({ kind: 'row', data: r, index: i })
      if (currentHeader) currentHeader.count++
    }
    return out
  })

  $effect(() => { query; activeFilter; activeSubCategory; sortKey; sortDir; page = 0 })

  function toggleSort(key: string) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey = key
      sortDir = 'asc'
    }
  }

  function ariaSortAttr(key: string): 'none' | 'ascending' | 'descending' | undefined {
    const col = columns.find(c => c.key === key)
    if (!col?.sortable) return undefined
    if (sortKey !== key) return 'none'
    return sortDir === 'asc' ? 'ascending' : 'descending'
  }

  function fmtGroupTitle(key: string, count: number): string {
    if (groupTitle) return groupTitle(key, count)
    return `${key} · ${count} entrée${count > 1 ? 's' : ''}`
  }

  const colspan = $derived(columns.length + (editable && onRowDelete ? 1 : 0))

  // Position du toggle "Grouper" : dans le header de section si présent,
  // sinon dans la barre des sous-catégories.
  const hasSectionHeader = $derived(!!(title || sectionHeader))
  const toggleInHeader = $derived(hasSectionHeader && showGroupingToggle)
  const toggleInSubcats = $derived(showGroupingToggle && !toggleInHeader)
</script>

<section data-ui="ox-table-grouped"
  class="oxtg"
  style:--oxtg-category-color={categoryColor}
  style:--oxtg-category-bg={categoryBg}
  style:--oxtg-header-bg={headerBg}
  style:--oxtg-header-fg={headerFg}
>

  <!-- ▓▓▓ HEADER SECTION (optional title + custom + toggle aligné droite) ▓▓▓ -->
  {#if hasSectionHeader}
    <header class="oxtg-section-header" class:oxtg-section-header--filled={true}>
      <div class="oxtg-section-header-main">
        {#if title}<h2 class="oxtg-section-title">{title}</h2>{/if}
        {#if sectionHeader}{@render sectionHeader()}{/if}
      </div>
      {#if toggleInHeader}
        <button
          type="button"
          class="oxtg-group-toggle oxtg-group-toggle--on-dark"
          data-on={groupingEnabled}
          onclick={() => groupingEnabled = !groupingEnabled}
          title="Grouper visuellement"
        >
          <span class="oxtg-toggle-track"><span class="oxtg-toggle-thumb"></span></span>
          Grouper
        </button>
      {/if}
    </header>
  {/if}

  <!-- ▓▓▓ SUB-CATEGORIES CHIPS (+ toggle si pas dans le header) ▓▓▓ -->
  {#if availableSubCategories.length > 0 || toggleInSubcats}
    <div class="oxtg-subcats">
      {#if availableSubCategories.length > 0}
        <span class="oxtg-subcats-label">Sous-catégorie&nbsp;:</span>
        {#each availableSubCategories as cat (cat)}
          <button
            type="button"
            class="oxtg-chip"
            class:oxtg-chip--active={activeSubCategory === cat}
            onclick={() => activeSubCategory = (activeSubCategory === cat ? null : cat)}
            title="Filtrer sur {cat}"
          >{cat}</button>
        {/each}
        {#if activeSubCategory}
          <button
            type="button"
            class="oxtg-chip-clear"
            onclick={() => activeSubCategory = null}
            title="Réinitialiser"
          >✕ réinitialiser</button>
        {/if}
      {/if}
      <span class="oxtg-subcats-spacer"></span>
      {#if toggleInSubcats}
        <button
          type="button"
          class="oxtg-group-toggle"
          data-on={groupingEnabled}
          onclick={() => groupingEnabled = !groupingEnabled}
          title="Grouper visuellement"
        >
          <span class="oxtg-toggle-track"><span class="oxtg-toggle-thumb"></span></span>
          Grouper
        </button>
      {/if}
    </div>
  {/if}

  <!-- ▓▓▓ TOOLBAR (search + filters) ▓▓▓ -->
  {#if searchable || filters.length > 0}
    <div class="oxtg-toolbar">
      {#if filters.length > 0}
        <div class="oxtg-filters" role="group" aria-label="Filtres">
          <button class="oxtg-filter-btn" class:active={activeFilter === ''} onclick={() => activeFilter = ''}>Tous</button>
          {#each filters as f}
            <button
              class="oxtg-filter-btn"
              class:active={activeFilter === f.value}
              onclick={() => activeFilter = f.value}
            >{f.label}</button>
          {/each}
        </div>
      {/if}
      {#if searchable}
        <div class="oxtg-search">
          <SearchIcon size={16} strokeWidth={2} />
          <input
            class="oxtg-search-input"
            type="search"
            placeholder="Rechercher…"
            bind:value={query}
            aria-label="Rechercher dans le tableau"
          />
          {#if query}
            <button class="oxtg-search-clear" onclick={() => query = ''} aria-label="Effacer">✕</button>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  <!-- ▓▓▓ TABLE ▓▓▓ -->
  <div
    class="oxtg-wrap"
    class:oxtg-sticky-wrap={stickyHeader}
    class:oxtg-wrap--joined-top={hasSectionHeader}
  >
    <table
      class="oxtg-table"
      class:oxtg--striped={striped}
      class:oxtg--compact={compact}
      class:oxtg--clickable={!!onRowClick}
      class:oxtg--nowrap={nowrap}
    >
      {#if caption}<caption class="oxtg-caption">{caption}</caption>{/if}

      <colgroup>
        {#each columns as col (col.key)}
          <col style:width={col.width} />
        {/each}
        {#if editable && onRowDelete}<col style="width: 40px;" />{/if}
      </colgroup>

      <thead class="oxtg-thead" class:oxtg-thead--sticky={stickyHeader}>
        <tr>
          {#each columns as col (col.key)}
            <th
              class="oxtg-th"
              class:oxtg-th--sortable={col.sortable}
              class:oxtg-th--sorted={sortKey === col.key}
              style:text-align={col.align ?? 'left'}
              scope="col"
              aria-sort={ariaSortAttr(col.key)}
            >
              {#if col.sortable}
                <button class="oxtg-sort-btn" onclick={() => toggleSort(col.key)} aria-label="Trier par {col.label}">
                  <span>{col.label}</span>
                  <span class="oxtg-sort-icon" aria-hidden="true">
                    {#if sortKey !== col.key}
                      <ChevronsUpDownIcon size={14} strokeWidth={2} style="opacity:0.4" />
                    {:else if sortDir === 'asc'}
                      <ChevronUpIcon size={14} strokeWidth={2.5} />
                    {:else}
                      <ChevronDownIcon size={14} strokeWidth={2.5} />
                    {/if}
                  </span>
                </button>
              {:else}
                {col.label}
              {/if}
            </th>
          {/each}
          {#if editable && onRowDelete}<th class="oxtg-th oxtg-th--action" aria-label="Actions"></th>{/if}
        </tr>
      </thead>

      <tbody class="oxtg-tbody">
        {#if rowsWithSeparators.length === 0}
          <tr>
            <td class="oxtg-empty" colspan={colspan}>
              <span class="oxtg-empty-icon"><SearchIcon size={32} strokeWidth={1.5} /></span>
              Aucun résultat
              {#if query} pour « <strong>{query}</strong> »{/if}
            </td>
          </tr>
        {:else}
          {#each rowsWithSeparators as item, i (i)}
            {#if item.kind === 'header'}
              <tr class="oxtg-group-sep">
                <td colspan={colspan}>
                  <span class="oxtg-group-sep-label">
                    <span class="oxtg-group-title" class:oxtg-group-title--letterpress={letterpressGroupHeaders}>
                      {item.tag}
                    </span>
                    <span class="oxtg-group-count">· {fmtGroupTitle(item.tag, item.count).replace(`${item.tag} · `, '')}</span>
                  </span>
                </td>
              </tr>
            {:else}
              <tr
                class="oxtg-row"
                onclick={onRowClick ? () => onRowClick(item.data) : undefined}
              >
                {#each columns as col (col.key)}
                  <td class="oxtg-td" style:text-align={col.align ?? 'left'}>
                    {#if col.cell}
                      {@render col.cell({ row: item.data, value: item.data[col.key], query, rowIndex: item.index })}
                    {:else}
                      {item.data[col.key] ?? '—'}
                    {/if}
                  </td>
                {/each}
                {#if editable && onRowDelete}
                  <td class="oxtg-td oxtg-td--action">
                    <button
                      type="button"
                      class="oxtg-btn-delete"
                      title="Supprimer la ligne"
                      aria-label="Supprimer la ligne"
                      onclick={(e) => { e.stopPropagation(); onRowDelete!(item.data) }}
                    >
                      <Trash2Icon size={16} strokeWidth={2} />
                    </button>
                  </td>
                {/if}
              </tr>
            {/if}
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  {#if editable && onRowAdd}
    <div class="oxtg-row-add">
      <button type="button" class="oxtg-btn-add" onclick={onRowAdd}>
        <PlusIcon size={14} strokeWidth={2} /> Ajouter une ligne
      </button>
    </div>
  {/if}

  <!-- ▓▓▓ FOOTER (pagination) ▓▓▓ -->
  {#if pageSize > 0 && totalPages > 1}
    <div class="oxtg-footer">
      <span class="oxtg-info">
        {filtered.length} ligne{filtered.length > 1 ? 's' : ''}
        {#if query || activeFilter || activeSubCategory} (filtrées){/if}
      </span>
      <div class="oxtg-pagination" role="navigation" aria-label="Pagination">
        <button class="oxtg-page-btn" onclick={() => page = Math.max(0, page - 1)} disabled={page === 0}>‹</button>
        {#each Array.from({ length: totalPages }, (_, i) => i) as p}
          <button
            class="oxtg-page-btn"
            class:oxtg-page-btn--active={p === page}
            onclick={() => page = p}
            aria-current={p === page ? 'page' : undefined}
          >{p + 1}</button>
        {/each}
        <button class="oxtg-page-btn" onclick={() => page = Math.min(totalPages - 1, page + 1)} disabled={page === totalPages - 1}>›</button>
      </div>
    </div>
  {/if}
</section>

<style>
  .oxtg {
    --oxtg-category-color: var(--ox-primary);
    --oxtg-category-bg: var(--ox-surface);
    --oxtg-header-bg: var(--ox-surface-1, #F4EEFF);
    --oxtg-header-fg: var(--ox-on-surface-variant, #49454F);
    font-family: system-ui, sans-serif;
  }

  /* ── Section header (fond foncé, collé au thead) ── */
  .oxtg-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 0;
  }
  .oxtg-section-header--filled {
    background: var(--oxtg-header-bg);
    color: var(--oxtg-header-fg);
    padding: 10px 14px;
    border-top-left-radius: var(--ox-shape-md, 8px);
    border-top-right-radius: var(--ox-shape-md, 8px);
  }
  .oxtg-section-header-main {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
    min-width: 0;
  }
  .oxtg-section-title {
    font: 600 18px/1.3 system-ui;
    color: inherit;
    margin: 0;
  }

  /* ── Sub-categories + group toggle ── */
  .oxtg-subcats {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    font-size: 13px;
  }
  .oxtg-subcats-label {
    color: var(--ox-on-surface-variant, #49454F);
    margin-right: 4px;
  }
  .oxtg-subcats-spacer { flex: 1; }

  .oxtg-chip {
    padding: 3px 10px;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-full, 999px);
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-on-surface, #1C1B1F);
    font: 500 12px system-ui;
    cursor: pointer;
    transition: background 120ms, border-color 120ms, color 120ms;
  }
  .oxtg-chip:hover {
    background: var(--ox-surface-2, #EDE8F5);
    border-color: var(--ox-outline);
  }
  .oxtg-chip--active {
    background: var(--oxtg-category-color);
    border-color: var(--oxtg-category-color);
    color: var(--ox-on-primary, #FFFFFF);
  }
  .oxtg-chip-clear {
    padding: 3px 10px;
    border: 1px dashed var(--ox-outline-variant);
    border-radius: var(--ox-shape-full, 999px);
    background: transparent;
    color: var(--ox-on-surface-variant);
    font: 500 11px system-ui;
    cursor: pointer;
  }
  .oxtg-chip-clear:hover { background: var(--ox-surface-2); }

  .oxtg-group-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border: 1px solid var(--ox-outline-variant);
    border-radius: var(--ox-shape-full, 999px);
    background: var(--ox-surface);
    color: var(--ox-on-surface);
    font: 500 12px system-ui;
    cursor: pointer;
    transition: background 120ms;
  }
  .oxtg-toggle-track {
    width: 22px; height: 12px;
    border-radius: 999px;
    background: var(--ox-outline-variant);
    position: relative;
    transition: background 150ms;
  }
  .oxtg-toggle-thumb {
    position: absolute;
    top: 1px; left: 1px;
    width: 10px; height: 10px;
    border-radius: 50%;
    background: var(--ox-surface);
    transition: transform 150ms;
  }
  .oxtg-group-toggle[data-on='true'] .oxtg-toggle-track { background: var(--oxtg-category-color); }
  .oxtg-group-toggle[data-on='true'] .oxtg-toggle-thumb { transform: translateX(10px); }

  /* Variante claire pour le toggle posé sur fond foncé du section-header */
  .oxtg-group-toggle--on-dark {
    background: color-mix(in srgb, white 18%, transparent);
    border-color: color-mix(in srgb, white 35%, transparent);
    color: var(--oxtg-header-fg);
  }
  .oxtg-group-toggle--on-dark:hover {
    background: color-mix(in srgb, white 28%, transparent);
  }
  .oxtg-group-toggle--on-dark .oxtg-toggle-track {
    background: color-mix(in srgb, white 30%, transparent);
  }
  .oxtg-group-toggle--on-dark .oxtg-toggle-thumb {
    background: var(--oxtg-header-fg);
  }

  /* ── Toolbar (heritée OxTable) ── */
  .oxtg-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .oxtg-filters {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--ox-surface-2, #EDE8F5);
    border-radius: var(--ox-shape-full, 999px);
    padding: 3px;
  }
  .oxtg-filter-btn {
    padding: 5px 14px;
    border: none;
    border-radius: var(--ox-shape-full);
    background: transparent;
    font: 500 13px system-ui;
    color: var(--ox-on-surface-variant);
    cursor: pointer;
    transition: background 120ms, color 120ms;
  }
  .oxtg-filter-btn:hover {
    background: color-mix(in srgb, var(--ox-on-surface) 8%, transparent);
    color: var(--ox-on-surface);
  }
  .oxtg-filter-btn.active {
    background: var(--ox-surface);
    color: var(--oxtg-category-color);
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0,0,0,.15);
  }
  .oxtg-search {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 220px;
    max-width: 320px;
    flex: 1;
    gap: 6px;
  }
  .oxtg-search :global(svg) {
    position: absolute;
    left: 10px;
    color: var(--ox-on-surface-variant);
    pointer-events: none;
  }
  .oxtg-search-input {
    width: 100%;
    padding: 7px 32px 7px 34px;
    border: 1px solid var(--ox-outline-variant);
    border-radius: var(--ox-shape-full);
    background: var(--ox-surface);
    color: var(--ox-on-surface);
    font: 400 14px system-ui;
    outline: none;
    appearance: none;
  }
  .oxtg-search-input::-webkit-search-cancel-button { display: none; }
  .oxtg-search-input:focus {
    border-color: var(--oxtg-category-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--oxtg-category-color) 15%, transparent);
  }
  .oxtg-search-clear {
    position: absolute;
    right: 10px;
    width: 18px; height: 18px;
    border: none; border-radius: 50%;
    background: var(--ox-surface-3, #E6DEFF);
    color: var(--ox-on-surface-variant);
    font-size: 10px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Table ── */
  .oxtg-wrap {
    width: 100%;
    overflow-x: auto;
    border: 1px solid var(--ox-outline-variant);
    border-radius: var(--ox-shape-md, 12px);
  }
  /* Quand le section-header coiffe le wrap : pas de border/radius haut
     pour fusionner visuellement les deux blocs. */
  .oxtg-wrap--joined-top {
    border-top: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .oxtg-sticky-wrap { max-height: 420px; overflow-y: auto; }

  .oxtg-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    color: var(--ox-on-surface);
    background: var(--oxtg-category-bg);
  }
  .oxtg-caption {
    font: 400 12px system-ui;
    color: var(--ox-on-surface-variant);
    text-align: left;
    padding: 8px 16px;
    caption-side: bottom;
    border-top: 1px solid var(--ox-outline-variant);
  }

  .oxtg-thead {
    background: color-mix(in srgb, var(--oxtg-header-bg) 30%, white 70%);
  }
  .oxtg-thead--sticky { position: sticky; top: 0; z-index: 2; }
  .oxtg-th {
    padding: 12px 16px;
    text-align: left;
    font: 600 12px system-ui;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--oxtg-header-bg);
    border-bottom: 2px solid var(--oxtg-header-bg);
    white-space: nowrap;
    user-select: none;
  }
  .oxtg-th--sorted { color: var(--oxtg-category-color); }
  .oxtg-th--action { width: 40px; }

  .oxtg-sort-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none; border: none; padding: 0;
    font: inherit; color: inherit;
    cursor: pointer;
    letter-spacing: inherit;
    text-transform: inherit;
    white-space: nowrap;
    transition: color 100ms;
  }
  .oxtg-sort-btn:hover { color: var(--ox-on-surface); }
  .oxtg-sort-icon { display: flex; align-items: center; flex-shrink: 0; }

  .oxtg-td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--ox-outline-variant);
    vertical-align: middle;
    line-height: 1.5;
  }
  .oxtg-td--action {
    padding: 4px 8px;
    text-align: center;
  }
  .oxtg--nowrap .oxtg-td { white-space: nowrap; }
  .oxtg-row:last-child .oxtg-td { border-bottom: none; }

  .oxtg--striped .oxtg-row:nth-child(even) {
    background: color-mix(in srgb, var(--oxtg-category-color) 4%, var(--oxtg-category-bg));
  }
  .oxtg-row { transition: background 100ms; }
  .oxtg-row:hover .oxtg-td {
    background: color-mix(in srgb, var(--ox-on-surface) 5%, var(--oxtg-category-bg));
  }
  .oxtg--clickable .oxtg-row { cursor: pointer; }

  .oxtg--compact .oxtg-td,
  .oxtg--compact .oxtg-th { padding: 7px 14px; }

  /* ── Group separator + letterpress ── */
  tr.oxtg-group-sep td {
    background: linear-gradient(to right, color-mix(in srgb, var(--oxtg-category-color) 14%, #d1d5db), transparent 80%);
    padding: 8px 14px !important;
    border-top: 1px solid var(--ox-outline-variant);
    border-bottom: 1px solid var(--ox-outline-variant);
  }
  .oxtg-group-sep-label {
    display: inline-flex;
    align-items: baseline;
    gap: var(--ox-spacing-3, 12px);
  }
  .oxtg-group-title {
    font-family: system-ui, 'Inter', 'Roboto', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--ox-on-surface);
    text-transform: capitalize;
  }
  .oxtg-group-title--letterpress {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: #4B5563;
    line-height: 1.1;
    user-select: none;
    text-shadow:
      0 1px 1px rgba(255, 255, 255, 0.85),
      0 -1px 1px rgba(0, 0, 0, 0.22);
  }
  .oxtg-group-count {
    font: var(--ox-label-sm, 500 11px/16px system-ui);
    color: var(--ox-on-surface-variant);
  }

  /* ── Empty ── */
  .oxtg-empty {
    padding: 48px 24px;
    text-align: center;
    color: var(--ox-on-surface-variant);
    font: 400 14px system-ui;
  }
  .oxtg-empty-icon { display: block; margin-bottom: 8px; opacity: 0.5; }

  /* ── Row add / delete ── */
  .oxtg-row-add {
    padding: 8px 12px;
    background: var(--ox-surface-2, #EDE8F5);
    border-top: 1px solid var(--ox-outline-variant);
  }
  .oxtg-btn-add {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px dashed var(--ox-outline-variant);
    border-radius: var(--ox-shape-full);
    background: transparent;
    color: var(--ox-on-surface-variant);
    font: 500 12px system-ui;
    cursor: pointer;
    transition: background 120ms, color 120ms;
  }
  .oxtg-btn-add:hover {
    background: var(--ox-surface);
    color: var(--oxtg-category-color);
  }
  .oxtg-btn-delete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px; height: 28px;
    border: none;
    border-radius: var(--ox-shape-sm, 8px);
    background: transparent;
    color: var(--ox-on-surface-variant);
    cursor: pointer;
    transition: background 120ms, color 120ms;
  }
  .oxtg-btn-delete:hover {
    background: color-mix(in srgb, var(--ox-error, #B3261E) 12%, transparent);
    color: var(--ox-error, #B3261E);
  }

  /* ── Footer (pagination) ── */
  .oxtg-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  .oxtg-info { font: 400 12px system-ui; color: var(--ox-on-surface-variant); }
  .oxtg-pagination { display: flex; align-items: center; gap: 3px; }
  .oxtg-page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    border: 1px solid var(--ox-outline-variant);
    border-radius: var(--ox-shape-sm);
    background: var(--ox-surface);
    color: var(--ox-on-surface);
    font: 400 13px system-ui;
    cursor: pointer;
    transition: background 100ms, border-color 100ms;
  }
  .oxtg-page-btn:hover:not(:disabled) {
    background: var(--ox-surface-2);
    border-color: var(--ox-outline);
  }
  .oxtg-page-btn--active {
    background: var(--oxtg-category-color);
    border-color: var(--oxtg-category-color);
    color: var(--ox-on-primary, #FFFFFF);
    font-weight: 600;
  }
  .oxtg-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
