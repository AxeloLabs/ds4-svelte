<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxCrmCalendar — Generic CRM interaction calendar
   * │ Sidebar (items grouped by section) + scrollable date grid
   * │ JSON-driven: each item has a list of interactions per day
   * │ initiator: 'self' | 'contact'
   * └─────────────────────────────────────────────────────────┘
   */

  import OxCrmCalendarItem from './OxCrmCalendarItem.svelte'
  import OxCrmCalendarBadge from './OxCrmCalendarBadge.svelte'

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // TYPES
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  export interface CrmInteraction {
    date: string         // 'YYYY-MM-DD'
    description: string
    initiator: 'self' | 'contact'
  }

  export interface CrmCalendarItemData {
    id: string
    title: string
    imageUrl?: string | null
    description?: string | null
    link?: string | null
    section?: string     // optional grouping key shown as collapsible section in sidebar
    interactions: CrmInteraction[]
  }

  interface Props {
    items: CrmCalendarItemData[]
    daysBefore?: number     // days shown before today, default 60
    daysAfter?: number      // days shown after today, default 30
    sidebarLabel?: string   // header of the left column, default 'Contacts'
  }

  let {
    items = [],
    daysBefore = 60,
    daysAfter = 30,
    sidebarLabel = 'Contacts',
  }: Props = $props()

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // DATE HELPERS
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  const DAY_LETTERS = ['D', 'L', 'Ma', 'Me', 'J', 'V', 'S']

  function toDateStr(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function parseDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  function isToday(iso: string): boolean { return iso === toDateStr(new Date()) }
  function isMonday(iso: string): boolean { return parseDate(iso).getDay() === 1 }

  function getWeekNumber(iso: string): number {
    const d = parseDate(iso)
    const jan1 = new Date(d.getFullYear(), 0, 1)
    return Math.ceil((d.getTime() - jan1.getTime()) / 86400000 / 7) + 1
  }

  function formatDayLetter(iso: string): string { return DAY_LETTERS[parseDate(iso).getDay()] }
  function formatDayNumber(iso: string): string  { return String(parseDate(iso).getDate()) }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // DATE RANGE
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let dateRange = $derived.by(() => {
    const result: string[] = []
    const now = new Date()
    for (let i = -daysBefore; i <= daysAfter; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() + i)
      result.push(toDateStr(d))
    }
    return result
  })

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // SECTIONS — group items by item.section
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  interface Section { label: string; items: CrmCalendarItemData[] }

  let sections = $derived.by((): Section[] => {
    const map = new Map<string, CrmCalendarItemData[]>()
    for (const item of items) {
      const key = item.section ?? ''
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    }
    return Array.from(map.entries()).map(([label, its]) => ({
      label: label || sidebarLabel,
      items: its,
    }))
  })

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // GRID — itemId → dateStr → interactions[]
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let gridData = $derived.by(() => {
    const dateSet = new Set(dateRange)
    const grid = new Map<string, Map<string, CrmInteraction[]>>()
    for (const item of items) {
      const rowMap = new Map<string, CrmInteraction[]>()
      for (const ia of item.interactions) {
        if (!dateSet.has(ia.date)) continue
        const arr = rowMap.get(ia.date) ?? []
        arr.push(ia)
        rowMap.set(ia.date, arr)
      }
      grid.set(item.id, rowMap)
    }
    return grid
  })

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // COLLAPSE
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let collapsedSections = $state(new Set<string>())

  function toggleSection(label: string) {
    const next = new Set(collapsedSections)
    if (next.has(label)) next.delete(label)
    else next.add(label)
    collapsedSections = next
  }

  let allCollapsed = $derived(
    sections.length > 0 && sections.every(s => collapsedSections.has(s.label))
  )

  function toggleAll() {
    collapsedSections = allCollapsed
      ? new Set()
      : new Set(sections.map(s => s.label))
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // SCROLL SYNC
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let leftEl  = $state<HTMLElement | null>(null)
  let rightEl = $state<HTMLElement | null>(null)
  let syncing = false
  let didInitScroll = $state(false)

  function syncScroll(source: 'left' | 'right') {
    if (syncing) return
    syncing = true
    if (source === 'right' && leftEl && rightEl) leftEl.scrollTop = rightEl.scrollTop
    else if (source === 'left' && leftEl && rightEl) rightEl.scrollTop = leftEl.scrollTop
    syncing = false
  }

  function scrollToToday() {
    if (!rightEl) return
    const todayEl = rightEl.querySelector('[data-today="true"]')
    if (todayEl) {
      const rect = todayEl.getBoundingClientRect()
      const wr   = rightEl.getBoundingClientRect()
      rightEl.scrollTo({ left: Math.max(0, rect.left - wr.left + rightEl.scrollLeft - 80), behavior: 'smooth' })
    }
  }

  $effect(() => {
    if (items.length > 0 && rightEl && !didInitScroll) {
      didInitScroll = true
      requestAnimationFrame(() => {
        const todayEl = rightEl!.querySelector('[data-today="true"]')
        if (todayEl) {
          const rect = todayEl.getBoundingClientRect()
          const wr   = rightEl!.getBoundingClientRect()
          rightEl!.scrollLeft = Math.max(0, rect.left - wr.left + rightEl!.scrollLeft - 80)
        }
      })
    }
  })

  // ▓▓▓▓ STATS ▓▓▓▓
  let totalInteractions = $derived(items.reduce((s, i) => s + i.interactions.length, 0))
</script>

<!-- ── TOOLBAR ── -->
<div data-ui="ox-crm-calendar" class="ox-ccal-toolbar">
  <div class="ox-ccal-toolbar-actions">
    <button class="ox-ccal-toolbar-btn" onclick={toggleAll}>
      {allCollapsed ? '▶ Tout ouvrir' : '▼ Tout fermer'}
    </button>
    <button class="ox-ccal-toolbar-btn" onclick={scrollToToday}>
      📍 Aujourd'hui
    </button>
  </div>
  <div class="ox-ccal-toolbar-stats">
    {items.length} contacts · {totalInteractions} interactions
  </div>
</div>

<!-- ── GRID ── -->
<div class="ox-ccal-outer">

  <!-- LEFT: fixed sidebar -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="ox-ccal-left" bind:this={leftEl} onscroll={() => syncScroll('left')}>
    <div class="ox-ccal-left-header">{sidebarLabel}</div>

    {#each sections as section}
      <button class="ox-ccal-section" onclick={() => toggleSection(section.label)}>
        <span class="ox-ccal-section-icon">{collapsedSections.has(section.label) ? '▶' : '▼'}</span>
        <span class="ox-ccal-section-label">{section.label}</span>
        <span class="ox-ccal-section-count">{section.items.length}</span>
      </button>
      {#if !collapsedSections.has(section.label)}
        {#each section.items as item (item.id)}
          <div class="ox-ccal-row-left">
            <OxCrmCalendarItem
              id={item.id}
              title={item.title}
              imageUrl={item.imageUrl}
              description={item.description}
              link={item.link}
            />
          </div>
        {/each}
      {/if}
    {/each}

    {#if sections.length === 0}
      <div class="ox-ccal-empty-left"></div>
    {/if}
  </div>

  <!-- RIGHT: scrollable date grid -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="ox-ccal-right" bind:this={rightEl} onscroll={() => syncScroll('right')}>

    <!-- Date header -->
    <div class="ox-ccal-date-header">
      <div class="ox-ccal-date-row">
        {#each dateRange as dateStr}
          <div
            class="ox-ccal-date-cell"
            class:ox-ccal-date-today={isToday(dateStr)}
            data-today={isToday(dateStr) || undefined}
          >
            {#if isMonday(dateStr)}<span class="ox-ccal-week">S{getWeekNumber(dateStr)}</span>{/if}
          </div>
        {/each}
      </div>
      <div class="ox-ccal-date-row">
        {#each dateRange as dateStr}
          <div class="ox-ccal-date-cell" class:ox-ccal-date-today={isToday(dateStr)}>
            <span class="ox-ccal-day-letter">{formatDayLetter(dateStr)}</span>
          </div>
        {/each}
      </div>
      <div class="ox-ccal-date-row">
        {#each dateRange as dateStr}
          <div class="ox-ccal-date-cell" class:ox-ccal-date-today={isToday(dateStr)}>
            <span class="ox-ccal-day-number">{formatDayNumber(dateStr)}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Rows (right side) -->
    {#each sections as section}
      <div
        class="ox-ccal-section-spacer"
        class:ox-ccal-section-collapsed={collapsedSections.has(section.label)}
      ></div>
      {#if !collapsedSections.has(section.label)}
        {#each section.items as item (item.id)}
          <div class="ox-ccal-row-right">
            {#each dateRange as dateStr}
              {@const dayInteractions = gridData.get(item.id)?.get(dateStr)}
              <div class="ox-ccal-cell" class:ox-ccal-cell-today={isToday(dateStr)}>
                {#if dayInteractions && dayInteractions.length > 0}
                  <OxCrmCalendarBadge interactions={dayInteractions} {dateStr} />
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      {/if}
    {/each}

    {#if sections.length === 0}
      <div class="ox-ccal-empty">
        <div class="ox-ccal-empty-icon">📅</div>
        <p>Aucun contact</p>
      </div>
    {/if}
  </div>
</div>

<style>
  /* ── TOOLBAR ── */
  .ox-ccal-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--ox-surface, #fff);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-md, 12px);
    margin-bottom: 10px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .ox-ccal-toolbar-actions { display: flex; gap: 6px; }
  .ox-ccal-toolbar-btn {
    padding: 5px 12px;
    font: 600 12px system-ui;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-sm, 8px);
    background: var(--ox-surface-2, #f1f5f9);
    color: var(--ox-on-surface, #1C1B1F);
    cursor: pointer;
    transition: background 120ms, color 120ms;
  }
  .ox-ccal-toolbar-btn:hover {
    background: var(--ox-primary-container, #EADDFF);
    color: var(--ox-on-primary-container, #21005D);
  }
  .ox-ccal-toolbar-stats {
    font: 500 12px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }

  /* ── OUTER CONTAINER ── */
  .ox-ccal-outer {
    display: flex;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-md, 12px);
    background: var(--ox-surface, #fff);
    max-height: calc(100vh - 240px);
    overflow: hidden;
  }

  /* ── LEFT COLUMN (fixed) ── */
  .ox-ccal-left {
    width: 200px;
    min-width: 200px;
    border-right: 2px solid var(--ox-outline-variant, #CAC4D0);
    overflow-y: auto;
    background: var(--ox-surface, #fff);
    z-index: 10;
    flex-shrink: 0;
    scrollbar-width: thin;
  }
  .ox-ccal-left-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font: 700 11px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 2px solid var(--ox-outline-variant, #CAC4D0);
    position: sticky;
    top: 0;
    background: var(--ox-surface, #fff);
    z-index: 2;
  }

  /* ── RIGHT (scrollable) ── */
  .ox-ccal-right {
    flex: 1;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  /* ── DATE HEADER (sticky) ── */
  .ox-ccal-date-header {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--ox-surface, #fff);
    border-bottom: 2px solid var(--ox-outline-variant, #CAC4D0);
  }
  .ox-ccal-date-row { display: flex; }
  .ox-ccal-date-cell {
    width: 40px;
    min-width: 40px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid color-mix(in srgb, var(--ox-outline-variant, #CAC4D0) 40%, transparent);
    font-size: 10px;
    color: var(--ox-on-surface-variant, #49454F);
  }
  .ox-ccal-date-today {
    background: color-mix(in srgb, var(--ox-primary, #6750A4) 10%, transparent);
  }
  .ox-ccal-week       { font: 700 9px system-ui; color: var(--ox-on-surface, #1C1B1F); }
  .ox-ccal-day-letter { font: 600 10px system-ui; }
  .ox-ccal-day-number { font: 700 11px system-ui; color: var(--ox-on-surface, #1C1B1F); }

  /* ── SECTION HEADER ── */
  .ox-ccal-section {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 6px 10px;
    background: var(--ox-surface-2, #f8fafc);
    border: none;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    cursor: pointer;
    font: 700 11px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    text-align: left;
    transition: background 100ms;
    text-transform: capitalize;
  }
  .ox-ccal-section:hover { background: var(--ox-surface-3, #f1f5f9); }
  .ox-ccal-section-icon  { font-size: 9px; color: var(--ox-on-surface-variant, #49454F); width: 12px; flex-shrink: 0; }
  .ox-ccal-section-label { flex: 1; }
  .ox-ccal-section-count {
    font-size: 10px;
    color: var(--ox-on-surface-variant, #49454F);
    background: var(--ox-outline-variant, #CAC4D0);
    padding: 1px 6px;
    border-radius: 10px;
    font-weight: 600;
  }

  /* Section spacer in right panel (matches left section header height) */
  .ox-ccal-section-spacer {
    height: 31px;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    background: var(--ox-surface-2, #f8fafc);
  }

  /* ── ROWS ── */
  .ox-ccal-row-left {
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    min-height: 44px;
    display: flex;
  }
  .ox-ccal-row-right {
    display: flex;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    min-height: 44px;
  }
  .ox-ccal-cell {
    width: 40px;
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid color-mix(in srgb, var(--ox-outline-variant, #CAC4D0) 40%, transparent);
  }
  .ox-ccal-cell-today {
    background: color-mix(in srgb, var(--ox-primary, #6750A4) 6%, transparent);
  }

  /* ── EMPTY ── */
  .ox-ccal-empty {
    text-align: center;
    padding: 48px 16px;
    color: var(--ox-on-surface-variant, #49454F);
  }
  .ox-ccal-empty-icon { font-size: 32px; margin-bottom: 8px; opacity: 0.4; }
  .ox-ccal-empty p    { font: 500 13px system-ui; }
  .ox-ccal-empty-left { height: 120px; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .ox-ccal-left { width: 140px; min-width: 140px; }
    .ox-ccal-date-cell { width: 34px; min-width: 34px; }
    .ox-ccal-cell      { width: 34px; min-width: 34px; }
  }
  @media (max-width: 480px) {
    .ox-ccal-left { width: 100px; min-width: 100px; }
    .ox-ccal-date-cell { width: 30px; min-width: 30px; }
    .ox-ccal-cell      { width: 30px; min-width: 30px; }
  }
</style>
