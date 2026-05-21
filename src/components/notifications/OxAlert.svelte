<script lang="ts">
  /**
   * OxAlert — DS-4 Alert
   * Message persistant à propos d'une page ou d'une zone (MD3 banner).
   *
   * Props:
   *   variant   — 'info' | 'success' | 'warning' | 'error' (default: 'info')
   *   title     — titre court (optionnel)
   *   icon      — Snippet — icône à gauche (override icône par défaut)
   *   action    — Snippet — bouton/lien d'action (à droite)
   *   dismissible — boolean — affiche bouton close (default: false)
   *   children  — corps du message
   *
   * Events:
   *   ondismiss — déclenché au clic sur le bouton close
   */
  import type { Snippet } from 'svelte'
  import { Check, AlertTriangle, X, Info } from '@lucide/svelte'

  type Variant = 'info' | 'success' | 'warning' | 'error'

  interface Props {
    variant?: Variant
    title?: string
    icon?: Snippet
    action?: Snippet
    dismissible?: boolean
    children?: Snippet
    ondismiss?: () => void
  }

  let {
    variant = 'info',
    title,
    icon,
    action,
    dismissible = false,
    children,
    ondismiss,
  }: Props = $props()

  const roleMap = {
    info: 'status',
    success: 'status',
    warning: 'alert',
    error: 'alert',
  } as const
</script>

<div data-ui="ox-alert"
  class="ox-alert ox-alert-{variant}"
  role={roleMap[variant]}
  aria-live={variant === 'error' || variant === 'warning' ? 'assertive' : 'polite'}
>
  <span class="ox-alert-icon" aria-hidden="true">
    {#if icon}
      {@render icon()}
    {:else}
      {#if variant === 'info'}<Info size={18} strokeWidth={2} />{/if}
      {#if variant === 'success'}<Check size={18} strokeWidth={2} />{/if}
      {#if variant === 'warning'}<AlertTriangle size={18} strokeWidth={2} />{/if}
      {#if variant === 'error'}<X size={18} strokeWidth={2} />{/if}
    {/if}
  </span>

  <div class="ox-alert-body">
    {#if title}<div class="ox-alert-title">{title}</div>{/if}
    {#if children}<div class="ox-alert-content">{@render children()}</div>{/if}
  </div>

  {#if action}
    <div class="ox-alert-action">{@render action()}</div>
  {/if}

  {#if dismissible}
    <button
      class="ox-alert-close"
      aria-label="Fermer"
      type="button"
      onclick={ondismiss}
    ><X size={16} strokeWidth={2} /></button>
  {/if}
</div>

<style>
  .ox-alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: var(--ox-shape-md);
    border: 1px solid;
    font: var(--ox-body-md);
  }

  .ox-alert-info {
    background: var(--ox-info-container);
    color: var(--ox-on-info-container);
    border-color: var(--ox-info);
  }
  .ox-alert-success {
    background: var(--ox-success-container);
    color: var(--ox-on-success-container);
    border-color: var(--ox-success);
  }
  .ox-alert-warning {
    background: var(--ox-warning-container);
    color: var(--ox-on-warning-container);
    border-color: var(--ox-warning);
  }
  .ox-alert-error {
    background: var(--ox-error-container);
    color: var(--ox-on-error-container);
    border-color: var(--ox-error);
  }

  .ox-alert-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    line-height: 1;
    margin-top: 1px;
  }

  .ox-alert-body { flex: 1; min-width: 0; }
  .ox-alert-title { font: var(--ox-title-sm); margin-bottom: 2px; }
  .ox-alert-content { font: var(--ox-body-md); }

  .ox-alert-action { flex-shrink: 0; margin-left: 8px; }

  .ox-alert-close {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: currentColor;
    border-radius: var(--ox-shape-full);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    opacity: 0.7;
    transition: opacity var(--ox-duration-short2) var(--ox-easing-standard);
  }
  .ox-alert-close:hover { opacity: 1; background: rgba(0,0,0,0.06); }
  .ox-alert-close:focus-visible { outline: var(--ox-focus-ring); outline-offset: 2px; opacity: 1; }

  /* Responsive : full-width sur mobile */
  @media (max-width: 599px) {
    .ox-alert { border-radius: 0; padding: 12px; }
  }
</style>
