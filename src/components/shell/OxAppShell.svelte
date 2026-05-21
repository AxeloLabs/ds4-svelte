<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxAppShell — Responsive Layout Shell                   │
   * │                                                         │
   * │ 3 paires Desktop ↔ Mobile :                           │
   * │                                                         │
   * │  PAIR 1 — AppBar ↔ Drawer                              │
   * │    Desktop : tabs centrées dans l'AppBar               │
   * │    Mobile  : Drawer overlay (burger → tabs listées)    │
   * │                                                         │
   * │  PAIR 2 — Sidebar ↔ Rail gauche                       │
   * │    Desktop : panel gauche 220px, labels + icônes       │
   * │    Mobile  : rail 56px, icônes seulement               │
   * │                                                         │
   * │  PAIR 3 — Toolbar ↔ Rail droit (optionnel)            │
   * │    Desktop : barre horizontale 48px sous l'AppBar      │
   * │    Mobile  : rail 56px droit (absent si pas toolbar)   │
   * │                                                         │
   * │ Desktop (≥ breakpoint) — mode NORMAL (pas de toolbar) :│
   * │ ┌─────────────────────────────────────────────────┐    │
   * │ │ AppBar: [title] [── tabs ──] [trailing]         │    │
   * │ ├──────────┬──────────────────────────────────────┤    │
   * │ │ Sidebar  │ Content                              │    │
   * │ └──────────┴──────────────────────────────────────┘    │
   * │                                                         │
   * │ Desktop — mode HEADER-SIDEBAR-TOOLBAR--FIRST :         │
   * │ ┌──────────────────────────────────────────────────┐   │
   * │ │ AppBar: [title] [── tabs ──] [trailing]          │   │
   * │ ├──────────┬───────────────────────────────────────┤   │
   * │ │ Sidebar  │ Toolbar / Toolbar2                    │   │
   * │ │  220px   ├───────────────────────────────────────┤   │
   * │ │          │ Content                               │   │
   * │ └──────────┴───────────────────────────────────────┘   │
   * │                                                         │
   * │ Mobile (< breakpoint) :                                │
   * │ ┌─────────────────────────────────────────────────┐    │
   * │ │ AppBar: [☰] [title] [trailing]                  │    │
   * │ ├──────┬────────────────────────────────┬─────────┤    │
   * │ │ Rail │ Content                        │ Rail    │    │
   * │ │ gche │                                │ droit?  │    │
   * │ └──────┴────────────────────────────────┴─────────┘    │
   * │                                                         │
   * │ Mobile + Drawer :                                      │
   * │ ┌─────────────────────────────────────────────────┐    │
   * │ │ AppBar: [✕] [title]                             │    │
   * │ ├──────────────────┬──────────────────┬───────────┤    │
   * │ │ Drawer (tabs)    │ scrim            │ Rail droit│    │
   * │ └──────────────────┴──────────────────┴───────────┘    │
   * │                                                         │
   * │ Breakpoint unique : `breakpoint` prop (default 850px)  │
   * └─────────────────────────────────────────────────────────┘
   */
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'
  import { fly, fade } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'

  import type { OxShellNavItem, OxShellSidebarItem, OxShellToolbarItem } from './shell-types.js'
  import OxAppClock from './OxAppClock.svelte'
  import OxBurger from './OxBurger.svelte'
  import OxRailContextProvider from './OxRailContextProvider.svelte'
  import { ChevronLeft, ChevronRight, X } from '@lucide/svelte'
  import OxNavMenuItem from './OxNavMenuItem.svelte'
  import OxTooltip from '../notifications/OxTooltip.svelte'

  interface Props {
    title?: string
    breakpoint?: number

    // ── MENUS : liens nav centrés dans AppBar ────────
    // Desktop : liens avec underline sur actif, centrés
    // Mobile  : inclus dans Sheet overlay (burger)
    menuItems?: OxShellNavItem[]
    activeMenuId?: string

    // ── PAIR 1 : AppBar ↔ Sheet ──────────────────────
    // Desktop : tabs centrées dans AppBar
    // Mobile  : liste dans Sheet overlay (burger)
    appbarItems?: OxShellNavItem[]
    activeAppbarId?: string
    drawerOpen?: boolean

    // ── PAIR 2 : Sidebar ↔ Rail gauche ───────────────
    // Desktop : panel gauche labels + icônes
    // Mobile  : rail 56px icônes
    // Supporte les kinds 'item' (défaut), 'divider', 'sectionLabel' pour
    // structurer la sidebar en sections (ex: domaines INBOUND / OUTBOUND).
    navItems?: OxShellSidebarItem[]
    activeNavId?: string
    sidebarOpen?: boolean
    sidebarWidth?: number

    // ── PAIR 3 : Toolbar ↔ Rail droit (optionnel) ────
    // Desktop : barre horizontale sous AppBar
    // Mobile  : rail 56px droit (absent si pas de toolbar)
    toolbarItems?: OxShellToolbarItem[]
    activeToolbarId?: string

    // ── Snippets (slots custom) ───────────────────────
    logo?: Snippet              // Brand/logo dans AppBar (remplace title text)
    appbarContent?: Snippet     // trailing AppBar (search, actions…) — s'ajoute après tabs
    sidebarContent?: Snippet    // Sidebar custom (remplace navItems)
    navHeader?: Snippet         // En-tête de la sidebar — rendu sous le toggle, au-dessus des navItems (ex: breadcrumb)
    toolbarContent?: Snippet    // Toolbar custom (remplace toolbarItems)
    drawerContent?: Snippet     // Drawer custom (remplace appbarItems)
    railLeftIcon?: Snippet      // Icône sous la flèche du rail gauche mobile (clique = ouvre overlay)
    railRightIcon?: Snippet     // Icône sous la flèche du rail droit mobile (clique = ouvre overlay)
    searchContent?: Snippet     // Barre de recherche dans l'AppBar, à gauche du loginButton
    children?: Snippet

    // ── Clock ────────────────────────────────────────
    showClock?: boolean
    clockLeading?: Snippet   // contenu rendu juste avant le clock dans l'AppBar

    // ── Login button (PAIR 4) ────────────────────────
    // Desktop : avatar cliquable → dropdown inline (petit panel sous l'avatar)
    // Mobile  : avatar cliquable → sheet droite SYMÉTRIQUE du drawer gauche
    //   - démarre sous l'AppBar (top: 64px), pas par-dessus
    //   - scrim translucide + backdrop-filter blur (glassmorphism)
    //   - thème light (suit le thème courant — pas forcé en dark)
    //   - largeur identique au drawer gauche (--_sidebar-w)
    /** Contenu du trigger avatar. Reçoit `{ open }` pour un chevron qui
     *  s'inverse (cf. pattern Axelo). Le snippet peut ignorer l'arg. */
    loginButton?: Snippet<[{ open: boolean }]>
    loginDrawerContent?: Snippet // Contenu du drawer login (profil, déconnexion…)
    loginDrawerOpen?: boolean    // $bindable — contrôle externe optionnel

    // ── PAIR 3b : Toolbar2 ↔ Rail droit 2 (optionnel) ──
    // Desktop : seconde bande horizontale 40px (empilée sous Toolbar)
    // Mobile  : second rail 56px droit (absent si pas de toolbar2)
    toolbar2Items?: OxShellToolbarItem[]
    activeToolbar2Id?: string
    toolbar2Content?: Snippet    // Toolbar2 custom (remplace toolbar2Items)
    railRight2Icon?: Snippet     // Icône sous la flèche du rail droit 2 mobile

    // ── PAIR 5 : Mini-footer ↔ bottom du drawer (optionnel) ──
    // Desktop : barre fixe 64px en bas du shell (liens centrés)
    // Mobile  : items rendus en bas du drawer gauche, sous une séparation 1px
    // Cas d'usage type : liens légaux (CGV, mentions, confidentialité…)
    footerItems?: OxShellNavItem[]
    footerContent?: Snippet      // Footer custom (remplace footerItems en desktop)

    // Bloc libre rendu UNIQUEMENT dans le drawer mobile, après les menuItems
    // et avant les footerItems, séparé par une bordure 1px.
    // Cas d'usage : sélecteur d'entreprise/tenant, switcher contextuel mobile.
    drawerSection?: Snippet

    // ── Callbacks ────────────────────────────────────
    onNavClick?: (id: string) => void
    onMenuClick?: (id: string) => void
    onAppbarClick?: (id: string) => void
    onToolbarClick?: (id: string) => void
    onToolbar2Click?: (id: string) => void
    onFooterClick?: (id: string) => void
    onLoginClick?: () => void    // Appelé au click sur le trigger (desktop + mobile)
  }

  let {
    title = 'Sommaire',
    breakpoint = 850,
    menuItems = [],
    activeMenuId = $bindable(''),
    appbarItems = [],
    activeAppbarId = $bindable(''),
    drawerOpen = $bindable(false),
    navItems = [],
    activeNavId = $bindable(''),
    sidebarOpen = $bindable(true),
    sidebarWidth = 220,
    toolbarItems = [],
    activeToolbarId = $bindable(''),
    toolbar2Items = [],
    activeToolbar2Id = $bindable(''),
    toolbar2Content,
    railRight2Icon,
    footerItems = [],
    footerContent,
    drawerSection,
    logo,
    appbarContent,
    sidebarContent,
    navHeader,
    toolbarContent,
    drawerContent,
    railLeftIcon,
    railRightIcon,
    searchContent,
    children,
    showClock = true,
    clockLeading,
    loginButton,
    loginDrawerContent,
    loginDrawerOpen = $bindable(false),
    onNavClick,
    onMenuClick,
    onAppbarClick,
    onToolbarClick,
    onToolbar2Click,
    onFooterClick,
    onLoginClick,
  }: Props = $props()

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // VIEWPORT
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let viewportW = $state(typeof window !== 'undefined' ? window.innerWidth : 1400)

  onMount(() => {
    viewportW = window.innerWidth
    function onResize() { viewportW = window.innerWidth }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  })

  let isDesktop = $derived(viewportW >= breakpoint)
  let isMobile  = $derived(!isDesktop)

  // ── Présence des zones ──────────────────────────
  const hasMenuItems   = $derived(menuItems.length > 0)
  const hasAppbarItems = $derived(appbarItems.length > 0)
  const hasNav         = $derived(navItems.length > 0 || !!sidebarContent)
  const hasToolbar     = $derived(toolbarItems.length > 0 || !!toolbarContent)
  const hasToolbar2    = $derived(toolbar2Items.length > 0 || !!toolbar2Content)
  // Drawer gauche mobile : ouvert si items OU search (search migre dans le drawer sur mobile)
  const hasDrawer      = $derived(hasMenuItems || hasAppbarItems || !!searchContent)
  // Sidebar First : sidebar prend toute la hauteur (inclut la zone AppBar) quand sidebar + toolbar présents
  const hasHeaderSidebarToolbarFirst = $derived(isDesktop && hasNav && (hasToolbar || hasToolbar2))
  // PAIR 5 : présence d'un mini-footer (items ou snippet custom)
  const hasFooter      = $derived(footerItems.length > 0 || !!footerContent)

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // HANDLERS
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  function toggleDrawer() {
    drawerOpen = !drawerOpen
    if (drawerOpen) loginDrawerOpen = false   // ferme le drawer droit si on ouvre le gauche
  }
  function closeDrawer()  { drawerOpen = false }

  function handleNavClick(id: string) {
    activeNavId = id
    onNavClick?.(id)
  }

  function handleMenuClick(id: string) {
    activeMenuId = id
    onMenuClick?.(id)
    if (isMobile) closeDrawer()
  }

  function handleAppbarClick(id: string) {
    activeAppbarId = id
    onAppbarClick?.(id)
    if (isMobile) closeDrawer()
  }

  function handleToolbarClick(id: string) {
    activeToolbarId = id
    onToolbarClick?.(id)
  }

  function handleToolbar2Click(id: string) {
    activeToolbar2Id = id
    onToolbar2Click?.(id)
  }

  function handleFooterClick(id: string) {
    onFooterClick?.(id)
    if (isMobile) closeDrawer()
  }

  // ── Mobile rail expand (PAIR 2 left / PAIR 3 right / PAIR 3b right2) ──
  let railLeftOpen   = $state(false)
  let railRightOpen  = $state(false)
  let railRight2Open = $state(false)

  // Sauvegarde de sidebarOpen avant ouverture du rail gauche (restauré à la fermeture)
  // → permet au sidebarContent de se rendre en mode "full" (collapsed=false) dans l'overlay
  let savedSidebarOpenBeforeRail = $state(false)

  function toggleRailLeft() {
    railLeftOpen = !railLeftOpen
    if (railLeftOpen) {
      savedSidebarOpenBeforeRail = sidebarOpen
      sidebarOpen = true
      railRightOpen = false
      railRight2Open = false
    } else {
      sidebarOpen = savedSidebarOpenBeforeRail
    }
  }
  function toggleRailRight() {
    railRightOpen = !railRightOpen
    if (railRightOpen) {
      if (railLeftOpen) sidebarOpen = savedSidebarOpenBeforeRail
      railLeftOpen = false
      railRight2Open = false
    }
  }
  function toggleRailRight2() {
    railRight2Open = !railRight2Open
    if (railRight2Open) {
      if (railLeftOpen) sidebarOpen = savedSidebarOpenBeforeRail
      railLeftOpen = false
      railRightOpen = false
    }
  }
  function closeRails() {
    if (railLeftOpen) sidebarOpen = savedSidebarOpenBeforeRail
    railLeftOpen = false
    railRightOpen = false
    railRight2Open = false
  }

  function toggleLoginDrawer() {
    loginDrawerOpen = !loginDrawerOpen
    if (loginDrawerOpen) {
      drawerOpen = false        // ferme le drawer mobile (burger) si on ouvre le login
      sidebarOpen = false       // ferme la sidebar desktop pour que le panel login soit
                                // visible au 1er plan (sinon il apparaît derrière la sidebar)
    }
    onLoginClick?.()
  }
  function closeLoginDrawer() { loginDrawerOpen = false }
