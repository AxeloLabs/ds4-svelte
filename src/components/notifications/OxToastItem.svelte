<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxToastItem — Individual toast rendered by OxToaster
   * │ Powered by @zag-js/toast
   * │ Uses CSS vars from Zag for stacking: --x, --y, --scale,
   * │ --z-index, --height, --opacity
   * └─────────────────────────────────────────────────────────┘
   */
  import * as toast from '@zag-js/toast'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { X, Loader2Icon } from '@lucide/svelte'

  interface Props {
    toast: toast.Options
    index: number
    parent: toast.GroupService
  }

  let { toast: toastOptions, index, parent }: Props = $props()

  const machineProps = $derived({ ...toastOptions, parent, index })
  const service = useMachine(toast.machine, () => machineProps)
  const api = $derived(toast.connect(service, normalizeProps))

  // Couleur custom DS4 : peut venir soit du `type` (legacy, casse Zag v1.40+),
  // soit du field `meta.color` (recommandé, pass-through propre).
  // Zag v1.40 crashe sur les types non-officiels via getPriorityForType — utiliser meta.color.
  const customColor = $derived((toastOptions as any).meta?.color as string | undefined)
  const isError = $derived(api.type === 'error' || customColor === 'rouge')
  const isNoir = $derived(customColor === 'noir')
  const isBleu = $derived(customColor === 'bleu' || api.type === 'success')
  const isJaune = $derived(customColor === 'jaune')
  const isRouge = $derived(customColor === 'rouge')
</script>

<div
  class="ox-toast-item"
  data-ui="ox-toast-item"
  class:ox-toast-error={isError}
  class:ox-toast-noir={isNoir}
  class:ox-toast-bleu={isBleu}
  class:ox-toast-jaune={isJaune}
  class:ox-toast-rouge={isRouge}
  {...api.getRootProps()}
>
  <div class="ox-toast-body">
    {#if api.title}
      <p class="ox-toast-title" {...api.getTitleProps()}>{api.title}</p>
    {/if}
    {#if api.description}
      <p class="ox-toast-desc" {...api.getDescriptionProps()}>{api.description}</p>
    {/if}
  </div>

  <div class="ox-toast-actions">
    {#if api.type === 'loading'}
      <span class="ox-toast-spinner-wrap">
        <Loader2Icon size={18} strokeWidth={2.5} />
      </span>
    {/if}
    <button class="ox-toast-close" data-ui="toast-close" onclick={() => api.dismiss()} aria-label="Fermer" {...api.getCloseTriggerProps()}>
      <X size={18} strokeWidth={2} />
    </button>
  </div>
</div>

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TOAST ROOT — Zag CSS variables for stacking
     --x, --y      : position offset
     --scale       : perspective scale (smaller = further back)
     --z-index     : layer order
     --height      : measured height for overlap calc
     --opacity     : fade for distant toasts
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-toast-item {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 14px 16px !important;
    border-radius: 8px !important;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25) !important;
    font-family: system-ui, sans-serif !important;
    font-size: 15px !important;
    min-width: 360px !important;
    max-width: 500px !important;
    pointer-events: auto !important;
    /* Default = inverse surface */
    background: var(--ox-inverse-surface, #313033);
    color: var(--ox-inverse-on-surface, #F4EFF4);
    /* Zag stacking variables */
    translate: var(--x) var(--y);
    scale: var(--scale);
    z-index: var(--z-index);
    height: var(--height);
    opacity: var(--opacity);
    will-change: translate, opacity, scale;
    /* Smooth transitions for stacking/unstacking */
    transition:
      translate 400ms cubic-bezier(0.21, 1.02, 0.73, 1),
      scale 400ms cubic-bezier(0.21, 1.02, 0.73, 1),
      opacity 400ms cubic-bezier(0.21, 1.02, 0.73, 1);
  }

  /* Closing state — faster fade out */
  .ox-toast-item[data-state="closed"] {
    transition:
      translate 400ms cubic-bezier(0.06, 0.71, 0.55, 1),
      scale 400ms cubic-bezier(0.06, 0.71, 0.55, 1),
      opacity 200ms cubic-bezier(0.06, 0.71, 0.55, 1);
  }

  /* type='error' garde la teinte container theme-aware (rouge clair) */
  .ox-toast-error {
    background: var(--ox-error-container, #F9DEDC);
    color: var(--ox-on-error-container, #410E0B);
  }

  /* Variants DS4 custom — couleurs fixes (indépendantes du thème), avec
     paire bg ↔ contraste garantie (color roles MD3). */
  .ox-toast-noir {
    background: #1a1a1a;
    color: #ffffff;
  }
  .ox-toast-bleu {
    background: #2563eb;
    color: #ffffff;
  }
  .ox-toast-jaune {
    background: #fbbf24;
    color: #1a1a1a;
  }
  .ox-toast-rouge {
    background: #991b1b;
    color: #ffffff;
  }

  .ox-toast-body {
    flex: 1;
    min-width: 0;
    user-select: text !important;
    -webkit-user-select: text !important;
    cursor: text;
  }

  .ox-toast-title {
    font: 600 15px/1.3 system-ui !important;
    margin: 0 !important;
  }

  .ox-toast-desc {
    font: 400 13px/1.4 system-ui !important;
    margin: 2px 0 0 !important;
    opacity: 0.85;
  }

  .ox-toast-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .ox-toast-close {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    opacity: 0.5;
    padding: 2px;
    border-radius: var(--ox-shape-full, 999px);
    transition: opacity 120ms, background 120ms;
  }
  .ox-toast-close:hover {
    opacity: 1;
    background: rgba(255,255,255,0.1);
  }
  /* Hover croix sur bg clair (texte foncé) → assombrir */
  .ox-toast-error .ox-toast-close:hover,
  .ox-toast-jaune .ox-toast-close:hover {
    background: rgba(0,0,0,0.08);
  }
  /* Hover croix sur bg foncé (texte blanc) — défaut déjà OK :
     .ox-toast-close:hover utilise rgba(255,255,255,0.1) */

  /* Spinner Lucide Loader2 — l'animation est sur le <svg> interne
     plutôt que sur le span wrapper : inline-flex peut avoir des soucis
     de rotation sans dimensions explicites. Le SVG a son own bounding
     box donc rotate marche partout. */
  .ox-toast-spinner-wrap {
    display: inline-block;
    width: 18px;
    height: 18px;
    color: currentColor;
    line-height: 0;
  }
  .ox-toast-spinner-wrap :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
    transform-origin: 50% 50%;
    animation: ox-toast-spin 900ms linear infinite;
  }
  @keyframes ox-toast-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RESPONSIVE — Mobile (≤ 640px)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  @media (max-width: 640px) {
    .ox-toast-item {
      min-width: 0 !important;
      max-width: calc(100vw - 16px) !important;
      padding: 10px 12px !important;
      gap: 10px !important;
      font-size: 13px !important;
      border-radius: 8px !important;
    }
    .ox-toast-title { font: 600 13px/1.3 system-ui !important; }
    .ox-toast-desc { font: 400 11px/1.4 system-ui !important; margin: 2px 0 0 !important; }
    .ox-toast-spinner-wrap :global(svg) { width: 14px; height: 14px; }
    .ox-toast-close :global(svg) { width: 16px; height: 16px; }
  }
</style>
