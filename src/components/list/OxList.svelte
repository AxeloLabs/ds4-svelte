<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxList — DS-4 List container (MD3)
   * │ CSS-only wrapper. Contains OxListItem children.
   * │ Ref: https://m3.material.io/components/lists/specs
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   variant  — 'standard' | 'dense' (default: 'standard')
   *   children — OxListItem elements
   */
  import type { Snippet } from 'svelte'

  interface Props {
    variant?: 'standard' | 'dense'
    children: Snippet
  }

  let { variant = 'standard', children }: Props = $props()
</script>

<ul
  class="ox-list"
  class:ox-list-dense={variant === 'dense'}
  data-ui="ox-list"
  role="list"
>
  {@render children()}
</ul>

<style>
  .ox-list {
    list-style: none;
    margin: 0;
    padding: 0;
    font-family: system-ui, sans-serif;
    color: var(--ox-on-surface, #1C1B1F);
    width: 100%;
  }
</style>
