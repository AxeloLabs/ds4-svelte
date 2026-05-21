<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxCrmCalendarBadge — Round interaction badge (CRM calendar)
   * │ Colored dot with count + hover popup listing interactions
   * │ self = primary (violet) · contact = green
   * └─────────────────────────────────────────────────────────┘
   */

  export interface CrmInteraction {
    date: string         // 'YYYY-MM-DD'
    description: string
    initiator: 'self' | 'contact'
  }

  interface Props {
    interactions: CrmInteraction[]
    dateStr: string
  }

  let { interactions, dateStr }: Props = $props()

  let hovered = $state(false)

  const SELF_COLOR = 'var(--ox-primary, #6750A4)'
  const CONTACT_COLOR = '#16a34a'

  let hasContact = $derived(interactions.some(i => i.initiator === 'contact'))
  let hasSelf    = $derived(interactions.some(i => i.initiator === 'self'))
  let isMixed    = $derived(hasContact && hasSelf)
  let badgeColor = $derived(hasContact ? CONTACT_COLOR : SELF_COLOR)
  let count      = $derived(interactions.length)

  let dateLabel = $derived((() => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number)
      return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    } catch { return dateStr }
  })())
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div data-ui="ox-crm-calendar-badge"
  class="badge-wrap"
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
>
  <span
    class="badge-dot"
    class:badge-mixed={isMixed}
    style={isMixed ? '' : `background:${badgeColor};box-shadow:0 0 5px color-mix(in srgb,${badgeColor} 55%,transparent)`}
  >
    {#if count > 1}
      <span class="badge-num">{count}</span>
    {/if}
  </span>

  {#if hovered}
    <div class="badge-popup">
      <div class="popup-date">{dateLabel}</div>
      <div class="popup-sep"></div>
      {#each interactions as ia}
        <div class="popup-row">
          <span
            class="popup-icon"
            class:popup-icon-self={ia.initiator === 'self'}
            class:popup-icon-contact={ia.initiator === 'contact'}
          >
            {ia.initiator === 'self' ? '↗' : '↙'}
          </span>
          <span class="popup-desc">{ia.description}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .badge-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .badge-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.15s;
  }
  .badge-wrap:hover .badge-dot { transform: scale(1.2); }

  .badge-mixed {
    background: linear-gradient(135deg, var(--ox-primary, #6750A4) 50%, #16a34a 50%);
  }

  .badge-num {
    font-size: 9px;
    font-weight: 800;
    color: #fff;
    line-height: 1;
  }

  /* ── popup ── */
  .badge-popup {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    min-width: 200px;
    max-width: 300px;
    padding: 10px 12px;
    background: var(--ox-surface, #fff);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-md, 12px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.13);
    font-size: 12px;
    color: var(--ox-on-surface, #1C1B1F);
    pointer-events: none;
  }
  .popup-date {
    font: 700 13px/1.2 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
  }
  .popup-sep {
    border-top: 1px solid var(--ox-outline-variant, #CAC4D0);
    margin: 6px 0;
  }
  .popup-row {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 3px 0;
  }
  .popup-icon {
    font-size: 11px;
    font-weight: 700;
    width: 14px;
    flex-shrink: 0;
    line-height: 1.5;
  }
  .popup-icon-self    { color: var(--ox-primary, #6750A4); }
  .popup-icon-contact { color: #16a34a; }
  .popup-desc {
    font-size: 12px;
    color: var(--ox-on-surface-variant, #49454F);
    line-height: 1.5;
  }
</style>
