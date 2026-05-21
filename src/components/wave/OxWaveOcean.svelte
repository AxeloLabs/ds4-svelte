<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxWaveOcean
   * │ Séparateur SVG profond polymorphe — 3 vagues desync +
   * │ 1 stroke + N particules. Vague de premier plan = exact
   * │ `bgColor` → seam invisible avec la section qui suit.
   * │
   * │ Modes :
   * │  - default : animée + opti (will-change + IntersectionObserver)
   * │  - flip    : vague inversée (transform scaleY -1) → utile
   * │              en TOP de section (descend depuis le haut)
   * │  - static  : pas d'animation, pas d'IO, pas de drops par
   * │              défaut → ultra léger, juste paint initial
   * │  - palette : couleurs c1/c2/c3 explicites (sinon dérivées
   * │              de bgColor via color-mix)
   * │  - shape   : 'calm' | 'normal' | 'wild' — silhouette
   * │  - amplitude : multiplicateur scaleY (0.5..2)
   * └─────────────────────────────────────────────────────────┘
   */
  import { onMount } from 'svelte'

  interface Palette { c1?: string; c2?: string; c3?: string }

  interface Props {
    bgColor?:   string
    height?:    number
    heightMin?: number
    speed?:     number
    drops?:     boolean
    dropCount?: number
    dropColor?: string
    flip?:      boolean
    static?:    boolean
    palette?:   Palette
    shape?:     'calm' | 'normal' | 'wild'
    amplitude?: number
  }

  let {
    bgColor   = '#1a1a1a',
    height    = 185,
    heightMin = 70,
    speed     = 20,
    drops:      dropsProp,
    dropCount = 8,
    dropColor = 'rgba(255, 255, 255, 0.55)',
    flip      = false,
    static:     isStatic = false,
    palette,
    shape     = 'wild',
    amplitude = 1,
  }: Props = $props()

  // Drops par défaut : true en mode animé, false en mode static
  const drops = $derived(dropsProp ?? !isStatic)

  // IntersectionObserver — désactivé en mode static (économie listener)
  let root: HTMLDivElement | undefined = $state()
  let visible = $state(false)

  onMount(() => {
    if (isStatic) { visible = true; return }
    if (!root || typeof IntersectionObserver === 'undefined') {
      visible = true
      return
    }
    const io = new IntersectionObserver(
      (entries) => { visible = entries[0]?.isIntersecting ?? false },
      { rootMargin: '120px 0px' }
    )
    io.observe(root)
    return () => io.disconnect()
  })

  const uid = Math.random().toString(36).slice(2, 8)
  const g1 = `wo-g1-${uid}`
  const g2 = `wo-g2-${uid}`
  const g3 = `wo-g3-${uid}`

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // SHAPES — 3 silhouettes (extraites de home2)
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  const SHAPES = {
    calm: {
      w1:  'M0,148 C480,108 960,108 1440,148 C1920,188 2400,188 2880,148 L2880,185 L0,185 Z',
      w2:  'M0,122 C480,96 960,96 1440,122 C1920,148 2400,148 2880,122 L2880,185 L0,185 Z',
      w3:  'M0,100 C320,82 640,82 960,100 C1280,118 1600,118 1920,100 C2240,82 2560,82 2880,100 L2880,185 L0,185 Z',
      w3s: 'M0,100 C320,82 640,82 960,100 C1280,118 1600,118 1920,100 C2240,82 2560,82 2880,100',
    },
    normal: {
      w1:  'M0,135 C240,92 480,92 720,135 C960,178 1200,178 1440,135 C1680,92 1920,92 2160,135 C2400,178 2640,178 2880,135 L2880,185 L0,185 Z',
      w2:  'M0,110 C240,84 480,84 720,110 C960,136 1200,136 1440,110 C1680,84 1920,84 2160,110 C2400,136 2640,136 2880,110 L2880,185 L0,185 Z',
      w3:  'M0,88 C160,70 320,70 480,88 C640,106 800,106 960,88 C1120,70 1280,70 1440,88 C1600,106 1760,106 1920,88 C2080,70 2240,70 2400,88 C2560,106 2720,106 2880,88 L2880,185 L0,185 Z',
      w3s: 'M0,88 C160,70 320,70 480,88 C640,106 800,106 960,88 C1120,70 1280,70 1440,88 C1600,106 1760,106 1920,88 C2080,70 2240,70 2400,88 C2560,106 2720,106 2880,88',
    },
    wild: {
      w1:  'M0,128 C180,55 540,55 720,128 C900,201 1260,201 1440,128 C1620,55 1980,55 2160,128 C2340,201 2700,201 2880,128 L2880,185 L0,185 Z',
      w2:  'M0,112 C180,48 540,48 720,112 C900,176 1260,176 1440,112 C1620,48 1980,48 2160,112 C2340,176 2700,176 2880,112 L2880,185 L0,185 Z',
      w3:  'M0,92 C120,40 240,40 360,92 C480,144 600,144 720,92 C840,40 960,40 1080,92 C1200,144 1320,144 1440,92 C1560,40 1680,40 1800,92 C1920,144 2040,144 2160,92 C2280,40 2400,40 2520,92 C2640,144 2760,144 2880,92 L2880,185 L0,185 Z',
      w3s: 'M0,92 C120,40 240,40 360,92 C480,144 600,144 720,92 C840,40 960,40 1080,92 C1200,144 1320,144 1440,92 C1560,40 1680,40 1800,92 C1920,144 2040,144 2160,92 C2280,40 2400,40 2520,92 C2640,144 2760,144 2880,92',
    },
  } as const

  const PATHS = $derived(SHAPES[shape])

  const oceanDrops = $derived(
    drops
      ? Array.from({ length: dropCount }, (_, i) => ({
          left:  `${((i * 11.7 + 4) % 94).toFixed(1)}%`,
          bot:   `${60 + ((i * 23) % 60)}px`,
          size:  `${3 + ((i * 2) % 6)}px`,
          delay: `${((i * 0.71) % 5.2).toFixed(2)}s`,
          dur:   `${(2.4 + ((i * 0.58) % 3.0)).toFixed(2)}s`,
        }))
      : []
  )

  // Durées desync — surchargent la durée du shorthand `animation:` défini en CSS
  const dur1 = $derived(`${speed}s`)
  const dur2 = $derived(`${(speed * 0.65).toFixed(2)}s`)
  const dur3 = $derived(`${(speed * 0.40).toFixed(2)}s`)

  // Transform du SVG : flip + amplitude combinés (transform-origin: center bottom)
  const svgTransform = $derived(
    `scaleY(${flip ? -amplitude : amplitude})`
  )

  // Couleurs — palette explicite ou dérivée de bgColor via color-mix
  const colorBack  = $derived(palette?.c1 ?? `color-mix(in srgb, ${bgColor} 60%, white)`)
  const colorMid   = $derived(palette?.c2 ?? `color-mix(in srgb, ${bgColor} 85%, white 5%)`)
  const colorFront = $derived(palette?.c3 ?? bgColor)
  const colorStroke = $derived(`color-mix(in srgb, ${bgColor} 50%, white 35%)`)
