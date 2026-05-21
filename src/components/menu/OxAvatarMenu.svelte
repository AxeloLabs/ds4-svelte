<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxAvatarMenu — Avatar trigger + dropdown / drawer       │
   * │                                                         │
   * │ Desktop : dropdown absolu sous l'avatar (webagency2)    │
   * │ Mobile  : drawer fixe depuis la droite (below AppBar)   │
   * │                                                         │
   * │ Props:                                                   │
   * │   src          — URL image avatar (optionnel)           │
   * │   initials     — fallback si pas d'image (ex: "AX")    │
   * │   size         — taille px du bouton avatar (def 32)    │
   * │   alt          — texte alt de l'image                   │
   * │   items        — AvatarMenuItem[] (liste simple)        │
   * │   onSelect     — callback click item (id)               │
   * │   children     — slot custom (remplace items)           │
   * │   open         — $bindable contrôle externe             │
   * │   breakpoint   — seuil px mobile/desktop (def 850)      │
   * │   appbarHeight — hauteur AppBar mobile pour offset top  │
   * └─────────────────────────────────────────────────────────┘
   */
  import { onMount } from 'svelte'
  import { fly, fade } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import type { Snippet } from 'svelte'
  import type { AvatarMenuItem } from './avatar-menu-types.js'
  export type { AvatarMenuItem }

  interface Props {
    src?:           string
    initials?:      string
    size?:          number
    alt?:           string
    items?:         AvatarMenuItem[]
    onSelect?:      (id: string) => void
    children?:      Snippet
    open?:          boolean
    dropdownWidth?: number
    breakpoint?:    number
    appbarHeight?:  number
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // STATE
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let {
    src            = '',
    initials       = '?',
    size           = 32,
    alt            = 'Avatar',
    items          = [],
    onSelect,
    children,
    open           = $bindable(false),
    dropdownWidth  = 220,
    breakpoint     = 850,
    appbarHeight   = 57,
  }: Props = $props()

  let rootEl   = $state<HTMLElement | null>(null)
  let isMobile = $state(false)

  function open_()  { open = true }
  function close()  { open = false }

  function handleSelect(item: AvatarMenuItem) {
    if (item.disabled) return
    onSelect?.(item.id)
    close()
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
  }

  // ── Responsive detect ─────────────────────────
  function checkMobile() {
    isMobile = window.innerWidth < breakpoint
  }

  // ── Click outside (desktop only — mobile uses scrim) ──
  onMount(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)

    function onDocClick(e: MouseEvent) {
      if (!isMobile && rootEl && !rootEl.contains(e.target as Node)) close()
    }
    document.addEventListener('click', onDocClick, true)
    return () => {
      document.removeEventListener('click', onDocClick, true)
      window.removeEventListener('resize', checkMobile)
    }
  })
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="ox-avatar-menu"
  bind:this={rootEl}
  data-ui="ox-avatar-menu"
  onmouseenter={!isMobile ? open_ : undefined}
  onkeydown={handleKeydown}
