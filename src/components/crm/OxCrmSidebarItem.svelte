<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxCrmSidebarItem — DS-4 CRM Sidebar Row                │
   * │                                                         │
   * │ Item de sidebar CRM générique : avatar + nom +          │
   * │ description optionnelle + badge count + état selected.  │
   * │                                                         │
   * │ Props:                                                   │
   * │   id           — identifiant unique                     │
   * │   title        — nom principal                          │
   * │   imageUrl?    — URL avatar (null → initiale colorée)   │
   * │   description? — sous-titre (source, plateforme…)       │
   * │   badge?       — compteur affiché à droite (0 = caché)  │
   * │   selected?    — état actif (fond coloré)               │
   * │   accentColor? — couleur avatar initiale                │
   * │   onclick?     — callback click                         │
   * └─────────────────────────────────────────────────────────┘
   */

  interface Props {
    id: string
    title: string
    imageUrl?: string | null
    description?: string | null
    badge?: number | null
    selected?: boolean
    accentColor?: string
    onclick?: (id: string) => void
  }

  let {
    id,
    title,
    imageUrl = null,
    description = null,
    badge = null,
    selected = false,
    accentColor = 'var(--ox-primary, #6750A4)',
    onclick,
  }: Props = $props()

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // HELPERS
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  function initials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }
</script>

<button
  class="ox-crm-sidebar-item"
  class:selected
  data-ui="ox-crm-sidebar-item-{id}"
  onclick={() => onclick?.(id)}
>
  <!-- Indicateur sélection (barre gauche) -->
  <span class="ox-crm-sidebar-item-sel-bar" aria-hidden="true"></span>

  <!-- Avatar -->
  <span class="ox-crm-sidebar-item-avatar" style="--_accent:{accentColor}">
    {#if imageUrl}
      <img src={imageUrl} alt={title} class="ox-crm-sidebar-item-img" />
    {:else}
      <span class="ox-crm-sidebar-item-initials">{initials(title)}</span>
    {/if}
  </span>

  <!-- Texte -->
  <span class="ox-crm-sidebar-item-text">
    <span class="ox-crm-sidebar-item-title">{title}</span>
    {#if description}
      <span class="ox-crm-sidebar-item-desc">{description}</span>
    {/if}
  </span>

  <!-- Badge count -->
  {#if badge != null && badge > 0}
    <span class="ox-crm-sidebar-item-badge">{badge}</span>
  {/if}
</button>

<style>
  .ox-crm-sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 48px;
    padding: 6px 12px 6px 0;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    position: relative;
    transition: background 100ms;
    box-sizing: border-box;
  }

  .ox-crm-sidebar-item:hover {
    background: var(--ox-surface-2, #EDE8F3);
  }

  .ox-crm-sidebar-item.selected {
    background: color-mix(in srgb, var(--ox-primary, #6750A4) 10%, transparent);
  }

  /* Barre indicateur gauche (visible si selected) */
  .ox-crm-sidebar-item-sel-bar {
    position: absolute;
    left: 0;
    top: 4px;
    bottom: 4px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--ox-primary, #6750A4);
    opacity: 0;
    transition: opacity 100ms;
    flex-shrink: 0;
  }

  .ox-crm-sidebar-item.selected .ox-crm-sidebar-item-sel-bar {
    opacity: 1;
  }

  /* Avatar */
  .ox-crm-sidebar-item-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    flex-shrink: 0;
    overflow: hidden;
    margin-left: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--_accent) 20%, var(--ox-surface-3, #E0DAE8));
  }

  .ox-crm-sidebar-item-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .ox-crm-sidebar-item-initials {
    font: 600 12px system-ui;
    color: var(--_accent);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  /* Texte */
  .ox-crm-sidebar-item-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ox-crm-sidebar-item-title {
    font: 500 13px/1.2 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ox-crm-sidebar-item.selected .ox-crm-sidebar-item-title {
    font-weight: 600;
    color: var(--ox-primary, #6750A4);
  }

  .ox-crm-sidebar-item-desc {
    font: 400 11px/1.2 system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Badge count */
  .ox-crm-sidebar-item-badge {
    font: 600 10px/1 system-ui;
    background: var(--ox-primary, #6750A4);
    color: var(--ox-on-primary, #FFFFFF);
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
</style>
