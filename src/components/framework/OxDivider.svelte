<script lang="ts">
  /**
   * OxDivider — DS-4 Divider
   * Horizontal or vertical separator line
   *
   * Props:
   *   variant    — 'full' | 'inset' | 'middle' (default: 'full')
   *   vertical   — boolean (default: false)
   *   spacing    — CSS spacing override (default: token-based)
   */

  interface Props {
    variant?: 'full' | 'inset' | 'middle'
    vertical?: boolean
    spacing?: string
  }

  let {
    variant = 'full',
    vertical = false,
    spacing,
  }: Props = $props()
</script>

{#if vertical}
  <div
    class="ox-divider-v"
    style={spacing ? `margin: 0 ${spacing}` : ''}
    role="separator"
    aria-orientation="vertical"
    data-ui="ox-divider"
  ></div>
{:else}
  <div
    class="ox-divider-h ox-divider-{variant}"
    style={spacing ? `margin: ${spacing} 0` : ''}
    role="separator"
    aria-orientation="horizontal"
    data-ui="divider"
  ></div>
{/if}

<style>
  .ox-divider-h {
    height: 1px;
    background: var(--ox-outline-variant);
    border: none;
    width: 100%;
    margin: var(--ox-spacing-4, 16px) 0;
  }

  .ox-divider-inset {
    margin-left: var(--ox-spacing-16, 64px);
    width: calc(100% - var(--ox-spacing-16, 64px));
  }

  .ox-divider-middle {
    margin-left: var(--ox-spacing-4, 16px);
    margin-right: var(--ox-spacing-4, 16px);
    width: calc(100% - var(--ox-spacing-4, 16px) * 2);
  }

  .ox-divider-v {
    width: 1px;
    height: auto;
    align-self: stretch;
    background: var(--ox-outline-variant);
    border: none;
    margin: 0 var(--ox-spacing-4, 16px);
  }
</style>
