<script lang="ts">
  /**
   * OxImage — DS-4 Image
   * Wrapper image avec aspect-ratio, fallback en cas d'erreur de
   * chargement, support srcset (densité écran).
   *
   * Props:
   *   src        — URL principale
   *   alt        — texte alternatif (requis si non-décoratif)
   *   width      — CSS value
   *   height     — CSS value
   *   aspect     — '16/9' | '4/3' | '1/1' | '21/9' | string — ratio CSS
   *   fit        — 'cover' | 'contain' | 'fill' (default: 'cover')
   *   rounded    — 'none' | 'sm' | 'md' | 'lg' | 'full' (default: 'none')
   *   srcset     — srcset (1x/2x/3x ou widths)
   *   sizes      — sizes hint pour le navigateur
   *   loading    — 'lazy' | 'eager' (default: 'lazy')
   *   decorative — boolean → alt='' + aria-hidden (default: false)
   *   fallback   — Snippet — rendu si l'image échoue
   */
  import type { Snippet } from 'svelte'

  interface Props {
    src: string
    alt?: string
    width?: string
    height?: string
    aspect?: string
    fit?: 'cover' | 'contain' | 'fill'
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
    srcset?: string
    sizes?: string
    loading?: 'lazy' | 'eager'
    decorative?: boolean
    fallback?: Snippet
  }

  let {
    src,
    alt = '',
    width = '100%',
    height,
    aspect,
    fit = 'cover',
    rounded = 'none',
    srcset,
    sizes,
    loading = 'lazy',
    decorative = false,
    fallback,
  }: Props = $props()

  let errored = $state(false)

  const radiusMap = {
    none: '0',
    sm: 'var(--ox-shape-sm)',
    md: 'var(--ox-shape-md)',
    lg: 'var(--ox-shape-lg)',
    full: 'var(--ox-shape-full)',
  } as const
</script>

<span data-ui="ox-image"
  class="ox-image"
  style="
    width:{width};
    {height ? `height:${height};` : ''}
    {aspect ? `aspect-ratio:${aspect};` : ''}
    border-radius:{radiusMap[rounded]};
  "
>
  {#if errored}
    {#if fallback}
      {@render fallback()}
    {:else}
      <span class="ox-image-fallback" aria-hidden="true">⛶</span>
    {/if}
  {:else}
    <img
      {src}
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? 'true' : undefined}
      {srcset}
      {sizes}
      {loading}
      style="object-fit:{fit}"
      onerror={() => (errored = true)}
    />
  {/if}
</span>

<style>
  .ox-image {
    display: inline-block;
    position: relative;
    overflow: hidden;
    background: var(--ox-surface-2);
    line-height: 0;
  }
  .ox-image img {
    width: 100%;
    height: 100%;
    display: block;
  }
  .ox-image-fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ox-on-surface-variant);
    font-size: 32px;
  }
</style>
