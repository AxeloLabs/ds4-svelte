<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxTable — DS-4 Data Table                               │
   * │                                                         │
   * │ Props:                                                   │
   * │   columns      — column definitions                     │
   * │   rows         — data array                             │
   * │   searchable   — show global search bar                 │
   * │   filters      — toggle-group filter buttons            │
   * │   filterField  — which field filters apply to           │
   * │   selectable   — show row checkboxes                    │
   * │   pageSize     — rows per page (0 = no pagination)      │
   * │   striped      — alternate row colors                   │
   * │   compact      — dense row height                       │
   * │   stickyHeader — freeze header on scroll                │
   * │   caption      — accessible table caption               │
   * └─────────────────────────────────────────────────────────┘
   */
  import { SearchIcon, ChevronsUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@lucide/svelte'

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // TYPES
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  export interface OxTableColumn {
    key: string
    label: string
    sortable?: boolean
    align?: 'left' | 'center' | 'right'
    width?: string
    render?: (value: any, row: Record<string, any>) => string
  }

  export interface OxTableFilter {
    label: string
    value: string      // '' = All / show everything
  }

  interface Props {
    columns: OxTableColumn[]
    rows: Record<string, any>[]
    searchable?: boolean
    filters?: OxTableFilter[]
    filterField?: string
    selectable?: boolean
    pageSize?: number
    striped?: boolean
    compact?: boolean
    stickyHeader?: boolean
    /** Empêche le wrap des cellules (garde tout sur 1 ligne, scroll-x en fallback) */
    nowrap?: boolean
    caption?: string
    /** Colonne triée par défaut au mount (key de la column). */
    initialSortKey?: string
    /** Sens du tri par défaut. */
    initialSortDir?: 'asc' | 'desc'
    onRowClick?: (row: Record<string, any>) => void
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // STATE
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let {
    columns,
    rows,
    searchable = false,
    filters = [],
    filterField,
    selectable = false,
    pageSize = 0,
    striped = false,
    compact = false,
    stickyHeader = false,
    nowrap = false,
    caption,
    initialSortKey,
    initialSortDir = 'asc',
    onRowClick,
  }: Props = $props()

  let query        = $state('')
  let activeFilter = $state('')     // '' = All
  let sortKey      = $state<string | null>(initialSortKey ?? null)
  let sortDir      = $state<'asc' | 'desc'>(initialSortDir)
  let page         = $state(0)
  let selected     = $state<Set<number>>(new Set())

  // ── Pipeline: filter → search → sort → paginate ──
  const filtered = $derived.by(() => {
    let result = rows

    // 1. Toggle filter
    if (activeFilter && filterField) {
      result = result.filter(r => String(r[filterField]) === activeFilter)
    }

    // 2. Global search (all string fields)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      result = result.filter(r =>
        columns.some(col => String(r[col.key] ?? '').toLowerCase().includes(q))
      )
    }

    // 3. Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const va = a[sortKey!]
        const vb = b[sortKey!]
        const cmp = typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va ?? '').localeCompare(String(vb ?? ''), undefined, { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return result
  })

  const totalPages = $derived(pageSize > 0 ? Math.ceil(filtered.length / pageSize) : 1)

  const visible = $derived(
    pageSize > 0 ? filtered.slice(page * pageSize, (page + 1) * pageSize) : filtered
  )

  // Reset page on filter/search change
  $effect(() => { query; activeFilter; sortKey; sortDir; page = 0 })

  // ── INTERACTIONS ──────────────────────────────
  function toggleSort(key: string) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey = key
      sortDir = 'asc'
    }
  }

  function toggleRow(idx: number) {
    const s = new Set(selected)
    s.has(idx) ? s.delete(idx) : s.add(idx)
    selected = s
  }

  function toggleAll() {
    if (selected.size === visible.length) {
      selected = new Set()
    } else {
      selected = new Set(visible.map((_, i) => i))
    }
  }

  const allChecked = $derived(visible.length > 0 && selected.size === visible.length)
  const someChecked = $derived(selected.size > 0 && selected.size < visible.length)

  function ariaSortAttr(key: string): 'none' | 'ascending' | 'descending' | undefined {
    const col = columns.find(c => c.key === key)
    if (!col?.sortable) return undefined
    if (sortKey !== key) return 'none'
    return sortDir === 'asc' ? 'ascending' : 'descending'
  }
