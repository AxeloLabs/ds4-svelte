<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxSnackbar — MD3 Snackbar
   * │ Ref specs: https://m3.material.io/components/snackbar/specs
   * │ Ref guidelines: https://m3.material.io/components/snackbar/guidelines
   * │
   * │ Single-line or two-line message bar at bottom of screen.
   * │ Inverse surface, optional action + close button.
   * │ Auto-dismiss after duration. One visible at a time.
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   message    — text content (required)
   *   action     — action button label (optional)
   *   closeable  — show close icon (default: false)
   *   duration   — auto-dismiss ms (default: 4000, 0 = manual)
   *   visible    — show/hide (bindable)
   *   onAction   — callback on action click
   *   onDismiss  — callback on dismiss (auto or manual)
   */
  import { onMount } from 'svelte'
  import { X } from '@lucide/svelte'

  interface Props {
    message: string
    action?: string
    closeable?: boolean
    duration?: number
    visible?: boolean
    onAction?: () => void
    onDismiss?: () => void
  }

  let {
    message,
    action,
    closeable = false,
    duration = 4000,
    visible = $bindable(true),
    onAction,
    onDismiss,
  }: Props = $props()

  let leaving = $state(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function dismiss() {
    leaving = true
    setTimeout(() => {
      visible = false
      leaving = false
      onDismiss?.()
    }, 200)
  }

  function startTimer() {
    if (timer) clearTimeout(timer)
    if (duration > 0 && visible) {
      timer = setTimeout(dismiss, duration)
    }
  }

  function handleAction() {
    onAction?.()
    dismiss()
  }

  // Pause timer on hover
  function handleMouseEnter() {
    if (timer) { clearTimeout(timer); timer = null }
  }
  function handleMouseLeave() {
    startTimer()
  }

  $effect(() => {
    if (visible) {
      leaving = false
      startTimer()
    }
    return () => { if (timer) clearTimeout(timer) }
  })
</script>

{#if visible}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="ox-snackbar"
    class:ox-snackbar-leaving={leaving}
    class:ox-snackbar-with-action={!!action}
    class:ox-snackbar-with-close={closeable}
    role="status"
    aria-live="polite"
    data-ui="ox-snackbar"
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    <span class="ox-snackbar-text">{message}</span>

    {#if action}
      <button class="ox-snackbar-action" onclick={handleAction} data-ui="snackbar-action">
        {action}
      </button>
    {/if}

    {#if closeable}
      <button class="ox-snackbar-close" onclick={dismiss} aria-label="Dismiss" data-ui="snackbar-close">
        <X size={20} strokeWidth={2} />
      </button>
    {/if}
  </div>
{/if}

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     MD3 SNACKBAR — Specs
     Height: 48px single-line
     Padding: 16px left, 8px right (with close), 16px right (no close)
     Radius: 4px
     Background: inverse-surface
     Color: inverse-on-surface
     Elevation: level 3
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-snackbar {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 16px;
    border-radius: 4px;
    background: var(--ox-inverse-surface, #313033);
    color: var(--ox-inverse-on-surface, #F4EFF4);
    box-shadow:
      0 1px 3px 0 rgba(0,0,0,0.3),
      0 4px 8px 3px rgba(0,0,0,0.15);
    font-family: system-ui, sans-serif;
    max-width: 560px;
    min-width: 288px;
    animation: ox-snackbar-in 250ms cubic-bezier(0.2, 0, 0, 1);
  }

  .ox-snackbar-with-close {
    padding-right: 8px;
  }

  /* ── Leave animation ── */
  .ox-snackbar-leaving {
    animation: ox-snackbar-out 200ms cubic-bezier(0.4, 0, 1, 1) forwards;
  }

  @keyframes ox-snackbar-in {
    from { opacity: 0; transform: translateY(100%) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes ox-snackbar-out {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(100%); }
  }

  /* ── Text — body-md (14/20) ── */
  .ox-snackbar-text {
    flex: 1;
    font: 400 14px/20px system-ui;
    padding: 14px 0;
    min-width: 0;
  }

  /* ── Action button — inverse-primary ── */
  .ox-snackbar-action {
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    font: 500 14px/1 system-ui;
    letter-spacing: 0.1px;
    color: var(--ox-inverse-primary, #D0BCFF);
    padding: 8px 12px;
    border-radius: 4px;
    transition: background 120ms;
    white-space: nowrap;
  }
  .ox-snackbar-action:hover {
    background: rgba(208, 188, 255, 0.12);
  }
  .ox-snackbar-action:active {
    background: rgba(208, 188, 255, 0.2);
  }

  /* ── Close button — inverse-on-surface ── */
  .ox-snackbar-close {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ox-inverse-on-surface, #F4EFF4);
    border-radius: 50%;
    padding: 0;
    transition: background 120ms;
  }
  .ox-snackbar-close:hover {
    background: rgba(244, 239, 244, 0.12);
  }
</style>
