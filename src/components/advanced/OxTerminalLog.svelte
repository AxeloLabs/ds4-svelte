<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxTerminalLog — Terminal-style log viewer
   * │ No lib dependency — pure CSS + ANSI color parsing
   * │ Supports wrap/no-wrap toggle, auto-scroll, clear
   * └─────────────────────────────────────────────────────────┘
   */

  import { tick } from 'svelte'

  const TIME_COLORS_DARK = [
    '#fff9c4', '#ffe082', '#ffd54f', '#ffca28', '#ffb300',
    '#ffa000', '#ff8f00', '#ff6f00', '#e65100', '#bf360c',
  ]
  const TIME_COLORS_LIGHT = [
    '#92400e', '#78350f', '#b45309', '#d97706', '#c2410c',
    '#9a3412', '#7c2d12', '#6d3206', '#a16207', '#854d0e',
  ]
  let timeColorIdx = 0

  const C_DARK: Record<string, string> = {
    '30': '#45475a', '31': '#f38ba8', '32': '#a6e3a1', '33': '#f9e2af',
    '34': '#89b4fa', '35': '#cba6f7', '36': '#94e2d5', '37': '#bac2de',
    '90': '#585b70', '91': '#f38ba8', '92': '#a6e3a1', '93': '#f9e2af',
    '94': '#89b4fa', '95': '#cba6f7', '96': '#94e2d5', '97': '#a6adc8',
  }
  const C_LIGHT: Record<string, string> = {
    '30': '#4c4f69', '31': '#d20f39', '32': '#40a02b', '33': '#df8e1d',
    '34': '#1e66f5', '35': '#8839ef', '36': '#179299', '37': '#4c4f69',
    '90': '#8c8fa1', '91': '#d20f39', '92': '#40a02b', '93': '#df8e1d',
    '94': '#1e66f5', '95': '#8839ef', '96': '#179299', '97': '#6c6f85',
  }

  interface Props {
    lines?: string[]
    wrap?: boolean
    autoScroll?: boolean
    reversed?: boolean
    maxLines?: number
    theme?: 'dark' | 'light'
    class?: string
  }

  let {
    lines = $bindable([]),
    wrap = $bindable(false),
    autoScroll = $bindable(true),
    reversed = $bindable(false),
    maxLines = 5000,
    theme = 'dark',
    class: className = '',
  }: Props = $props()

  let preEl: HTMLPreElement | undefined = $state()

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // ANSI → HTML  (FG + BG + bold + dim + 256-color)
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  // Standard BG codes (41-47, 100-106) → hex
  const BG_STD: Record<string, string> = {
    '41': '#c0392b', '42': '#27ae60', '43': '#e67e22', '44': '#2980b9',
    '45': '#8e44ad', '46': '#16a085', '47': '#95a5a6',
    '100': '#7f8c8d', '101': '#e74c3c', '102': '#2ecc71', '103': '#f39c12',
    '104': '#3498db', '105': '#9b59b6', '106': '#1abc9c',
  }
  // 256-color index → hex (values used by the gateway logger)
  const C256: Record<string, string> = {
    // Couleurs LIGNE par acteur (gateway logger paintLine)
    '35':  '#00af5f', // vert moyen saturé — ZAPAX
    '75':  '#5fafff', // bleu clair — CRM
    '120': '#87ff87', // vert pâle — legacy
    '178': '#d7af00', // jaune foncé / or — SYSTEM
    '212': '#ff87d7', // rose pâle — TINAX
    '244': '#808080', // gris — GATEWAY
    // Legacy / chat / palettes existantes
    '37':  '#179299', // TEAL
    '54':  '#5f0087', // DARK_PURPLE
    '60':  '#5f5f87', // SLATE
    '63':  '#5f5fff', // INDIGO
    '117': '#87d7ff', // SKY
    '118': '#87ff00', // LIME
    '121': '#87ffaf', // MINT
    '130': '#af5f00', // BROWN
    '135': '#af5fff', // VIOLET
    '162': '#d70087', // DARK_FUSHIA
    '205': '#ff5faf', // PINK
    '208': '#ff8700', // ORANGE
    '209': '#ff875f', // CORAL
    '220': '#ffd700', // GOLD
  }

  function ansiToHtml(str: string): string {
    const CFG = theme === 'light' ? C_LIGHT : C_DARK
    const TIME_COLORS = theme === 'light' ? TIME_COLORS_LIGHT : TIME_COLORS_DARK

    let fg: string | null = null
    let bg: string | null = null
    let bold = false
    let dim = false
    let spanOpen = false
    let out = ''

    function closeSpan() {
      if (spanOpen) { out += '</span>'; spanOpen = false }
    }

    function emitSpan() {
      closeSpan()
      const s: string[] = []
      if (bg)   s.push(`background:${bg}`)
      if (fg)   s.push(`color:${fg}`)
      if (bold) s.push('font-weight:700')
      if (dim)  s.push('opacity:0.6')
      if (s.length) { out += `<span style="${s.join(';')}">`;  spanOpen = true }
    }

    for (const part of str.split(/(\x1b\[[0-9;]*m)/)) {
      const m = part.match(/^\x1b\[([0-9;]*)m$/)
      if (m) {
        const codes = m[1].split(';')
        // Accumulate all codes in this sequence, then emit once
        let nfg: string | null = fg, nbg: string | null = bg, nbold: boolean = bold, ndim: boolean = dim
        let i = 0
        while (i < codes.length) {
          const code = codes[i]
          if (code === '0' || code === '') {
            nfg = null; nbg = null; nbold = false; ndim = false
          } else if (code === '1') {
            nbold = true
          } else if (code === '2') {
            ndim = true
          } else if (code === '38' && codes[i + 1] === '5' && codes[i + 2] !== undefined) {
            nfg = C256[codes[i + 2]] ?? null; i += 2
          } else if (code === '48' && codes[i + 1] === '5' && codes[i + 2] !== undefined) {
            nbg = C256[codes[i + 2]] ?? null; i += 2
          } else if (CFG[code]) {
            nfg = CFG[code]
          } else if (BG_STD[code]) {
            nbg = BG_STD[code]
          }
          i++
        }
        if (nfg !== fg || nbg !== bg || nbold !== bold || ndim !== dim) {
          fg = nfg; bg = nbg; bold = nbold; dim = ndim
          emitSpan()
        }
      } else {
        const escaped = part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        out += escaped.replace(/\d{2}:\d{2}:\d{2}/g, (ts) => {
          const color = TIME_COLORS[timeColorIdx % TIME_COLORS.length]
          timeColorIdx++
          return `<span style="color:${color};font-weight:600">${ts}</span>`
        })
      }
    }
    closeSpan()
    return out
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // PUBLIC API
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  function scrollToEdge() {
    if (!preEl) return
    if (!reversed && !autoScroll) return
    tick().then(() => {
      if (!preEl) return
      preEl.scrollTop = reversed ? 0 : preEl.scrollHeight
    })
  }

  export function append(newLines: string[]) {
    lines = [...lines, ...newLines]
    if (lines.length > maxLines) lines = lines.slice(-maxLines)
    scrollToEdge()
  }

  export function reset(newLines: string[] = []) {
    timeColorIdx = 0
    lines = newLines
    scrollToEdge()
  }

  export function clear() {
    timeColorIdx = 0
    lines = []
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // HTTP STATUS LINE COLORING
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  function lineStatusClass(line: string): string {
    const clean = line.replace(/\x1b\[[0-9;]*m/g, '')
    // HTTP status codes
    const m = clean.match(/\b([2345]\d{2})\b/)
    if (m) {
      const d = m[1][0]
      if (d === '5') return 'oxl-5xx'
      if (d === '4') return 'oxl-4xx'
      if (d === '2') return 'oxl-2xx'
    }
    // Warn / error keywords
    if (/\b(error|err|exception)\b/i.test(clean)) return 'oxl-error'
    if (/\b(warn|warning)\b/i.test(clean)) return 'oxl-warn'
    return ''
  }

  // Detect manual scroll → disable auto-scroll
  function onScroll() {
    if (!preEl) return
    if (reversed) {
      autoScroll = preEl.scrollTop < 40
    } else {
      autoScroll = preEl.scrollHeight - preEl.scrollTop - preEl.clientHeight < 40
    }
  }
</script>

<pre
  class="ox-terminal-log {className}"
  class:ox-terminal-log-wrap={wrap}
  class:ox-terminal-log-light={theme === 'light'}
  bind:this={preEl}
  onscroll={onScroll}
  data-ui="ox-terminal-log"
><code>{#each reversed ? [...lines].reverse() : lines as line}<span class="oxl-line {lineStatusClass(line)}">{@html ansiToHtml(line)}</span>{/each}</code></pre>

<style>
  .ox-terminal-log {
    margin: 0;
    padding: 8px 12px;
    overflow: auto;
    font: 400 12px/1.5 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
    color: #cdd6f4;
    background: #1e1e2e;
    white-space: pre;
    min-height: 100px;
    flex: 1;
  }

  .ox-terminal-log code {
    font: inherit;
    color: inherit;
  }

  .ox-terminal-log-wrap {
    white-space: pre-wrap;
    word-break: break-all;
  }

  /* Scrollbar — dark theme */
  .ox-terminal-log::-webkit-scrollbar { width: 8px; height: 8px; }
  .ox-terminal-log::-webkit-scrollbar-track { background: #1e1e2e; }
  .ox-terminal-log::-webkit-scrollbar-thumb { background: #45475a; border-radius: 4px; }
  .ox-terminal-log::-webkit-scrollbar-thumb:hover { background: #585b70; }

  /* Scrollbar — light theme */
  .ox-terminal-log-light::-webkit-scrollbar-track { background: #dcdcdc; }
  .ox-terminal-log-light::-webkit-scrollbar-thumb { background: #a0a0b0; }
  .ox-terminal-log-light::-webkit-scrollbar-thumb:hover { background: #80809a; }

  /* Light theme base */
  .ox-terminal-log-light {
    color: #1e1e2e;
    background: #dcdcdc;
  }

  /* HTTP status line coloring */
  .oxl-line { display: block; padding-left: 4px; margin-left: -4px; }
  .oxl-5xx {
    background: linear-gradient(90deg, rgba(210,40,40,0.22) 0%, rgba(180,30,30,0.10) 100%);
    border-left: 3px solid #f38ba8;
    color: #ffb3b3;
  }
  .oxl-4xx {
    background: linear-gradient(90deg, rgba(200,140,20,0.20) 0%, rgba(180,120,0,0.08) 100%);
    border-left: 3px solid #f9e2af;
    color: #ffe5a0;
  }
  .oxl-2xx {
    background: linear-gradient(90deg, rgba(60,120,210,0.15) 0%, rgba(40,100,200,0.05) 100%);
    border-left: 3px solid #89b4fa;
    color: #b8d8ff;
  }

  /* Warn / error line highlight */
  .oxl-error {
    background: linear-gradient(90deg, rgba(210,40,40,0.22) 0%, rgba(180,30,30,0.10) 100%);
    border-left: 3px solid #f38ba8;
  }
  .oxl-warn {
    background: linear-gradient(90deg, rgba(220,180,0,0.25) 0%, rgba(200,160,0,0.10) 100%);
    border-left: 3px solid #f9e2af;
  }
  .ox-terminal-log-light .oxl-error {
    background: linear-gradient(90deg, rgba(210,40,40,0.12) 0%, rgba(180,30,30,0.05) 100%);
    border-left: 3px solid #b91c1c;
  }
  .ox-terminal-log-light .oxl-warn {
    background: linear-gradient(90deg, rgba(180,130,0,0.15) 0%, rgba(160,110,0,0.06) 100%);
    border-left: 3px solid #b45309;
  }

  /* HTTP status line coloring — light theme */
  .ox-terminal-log-light .oxl-5xx {
    background: linear-gradient(90deg, rgba(210,40,40,0.12) 0%, rgba(180,30,30,0.05) 100%);
    border-left: 3px solid #b91c1c;
    color: #991b1b;
  }
  .ox-terminal-log-light .oxl-4xx {
    background: linear-gradient(90deg, rgba(180,90,0,0.12) 0%, rgba(160,80,0,0.05) 100%);
    border-left: 3px solid #b45309;
    color: #92400e;
  }
  .ox-terminal-log-light .oxl-2xx {
    background: linear-gradient(90deg, rgba(30,80,200,0.10) 0%, rgba(20,70,180,0.04) 100%);
    border-left: 3px solid #2563eb;
    color: #1d4ed8;
  }
</style>
