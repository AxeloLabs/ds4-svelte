<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxCard — DS-4 Card (MD3)
   * │ Ref: https://m3.material.io/components/cards/specs
   * │ 3 variants: elevated, filled, outlined
   * │ Interactive with onclick (hover state layer + press)
   * └─────────────────────────────────────────────────────────┘
   */
  import type { Snippet } from 'svelte'

  interface Props {
    variant?: 'elevated' | 'filled' | 'outlined'
    onclick?: () => void
    children: Snippet
    style?: string
    classes?: string
    id?: string
    class?: string
  }

  let {
    variant = 'elevated',
    onclick,
    children,
    style = '',
    classes = '',
    id,
    class: className = '',
  }: Props = $props()

  const isInteractive = $derived(onclick !== undefined)
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  {id}
  class="ox-card ox-card-{variant} {classes} {className}"
  data-ui="ox-card"
  class:ox-card-interactive={isInteractive}
  {onclick}
  role={isInteractive ? 'button' : undefined}
  tabindex={isInteractive ? 0 : undefined}
  {style}
>
  {@render children()}
</div>

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     BASE — MD3: shape-md (12px), color on-surface
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-card {
    border-radius: var(--ox-shape-md, 12px);
    overflow: hidden;
    position: relative;
    color: var(--ox-on-surface, #1C1B1F);
    font-family: system-ui, sans-serif;
    transition: box-shadow 200ms cubic-bezier(0.2, 0, 0, 1);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ELEVATED — surface-1, elevation-1
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-card-elevated {
    background: var(--ox-surface-1, #F4EEFF);
    box-shadow: var(--ox-elevation-1,
      0 1px 3px 1px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     FILLED — surface-variant, no shadow
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-card-filled {
    background: var(--ox-surface-variant, #E7E0EC);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     OUTLINED — surface, 1px outline-variant
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-card-outlined {
    background: var(--ox-surface, #FFFBFE);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     INTERACTIVE — state layer, cursor, press
     MD3: hover = elevation+1, state layer 8%
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-card-interactive {
    cursor: pointer;
  }

  /* State layer via ::after */
  .ox-card-interactive::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: transparent;
    transition: background 120ms;
    pointer-events: none;
  }
  .ox-card-interactive:hover::after {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
  }
  .ox-card-interactive:active::after {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 12%, transparent);
  }

  /* Elevation bump on hover */
  .ox-card-elevated.ox-card-interactive:hover {
    box-shadow: var(--ox-elevation-2,
      0 2px 6px 2px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
  }
  .ox-card-filled.ox-card-interactive:hover,
  .ox-card-outlined.ox-card-interactive:hover {
    box-shadow: var(--ox-elevation-1,
      0 1px 3px 1px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
  }

  /* Press feedback */
  .ox-card-interactive:active {
    transform: scale(0.99);
  }

  /* Focus visible */
  .ox-card-interactive:focus-visible {
    outline: 2px solid var(--ox-primary, #6750A4);
    outline-offset: 2px;
  }
</style>
