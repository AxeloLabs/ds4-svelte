<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxRailLabel — DS-4 Sidebar Rail Section Label           │
   * │                                                         │
   * │ Label de section pour les sidebars verticales.         │
   * │ Utilise le contexte 'ox-rail' pour adapter l'affichage.│
   * │                                                         │
   * │ collapsed=false → label texte (uppercase, divider)     │
   * │ collapsed=true  → spacer transparent (hauteur = icône) │
   * │ hors rail       → label texte standard                 │
   * │                                                         │
   * │ RÈGLE DS4 — premier spacer d'un rail :                 │
   * │   .ox-rail-label-spacer:first-child { display: none }  │
   * │   → jamais d'espace vide en tête de rail gauche/droite │
   * └─────────────────────────────────────────────────────────┘
   */
  import { getContext } from 'svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    /** Hauteur du spacer en rail mode. sm=36px, md=44px. Default: 'md' */
    size?: 'sm' | 'md'
    children?: Snippet
  }

  let { size = 'md', children }: Props = $props()

  const rail = getContext<{ collapsed: boolean } | undefined>('ox-rail')
  const collapsed = $derived(rail?.collapsed === true)

  const spacerHeight = $derived(size === 'sm' ? 36 : 44)
</script>

{#if collapsed}
  <div data-ui="ox-rail-label" class="ox-rail-label-spacer" style="height:{spacerHeight}px" aria-hidden="true"></div>
{:else}
  <div class="ox-rail-label" class:ox-rail-label--in-rail={rail !== undefined}>
    {#if children}{@render children()}{/if}
  </div>
{/if}

<style>
  /* ── Spacer rail ── */
  .ox-rail-label-spacer {
    flex-shrink: 0;
    width: 100%;
  }
  /* RÈGLE DS4 — premier spacer en tête de rail : pas d'espace vide initial */
  .ox-rail-label-spacer:first-child {
    display: none;
  }

  /* ── Label standard (hors rail ou rail expanded) ── */
  .ox-rail-label {
    font: 700 10px/1 system-ui;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ox-on-surface-variant, #49454F);
    padding: 0 12px 4px;
    flex-shrink: 0;
    white-space: nowrap;
  }

  /* Premier label en rail unfold : padding-top plus généreux */
  .ox-rail-label--in-rail {
    padding: 10px 12px 4px;
    border-top: 1px solid var(--ox-outline-variant, #CAC4D0);
    margin-top: 4px;
    font-size: 9px;
    letter-spacing: 0.1em;
    opacity: 0.7;
  }

  .ox-rail-label--in-rail:first-child {
    border-top: none;
    margin-top: 0;
    padding-top: 6px;
  }
</style>
