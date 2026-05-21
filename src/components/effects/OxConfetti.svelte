<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxConfetti — Celebration confetti burst
   * │ Inspired by magicui.design/docs/components/confetti
   * │ Pure CSS + JS — no external dependency
   * │ Call fire() to trigger a burst
   * └─────────────────────────────────────────────────────────┘
   */

  import { onMount } from 'svelte'

  interface Props {
    /** Number of confetti particles */
    count?: number
    /** Duration in ms */
    duration?: number
    /** Colors palette */
    colors?: string[]
  }

  let { count = 120, duration = 3000, colors = ['#FD5068', '#25D366', '#6750A4', '#F59E0B', '#3B82F6', '#EC4899', '#22C55E'] }: Props = $props()

  let container: HTMLDivElement
  let particles: HTMLDivElement[] = []

  export function fire() {
    if (!container) return
    // Clean previous
    for (const p of particles) p.remove()
    particles = []

    // Use viewport center (works in shadow DOM since container is position:fixed inset:0)
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      el.className = 'ox-confetti-particle'
      const color = colors[Math.floor(Math.random() * colors.length)]
      const angle = Math.random() * Math.PI * 2
      const velocity = 200 + Math.random() * 350
      const dx = Math.cos(angle) * velocity
      const dy = Math.sin(angle) * velocity - 180 // bias upward
      const rot = Math.random() * 720 - 360
      const size = 6 + Math.random() * 8
      const shape = Math.random() > 0.5 ? '50%' : '0'

      Object.assign(el.style, {
        position: 'absolute',
        left: cx + 'px',
        top: cy + 'px',
        width: size + 'px',
        height: size * (Math.random() > 0.3 ? 1.5 : 1) + 'px',
        background: color,
        borderRadius: shape,
        pointerEvents: 'none',
        zIndex: '2147483647',
        '--dx': dx + 'px',
        '--dy': dy + 'px',
        '--rot': rot + 'deg',
        animationDuration: duration + 'ms',
      })

      container.appendChild(el)
      particles.push(el)
    }

    // Cleanup after animation
    setTimeout(() => {
      for (const p of particles) p.remove()
      particles = []
    }, duration + 100)
  }
</script>

<div class="ox-confetti-container" bind:this={container} data-ui="ox-confetti">
</div>

<style>
  .ox-confetti-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483647;
    overflow: visible;
  }

  :global(.ox-confetti-particle) {
    animation: ox-confetti-fall var(--duration, 2500ms) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  @keyframes ox-confetti-fall {
    0% {
      transform: translate(0, 0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translate(var(--dx, 100px), var(--dy, 200px)) rotate(var(--rot, 360deg));
      opacity: 0;
    }
  }
</style>
