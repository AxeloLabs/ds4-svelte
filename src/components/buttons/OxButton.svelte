<script lang="ts">
  /**
   * OxButton — DS-4 Button
   *
   * Props:
   *   variant   — 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated'
   *               | 'error-filled' | 'error-tonal' | 'error-outlined' | 'danger'
   *   size      — 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
   *   disabled  — boolean
   *   loading   — boolean — shows inline spinner, disables button
   *   waiting   — boolean — blink blue (user must act)
   *   iconLeft  — Snippet — icon before label
   *   iconRight — Snippet — icon after label
   *   children  — button label (Snippet)
   *   href      — when set, renders <a href> instead of <button> (CTA-link)
   *   target    — anchor target (forwarded to <a>)
   *
   * Rail mode (automatic via CSS @container ox-toolbar) :
   *   data-rail-label="Texte"  — label shown in expanded rail
   *   railLabel="Texte"        — alias for data-rail-label (backward compat)
   *   title / tooltip          — fallback for rail label + browser tooltip in fold
   */
  import type { Snippet } from 'svelte'
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'
  import OxTooltip from '../notifications/OxTooltip.svelte'

  type Variant =
    | 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated'
    | 'error-filled' | 'error-tonal' | 'error-outlined'
    | 'danger'  // alias for error-filled

  interface Props extends Omit<HTMLButtonAttributes, 'href'> {
    variant?: Variant
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    loading?: boolean
    waiting?: boolean
    iconLeft?: Snippet
    iconRight?: Snippet
    children?: Snippet
    /** Tooltip text (plain variant). Auto-wraps with OxTooltip if provided. */
    tooltip?: string
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right'
    /** Rail label — shown in expanded rail, used as browser tooltip in collapsed rail.
     *  Can also be passed directly as HTML attribute: data-rail-label="..." */
    railLabel?: string
    /** When set, renders <a href> instead of <button> (CTA-link styled as button). */
    href?: string
    target?: HTMLAnchorAttributes['target']
    rel?: HTMLAnchorAttributes['rel']
  }

  let {
    variant = 'filled',
    size = 'md',
    loading = false,
    waiting = false,
    disabled = false,
    iconLeft,
    iconRight,
    children,
    tooltip,
    tooltipPlacement = 'top',
    railLabel,
    title,
    href,
    target,
    rel,
    ...rest
  }: Props = $props()

  // Label for rail mode: explicit railLabel → title → tooltip → empty
  const _railLabel = $derived(railLabel ?? title ?? tooltip ?? '')

  // Generate stable id for tooltip
  let _tipId = $derived(tooltip ? `oxbtn-${Math.random().toString(36).slice(2, 9)}` : '')

  // Normalize 'danger' alias
  const v = $derived(variant === 'danger' ? 'error-filled' : variant)

  const cls = $derived([
    'ox-btn',
    `ox-btn-${v}`,
    size !== 'md' && `ox-btn-${size}`,
    loading && 'ox-btn-loading',
    waiting && 'ox-btn-waiting',
  ].filter(Boolean).join(' '))
</script>

