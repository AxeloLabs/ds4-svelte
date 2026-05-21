<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxToolbarSectionLabel — DS-4 Toolbar Section Label     │
   * │ Label de section dans une toolbar.                      │
   * │                                                         │
   * │ Comportement rail (via CSS @container ox-toolbar) :    │
   * │   fold   (≤80px)  → caché                              │
   * │   unfold (≥81px)  → visible comme divider de section   │
   * │   hors rail       → visible en mode toolbar normale    │
   * └─────────────────────────────────────────────────────────┘
   */
  import type { Snippet } from 'svelte'

  interface Props {
    children?: Snippet
  }

  let { children }: Props = $props()
</script>

<span data-ui="ox-toolbar-section-label" class="ox-toolbar-section-label">
  {#if children}{@render children()}{/if}
</span>

<style>
  /* Normal mode — horizontal toolbar divider
     margin-left supprimé : c'est le gap du parent (.ox-toolbar) qui gère l'espacement uniforme */
  .ox-toolbar-section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--ox-on-surface-variant, #49454F);
    opacity: 0.7;
    flex-shrink: 0;
    white-space: nowrap;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RAIL MODE — CSS Container Queries (automatique)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */

  /* FOLD (≤80px) — caché */
  @container ox-toolbar (max-width: 80px) {
    .ox-toolbar-section-label { display: none; }
  }

  /* UNFOLD (≥81px) — divider de section vertical */
  @container ox-toolbar (min-width: 81px) {
    .ox-toolbar-section-label {
      display: block;
      width: 100%;
      padding: 14px 16px 8px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.5px;
      border-top: 1px solid var(--ox-outline-variant, #CAC4D0);
      border-left: none;
      margin-left: 0;
      margin-top: 4px;
      opacity: 0.6;
    }
    .ox-toolbar-section-label:first-child {
      border-top: none;
      margin-top: 0;
      padding-top: 14px;
    }
  }
</style>
