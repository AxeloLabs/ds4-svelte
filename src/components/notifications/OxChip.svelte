<script lang="ts">
  /**
   * OxChip — DS-4 Chip
   * CSS-powered (MD3 chip variants — no Zag.js needed)
   *
   * Props:
   *   variant  — 'assist' | 'filter' | 'input' (default: 'assist')
   *   label    — chip text (required)
   *   color    — accent color for assist variant (CSS color)
   *   selected — selected state for filter variant (bindable)
   *   onRemove — callback for input variant "✕" button
   */
  import { Check, X } from '@lucide/svelte'

  interface Props {
    variant?: 'assist' | 'filter' | 'input'
    size?: 'xs' | 'sm' | 'md'
    label: string
    color?: string
    selected?: boolean
    onRemove?: () => void
    onclick?: () => void
  }

  let {
    variant = 'assist',
    size = 'md',
    label,
    color,
    selected = $bindable(false),
    onRemove,
    onclick,
  }: Props = $props()

  function handleClick() {
    if (variant === 'filter') selected = !selected
    onclick?.()
  }
</script>

{#if variant === 'input'}
  <span class="ox-chip ox-chip-input" data-ui="ox-chip" class:ox-chip-xs={size === 'xs'} class:ox-chip-sm={size === 'sm'}>
    {label}
    {#if onRemove}
      <button class="ox-chip-remove" data-ui="chip-remove" onclick={onRemove} aria-label="Supprimer {label}"><X size={14} strokeWidth={2} /></button>
    {/if}
  </span>
{:else}
  <button
    class="ox-chip ox-chip-{variant}"
    data-ui="ox-chip"
    class:ox-chip-xs={size === 'xs'}
    class:ox-chip-sm={size === 'sm'}
    class:ox-chip-selected={selected}
    style={color ? `--chip-color:${color}` : ''}
    aria-pressed={variant === 'filter' ? selected : undefined}
    onclick={handleClick}
  >
    {#if variant === 'filter' && selected}<Check size={14} strokeWidth={2.5} />{/if}{label}
  </button>
{/if}

<style>
  .ox-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    padding: 0 12px;
    border-radius: var(--ox-shape-sm, 8px);
    font: 500 12px/1 system-ui;
    white-space: nowrap;
    transition: background 120ms, box-shadow 120ms;
    border: none;
    cursor: pointer;
  }

  /* ── Sizes ── */
  .ox-chip-sm { height: 26px; padding: 0 10px; font-size: 11px; border-radius: 6px; }
  .ox-chip-xs { height: 20px; padding: 0 6px;  font-size: 10px; border-radius: 4px; gap: 2px; }

  /* Assist — platform tag with accent color */
  .ox-chip-assist {
    background: var(--ox-surface-1, #F4EEFF);
    border: 1px solid var(--chip-color, var(--ox-outline-variant, #CAC4D0));
    color: var(--chip-color, var(--ox-on-surface, #1C1B1F));
  }
  .ox-chip-assist:hover {
    box-shadow: var(--ox-elevation-1,
      0 1px 3px 1px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
  }

  /* Filter — toggleable */
  .ox-chip-filter {
    background: var(--ox-surface-1, #F4EEFF);
    border: 1px solid var(--ox-outline, #79747E);
    color: var(--ox-on-surface-variant, #49454F);
  }
  .ox-chip-filter:hover {
    background: var(--ox-surface-2, #EDE8F5);
  }
  .ox-chip.ox-chip-selected {
    background: var(--ox-secondary-container, #E8DEF8);
    border-color: transparent;
    color: var(--ox-on-secondary-container, #1D192B);
  }

  /* Input — value chip with remove button */
  .ox-chip-input {
    background: var(--ox-surface-variant, #E7E0EC);
    border: 1px solid var(--ox-outline, #79747E);
    color: var(--ox-on-surface-variant, #49454F);
    cursor: default;
    padding-right: 6px;
  }

  .ox-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: none;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    font-size: 10px;
    padding: 0;
    border-radius: 50%;
    transition: background 120ms;
    line-height: 1;
  }
  .ox-chip-remove:hover {
    background: rgba(0,0,0,0.1);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RAIL MODE — CSS Container Queries (automatique)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */

  /* FOLD — chip compact centré (≤80px) */
  @container ox-toolbar (max-width: 80px) {
    .ox-chip {
      max-width: 44px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 6px;
      font-size: 9px;
      height: 24px;
      margin: auto;
    }
  }

  /* UNFOLD — chip full-width (≥81px) */
  @container ox-toolbar (min-width: 81px) {
    .ox-chip {
      margin: 4px 12px;
    }
  }
</style>
