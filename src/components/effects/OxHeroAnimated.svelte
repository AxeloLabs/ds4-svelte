<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxHeroAnimated — Hero widget extracted from /demo
   * │ Title chars converge from left/right toward central image
   * │ Driven by scroll (bound to OxDisplacementReveal progress)
   * │ Below: GLITCH-revealed description, autoplays once when centered
   * └─────────────────────────────────────────────────────────┘
   */

  import { onMount } from 'svelte'
  import OxDisplacementReveal from './OxDisplacementReveal.svelte'
  import OxTextReveal from '../text-effects/OxTextReveal.svelte'

  type PresetName =
    | 'fractal-soft'
    | 'morph-dilate'
    | 'wide-grain'
    | 'pixel-noise'
    | 'heavy-distort'
    | 'blur-dissolve'
    | 'sharp-edge'

  interface Props {
    leftTitle: string
    leftSub?: string
    rightTitle: string
    rightSub?: string
    src: string
    width?: number
    height?: number
    preset?: PresetName
    brightness?: number
    description?: string
    descGlitchTitle?: string
    descGlitchSub?: string
    titleFont?: string
    travelDistance?: string
    stagger?: number
  }

  let {
    leftTitle,
    leftSub,
    rightTitle,
    rightSub,
    src,
    width = 1000,
    height = 560,
    preset = 'wide-grain',
    brightness = 150,
    description,
    descGlitchTitle,
    descGlitchSub,
    titleFont = "'Playfair Display', serif",
    travelDistance = '20vw',
    stagger = 0.06,
  }: Props = $props()

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // SCROLL-DRIVEN PROGRESS (image centered in viewport)
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let displacementProgress = $state(0)
  // Map displacement progress (0→1→0) to a "center proximity" 0→1.
  // Saturates to 1 once image is near viewport center; stays 1 while crossing.
  const centerProgress = $derived(Math.min(1, displacementProgress * 2))

  function localP(p: number, delay: number): number {
    if (delay >= 1) return 0
    const t = (p - delay) / (1 - delay)
    return Math.max(0, Math.min(1, t))
  }
  function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // GLITCH AUTOPLAY (independent of scroll)
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let sectionEl: HTMLElement | undefined = $state()
  let glitchProgress = $state(0)
  let glitchPlayed = $state(false)
  let raf = 0

  function playGlitch() {
    if (glitchPlayed) return
    glitchPlayed = true
    let start = 0
    function tick(ts: number) {
      if (!start) start = ts
      const raw = Math.min((ts - start) / 1800, 1)
      glitchProgress = easeOutCubic(raw)
      if (raw < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  onMount(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        const rect = entry.boundingClientRect
        const vh = window.innerHeight
        const sectionCenter = rect.top + rect.height / 2
        const viewportCenter = vh / 2
        const dist = Math.abs(sectionCenter - viewportCenter)
        if (entry.isIntersecting && dist < vh * 0.35) playGlitch()
      },
      { threshold: [0.3, 0.5, 0.7, 1] },
    )
    if (sectionEl) io.observe(sectionEl)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  })

  // Fallback: trigger glitch when scroll progress confirms image is centered
  $effect(() => {
    if (centerProgress > 0.6 && !glitchPlayed) playGlitch()
  })

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // CHAR HELPERS
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  // Preserve spaces as non-breaking so inline-flex spans render them
  const NBSP = String.fromCharCode(160)
  function chars(s: string): string[] {
    return [...s].map((c) => (c === ' ' ? NBSP : c))
  }

  // LEFT title: char 0 outer, char N-1 inner (close to image) → arrives last
  function delayLeft(i: number, _n: number): number {
    return Math.min(0.95, i * stagger)
  }
  // RIGHT title: char 0 inner (close to image) → arrives last; char N-1 outer
  function delayRight(i: number, n: number): number {
    return Math.min(0.95, (n - 1 - i) * stagger)
  }

  // Glitch-style transform for the description paragraph (mirrors OxTextReveal "glitch")
  const descStyle = $derived.by(() => {
    const p = glitchProgress
    const skew = (1 - p) * 12
    const tx = (1 - p) * 16
    const shadow =
      p < 0.85
        ? `${(1 - p) * 5}px 0 rgba(255,0,0,0.55), ${-(1 - p) * 5}px 0 rgba(0,255,255,0.55)`
        : '0 1px 8px rgba(0,0,0,0.35)'
    return (
      `transform: translateX(${tx}px) skewX(${skew}deg);` +
      `opacity: ${Math.min(1, p * 2)};` +
      `text-shadow: ${shadow};` +
      `will-change: transform, opacity;`
    )
  })
</script>

