<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxCardCrmCalendar — Compact persona row card (CRM /calendar)
   * │ Avatar + name + platform dot + time ago + action buttons
   * │ timeBg : couleur de fond gradient selon ancienneté msg
   * └─────────────────────────────────────────────────────────┘
   */
  import { Phone, Star, Triangle, Trash, HeartCrack, Trash2 } from '@lucide/svelte'

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
    }
    avatarUrl?: string | null
    timeLabel?: string
    platformColors: Record<string, string>
    nameMaxWidth?: number
    bounce?: boolean
    timeBg?: string
    whatsappUrl?: string | null
    profileUrl?: string | null
    onMarkDelete?: () => void
    onToggleFavorite?: () => void
    onToggleTarget?: () => void
    onDelete?: () => void
    onDeleteMatch?: () => void
  }

  let {
    persona,
    avatarUrl = null,
    timeLabel = '',
    platformColors,
    nameMaxWidth = 160,
    bounce = false,
    timeBg = 'transparent',
    whatsappUrl = null,
    profileUrl = null,
    onMarkDelete,
    onToggleFavorite,
    onToggleTarget,
    onDelete,
    onDeleteMatch,
  }: Props = $props()

  const bg = $derived(platformColors[persona.platforms[0]] ?? '#6b7280')
  const initial = $derived(persona.displayName.charAt(0))
  const isTinder = $derived(persona.platforms.includes('tinder'))
  const textColor = $derived(
    timeBg === '#1a7a1a' ? '#ffffff' :
    timeBg === '#1d4ed8' ? '#ffffff' :
    timeBg === '#dc2626' ? '#ffffff' : 'inherit'
  )
</script>

