<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxRailContextProvider                                   │
   * │ Injecte le contexte 'ox-rail' pour les composants DS4  │
   * │ enfants (OxSegment, OxButton, OxToolbarSectionLabel).  │
   * │                                                         │
   * │ collapsed=true  → rail fold  (icône seule + tooltip)   │
   * │ collapsed=false → rail unfold (icône + label)          │
   * └─────────────────────────────────────────────────────────┘
   */
  import { setContext } from 'svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    collapsed: boolean
    children: Snippet
  }

  let { collapsed, children }: Props = $props()

  setContext('ox-rail', { get collapsed() { return collapsed } })
</script>

{@render children()}
