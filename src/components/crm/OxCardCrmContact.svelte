<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxCardCrmContact — Full CRM contact card (CRM /contacts)
   * │
   * │ Header : avatar + name + platform badges + deep-links
   * │ Body   : avatar carousel (embla) + bio + phone + stats
   * │ Chat   : 3 modes (none/preview/expanded)
   * │ Footer : 5 action buttons (delete / unmatch / cloud / target
   * │          / favorite / mark-delete)
   * └─────────────────────────────────────────────────────────┘
   */
  import emblaCarousel from 'embla-carousel'
  import OxCard from '../cards/OxCard.svelte'
  import OxTooltip from '../notifications/OxTooltip.svelte'
  import {
    Phone, Clock, MessageCircle, ChevronDown, ChevronUp,
    BookOpen, Star, Triangle, Cloud, Database,
    Hourglass, HeartCrack, Trash2, Contact, Trash
  } from '@lucide/svelte'

  interface PlatformInfo { color: string; short?: string; label?: string }

  const TEMPORAL_PALETTE: { maxMins: number; hue: number }[] = [
    { maxMins: 15,    hue: 140 },
    { maxMins: 30,    hue: 115 },
    { maxMins: 45,    hue: 90  },
    { maxMins: 60,    hue: 65  },
    { maxMins: 180,   hue: 50  },
    { maxMins: 480,   hue: 35  },
    { maxMins: 960,   hue: 22  },
    { maxMins: 1440,  hue: 12  },
    { maxMins: 4320,  hue: 8   },
    { maxMins: 10080, hue: 5   },
  ]
  const BR_PHONE_RE = /\+55[\s-]?\d{2}[\s-]?\d{4,5}[\s-]?\d{4}/

  interface Props {
    persona: any
    allAvatars: string[]
    personaMessages: Array<{ direction: string; content: string; date: string }>
    platformConfig: Record<string, PlatformInfo>
    colorMode?: 'responder' | 'temporal'
    chatMode?: 'none' | 'preview' | 'expanded' | 'all' | 'dark'
    expanded?: boolean
    isActive?: boolean
    idx?: number
    deleting?: boolean
    // URLs / helpers
    profileUrl?: string | null
    whatsappUrl?: string | null
    formatTimeAgo: (iso: string | null) => string
    formatMsgDate: (d: string) => string
    stripNamePrefix?: (content: string, name: string) => string
    // Callbacks
    onToggleCard?: () => void
    onNavWhatsapp?: () => void
    onNavTinder?: () => void
    onDelete?: () => void
    onDeleteMatch?: () => void
    onDeleteAnnuaire?: () => void
    onDeleteWhatsapp?: () => void
    onDeleteAll?: () => void
    onToggleTarget?: () => void
    onToggleFavorite?: () => void
    onMarkDelete?: () => void
    onStory?: () => void
    // Delete loading states
    deletingTinder?: boolean
    deletingAnnuaire?: boolean
    deletingWhatsapp?: boolean
    deletingAll?: boolean
  }

  let {
    persona: p,
    allAvatars,
    personaMessages,
    platformConfig,
    colorMode = 'responder',
    chatMode = 'preview',
    expanded = false,
    isActive = false,
    idx,
    deleting = false,
    profileUrl = null,
    whatsappUrl = null,
    formatTimeAgo,
    formatMsgDate,
    stripNamePrefix = (c: string) => c,
    onToggleCard,
    onNavWhatsapp,
    onNavTinder,
    onDelete,
    onDeleteMatch,
    onDeleteAnnuaire,
    onDeleteWhatsapp,
    onDeleteAll,
    onToggleTarget,
    onToggleFavorite,
    onMarkDelete,
    onStory,
    deletingTinder = false,
    deletingAnnuaire = false,
    deletingWhatsapp = false,
    deletingAll = false,
  }: Props = $props()

  // Derived
  const platformColor = $derived(platformConfig[p.platforms[0]]?.color || '#6b7280')
  const isWhatsapp = $derived(p.platforms.includes('whatsapp'))
  const headerText = $derived('var(--ox-on-surface)')
  const headerTextSub = $derived('var(--ox-on-surface-variant)')
  const headerIcon = $derived('var(--ox-outline)')
  const effectivePhone = $derived(p.phone ?? null)
  const hasPhone = $derived(!!effectivePhone)
  const lastMsg = $derived(personaMessages[personaMessages.length - 1])
  const lastIsMine = $derived(lastMsg?.direction === 'out')
  const lastInMsg = $derived([...personaMessages].reverse().find(m => m.direction === 'in'))
  const lastInIsPhone = $derived(lastInMsg ? BR_PHONE_RE.test(lastInMsg.content) : false)
  const cardBgColor = $derived.by(() => {
    if (chatMode === 'dark') return '#0d1117'
    if (colorMode === 'temporal') {
      if (lastInIsPhone || !lastInMsg) return 'oklch(94% 0.01 200)'
      const mins = (Date.now() - new Date(lastInMsg.date).getTime()) / 60000
      for (const { maxMins, hue } of TEMPORAL_PALETTE) {
        if (mins <= maxMins) return `oklch(92% 0.10 ${hue})`
      }
      return 'oklch(94% 0.01 200)'
    }
    // responder mode
    if (!lastMsg) return '#ffffff'
    if (lastIsMine) return '#dbeafe'
    if (lastInIsPhone) return '#ffffff'
    return '#fce7f3'
  })

  // Embla carousel action
  function initEmbla(node: HTMLElement) {
    const viewport = node.querySelector('.embla-viewport') as HTMLElement
    if (!viewport) return
    const instance = emblaCarousel(viewport, { loop: true, containScroll: 'keepSnaps' })
    const dots = node.querySelectorAll('.embla-dot')
    const prevBtn = node.querySelector('.embla-prev') as HTMLElement
    const nextBtn = node.querySelector('.embla-next') as HTMLElement
    function updateDots() {
      const selected = instance.selectedScrollSnap()
      dots.forEach((d, i) => d.classList.toggle('active', i === selected))
    }
    instance.on('select', updateDots)
    updateDots()
    prevBtn?.addEventListener('click', () => instance.scrollPrev())
    nextBtn?.addEventListener('click', () => instance.scrollNext())
    return { destroy() { instance.destroy() } }
  }