</script>

<div
  bind:this={root}
  class="ox-wave-ocean"
  class:is-visible={visible}
  class:is-static={isStatic}
  class:is-flipped={flip}
  data-ui="ox-wave-ocean"
  style="--wo-bg:{bgColor}; --wo-drop:{dropColor}; --wo-h:{height}px; --wo-h-min:{heightMin}px; --wo-back:{colorBack}; --wo-mid:{colorMid}; --wo-front:{colorFront}; --wo-stroke:{colorStroke};"
  aria-hidden="true"
>
  <svg
    class="ox-wave-ocean__svg"
    viewBox="0 0 2880 185"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    style="transform: {svgTransform};"
  >
    <defs>
      <!-- Back — éclairci (mix avec blanc) → contraste de "crête" -->
      <linearGradient id={g1} x1="0" y1="0" x2="0" y2="185" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   class="wo-stop-back" stop-opacity="0"/>
        <stop offset="40%"  class="wo-stop-back" stop-opacity="0.72"/>
        <stop offset="100%" class="wo-stop-back" stop-opacity="0.97"/>
      </linearGradient>
      <!-- Mid — ton intermédiaire -->
      <linearGradient id={g2} x1="0" y1="0" x2="0" y2="185" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   class="wo-stop-mid" stop-opacity="0"/>
        <stop offset="100%" class="wo-stop-mid" stop-opacity="0.89"/>
      </linearGradient>
      <!-- Front — EXACTEMENT bgColor à pleine opacité au bas → seam invisible -->
      <linearGradient id={g3} x1="0" y1="0" x2="0" y2="185" gradientUnits="userSpaceOnUse">
        <stop offset="0%"   class="wo-stop-front" stop-opacity="0"/>
        <stop offset="100%" class="wo-stop-front" stop-opacity="1"/>
      </linearGradient>
    </defs>

    <path class="wo-w1" d={PATHS.w1} fill="url(#{g1})"            style="animation-duration:{dur1};"/>
    <path class="wo-w2" d={PATHS.w2} fill="url(#{g2})" opacity="0.88" style="animation-duration:{dur2};"/>
    <path class="wo-w1" d={PATHS.w3} fill="url(#{g3})" opacity="0.92" style="animation-duration:{dur3};"/>
    <path class="wo-w2 wo-stroke" d={PATHS.w3s} fill="none" stroke-width="2.5" style="animation-duration:{dur3};"/>
  </svg>

  {#each oceanDrops as d, i (i)}
    <span
      class="wo-drop"
      style="left:{d.left}; bottom:{d.bot}; width:{d.size}; height:{d.size}; animation-delay:{d.delay}; animation-duration:{d.dur};"
    ></span>
  {/each}
</div>

<style>
  .ox-wave-ocean {
    position: relative;
    width: 100%;
    height: clamp(var(--wo-h-min, 70px), 13vw, var(--wo-h, 185px));
    overflow: hidden;
    pointer-events: none;
  }
  .ox-wave-ocean__svg {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200%;
    height: 100%;
    display: block;
    transform-origin: center bottom;
  }

  /* Couleurs — appliquées via CSS vars au lieu de color-mix inline pour
     que la palette explicite (passée en prop) soit aussi prise en charge. */
  .wo-stop-back  { stop-color: var(--wo-back); }
  .wo-stop-mid   { stop-color: var(--wo-mid); }
  .wo-stop-front { stop-color: var(--wo-front); }
  .wo-stroke     { stroke: var(--wo-stroke); }

  /* Animation — règles SCOPÉES (PAS de :global !).
     Bug observé : avec :global(.wo-w1) { animation: ... ox-wo-roll-a }
     Svelte scope le NOM dans la règle (→ s-XXX-ox-wo-roll-a) mais NE scope PAS
     la définition @keyframes. En scopant tout normalement, Svelte rename de
     manière cohérente la règle ET le @keyframes.

     Optimisations animation :
     - will-change: transform → couche GPU séparée → recompositing
     - animation-play-state: paused par défaut, running quand .is-visible
     - .is-static désactive complètement l'animation */
  .wo-w1 {
    animation: ox-wo-roll-a 20s linear infinite;
    transform-origin: left center;
    will-change: transform;
    animation-play-state: paused;
  }
  .wo-w2 {
    animation: ox-wo-roll-b 13s linear infinite;
    transform-origin: left center;
    will-change: transform;
    animation-play-state: paused;
  }
  .ox-wave-ocean.is-visible:not(.is-static) .wo-w1,
  .ox-wave-ocean.is-visible:not(.is-static) .wo-w2 {
    animation-play-state: running;
  }
  .ox-wave-ocean.is-static .wo-w1,
  .ox-wave-ocean.is-static .wo-w2 {
    animation: none;
    will-change: auto;
  }

  @keyframes ox-wo-roll-a {
    from { transform: translateX(0);    }
    to   { transform: translateX(-50%); }
  }
  @keyframes ox-wo-roll-b {
    from { transform: translateX(-50%); }
    to   { transform: translateX(0);    }
  }

  /* Particules — cachées <768px et en mode static.
     En mode flip, les drops sont en bas du conteneur → on les cache aussi
     car visuellement ils "remontent" depuis le vide en dessous de la vague. */
  .wo-drop {
    position: absolute;
    border-radius: 9999px;
    background: var(--wo-drop);
    z-index: 5;
    filter: blur(0.4px);
    will-change: transform, opacity;
    animation: ox-wo-rise linear infinite;
    animation-play-state: paused;
  }
  .ox-wave-ocean.is-visible:not(.is-static) .wo-drop {
    animation-play-state: running;
  }
  .ox-wave-ocean.is-static .wo-drop,
  .ox-wave-ocean.is-flipped .wo-drop {
    display: none;
  }
  @media (max-width: 767px) {
    .wo-drop { display: none; }
  }

  @keyframes ox-wo-rise {
    0%   { transform: translateY(0)     scale(1);   opacity: 0; }
    18%  { opacity: 1; }
    82%  { opacity: 0.55; }
    100% { transform: translateY(-88px) scale(0.2); opacity: 0; }
  }

  /* NOTE — pas de @media (prefers-reduced-motion: reduce) ici :
     la wave est purement décorative et son mouvement très doux ne
     justifie pas un black-out (cohérent avec le pattern home2). */
</style>
