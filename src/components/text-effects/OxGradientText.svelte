<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxGradientText — Animated Gradient Text                 │
   * │ Gradient animé en boucle via background-clip:text.      │
   * │ Source : .animate-charcter — webagency2-app.web.app     │
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   text      — contenu texte
   *   colors    — stops couleurs gradient (default: violet→pink→yellow)
   *   angle     — angle du gradient en degrés (default: -225)
   *   speed     — durée animation en secondes (default: 2)
   *   size      — font-size px (default: 70)
   *   weight    — font-weight (default: 900)
   *   uppercase — text-transform uppercase (default: true)
   */
  import type { Snippet } from 'svelte'

  interface Props {
    text?:      string
    colors?:    string[]
    angle?:     number
    speed?:     number
    size?:      number
    weight?:    number
    uppercase?: boolean
    children?:  Snippet
  }

  let {
    text,
    colors    = ['#231557', '#44107a', '#ff1361', '#fff800'],
    angle     = -225,
    speed     = 2,
    size      = 70,
    weight    = 900,
    uppercase = true,
    children,
  }: Props = $props()

  // Build gradient stops: spread evenly
  const gradient = $derived(() => {
    const stops = colors.map((c, i) => {
      const pct = Math.round((i / (colors.length - 1)) * 100)
      return `${c} ${pct}%`
    }).join(', ')
    return `linear-gradient(${angle}deg, ${stops})`
  })
</script>

<span
  class="ox-gradient-text"
  class:ox-gradient-text--upper={uppercase}
  style="
    --gt-gradient: {gradient()};
    --gt-speed:    {speed}s;
    --gt-size:     {size}px;
    --gt-weight:   {weight};
  "
  data-ui="ox-gradient-text"
>
  {#if children}
    {@render children()}
  {:else if text}
    {text}
  {/if}
</span>

<style>
  .ox-gradient-text {
    background-image:    var(--gt-gradient);
    background-size:     200% auto;
    background-clip:     text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color:               transparent;
    font-size:           var(--gt-size);
    font-weight:         var(--gt-weight);
    display:             inline-block;
    line-height:         1.2;
    animation:           ox-textclip var(--gt-speed) linear infinite;
  }
  .ox-gradient-text--upper {
    text-transform: uppercase;
  }

  @keyframes ox-textclip {
    to { background-position: 200% center; }
  }
</style>
