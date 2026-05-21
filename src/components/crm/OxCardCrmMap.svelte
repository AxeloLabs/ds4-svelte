<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxCardCrmMap — Compact persona card (CRM /map unlocatable)
   * │ 36x36 avatar (green border if whatsapp/phone) + first name
   * │ + action buttons (fav, target, mark-delete, heart_broken, delete_forever)
   * └─────────────────────────────────────────────────────────┘
   */
  import { Star, Triangle, Trash, HeartCrack, Trash2 } from '@lucide/svelte'

  interface Props {
    persona: {
      id: string
      displayName: string
      avatar?: string | null
      phone?: string | null
      platforms: string[]
      markedForDeletion?: boolean
      isFavorite?: boolean
      isTarget?: boolean
      lastDirection?: 'in' | 'out' | null
    }
    avatarUrl?: string | null
    onMarkDelete?: () => void
    onToggleFavorite?: () => void
    onToggleTarget?: () => void
    onDelete?: () => void
    onDeleteMatch?: () => void
  }

  let { persona, avatarUrl = null, onMarkDelete, onToggleFavorite, onToggleTarget, onDelete, onDeleteMatch }: Props = $props()

  const cardBg = $derived(
    persona.lastDirection === 'out' ? '#dbeafe' :
    persona.lastDirection === 'in'  ? '#fce7f3' : 'transparent'
  )

  const isWhatsapp = $derived(persona.platforms.includes('whatsapp'))
  const isTinder   = $derived(persona.platforms.includes('tinder'))
  const hasPhone   = $derived(!!persona.phone)
  const borderColor = $derived(
    isWhatsapp ? '#16a34a' : hasPhone ? '#86efac' : '#d1d5db'
  )
  const fallbackColor = $derived(isTinder ? '#ec4899' : '#22c55e')
  const initial = $derived((persona.displayName ?? '?').charAt(0))
  const firstName = $derived((persona.displayName ?? '?').split(' ')[0])
</script>

<div class="ox-map-card" data-ui="ox-card-crm-map" title={persona.displayName} style="background: {cardBg}; border-radius: 8px; padding: 2px">
  {#if avatarUrl}
    <img src={avatarUrl} alt="" class="ox-map-avatar" style="border-color: {borderColor}" />
  {:else}
    <div class="ox-map-avatar-fallback" style="border-color: {borderColor}; color: {fallbackColor}">{initial}</div>
  {/if}
  <span class="ox-map-name">{firstName}</span>

  <!-- Actions -->
  <div class="ox-map-actions">
    {#if onToggleFavorite}
      <button
        class="ox-map-btn"
        class:ox-map-btn-active={persona.isFavorite}
        onclick={(e) => { e.stopPropagation(); onToggleFavorite?.() }}
        data-ui="btn-map-fav-{persona.id}"
        title={persona.isFavorite ? 'Retirer favoris' : 'Favori'}
      >
        <Star size={11} strokeWidth={2} fill={persona.isFavorite ? 'currentColor' : 'none'} />
      </button>
    {/if}
    {#if onToggleTarget}
      <button
        class="ox-map-btn"
        class:ox-map-btn-active-err={persona.isTarget}
        onclick={(e) => { e.stopPropagation(); onToggleTarget?.() }}
        data-ui="btn-map-target-{persona.id}"
        title={persona.isTarget ? 'Retirer cible' : 'Cible'}
      >
        <Triangle size={11} strokeWidth={2} fill={persona.isTarget ? 'currentColor' : 'none'} />
      </button>
    {/if}
    {#if onMarkDelete}
      <button
        class="ox-map-delete"
        class:ox-map-delete-active={persona.markedForDeletion}
        onclick={(e) => { e.stopPropagation(); onMarkDelete?.() }}
        data-ui="btn-mark-delete-{persona.id}"
        title={persona.markedForDeletion ? 'Untag delete' : 'Tag delete'}
      >
        <Trash size={11} strokeWidth={2} fill={persona.markedForDeletion ? 'currentColor' : 'none'} />
      </button>
    {/if}
    {#if isTinder && onDeleteMatch}
      <button
        class="ox-map-btn ox-map-btn-unmatch"
        onclick={(e) => { e.stopPropagation(); onDeleteMatch?.() }}
        data-ui="btn-map-unmatch-{persona.id}"
        title="Supprimer match Tinder"
      >
        <HeartCrack size={11} strokeWidth={2} />
      </button>
    {/if}
    {#if onDelete}
      <button
        class="ox-map-btn ox-map-btn-del-forever"
        onclick={(e) => {
          e.stopPropagation()
          if (typeof window !== 'undefined' && !window.confirm(`SUPPRESSION DEFINITIVE de ${persona.displayName} ?`)) return
          onDelete?.()
        }}
        data-ui="btn-map-del-{persona.id}"
        title="Supprimer définitivement"
      >
        <Trash2 size={11} strokeWidth={2} />
      </button>
    {/if}
  </div>
</div>

<style>
  .ox-map-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .ox-map-avatar,
  .ox-map-avatar-fallback {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 2px solid;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    flex-shrink: 0;
  }
  .ox-map-avatar {
    object-fit: cover;
  }
  .ox-map-avatar-fallback {
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font: 700 16px system-ui;
  }
  .ox-map-name {
    font: 500 9px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    max-width: 52px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }

  /* Actions */
  .ox-map-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1px;
    flex-wrap: wrap;
  }
  .ox-map-btn {
    padding: 2px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ox-outline, #79747E);
    border-radius: 3px;
    display: flex;
    align-items: center;
    opacity: 0.6;
    transition: opacity 120ms;
  }
  .ox-map-btn:hover { opacity: 1; background: rgba(0,0,0,0.05); }
  .ox-map-btn-active { color: #f59e0b; opacity: 1; }
  .ox-map-btn-active-err { color: #dc2626; opacity: 1; }
  .ox-map-btn-unmatch { color: #FD5068; opacity: 0.7; }
  .ox-map-btn-unmatch:hover { opacity: 1; }
  .ox-map-btn-del-forever { color: #dc2626; opacity: 0.6; }
  .ox-map-btn-del-forever:hover { opacity: 1; background: #fef2f2; }

  .ox-map-delete {
    padding: 2px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ox-outline, #79747E);
    border-radius: 3px;
    display: flex;
    align-items: center;
    opacity: 0.6;
  }
  .ox-map-delete:hover { opacity: 1; background: #fef2f2; }
  .ox-map-delete-active { color: #ffffff; background: #000000 !important; opacity: 1; }
</style>
