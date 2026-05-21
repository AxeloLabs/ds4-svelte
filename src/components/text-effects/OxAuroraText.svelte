<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxAuroraText — Animated gradient text
   * │ Shifting color gradient on text via background-clip
   * │ Inspired by magicui/aurora-text
   * └─────────────────────────────────────────────────────────┘
   */
  import type { Snippet } from 'svelte'

  interface Props {
    colors?: string[]
    speed?: number
    children: Snippet
    class?: string
  }

  let {
    colors = ['#FF0080', '#7928CA', '#0070F3', '#38bdf8'],
    speed = 1,
    children,
    class: className = '',
  }: Props = $props()

  const gradient = $derived(`linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`)
  const duration = $derived(`${10 / speed}s`)
</script>

<span class="ox-aurora-text {className}" data-ui="ox-aurora-text">
  <span class="sr-only">{@render children()}</span>
  <span
    class="ox-aurora-inner"
    style="background-image:{gradient}; animation-duration:{duration}"
    aria-hidden="true"
  >
    {@render children()}
  </span>
</span>

<style>
  .ox-aurora-text {
    position: relative;
    display: inline-block;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .ox-aurora-inner {
    position: relative;
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: aurora-shift linear infinite;
  }
  @keyframes aurora-shift {
    0% { background-position: 0% center; }
    50% { background-position: 100% center; }
    100% { background-position: 0% center; }
  }
</style>