</script>

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TOOLBAR
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
{#if searchable || filters.length > 0}
  <div data-ui="ox-table" class="ox-table-toolbar">
    {#if filters.length > 0}
      <div class="ox-table-filters" role="group" aria-label="Filtres">
        <button
          class="ox-table-filter-btn"
          class:active={activeFilter === ''}
          onclick={() => activeFilter = ''}
        >
          Tous
        </button>
        {#each filters as f}
          <button
            class="ox-table-filter-btn"
            class:active={activeFilter === f.value}
            onclick={() => activeFilter = f.value}
          >
            {f.label}
          </button>
        {/each}
      </div>
    {/if}

    {#if searchable}
      <div class="ox-table-search">
        <SearchIcon class="ox-table-search-icon" size={16} strokeWidth={2} />
        <input
          class="ox-table-search-input"
          type="search"
          placeholder="Rechercher…"
          bind:value={query}
          aria-label="Rechercher dans le tableau"
        />
        {#if query}
          <button class="ox-table-search-clear" onclick={() => query = ''} aria-label="Effacer">
            ✕
          </button>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TABLE
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<div class="ox-table-wrap" class:ox-table-sticky-wrap={stickyHeader}>
  <table
    class="ox-table"
    class:ox-table--striped={striped}
    class:ox-table--compact={compact}
    class:ox-table--clickable={!!onRowClick}
    class:ox-table--nowrap={nowrap}
  >
    {#if caption}
      <caption class="ox-table-caption">{caption}</caption>
    {/if}

    <thead class="ox-table-head" class:ox-table-head--sticky={stickyHeader}>
      <tr>
        {#if selectable}
          <th class="ox-table-th ox-table-th-check" scope="col">
            <input
              type="checkbox"
              class="ox-table-checkbox"
              checked={allChecked}
              indeterminate={someChecked}
              onchange={toggleAll}
              aria-label="Sélectionner tout"
            />
          </th>
        {/if}
        {#each columns as col}
          <th
            class="ox-table-th"
            class:ox-table-th--sortable={col.sortable}
            class:ox-table-th--sorted={sortKey === col.key}
            style:width={col.width}
            style:text-align={col.align ?? 'left'}
            scope="col"
            aria-sort={ariaSortAttr(col.key)}
          >
            {#if col.sortable}
              <button
                class="ox-table-sort-btn"
                onclick={() => toggleSort(col.key)}
                aria-label="Trier par {col.label}"
              >
                <span>{col.label}</span>
                <span class="ox-table-sort-icon" aria-hidden="true">
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
      </tr>
    </thead>

    <tbody class="ox-table-body">
      {#if visible.length === 0}
        <tr>
          <td
            class="ox-table-empty"
            colspan={columns.length + (selectable ? 1 : 0)}
          >
            <span class="ox-table-empty-icon"><SearchIcon size={32} strokeWidth={1.5} /></span>
            Aucun résultat
            {#if query} pour « <strong>{query}</strong> »{/if}
          </td>
        </tr>
      {:else}
        {#each visible as row, i}
          <tr
            class="ox-table-row"
            class:ox-table-row--selected={selected.has(i)}
            onclick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {#if selectable}
              <td class="ox-table-td ox-table-td-check" onclick={(e) => { e.stopPropagation(); toggleRow(i) }}>
                <input
                  type="checkbox"
                  class="ox-table-checkbox"
                  checked={selected.has(i)}
                  onchange={() => toggleRow(i)}
                  aria-label="Sélectionner la ligne"
                />
              </td>
            {/if}
            {#each columns as col}
              <td
                class="ox-table-td"
                style:text-align={col.align ?? 'left'}
              >
                {#if col.render}
                  {@html col.render(row[col.key], row)}
                {:else}
                  {row[col.key] ?? '—'}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     FOOTER (info + pagination)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
{#if pageSize > 0 || selectable}
  <div class="ox-table-footer">
    <span class="ox-table-info">
      {#if selectable && selected.size > 0}
        {selected.size} sélectionnée{selected.size > 1 ? 's' : ''}
      {:else}
        {filtered.length} ligne{filtered.length > 1 ? 's' : ''}
        {#if query || activeFilter} (filtrées){/if}
      {/if}
    </span>

    {#if pageSize > 0 && totalPages > 1}
      <div class="ox-table-pagination" role="navigation" aria-label="Pagination">
        <button
          class="ox-table-page-btn"
          onclick={() => page = Math.max(0, page - 1)}
          disabled={page === 0}
          aria-label="Page précédente"
        >
          ‹
        </button>
        {#each Array.from({ length: totalPages }, (_, i) => i) as p}
          <button
            class="ox-table-page-btn"
            class:ox-table-page-btn--active={p === page}
            onclick={() => page = p}
            aria-label="Page {p + 1}"
            aria-current={p === page ? 'page' : undefined}
          >
            {p + 1}
          </button>
        {/each}
        <button
          class="ox-table-page-btn"
          onclick={() => page = Math.min(totalPages - 1, page + 1)}
          disabled={page === totalPages - 1}
          aria-label="Page suivante"
        >
          ›
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TOOLBAR
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    font-family: system-ui, sans-serif;
  }

  /* Filter toggle group */
  .ox-table-filters {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--ox-surface-2, #EDE8F5);
    border-radius: var(--ox-shape-full, 999px);
    padding: 3px;
  }

  .ox-table-filter-btn {
    padding: 5px 14px;
    border: none;
    border-radius: var(--ox-shape-full, 999px);
    background: transparent;
    font: 500 13px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    transition: background 120ms, color 120ms;
    white-space: nowrap;
  }
  .ox-table-filter-btn:hover {
    background: color-mix(in srgb, var(--ox-on-surface) 8%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-table-filter-btn.active {
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-primary, #6750A4);
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0,0,0,.15);
  }

  /* Search bar */
  .ox-table-search {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 200px;
    max-width: 300px;
    flex: 1;
  }

  .ox-table-search-icon {
    position: absolute;
    left: 10px;
    color: var(--ox-on-surface-variant, #49454F);
    pointer-events: none;
    flex-shrink: 0;
  }

  .ox-table-search-input {
    width: 100%;
    padding: 7px 32px 7px 34px;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-full, 999px);
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-on-surface, #1C1B1F);
    font: 400 14px system-ui;
    outline: none;
    transition: border-color 150ms, box-shadow 150ms;
    /* hide native clear button */
    appearance: none;
  }
  .ox-table-search-input::-webkit-search-cancel-button { display: none; }
  .ox-table-search-input:focus {
    border-color: var(--ox-primary, #6750A4);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ox-primary) 15%, transparent);
  }
  .ox-table-search-input::placeholder {
    color: var(--ox-on-surface-variant, #49454F);
    opacity: 0.7;
  }

  .ox-table-search-clear {
    position: absolute;
    right: 10px;
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
  .ox-table-search-clear:hover {
    background: var(--ox-outline-variant);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TABLE WRAP
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-table-wrap {
    width: 100%;
    overflow-x: auto;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-md, 12px);
  }

  .ox-table-sticky-wrap {
    max-height: 420px;
    overflow-y: auto;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TABLE BASE
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-table {
    width: 100%;
    border-collapse: collapse;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    color: var(--ox-on-surface, #1C1B1F);
    background: var(--ox-surface, #FFFBFE);
  }

  .ox-table-caption {
    font: 400 12px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    text-align: left;
    padding: 8px 16px;
    caption-side: bottom;
    border-top: 1px solid var(--ox-outline-variant, #CAC4D0);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     HEADER
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-table-head {
    background: var(--ox-surface-1, #F4EEFF);
  }

  .ox-table-head--sticky {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .ox-table-th {
    padding: 12px 16px;
    text-align: left;
    font: 600 12px system-ui;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--ox-on-surface-variant, #49454F);
    border-bottom: 2px solid var(--ox-outline-variant, #CAC4D0);
    white-space: nowrap;
    user-select: none;
  }

  .ox-table-th-check {
    width: 48px;
    padding: 12px 12px 12px 16px;
  }

  .ox-table-th--sorted {
    color: var(--ox-primary, #6750A4);
  }

  /* Sort button inside th */
  .ox-table-sort-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    letter-spacing: inherit;
    text-transform: inherit;
    white-space: nowrap;
    transition: color 100ms;
  }
  .ox-table-sort-btn:hover {
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-table-sort-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ROWS & CELLS
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-table-td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    vertical-align: middle;
    line-height: 1.5;
  }

  /* Opt-in : cellules sur 1 ligne, scroll horizontal via .ox-table-wrap si overflow */
  .ox-table--nowrap .ox-table-td { white-space: nowrap; }

  .ox-table-td-check {
    padding: 12px 12px 12px 16px;
  }

  .ox-table-row:last-child .ox-table-td {
    border-bottom: none;
  }

  /* Striped */
  .ox-table--striped .ox-table-row:nth-child(even) {
    background: color-mix(in srgb, var(--ox-primary) 4%, var(--ox-surface));
  }

  /* Hover */
  .ox-table-row {
    transition: background 100ms;
  }
  .ox-table-row:hover .ox-table-td {
    background: color-mix(in srgb, var(--ox-on-surface) 5%, var(--ox-surface));
  }

  /* Clickable rows */
  .ox-table--clickable .ox-table-row {
    cursor: pointer;
  }

  /* Selected row */
  .ox-table-row--selected .ox-table-td {
    background: var(--ox-primary-container, #EADDFF);
    color: var(--ox-on-primary-container, #21005D);
  }
  .ox-table-row--selected:hover .ox-table-td {
    background: color-mix(in srgb, var(--ox-primary) 20%, var(--ox-primary-container));
  }

  /* Compact */
  .ox-table--compact .ox-table-td,
  .ox-table--compact .ox-table-th {
    padding: 7px 14px;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     EMPTY STATE
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-table-empty {
    padding: 48px 24px;
    text-align: center;
    color: var(--ox-on-surface-variant, #49454F);
    font: 400 14px system-ui;
  }
  .ox-table-empty-icon {
    display: block;
    font-size: 28px;
    margin-bottom: 8px;
    opacity: 0.5;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     CHECKBOX
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-table-checkbox {
    width: 20px;
    height: 20px;
    accent-color: var(--ox-primary, #6750A4);
    cursor: pointer;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     FOOTER
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-table-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 12px;
    font-family: system-ui, sans-serif;
  }

  .ox-table-info {
    font: 400 12px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }

  /* Pagination */
  .ox-table-pagination {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .ox-table-page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-sm, 8px);
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-on-surface, #1C1B1F);
    font: 400 13px system-ui;
    cursor: pointer;
    transition: background 100ms, border-color 100ms, color 100ms;
  }
  .ox-table-page-btn:hover:not(:disabled) {
    background: var(--ox-surface-2, #EDE8F5);
    border-color: var(--ox-outline);
  }
  .ox-table-page-btn--active {
    background: var(--ox-primary, #6750A4);
    border-color: var(--ox-primary, #6750A4);
    color: var(--ox-on-primary, #FFFFFF);
    font-weight: 600;
  }
  .ox-table-page-btn--active:hover {
    background: color-mix(in srgb, var(--ox-primary) 90%, black);
  }
  .ox-table-page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
</style>