</script>

<!-- ▓▓▓ SHELL ROOT ▓▓▓ -->
<div
  class="ox-shell"
  data-ui="ox-shell"
  class:desktop={isDesktop}
  class:mobile={isMobile}
  class:header-sidebar-toolbar--first={hasHeaderSidebarToolbarFirst}
  style="--_sidebar-w:{sidebarWidth}px; --_sidebar-current-w:{sidebarOpen ? sidebarWidth : 56}px"
>

  <!-- ════════════════════════════════════
       SNIPPET — Desktop Sidebar (réutilisé en header-sidebar-toolbar--first + normal)
       ════════════════════════════════════ -->
  {#snippet desktopSidebar()}
    <aside
      class="ox-sidebar"
      class:ox-sidebar--rail={!sidebarOpen}
      data-ui="ox-sidebar"
    >
      <!-- Toggle sidebar ↔ rail (épinglé en haut) -->
      <button
        class="ox-sidebar-toggle"
        onclick={() => sidebarOpen = !sidebarOpen}
        aria-label={sidebarOpen ? 'Réduire la sidebar' : 'Agrandir la sidebar'}
        data-ui="ox-sidebar-toggle"
      >
        {#if sidebarOpen}
          <ChevronLeft size={18} strokeWidth={2} />
        {:else}
          <ChevronRight size={18} strokeWidth={2} />
        {/if}
      </button>

      {#if sidebarContent}
        {#if !sidebarOpen}
          <!-- Rail mode desktop : même structure que mobile (icon + content strip) -->
          {#if railLeftIcon}
            <button class="ox-rail-icon-btn" onclick={() => sidebarOpen = true} data-ui="ox-sidebar-rail-icon">
              {@render railLeftIcon()}
            </button>
          {/if}
          <div class="ox-rail-content-strip">
            <OxRailContextProvider collapsed={true}>
              {#snippet children()}{@render sidebarContent()}{/snippet}
            </OxRailContextProvider>
          </div>
        {:else}
          <!-- Full mode desktop -->
          <OxRailContextProvider collapsed={false}>
            {#snippet children()}{@render sidebarContent()}{/snippet}
          </OxRailContextProvider>
        {/if}
      {:else if !sidebarOpen}
        <!-- Rail mode par défaut : navItems, icons seulement.
             Les section labels sont masqués (CSS) — pas de place pour le texte.
             Les dividers restent visibles (séparateur visuel des sections). -->
        {#each navItems as item}
          {#if item.kind === 'divider'}
            <div class="ox-sidebar-divider" data-ui="ox-sidebar-divider-{item.id}"></div>
          {:else if item.kind === 'sectionLabel'}
            <div class="ox-sidebar-section-label" data-ui="ox-sidebar-section-{item.id}">{item.label}</div>
          {:else}
            <OxTooltip id="ox-shell-nav-tip-{item.id}" label={item.label} placement="right">
              <button
                class="ox-sidebar-item"
                class:active={activeNavId === item.id}
                onclick={() => handleNavClick(item.id)}
                data-ui="ox-sidebar-{item.id}"
              >
                {#if item.iconSvg || item.iconComponent}
                  <span class="ox-sidebar-icon">{#if item.iconComponent}{@const IconC = item.iconComponent}<IconC size={18} strokeWidth={item.iconStrokeWidth ?? 2} />{:else}{@html item.iconSvg}{/if}</span>
                {:else}
                  <span class="ox-sidebar-initials">{item.label.slice(0, 2).toUpperCase()}</span>
                {/if}
              </button>
            </OxTooltip>
          {/if}
        {/each}
      {:else}
        <!-- Nav header optionnel (ex: breadcrumb avec back-arrow + titre page) -->
        {#if navHeader}
          <div class="ox-sidebar-nav-header" data-ui="ox-sidebar-nav-header">
            {@render navHeader()}
          </div>
        {/if}
        <!-- Full mode par défaut : navItems avec labels.
             Supporte 3 kinds : 'item' (défaut), 'divider', 'sectionLabel'. -->
        {#each navItems as item}
          {#if item.kind === 'divider'}
            <div class="ox-sidebar-divider" data-ui="ox-sidebar-divider-{item.id}"></div>
          {:else if item.kind === 'sectionLabel'}
            <div class="ox-sidebar-section-label" data-ui="ox-sidebar-section-{item.id}">{item.label}</div>
          {:else}
            <button
              class="ox-sidebar-item"
              class:active={activeNavId === item.id}
              onclick={() => handleNavClick(item.id)}
              data-ui="ox-sidebar-{item.id}"
            >
              {#if item.iconSvg || item.iconComponent}
                <span class="ox-sidebar-icon">{#if item.iconComponent}{@const IconC = item.iconComponent}<IconC size={18} strokeWidth={item.iconStrokeWidth ?? 2} />{:else}{@html item.iconSvg}{/if}</span>
              {/if}
              <span class="ox-sidebar-label">{item.label}</span>
              {#if item.badge != null}
                <span class="ox-sidebar-badge">{item.badge}</span>
              {/if}
            </button>
          {/if}
        {/each}
      {/if}

    </aside>
  {/snippet}

  <!-- HEADER-SIDEBAR-TOOLBAR--FIRST : sidebar rendue comme enfant direct du shell (sous le header) -->
  {#if hasHeaderSidebarToolbarFirst}
    {@render desktopSidebar()}
  {/if}

  <!-- ════════════════════════════════════
       APPBAR
       ════════════════════════════════════ -->
  <header class="ox-appbar" data-ui="ox-appbar">

    <!-- Burger (mobile, seulement si Drawer disponible — inclut search) -->
    {#if isMobile && hasDrawer}
      <div class="ox-appbar-burger" data-ui="ox-appbar-burger">
        <OxBurger
          open={drawerOpen}
          onclick={toggleDrawer}
          color="var(--ox-on-surface, #1C1B1F)"
        />
      </div>
    {/if}

    <!-- Logo / brand (logo slot toujours visible, title texte desktop seulement) -->
    {#if logo}
      <div class="ox-appbar-logo" data-ui="ox-appbar-logo">{@render logo()}</div>
    {:else}
      <span class="ox-appbar-title" class:mobile-hidden={isMobile}>{title}</span>
    {/if}

    <!-- Clock leading (before clock) -->
    {#if clockLeading}
      {@render clockLeading()}
    {/if}

    <!-- Clock (after branding, before tabs) -->
    {#if showClock}
      <OxAppClock showSeconds={isMobile} showTz={false} showIcon={true} />
    {/if}

    <!-- Menus centrés (nav links) -->
    {#if isDesktop && hasMenuItems}
      <nav class="ox-appbar-menu" data-ui="ox-appbar-menu">
        {#each menuItems as item}
          <OxNavMenuItem
            id={item.id}
            label={item.label}
            active={activeMenuId === item.id}
            href={item.href}
            target={item.target}
            onclick={(id) => handleMenuClick(id)}
          />
        {/each}
      </nav>
    {/if}

    <!-- PAIR 1 desktop : tabs centrées -->
    {#if isDesktop && hasAppbarItems}
      <nav class="ox-appbar-tabs" data-ui="ox-appbar-tabs">
        {#each appbarItems as item}
          {#if item.href}
            <a
              class="ox-appbar-tab"
              class:active={activeAppbarId === item.id}
              href={item.href}
              target={item.target}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              onclick={() => handleAppbarClick(item.id)}
              data-ui="ox-tab-{item.id}"
            >
              {item.label}
            </a>
          {:else}
            <button
              class="ox-appbar-tab"
              class:active={activeAppbarId === item.id}
              onclick={() => handleAppbarClick(item.id)}
              data-ui="ox-tab-{item.id}"
            >
              {item.label}
            </button>
          {/if}
        {/each}
      </nav>
    {/if}

    <!-- Trailing slot (search, actions, version…) -->
    {#if appbarContent}
      <div class="ox-appbar-trailing" data-ui="ox-appbar-trailing">
        {@render appbarContent()}
      </div>
    {/if}

    <!-- Search slot — desktop: dans l'AppBar | mobile: migre dans le drawer gauche -->
    {#if searchContent && isDesktop}
      <div class="ox-appbar-search" data-ui="ox-appbar-search">
        {@render searchContent()}
      </div>
    {/if}

    <!-- Login button trigger (PAIR 4) -->
    {#if loginButton}
      <div class="ox-appbar-login" data-ui="ox-appbar-login">
        <button
          class="ox-login-trigger"
          class:open={loginDrawerOpen}
          onclick={toggleLoginDrawer}
          aria-label="Compte utilisateur"
          aria-expanded={loginDrawerOpen}
          data-ui="ox-login-btn"
        >
          {@render loginButton({ open: loginDrawerOpen })}
        </button>
      </div>
    {/if}

  </header>

  <!-- ════════════════════════════════════
       BODY
       ════════════════════════════════════ -->
  <div class="ox-shell-body" data-ui="ox-shell-body">

    <!-- ══ DESKTOP ══════════════════════ -->
    {#if isDesktop}

      <!-- PAIR 2 desktop : Sidebar — en mode normal (sans toolbar), rendue ici dans le body -->
      {#if hasNav && !hasHeaderSidebarToolbarFirst}
        {@render desktopSidebar()}
      {/if}

      <!-- Main desktop -->
      <div class="ox-main" data-ui="ox-main">

        <!-- PAIR 3 desktop : Toolbar -->
        {#if hasToolbar}
          <div class="ox-toolbar" data-ui="ox-toolbar">
            {#if toolbarContent}
              {@render toolbarContent()}
            {:else}
              {#each toolbarItems as item}
                <button
                  class="ox-toolbar-item"
                  class:active={activeToolbarId === item.id}
                  onclick={() => handleToolbarClick(item.id)}
                  data-ui="ox-toolbar-{item.id}"
                >
                  {#if item.iconSvg || item.iconComponent}
                    <span class="ox-toolbar-icon">{#if item.iconComponent}{@const IconC = item.iconComponent}<IconC size={18} strokeWidth={item.iconStrokeWidth ?? 2} />{:else}{@html item.iconSvg}{/if}</span>
                  {/if}
                  <span class="ox-toolbar-label">{item.label}</span>
                </button>
              {/each}
            {/if}
          </div>
        {/if}

        <!-- PAIR 3b desktop : Toolbar2 -->
        {#if hasToolbar2}
          <div class="ox-toolbar ox-toolbar--2" data-ui="ox-toolbar-2">
            {#if toolbar2Content}
              {@render toolbar2Content()}
            {:else}
              {#each toolbar2Items as item}
                <button
                  class="ox-toolbar-item"
                  class:active={activeToolbar2Id === item.id}
                  onclick={() => handleToolbar2Click(item.id)}
                  data-ui="ox-toolbar2-{item.id}"
                >
                  {#if item.iconSvg || item.iconComponent}
                    <span class="ox-toolbar-icon">{#if item.iconComponent}{@const IconC = item.iconComponent}<IconC size={18} strokeWidth={item.iconStrokeWidth ?? 2} />{:else}{@html item.iconSvg}{/if}</span>
                  {/if}
                  <span class="ox-toolbar-label">{item.label}</span>
                </button>
              {/each}
            {/if}
          </div>
        {/if}

        <main class="ox-content" data-ui="ox-content">
          {#if children}{@render children()}{/if}
        </main>
      </div>

    <!-- ══ MOBILE ════════════════════════ -->
    {:else}

      <!-- PAIR 2 mobile : Rail gauche (navItems ou sidebarContent) -->
      {#if hasNav}
        <aside class="ox-rail ox-rail--left" data-ui="ox-rail-left">
          <!-- Toggle EN HAUT → expand vers la droite -->
          <button
            class="ox-rail-toggle"
            onclick={toggleRailLeft}
            aria-label="Agrandir la navigation"
            data-ui="ox-rail-left-toggle"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
          {#if railLeftIcon}
            <button class="ox-rail-icon-btn" onclick={toggleRailLeft} data-ui="ox-rail-left-icon">
              {@render railLeftIcon()}
            </button>
          {/if}
          {#if navItems.length > 0}
            {#each navItems as item}
              {#if item.kind === 'divider'}
                <div class="ox-sidebar-divider" data-ui="ox-rail-left-divider-{item.id}"></div>
              {:else if item.kind === 'sectionLabel'}
                <!-- Rail mobile = icons only : section labels masqués via CSS -->
                <div class="ox-sidebar-section-label" data-ui="ox-rail-left-section-{item.id}">{item.label}</div>
              {:else}
                <OxTooltip id="ox-rail-left-tip-{item.id}" label={item.label} placement="right">
                  <button
                    class="ox-rail-item"
                    class:active={activeNavId === item.id}
                    onclick={() => handleNavClick(item.id)}
                    aria-label={item.label}
                    data-ui="ox-rail-left-{item.id}"
                  >
                    {#if item.iconSvg || item.iconComponent}
                      <span class="ox-rail-icon">{#if item.iconComponent}{@const IconC = item.iconComponent}<IconC size={18} strokeWidth={item.iconStrokeWidth ?? 2} />{:else}{@html item.iconSvg}{/if}</span>
                    {:else}
                      <span class="ox-rail-initials">{item.label.slice(0, 2).toUpperCase()}</span>
                    {/if}
                  </button>
                </OxTooltip>
              {/if}
            {/each}
          {/if}
        </aside>
      {/if}

      <!-- Main mobile -->
      <div class="ox-main ox-main--mobile" data-ui="ox-main-mobile">
        <main class="ox-content" data-ui="ox-content">
          {#if children}{@render children()}{/if}
        </main>
      </div>

      <!-- PAIR 3 mobile : Rail droit (toolbarItems ou toolbarContent) -->
      {#if hasToolbar}
        <aside class="ox-rail ox-rail--right" data-ui="ox-rail-right">
          <!-- Toggle EN HAUT → expand vers la gauche -->
          <button
            class="ox-rail-toggle"
            onclick={toggleRailRight}
            aria-label="Agrandir les actions"
            data-ui="ox-rail-right-toggle"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          {#if railRightIcon}
            <button class="ox-rail-icon-btn" onclick={toggleRailRight} data-ui="ox-rail-right-icon">
              {@render railRightIcon()}
            </button>
          {/if}
          {#if toolbarContent}
            <!-- toolbarContent rendu en mode fold (icônes seules + tooltips) -->
            <div class="ox-rail-content-strip" onclick={toggleRailRight} role="none">
              <OxRailContextProvider collapsed={true}>
                {#snippet children()}{@render toolbarContent()}{/snippet}
              </OxRailContextProvider>
            </div>
          {:else if toolbarItems.length > 0}
            {#each toolbarItems as item}
              <OxTooltip id="ox-rail-right-tip-{item.id}" label={item.label} placement="left">
                <button
                  class="ox-rail-item"
                  class:active={activeToolbarId === item.id}
                  onclick={() => handleToolbarClick(item.id)}
                  aria-label={item.label}
                  data-ui="ox-rail-right-{item.id}"
                >
                  {#if item.iconSvg || item.iconComponent}
                    <span class="ox-rail-icon">{#if item.iconComponent}{@const IconC = item.iconComponent}<IconC size={18} strokeWidth={item.iconStrokeWidth ?? 2} />{:else}{@html item.iconSvg}{/if}</span>
                  {:else}
                    <span class="ox-rail-initials">{item.label.slice(0, 2).toUpperCase()}</span>
                  {/if}
                </button>
              </OxTooltip>
            {/each}
          {/if}
        </aside>
      {/if}

      <!-- PAIR 3b mobile : Rail droit 2 (toolbar2Items ou toolbar2Content) -->
      {#if hasToolbar2}
        <aside class="ox-rail ox-rail--right ox-rail--right2" data-ui="ox-rail-right2">
          <!-- Toggle EN HAUT → expand vers la gauche -->
          <button
            class="ox-rail-toggle"
            onclick={toggleRailRight2}
            aria-label="Agrandir les actions 2"
            data-ui="ox-rail-right2-toggle"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          {#if railRight2Icon}
            <button class="ox-rail-icon-btn" onclick={toggleRailRight2} data-ui="ox-rail-right2-icon">
              {@render railRight2Icon()}
            </button>
          {/if}
          {#if toolbar2Content}
            <!-- toolbar2Content rendu en mode fold (icônes seules + tooltips) -->
            <div class="ox-rail-content-strip" onclick={toggleRailRight2} role="none">
              <OxRailContextProvider collapsed={true}>
                {#snippet children()}{@render toolbar2Content()}{/snippet}
              </OxRailContextProvider>
            </div>
          {:else if toolbar2Items.length > 0}
            {#each toolbar2Items as item}
              <OxTooltip id="ox-rail-right2-tip-{item.id}" label={item.label} placement="left">
                <button
                  class="ox-rail-item"
                  class:active={activeToolbar2Id === item.id}
                  onclick={() => handleToolbar2Click(item.id)}
                  aria-label={item.label}
                  data-ui="ox-rail-right2-{item.id}"
                >
                  {#if item.iconSvg || item.iconComponent}
                    <span class="ox-rail-icon">{#if item.iconComponent}{@const IconC = item.iconComponent}<IconC size={18} strokeWidth={item.iconStrokeWidth ?? 2} />{:else}{@html item.iconSvg}{/if}</span>
                  {:else}
                    <span class="ox-rail-initials">{item.label.slice(0, 2).toUpperCase()}</span>
                  {/if}
                </button>
              </OxTooltip>
            {/each}
          {/if}
        </aside>
      {/if}

      <!-- Rail overlays (exclusive) + scrim -->
      {#if railLeftOpen || railRightOpen || railRight2Open}
        <div class="ox-rail-scrim" onclick={closeRails} onkeydown={(e) => e.key === 'Escape' && closeRails()} role="button" tabindex="-1" aria-label="Fermer" data-ui="ox-rail-scrim"></div>
      {/if}

      {#if railLeftOpen && hasNav}
        <aside class="ox-rail-overlay ox-rail-overlay--left" data-ui="ox-rail-overlay-left">
          <!-- Flèche ‹ haut-gauche -->
          <button class="ox-rail-overlay-close ox-rail-overlay-close--left" onclick={closeRails} aria-label="Fermer">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          {#if sidebarContent}
            {@render sidebarContent()}
          {:else}
            {#each navItems as item}
              {#if item.kind === 'divider'}
                <div class="ox-sidebar-divider" data-ui="ox-rail-overlay-left-divider-{item.id}"></div>
              {:else if item.kind === 'sectionLabel'}
                <div class="ox-sidebar-section-label" data-ui="ox-rail-overlay-left-section-{item.id}">{item.label}</div>
              {:else}
                <button
                  class="ox-sidebar-item"
                  class:active={activeNavId === item.id}
                  onclick={() => { handleNavClick(item.id); closeRails() }}
                  data-ui="ox-rail-overlay-left-{item.id}"
                >
                  {#if item.iconSvg || item.iconComponent}
                    <span class="ox-sidebar-icon">{#if item.iconComponent}{@const IconC = item.iconComponent}<IconC size={18} strokeWidth={item.iconStrokeWidth ?? 2} />{:else}{@html item.iconSvg}{/if}</span>
                  {/if}
                  <span class="ox-sidebar-label">{item.label}</span>
                  {#if item.badge != null}
                    <span class="ox-sidebar-badge">{item.badge}</span>
                  {/if}
                </button>
              {/if}
            {/each}
          {/if}
        </aside>
      {/if}

      {#if railRightOpen && hasToolbar}
        <aside class="ox-rail-overlay ox-rail-overlay--right" data-ui="ox-rail-overlay-right">
          <!-- Flèche › haut-droite -->
          <button class="ox-rail-overlay-close ox-rail-overlay-close--right" onclick={closeRails} aria-label="Fermer">
            <ChevronRight size={20} strokeWidth={2} />
          </button>
          {#if toolbarContent}
            <!-- Rendu en mode unfold (icône + label) -->
            <div class="ox-rail-overlay-content">
              <OxRailContextProvider collapsed={false}>
                {#snippet children()}{@render toolbarContent()}{/snippet}
              </OxRailContextProvider>
            </div>
          {:else}
            {#each toolbarItems as item}
              <button
                class="ox-sidebar-item"
                class:active={activeToolbarId === item.id}
                onclick={() => { handleToolbarClick(item.id); closeRails() }}
                data-ui="ox-rail-overlay-right-{item.id}"
              >
                {#if item.iconSvg || item.iconComponent}
                  <span class="ox-sidebar-icon">{#if item.iconComponent}{@const IconC = item.iconComponent}<IconC size={18} strokeWidth={item.iconStrokeWidth ?? 2} />{:else}{@html item.iconSvg}{/if}</span>
                {/if}
                <span class="ox-sidebar-label">{item.label}</span>
              </button>
            {/each}
          {/if}
        </aside>
      {/if}

      {#if railRight2Open && hasToolbar2}
        <aside class="ox-rail-overlay ox-rail-overlay--right" data-ui="ox-rail-overlay-right2">
          <!-- Flèche › haut-droite -->
          <button class="ox-rail-overlay-close ox-rail-overlay-close--right" onclick={closeRails} aria-label="Fermer">
            <ChevronRight size={20} strokeWidth={2} />
          </button>
          {#if toolbar2Content}
            <!-- Rendu en mode unfold (icône + label) -->
            <div class="ox-rail-overlay-content">
              <OxRailContextProvider collapsed={false}>
                {#snippet children()}{@render toolbar2Content()}{/snippet}
              </OxRailContextProvider>
            </div>
          {:else}
            {#each toolbar2Items as item}
              <button
                class="ox-sidebar-item"
                class:active={activeToolbar2Id === item.id}
                onclick={() => { handleToolbar2Click(item.id); closeRails() }}
                data-ui="ox-rail-overlay-right2-{item.id}"
              >
                {#if item.iconSvg || item.iconComponent}
                  <span class="ox-sidebar-icon">{#if item.iconComponent}{@const IconC = item.iconComponent}<IconC size={18} strokeWidth={item.iconStrokeWidth ?? 2} />{:else}{@html item.iconSvg}{/if}</span>
                {/if}
                <span class="ox-sidebar-label">{item.label}</span>
              </button>
            {/each}
          {/if}
        </aside>
      {/if}

      <!-- PAIR 1 mobile : Sheet overlay (menuItems + appbarItems + search) -->
      {#if drawerOpen && hasDrawer}
        <div
          class="ox-drawer-scrim"
          onclick={closeDrawer}
          onkeydown={(e) => e.key === 'Escape' && closeDrawer()}
          role="button"
          tabindex="-1"
          aria-label="Fermer"
          data-ui="ox-drawer-scrim"
          transition:fade={{ duration: 220 }}
        ></div>
        <aside
          class="ox-drawer"
          data-ui="ox-drawer"
          transition:fly={{ x: -300, duration: 280, easing: cubicOut }}
        >
          <!-- Sheet header — titre du site -->
          <div class="ox-drawer-header" data-ui="ox-drawer-header">
            <span class="ox-drawer-title">{title}</span>
          </div>

          <!-- Search (mobile only — migré depuis l'AppBar) -->
          {#if searchContent}
            <div class="ox-drawer-search" data-ui="ox-drawer-search">
              {@render searchContent()}
            </div>
          {/if}

          {#if drawerContent}
            {@render drawerContent()}
          {:else}
            <ul class="ox-drawer-list">
              {#each menuItems as item}
                <li>
                  {#if item.href}
                    <a
                      class="ox-drawer-item"
                      class:active={activeMenuId === item.id}
                      href={item.href}
                      target={item.target}
                      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      onclick={() => handleMenuClick(item.id)}
                      data-ui="ox-drawer-menu-{item.id}"
                    >
                      {#if item.iconSvg || item.iconComponent}
                        <span class="ox-drawer-icon">{@html item.iconSvg}</span>
                      {/if}
                      <span class="ox-drawer-item-label">{item.label}</span>
                    </a>
                  {:else}
                    <button
                      class="ox-drawer-item"
                      class:active={activeMenuId === item.id}
                      onclick={() => handleMenuClick(item.id)}
                      data-ui="ox-drawer-menu-{item.id}"
                    >
                      {#if item.iconSvg || item.iconComponent}
                        <span class="ox-drawer-icon">{@html item.iconSvg}</span>
                      {/if}
                      <span class="ox-drawer-item-label">{item.label}</span>
                    </button>
                  {/if}
                </li>
              {/each}
              {#each appbarItems as item}
                <li>
                  {#if item.href}
                    <a
                      class="ox-drawer-item"
                      class:active={activeAppbarId === item.id}
                      href={item.href}
                      target={item.target}
                      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      onclick={() => handleAppbarClick(item.id)}
                      data-ui="ox-drawer-{item.id}"
                    >
                      {#if item.iconSvg || item.iconComponent}
                        <span class="ox-drawer-icon">{@html item.iconSvg}</span>
                      {/if}
                      <span class="ox-drawer-item-label">{item.label}</span>
                      {#if item.badge != null}
                        <span class="ox-sidebar-badge">{item.badge}</span>
                      {/if}
                    </a>
                  {:else}
                    <button
                      class="ox-drawer-item"
                      class:active={activeAppbarId === item.id}
                      onclick={() => handleAppbarClick(item.id)}
                      data-ui="ox-drawer-{item.id}"
                    >
                      {#if item.iconSvg || item.iconComponent}
                        <span class="ox-drawer-icon">{@html item.iconSvg}</span>
                      {/if}
                      <span class="ox-drawer-item-label">{item.label}</span>
                      {#if item.badge != null}
                        <span class="ox-sidebar-badge">{item.badge}</span>
                      {/if}
                    </button>
                  {/if}
                </li>
              {/each}

              <!-- Bloc custom (ex: sélecteur d'entreprise mobile) — rendu après
                   les menu/appbar items, avant les footerItems légaux. -->
              {#if drawerSection}
                <li class="ox-drawer-sep" aria-hidden="true"></li>
                <li class="ox-drawer-section" data-ui="ox-drawer-section">
                  {@render drawerSection()}
                </li>
              {/if}

              <!-- PAIR 5 : mini-footer items en bas du drawer, sous séparation -->
              {#if footerItems.length > 0}
                <li class="ox-drawer-sep" aria-hidden="true"></li>
                {#each footerItems as item}
                  <li>
                    <a
                      class="ox-drawer-item ox-drawer-item--footer"
                      href={item.href}
                      onclick={() => handleFooterClick(item.id)}
                      data-ui="ox-drawer-footer-{item.id}"
                    >
                      {#if item.iconSvg || item.iconComponent}
                        <span class="ox-drawer-icon">{@html item.iconSvg}</span>
                      {/if}
                      <span class="ox-drawer-item-label">{item.label}</span>
                    </a>
                  </li>
                {/each}
              {/if}
            </ul>
          {/if}
        </aside>
      {/if}

    {/if}
  </div>

  <!-- ════════════════════════════════════
       PAIR 5 — MINI-FOOTER (desktop only — mobile = bottom du drawer)
       Barre fixe 64px en bas du shell : liens centrés, fond surface-2.
       ════════════════════════════════════ -->
  {#if isDesktop && hasFooter}
    <footer class="ox-mini-footer" data-ui="ox-mini-footer">
      {#if footerContent}
        {@render footerContent()}
      {:else}
        <nav class="ox-mini-footer-nav" aria-label="Footer">
          {#each footerItems as item}
            <a
              class="ox-mini-footer-link"
              href={item.href}
              onclick={() => handleFooterClick(item.id)}
              data-ui="ox-mini-footer-{item.id}"
            >
              {item.label}
            </a>
          {/each}
        </nav>
      {/if}
    </footer>
  {/if}

  <!-- ════════════════════════════════════
       PAIR 4 — LOGIN SHEET (desktop + mobile)
       Desktop : dropdown sous l'avatar (top-right)
       Mobile  : sheet slide-in depuis la droite
       ════════════════════════════════════ -->
  {#if loginDrawerOpen && loginButton}
    <div
      class="ox-login-scrim"
      class:desktop={isDesktop}
      onclick={closeLoginDrawer}
      onkeydown={(e) => e.key === 'Escape' && closeLoginDrawer()}
      role="button"
      tabindex="-1"
      aria-label="Fermer"
      data-ui="ox-login-scrim"
    ></div>
    <aside
      class="ox-login-sheet"
      class:desktop={isDesktop}
      class:mobile={isMobile}
      data-ui="ox-login-sheet"
    >
      <!-- Fermer (mobile seulement — header de la sheet) -->
      {#if isMobile}
        <div class="ox-login-sheet-header">
          <span class="ox-login-sheet-title">Mon compte</span>
          <button class="ox-login-sheet-close" onclick={closeLoginDrawer} aria-label="Fermer" data-ui="ox-login-sheet-close">
            <X size={20} strokeWidth={2} />
          </button>
        </div>
      {/if}
      {#if loginDrawerContent}
        <div class="ox-login-sheet-body">
          {@render loginDrawerContent()}
        </div>
      {/if}
    </aside>
  {/if}

</div>

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ROOT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-shell {
    display: flex;
    flex-direction: column;
    height: var(--ox-shell-height, 100dvh);
    background: var(--ox-surface, #FFFBFE);
    overflow: hidden;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     HEADER-SIDEBAR-TOOLBAR--FIRST — grid layout desktop
     Hiérarchie : Header 100% width (row 1) → Sidebar full h (col 1, row 2) → Toolbar/Content (col 2, row 2)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-shell.header-sidebar-toolbar--first.desktop {
    display: grid;
    grid-template-columns: var(--_sidebar-current-w, 220px) 1fr;
    grid-template-rows: 64px 1fr auto;
  }
  .ox-shell.header-sidebar-toolbar--first.desktop > .ox-appbar {
    grid-column: 1 / span 2;
    grid-row: 1;
  }
  .ox-shell.header-sidebar-toolbar--first.desktop > .ox-sidebar {
    grid-column: 1;
    grid-row: 2;
  }
  .ox-shell.header-sidebar-toolbar--first.desktop > .ox-shell-body {
    grid-column: 2;
    grid-row: 2;
  }
  .ox-shell.header-sidebar-toolbar--first.desktop > .ox-mini-footer {
    grid-column: 1 / span 2;
    grid-row: 3;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     APPBAR
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  /* Tokens appbar :
       --ox-appbar-height   hauteur (défaut 64px)
       --ox-appbar-bg       background
       --ox-appbar-padding  padding horizontal
       --ox-appbar-z        z-index (défaut 10) */
  .ox-appbar {
    display: flex;
    align-items: center;
    height: var(--ox-appbar-height, 64px);
    flex-shrink: 0;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    background: var(--ox-appbar-bg, var(--ox-surface-1, #FFFBFE));
    padding: var(--ox-appbar-padding, 0 8px);
    gap: 0;
    z-index: var(--ox-appbar-z, 10);
    overflow: visible;
    position: relative; /* ← requis pour centrage absolu des menus */
    /* Shadow raffinée inspirée webagency2 */
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.07),
      0 2px 4px -2px rgba(0, 0, 0, 0.05);
  }

  /* ── Burger cell (mobile) ── */
  .ox-appbar-burger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 100%;
    flex-shrink: 0;
    border-right: 1px solid var(--ox-outline-variant, #CAC4D0);
  }

  .ox-appbar-title {
    font: 700 14px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
    padding: 0 14px;
  }

  .mobile .ox-appbar {
    height: 64px;
    padding: 0;
  }
  /* Title texte masqué sur mobile (le nom s'affiche dans le sheet header) */
  .ox-appbar-title.mobile-hidden {
    display: none;
  }

  /* Tabs centrées (PAIR 1 desktop) — position absolue pour vrai centrage dans le header */
  .ox-appbar-tabs {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 0 8px;
    pointer-events: auto;
  }

  .ox-appbar-tab {
    display: flex;
    align-items: center;
    padding: 5px 14px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 999px;
    color: var(--ox-on-surface-variant, #49454F);
    font: 500 13px system-ui;
    text-decoration: none;
    transition: background 100ms, color 100ms;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .ox-appbar-tab:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-appbar-tab.active {
    background: var(--ox-secondary-container, #E8DEF8);
    color: var(--ox-on-secondary-container, #1D192B);
    font-weight: 600;
  }

  /* Menu links centrés (nav underline style) — position absolue pour vrai centrage dans le header */
  .ox-appbar-menu {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    pointer-events: auto;
  }

  /* Logo slot */
  .ox-appbar-logo {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 0 12px;
  }
  /* Sur mobile, le logo reste à gauche (flex-shrink:0), le trailing a margin-left:auto */
  .mobile .ox-appbar-logo {
    flex-shrink: 0;
    padding: 0 14px;
  }

  /* Mobile : masquer le texte branding — seule l'icône reste visible */
  .mobile .ox-appbar-logo :global(.ox-branding-name) {
    display: none;
  }

  /* Search slot — desktop : prend espace, pousse à droite */
  .ox-appbar-search {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
    max-width: 320px;
    margin-left: auto;
    padding: 0 12px;
  }

  /* Trailing slot — conteneur des cellules à droite */
  .ox-appbar-trailing {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 0;
    flex-shrink: 0;
    margin-left: auto;
  }

  /* ── Cellule utilitaire — usage dans appbarContent / trailing ──
     <button class="ox-appbar-cell">...</button>
     ou <a class="ox-appbar-cell">...</a>
     Chaque cellule = carré pleine hauteur + séparateur gauche */
  :global(.ox-appbar-cell) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-width: 56px;
    padding: 0 10px;
    flex-shrink: 0;
    border-left: 1px solid var(--ox-outline-variant, #CAC4D0);
    cursor: pointer;
    background: none;
    border-top: none;
    border-right: none;
    border-bottom: none;
    transition: background 100ms;
    text-decoration: none;
    color: var(--ox-on-surface, #1C1B1F);
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
  }
  :global(.ox-appbar-cell:hover) {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 5%, transparent);
  }
  :global(.ox-appbar-cell--no-sep) {
    border-left: none;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     BODY
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-shell-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     DESKTOP — SIDEBAR (PAIR 2)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  /* Tokens sidebar (container) :
       --ox-sidebar-bg      background
       --ox-sidebar-padding padding interne du container */
  .ox-sidebar {
    width: var(--_sidebar-w, 220px);
    flex-shrink: 0;
    border-right: 1px solid var(--ox-outline-variant, #CAC4D0);
    background: var(--ox-sidebar-bg, var(--ox-surface-1, #F7F2FA));
    padding: var(--ox-sidebar-padding, 0);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .ox-sidebar::-webkit-scrollbar { width: 4px; }
  .ox-sidebar::-webkit-scrollbar-thumb {
    background: var(--ox-outline-variant, #CAC4D0);
    border-radius: 2px;
  }

  .ox-sidebar-nav-header {
    padding: 12px 20px 14px;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    margin-bottom: 8px;
  }

  /* ▓ Sidebar items — Axel v2 :
     - Margin G/D 8px pour ne plus toucher les bordures du sidebar
     - Border-radius 10px (coins arrondis modernes)
     - Padding interne 8px 12px (symétrique vertical, gap horizontal cohérent)
     - Active : BG plus défini sans la barre verticale (le BG arrondi suffit)

     Tokens exposés (surcharge possible via .ds4-zone ou autre conteneur
     parent du shell — voir Book → Theming → Tokens par composant) :
       --ox-sidebar-item-gap          gap icône↔label
       --ox-sidebar-item-margin       margin du bouton
       --ox-sidebar-item-padding      padding interne
       --ox-sidebar-item-radius       border-radius
       --ox-sidebar-item-color        couleur texte par défaut
       --ox-sidebar-item-font         shorthand font:
       --ox-sidebar-item-text-shadow  text-shadow (défaut none)
       --ox-sidebar-item-hover-bg     bg au hover
       --ox-sidebar-item-hover-color  color au hover
       --ox-sidebar-item-active-bg    bg sur état actif
       --ox-sidebar-item-active-color color sur état actif
       --ox-sidebar-item-active-weight font-weight sur état actif
       --ox-sidebar-item-active-hover-bg bg sur active:hover */
  .ox-sidebar-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--ox-sidebar-item-gap, 10px);
    margin: var(--ox-sidebar-item-margin, 1px 8px);
    padding: var(--ox-sidebar-item-padding, 8px 12px);
    border: none;
    background: none;
    width: calc(100% - 16px);
    text-align: left;
    cursor: pointer;
    color: var(--ox-sidebar-item-color, var(--ox-on-surface-variant, #49454F));
    font: var(--ox-sidebar-item-font, 400 13px system-ui);
    text-shadow: var(--ox-sidebar-item-text-shadow, none);
    border-radius: var(--ox-sidebar-item-radius, 10px);
    transition: background 120ms, color 120ms;
  }
  .ox-sidebar-item:hover {
    background: var(--ox-sidebar-item-hover-bg, color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent));
    color: var(--ox-sidebar-item-hover-color, var(--ox-on-surface, #1C1B1F));
  }
  .ox-sidebar-item.active {
    background: var(--ox-sidebar-item-active-bg, color-mix(in srgb, var(--ox-primary, #6750A4) 14%, transparent));
    color: var(--ox-sidebar-item-active-color, var(--ox-on-surface, #1C1B1F));
    font-weight: var(--ox-sidebar-item-active-weight, 600);
  }
  .ox-sidebar-item.active:hover {
    background: var(--ox-sidebar-item-active-hover-bg, color-mix(in srgb, var(--ox-primary, #6750A4) 20%, transparent));
  }
  /* La barre verticale ::before est retirée : avec les coins arrondis et le
     BG plus défini, le marqueur visuel d'actif est suffisamment clair sans.

     Tokens icône :
       --ox-sidebar-icon-size      taille du wrapper (défaut 20px)
       --ox-sidebar-icon-svg-size  taille du svg interne (défaut auto) */
  .ox-sidebar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--ox-sidebar-icon-size, 20px);
    height: var(--ox-sidebar-icon-size, 20px);
    flex-shrink: 0;
  }
  .ox-sidebar-icon :global(svg) {
    display: block;
    width: var(--ox-sidebar-icon-svg-size, auto);
    height: var(--ox-sidebar-icon-svg-size, auto);
  }
  .ox-sidebar-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ox-sidebar-badge {
    font: 500 10px system-ui;
    background: var(--ox-surface-3, #E0DAE8);
    color: var(--ox-on-surface-variant, #49454F);
    padding: 1px 6px;
    border-radius: 999px;
    flex-shrink: 0;
  }
  .ox-sidebar-item.active .ox-sidebar-badge {
    background: var(--ox-on-primary-container, #21005D);
    color: var(--ox-primary-container, #EADDFF);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     SIDEBAR DIVIDER + SECTION LABEL
     Insérés dans navItems via les kinds 'divider' et 'sectionLabel'.
     Le divider trace une ligne entre groupes ; le section label est un petit
     titre discret uppercase au-dessus d'une section.
     Rail mode : le section label est masqué (pas la place) ; le divider reste.
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  /* Tokens divider :
       --ox-sidebar-divider-bg     couleur de la ligne
       --ox-sidebar-divider-margin marges autour de la ligne */
  .ox-sidebar-divider {
    height: 1px;
    background: var(--ox-sidebar-divider-bg, var(--ox-outline-variant, #CAC4D0));
    margin: var(--ox-sidebar-divider-margin, 10px 16px);
    flex-shrink: 0;
  }
  /* Tokens section label :
       --ox-sidebar-section-font           shorthand font:
       --ox-sidebar-section-letter-spacing letter-spacing
       --ox-sidebar-section-color          couleur du titre
       --ox-sidebar-section-padding        padding */
  .ox-sidebar-section-label {
    font: var(--ox-sidebar-section-font, 600 0.7rem system-ui);
    text-transform: uppercase;
    letter-spacing: var(--ox-sidebar-section-letter-spacing, 0.06em);
    color: var(--ox-sidebar-section-color, var(--ox-on-surface-variant, #666));
    padding: var(--ox-sidebar-section-padding, 12px 20px 6px);
    flex-shrink: 0;
  }
  /* Rail mode : section label masqué (pas la place pour du texte). */
  .ox-sidebar--rail .ox-sidebar-section-label,
  .ox-rail .ox-sidebar-section-label {
    display: none;
  }
  /* Rail mode : divider plus court (centré dans le rail étroit). */
  .ox-sidebar--rail .ox-sidebar-divider,
  .ox-rail .ox-sidebar-divider {
    margin: 8px 6px;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     DESKTOP — MAIN + TOOLBAR (PAIR 3)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .ox-main--mobile { flex: 1; }

  .ox-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 48px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    background: var(--ox-surface-1, #F7F2FA);
    /* --ox-toolbar-gap : token unique — contrôle gap inter-items ET padding bords (left/right)
       → garantit un espacement identique partout : [gap][item][gap][item][gap][item][gap] */
    padding: 0 var(--ox-toolbar-gap, 8px);
    gap: var(--ox-toolbar-gap, 8px);
    overflow: hidden;
  }

  .ox-toolbar-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: var(--ox-shape-sm, 4px);
    color: var(--ox-on-surface-variant, #49454F);
    font: 400 12px system-ui;
    transition: background 100ms, color 100ms;
    white-space: nowrap;
  }
  .ox-toolbar-item:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-toolbar-item.active {
    background: var(--ox-secondary-container, #E8DEF8);
    color: var(--ox-on-secondary-container, #1D192B);
    font-weight: 600;
  }
  .ox-toolbar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
  }
  .ox-toolbar-icon :global(svg) { display: block; }
  .ox-toolbar-label { line-height: 1; }

  /* Toolbar2 — bande secondaire, fond légèrement plus foncé */
  .ox-toolbar--2 {
    background: var(--ox-surface-2, #EDE8F3);
  }

  .ox-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     MOBILE — RAILS (PAIR 2 + PAIR 3)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-rail {
    width: 64px;
    flex-shrink: 0;
    background: var(--ox-surface-1, #F7F2FA);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    gap: 2px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .ox-rail--left  { border-right: 1px solid var(--ox-outline-variant, #CAC4D0); }
  .ox-rail--right { border-left:  1px solid var(--ox-outline-variant, #CAC4D0); }

  .ox-rail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 52px;
    padding: 8px 4px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 10px;
    color: var(--ox-on-surface-variant, #49454F);
    transition: background 100ms, color 100ms;
    flex-shrink: 0;
  }
  .ox-rail-item:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-rail-item.active {
    background: var(--ox-primary-container, color-mix(in srgb, var(--ox-primary, #6750A4) 16%, transparent));
    color: var(--ox-on-primary-container, #21005D);
    font-weight: 600;
  }
  .ox-rail-item.active:hover {
    background: color-mix(in srgb, var(--ox-primary-container, #EADDFF) 92%, var(--ox-on-primary-container));
  }
  .ox-rail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }
  .ox-rail-icon :global(svg) { display: block; }
  .ox-rail-initials {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--ox-shape-sm, 4px);
    background: var(--ox-surface-3, #E0DAE8);
    font: 600 10px system-ui;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }
  .ox-rail-item.active .ox-rail-initials {
    background: var(--ox-on-primary-container, #21005D);
    color: var(--ox-primary-container, #EADDFF);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     MOBILE — DRAWER (PAIR 1)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-drawer-header {
    display: flex;
    align-items: center;
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    flex-shrink: 0;
  }
  .ox-drawer-title {
    font: 700 16px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    letter-spacing: -0.02em;
  }

  /* Search migré dans le drawer (mobile uniquement) */
  .ox-drawer-search {
    padding: 12px 16px;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    flex-shrink: 0;
  }

  .ox-drawer-scrim {
    position: absolute;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.45);
  }

  .ox-drawer {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--_sidebar-w, 220px);
    z-index: 1001;
    background: var(--ox-surface-1, #F7F2FA);
    border-right: 1px solid var(--ox-outline-variant, #CAC4D0);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    box-shadow: 2px 0 16px rgba(0, 0, 0, 0.15);
  }
  .ox-drawer::-webkit-scrollbar { width: 4px; }
  .ox-drawer::-webkit-scrollbar-thumb {
    background: var(--ox-outline-variant, #CAC4D0);
    border-radius: 2px;
  }

  .ox-drawer-list {
    list-style: none;
    margin: 0;
    padding: 8px 0;
  }

  /* Drawer items (mobile sheet) — alignés sur la convention sidebar :
     margin G/D 8px, coins arrondis, padding interne symétrique. */
  .ox-drawer-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: calc(100% - 16px);
    margin: 1px 8px;
    padding: 10px 14px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    color: var(--ox-on-surface-variant, #49454F);
    font: 400 14px system-ui;
    text-decoration: none;
    transition: background 100ms, color 100ms;
    border-radius: 10px;
  }
  .ox-drawer-item:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-drawer-item.active {
    background: color-mix(in srgb, var(--ox-primary, #6750A4) 14%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
    font-weight: 600;
  }
  .ox-drawer-item.active:hover {
    background: color-mix(in srgb, var(--ox-primary, #6750A4) 20%, transparent);
  }
  .ox-drawer-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  .ox-drawer-icon :global(svg) { display: block; }
  .ox-drawer-item-label { flex: 1; }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     DESKTOP — SIDEBAR TOGGLE + RAIL MODE
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-sidebar--rail {
    width: 56px;
    align-items: center;
    padding: 4px 0;
    container-type: inline-size;
    container-name: ox-toolbar;
  }
  .ox-sidebar--rail .ox-sidebar-item {
    /* Mode rail (sidebar collapsed à 56px) : item icône-only centré, sans
       margin G/D pour rester centré dans le rail étroit. */
    margin: 1px 0;
    padding: 8px 4px;
    justify-content: center;
    width: 48px;
    border-radius: 10px;
  }
  .ox-sidebar--rail .ox-sidebar-label,
  .ox-sidebar--rail .ox-sidebar-badge { display: none; }

  .ox-sidebar-initials {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--ox-shape-sm, 4px);
    background: var(--ox-surface-3, #E0DAE8);
    font: 600 10px system-ui;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }
  .ox-sidebar-item.active .ox-sidebar-initials {
    background: var(--ox-on-primary-container, #21005D);
    color: var(--ox-primary-container, #EADDFF);
  }

  .ox-sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 44px;
    padding: 0 14px;
    margin-bottom: 8px;
    border: none;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    background: none;
    cursor: pointer;
    border-radius: 0;
    color: var(--ox-on-surface-variant, #49454F);
    transition: background 100ms, color 100ms;
    flex-shrink: 0;
  }
  .ox-sidebar-toggle:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     MOBILE — RAIL TOGGLE + OVERLAY
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-rail-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-bottom: 14px;  /* B9 mobile — espace visible avant le 1er item */
    border: none;
    background: none;
    cursor: pointer;
    border-radius: var(--ox-shape-sm, 4px);
    color: var(--ox-on-surface-variant, #49454F);
    transition: background 100ms, color 100ms;
    flex-shrink: 0;
  }
  .ox-rail-toggle:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
  }

  /* Icon button below toggle arrow */
  .ox-rail-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: var(--ox-shape-sm, 4px);
    color: var(--ox-on-surface-variant, #49454F);
    transition: background 100ms, color 100ms;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .ox-rail-icon-btn:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
  }

  .ox-rail-overlay-close {
    display: flex;
    align-items: center;
    width: 100%;
    height: 44px;
    padding: 0 14px;
    border: none;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    background: none;
    cursor: pointer;
    color: var(--ox-on-surface-variant, #49454F);
    flex-shrink: 0;
    transition: background 100ms;
  }
  .ox-rail-overlay-close--left  { justify-content: center; }
  .ox-rail-overlay-close--right { justify-content: center; }
  .ox-rail-overlay-close:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
  }

  .ox-rail-scrim {
    position: absolute;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.35);
  }

  .ox-rail-overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    width: var(--_sidebar-w, 220px);
    z-index: 1001;
    background: var(--ox-surface-1, #F7F2FA);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 16px rgba(0, 0, 0, 0.15);
  }
  .ox-rail-overlay--left  {
    left: 0;
    border-right: 1px solid var(--ox-outline-variant, #CAC4D0);
  }
  .ox-rail-overlay--right {
    right: 0;
    border-left: 1px solid var(--ox-outline-variant, #CAC4D0);
    box-shadow: -2px 0 16px rgba(0, 0, 0, 0.15);
  }
  .ox-rail-overlay::-webkit-scrollbar { width: 4px; }
  .ox-rail-overlay::-webkit-scrollbar-thumb {
    background: var(--ox-outline-variant, #CAC4D0);
    border-radius: 2px;
  }

  /* ── Contenu rail strip (fold) : icônes seules centrées ── */
  .ox-rail-content-strip {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    gap: 2px;
    padding: 4px 0;
    flex: 1;
    min-height: 0;
    /* CSS Container Queries — composants s'adaptent automatiquement */
    container-type: inline-size;
    container-name: ox-toolbar;
  }
  /* Masquer les éléments non-rail dans le strip (clock, separators, spacers) */
  .ox-rail-content-strip :global(.toolbar-clock),
  .ox-rail-content-strip :global([style*="w-px"]),
  .ox-rail-content-strip :global(.flex-1),
  .ox-rail-content-strip :global(.toolbar-section-label) {
    display: none;
  }
  /* Séparateurs inline (div 1px) → cachés */
  .ox-rail-content-strip :global(div[style*="background: var(--ox-outline-variant)"]) {
    display: none;
  }

  /* ── Contenu overlay (unfold) : liste verticale ── */
  .ox-rail-overlay-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 0;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    /* CSS Container Queries — composants s'adaptent automatiquement */
    container-type: inline-size;
    container-name: ox-toolbar;
  }
  /* En overlay : cacher clock et séparateurs */
  .ox-rail-overlay-content :global(.toolbar-clock),
  .ox-rail-overlay-content :global(.flex-1) {
    display: none;
  }
  .ox-rail-overlay-content :global(div[style*="background: var(--ox-outline-variant)"]) {
    display: none;
  }
  /* OxSwitch en overlay : wrapper */
  .ox-rail-overlay-content :global(.flex.items-center.gap-1) {
    padding: 4px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  /* OxChip en overlay */
  .ox-rail-overlay-content :global([data-ui="ox-chip"]) {
    margin: 4px 12px;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     PAIR 4 — LOGIN BUTTON + DRAWER
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */

  /* ── Login cell (PAIR 4) — pleine hauteur, séparateur gauche ── */
  .ox-appbar-login {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-width: 64px;
    box-sizing: border-box;  /* B12 — alignement avec rail droit (64px outer incl. border) */
    flex-shrink: 0;
    border-left: 1px solid var(--ox-outline-variant, #CAC4D0);
    margin-left: auto;   /* pousse à droite si pas de trailing */
  }
  /* Quand trailing existe avant login, pas de double margin-left auto */
  .ox-appbar-trailing + .ox-appbar-login,
  .ox-appbar-search + .ox-appbar-login {
    margin-left: 0;
  }

  /* Le trigger remplit la cellule */
  .ox-login-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 0;
    padding: 0 10px;
    transition: background 100ms, box-shadow 120ms;
    flex-shrink: 0;
  }
  .ox-login-trigger:hover {
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 5%, transparent);
  }
  .ox-login-trigger.open {
    box-shadow: inset 0 -2px 0 var(--ox-primary, #6750A4);
  }

  /* Scrim — symétrique du drawer gauche : commence SOUS l'AppBar (top: 64px),
     fond translucide + blur (glassmorphism). Desktop = transparent (dropdown
     léger sans assombrir l'écran). */
  .ox-login-scrim {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 198;
    background: rgba(0, 0, 0, 0.45);
  }
  .ox-login-scrim.desktop {
    top: 0;
    background: transparent;
  }

  /* Sheet commune */
  .ox-login-sheet {
    position: fixed;
    z-index: 199;
    background: var(--ox-surface-1, #F7F2FA);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .ox-login-sheet::-webkit-scrollbar { width: 4px; }
  .ox-login-sheet::-webkit-scrollbar-thumb {
    background: var(--ox-outline-variant, #CAC4D0);
    border-radius: 2px;
  }

  /* Sheet mobile : slide depuis la droite, commence SOUS l'AppBar (symétrique
     du drawer gauche qui commence en top: 0 dans .ox-main--mobile mais avec
     l'AppBar sticky au-dessus). Largeur identique au drawer gauche (--_sidebar-w
     fallback 280px). */
  .ox-login-sheet.mobile {
    top: 64px;
    right: 0;
    bottom: 0;
    width: var(--_sidebar-w, 280px);
    border-left: 1px solid var(--ox-outline-variant, #CAC4D0);
    box-shadow: -2px 0 16px rgba(0, 0, 0, 0.15);
    animation: ox-login-slide-in 280ms cubic-bezier(0.2, 0, 0, 1);
  }
  @keyframes ox-login-slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }

  /* Sheet desktop : dropdown JUSTE SOUS l'AppBar (top = hauteur appbar 64px
     + 4px de gap). B13 — avant: top:52px qui faisait chevaucher l'appbar.
     Aligné sur le comportement validé d'Axelo. */
  .ox-login-sheet.desktop {
    top: calc(var(--ox-appbar-height, 64px) + 4px);
    right: 12px;
    width: 240px;
    max-height: 480px;
    border-radius: var(--ox-shape-md, 12px);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
    animation: ox-login-dropdown-in 140ms ease-out;
  }
  @keyframes ox-login-dropdown-in {
    from { transform: translateY(-6px) scale(0.97); opacity: 0; }
    to   { transform: translateY(0)    scale(1);    opacity: 1; }
  }

  /* Header de la sheet (mobile) */
  .ox-login-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
    flex-shrink: 0;
  }
  .ox-login-sheet-title {
    font: 600 14px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-login-sheet-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: var(--ox-shape-sm, 4px);
    color: var(--ox-on-surface-variant, #49454F);
    transition: background 120ms;
  }
  .ox-login-sheet-close:hover { background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent); }

  .ox-login-sheet-body { flex: 1; }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     PAIR 5 — MINI-FOOTER
     Desktop : barre 64px en bas du shell, fond surface-2,
               miroir du header (border-top + box-shadow up).
     Mobile  : items insérés en bas du drawer gauche, sous séparation 1px.
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-mini-footer {
    flex-shrink: 0;
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    background: var(--ox-surface-2, #EDE8F3);
    border-top: 1px solid var(--ox-outline-variant, #CAC4D0);
    box-shadow:
      0 -4px 6px -1px rgba(0, 0, 0, 0.07),
      0 -2px 4px -2px rgba(0, 0, 0, 0.05);
    z-index: 10;
  }
  @media print {
    .ox-mini-footer { display: none !important; }
  }
  .ox-mini-footer-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    justify-content: center;
    align-items: center;
  }
  .ox-mini-footer-link {
    font: 500 0.82rem system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    text-decoration: none;
    padding: 6px 10px;
    border-radius: var(--ox-shape-sm, 6px);
    transition: color 120ms, background-color 120ms;
    white-space: nowrap;
  }
  .ox-mini-footer-link:hover {
    color: var(--ox-primary, #6750A4);
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 6%, transparent);
  }

  /* Séparation discrète entre items normaux et items footer dans le drawer mobile */
  .ox-drawer-sep {
    height: 1px;
    background: var(--ox-outline-variant, #CAC4D0);
    margin: 8px 12px;
    list-style: none;
  }
  .ox-drawer-item--footer {
    font-size: 0.85rem;
    color: var(--ox-on-surface-variant, #49454F);
    text-decoration: none;
  }
  .ox-drawer-section {
    list-style: none;
    padding: 4px 8px 0;
  }
</style>
