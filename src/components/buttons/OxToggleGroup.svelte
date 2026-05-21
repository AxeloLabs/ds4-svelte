<script lang="ts">
  /**
   * OxToggleGroup — DEPRECATED
   * Fusionné dans OxSegment variant="toggle".
   * Ce composant reste pour la rétrocompatibilité.
   *
   * Migration : remplacer OxToggleGroup par OxSegment variant="toggle"
   */
  import OxSegment from './OxSegment.svelte'

  const props = $props()
</script>

<!-- Re-export vers OxSegment avec style toggle -->
<OxSegment variant="toggle" {...props} />
