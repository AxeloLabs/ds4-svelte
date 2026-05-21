<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxCrmCalendarItem — Generic sidebar item (CRM calendar)
   * │ Avatar (image or initials) + title + description + link
   * │ Usable standalone or inside OxCrmCalendar
   * └─────────────────────────────────────────────────────────┘
   */
  import { ExternalLink } from '@lucide/svelte'

  interface Props {
    id: string
    title: string
    imageUrl?: string | null
    description?: string | null
    link?: string | null
    accentColor?: string
  }

  let {
    id,
    title,
    imageUrl = null,
    description = null,
    link = null,
    accentColor = 'var(--ox-primary, #6750A4)',
  }: Props = $props()

  let initial = $derived(title.charAt(0).toUpperCase())
</script>

<div class="ox-ccal-item" data-ui="ox-crm-calendar-item" style="--item-color: {accentColor}">
  {#if imageUrl}
    <img src={imageUrl} alt="" class="ox-ccal-item-avatar" />
  {:else}
    <div class="ox-ccal-item-avatar ox-ccal-item-avatar-fallback">{initial}</div>
  {/if}

  <div class="ox-ccal-item-body">
    <div class="ox-ccal-item-title">{title}</div>
    {#if description}
      <div class="ox-ccal-item-desc">{description}</div>
    {/if}
  </div>

  {#if link}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <a
      href={link}
      target="_blank"
      rel="noopener"
      class="ox-ccal-item-link"
      onclick={(e) => e.stopPropagation()}
      title="Ouvrir"
    >
      <ExternalLink size={13} strokeWidth={2} />
    </a>
  {/if}
</div>

<style>
  .ox-ccal-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    background: var(--ox-surface, #fff);
    box-sizing: border-box;
    overflow: hidden;
  }

  .ox-ccal-item-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex-shrink: 0;
    object-fit: cover;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  }
  .ox-ccal-item-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--item-color, var(--ox-primary, #6750A4));
    color: var(--ox-on-primary, #fff);
    font: 700 11px system-ui;
  }

  .ox-ccal-item-body {
    min-width: 0;
    flex: 1;
  }
  .ox-ccal-item-title {
    font: 600 12px/1.3 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ox-ccal-item-desc {
    font: 400 10px/1.2 system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  .ox-ccal-item-link {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--ox-primary, #6750A4);
    text-decoration: none;
    opacity: 0.45;
    transition: opacity 120ms;
  }
  .ox-ccal-item-link:hover { opacity: 1; }
</style>