>
  <!-- ── Trigger ── -->
  <button
    class="ox-am-trigger"
    class:open
    style="--_am-size:{size}px"
    onclick={open_}
    aria-haspopup="true"
    aria-expanded={open}
    aria-label={alt}
    data-ui="ox-am-trigger"
  >
    {#if src}
      <img class="ox-am-img" src={src} {alt} />
    {:else}
      <span class="ox-am-initials">{initials}</span>
    {/if}
  </button>

  <!-- ── Desktop dropdown ── -->
  {#if open && !isMobile}
    <div
      class="ox-am-dropdown"
      style="--_am-w:{dropdownWidth}px"
      role="menu"
      data-ui="ox-am-dropdown"
    >
      {#if children}
        {@render children()}
      {:else}
        <ul class="ox-am-list">
          {#each items as item}
            {#if item.dividerBefore}
              <li role="separator" class="ox-am-divider"></li>
            {/if}
            <li>
              {#if item.href && !item.disabled}
                <a
                  class="ox-am-item"
                  class:danger={item.danger}
                  href={item.href}
                  role="menuitem"
                  onclick={close}
                  data-ui="ox-am-item-{item.id}"
                >
                  {#if item.iconComponent}{@const IconC = item.iconComponent}
                    <span class="ox-am-item-icon"><IconC size={16} strokeWidth={2} /></span>
                  {:else if item.icon}
                    <span class="ox-am-item-icon">{@html item.icon}</span>
                  {/if}
                  <span class="ox-am-item-body">
                    <span class="ox-am-item-label">{item.label}</span>
                    {#if item.description}
                      <span class="ox-am-item-desc">{item.description}</span>
                    {/if}
                  </span>
                </a>
              {:else}
                <button
                  class="ox-am-item"
                  class:danger={item.danger}
                  disabled={item.disabled}
                  role="menuitem"
                  onclick={() => handleSelect(item)}
                  data-ui="ox-am-item-{item.id}"
                >
                  {#if item.iconComponent}{@const IconC = item.iconComponent}
                    <span class="ox-am-item-icon"><IconC size={16} strokeWidth={2} /></span>
                  {:else if item.icon}
                    <span class="ox-am-item-icon">{@html item.icon}</span>
                  {/if}
                  <span class="ox-am-item-body">
                    <span class="ox-am-item-label">{item.label}</span>
                    {#if item.description}
                      <span class="ox-am-item-desc">{item.description}</span>
                    {/if}
                  </span>
                </button>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

<!-- ── Mobile right drawer (teleported outside position:relative) ── -->
{#if open && isMobile}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="ox-am-scrim"
    style="--_am-appbar-h:{appbarHeight}px"
    onclick={close}
    transition:fade={{ duration: 220 }}
    data-ui="ox-am-scrim"
  ></div>
  <div
    class="ox-am-drawer"
    style="--_am-appbar-h:{appbarHeight}px; --_am-w:{dropdownWidth}px"
    role="menu"
    transition:fly={{ x: 300, duration: 280, easing: cubicOut }}
    data-ui="ox-am-drawer"
  >
    {#if children}
      {@render children()}
    {:else}
      <ul class="ox-am-list">
        {#each items as item}
          {#if item.dividerBefore}
            <li role="separator" class="ox-am-divider"></li>
          {/if}
          <li>
            {#if item.href && !item.disabled}
              <a
                class="ox-am-item"
                class:danger={item.danger}
                href={item.href}
                role="menuitem"
                onclick={close}
                data-ui="ox-am-item-{item.id}"
              >
                {#if item.iconComponent}{@const IconC = item.iconComponent}
                  <span class="ox-am-item-icon"><IconC size={16} strokeWidth={2} /></span>
                {:else if item.icon}
                  <span class="ox-am-item-icon">{@html item.icon}</span>
                {/if}
                <span class="ox-am-item-body">
                  <span class="ox-am-item-label">{item.label}</span>
                  {#if item.description}
                    <span class="ox-am-item-desc">{item.description}</span>
                  {/if}
                </span>
              </a>
            {:else}
              <button
                class="ox-am-item"
                class:danger={item.danger}
                disabled={item.disabled}
                role="menuitem"
                onclick={() => handleSelect(item)}
                data-ui="ox-am-item-{item.id}"
              >
                {#if item.iconComponent}{@const IconC = item.iconComponent}
                  <span class="ox-am-item-icon"><IconC size={16} strokeWidth={2} /></span>
                {:else if item.icon}
                  <span class="ox-am-item-icon">{@html item.icon}</span>
                {/if}
                <span class="ox-am-item-body">
                  <span class="ox-am-item-label">{item.label}</span>
                  {#if item.description}
                    <span class="ox-am-item-desc">{item.description}</span>
                  {/if}
                </span>
              </button>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ROOT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-avatar-menu {
    position: relative;
    display: inline-flex;
    align-items: center;
    font-family: system-ui, sans-serif;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TRIGGER — avatar button
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-am-trigger {
    width:  var(--_am-size, 32px);
    height: var(--_am-size, 32px);
    border-radius: 50%;
    border: 2px solid transparent;
    padding: 0;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: border-color 150ms, box-shadow 150ms, opacity 120ms;
    flex-shrink: 0;
  }
  .ox-am-trigger:hover {
    opacity: 0.88;
  }
  .ox-am-trigger:focus-visible {
    outline: 2px solid var(--ox-primary, #6750A4);
    outline-offset: 2px;
  }
  .ox-am-trigger.open {
    border-color: var(--ox-primary, #6750A4);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ox-primary, #6750A4) 20%, transparent);
  }

  .ox-am-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }

  .ox-am-initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--ox-secondary-container, #E8DEF8);
    color: var(--ox-on-secondary-container, #1D192B);
    font: 600 calc(var(--_am-size, 32px) * 0.38) system-ui;
    letter-spacing: -0.01em;
    user-select: none;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     DESKTOP DROPDOWN
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-am-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 200;
    min-width: var(--_am-w, 220px);
    border-radius: 6px;
    background: var(--ox-surface-1, #f9fafb);
    border: 1px solid var(--ox-outline-variant, #D1D5DB);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 4px 0;
    overflow: hidden;
    animation: ox-am-in 130ms cubic-bezier(0.2, 0, 0, 1);
  }

  @keyframes ox-am-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     MOBILE DRAWER (right panel, fixed)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-am-scrim {
    position: fixed;
    inset: 0;
    top: var(--_am-appbar-h, 57px);
    z-index: 299;
    background: rgba(0, 0, 0, 0.18);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
  }

  .ox-am-drawer {
    position: fixed;
    top: var(--_am-appbar-h, 57px);
    right: 0;
    bottom: 0;
    width: var(--_am-w, 280px);
    z-index: 300;
    background: var(--ox-surface-1, #f9fafb);
    border-left: 1px solid var(--ox-outline-variant, #D1D5DB);
    box-shadow: -6px 0 16px rgba(0, 0, 0, 0.12);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  .ox-am-drawer::-webkit-scrollbar { width: 4px; }
  .ox-am-drawer::-webkit-scrollbar-thumb {
    background: var(--ox-outline-variant, #D1D5DB);
    border-radius: 2px;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ITEMS (shared desktop + mobile)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-am-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .ox-am-divider {
    height: 1px;
    background: var(--ox-outline-variant, #D1D5DB);
    margin: 4px 0;
    border: none;
  }

  .ox-am-item {
    display: flex;
    align-items: center;
    gap: 20px;              /* gap-5 Tailwind = 20px */
    width: 100%;
    padding: 11px 20px;     /* px-5 py-3 Tailwind */
    border: none;
    border-radius: 0;       /* pleine largeur, coins carrés */
    background: none;
    text-align: left;
    cursor: pointer;
    text-decoration: none;
    color: var(--ox-on-surface, #111827);
    font: 400 14px system-ui;
    transition: background 100ms;
    box-sizing: border-box;
  }
  .ox-am-item:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ox-on-surface, #111827) 8%, transparent);
  }
  .ox-am-item:focus-visible {
    outline: 2px solid var(--ox-tertiary, #6366F1);
    outline-offset: -2px;
  }
  .ox-am-item:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }
  .ox-am-item.danger {
    color: var(--ox-error, #EF4444);
  }
  .ox-am-item.danger:hover:not(:disabled) {
    background: var(--ox-error-container, #FEE2E2);
  }

  .ox-am-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;            /* h-6 w-6 Tailwind */
    height: 24px;
    flex-shrink: 0;
    font-size: 18px;
    line-height: 1;
  }
  .ox-am-item-icon :global(svg) { display: block; }

  .ox-am-item-body {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
    min-width: 0;
  }
  .ox-am-item-label {
    font: 400 14px system-ui;
    color: inherit;
    line-height: 1.3;
  }
  .ox-am-item-desc {
    font: 400 12px system-ui;
    color: var(--ox-on-surface-variant, #6B7280);
    line-height: 1.4;
  }
</style>
