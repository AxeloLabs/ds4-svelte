<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxBacklight — SVG filter glow effect
   * │ Gaussian blur + color saturation boost behind content
   * │ Inspired by magicui/backlight
   * └─────────────────────────────────────────────────────────┘
   */
  import type { Snippet } from 'svelte'

  interface Props {
    blur?: number
    saturation?: number
    children: Snippet
    class?: string
  }

  let {
    blur = 20,
    saturation = 4,
    children,
    class: className = '',
  }: Props = $props()

  const uid = Math.random().toString(36).slice(2, 8)
  const filterId = `ox-bl-${uid}`
</script>

<div class="ox-backlight {className}" data-ui="ox-backlight">
  <svg width="0" height="0" aria-hidden="true" style="position:absolute">
    <filter id={filterId} y="-50%" x="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred" />
      <feColorMatrix type="saturate" in="blurred" values={String(saturation)} />
      <feComposite in="SourceGraphic" operator="over" />
    </filter>
  </svg>

  <div class="ox-bl-content" style="filter:url(#{filterId})">
    {@render children()}
  </div>
</div>

<style>
  .ox-backlight {
    position: relative;
  }
  .ox-bl-content {
    position: relative;
  }
</style>
