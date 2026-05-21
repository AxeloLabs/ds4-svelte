<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxWaveOceanDouble
   * │ Transition entre 2 sections de couleurs différentes —
   * │ pile 2 OxWaveOcean :
   * │  - vague TOP (flippée) qui "descend" depuis topColor
   * │  - vague BOTTOM (normale) qui "monte" vers bottomColor
   * │ Le seam au centre est invisible car chaque vague utilise
   * │ exactement sa couleur de section au point de contact.
   * │
   * │ Usage typique :
   * │   <section bg=topColor>...</section>
   * │   <OxWaveOceanDouble topColor=... bottomColor=... />
   * │   <section bg=bottomColor>...</section>
   * └─────────────────────────────────────────────────────────┘
   */
  import OxWaveOcean from './OxWaveOcean.svelte'

  interface Props {
    topColor:    string  // bg de la section AU-DESSUS
    bottomColor: string  // bg de la section EN DESSOUS
    height?:     number
    heightMin?:  number
    speed?:      number
    shape?:      'calm' | 'normal' | 'wild'
    amplitude?:  number
    static?:     boolean
    drops?:      boolean
    dropColor?:  string
  }

  let {
    topColor,
    bottomColor,
    height    = 185,
    heightMin = 70,
    speed     = 20,
    shape     = 'wild',
    amplitude = 1,
    static:     isStatic = false,
    drops,
    dropColor,
  }: Props = $props()
</script>

<div class="ox-wave-ocean-double" data-ui="ox-wave-ocean-double"
     style="background:{topColor};">
  <!-- TOP : couleur du dessus, vague inversée → descend de topColor vers le seam -->
  <OxWaveOcean
    bgColor={topColor}
    flip
    {height} {heightMin} {speed} {shape} {amplitude}
    static={isStatic}
    drops={false}
  />
  <!-- BOTTOM : couleur du dessous, vague normale → monte du seam vers bottomColor -->
  <OxWaveOcean
    bgColor={bottomColor}
    {height} {heightMin} {speed} {shape} {amplitude}
    static={isStatic}
    {drops}
    {dropColor}
  />
</div>

<style>
  .ox-wave-ocean-double {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    /* Background = topColor : remplit la zone vide laissée par les vagues
       (transform-origin bottom + scaleY -1 sur la vague top → la moitié haute
       du conteneur top est vide). Le seam au centre des 2 OxWaveOcean est
       absorbé car bottom de TOP = topColor et top de BOTTOM = bottomColor. */
  }
</style>