<div class="ox-cal-card" data-ui="ox-card-crm-calendar" style="background: {timeBg}; --plat-color: {bg}">
  <!-- Bande couleur plateforme à gauche -->
  <div class="ox-cal-plat-strip"></div>

  {#if avatarUrl}
    <img src={avatarUrl} alt="" class="ox-cal-avatar" class:ox-cal-bounce={bounce} />
  {:else}
    <div class="ox-cal-avatar-fallback" class:ox-cal-bounce={bounce} style="background: {bg}">{initial}</div>
  {/if}
  <div class="ox-cal-body">
    <div class="ox-cal-name" style="color: {textColor || 'inherit'}">{persona.displayName}</div>
    <div class="ox-cal-meta">
      {#each persona.platforms as plat}
        <span class="ox-cal-dot" style="background: {platformColors[plat] ?? '#6b7280'}"></span>
      {/each}
      {#if timeLabel}<span class="ox-cal-time" style="color: {textColor ? 'inherit' : ''}">{timeLabel}</span>{/if}
      {#if persona.phone}
        {#if whatsappUrl}
          <a href={whatsappUrl} target="_blank" rel="noopener" onclick={(e) => e.stopPropagation()}>
            <Phone class="ox-cal-phone" size={14} strokeWidth={2} />
          </a>
        {:else}
          <Phone class="ox-cal-phone" size={14} strokeWidth={2} />
        {/if}
      {/if}
    </div>
  </div>

  <!-- Actions -->
  <div class="ox-cal-actions">
    {#if onToggleFavorite}
      <button
        class="ox-cal-btn"
        class:ox-cal-btn-active={persona.isFavorite}
        onclick={(e) => { e.stopPropagation(); onToggleFavorite?.() }}
        data-ui="btn-cal-fav-{persona.id}"
        title={persona.isFavorite ? 'Retirer favoris' : 'Favori'}
      >
        <Star size={14} strokeWidth={2} fill={persona.isFavorite ? 'currentColor' : 'none'} />
      </button>
    {/if}
    {#if onToggleTarget}
      <button
        class="ox-cal-btn"
        class:ox-cal-btn-active-err={persona.isTarget}
        onclick={(e) => { e.stopPropagation(); onToggleTarget?.() }}
        data-ui="btn-cal-target-{persona.id}"
        title={persona.isTarget ? 'Retirer cible' : 'Cible'}
      >
        <Triangle size={14} strokeWidth={2} fill={persona.isTarget ? 'currentColor' : 'none'} />
      </button>
    {/if}
    {#if onMarkDelete}
      <button
        class="ox-cal-delete"
        class:ox-cal-delete-active={persona.markedForDeletion}
        onclick={(e) => { e.stopPropagation(); onMarkDelete?.() }}
        data-ui="btn-mark-delete-{persona.id}"
        title={persona.markedForDeletion ? 'Untag delete' : 'Tag delete'}
      >
        <Trash size={13} strokeWidth={2} fill={persona.markedForDeletion ? 'currentColor' : 'none'} />
      </button>
    {/if}
    {#if isTinder && onDeleteMatch}
      <button
        class="ox-cal-btn ox-cal-btn-unmatch"
        onclick={(e) => { e.stopPropagation(); onDeleteMatch?.() }}
        data-ui="btn-cal-unmatch-{persona.id}"
        title="Supprimer match Tinder"
      >
        <HeartCrack size={13} strokeWidth={2} />
      </button>
    {/if}
    {#if onDelete}
      <button
        class="ox-cal-btn ox-cal-btn-del-forever"
        onclick={(e) => {
          e.stopPropagation()
          if (typeof window !== 'undefined' && !window.confirm(`SUPPRESSION DEFINITIVE de ${persona.displayName} ?`)) return
          onDelete?.()
        }}
        data-ui="btn-cal-del-{persona.id}"
        title="Supprimer définitivement"
      >
        <Trash2 size={13} strokeWidth={2} />
      </button>
    {/if}
  </div>
</div>

<style>
  .ox-cal-card {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 300px;
    min-width: 300px;
    min-height: 96px;
    padding: 10px 10px 10px 0;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--ox-outline-variant, #CAC4D0) 50%, transparent);
    box-shadow: 0 1px 5px rgba(0,0,0,0.08);
    overflow: hidden;
    transition: background 200ms, box-shadow 120ms;
    position: relative;
  }
  .ox-cal-card:hover {
    box-shadow: 0 3px 10px rgba(0,0,0,0.13);
  }
  .ox-cal-plat-strip {
    width: 5px;
    min-width: 5px;
    align-self: stretch;
    background: var(--plat-color, #6b7280);
    border-radius: 10px 0 0 10px;
    flex-shrink: 0;
    margin-left: 0;
  }
  .ox-cal-avatar,
  .ox-cal-avatar-fallback {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .ox-cal-avatar {
    object-fit: cover;
  }
  .ox-cal-avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font: 700 18px system-ui;
  }
  .ox-cal-body {
    flex: 1;
    min-width: 0;
  }
  .ox-cal-name {
    font: 600 13px/1.3 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ox-cal-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 5px;
  }
  .ox-cal-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }
  .ox-cal-time {
    font-size: 10px;
    color: var(--ox-outline, #79747E);
  }
  :global(.ox-cal-phone) {
    color: #22c55e;
    cursor: pointer;
    text-decoration: none;
  }
  a { text-decoration: none; }

  /* Actions */
  .ox-cal-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }
  .ox-cal-btn {
    padding: 3px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ox-outline, #79747E);
    border-radius: 4px;
    display: flex;
    align-items: center;
    opacity: 0.6;
    transition: opacity 120ms;
  }
  .ox-cal-btn:hover { opacity: 1; background: rgba(0,0,0,0.05); }
  .ox-cal-btn-active { color: #f59e0b; opacity: 1; }
  .ox-cal-btn-active-err { color: #dc2626; opacity: 1; }
  .ox-cal-btn-unmatch { color: #FD5068; opacity: 0.7; }
  .ox-cal-btn-unmatch:hover { opacity: 1; }
  .ox-cal-btn-del-forever { color: #dc2626; opacity: 0.6; }
  .ox-cal-btn-del-forever:hover { opacity: 1; background: #fef2f2; }

  .ox-cal-delete {
    padding: 3px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ox-outline, #79747E);
    border-radius: 4px;
    display: flex;
    align-items: center;
    opacity: 0.6;
  }
  .ox-cal-delete:hover { opacity: 1; background: #fef2f2; }
  .ox-cal-delete-active { color: #ffffff; background: #000000 !important; opacity: 1; }

  .ox-cal-bounce {
    animation: ox-cal-bounce-in 600ms cubic-bezier(0.34, 1.56, 0.64, 1) 1;
  }
  @keyframes ox-cal-bounce-in {
    0%   { transform: scale(0.3); opacity: 0; }
    50%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
</style>
