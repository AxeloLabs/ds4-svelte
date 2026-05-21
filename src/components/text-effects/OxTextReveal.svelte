<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxTextReveal — Animated text reveal synced to progress
   * │ Standalone text animation component
   * │ Can sync with OxDisplacementReveal or any 0→1 progress
   * └─────────────────────────────────────────────────────────┘
   */

  type Variant = 'default' | 'sweep' | 'zoom-blur' | 'glitch' | 'cinematic' | 'drop'

  interface Props {
    title: string
    subtitle?: string
    progress?: number
    variant?: Variant
    fontTitle?: string
    fontSub?: string
    titleWeight?: number
    titleItalic?: boolean
    titleSize?: string
    subSize?: string
    color?: string
    subColor?: string
  }

  let {
    title,
    subtitle,
    progress = 0,
    variant = 'default',
    fontTitle = "'Barlow Condensed', system-ui",
    fontSub = "'DM Sans', system-ui",
    titleWeight = 900,
    titleItalic = false,
    titleSize = 'clamp(32px, 6vw, 72px)',
    subSize = 'clamp(11px, 1.5vw, 16px)',
    color = '#fff',
    subColor = 'rgba(255,255,255,0.6)',
  }: Props = $props()

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // VARIANT ANIMATIONS
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  const variantStyle = $derived.by(() => {
    const p = progress
    switch (variant) {
      case 'sweep':
        // Clip-path reveal from left → right
        return {
          transform: 'none',
          opacity: 1,
          clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
          filter: 'none',
        }
      case 'zoom-blur':
        // Scale from 3x with blur decreasing
        const s = 3 - p * 2
        const blur = (1 - p) * 12
        return {
          transform: `scale(${s})`,
          opacity: Math.min(1, p * 3),
          clipPath: 'none',
          filter: `blur(${blur}px)`,
        }
      case 'glitch':
        // Skew + random offset + color channel separation
        const skew = (1 - p) * 15
        const tx = (1 - p) * 20
        return {
          transform: `translateX(${tx}px) skewX(${skew}deg)`,
          opacity: Math.min(1, p * 2),
          clipPath: 'none',
          filter: 'none',
          textShadow: p < 0.8
            ? `${(1 - p) * 6}px 0 rgba(255,0,0,0.7), ${-(1 - p) * 6}px 0 rgba(0,255,255,0.7)`
            : '0 2px 20px rgba(0,0,0,0.5)',
        }
      case 'cinematic':
        // Letterbox bars + fade in from black + scale
        const barH = (1 - p) * 15
        return {
          transform: `scale(${0.9 + p * 0.1})`,
          opacity: Math.min(1, p * 1.8),
          clipPath: `inset(${barH}% 0)`,
          filter: `brightness(${0.3 + p * 0.7})`,
        }
      case 'drop':
        // Drop from above with bounce-like easing
        const bounce = p < 0.6 ? (p / 0.6) : 1 + Math.sin((p - 0.6) / 0.4 * Math.PI) * 0.05
        const dropY = (1 - bounce) * -120
        return {
          transform: `translateY(${dropY}px) scale(${0.8 + bounce * 0.2})`,
          opacity: Math.min(1, p * 2.5),
          clipPath: 'none',
          filter: 'none',
        }
      default:
        // Original default
        return {
          transform: `translateY(${(1 - p) * 60}px) scale(${0.85 + p * 0.15})`,
          opacity: Math.min(1, p * 2.5),
          clipPath: 'none',
          filter: 'none',
        }
    }
  })

  const combinedStyle = $derived(
    `transform:${variantStyle.transform};opacity:${variantStyle.opacity};clip-path:${variantStyle.clipPath};filter:${variantStyle.filter};will-change:transform,opacity;`
    + (variantStyle.textShadow ? `text-shadow:${variantStyle.textShadow};` : '')
  )
</script>

<div
  class="ox-text-reveal"
  style={combinedStyle}
  data-ui="ox-text-reveal"
>
  {#if subtitle}
    <span
      class="ox-tr-sub"
      style="font: 500 {subSize}/1 {fontSub}; color: {subColor};"
    >
      {subtitle}
    </span>
  {/if}
  <span
    class="ox-tr-title"
    style="
      font: {titleWeight} {titleItalic ? 'italic' : 'normal'} {titleSize}/1 {fontTitle};
      color: {color};
    "
  >
    {title}
  </span>
</div>

<style>
  .ox-text-reveal {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    pointer-events: none;
  }
  .ox-tr-title {
    text-transform: uppercase;
    letter-spacing: -0.03em;
    text-shadow: 0 2px 20px rgba(0,0,0,0.5);
    text-align: center;
  }
  .ox-tr-sub {
    text-transform: uppercase;
    letter-spacing: 3px;
    text-shadow: 0 1px 8px rgba(0,0,0,0.5);
  }
</style>
