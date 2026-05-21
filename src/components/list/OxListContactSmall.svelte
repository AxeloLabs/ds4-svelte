<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxListContactSmall — Contact list item for loop views
   * │ States: pending (white), active (yellow), ok (green),
   * │         skipped (gray), error (gray), fu_auto (orange)
   * │ Prefix: ❤️ if lastMsgFromContact = true
   * │ Suffix: action label (e.g. "— replying..." or "— reply OK")
   * └─────────────────────────────────────────────────────────┘
   */
  import type { Component } from 'svelte'
  import { Heart } from '@lucide/svelte'

  interface Props {
    name: string
    state?: 'pending' | 'active' | 'ok' | 'gray' | 'skipped' | 'error' | 'fu_auto'
    index?: number
    lastMsgFromContact?: boolean
    actionLabel?: string
    bold?: boolean
    avatarUrl?: string
    suffixIconComponent?: Component<any>
  }

  let { name, state = 'pending', index, lastMsgFromContact = false, actionLabel, bold = false, avatarUrl, suffixIconComponent }: Props = $props()
</script>

<li class="ox-nano-contact" data-ui="ox-list-contact-small" data-state={state} data-contact-idx={index} class:ox-nano-bold={bold}>
  {#if avatarUrl}
    <img class="ox-nano-avatar" src={avatarUrl} alt="" />
  {:else}
    <span class="ox-nano-avatar-placeholder">{name.charAt(0).toUpperCase()}</span>
  {/if}
  {#if lastMsgFromContact}
    <span class="ox-nano-heart" aria-hidden="true"><Heart size={12} strokeWidth={2} fill="currentColor" /></span>
  {/if}
  <span class="ox-nano-name">{name}</span>
  {#if suffixIconComponent}
    {@const SuffixC = suffixIconComponent}
    <span class="ox-nano-suffix-icon"><SuffixC size={14} strokeWidth={2} /></span>
  {/if}
  {#if actionLabel}
    <span class="ox-nano-action">— {actionLabel}</span>
  {/if}
  {#if index !== undefined}
    <span class="ox-nano-idx">{index}</span>
  {/if}
</li>

<style>
  .ox-nano-contact {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    min-height: 36px;
    border-bottom: 1px solid color-mix(in srgb, var(--ox-outline-variant, #CAC4D0) 50%, transparent);
    font-family: system-ui, sans-serif;
    list-style: none;
    transition: background 200ms;
  }
  .ox-nano-contact:last-child { border-bottom: none; }

  /* ── State backgrounds ── */
  .ox-nano-contact[data-state="pending"]  { background: var(--ox-surface, #ffffff); }
  .ox-nano-contact[data-state="active"]   { background: var(--ox-secondary-container, #fef9c3); }
  .ox-nano-contact[data-state="ok"]       { background: var(--ox-primary-container, #dcfce7); }
  .ox-nano-contact[data-state="gray"]     { background: var(--ox-surface-4, #334155); color: var(--ox-on-surface, #ffffff); }
  .ox-nano-contact[data-state="gray"] .ox-nano-name { color: var(--ox-on-surface, #ffffff); }
  .ox-nano-contact[data-state="gray"] .ox-nano-avatar-placeholder { background: var(--ox-surface-3, #475569); color: var(--ox-on-surface-variant, #cbd5e1); }
  .ox-nano-contact[data-state="gray"] .ox-nano-action { color: var(--ox-on-surface-variant, #cbd5e1); }
  .ox-nano-contact[data-state="gray"] .ox-nano-idx { color: var(--ox-on-surface-variant, #cbd5e1); }
  .ox-nano-contact[data-state="skipped"]  { background: var(--ox-surface-1, #f3f4f6); }
  .ox-nano-contact[data-state="error"]    { background: var(--ox-surface-1, #f3f4f6); }
  .ox-nano-contact[data-state="fu_auto"]  { background: #fff7ed; }
  .ox-nano-contact[data-state="fu_auto"] .ox-nano-action { color: #ea580c; font-weight: 600; }

  .ox-nano-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }
  .ox-nano-avatar-placeholder {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--ox-surface-2, #e5e7eb);
    color: var(--ox-on-surface-variant, #6b7280);
    font: 600 11px/24px system-ui;
    text-align: center;
    flex-shrink: 0;
  }
  .ox-nano-heart {
    flex-shrink: 0;
    font-size: 12px;
    line-height: 1;
  }
  .ox-nano-suffix-icon {
    flex-shrink: 0;
    font-size: 14px;
    line-height: 1;
    color: var(--ox-primary, #22c55e);
  }
  .ox-nano-name {
    flex: 1;
    font: 400 13px/18px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ox-nano-bold .ox-nano-name { font-weight: 600; }
  .ox-nano-action {
    font: 400 11px/18px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: auto;
    text-align: right;
  }
  .ox-nano-contact[data-state="active"] .ox-nano-action {
    color: var(--ox-on-secondary-container, #92400e);
    font-weight: 500;
  }
  .ox-nano-contact[data-state="ok"] .ox-nano-action {
    color: var(--ox-on-primary-container, #166534);
    font-weight: 500;
  }
  .ox-nano-idx {
    font: 500 10px/1 monospace;
    color: var(--ox-on-surface-variant, #49454F);
    flex-shrink: 0;
  }
</style>
