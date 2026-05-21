<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxLetterpress — Letterpress / Debossed Text Effect      │
   * │ Texte pressé dans la surface via text-shadow layeré.    │
   * │ Inspiré par webagency2-app.web.app (.letterpress class) │
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   text        — contenu texte (ou slot children)
   *   size        — font-size px (default: 64)
   *   weight      — font-weight (default: 800)
   *   bg          — couleur de fond (default: #d1d5db gris clair)
   *   color       — couleur du texte (default: #4b5563 gris foncé)
   *   highlight   — ombre claire (en-dessous, default: rgba(255,255,255,.75))
   *   shadow      — ombre sombre (au-dessus, default: rgba(0,0,0,.75))
   *   offset      — décalage px des ombres (default: 1)
   *   variant     — preset: 'light' | 'dark' | 'stone' | 'slate' | 'raised'
   *   fontFamily  — police (default: system-ui)
   *   align       — text-align
   *   padding     — padding custom
   */
  import type { Snippet } from 'svelte'

  type Variant = 'light' | 'dark' | 'stone' | 'slate' | 'raised' | 'custom'

  interface Props {
    text?:       string
    size?:       number
    weight?:     number
    bg?:         string
    color?:      string
    highlight?:  string
    shadow?:     string
    offset?:     number
    variant?:    Variant
    fontFamily?: string
    align?:      'left' | 'center' | 'right'
    padding?:    string
    children?:   Snippet
  }

  // ── Presets ───────────────────────────────────────────
  const PRESETS: Record<Variant, { bg: string; color: string; highlight: string; shadow: string }> = {
    light:  { bg: '#d1d5db', color: '#4b5563', highlight: 'rgba(255,255,255,.75)', shadow: 'rgba(0,0,0,.75)' },
    dark:   { bg: '#1f2937', color: '#374151', highlight: 'rgba(255,255,255,.12)', shadow: 'rgba(0,0,0,.9)'  },
    stone:  { bg: '#a8a29e', color: '#57534e', highlight: 'rgba(255,255,255,.65)', shadow: 'rgba(0,0,0,.65)' },
    slate:  { bg: '#94a3b8', color: '#334155', highlight: 'rgba(255,255,255,.7)',  shadow: 'rgba(0,0,0,.7)'  },
    raised: { bg: '#d1d5db', color: '#4b5563', highlight: 'rgba(0,0,0,.35)',       shadow: 'rgba(255,255,255,.8)' },
    custom: { bg: '#d1d5db', color: '#4b5563', highlight: 'rgba(255,255,255,.75)', shadow: 'rgba(0,0,0,.75)' },
  }

  let {
    text,
    size       = 64,
    weight     = 800,
    bg,
    color,
    highlight,
    shadow,
    offset     = 1,
    variant    = 'light',
    fontFamily = 'system-ui, -apple-system, sans-serif',
    align      = 'left',
    padding    = '0.4em 0.6em',
    children,
  }: Props = $props()

  const preset = $derived(PRESETS[variant])

  const _bg        = $derived(bg        ?? preset.bg)
  const _color     = $derived(color     ?? preset.color)
  const _highlight = $derived(highlight ?? preset.highlight)
  const _shadow    = $derived(shadow    ?? preset.shadow)
</script>

<div
  class="ox-letterpress"
  style="
    --lp-bg:        {_bg};
    --lp-color:     {_color};
    --lp-highlight: {_highlight};
    --lp-shadow:    {_shadow};
    --lp-offset:    {offset}px;
    --lp-size:      {size}px;
    --lp-weight:    {weight};
    --lp-font:      {fontFamily};
    --lp-align:     {align};
    --lp-padding:   {padding};
  "
  data-ui="ox-letterpress"
  data-variant={variant}
>
  {#if children}
    {@render children()}
  {:else if text}
    {text}
  {/if}
</div>

<style>
  .ox-letterpress {
    display: inline-block;
    background:   var(--lp-bg);
    color:        var(--lp-color);
    font-size:    var(--lp-size);
    font-weight:  var(--lp-weight);
    font-family:  var(--lp-font);
    text-align:   var(--lp-align);
    padding:      var(--lp-padding);
    border-radius: var(--ox-shape-md, 8px);
    line-height:  1.1;
    letter-spacing: -0.01em;
    user-select: none;
    /* ─── THE EFFECT ─── */
    text-shadow:
      0px  var(--lp-offset)  var(--lp-offset)  var(--lp-highlight),
      0px  calc(-1 * var(--lp-offset))  var(--lp-offset)  var(--lp-shadow);
  }
</style>
