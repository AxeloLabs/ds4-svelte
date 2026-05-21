<script lang="ts">
  /**
   * OxLink — DS-4 Link
   * Lien hypertexte stylisé, inline ou standalone. Hérite la typographie
   * du parent (utilisable dans paragraphes).
   *
   * Props:
   *   href      — URL (requis)
   *   variant   — 'inline' (souligné dans le texte) | 'standalone' (sans soulignement)
   *   external  — boolean — ouvre _blank + rel=noopener + ajoute icône ↗ (default: false)
   *   disabled  — boolean — non interactif visuellement
   *   color     — token name ou couleur CSS (default: 'primary' → inherit en inline)
   *   children  — texte du lien
   *
   * Attributs HTML standards (target, rel, download, …) forwardés au <a>.
   */
  import type { Snippet } from 'svelte'
  import type { HTMLAnchorAttributes } from 'svelte/elements'

  interface Props extends Omit<HTMLAnchorAttributes, 'href'> {
    href: string
    variant?: 'inline' | 'standalone'
    external?: boolean
    disabled?: boolean
    color?: string
    children?: Snippet
  }

  let {
    href,
    variant = 'inline',
    external = false,
    disabled = false,
    color,
    children,
    target,
    rel,
    ...rest
  }: Props = $props()

  const tokenColors = new Set([
    'primary', 'secondary', 'tertiary', 'error', 'success', 'warning', 'info',
    'on-surface', 'on-surface-variant', 'outline'
  ])
  const resolvedColor = $derived(
    color
      ? tokenColors.has(color) ? `var(--ox-${color})` : color
      : undefined
  )

  const finalTarget = $derived(external ? (target ?? '_blank') : target)
  const finalRel = $derived(external ? (rel ?? 'noopener noreferrer') : rel)
</script>

{#if disabled}
  <span data-ui="ox-link" class="ox-link ox-link-{variant} ox-link-disabled" aria-disabled="true">
    {@render children?.()}
  </span>
{:else}
  <a
    class="ox-link ox-link-{variant}"
    {href}
    target={finalTarget}
    rel={finalRel}
    style={resolvedColor ? `--ox-link-color:${resolvedColor}` : ''}
    {...rest}
  >
    {@render children?.()}
    {#if external}<span class="ox-link-external" aria-hidden="true">↗</span>{/if}
  </a>
{/if}

<style>
  .ox-link {
    color: var(--ox-link-color, var(--ox-primary));
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
    transition: color var(--ox-duration-short2) var(--ox-easing-standard);
    cursor: pointer;
  }
  .ox-link:hover { filter: brightness(0.85); }
  .ox-link:focus-visible {
    outline: var(--ox-focus-ring);
    outline-offset: 2px;
    border-radius: var(--ox-shape-xs);
  }

  /* Inline : hérite font + souligné par défaut */
  .ox-link-inline {
    font: inherit;
    text-decoration: underline;
  }

  /* Standalone : pas de soulignement, font label */
  .ox-link-standalone {
    text-decoration: none;
    font: var(--ox-label-lg);
  }
  .ox-link-standalone:hover { text-decoration: underline; }

  .ox-link-disabled {
    color: var(--ox-on-surface-variant);
    opacity: 0.5;
    cursor: not-allowed;
    text-decoration: line-through;
  }

  .ox-link-external {
    display: inline-block;
    margin-left: 2px;
    font-size: 0.85em;
    vertical-align: baseline;
  }
</style>
