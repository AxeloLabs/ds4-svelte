<script lang="ts">
  /**
   * OxAppBar — DS-4 Top App Bar (MD3)
   * CSS-powered — 4 variants: center-aligned, small, medium, large
   *
   * Props:
   *   title      — app bar title
   *   variant    — 'small' | 'center' | 'medium' | 'large' (default: 'small')
   *   leading    — Snippet for leading icon/nav button
   *   trailing   — Snippet for trailing action icons
   *   scrolled   — boolean — adds shadow when scrolled (bindable)
   */
  import type { Snippet } from 'svelte'

  interface Props {
    title: string
    variant?: 'small' | 'center' | 'medium' | 'large'
    leading?: Snippet
    trailing?: Snippet
    scrolled?: boolean
  }

  let { title, variant = 'small', leading, trailing, scrolled = false }: Props = $props()
</script>

<header
  class="ox-appbar ox-appbar-{variant}"
  class:ox-appbar-scrolled={scrolled}
  data-ui="ox-app-bar"
>
  <div class="ox-appbar-row">
    {#if leading}
      <div class="ox-appbar-leading">{@render leading()}</div>
    {/if}

    {#if variant === 'small' || variant === 'center'}
      <span class="ox-appbar-title" class:ox-appbar-title-center={variant === 'center'}>{title}</span>
    {/if}

    {#if trailing}
      <div class="ox-appbar-trailing">{@render trailing()}</div>
    {/if}
  </div>

  {#if variant === 'medium' || variant === 'large'}
    <div class="ox-appbar-headline ox-appbar-headline-{variant}">
      {title}
    </div>
  {/if}
</header>

<style>
  .ox-appbar {
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-on-surface, #1C1B1F);
    font-family: system-ui, sans-serif;
    transition: box-shadow 200ms cubic-bezier(0.2,0,0,1);
    width: 100%;
  }

  .ox-appbar-scrolled {
    box-shadow: var(--ox-elevation-2, 0 2px 6px 2px rgba(0,0,0,.15));
    background: var(--ox-surface-2, #EDE8F5);
  }

  .ox-appbar-row {
    display: flex;
    align-items: center;
    height: 64px;
    padding: 0 4px 0 4px;
    gap: 4px;
  }

  /* Sizes */
  .ox-appbar-medium .ox-appbar-row,
  .ox-appbar-large .ox-appbar-row { height: 64px; }

  .ox-appbar-leading,
  .ox-appbar-trailing {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .ox-appbar-trailing { margin-left: auto; }

  .ox-appbar-title {
    font: 500 22px/1 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    flex: 1;
    padding: 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ox-appbar-title-center {
    text-align: center;
    flex: 1;
  }

  /* Medium / Large headline */
  .ox-appbar-headline {
    padding: 0 16px 20px;
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-appbar-headline-medium { font: 400 28px/1.2 system-ui; }
  .ox-appbar-headline-large  { font: 400 36px/1.15 system-ui; letter-spacing: -0.3px; }

  /* Icon button inside appbar */
  :global(.ox-appbar .ox-appbar-icon-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px; height: 48px;
    border: none; background: none;
    color: var(--ox-on-surface-variant, #49454F);
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    transition: background 120ms;
  }
  :global(.ox-appbar .ox-appbar-icon-btn:hover) {
    background: rgba(29,27,32,0.08);
  }
</style>
