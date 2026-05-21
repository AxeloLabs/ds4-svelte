<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxWave — SVG Wave Section Separator                     │
   * │ 4 couches SVG animées en parallax (moveForever).        │
   * │ Source : .waves / .parallax — webagency2-app.web.app    │
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   bgColor    — couleur du fond de la section (default: #7C3AED)
   *   waveColor  — couleur des vagues (default: #ffffff)
   *   height     — hauteur de la zone contenu en px (default: 200)
   *   speed      — vitesse de base en secondes (default: 10)
   *   flip       — inverser la vague (vague vers le haut) (default: false)
   *   children   — contenu affiché dans la zone bgColor
   */
  import type { Snippet } from 'svelte'

  interface Props {
    bgColor?:   string
    waveColor?: string
    height?:    number
    speed?:     number
    flip?:      boolean
    children?:  Snippet
  }

  let {
    bgColor   = '#7C3AED',
    waveColor = '#ffffff',
    height    = 200,
    speed     = 10,
    flip      = false,
    children,
  }: Props = $props()

  // Unique ID to avoid SVG defs collision when plusieurs instances
  const uid = Math.random().toString(36).slice(2, 8)
  const waveId = `ox-wave-${uid}`
</script>

<div
  class="ox-wave"
  class:ox-wave--flip={flip}
  style="--wave-bg:{bgColor};--wave-color:{waveColor};--wave-height:{height}px;--wave-speed:{speed}s;"
  data-ui="ox-wave"
>
  <!-- Content zone -->
  {#if children}
    <div class="ox-wave__content">
      {@render children()}
    </div>
  {:else}
    <div class="ox-wave__content ox-wave__content--empty"></div>
  {/if}

  <!-- SVG wave separator -->
  <svg
    class="ox-wave__svg"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 24 150 28"
    preserveAspectRatio="none"
    shape-rendering="auto"
    aria-hidden="true"
  >
    <defs>
      <path
        id={waveId}
        d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
      />
    </defs>
    <g class="ox-wave__parallax">
      <use href="#{waveId}" x="48" y="0" fill={waveColor} fill-opacity="0.3" />
      <use href="#{waveId}" x="48" y="3" fill={waveColor} fill-opacity="0.5" />
      <use href="#{waveId}" x="48" y="5" fill={waveColor} fill-opacity="0.7" />
      <use href="#{waveId}" x="48" y="7" fill={waveColor} fill-opacity="1"   />
    </g>
  </svg>
</div>

<style>
  .ox-wave {
    position: relative;
    background: var(--wave-bg);
    width: 100%;
    overflow: hidden;
  }

  /* Content zone */
  .ox-wave__content {
    min-height: var(--wave-height);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 24px 0;
    position: relative;
    z-index: 1;
  }
  .ox-wave__content--empty {
    min-height: var(--wave-height);
  }

  /* SVG wave */
  .ox-wave__svg {
    display: block;
    position: relative;
    width: 100%;
    height: 60px;
    /* Push up slightly to overlap content bottom */
    margin-top: -4px;
  }

  /* Flip variant : vague vers le haut */
  .ox-wave--flip .ox-wave__svg {
    transform: rotate(180deg);
  }

  /* Parallax animation — 4 layers, speeds ×1, ×1.4, ×1.8, ×2.5 */
  .ox-wave__parallax > use {
    animation: ox-move-forever var(--wave-speed) cubic-bezier(.55,.5,.45,.5) infinite;
  }
  .ox-wave__parallax > use:nth-child(1) {
    animation-duration: calc(var(--wave-speed) * 0.7);
    animation-delay: -2s;
  }
  .ox-wave__parallax > use:nth-child(2) {
    animation-duration: var(--wave-speed);
    animation-delay: -3s;
  }
  .ox-wave__parallax > use:nth-child(3) {
    animation-duration: calc(var(--wave-speed) * 1.3);
    animation-delay: -4s;
  }
  .ox-wave__parallax > use:nth-child(4) {
    animation-duration: calc(var(--wave-speed) * 2);
    animation-delay: -5s;
  }

  @keyframes ox-move-forever {
    0%   { transform: translate3d(-90px, 0, 0); }
    100% { transform: translate3d(85px, 0, 0);  }
  }
</style>
