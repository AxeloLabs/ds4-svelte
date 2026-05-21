<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxPasswordInput — Password field with visibility toggle
   * │ Powered by @zag-js/password-input
   * └─────────────────────────────────────────────────────────┘
   */
  import * as passwordInput from '@zag-js/password-input'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { EyeIcon, EyeOffIcon } from '@lucide/svelte'

  interface Props {
    id: string
    label?: string
    placeholder?: string
  }

  let { id, label = 'Password', placeholder = '' }: Props = $props()

  const service = useMachine(passwordInput.machine, () => ({ id }))
  const api = $derived(passwordInput.connect(service, normalizeProps))
</script>

<div class="ox-password" data-ui="ox-password-input" {...api.getRootProps()}>
  {#if label}
    <label class="ox-password-label" {...api.getLabelProps()}>{label}</label>
  {/if}
  <div class="ox-password-control" {...api.getControlProps()}>
    <input class="ox-password-input" {placeholder} {...api.getInputProps()} />
    <button class="ox-password-toggle" type="button" {...api.getVisibilityTriggerProps()}>
      <span {...api.getIndicatorProps()}>
        {#if api.visible}
          <EyeIcon size={18} strokeWidth={2} />
        {:else}
          <EyeOffIcon size={18} strokeWidth={2} />
        {/if}
      </span>
    </button>
  </div>
</div>

<style>
  .ox-password { width: 100%; font-family: system-ui, sans-serif; }
  .ox-password-label {
    display: block;
    font: 500 13px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    margin-bottom: 6px;
  }
  .ox-password-control {
    display: flex;
    align-items: center;
    border: 1px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-xs, 4px);
    background: var(--ox-surface, #FFFBFE);
    transition: border-color 150ms;
  }
  .ox-password-control:focus-within {
    border-color: var(--ox-primary, #6750A4);
    border-width: 2px;
  }
  .ox-password-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font: 400 16px/24px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    padding: 14px 16px;
    min-width: 0;
  }
  .ox-password-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    border-radius: 50%;
    margin-right: 4px;
    transition: background 120ms;
  }
  .ox-password-toggle:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
  }
</style>
