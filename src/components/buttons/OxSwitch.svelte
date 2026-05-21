<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxSwitch — DS-4 Switch (MD3)
   * │ Powered by @zag-js/switch
   * │ Ref: https://m3.material.io/components/switch/specs
   * └─────────────────────────────────────────────────────────┘
   */
  import * as zagSwitch from '@zag-js/switch'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { Check } from '@lucide/svelte'

  interface Props {
    id: string
    label?: string
    checked?: boolean
    disabled?: boolean
    accent?: string
    onCheckedChange?: (checked: boolean) => void
  }

  let {
    id,
    label = '',
    checked = $bindable(false),
    disabled = false,
    accent,
    onCheckedChange,
  }: Props = $props()

  const service = useMachine(zagSwitch.machine, () => ({
    id,
    checked,
    disabled,
    onCheckedChange: (d: { checked: boolean }) => {
      checked = d.checked
      onCheckedChange?.(d.checked)
    },
  }))

  const api = $derived(zagSwitch.connect(service, normalizeProps))

</script>

<label
  class="ox-switch"
  style={accent ? `--ox-sw-accent:${accent};--ox-sw-thumb-off-color:${accent}` : ''}
  data-ui="ox-switch"
  {...api.getRootProps()}
>
  <input {...api.getHiddenInputProps()} />
  <span class="ox-sw-track" {...api.getControlProps()}>
    <span class="ox-sw-thumb" {...api.getThumbProps()}>
      <Check class="ox-sw-icon" size={14} strokeWidth={3} />
    </span>
  </span>
  {#if label}
    <span class="ox-sw-label" {...api.getLabelProps()}>{label}</span>
  {/if}
</label>

<style>
  .ox-switch {
    --ox-sw-accent: var(--ox-primary, #6750A4);
    display: inline-flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    font-family: system-ui, sans-serif;
  }
  .ox-switch[data-disabled] { opacity: .38; cursor: not-allowed; pointer-events: none; }

  /* ── Track — 56×28 (longer, flatter than default MD3 52×32) ── */
  .ox-sw-track {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 56px;
    height: 28px;
    border-radius: 999px;
    background: var(--ox-surface-variant, #E7E0EC);
    border: 2px solid var(--ox-outline, #79747E);
    padding: 0;
    flex-shrink: 0;
    transition:
      background 200ms cubic-bezier(.2,0,0,1),
      border-color 200ms;
  }

  /* Track ON */
  [data-state="checked"] .ox-sw-track {
    background: var(--ox-sw-accent);
    border-color: var(--ox-sw-accent);
  }

  /* ── Thumb ── */
  .ox-sw-thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--ox-sw-thumb-off-color, var(--ox-outline, #79747E));
    flex-shrink: 0;
    margin-left: 4px;
    transition:
      transform 250ms cubic-bezier(.05,.7,.1,1),
      width 200ms cubic-bezier(.05,.7,.1,1),
      height 200ms cubic-bezier(.05,.7,.1,1),
      margin 200ms cubic-bezier(.05,.7,.1,1),
      background 200ms;
    box-shadow: 0 1px 3px rgba(0,0,0,.2);
  }

  /* Thumb ON — bigger, white, shifted right */
  [data-state="checked"] .ox-sw-thumb {
    transform: translateX(24px);
    width: 22px;
    height: 22px;
    margin-left: 2px;
    background: var(--ox-on-primary, #fff);
    box-shadow: 0 1px 4px rgba(0,0,0,.25);
  }

  /* Hover — grow thumb slightly */
  .ox-switch:hover:not([data-disabled]) .ox-sw-thumb {
    width: 18px;
    height: 18px;
    margin-left: 3px;
  }
  .ox-switch:hover:not([data-disabled]) [data-state="checked"] .ox-sw-thumb {
    width: 24px;
    height: 24px;
    margin-left: 1px;
  }

  /* Press — max size */
  .ox-switch:active:not([data-disabled]) .ox-sw-thumb {
    width: 22px;
    height: 22px;
    margin-left: 1px;
  }

  /* ── Checkmark icon ── */
  :global(.ox-sw-icon) {
    width: 0;
    height: 0;
    color: var(--ox-sw-accent);
    opacity: 0;
    transition: width 200ms, height 200ms, opacity 200ms;
  }
  [data-state="checked"] :global(.ox-sw-icon) {
    width: 14px;
    height: 14px;
    opacity: 1;
  }

  /* ── Label ── */
  .ox-sw-label {
    font: 400 14px/1.4 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     RAIL MODE — CSS Container Queries (automatique)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */

  /* FOLD — track seul, centré (≤80px) */
  @container ox-toolbar (max-width: 80px) {
    .ox-switch {
      justify-content: center;
      width: 48px;
      height: 44px;
    }
    .ox-sw-label { display: none; }
  }

  /* UNFOLD — track + label, full-width (≥81px) */
  @container ox-toolbar (min-width: 81px) {
    .ox-switch {
      width: 100%;
      justify-content: flex-start;
      padding: 0 12px;
      height: 40px;
      gap: 10px;
    }
    .ox-sw-label { font-size: 12px; }
  }
</style>