</script>

<OxCard
  id="contact-card-{p.id}"
  variant={p.isFavorite ? 'filled' : 'outlined'}
  classes={isActive ? 'recent-card' : ''}
  style="overflow: hidden; scroll-margin-block: 16px; background: {cardBgColor}; {p.age != null && p.age >= 29 ? 'opacity: 0.5' : ''}"
>
  <!-- Header : numéro | nom | badge plateforme -->
  <div class="flex items-center gap-2 px-3 py-2" style="background: {chatMode === 'dark' ? '#161b22' : '#ffffff'}; border-bottom: {hasPhone ? '3px solid #22c55e' : '1px solid var(--ox-outline-variant)'}">
    <!-- Cercle avec numéro (ou initiale si pas d'index) -->
    <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0" class:ox-bounce={isActive} style="background: #000000; color: #fff" data-ui="ox-card-crm-contact">
      {idx != null ? idx + 1 : p.displayName.charAt(0)}
    </div>

    <div class="flex-1 min-w-0" data-ui="contact-header-info-{p.id}">
      <span class="text-sm font-semibold truncate block" style="color: {headerText}" data-ui="contact-name-{p.id}">{p.displayName}</span>
      <div class="flex items-center gap-1.5 mt-0.5">
        {#if p.age}<span class="text-xs" style="color: {headerTextSub}" data-ui="contact-age-{p.id}">{p.age}a</span>{/if}
        {#if p.distance != null}<span class="text-xs" style="color: {headerTextSub}" data-ui="contact-dist-{p.id}">{String(p.distance).includes('km') ? p.distance : `${p.distance}km`}</span>{/if}
      </div>
    </div>

    <!-- Badge plateforme à droite -->
    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-white shrink-0" style="background: {platformConfig[p.platforms[0]]?.color ?? platformColor}" data-ui="contact-platform-{p.id}">
      {platformConfig[p.platforms[0]]?.short ?? p.platforms[0]}
    </span>
  </div>

  <!-- Body : avatar (carré) + infos -->
  <div class="flex gap-3 p-3" data-ui="card-body-{p.id}">
    <!-- Avatar (carré MD3) -->
    <div class="shrink-0" style="width: 104px; height: 104px">
      {#if allAvatars.length > 1}
        <div class="embla-root" use:initEmbla data-ui="carousel-{p.id}" style="width: 104px; height: 104px">
          <div class="embla-viewport overflow-hidden" style="height: 104px; border-radius: 10px">
            <div class="embla-container flex" style="height: 100%">
              {#each allAvatars as url}
                <div class="embla-slide" style="flex: 0 0 100%; min-width: 0">
                  <img src={url} alt="" class="w-full h-full object-cover" />
                </div>
              {/each}
            </div>
          </div>
          <button class="embla-prev absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-xs" style="background: var(--ox-surface); color: var(--ox-on-surface); box-shadow: var(--ox-elevation-1)">‹</button>
          <button class="embla-next absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-xs" style="background: var(--ox-surface); color: var(--ox-on-surface); box-shadow: var(--ox-elevation-1)">›</button>
        </div>
      {:else if allAvatars.length === 1}
        <img src={allAvatars[0]} alt="" class="object-cover" style="width: 104px; height: 104px; border-radius: 10px" data-ui="contact-avatar-{p.id}" />
      {:else}
        <div class="flex items-center justify-center font-bold" style="width: 104px; height: 104px; border-radius: 10px; background: {platformColor}; color: #fff; font-size: 40px" data-ui="contact-avatar-{p.id}">
          {p.displayName.charAt(0)}
        </div>
      {/if}
    </div>

    <!-- Infos -->
    <div class="flex-1 flex flex-col gap-1.5 text-xs" style="color: var(--ox-on-surface-variant)">
      <!-- Phone → navigue l'onglet WA existant si onNavWhatsapp fourni, sinon wa.me -->
      {#if effectivePhone}
        <a
          href={onNavWhatsapp ? undefined : (whatsappUrl ?? profileUrl ?? `tel:${effectivePhone}`)}
          target={onNavWhatsapp ? undefined : '_blank'}
          rel={onNavWhatsapp ? undefined : 'noopener'}
          role={onNavWhatsapp ? 'button' : undefined}
          class="flex items-center gap-1 cursor-pointer"
          onclick={(e) => { e.stopPropagation(); if (onNavWhatsapp) { e.preventDefault(); onNavWhatsapp() } }}
          data-ui="contact-phone-{p.id}"
        >
          <span style="color: #22c55e; display: inline-flex; align-items: center;"><Phone size={14} strokeWidth={2} /></span>
          <span class="font-semibold" style="color: var(--ox-on-surface)">{effectivePhone}</span>
        </a>
      {/if}

      <!-- Tinder : URL cliquable + bouton Go to Tinder -->
      {#if profileUrl && p.platforms.includes('tinder')}
        <div class="flex items-center gap-1.5 flex-wrap" data-ui="link-tinder-{p.id}">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener"
            class="font-mono text-[10px] underline"
            style="color: var(--ox-on-surface-variant)"
            onclick={(e) => e.stopPropagation()}
          >{profileUrl}</a>
          {#if onNavTinder}
            <button
              class="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white cursor-pointer shrink-0"
              style="background: {platformConfig['tinder']?.color ?? '#FD5068'}"
              onclick={(e) => { e.stopPropagation(); onNavTinder() }}
            >Go to Tinder</button>
          {/if}
        </div>
      {/if}

      <!-- Timing -->
      <div class="flex items-center gap-1 mt-auto" data-ui="contact-timing-{p.id}">
        <Clock size={14} strokeWidth={2} />
        <span>Dernier msg: {formatTimeAgo(p.lastInteraction)}</span>
      </div>

      <!-- Bio (à la place de "chat N messages") -->
      {#if p.bio}
        <p class="italic" style="color: var(--ox-outline)" data-ui="contact-bio-{p.id}">{p.bio.slice(0, 80)}{p.bio.length > 80 ? '...' : ''}</p>
      {/if}

      <!-- Msg count (prettier) -->
      <div class="flex items-center gap-1" data-ui="contact-msg-count-{p.id}">
        <MessageCircle size={14} strokeWidth={2} />
        <span>{p.messageCount} messages</span>
      </div>
    </div>
  </div>

  <!-- Chat section -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div onclick={onToggleCard} class="cursor-pointer" data-ui="chat-zone-{p.id}">
    <div class="h-px mx-3" style="background: var(--ox-outline-variant)"></div>

    {#if chatMode === 'none' && !expanded}
      {#if personaMessages.length > 0}
        <div class="px-3 py-1.5 text-xs" style="color: var(--ox-outline)">{personaMessages.length} msgs</div>
      {/if}
    {:else if !expanded}
      {#if personaMessages.length > 0}
        {@const cleanContent = stripNamePrefix(lastMsg.content, p.displayName)}
        <div class="px-3 py-2">
          <div class="flex items-start gap-2 text-xs">
            <div class="w-1 h-full rounded-full shrink-0 mt-0.5" style="background: {lastMsg.direction === 'out' ? '#60a5fa' : '#ec4899'}; min-height: 16px"></div>
            <div class="flex-1 min-w-0">
              <span class="font-mono text-[10px]" style="color: var(--ox-outline)">{formatMsgDate(lastMsg.date)}</span>
              <p class="truncate" style="color: var(--ox-on-surface)">{cleanContent}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 mt-1 text-[10px]" style="color: var(--ox-outline)">
            <ChevronDown size={12} strokeWidth={2} />
            {personaMessages.length} msgs
          </div>
        </div>
      {:else}
        <div class="px-3 py-1.5 text-xs" style="color: var(--ox-outline)">Aucun message</div>
      {/if}
    {:else}
      <!-- Expanded chat -->
      <div class="px-3 py-2 max-h-64 overflow-auto" style="background: {chatMode === 'dark' ? '#010409' : 'transparent'}" data-ui="conversation-{p.id}">
        <div class="flex items-center gap-1 mb-2 text-[10px]" style="color: {chatMode === 'dark' ? '#8b949e' : 'var(--ox-outline)'}">
          <ChevronUp size={12} strokeWidth={2} />
          Replier
        </div>
        {#each [...personaMessages].reverse() as msg}
          {@const cleanContent = stripNamePrefix(msg.content, p.displayName)}
          <div class="flex items-start gap-2 mb-1.5 text-xs">
            <div class="w-1 shrink-0 rounded-full mt-0.5" style="background: {msg.direction === 'out' ? '#60a5fa' : '#ec4899'}; min-height: 16px"></div>
            <div class="flex-1 min-w-0">
              <span class="font-mono text-[10px]" style="color: {chatMode === 'dark' ? '#484f58' : 'var(--ox-outline)'}">{formatMsgDate(msg.date)}</span>
              <p style="color: {chatMode === 'dark' ? '#e6edf3' : 'var(--ox-on-surface)'}">{cleanContent}</p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Footer row 1 — ⭐ △ ☁ 🗃 -->
  <div class="flex items-center gap-1 px-3 border-t" style="border-color: var(--ox-outline-variant); min-height: 50px">
    <OxTooltip id="story-{p.id}" label="Histoire — jalons de la relation">
      {#snippet children()}
        <button
          class="card-action-btn rounded-full cursor-pointer transition-colors inline-flex items-center justify-center hover:bg-black/5"
          style="color: var(--ox-outline);"
          onclick={(e) => { e.stopPropagation(); onStory?.() }}
          data-ui="btn-story-{p.id}"
        >
          <BookOpen size={18} strokeWidth={2} />
        </button>
      {/snippet}
    </OxTooltip>
    <OxTooltip id="fav-{p.id}" label={p.isFavorite ? 'Retirer des favoris' : 'Marquer comme favori'}>
      {#snippet children()}
        <button
          class="card-action-btn rounded-full cursor-pointer transition-colors inline-flex items-center justify-center"
          style="color: {p.isFavorite ? '#000' : 'var(--ox-outline)'}; {p.isFavorite ? 'background: #fbbf24; border: 2px solid #000;' : 'background: transparent; border: 2px solid transparent;'}"
          onclick={(e) => { e.stopPropagation(); onToggleFavorite?.() }}
          data-ui="btn-fav-{p.id}"
        >
          <Star size={18} strokeWidth={2} fill={p.isFavorite ? 'currentColor' : 'none'} />
        </button>
      {/snippet}
    </OxTooltip>
    <OxTooltip id="target-{p.id}" label={p.isTarget ? 'Retirer la cible' : 'Marquer comme cible (priorité)'}>
      {#snippet children()}
        <button
          class="card-action-btn rounded-full cursor-pointer transition-colors inline-flex items-center justify-center hover:bg-black/5"
          style="color: {p.isTarget ? 'var(--ox-error)' : 'var(--ox-outline)'};"
          onclick={(e) => { e.stopPropagation(); onToggleTarget?.() }}
          data-ui="btn-target-{p.id}"
        >
          <Triangle size={18} strokeWidth={2} fill={p.isTarget ? 'currentColor' : 'none'} />
        </button>
      {/snippet}
    </OxTooltip>
    <div class="flex-1"></div>
    {#if p.storageUrl}
      <OxTooltip id="storage-{p.id}" label="Ouvrir Firebase Storage (avatars)">
        {#snippet children()}
          <a href={p.storageUrl} target="_blank" rel="noopener"
            class="card-action-btn rounded-full transition-colors inline-flex items-center justify-center hover:bg-black/5"
            style="color: var(--ox-outline);"
            onclick={(e) => e.stopPropagation()} data-ui="link-storage-{p.id}">
            <Cloud size={16} strokeWidth={2} />
          </a>
        {/snippet}
      </OxTooltip>
    {/if}
    {#if p.firestoreUrl}
      <OxTooltip id="firestore-{p.id}" label="Ouvrir dans Firestore UI">
        {#snippet children()}
          <a href={p.firestoreUrl} target="_blank" rel="noopener"
            class="card-action-btn rounded-full transition-colors inline-flex items-center justify-center hover:bg-black/5"
            style="color: var(--ox-outline);"
            onclick={(e) => e.stopPropagation()} data-ui="link-firestore-{p.id}">
            <Database size={16} strokeWidth={2} />
          </a>
        {/snippet}
      </OxTooltip>
    {/if}
  </div>

  <!-- Footer row 2 — DELETE TOOLBAR -->
  <div class="flex items-center gap-1.5 px-3 border-t" style="border-color: var(--ox-outline-variant); background: var(--ox-surface-2, #f5f0f7); min-height: 50px" data-ui="footer-delete-{p.id}">

    {#if p.platforms.includes('tinder')}
      <OxTooltip id="del-tinder-{p.id}" label={deletingTinder ? 'Suppression Tinder...' : 'Supprimer match Tinder (unmatch via plugin)'}>
        {#snippet children()}
          <button
            class="del-btn"
            style="color: {deletingTinder ? 'var(--ox-outline)' : '#FD5068'};"
            onclick={(e) => { e.stopPropagation(); if (!deletingTinder) onDeleteMatch?.() }}
            disabled={deletingTinder}
            data-ui="btn-del-tinder-{p.id}"
          >
            {#if deletingTinder}<Hourglass size={15} strokeWidth={2} />{:else}<HeartCrack size={15} strokeWidth={2} />{/if}
          </button>
        {/snippet}
      </OxTooltip>
    {/if}

    <OxTooltip id="del-firebase-{p.id}" label={deleting ? 'Suppression Firebase...' : 'Supprimer de Firebase (Firestore + Storage)'}>
      {#snippet children()}
        <button
          class="del-btn"
          style="color: {deleting ? 'var(--ox-outline)' : '#FF6D00'};"
          onclick={(e) => { e.stopPropagation(); if (!deleting) onDelete?.() }}
          disabled={deleting}
          data-ui="btn-del-firebase-{p.id}"
        >
          {#if deleting}<Hourglass size={15} strokeWidth={2} />{:else}<Trash2 size={15} strokeWidth={2} />{/if}
        </button>
      {/snippet}
    </OxTooltip>

    {#if p.phone}
      <OxTooltip id="del-annuaire-{p.id}" label={deletingAnnuaire ? 'Suppression Contacts.app...' : 'Supprimer de Contacts.app (annuaire macOS)'}>
        {#snippet children()}
          <button
            class="del-btn"
            style="color: {deletingAnnuaire ? 'var(--ox-outline)' : '#5856D6'};"
            onclick={(e) => { e.stopPropagation(); if (!deletingAnnuaire) onDeleteAnnuaire?.() }}
            disabled={deletingAnnuaire}
            data-ui="btn-del-annuaire-{p.id}"
          >
            {#if deletingAnnuaire}<Hourglass size={15} strokeWidth={2} />{:else}<Contact size={15} strokeWidth={2} />{/if}
          </button>
        {/snippet}
      </OxTooltip>

      <OxTooltip id="del-whatsapp-{p.id}" label={deletingWhatsapp ? 'Suppression WhatsApp...' : 'Supprimer discussion WhatsApp (via plugin zapax)'}>
        {#snippet children()}
          <button
            class="del-btn"
            style="color: {deletingWhatsapp ? 'var(--ox-outline)' : '#25D366'};"
            onclick={(e) => { e.stopPropagation(); if (!deletingWhatsapp) onDeleteWhatsapp?.() }}
            disabled={deletingWhatsapp}
            data-ui="btn-del-whatsapp-{p.id}"
          >
            {#if deletingWhatsapp}<Hourglass size={15} strokeWidth={2} />{:else}<MessageCircle size={15} strokeWidth={2} />{/if}
          </button>
        {/snippet}
      </OxTooltip>
    {/if}

    <div class="flex-1"></div>

    <!-- Batch marker toggle -->
    <OxTooltip id="batch-mark-{p.id}" label={p.markedForDeletion ? 'Dans le batch — cliquer pour annuler' : 'Marquer pour batch delete'}>
      {#snippet children()}
        <button
          class="del-btn batch-btn"
          style="color: {p.markedForDeletion ? '#ffffff' : 'var(--ox-outline)'}; background: {p.markedForDeletion ? '#000000' : 'transparent'}; border-radius: 4px;"
          onclick={(e) => { e.stopPropagation(); onMarkDelete?.() }}
          data-ui="btn-batch-mark-{p.id}"
          data-marked={p.markedForDeletion ? 'true' : 'false'}
        >
          <Trash size={15} strokeWidth={2} fill={p.markedForDeletion ? 'currentColor' : 'none'} />
        </button>
      {/snippet}
    </OxTooltip>
    <button
      class="del-all-btn"
      onclick={(e) => { e.stopPropagation(); onDeleteAll?.() }}
      disabled={deletingAll}
      data-ui="btn-del-all-{p.id}"
    >
      {#if deletingAll}<Hourglass size={13} strokeWidth={2} />{:else}<Trash2 size={13} strokeWidth={2} />{/if}
      {deletingAll ? '…' : 'DEL ALL'}
    </button>
  </div>
</OxCard>

<style>
  :global(.recent-card) {
    outline: 10px solid #000000 !important;
    outline-offset: -2px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25) !important;
  }

  .card-action-btn {
    width: 50px;
    height: 50px;
    padding: 0;
    line-height: 0;
    flex-shrink: 0;
  }

  .del-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 4px 8px;
    border-radius: 4px;
    background: #dc2626;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    border: none;
    transition: background 120ms;
    height: 50px;
    flex-shrink: 0;
  }
  .del-all-btn:hover:not(:disabled) { background: #b91c1c; }
  .del-all-btn:disabled { opacity: 0.6; cursor: wait; }

  .del-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    padding: 0;
    border-radius: 4px;
    cursor: pointer;
    transition: outline 80ms ease, background 80ms ease;
    background: transparent;
    border: none;
  }
  .del-btn:hover:not(:disabled) {
    outline: 5px solid black;
  }
  .del-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .ox-bounce {
    animation: ox-card-bounce-in 600ms cubic-bezier(0.34, 1.56, 0.64, 1) 1;
  }
  @keyframes ox-card-bounce-in {
    0%   { transform: scale(0.3); opacity: 0; }
    50%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  :global(.embla-dot.active) {
    background: var(--ox-primary) !important;
  }
  .embla-prev, .embla-next {
    cursor: pointer;
    border: none;
    opacity: 0;
    transition: opacity 150ms;
  }
  .embla-root:hover .embla-prev,
  .embla-root:hover .embla-next {
    opacity: 1;
  }
  .embla-root { position: relative; }
</style>