{#snippet btnInner()}
  {#if loading}
    <span class="ox-btn-spinner" aria-hidden="true"></span>
  {:else if iconLeft}
    <span class="ox-btn-icon">{@render iconLeft()}</span>
  {/if}
  {#if children}<span class="ox-btn-label">{@render children()}</span>{/if}
  {#if iconRight && !loading}
    <span class="ox-btn-icon">{@render iconRight()}</span>
  {/if}
{/snippet}

{#snippet btnContent()}
  {#if href}
    <a
      class={cls}
      data-ui="ox-button"
      href={disabled || loading || waiting ? undefined : href}
      aria-disabled={disabled || loading || waiting ? 'true' : undefined}
      tabindex={disabled || loading || waiting ? -1 : undefined}
      {target}
      {rel}
      title={title ?? (_railLabel ? _railLabel : undefined)}
      data-rail-label={_railLabel || undefined}
      {...rest as HTMLAnchorAttributes}
    >
      {@render btnInner()}
    </a>
  {:else}
    <button
      class={cls}
      data-ui="ox-button"
      disabled={disabled || loading || waiting}
      title={title ?? (_railLabel ? _railLabel : undefined)}
      data-rail-label={_railLabel || undefined}
      {...rest}
    >
      {@render btnInner()}
    </button>
  {/if}
{/snippet}

{#if tooltip}
  <OxTooltip id={_tipId} label={tooltip} placement={tooltipPlacement}>
    {#snippet children()}{@render btnContent()}{/snippet}
  </OxTooltip>
{:else}
  {@render btnContent()}
{/if}

<style>
  .ox-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 24px;
    border: none;
    border-radius: 999px;
    font: var(--ox-label-lg, 500 14px/1 system-ui);
    letter-spacing: 0.1px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition:
      box-shadow 200ms cubic-bezier(.2,0,0,1),
      background 200ms;
    white-space: nowrap;
    text-transform: none;
  }
  /* ── Sizes ── */
  /* Default (md) — content-sized : la largeur cohérente est la responsabilité
     du parent layout (grid / flex-1 / class explicite), pas du composant.
     Opt-in pour largeur fixe : class="!w-[180px]" Tailwind ou size="lg/xl". */
  .ox-btn     { height: 48px; min-width: 0; width: auto; }
  .ox-btn-xs  { height: 28px; width: auto; min-width: 64px;  padding: 0 12px; font-size: 11px; gap: 4px; }
  .ox-btn-sm  { height: 36px; width: auto; min-width: 96px;  padding: 0 16px; font-size: 13px; gap: 6px; }
  .ox-btn-lg  { height: 48px; min-width: 240px; width: 240px; padding: 0 32px; font-size: 15px; gap: 10px; }
  .ox-btn-xl  { height: 64px; min-width: 300px; width: 300px; padding: 0 40px; font-size: 16px; gap: 12px; }
  @media (max-width: 599px) {
    /* md déjà fluide → règle retirée. lg/xl restent intentionnellement larges (hero CTAs). */
    .ox-btn-lg { min-width: 160px; width: auto; }
    .ox-btn-xl { min-width: 200px; width: auto; }
  }
  .ox-btn-xs .ox-btn-icon { font-size: 14px; }
  .ox-btn-lg .ox-btn-icon { font-size: 20px; }
  .ox-btn-xl .ox-btn-icon { font-size: 22px; }

  /* State layer */
  .ox-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: transparent;
    transition: background 100ms;
    pointer-events: none;
  }
  .ox-btn:focus-visible::after { background: rgba(0,0,0,0.12); }
  .ox-btn:active { transform: scale(.98); }
  .ox-btn:active::after { background: rgba(0,0,0,0.12); }
  .ox-btn:disabled,
  .ox-btn[aria-disabled='true'] { opacity: .38; cursor: not-allowed; pointer-events: none; }
  /* Anchor variant — ensure no underline / inherits color */
  a.ox-btn { text-decoration: none; }

  /* Filled */
  .ox-btn-filled {
    background: var(--ox-primary, #6750A4);
    color: var(--ox-on-primary, #fff);
  }
  .ox-btn-filled:hover { box-shadow: var(--ox-elevation-1, 0 1px 2px rgba(0,0,0,.3)); }
  .ox-btn-filled:hover::after { background: rgba(255,255,255,.08); }

  /* Tonal */
  .ox-btn-tonal {
    background: var(--ox-secondary-container, #E8DEF8);
    color: var(--ox-on-secondary-container, #1D192B);
  }
  .ox-btn-tonal:hover { box-shadow: var(--ox-elevation-1, 0 1px 2px rgba(0,0,0,.3)); }
  .ox-btn-tonal:hover::after { background: rgba(var(--ox-secondary-rgb, 98,91,113), var(--ox-state-hover, 0.08)); }

  /* Outlined */
  .ox-btn-outlined {
    background: transparent;
    color: var(--ox-primary, #6750A4);
    border: 1px solid var(--ox-outline, #79747E);
  }
  .ox-btn-outlined:hover::after { background: rgba(var(--ox-primary-rgb, 103,80,164), var(--ox-state-hover, 0.08)); }

  /* Text */
  .ox-btn-text {
    background: transparent;
    color: var(--ox-primary, #6750A4);
    padding: 10px 12px;
  }
  .ox-btn-text:hover::after { background: rgba(var(--ox-primary-rgb, 103,80,164), var(--ox-state-hover, 0.08)); }

  /* Elevated */
  .ox-btn-elevated {
    background: var(--ox-surface-1, #F4EEFF);
    color: var(--ox-primary, #6750A4);
    box-shadow: var(--ox-elevation-1, 0 1px 2px rgba(0,0,0,.3));
  }
  .ox-btn-elevated:hover {
    box-shadow: var(--ox-elevation-2, 0 1px 2px rgba(0,0,0,.3),0 2px 6px 2px rgba(0,0,0,.15));
  }
  .ox-btn-elevated:hover::after { background: rgba(var(--ox-primary-rgb, 103,80,164), var(--ox-state-hover, 0.08)); }

  /* Error variants */
  .ox-btn-error-filled {
    background: var(--ox-error, #B3261E);
    color: var(--ox-on-error, #fff);
  }
  .ox-btn-error-filled:hover::after { background: rgba(255,255,255,.08); }
  .ox-btn-error-tonal {
    background: var(--ox-error-container, #F9DEDC);
    color: var(--ox-on-error-container, #410E0B);
  }
  .ox-btn-error-outlined {
    background: transparent;
    color: var(--ox-error, #B3261E);
    border: 1px solid var(--ox-error, #B3261E);
  }

  /* Icons */
  .ox-btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 1;
    flex-shrink: 0;
    color: inherit;
  }

  /* Text label span */
  .ox-btn-label { flex-shrink: 0; display: inline-flex; align-items: center; color: inherit; }

  /* Loading spinner */
  .ox-btn-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: ox-btn-spin .6s linear infinite;
    flex-shrink: 0;
    opacity: 0.75;
  }
  .ox-btn-sm .ox-btn-spinner { width: 11px; height: 11px; }

  @keyframes ox-btn-spin {
    to { transform: rotate(360deg); }
  }

  .ox-btn-loading { opacity: 0.7; cursor: not-allowed; }

  /* Waiting state */
  .ox-btn.ox-btn-waiting {
    background: var(--phase-inject, #3B82F6);
    color: #fff;
    animation: ox-btn-blink .5s ease-in-out infinite alternate;
  }
  @keyframes ox-btn-blink {
    from { opacity: 1; }
    to   { opacity: .4; }
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RAIL MODE — CSS Container Queries (automatique)
     Breakpoints :
       ≤80px  = strip collapsed  → icône 48×44, tooltip via title
       ≥81px  = overlay expanded → icône + data-rail-label
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */

  /* FOLD — collapsed strip (≤80px) */
  @container ox-toolbar (max-width: 80px) {
    .ox-btn {
      width: 48px;
      height: 44px;
      min-width: unset;
      padding: 0;
      justify-content: center;
      border-radius: var(--ox-shape-md, 8px);
      background: transparent;
      color: var(--ox-on-surface-variant, #49454F);
      border: none;
      box-shadow: none;
      overflow: hidden;
    }
    .ox-btn:hover {
      background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
      color: var(--ox-on-surface, #1C1B1F);
      box-shadow: none;
    }
    /* Active variant → secondary container (filled = active, tonal = inactive in rail) */
    .ox-btn-filled {
      background: var(--ox-secondary-container, #E8DEF8);
      color: var(--ox-on-secondary-container, #1D192B);
    }
    /* Children slot — collapse text in fold mode */
    .ox-btn .ox-btn-label {
      font-size: 0;
      line-height: 0;
    }
    /* Remove state layer */
    .ox-btn::after { display: none; }
    .ox-btn:active { transform: none; }
    /* Icon size */
    .ox-btn .ox-btn-icon { font-size: 20px; }
    /* Reset size variants */
    .ox-btn-xs, .ox-btn-sm, .ox-btn-lg, .ox-btn-xl {
      width: 48px; height: 44px; padding: 0;
      font-size: inherit; gap: 0;
    }
  }

  /* UNFOLD — expanded overlay (≥81px) */
  @container ox-toolbar (min-width: 81px) {
    .ox-btn {
      width: 100%;
      height: 40px;
      min-width: unset;
      padding: 0 12px;
      justify-content: flex-start;
      border-radius: var(--ox-shape-md, 8px);
      gap: 10px;
      background: transparent;
      color: var(--ox-on-surface-variant, #49454F);
      border: none;
      box-shadow: none;
      overflow: hidden;
      font: 500 12px/1 system-ui;
    }
    .ox-btn:hover {
      background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
      color: var(--ox-on-surface, #1C1B1F);
      box-shadow: none;
    }
    /* Active variant only */
    .ox-btn-filled {
      background: var(--ox-secondary-container, #E8DEF8);
      color: var(--ox-on-secondary-container, #1D192B);
    }
    /* Children slot — collapse text in unfold mode (label via ::after) */
    .ox-btn .ox-btn-label {
      font-size: 0;
      line-height: 0;
      flex-shrink: 0;
    }
    /* Icon size */
    .ox-btn .ox-btn-icon { font-size: 20px; flex-shrink: 0; }
    /* Reset size variants */
    .ox-btn-xs, .ox-btn-sm, .ox-btn-lg, .ox-btn-xl {
      width: 100%; height: 40px; padding: 0 12px;
      font-size: 12px; gap: 10px;
    }
    /* Override ::after state layer → show rail label text */
    .ox-btn[data-rail-label]::after {
      content: attr(data-rail-label);
      position: static;
      inset: unset;
      border-radius: 0;
      background: transparent;
      transition: none;
      flex: 1;
      text-align: left;
      font: 500 12px/1 system-ui;
      white-space: nowrap;
      color: inherit;
      pointer-events: none;
    }
    .ox-btn:active { transform: none; }
  }
</style>
