<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxTextShadow — DS-4 Text Shadow Effect
   * │ Highlight + shadow on text (inspired by Adam Argyle)
   * │ Parametrable: content, font size, hue
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   text     — text content (required)
   *   size     — font size in px (default: 64)
   *   hue      — oklch hue 0-360 (default: 320, magenta)
   *   weight   — font weight (default: 900)
   *   align    — text-align (default: 'left')
   */
  import type { Snippet } from 'svelte'

  interface Props {
    text?: string
    size?: number
    hue?: number
    weight?: number
    align?: 'left' | 'center' | 'right'
    children?: Snippet
  }

  let {
    text,
    size = 64,
    hue = 320,
    weight = 900,
    align = 'left',
    children,
  }: Props = $props()
</script>

<div
  class="ox-text-shadow"
  style="
    --ts-hue: {hue};
    --ts-size: {size}px;
    --ts-weight: {weight};
    --ts-align: {align};
    --ts-bg: oklch(35% .3 {hue});
    --ts-text: oklch(85% .1 {hue});
    --ts-shadow: oklch(25% .2 {hue});
    --ts-highlight: oklch(98% .05 {hue});
  "
  data-ui="ox-text-shadow"
>
  {#if children}
    {@render children()}
  {:else if text}
    <span class="ox-ts-content">{text}</span>
  {/if}
</div>

<style>
  .ox-text-shadow {
    display: inline-block;
    background: var(--ts-bg);
    color: var(--ts-text);
    font-size: var(--ts-size);
    font-weight: var(--ts-weight);
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.1;
    text-align: var(--ts-align);
    padding: 0.5em 0.75em;
    border-radius: var(--ox-shape-lg, 16px);
    text-shadow:
      0 .15ch 15px var(--ts-shadow),
      0 -2px 0 var(--ts-highlight);
    letter-spacing: -0.02em;
  }
  .ox-ts-content {
    white-space: pre-line;
  }
</style>
