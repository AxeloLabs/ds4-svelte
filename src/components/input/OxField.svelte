<script lang="ts">
  /**
   * OxField — DS-4 Text Field
   * MD3 text input with floating label
   *
   * Props:
   *   label      — floating label text
   *   variant    — 'filled' | 'outlined' (default: 'filled')
   *   value      — bindable input value
   *   type       — input type (default: 'text')
   *   disabled   — boolean
   *   error      — error message string (shows error state if set)
   *   helper     — helper text below field
   *   required   — boolean
   */

  interface Props {
    label?: string
    variant?: 'filled' | 'outlined'
    value?: string
    type?: string
    disabled?: boolean
    error?: string
    helper?: string
    required?: boolean
    placeholder?: string
  }

  let {
    label = '',
    variant = 'filled',
    value = $bindable(''),
    type = 'text',
    disabled = false,
    error,
    helper,
    required = false,
    placeholder = ' ',
  }: Props = $props()

  let focused = $state(false)
  let hasValue = $derived(value.length > 0)
  const fieldId   = `ox-field-${Math.random().toString(36).slice(2, 10)}`
  const supportId = `${fieldId}-support`
</script>

{#if variant === 'filled'}
  <div
    class="ox-field ox-field-filled"
    class:ox-field-focused={focused}
    class:ox-field-has-value={hasValue}
    class:ox-field-error={!!error}
    class:ox-field-disabled={disabled}
    data-ui="ox-field"
  >
    {#if label}
      <label class="ox-field-label" for={fieldId}>{label}{#if required}<span class="ox-field-req">*</span>{/if}</label>
    {/if}
    <input
      id={fieldId}
      class="ox-field-input"
      {type}
      {disabled}
      {placeholder}
      required={required || undefined}
      aria-required={required || undefined}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={(error || helper) ? supportId : undefined}
      bind:value
      onfocus={() => focused = true}
      onblur={() => focused = false}
    />
    <div class="ox-field-line"></div>
    <div class="ox-field-line-active"></div>
  </div>
{:else}
  <div
    class="ox-field ox-field-outlined"
    class:ox-field-focused={focused}
    class:ox-field-has-value={hasValue}
    class:ox-field-error={!!error}
    class:ox-field-disabled={disabled}
    data-ui="field-outlined"
  >
    {#if label}
      <label class="ox-field-label-outlined" for={fieldId}>{label}{#if required}<span class="ox-field-req">*</span>{/if}</label>
    {/if}
    <input
      id={fieldId}
      class="ox-field-input-outlined"
      {type}
      {disabled}
      {placeholder}
      required={required || undefined}
      aria-required={required || undefined}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={(error || helper) ? supportId : undefined}
      bind:value
      onfocus={() => focused = true}
      onblur={() => focused = false}
    />
  </div>
{/if}

{#if error}
  <p id={supportId} class="ox-field-support ox-field-support-error" role="alert">{error}</p>
{:else if helper}
  <p id={supportId} class="ox-field-support">{helper}</p>
{/if}

<style>
  /* ── SHARED ── */
  .ox-field {
    position: relative;
    width: 100%;
  }
  .ox-field-disabled {
    opacity: 0.38;
    pointer-events: none;
  }
  .ox-field-req {
    color: var(--ox-error);
    margin-left: 2px;
  }

  /* Placeholder visible only when label has floated (focused) — sinon il se superpose au label en position basse */
  .ox-field-input::placeholder,
  .ox-field-input-outlined::placeholder {
    color: transparent;
  }
  .ox-field-focused .ox-field-input::placeholder,
  .ox-field-focused .ox-field-input-outlined::placeholder {
    color: var(--ox-on-surface-variant);
    opacity: 0.7;
  }

  /* ── FILLED VARIANT ── */
  .ox-field-filled {
    background: var(--ox-surface-variant, #E7E0EC);
    border-radius: var(--ox-shape-xs, 4px) var(--ox-shape-xs, 4px) 0 0;
    padding: 8px 16px 0;
    min-height: 56px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .ox-field-filled .ox-field-label {
    position: absolute;
    top: 16px;
    left: 16px;
    font: var(--ox-body-lg, 400 16px/24px system-ui);
    color: var(--ox-on-surface-variant);
    pointer-events: none;
    transition: all 150ms cubic-bezier(0.2, 0, 0, 1);
    transform-origin: left top;
  }

  .ox-field-filled.ox-field-focused .ox-field-label,
  .ox-field-filled.ox-field-has-value .ox-field-label {
    top: 6px;
    font-size: 12px;
    line-height: 16px;
    color: var(--ox-primary);
  }
  .ox-field-filled.ox-field-has-value:not(.ox-field-focused) .ox-field-label {
    color: var(--ox-on-surface-variant);
  }
  .ox-field-filled.ox-field-error .ox-field-label {
    color: var(--ox-error) !important;
  }

  .ox-field-filled .ox-field-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font: var(--ox-body-lg, 400 16px/24px system-ui);
    color: var(--ox-on-surface);
    padding: 12px 0 8px;
    caret-color: var(--ox-primary);
  }
  .ox-field-filled.ox-field-error .ox-field-input {
    caret-color: var(--ox-error);
  }

  .ox-field-line {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 1px;
    background: var(--ox-on-surface-variant);
  }
  .ox-field-line-active {
    position: absolute; bottom: 0; left: 50%; right: 50%;
    height: 2px;
    background: var(--ox-primary);
    transition: left 200ms cubic-bezier(0.2, 0, 0, 1),
                right 200ms cubic-bezier(0.2, 0, 0, 1);
  }
  .ox-field-focused .ox-field-line-active {
    left: 0;
    right: 0;
  }
  .ox-field-error .ox-field-line-active {
    background: var(--ox-error);
    left: 0;
    right: 0;
  }

  /* ── OUTLINED VARIANT ── */
  .ox-field-outlined {
    position: relative;
    min-height: 56px;
    display: flex;
    align-items: center;
  }

  .ox-field-outlined .ox-field-label-outlined {
    position: absolute;
    top: 16px;
    left: 16px;
    font: var(--ox-body-lg, 400 16px/24px system-ui);
    color: var(--ox-on-surface-variant);
    pointer-events: none;
    transition: all 150ms cubic-bezier(0.2, 0, 0, 1);
    background: var(--ox-surface, #fff);
    padding: 0;
  }

  .ox-field-outlined.ox-field-focused .ox-field-label-outlined,
  .ox-field-outlined.ox-field-has-value .ox-field-label-outlined {
    top: -8px;
    font-size: 12px;
    line-height: 16px;
    padding: 0 4px;
    color: var(--ox-primary);
  }
  .ox-field-outlined.ox-field-has-value:not(.ox-field-focused) .ox-field-label-outlined {
    color: var(--ox-on-surface-variant);
  }
  .ox-field-outlined.ox-field-error .ox-field-label-outlined {
    color: var(--ox-error) !important;
  }

  .ox-field-outlined .ox-field-input-outlined {
    width: 100%;
    border: 1px solid var(--ox-outline);
    border-radius: var(--ox-shape-xs, 4px);
    outline: none;
    background: transparent;
    font: var(--ox-body-lg, 400 16px/24px system-ui);
    color: var(--ox-on-surface);
    padding: 16px;
    caret-color: var(--ox-primary);
    transition: border-color 150ms;
  }
  .ox-field-outlined.ox-field-focused .ox-field-input-outlined {
    border-color: var(--ox-primary);
    border-width: 2px;
    padding: 15px;
  }
  .ox-field-outlined.ox-field-error .ox-field-input-outlined {
    border-color: var(--ox-error);
    caret-color: var(--ox-error);
  }

  /* ── SUPPORT TEXT ── */
  .ox-field-support {
    font: var(--ox-body-sm, 400 12px/16px system-ui);
    color: var(--ox-on-surface-variant);
    padding: 4px 16px 0;
    margin: 0;
  }
  .ox-field-support-error {
    color: var(--ox-error);
  }
</style>
