<script lang="ts">
  /**
   * OxBadge — DS-4 Badge
   * CSS-powered notification/status indicator
   *
   * Props:
   *   value    — number or string to display (omit for dot badge)
   *   max      — max value before showing "99+" (default: 99)
   *   variant  — 'filled' | 'outline' | 'dot' (default: 'filled')
   *   color    — accent color (CSS color, default: error red)
   *   visible  — show/hide badge (default: true)
   *   overlap  — position badge over child content (default: false)
   */

  import type { Snippet } from 'svelte'

  interface Props {
    value?: number | string
    max?: number
    variant?: 'filled' | 'outline' | 'dot'
    color?: string
    visible?: boolean
    overlap?: boolean
    children?: Snippet
  }

  let {
    value,
    max = 99,
    variant = 'filled',
    color,
    visible = true,
    overlap = false,
    children,
  }: Props = $props()

  let display = $derived(
    variant === 'dot' ? '' :
    typeof value === 'number' && max && value > max ? `${max}+` :
    value?.toString() ?? ''
  )
</script>

{#if overlap && children}
  <span class="ox-badge-wrapper" data-ui="ox-badge">
    {@render children()}
    {#if visible}
      <span
        class="ox-badge ox-badge-{variant} ox-badge-overlap"
        class:ox-badge-dot={variant === 'dot'}
        class:ox-badge-empty={!display}
        style={color ? `--badge-color:${color}` : ''}
        role={display ? 'status' : undefined}
        aria-label={display ? `${display} notification${Number(display) > 1 ? 's' : ''}` : undefined}
      >{display}</span>
    {/if}
  </span>
{:else if visible}
  <span
    class="ox-badge ox-badge-{variant}"
    class:ox-badge-dot={variant === 'dot'}
    class:ox-badge-empty={!display}
    style={color ? `--badge-color:${color}` : ''}
    data-ui="ox-badge"
    role={display ? 'status' : undefined}
    aria-label={display ? `${display} notification${Number(display) > 1 ? 's' : ''}` : undefined}
  >{display}</span>
{/if}

<style>
  .ox-badge-wrapper {
    position: relative;
    display: inline-flex;
  }

  .ox-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    font: 600 11px/1 system-ui;
    white-space: nowrap;
    box-sizing: border-box;
  }

  .ox-badge-empty {
    min-width: 20px;
    padding: 0;
  }

  /* Filled */
  .ox-badge-filled {
    background: var(--badge-color, var(--ox-error, #B3261E));
    color: var(--ox-on-error, #fff);
  }

  /* Outline */
  .ox-badge-outline {
    background: transparent;
    border: 1.5px solid var(--badge-color, var(--ox-error, #B3261E));
    color: var(--badge-color, var(--ox-error, #B3261E));
  }

  /* Dot */
  .ox-badge-dot {
    min-width: 10px;
    width: 10px;
    height: 10px;
    padding: 0;
    border-radius: 50%;
    background: var(--badge-color, var(--ox-error, #B3261E));
  }

  /* Overlap positioning */
  .ox-badge-overlap {
    position: absolute;
    top: -4px;
    right: -4px;
  }
  .ox-badge-overlap.ox-badge-dot {
    top: 0;
    right: 0;
  }
</style>
