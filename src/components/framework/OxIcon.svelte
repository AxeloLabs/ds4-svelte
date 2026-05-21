<script lang="ts">
  /**
   * OxIcon — DS-4 Icon wrapper
   *
   * 3 usages au choix :
   *   1. Lucide (recommandé) — `<OxIcon icon={HouseIcon} />`
   *   2. SVG inline           — `<OxIcon><svg>…</svg></OxIcon>`
   *   3. Emoji / Unicode      — `<OxIcon>★</OxIcon>`
   *
   * Props:
   *   icon         — Composant icône (Lucide ou compatible) — alternative à children
   *   strokeWidth  — épaisseur stroke pour icônes Lucide (default 1.5 — MD3-ish)
   *   size         — 'sm' (16px) | 'md' (20px) | 'lg' (24px) | 'xl' (32px) | number (px)
   *   color        — token name ('primary', 'on-surface', 'error'…) ou couleur CSS directe
   *   label        — accessibility label. Si fourni → aria-label + role="img".
   *                  Si omis → aria-hidden="true" (icône décorative).
   *   children     — fallback : contenu SVG / emoji / texte unicode
   */
  import type { Snippet, Component } from 'svelte'

  type Size = 'sm' | 'md' | 'lg' | 'xl' | number

  interface Props {
    icon?: Component<any>
    strokeWidth?: number
    size?: Size
    color?: string
    label?: string
    children?: Snippet
  }

  let {
    icon: IconComponent,
    strokeWidth = 1.5,
    size = 'md',
    color,
    label,
    children,
  }: Props = $props()

  const sizeMap = { sm: 16, md: 20, lg: 24, xl: 32 } as const
  const px = $derived(typeof size === 'number' ? size : sizeMap[size])

  const tokenColors = new Set([
    'primary', 'secondary', 'tertiary', 'error', 'success', 'warning', 'info',
    'on-surface', 'on-surface-variant', 'on-primary', 'on-error', 'outline'
  ])
  const resolvedColor = $derived(
    color
      ? tokenColors.has(color) ? `var(--ox-${color})` : color
      : 'currentColor'
  )

  const isDecorative = $derived(!label)
</script>

<span data-ui="ox-icon"
  class="ox-icon"
  style="width:{px}px;height:{px}px;color:{resolvedColor};font-size:{px}px;line-height:1"
  role={isDecorative ? undefined : 'img'}
  aria-hidden={isDecorative ? 'true' : undefined}
  aria-label={label}
>
  {#if IconComponent}
    <IconComponent size={px} {strokeWidth} color="currentColor" />
  {:else}
    {@render children?.()}
  {/if}
</span>

<style>
  .ox-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    vertical-align: middle;
  }
  .ox-icon :global(svg) {
    width: 100%;
    height: 100%;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
