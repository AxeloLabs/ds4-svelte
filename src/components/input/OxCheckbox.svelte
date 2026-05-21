<script lang="ts">
  /**
   * OxCheckbox — DS-4 Checkbox
   * Implémentation native <input type="checkbox"> stylisée (accessibilité
   * gratuite, focus/keyboard built-in). Style MD3 : carré arrondi, check
   * blanc sur fond primary à l'état checked.
   *
   * Props:
   *   label         — texte du label (cliquable)
   *   checked       — boolean (bindable: bind:checked)
   *   indeterminate — boolean (état mixte pour group avec sélection partielle)
   *   disabled      — boolean
   *   error         — boolean — bordure rouge
   *   helper        — texte d'aide sous le label
   *   name          — name HTML pour formulaire
   *   value         — value HTML
   *
   * Forwarde tous les autres attributs natifs à <input>.
   */
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { Check, Minus } from '@lucide/svelte'

  interface Props extends Omit<HTMLInputAttributes, 'type' | 'checked'> {
    label?: string
    checked?: boolean
    indeterminate?: boolean
    disabled?: boolean
    error?: boolean
    helper?: string
  }

  let {
    label,
    checked = $bindable(false),
    indeterminate = false,
    disabled = false,
    error = false,
    helper,
    id,
    ...rest
  }: Props = $props()

  let inputEl = $state<HTMLInputElement | undefined>()
  const uid = $derived(id ?? `ox-cb-${Math.random().toString(36).slice(2, 9)}`)

  // Sync indeterminate avec le DOM (pas une vraie prop HTML, doit être set en JS)
  $effect(() => {
    if (inputEl) inputEl.indeterminate = indeterminate && !checked
  })
</script>

<label data-ui="ox-checkbox" class="ox-checkbox" class:ox-checkbox-disabled={disabled} class:ox-checkbox-error={error}>
  <span class="ox-checkbox-box">
    <input
      bind:this={inputEl}
      type="checkbox"
      id={uid}
      bind:checked
      {disabled}
      aria-invalid={error}
      aria-describedby={helper ? `${uid}-helper` : undefined}
      {...rest}
    />
    <span class="ox-checkbox-indicator" aria-hidden="true">
      {#if indeterminate && !checked}
        <Minus size={14} strokeWidth={2} />
      {:else}
        <Check size={14} strokeWidth={2.5} />
      {/if}
    </span>
  </span>
  {#if label}
    <span class="ox-checkbox-labels">
      <span class="ox-checkbox-label">{label}</span>
      {#if helper}<span id="{uid}-helper" class="ox-checkbox-helper">{helper}</span>{/if}
    </span>
  {/if}
</label>

<style>
  .ox-checkbox {
    display: inline-flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
    font: var(--ox-body-md);
    color: var(--ox-on-surface);
    user-select: none;
  }
  .ox-checkbox-disabled { cursor: not-allowed; opacity: 0.5; }

  .ox-checkbox-box {
    position: relative;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .ox-checkbox-box input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }
  .ox-checkbox-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 2px solid var(--ox-on-surface-variant);
    border-radius: var(--ox-shape-xs);
    background: transparent;
    color: transparent;
    transition:
      background var(--ox-duration-short2) var(--ox-easing-standard),
      border-color var(--ox-duration-short2) var(--ox-easing-standard);
  }
  .ox-checkbox-box input:checked + .ox-checkbox-indicator,
  .ox-checkbox-box input:indeterminate + .ox-checkbox-indicator {
    background: var(--ox-primary);
    border-color: var(--ox-primary);
    color: var(--ox-on-primary);
  }
  .ox-checkbox-box input:focus-visible + .ox-checkbox-indicator {
    outline: var(--ox-focus-ring);
    outline-offset: 2px;
  }
  .ox-checkbox-error .ox-checkbox-indicator { border-color: var(--ox-error); }
  .ox-checkbox-error .ox-checkbox-box input:checked + .ox-checkbox-indicator {
    background: var(--ox-error);
    border-color: var(--ox-error);
    color: var(--ox-on-error);
  }

  .ox-checkbox-labels { display: flex; flex-direction: column; gap: 2px; }
  .ox-checkbox-label { font: var(--ox-body-md); }
  .ox-checkbox-helper { font: var(--ox-body-sm); color: var(--ox-on-surface-variant); }
  .ox-checkbox-error .ox-checkbox-helper { color: var(--ox-error); }
</style>
