<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxToasterTimer — Toast stack with embedded auto-timer   │
   * │ Single timer per toast (count-up or countdown).         │
   * │ Optional `scale` prop for runtime size adjustment.      │
   * └─────────────────────────────────────────────────────────┘
   */
  import { X, Loader2Icon } from '@lucide/svelte'

  interface ToastItem {
    id: string
    title: string
    description?: string
    tag?: string
    type: 'default' | 'noir' | 'bleu' | 'cyan' | 'jaune' | 'rouge' | 'vert' | 'orange' | 'loading' | 'reggae'
    removing?: boolean
    startedAt: number
    elapsed: string
    countdown: boolean
    toastDuration: number
  }

  interface Props {
    placement?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'
    duration?: number
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    maxVisible?: number
    scale?: number
  }

  let { placement = 'bottom-end', duration = 20_000, size = 'xs', maxVisible = 5, scale = 1 }: Props = $props()
  // Plancher minimal pour TOUTE durée — sauf 0 (= persistent / countdown manuel).
  // Évite les toasts < 10s difficiles à lire avant disparition.
  const MIN_DURATION_MS = 10_000
  let toasts = $state<ToastItem[]>([])
  let counter = 0
  let hovered = $state(false)
  let tickInterval: ReturnType<typeof setInterval> | null = null
  let frozenAt: number | null = null

  function formatMs(ms: number): string {
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    if (min > 0) return `${min}m ${String(sec).padStart(2, '0')}s`
    return `${sec}s`
  }

  function startTick() {
    if (tickInterval) return
    tickInterval = setInterval(() => {
      const now = frozenAt ?? Date.now()
      let changed = false
      for (const t of toasts) {
        if (!t.removing) {
          const elapsedMs = now - t.startedAt
          const displayMs = t.countdown ? Math.max(0, t.toastDuration - elapsedMs) : elapsedMs
          const newElapsed = formatMs(displayMs)
          if (t.elapsed !== newElapsed) { t.elapsed = newElapsed; changed = true }
        }
      }
      if (changed) toasts = [...toasts]
      if (toasts.every(t => t.removing)) stopTick()
    }, 200)
  }

  function stopTick() {
    if (tickInterval) { clearInterval(tickInterval); tickInterval = null }
  }

  export function create(opts: {
    title: string
    description?: string
    tag?: string
    type?: string
    duration?: number
    persistent?: boolean   // countdown badge actif mais pas d'auto-dismiss
  }): string {
    const id = `t-${++counter}`
    const isLoading = (opts.type ?? 'default') === 'loading'
    const requestedDuration = opts.duration ?? duration
    // Clamp : 0 reste 0 (persistent), sinon plancher MIN_DURATION_MS (10s)
    const effectiveDuration = requestedDuration === 0 ? 0 : Math.max(MIN_DURATION_MS, requestedDuration)
    const hasCountdown = effectiveDuration > 0 && !isLoading
    const now = Date.now()
    toasts = [...toasts, {
      id, title: opts.title, description: opts.description, tag: opts.tag,
      type: (opts.type as any) ?? 'default',
      startedAt: now,
      elapsed: hasCountdown ? formatMs(effectiveDuration) : '0s',
      countdown: hasCountdown,
      toastDuration: effectiveDuration,
    }]
    startTick()
    if (hasCountdown && !opts.persistent) setTimeout(() => dismiss(id), effectiveDuration)
    return id
  }

  export function dismiss(id: string) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx === -1) return
    toasts[idx].removing = true
    toasts = [...toasts]
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id)
      if (toasts.length === 0) stopTick()
    }, 350)
  }

  export function update(id: string, opts: { title?: string; description?: string; type?: string }) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx === -1) return
    const t = toasts[idx]
    const wasLoading = t.type === 'loading'
    if (opts.title !== undefined) t.title = opts.title
    if (opts.description !== undefined) t.description = opts.description
    if (opts.type !== undefined) t.type = opts.type as ToastItem['type']
    // ── Transition loading → final type : restart timer in countdown mode + auto-dismiss
    // Sans cela, le toast reste en count-up sans auto-dismiss et s'accumule à l'écran.
    if (wasLoading && opts.type !== undefined && opts.type !== 'loading' && t.toastDuration > 0) {
      t.startedAt = Date.now()
      t.countdown = true
      t.elapsed = formatMs(t.toastDuration)
      setTimeout(() => dismiss(id), t.toastDuration)
    }
    toasts = [...toasts]
  }

  export function dismissAll() {
    toasts.map(t => t.id).forEach(id => dismiss(id))
  }

  export function pauseTimers() {
    frozenAt = Date.now()
  }

  export function resumeTimers() {
    if (!frozenAt) return
    const pausedMs = Date.now() - frozenAt
    for (const t of toasts) {
      if (!t.removing) {
        t.startedAt += pausedMs
      }
    }
    frozenAt = null
    toasts = [...toasts]
  }

  /** Met à jour la description d'un toast existant (utilisé pour les progrès de loop). */
  export function resetContactTimer(id: string, opts?: { description?: string }) {
    if (opts?.description !== undefined) update(id, { description: opts.description })
  }

  $effect(() => { return () => stopTick() })

  const isBottom = $derived(placement.startsWith('bottom'))
  const isEnd = $derived(placement.endsWith('end'))
  const activeToasts = $derived(toasts.filter(t => !t.removing))
  const activeCount = $derived(activeToasts.length)
  // Toasts beyond maxVisible are "overflow" — collapsed under the column
  const overflowCount = $derived(Math.max(0, activeCount - maxVisible))
  // transform-origin matches placement corner so scale doesn't drift the toaster off-screen
  const wrapTransform = $derived(scale === 1 ? 'none' : `scale(${scale})`)
  const wrapOrigin = $derived(`${isEnd ? '100%' : '0%'} ${isBottom ? '100%' : '0%'}`)
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="ots-wrap"
  class:ots-bottom={isBottom}
  class:ots-top={!isBottom}
  class:ots-end={isEnd}
  class:ots-start={!isEnd}
  class:ots-sm={size === 'sm'}
  class:ots-md={size === 'md'}
  class:ots-lg={size === 'lg'}
  class:ots-xl={size === 'xl'}
  class:ots-active={toasts.length > 0}
  class:ots-has-overflow={overflowCount > 0}
  class:ots-hover-expand={hovered && overflowCount > 0}
  data-ui="ox-toaster-timer"
  style="transform: {wrapTransform}; transform-origin: {wrapOrigin};"
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
>
  {#each toasts as toast, i (toast.id)}
    {@const rankFromNewest = toasts.length - 1 - i}
    {@const isOverflow = !toast.removing && rankFromNewest >= maxVisible}
    {@const overflowDepth = isOverflow ? rankFromNewest - maxVisible + 1 : 0}
    {@const sc = isOverflow && !hovered ? Math.max(0.88, 1 - overflowDepth * 0.04) : 1}
    {@const op = isOverflow && !hovered ? Math.max(0.25, 0.5 - overflowDepth * 0.1) : 1}
    {@const isNewest = rankFromNewest === 0 && !toast.removing}
    <div
      class="ots-item"
      class:ots-noir={toast.type === 'noir' || toast.type === 'default'}
      class:ots-bleu={toast.type === 'bleu'}
      class:ots-cyan={toast.type === 'cyan'}
      class:ots-jaune={toast.type === 'jaune'}
      class:ots-rouge={toast.type === 'rouge'}
      class:ots-vert={toast.type === 'vert'}
      class:ots-orange={toast.type === 'orange'}
      class:ots-loading={toast.type === 'loading'}
      class:ots-reggae={toast.type === 'reggae'}
      class:ots-removing={toast.removing}
      class:ots-enter={isNewest}
      class:ots-newest={isNewest && activeCount > 1}
      class:ots-overflow={isOverflow}
      data-ui="toast-item"
      style="
        z-index: {200 + i};
        transform: scale({sc});
        opacity: {op};
      "
    >
      <div class="ots-body">
        <p class="ots-title">{toast.title}</p>
        {#if toast.description}
          <p class="ots-desc">{toast.description}</p>
        {/if}
        {#if toast.tag}
          <p class="ots-tag">{toast.tag}</p>
        {/if}
      </div>
      <div class="ots-timer-badge" data-ui="toast-timer">{toast.elapsed}</div>
      <div class="ots-actions">
        {#if toast.type === 'loading'}
          <span class="ots-spinner-wrap">
            <Loader2Icon size={18} strokeWidth={2.5} />
          </span>
        {/if}
        <button class="ots-close" onclick={() => dismiss(toast.id)} aria-label="Fermer">
          <X size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  {/each}

  {#if overflowCount > 0 && !hovered}
    <div class="ots-badge">+{overflowCount}</div>
  {/if}
</div>

<style>
  .ots-wrap {
    position: fixed;
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
    transition: transform 200ms ease;
  }
  .ots-active {
    pointer-events: auto;
    padding: 20px;
    margin: -20px;
  }
  .ots-bottom { bottom: 100px; }
  .ots-top { top: 16px; }
  .ots-end { right: 16px; }
  .ots-start { left: 16px; align-items: flex-start; }

  .ots-wrap {
    --ots-stack-margin: -56px;
  }
  .ots-lg { --ots-stack-margin: -72px; }
  .ots-xl { --ots-stack-margin: -90px; }

  .ots-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
    font-family: system-ui, sans-serif;
    min-width: 360px;
    max-width: 500px;
    pointer-events: auto;
    cursor: default;
    transform-origin: center bottom;
    transition:
      transform 400ms cubic-bezier(0.21, 1.02, 0.73, 1),
      opacity 300ms ease,
      margin-top 400ms cubic-bezier(0.21, 1.02, 0.73, 1);
    position: relative;
    margin-top: 8px;
  }
  .ots-item:first-child { margin-top: 0; }

  /* Overflow toasts — collapsed under the visible column */
  .ots-overflow {
    margin-top: var(--ots-stack-margin) !important;
    pointer-events: none;
  }
  /* On hover — expand overflow into full column */
  .ots-hover-expand .ots-overflow {
    margin-top: 8px !important;
    opacity: 1 !important;
    transform: scale(1) !important;
    pointer-events: auto;
  }
  .ots-hover-expand .ots-overflow:first-child { margin-top: 0 !important; }

  .ots-enter { animation: ots-enter 350ms cubic-bezier(0.21, 1.02, 0.73, 1); }

  @keyframes ots-enter {
    0% { opacity: 0; transform: scale(0.9) translateY(30px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* ── Newest toast — bounce horizontal en boucle pour le distinguer dans la pile ── */
  /* Utilise la propriété `translate` (séparée de `transform`) afin de cohabiter avec
     l'animation d'entrée (`ots-enter`) et la classe de sortie (`ots-removing`) qui
     manipulent `transform`. Démarre après les 350ms de l'animation d'entrée. */
  .ots-newest {
    animation: ots-bounce-x 1.6s ease-in-out 350ms infinite;
  }
  @keyframes ots-bounce-x {
    0%, 100% { translate: 0 0; }
    50%      { translate: -8px 0; }
  }

  .ots-removing {
    opacity: 0 !important;
    transform: translateX(100%) scale(1) !important;
    transition: all 250ms ease-in !important;
    pointer-events: none !important;
    animation: none !important;
  }

  /* ── Colors ── */
  .ots-noir    { background: var(--ox-inverse-surface, #1a1a1a); color: var(--ox-inverse-on-surface, #F4EFF4); }
  .ots-bleu    { background: #1565c0; color: #ffffff; }
  .ots-cyan    { background: #06b6d4; color: #ffffff; }
  .ots-jaune   { background: #facc15; color: #1a1a1a; }
  .ots-rouge   { background: var(--ox-error, #dc2626); color: var(--ox-on-error, #fef2f2); }
  .ots-vert    { background: #16a34a; color: #f0fdf4; }
  .ots-orange  { background: #ea580c; color: #fff7ed; }
  .ots-loading { background: #1565c0; color: #ffffff; }
  .ots-reggae  { background: linear-gradient(90deg, #b11226 33.33%, #f7d117 33.33% 66.66%, #009b3a 66.66%); color: #fff; order: 9999; }

  /* ── Layout ── */
  .ots-body { flex: 1; min-width: 0; user-select: text; -webkit-user-select: text; cursor: text; }
  .ots-title { font: 600 15px/1.3 system-ui; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ots-desc { font: 400 13px/1.4 system-ui; margin: 3px 0 0; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* ── Timer badge ── */
  .ots-timer-badge {
    font: 700 12px/1 'SF Mono', 'Fira Code', ui-monospace, monospace;
    background: rgba(255,255,255,0.12);
    color: inherit;
    padding: 4px 8px;
    border-radius: 6px;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 3ch;
    text-align: center;
    letter-spacing: -0.3px;
    opacity: 0.85;
  }

  .ots-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .ots-close {
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; color: inherit; cursor: pointer;
    opacity: 0.4; padding: 4px; border-radius: 999px;
    transition: opacity 150ms, background 150ms;
  }
  .ots-close:hover { opacity: 1; background: rgba(255,255,255,0.15); }

  /* ── Badge (count) ── */
  .ots-badge {
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 6px;
    background: #6366f1;
    color: white;
    font: 700 11px/1 system-ui;
    padding: 3px 7px;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    pointer-events: none;
  }

  .ots-tag {
    font: 500 9px/1.2 'SF Mono', 'Fira Code', ui-monospace, monospace;
    margin: 4px 0 0;
    opacity: 0.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Spinner Lucide Loader2 — animation sur le <svg> interne pour
     un rotate fiable avec dimensions explicites (inline-flex parent
     a parfois des soucis sans width/height fixe). */
  .ots-spinner-wrap {
    display: inline-block;
    width: 18px;
    height: 18px;
    color: currentColor;
    line-height: 0;
  }
  .ots-spinner-wrap :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
    transform-origin: 50% 50%;
    animation: ots-spin 900ms linear infinite;
  }
  @keyframes ots-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* ── SM variant ── */
  .ots-sm .ots-item { min-width: 400px; max-width: 560px; padding: 16px 18px; gap: 14px; }
  .ots-sm .ots-title { font: 600 16px/1.3 system-ui; }
  .ots-sm .ots-desc { font: 400 14px/1.4 system-ui; }
  .ots-sm .ots-timer-badge { font-size: 13px; padding: 5px 10px; }

  /* ── MD variant ── */
  .ots-md .ots-item { min-width: 440px; max-width: 620px; padding: 18px 22px; gap: 16px; border-radius: 12px; }
  .ots-md .ots-title { font: 600 18px/1.3 system-ui; }
  .ots-md .ots-desc { font: 400 15px/1.4 system-ui; }
  .ots-md .ots-timer-badge { font-size: 15px; padding: 6px 11px; border-radius: 8px; }

  /* ── LG variant ── */
  .ots-lg .ots-item { min-width: 520px; max-width: 720px; padding: 20px 24px; gap: 18px; border-radius: 12px; }
  .ots-lg .ots-title { font: 600 22px/1.3 system-ui; }
  .ots-lg .ots-desc { font: 400 17px/1.4 system-ui; }
  .ots-lg .ots-timer-badge { font: 700 18px/1 'SF Mono', 'Fira Code', ui-monospace, monospace; padding: 7px 12px; border-radius: 8px; min-width: 4ch; }
  .ots-lg .ots-spinner { width: 22px; height: 22px; border-width: 2.5px; }
  .ots-lg .ots-close svg { width: 22px; height: 22px; }

  /* ── XL variant ── */
  .ots-xl .ots-item {
    min-width: 600px;
    max-width: 800px;
    padding: 24px 28px;
    gap: 20px;
    border-radius: 14px;
  }
  .ots-xl .ots-title { font: 600 30px/1.3 system-ui; }
  .ots-xl .ots-desc { font: 400 22px/1.4 system-ui; }
  .ots-xl .ots-timer-badge {
    font: 700 22px/1 'SF Mono', 'Fira Code', ui-monospace, monospace;
    padding: 8px 14px;
    border-radius: 10px;
    min-width: 4ch;
  }
  .ots-xl .ots-spinner { width: 28px; height: 28px; border-width: 3px; }
  .ots-xl .ots-close svg { width: 28px; height: 28px; }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RESPONSIVE — Mobile (≤ 640px)
     Force compact size regardless of `size` prop
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  @media (max-width: 640px) {
    .ots-active { padding: 12px; margin: -12px; }
    .ots-bottom { bottom: 16px; }
    .ots-top { top: 8px; }
    .ots-end { right: 8px; }
    .ots-start { left: 8px; }

    .ots-wrap,
    .ots-sm,
    .ots-md,
    .ots-lg,
    .ots-xl { --ots-stack-margin: -40px; }

    .ots-item,
    .ots-sm .ots-item,
    .ots-md .ots-item,
    .ots-lg .ots-item,
    .ots-xl .ots-item {
      min-width: 0;
      max-width: calc(100vw - 16px);
      padding: 10px 12px;
      gap: 10px;
      border-radius: 10px;
      margin-top: 6px;
    }

    .ots-title,
    .ots-sm .ots-title,
    .ots-md .ots-title,
    .ots-lg .ots-title,
    .ots-xl .ots-title { font: 600 13px/1.3 system-ui; }

    .ots-desc,
    .ots-sm .ots-desc,
    .ots-md .ots-desc,
    .ots-lg .ots-desc,
    .ots-xl .ots-desc { font: 400 11px/1.4 system-ui; }

    .ots-timer-badge,
    .ots-sm .ots-timer-badge,
    .ots-md .ots-timer-badge,
    .ots-lg .ots-timer-badge,
    .ots-xl .ots-timer-badge {
      font: 700 10px/1 'SF Mono', 'Fira Code', ui-monospace, monospace;
      padding: 3px 6px;
      border-radius: 5px;
      min-width: 3ch;
    }

    .ots-spinner,
    .ots-lg .ots-spinner,
    .ots-xl .ots-spinner { width: 14px; height: 14px; border-width: 2px; }

    .ots-close svg,
    .ots-lg .ots-close svg,
    .ots-xl .ots-close svg { width: 16px; height: 16px; }

    .ots-tag { font-size: 8px; }
  }
</style>
