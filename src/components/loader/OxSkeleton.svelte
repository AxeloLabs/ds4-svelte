<script lang="ts">
  /**
   * OxSkeleton — DS-4 Skeleton placeholder
   * Affiche un état de chargement avec animation pulse (réduite si
   * prefers-reduced-motion).
   *
   * Props:
   *   variant   — 'text' | 'rect' | 'circle' (default: 'text')
   *   width     — CSS value ('100%', '120px', '8ch'…) — default selon variant
   *   height    — CSS value — default selon variant
   *   rounded   — boolean — rectangle aux coins arrondis (default: true)
   *   lines     — number — pour variant 'text' : nombre de lignes (default: 1)
   *   label     — accessibility label (default: 'Chargement')
   */
  interface Props {
    variant?: 'text' | 'rect' | 'circle'
    width?: string
    height?: string
    rounded?: boolean
    lines?: number
    label?: string
  }

  let {
    variant = 'text',
    width,
    height,
    rounded = true,
    lines = 1,
    label = 'Chargement',
  }: Props = $props()

  const defaults = {
    text:   { width: '100%', height: '14px' },
    rect:   { width: '100%', height: '120px' },
    circle: { width: '48px', height: '48px' },
  } as const

  const resolvedWidth  = $derived(width ?? defaults[variant].width)
  const resolvedHeight = $derived(height ?? defaults[variant].height)
</script>

{#if variant === 'text' && lines > 1}
  <div data-ui="ox-skeleton" class="ox-skeleton-group" role="status" aria-label={label} aria-live="polite">
    {#each Array(lines) as _, i (i)}
      <span
        class="ox-skeleton ox-skeleton-text"
        style="width:{i === lines - 1 ? '60%' : resolvedWidth};height:{resolvedHeight}"
        aria-hidden="true"
      ></span>
    {/each}
  </div>
{:else}
  <span
    class="ox-skeleton ox-skeleton-{variant}"
    class:ox-skeleton-rounded={rounded && variant === 'rect'}
    style="width:{resolvedWidth};height:{resolvedHeight}"
    role="status"
    aria-label={label}
    aria-live="polite"
  ></span>
{/if}

<style>
  .ox-skeleton {
    display: block;
    background: linear-gradient(
      90deg,
      var(--ox-surface-2) 0%,
      var(--ox-surface-3) 50%,
      var(--ox-surface-2) 100%
    );
    background-size: 200% 100%;
    animation: ox-skeleton-shimmer 1.5s ease-in-out infinite;
  }
  .ox-skeleton-text   { border-radius: var(--ox-shape-xs); margin: 4px 0; }
  .ox-skeleton-rect   { border-radius: 0; }
  .ox-skeleton-rounded{ border-radius: var(--ox-shape-md); }
  .ox-skeleton-circle { border-radius: var(--ox-shape-full); }

  .ox-skeleton-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  @keyframes ox-skeleton-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
