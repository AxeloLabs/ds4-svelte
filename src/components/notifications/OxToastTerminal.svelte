<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxToastTerminal
   * │ Toast variant styled as a terminal window.
   * │ Header with traffic lights (red = close), monospace
   * │ content with console-style colored lines.
   * └─────────────────────────────────────────────────────────┘
   */

  interface TerminalLine {
    text: string
    color?: string
    prefix?: string
  }

  interface Props {
    title?: string
    lines?: (string | TerminalLine)[]
    visible?: boolean
    class?: string
    style?: string
  }

  let {
    title = 'Terminal',
    lines = [],
    visible = $bindable(true),
    class: className = '',
    style = '',
  }: Props = $props()

  function close() {
    visible = false
  }

  function getLine(line: string | TerminalLine): TerminalLine {
    if (typeof line === 'string') return { text: line }
    return line
  }
</script>

{#if visible}
  <div
    class="ox-terminal-toast {className}"
    style={style}
    role="status"
    aria-live="polite"
    data-ui="ox-toast-terminal"
  >
    <!-- ▓▓ HEADER ▓▓ -->
    <div class="ox-terminal-toast__header">
      <div class="ox-terminal-toast__dots">
        <button
          class="ox-terminal-toast__dot ox-terminal-toast__dot--red"
          onclick={close}
          aria-label="Fermer"
          data-ui="toast-terminal-close"
        ></button>
        <span class="ox-terminal-toast__dot ox-terminal-toast__dot--yellow"></span>
        <span class="ox-terminal-toast__dot ox-terminal-toast__dot--green"></span>
      </div>
      {#if title}
        <span class="ox-terminal-toast__title">{title}</span>
      {/if}
    </div>

    <!-- ▓▓ BODY ▓▓ -->
    <!-- svelte-ignore block_empty -->
    <pre class="ox-terminal-toast__body"><code class="ox-terminal-toast__code">{#each lines as line, i}{@const l = getLine(line)}<span
            class="ox-terminal-toast__line"
            style={l.color ? `color:${l.color}` : ''}
          >{#if l.prefix}<span class="ox-terminal-toast__prefix">{l.prefix}</span>{/if}{l.text}</span>{#if i < lines.length - 1}
{/if}{/each}</code></pre>
  </div>
{/if}

<style>
  .ox-terminal-toast {
    border: 1px solid #27272a;
    border-radius: 12px;
    background: #0a0a0a;
    overflow: hidden;
    min-width: min(320px, calc(100vw - 32px));
    max-width: min(480px, calc(100vw - 32px));
    width: 100%;
    box-shadow:
      0 8px 30px rgba(0, 0, 0, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.3);
    animation: ox-terminal-in 250ms cubic-bezier(0.2, 0, 0, 1);
  }

  @keyframes ox-terminal-in {
    from { opacity: 0; transform: translateY(8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Header ── */
  .ox-terminal-toast__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid #27272a;
  }

  .ox-terminal-toast__dots {
    display: flex;
    gap: 8px;
  }

  .ox-terminal-toast__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    padding: 0;
    flex-shrink: 0;
  }

  .ox-terminal-toast__dot--red {
    background: #ef4444;
    cursor: pointer;
    transition: background 120ms, transform 120ms;
  }
  .ox-terminal-toast__dot--red:hover {
    background: #dc2626;
    transform: scale(1.15);
  }

  .ox-terminal-toast__dot--yellow {
    background: #eab308;
  }

  .ox-terminal-toast__dot--green {
    background: #22c55e;
  }

  .ox-terminal-toast__title {
    font: 500 13px/1 system-ui, sans-serif;
    color: #a1a1aa;
    flex: 1;
    text-align: center;
    margin-right: 44px;
  }

  /* ── Body ── */
  .ox-terminal-toast__body {
    margin: 0;
    padding: 16px;
    overflow-x: auto;
  }

  .ox-terminal-toast__code {
    display: grid;
    gap: 4px;
    font: 400 13px/1.5 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
    color: #e4e4e7;
  }

  .ox-terminal-toast__line {
    display: block;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .ox-terminal-toast__prefix {
    color: #a1a1aa;
    margin-right: 6px;
  }
</style>
