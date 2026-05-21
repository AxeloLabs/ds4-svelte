<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxDisplacementReveal — SVG Displacement Mask Reveal
   * │ 7 preset effects, scroll-triggered or autoplay
   * │ No GSAP — IntersectionObserver + rAF
   * │ Inspired by codrops/OnScrollFilter + Fabio Ottaviani
   * └─────────────────────────────────────────────────────────┘
   */
  import { onMount } from 'svelte'

  interface Props {
    src: string
    width?: number
    height?: number
    duration?: number
    scale?: number
    frequency?: number
    octaves?: number
    morphRadius?: number
    blur?: number
    brightness?: number
    autoplay?: boolean
    yoyo?: boolean
    scroll?: boolean
    scrollLock?: boolean
    title?: string
    subtitle?: string
    showText?: boolean
    currentProgress?: number
    contourScale?: number
    preset?: 'fractal-soft' | 'morph-dilate' | 'wide-grain' | 'pixel-noise' | 'heavy-distort' | 'blur-dissolve' | 'sharp-edge'
  }

  // ── Presets ──
  const PRESETS: Record<string, Partial<Props>> = {
    'fractal-soft':   { frequency: 0.015,  octaves: 3, scale: 100 },
    'morph-dilate':   { frequency: 0.05,   octaves: 1, scale: 200, morphRadius: 3 },
    'wide-grain':     { frequency: 0.01,   octaves: 3, scale: 160 },
    'pixel-noise':    { frequency: 0.25,   octaves: 1, scale: 100 },
    'heavy-distort':  { frequency: 0.05,   octaves: 3, scale: 300 },
    'blur-dissolve':  { frequency: 0.005,  octaves: 3, scale: 300, blur: 12 },
    'sharp-edge':     { frequency: 0.015,  octaves: 1, scale: 240 },
  }

  let {
    src,
    width = 600,
    height = 400,
    duration = 2500,
    scale: scaleProp = 50,
    frequency: freqProp = 0.03,
    octaves: octavesProp = 3,
    morphRadius: morphProp = 0,
    blur: blurProp = 0,
    brightness = 100,
    autoplay = false,
    yoyo = true,
    scroll = false,
    scrollLock = false,
    title,
    subtitle,
    showText = true,
    currentProgress = $bindable(0),
    contourScale: contourScaleProp,
    preset,
  }: Props = $props()

  // Apply preset overrides — scroll mode uses 3x larger contours for fullscreen
  const p = $derived(preset ? PRESETS[preset] ?? {} : {})
  const fsScale = $derived(contourScaleProp ?? (scroll ? 1.5 : 1))
  const freq = $derived((p.frequency ?? freqProp) / fsScale)
  const oct = $derived(p.octaves ?? octavesProp)
  const scl = $derived((p.scale ?? scaleProp) * fsScale)
  const morph = $derived((p.morphRadius ?? morphProp) * fsScale)
  const blr = $derived((p.blur ?? blurProp) * (scroll ? 2 : 1))

  let progress = $state(0)
  let containerEl: HTMLDivElement | undefined = $state()
  let animating = $state(false)
  let raf = 0

  // Expose progress for external sync
  $effect(() => { currentProgress = progress })

  const maxRadius = $derived(Math.max(width, height) * 0.85)
  const cx = $derived(width / 2)
  const cy = $derived(height / 2)
  const uid = Math.random().toString(36).slice(2, 8)
  const filterId = `disp-f-${uid}`
  const maskId = `disp-m-${uid}`

  // Ease-in: slow start, then accelerate. Cap at 0.93 to keep contour edges visible
  const easedProgress = $derived(Math.pow(progress, 1.8) * 0.93)
  const bright = $derived(100 + progress * (brightness - 100))

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  // ── Autoplay animation ──
  function animate() {
    if (animating) return
    animating = true
    let start = 0
    let forward = true

    function tick(ts: number) {
      if (!start) start = ts
      const elapsed = ts - start
      const raw = Math.min(elapsed / duration, 1)
      const eased = easeInOutCubic(raw)
      progress = forward ? eased : 1 - eased

      if (raw < 1) {
        raf = requestAnimationFrame(tick)
      } else if (yoyo) {
        forward = !forward
        start = 0
        raf = requestAnimationFrame(tick)
      } else {
        animating = false
      }
    }
    raf = requestAnimationFrame(tick)
  }

  // ── Scroll-driven progress ──
  // Progress: 0 when element bottom enters viewport, 1 when element top reaches viewport center
  function getScrollParent(el: HTMLElement): HTMLElement | Window {
    let node = el.parentElement
    while (node) {
      const { overflow, overflowY } = getComputedStyle(node)
      if (/(auto|scroll)/.test(overflow + overflowY)) return node
      node = node.parentElement
    }
    return window
  }

  function setupScroll() {
    if (!containerEl) return
    const scroller = getScrollParent(containerEl)

    let targetProgress = 0
    let lerpRaf = 0
    const LERP = 0.08 // smoothing factor — lower = smoother/slower catch-up

    // Scroll handler: compute target instantly
    // Open phase: rect.top goes from vh→0 (progress 0→1)
    // Close phase: rect.top goes from 0→-vh (progress 1→0)
    function onScroll() {
      if (!containerEl) return
      const rect = containerEl.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < -vh * 2 || rect.top > vh * 2) return
      const raw = (vh - rect.top) / vh
      // raw: 0 = entering, 1 = fully visible, 2 = exiting top
      // Map to yoyo: 0→1 (open), then 1→0 (close)
      const yoyoRaw = raw <= 1 ? raw : 2 - raw
      targetProgress = Math.max(0, Math.min(1, yoyoRaw))
    }

    // Lerp loop: smoothly interpolate progress toward target
    function lerpTick() {
      const diff = targetProgress - progress
      if (Math.abs(diff) > 0.001) {
        progress += diff * LERP
      } else if (progress !== targetProgress) {
        progress = targetProgress
      }
      lerpRaf = requestAnimationFrame(lerpTick)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll() // initial
    progress = targetProgress // no lerp on first render
    lerpRaf = requestAnimationFrame(lerpTick)

    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(lerpRaf)
    }
  }

  // ── Scroll-lock mode: wheel controls progress, page doesn't scroll ──
  function setupScrollLock() {
    if (!containerEl) return
    let locked = false

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        locked = entry.isIntersecting && entry.intersectionRatio > 0.3
      }
    }, { threshold: [0, 0.3, 0.5, 0.8, 1] })
    observer.observe(containerEl)

    const onWheel = (e: WheelEvent) => {
      if (!locked) return
      // If progress is 0 and scrolling up, or progress is 1 and scrolling down → let page scroll
      if (progress <= 0 && e.deltaY < 0) return
      if (progress >= 1 && e.deltaY > 0) return
      e.preventDefault()
      const step = e.deltaY / (window.innerHeight * 2)
      progress = Math.max(0, Math.min(1, progress + step))
    }

    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      observer.disconnect()
      window.removeEventListener('wheel', onWheel)
    }
  }

  export function play() { animate() }
  export function stop() { cancelAnimationFrame(raf); animating = false; progress = 0 }
  export function setProgress(v: number) { progress = Math.max(0, Math.min(1, v)) }

  onMount(() => {
    if (scrollLock) {
      const cleanup = setupScrollLock()
      return () => { cancelAnimationFrame(raf); cleanup?.() }
    }
    if (scroll) {
      const cleanup = setupScroll()
      return () => { cancelAnimationFrame(raf); cleanup?.() }
    }
    if (autoplay) animate()
    return () => cancelAnimationFrame(raf)
  })
