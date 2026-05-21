<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxBurger — Animated hamburger ↔ close (×) button       │
   * │                                                         │
   * │ 3 bars CSS — transition smooth 300ms :                  │
   * │   fermé : ≡ (3 barres horizontales)                     │
   * │   ouvert : × (rotation 45° / -45°, barre centrale fade) │
   * │                                                         │
   * │ Props:                                                   │
   * │   open       — état courant (false = hamburger)         │
   * │   size       — taille container px (def 32)             │
   * │   barWidth   — largeur barre px (def 20)                │
   * │   color      — couleur barre CSS (def currentColor)     │
   * │   onclick    — callback click                           │
   * │   ariaLabel  — override label accessibilité             │
   * └─────────────────────────────────────────────────────────┘
   */

  interface Props {
    open?:      boolean
    size?:      number
    barWidth?:  number
    color?:     string
    onclick?:   () => void
    ariaLabel?: string
  }

  let {
    open      = false,
    size      = 32,
    barWidth  = 20,
    color     = 'currentColor',
    onclick,
    ariaLabel,
  }: Props = $props()
</script>

<button
  class="ox-burger"
  style="--_b-size:{size}px; --_b-bar-w:{barWidth}px; --_b-color:{color}"
  {onclick}
  type="button"
  aria-label={ariaLabel ?? (open ? 'Fermer le menu' : 'Ouvrir le menu')}
  aria-expanded={open}
  data-ui="ox-burger"
>
  <span class="ox-burger-bar" class:ox-b-top-open={open}></span>
  <span class="ox-burger-bar ox-burger-bar--mid" class:ox-b-mid-open={open}></span>
  <span class="ox-burger-bar" class:ox-b-bot-open={open}></span>
</button>

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     CONTAINER
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-burger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width:  var(--_b-size, 32px);
    height: var(--_b-size, 32px);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    flex-shrink: 0;
  }
  .ox-burger:focus-visible {
    outline: 2px solid var(--ox-primary, #6750A4);
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     BARS
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-burger-bar {
    width:  var(--_b-bar-w, 20px);
    height: 1px;
    background: var(--_b-color, currentColor);
    border-radius: 999px;
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
                opacity   300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Bar haut — rotate vers le bas → forme le \ du × */
  .ox-b-top-open {
    transform: translateY(6px) rotate(45deg);
  }

  /* Bar milieu — disparaît */
  .ox-burger-bar--mid {
    opacity: 1;
  }
  .ox-b-mid-open {
    opacity: 0;
    transform: scaleX(0);
  }

  /* Bar bas — rotate vers le haut → forme le / du × */
  .ox-b-bot-open {
    transform: translateY(-6px) rotate(-45deg);
  }
</style>
