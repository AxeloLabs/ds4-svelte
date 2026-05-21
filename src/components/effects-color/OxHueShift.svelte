<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxHueShift — OKLCH hue-shifted scoreboard / list
   * │ Each item shifts lightness, chroma & hue progressively
   * │ Radial gradient background reacts to base hue
   * │ Inspired by argyleink/YzdEapM
   * └─────────────────────────────────────────────────────────┘
   */
  import { Users } from '@lucide/svelte'

  interface Item {
    label: string
    value: string | number
  }

  interface Props {
    /** Base hue (0-360) */
    hue?: number
    /** Title displayed in the header */
    title?: string
    /** List items — each gets progressively shifted color */
    items?: Item[]
    class?: string
  }

  let {
    hue = 230,
    title = 'Top 5 Players',
    items = [
      { label: 'Cyberduck', value: 404 },
      { label: 'Ladylucifer', value: 388 },
      { label: 'RetroPirate', value: 303 },
      { label: 'KRmonster', value: 260 },
      { label: 'Superfox', value: 222 },
    ],
    class: className = '',
  }: Props = $props()
</script>

<div
  class="ox-hue-shift {className}"
  data-ui="ox-hue-shift"
  style="--hue: {hue}"
>
  <div class="ox-hs-scoreboard">
    <header>
      <Users size={24} strokeWidth={1.5} />
      <h2>{title}</h2>
    </header>
    <ol>
      {#each items as item, idx}
        <li style="--i: {idx + 1}">
          <span class="number">{idx + 1}</span>
          <p>{item.label}</p>
          <span class="score">{item.value}</span>
        </li>
      {/each}
    </ol>
  </div>
</div>

<style>
  .ox-hue-shift {
    --primary: oklch(70% .2 var(--hue));
    --primary-highlight: oklch(97% .2 var(--hue));
    --header-bg: oklch(35% .01 200);
    --text: white;

    background: radial-gradient(
      circle at center,
      var(--primary-highlight),
      var(--primary)
    );
    padding: 2rem;
    display: grid;
    place-items: center;
    place-content: center;
    border-radius: inherit;
  }

  .ox-hs-scoreboard {
    border-radius: 10px;
    overflow: clip;
    box-shadow:
      3px 3px 2px oklch(0% .02 var(--hue) / 0.02),
      7px 7px 5px oklch(0% .02 var(--hue) / 0.03),
      13px 13px 10px oklch(0% .02 var(--hue) / 0.04),
      22px 22px 18px oklch(0% .02 var(--hue) / 0.07),
      42px 42px 33px oklch(0% .02 var(--hue) / 0.075),
      100px 100px 80px oklch(0% .02 var(--hue) / 0.1);
  }

  header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: var(--header-bg);
    color: var(--text);
  }

  header svg {
    inline-size: 2.5ch;
    color: var(--primary);
  }

  header h2 {
    margin: 0;
    font: 600 1.1rem/1.3 'Open Sans', system-ui, sans-serif;
  }

  ol {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li {
    --_bg: oklch(
      calc(75% - (var(--i) * 5%))
      calc(.2 - (var(--i) * .01))
      calc(var(--hue) - (var(--i) + 5))
    );
    padding: 1rem 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    background: var(--_bg);
    color: var(--text);
  }

  li p {
    flex: 1;
    inline-size: clamp(10ch, 50vw, 30ch);
    margin: 0;
    font: 400 1rem/1.3 'Open Sans', system-ui, sans-serif;
  }

  .number {
    aspect-ratio: 1;
    border-radius: 1000px;
    block-size: 3ch;
    font-size: .9rem;
    line-height: 1;
    display: inline-flex;
    place-items: center;
    place-content: center;
    background: var(--text);
    color: var(--_bg);
    font-weight: 700;
  }

  .score {
    font: 700 1rem/1 'Open Sans', system-ui, sans-serif;
    opacity: 0.85;
  }
</style>
