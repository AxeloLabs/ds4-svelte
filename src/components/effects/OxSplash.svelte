<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxSplash — Edge glow statique (overlay fullscreen)
   * │
   * │ Affiché par-dessus toute la page quand `active=true`.
   * │ Glow color en périphérie (box-shadow inset), centre transparent.
   * │ 100% statique : aucun repaint après mount → quasi-zéro coût GPU.
   * │ Pointer-events:none → ne bloque jamais l'interaction user.
   * │ Wrap OxPortal → s'échappe du Shadow DOM (plugins).
   * │
   * │ Usage:
   * │   <OxSplash active={state.isProcessing} tone="rose" />
   * │   <OxSplash active tone="green" opacity={0.5} />
   * └─────────────────────────────────────────────────────────┘
   */
  import OxPortal from '../framework/OxPortal.svelte'

  type Tone = 'rose' | 'green'

  interface Props {
    /** Affiche/cache l'overlay */
    active?: boolean
    /** Couleur du glow périphérique. rose = Tinder, green = WhatsApp */
    tone?: Tone
    /** Intensité du glow 0–1 (default 0.35) */
    opacity?: number
    /** z-index (default 2147483645 = juste sous le confetti) */
    zIndex?: number
  }

  let {
    active = false,
    tone = 'rose',
    opacity = 0.35,
    zIndex = 2147483645,
  }: Props = $props()

  // Couleurs alignées sur les marques source : Tinder (rose) / WhatsApp (vert).
  const TONES: Record<Tone, string> = {
    rose:  '254, 60, 114',
    green: '37, 211, 102',
  }
</script>

{#if active}
  <OxPortal>
    <div
      class="ox-splash"
      data-ui="ox-splash"
      data-tone={tone}
      style="z-index: {zIndex}; --ox-splash-rgb: {TONES[tone]}; --ox-splash-a: {opacity};"
    ></div>
  </OxPortal>
{/if}

<style>
  .ox-splash {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: transparent;
    box-shadow:
      inset 0 0 60px 0   rgba(var(--ox-splash-rgb), calc(var(--ox-splash-a) * 1.0)),
      inset 0 0 160px 40px rgba(var(--ox-splash-rgb), calc(var(--ox-splash-a) * 0.45));
  }
</style>