</script>

<div
  bind:this={containerEl}
  class="ox-disp-reveal"
  style="width:{width}px;height:{height}px"
  data-ui="ox-displacement-reveal"
>
  <!-- Text overlay animated by progress -->
  {#if title && showText}
    <div class="ox-dr-text"
      style="
        transform: translateY({(1 - progress) * 60}px) scale({0.85 + progress * 0.15});
        opacity: {Math.min(1, progress * 2.5)};
      "
    >
      {#if subtitle}
        <span class="ox-dr-sub">{subtitle}</span>
      {/if}
      <span class="ox-dr-title">{title}</span>
    </div>
  {/if}

  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <filter id={filterId}>
        <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={oct} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale={scl} result={morph > 0 ? 'displacement' : undefined} xChannelSelector="R" yChannelSelector="G" />
        {#if morph > 0}
          <feMorphology operator="dilate" radius={morph} in="displacement" />
        {/if}
        {#if blr > 0}
          <feGaussianBlur stdDeviation={blr} />
        {/if}
      </filter>
      <mask id={maskId}>
        <circle
          cx={cx}
          cy={cy}
          r={maxRadius}
          fill="white"
          style="filter:url(#{filterId}); transform-origin:{cx}px {cy}px; transform:scale({easedProgress}); will-change:transform"
        />
      </mask>
    </defs>
    <image
      href={src}
      {width}
      {height}
      preserveAspectRatio="xMidYMid slice"
      mask="url(#{maskId})"
      style="filter:brightness({bright}%)"
    />
  </svg>
</div>

<style>
  .ox-disp-reveal {
    display: inline-block;
    border-radius: var(--ox-shape-lg, 16px);
    overflow: hidden;
    background: #000;
    position: relative;
  }
  svg { display: block; }

  .ox-dr-text {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    will-change: transform, opacity;
    gap: 4px;
  }
  .ox-dr-title {
    font: 900 clamp(32px, 6vw, 72px)/1 'Barlow Condensed', system-ui;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    text-shadow: 0 2px 20px rgba(0,0,0,0.5);
    text-align: center;
  }
  .ox-dr-sub {
    font: 500 clamp(11px, 1.5vw, 16px)/1 'DM Sans', system-ui;
    color: rgba(255,255,255,0.6);
    text-transform: uppercase;
    letter-spacing: 3px;
    text-shadow: 0 1px 8px rgba(0,0,0,0.5);
  }
</style>
