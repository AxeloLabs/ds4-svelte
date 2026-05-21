<script lang="ts">
  /**
   * OxDialog — DS-4 Dialog / Modal
   * Powered by native HTML <dialog> element
   *
   * Props:
   *   open     — controlled open state (bindable)
   *   title    — dialog title
   *   children — dialog body content (Snippet)
   *   actions  — footer actions slot (Snippet, optional)
   *   onClose  — callback when dialog closes
   */
  import type { Snippet } from 'svelte'

  interface Props {
    open: boolean
    title: string
    children: Snippet
    actions?: Snippet
    onClose?: () => void
  }

  let {
    open = $bindable(false),
    title,
    children,
    actions,
    onClose,
  }: Props = $props()

  import { onMount } from 'svelte'

  let dialogEl = $state<HTMLDialogElement | undefined>(undefined)
  let mounted = $state(false)
  const titleId = `ox-dialog-title-${Math.random().toString(36).slice(2, 8)}`

  onMount(() => { mounted = true })

  $effect(() => {
    // Only run after mount — this prevents SSR/hydration from calling showModal()
    if (!mounted || !dialogEl) return
    if (open) {
      if (!dialogEl.open) dialogEl.showModal()
    } else {
      if (dialogEl.open) dialogEl.close()
    }
  })

  function handleClose() {
    open = false
    onClose?.()
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === dialogEl) handleClose()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialogEl}
  class="ox-dialog"
  data-ui="ox-dialog"
  aria-modal="true"
  aria-labelledby={titleId}
  onclick={handleBackdropClick}
  onclose={handleClose}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="ox-dialog-inner" onclick={(e) => e.stopPropagation()}>
    <div class="ox-dialog-header">
      <span id={titleId} class="ox-dialog-title">{title}</span>
      <button class="ox-dialog-close" data-ui="dialog-close" onclick={handleClose} aria-label="Fermer">✕</button>
    </div>

    <div class="ox-dialog-body">
      {@render children()}
    </div>

    {#if actions}
      <div class="ox-dialog-actions">
        {@render actions()}
      </div>
    {/if}
  </div>
</dialog>

<style>
  .ox-dialog {
    padding: 0;
    border: none;
    border-radius: var(--ox-shape-xl, 28px);
    background: var(--ox-surface, #FFFFFF);
    box-shadow: var(--ox-elevation-3,
      0 4px 8px 3px rgba(0,0,0,.15),
      0 1px 3px rgba(0,0,0,.3));
    width: min(480px, 90vw);
    max-height: 85vh;
    overflow: hidden;
    flex-direction: column;
    /* Center on screen */
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    /* Respect native dialog[open] — only show when open */
    display: none;
  }
  .ox-dialog[open] {
    display: flex;
    animation: ox-dialog-in 200ms cubic-bezier(0.2, 0, 0, 1);
  }

  @keyframes ox-dialog-in {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  /* Backdrop */
  .ox-dialog::backdrop {
    background: rgba(0,0,0,0.32);
  }

  /* Prevent default dialog outline */
  .ox-dialog:focus { outline: none; }

  .ox-dialog-inner {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-height: 85vh;
  }

  .ox-dialog-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 24px 24px 16px;
  }

  .ox-dialog-title {
    font: 400 24px/1.3 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    letter-spacing: -0.2px;
  }

  .ox-dialog-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: none;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    border-radius: 50%;
    font-size: 12px;
    flex-shrink: 0;
    transition: background 120ms;
  }
  .ox-dialog-close:hover {
    background: var(--ox-surface-variant, #E7E0EC);
  }

  .ox-dialog-body {
    padding: 0 24px 16px;
    overflow-y: auto;
    font: 400 14px/1.6 system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }

  .ox-dialog-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 24px 20px;
    border-top: 1px solid var(--ox-outline-variant, #CAC4D0);
  }
</style>