<section class="ox-ha" bind:this={sectionEl} data-ui="ox-hero-animated">
  <!-- ── Title + image layer ─────────────────────────── -->
  <div class="ox-ha-stage">
    <h2
      class="ox-ha-title ox-ha-title-left"
      style="font-family:{titleFont};"
      aria-label={leftTitle}
    >
      <span class="ox-ha-line">
        {#each chars(leftTitle) as ch, i (i)}
          {@const lp = easeOutCubic(localP(centerProgress, delayLeft(i, leftTitle.length)))}
          <span
            class="ox-ha-char"
            aria-hidden="true"
            style="transform: translateX(calc((1 - {lp}) * -1 * {travelDistance})); opacity: {lp};"
            >{ch}</span
          >
        {/each}
      </span>
      {#if leftSub}
        <span
          class="ox-ha-sub"
          style="opacity:{centerProgress};transform:translateY({(1 - centerProgress) * 12}px);"
          >{leftSub}</span
        >
      {/if}
    </h2>

    <div class="ox-ha-img" style="aspect-ratio: {width} / {height};">
      <OxDisplacementReveal
        {src}
        {width}
        {height}
        {preset}
        scroll
        {brightness}
        showText={false}
        bind:currentProgress={displacementProgress}
      />
    </div>

    <h2
      class="ox-ha-title ox-ha-title-right"
      style="font-family:{titleFont};"
      aria-label={rightTitle}
    >
      <span class="ox-ha-line">
        {#each chars(rightTitle) as ch, i (i)}
          {@const lp = easeOutCubic(localP(centerProgress, delayRight(i, rightTitle.length)))}
          <span
            class="ox-ha-char"
            aria-hidden="true"
            style="transform: translateX(calc((1 - {lp}) * {travelDistance})); opacity: {lp};"
            >{ch}</span
          >
        {/each}
      </span>
      {#if rightSub}
        <span
          class="ox-ha-sub"
          style="opacity:{centerProgress};transform:translateY({(1 - centerProgress) * 12}px);"
          >{rightSub}</span
        >
      {/if}
    </h2>
  </div>

  <!-- ── Description layer (GLITCH autoplay) ─────────── -->
  {#if description || descGlitchTitle}
    <div class="ox-ha-bottom">
      {#if descGlitchTitle}
        <div class="ox-ha-glitch-head">
          <OxTextReveal
            title={descGlitchTitle}
            subtitle={descGlitchSub}
            variant="glitch"
            progress={glitchProgress}
            fontTitle={titleFont}
            titleWeight={300}
            titleItalic
            titleSize="clamp(1.5rem, 3vw, 2.5rem)"
            subSize="11px"
          />
        </div>
      {/if}
      {#if description}
        <p class="ox-ha-desc" style={descStyle}>{description}</p>
      {/if}
    </div>
  {/if}
</section>

<style>
  .ox-ha {
    width: 100%;
    min-height: 100vh;
    display: grid;
    grid-template-rows: 1fr auto;
    place-items: center;
    padding: 12vh 0 8vh;
    color: #fff;
    box-sizing: border-box;
  }

  .ox-ha-stage {
    width: 100%;
    display: grid;
    grid-template-areas: 'left img right';
    grid-template-columns: 22vw auto 22vw;
    align-items: center;
    justify-content: center;
    column-gap: 2vw;
  }

  .ox-ha-img {
    grid-area: img;
    width: 32vw;
    min-width: 280px;
    max-width: 640px;
  }
  .ox-ha-img :global(.ox-disp-reveal) {
    width: 100% !important;
    height: auto !important;
    border-radius: 0 !important;
  }
  .ox-ha-img :global(svg) {
    width: 100% !important;
    height: auto !important;
  }

  .ox-ha-title {
    margin: 0;
    line-height: 0.9;
    font-weight: 300;
    font-size: clamp(2rem, 6.5vw, 5.5rem);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .ox-ha-title-left {
    grid-area: left;
    justify-self: end;
    align-items: flex-end;
    font-style: italic;
    text-align: right;
  }
  .ox-ha-title-right {
    grid-area: right;
    justify-self: start;
    align-items: flex-start;
    font-weight: 400;
    text-align: left;
  }

  .ox-ha-line {
    display: inline-flex;
    flex-wrap: nowrap;
    width: max-content;
    will-change: transform;
  }
  .ox-ha-char {
    display: inline-block;
    will-change: transform, opacity;
    transition:
      opacity 60ms linear,
      transform 60ms linear;
  }
  .ox-ha-sub {
    font: 500 12px/1 'DM Sans', system-ui;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: rgba(255, 255, 255, 0.4);
    transition:
      opacity 240ms ease-out,
      transform 280ms ease-out;
    will-change: transform, opacity;
  }

  .ox-ha-bottom {
    width: 100%;
    max-width: 760px;
    margin-top: 6vh;
    padding: 0 5vw;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    text-align: center;
  }
  .ox-ha-glitch-head {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .ox-ha-desc {
    margin: 0;
    font: 400 0.95rem/1.65 'Inter', 'DM Sans', system-ui;
    color: rgba(255, 255, 255, 0.7);
    column-count: 2;
    column-gap: 3vw;
    text-align: justify;
  }

  @media (max-width: 53em) {
    .ox-ha-stage {
      grid-template-areas: 'left' 'img' 'right';
      grid-template-columns: 1fr;
      row-gap: 4vh;
      padding: 0 5vw;
    }
    .ox-ha-title {
      font-size: clamp(2rem, 12vw, 4rem);
    }
    .ox-ha-title-left,
    .ox-ha-title-right {
      justify-self: center;
      align-items: center;
      text-align: center;
    }
    .ox-ha-img {
      width: 80vw;
      max-width: none;
    }
    .ox-ha-desc {
      column-count: 1;
    }
  }
</style>
