<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxToasterSimple — Shadow DOM compatible toast stack
   * │ No Zag — pure CSS perspective stacking + hover expand
   * │ Mimics zagjs.com/components/toast overlap behavior
   * └─────────────────────────────────────────────────────────┘
   */
  import { X } from '@lucide/svelte'

  interface ToastItem {
    id: string
    title: string
    description?: string
    type: 'default' | 'noir' | 'bleu' | 'jaune' | 'rouge' | 'vert' | 'orange' | 'loading'
    removing?: boolean
  }

  interface Props {
    placement?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'
    duration?: number
  }

  let { placement = 'bottom-end', duration = 4000 }: Props = $props()
  let toasts = $state<ToastItem[]>([])
  let counter = 0
  let hovered = $state(false)

  export function create(opts: { title: string; description?: string; type?: string }): string {
    const id = `t-${++counter}`
    toasts = [...toasts, {
      id, title: opts.title, description: opts.description,
      type: (opts.type as any) ?? 'default',
    }]
    if ((opts.type ?? 'default') !== 'loading') {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  export function dismiss(id: string) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx === -1) return
    toasts[idx].removing = true
    toasts = [...toasts]
    setTimeout(() => { toasts = toasts.filter(t => t.id !== id) }, 350)
  }

  const isBottom = $derived(placement.startsWith('bottom'))
  const isEnd = $derived(placement.endsWith('end'))
  const activeCount = $derived(toasts.filter(t => !t.removing).length)
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="ots-wrap"
  class:ots-bottom={isBottom}
  class:ots-top={!isBottom}
  class:ots-end={isEnd}
  class:ots-start={!isEnd}
  class:ots-active={toasts.length > 0}
  class:ots-expanded={hovered && activeCount > 1}
  data-ui="ox-toaster-simple"
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
>
  <!--
    Rendering order: newest last in DOM = newest on top visually.
    In stacked mode: older toasts peek ABOVE the newest (perspective effect).
    depth = 0 for newest, 1 for second newest, etc.

    Stacked:  translateY(-depth * 8px) scale(1 - depth * 0.04)
              → older toasts move UP and shrink (perspective)
    Expanded: translateY(0) scale(1) + gap between items
  -->
  {#each toasts as toast, i (toast.id)}
    {@const depth = toasts.length - 1 - i}
    {@const sc = hovered ? 1 : Math.max(0.88, 1 - depth * 0.04)}
    {@const yUp = hovered ? 0 : -(depth * 10)}
    {@const op = hovered ? 1 : depth === 0 ? 1 : Math.max(0.35, 1 - depth * 0.25)}
    <div
      class="ots-item"
      class:ots-noir={toast.type === 'noir' || toast.type === 'default'}
      class:ots-vert={toast.type === 'vert'}
      class:ots-jaune={toast.type === 'jaune'}
      class:ots-rouge={toast.type === 'rouge'}
      class:ots-loading={toast.type === 'loading'}
      class:ots-removing={toast.removing}
      class:ots-enter={depth === 0 && !toast.removing}
      data-ui="toast-item"
      style="
        z-index: {200 + i};
        transform: scale({sc}) translateY({yUp}px);
        opacity: {op};
      "
    >
      <div class="ots-body">
        <p class="ots-title">{toast.title}</p>
        {#if toast.description}
          <p class="ots-desc">{toast.description}</p>
        {/if}
      </div>
      <div class="ots-actions">
        {#if toast.type === 'loading'}
          <span class="ots-spinner"></span>
        {/if}
        <button class="ots-close" onclick={() => dismiss(toast.id)} aria-label="Fermer">
          <X size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  {/each}

  {#if !hovered && activeCount > 1}
    <div class="ots-badge">{activeCount}</div>
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
    /* Smooth transitions for stack/expand */
    transition:
      transform 400ms cubic-bezier(0.21, 1.02, 0.73, 1),
      opacity 300ms ease,
      margin-top 400ms cubic-bezier(0.21, 1.02, 0.73, 1);
    /* Default stacked: all items overlap at same position */
    position: relative;
    margin-top: -56px;
  }
  /* First item — no overlap */
  .ots-item:first-child {
    margin-top: 0;
  }

  /* Expanded: spread out vertically */
  .ots-expanded .ots-item {
    margin-top: 8px !important;
    transform: scale(1) translateY(0) !important;
    opacity: 1 !important;
  }
  .ots-expanded .ots-item:first-child {
    margin-top: 0 !important;
  }

  /* Newest toast enters from bottom */
  .ots-enter {
    animation: ots-enter 350ms cubic-bezier(0.21, 1.02, 0.73, 1);
  }

  @keyframes ots-enter {
    0% { opacity: 0; transform: scale(0.9) translateY(30px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* Removing — fade + slide right */
  .ots-removing {
    opacity: 0 !important;
    transform: translateX(100%) scale(1) !important;
    transition: all 250ms ease-in !important;
    pointer-events: none !important;
  }

  /* ── Colors (semantic, theme-aware via DS-4 tokens with fallback) ── */
  .ots-noir    { background: var(--ox-inverse-surface, #1a1a1a); color: var(--ox-inverse-on-surface, #F4EFF4); }
  .ots-vert    { background: var(--ox-success, #166534);          color: var(--ox-on-success, #dcfce7); }
  .ots-jaune   { background: #ca8a04;                              color: #fefce8; } /* warning — pas de token DS */
  .ots-rouge   { background: var(--ox-error, #dc2626);             color: var(--ox-on-error, #fef2f2); }
  .ots-loading { background: var(--ox-primary, #1e40af);           color: var(--ox-on-primary, #dbeafe); }

  /* ── Content ── */
  .ots-body { flex: 1; min-width: 0; }
  .ots-title { font: 600 15px/1.3 system-ui; margin: 0; }
  .ots-desc { font: 400 13px/1.4 system-ui; margin: 3px 0 0; opacity: 0.8; }

  .ots-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .ots-close {
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; color: inherit; cursor: pointer;
    opacity: 0.4; padding: 4px; border-radius: 999px;
    transition: opacity 150ms, background 150ms;
  }
  .ots-close:hover { opacity: 1; background: rgba(255,255,255,0.15); }
  .ots-rouge .ots-close:hover,
  .ots-jaune .ots-close:hover,
  .ots-vert .ots-close:hover { background: rgba(0,0,0,0.1); }

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

  .ots-spinner {
    width: 16px; height: 16px;
    border: 2px solid currentColor; border-top-color: transparent;
    border-radius: 50%; animation: ots-spin 600ms linear infinite;
  }
  @keyframes ots-spin { to { transform: rotate(360deg); } }
</style>
