<script lang="ts">
  /**
   * OxToast — DS-4 Snackbar / Toast
   * Standalone component for inline doc previews and one-off notifications.
   * For app-wide toast stack, use OxToaster + createOxToaster from ds4-svelte.
   *
   * Props:
   *   message  — toast text (required)
   *   variant  — 'default' | 'error' (default: 'default')
   *   action   — optional action button label
   *   onAction — callback when action button clicked
   *   visible  — show/hide (bindable, default true)
   */
  interface Props {
    message: string
    variant?: 'default' | 'error'
    action?: string
    onAction?: () => void
    visible?: boolean
  }

  import { onMount } from 'svelte'

  let {
    message,
    variant = 'default',
    action,
    onAction,
    visible = $bindable(true),
  }: Props = $props()

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && visible) {
      visible = false
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  })
</script>

{#if visible}
  <div
    class="ox-toast ox-toast-{variant}"
    role="status"
    aria-live="polite"
    data-ui="ox-toast"
  >
    <span class="ox-toast-msg">{message}</span>
    {#if action}
      <button
        class="ox-toast-action"
        onclick={() => { onAction?.(); visible = false }}
      >{action}</button>
    {/if}
  </div>
{/if}

<style>
  .ox-toast {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
    border-radius: var(--ox-shape-xs, 4px);
    box-shadow: var(--ox-elevation-3,
      0 4px 8px 3px rgba(0,0,0,.15),
      0 1px 3px rgba(0,0,0,.3));
    min-height: 48px;
    font-family: system-ui, sans-serif;
    max-width: min(480px, calc(100vw - 32px));
    width: 100%;
    animation: ox-toast-in 200ms cubic-bezier(0.2,0,0,1);
  }

  @keyframes ox-toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Default — surface inversée (dark) */
  .ox-toast-default {
    background: var(--ox-on-surface, #1C1B1F);
    color: var(--ox-surface, #FFFBFE);
  }

  /* Error — error-container */
  .ox-toast-error {
    background: var(--ox-error-container, #F9DEDC);
    color: var(--ox-on-error-container, #410E0B);
  }

  .ox-toast-msg {
    font: 400 14px/1.4 system-ui;
    flex: 1;
  }

  .ox-toast-action {
    background: none;
    border: none;
    cursor: pointer;
    font: 500 12px/1 system-ui;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: var(--ox-shape-xs, 4px);
    flex-shrink: 0;
    transition: background 120ms;
  }

  /* Action color per variant */
  .ox-toast-default .ox-toast-action {
    color: var(--ox-primary-container, #EADDFF);
  }
  .ox-toast-default .ox-toast-action:hover {
    background: rgba(255,255,255,0.1);
  }
  .ox-toast-error .ox-toast-action {
    color: var(--ox-primary, #6750A4);
  }
  .ox-toast-error .ox-toast-action:hover {
    background: rgba(103,80,164,0.08);
  }
</style>
