<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxNavigationMenu — DS-4 Horizontal Navigation           │
   * │ Powered by @zag-js/navigation-menu v1.38                │
   * │                                                         │
   * │ Props:                                                   │
   * │   id          — unique id (required)                    │
   * │   items       — NavMenuItem[]                           │
   * │   indicator   — show animated sliding indicator         │
   * │   viewport    — use shared viewport pattern             │
   * │   orientation — horizontal | vertical (default: horiz) │
   * └─────────────────────────────────────────────────────────┘
   */
  import * as navigationMenu from '@zag-js/navigation-menu'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { ChevronDown } from '@lucide/svelte'

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // TYPES
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  export interface NavMenuLink {
    label: string
    href: string
    description?: string
    /** @deprecated use iconComponent (Lucide) */
    icon?: string
    iconComponent?: import('svelte').Component<any>
    current?: boolean
  }

  export interface NavMenuItem {
    value: string
    label: string
    href?: string
    links?: NavMenuLink[]
    disabled?: boolean
  }

  interface Props {
    id: string
    items: NavMenuItem[]
    indicator?: boolean
    viewport?: boolean
    orientation?: 'horizontal' | 'vertical'
  }

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  // STATE
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  let { id, items, indicator = false, viewport = false, orientation = 'horizontal' }: Props = $props()

  const service = useMachine(navigationMenu.machine, () => ({ id, orientation }))
  const api = $derived(navigationMenu.connect(service, normalizeProps))
</script>

<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ROOT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<nav
  class="ox-navmenu"
  class:ox-navmenu--indicator={indicator}
  class:ox-navmenu--viewport={viewport}
  class:ox-navmenu--vertical={orientation === 'vertical'}
  data-ui="ox-navigation-menu"
  {...api.getRootProps()}
>
  <!-- LIST BAR -->
  <ul class="ox-navmenu-list" {...api.getListProps()}>
    {#each items as item}
      <li
        class="ox-navmenu-item"
        class:ox-navmenu-item--disabled={item.disabled}
        {...api.getItemProps({ value: item.value })}
      >
        {#if item.links && item.links.length > 0}
          <!-- Trigger with dropdown -->
          <button
            class="ox-navmenu-trigger"
            data-ui="navmenu-trigger-{item.value}"
            {...api.getTriggerProps({ value: item.value, disabled: item.disabled })}
          >
            {item.label}
            <ChevronDown class="ox-navmenu-chevron" size={14} strokeWidth={2} />
          </button>

          {#if !viewport}
            <!-- Inline dropdown content -->
            <div class="ox-navmenu-content" data-ui="navmenu-content-{item.value}" {...api.getContentProps({ value: item.value })}>
              <ul class="ox-navmenu-content-list">
                {#each item.links as link}
                  <li>
                    <a
                      class="ox-navmenu-link"
                      href={link.href}
                      class:ox-navmenu-link--current={link.current}
                      {...api.getLinkProps({ value: item.value, current: link.current })}
                    >
                      {#if link.iconComponent}{@const LinkIc = link.iconComponent}
                        <span class="ox-navmenu-link-icon"><LinkIc size={18} strokeWidth={2} /></span>
                      {:else if link.icon}
                        <span class="ox-navmenu-link-icon">{link.icon}</span>
                      {/if}
                      <span class="ox-navmenu-link-body">
                        <span class="ox-navmenu-link-label">{link.label}</span>
                        {#if link.description}
                          <span class="ox-navmenu-link-desc">{link.description}</span>
                        {/if}
                      </span>
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

        {:else}
          <!-- Simple link -->
          <a
            class="ox-navmenu-trigger ox-navmenu-trigger--link"
            href={item.href ?? '#'}
            data-ui="navmenu-link-{item.value}"
            {...api.getLinkProps({ value: item.value })}
          >
            {item.label}
          </a>
        {/if}
      </li>
    {/each}

    <!-- Animated indicator -->
    {#if indicator}
      <div class="ox-navmenu-indicator" {...api.getIndicatorProps()}>
        <div class="ox-navmenu-indicator-arrow"></div>
      </div>
    {/if}
  </ul>

  <!-- Viewport (shared dropdown container) -->
  {#if viewport}
    <div class="ox-navmenu-viewport-positioner" {...api.getViewportPositionerProps()}>
      <div class="ox-navmenu-viewport" {...api.getViewportProps()}>
        {#each items as item}
          {#if item.links && item.links.length > 0}
            <div class="ox-navmenu-content ox-navmenu-content--viewport" {...api.getContentProps({ value: item.value })}>
              <ul class="ox-navmenu-content-list">
                {#each item.links as link}
                  <li>
                    <a
                      class="ox-navmenu-link"
                      href={link.href}
                      class:ox-navmenu-link--current={link.current}
                      {...api.getLinkProps({ value: item.value, current: link.current })}
                    >
                      {#if link.iconComponent}{@const LinkIc = link.iconComponent}
                        <span class="ox-navmenu-link-icon"><LinkIc size={18} strokeWidth={2} /></span>
                      {:else if link.icon}
                        <span class="ox-navmenu-link-icon">{link.icon}</span>
                      {/if}
                      <span class="ox-navmenu-link-body">
                        <span class="ox-navmenu-link-label">{link.label}</span>
                        {#if link.description}
                          <span class="ox-navmenu-link-desc">{link.description}</span>
                        {/if}
                      </span>
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</nav>

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ROOT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-navmenu {
    position: relative;
    font-family: system-ui, sans-serif;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     LIST BAR
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-navmenu-list {
    display: flex;
    align-items: center;
    gap: 2px;
    list-style: none;
    margin: 0;
    padding: 4px;
    background: var(--ox-surface-1, #F4EEFF);
    border-radius: var(--ox-shape-lg, 16px);
    position: relative;
  }

  .ox-navmenu--vertical .ox-navmenu-list {
    flex-direction: column;
    align-items: stretch;
  }

  .ox-navmenu-item {
    position: relative;
  }

  .ox-navmenu-item--disabled {
    opacity: 0.38;
    pointer-events: none;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TRIGGER & SIMPLE LINK
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-navmenu-trigger {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    border: none;
    border-radius: var(--ox-shape-full, 999px);
    background: transparent;
    font: 500 14px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    text-decoration: none;
    transition: background 120ms, color 120ms;
    white-space: nowrap;
  }

  .ox-navmenu-trigger:hover {
    background: color-mix(in srgb, var(--ox-on-surface) 8%, transparent);
    color: var(--ox-on-surface, #1C1B1F);
  }

  .ox-navmenu-trigger[data-state="open"],
  .ox-navmenu-trigger[data-active] {
    background: var(--ox-secondary-container, #E8DEF8);
    color: var(--ox-on-secondary-container, #1D192B);
    font-weight: 600;
  }

  .ox-navmenu-trigger--link[data-current] {
    background: var(--ox-secondary-container, #E8DEF8);
    color: var(--ox-on-secondary-container, #1D192B);
    font-weight: 600;
  }

  :global(.ox-navmenu-chevron) {
    transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
    opacity: 0.7;
    flex-shrink: 0;
  }
  .ox-navmenu-trigger[data-state="open"] :global(.ox-navmenu-chevron) {
    transform: rotate(180deg);
    opacity: 1;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     INLINE CONTENT (dropdown)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-navmenu-content {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    padding: 8px;
    background: var(--ox-surface, #FFFBFE);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-lg, 16px);
    box-shadow:
      0 4px 8px 3px rgba(0,0,0,.12),
      0 1px 3px rgba(0,0,0,.2);
    min-width: 220px;
  }
  .ox-navmenu-content[hidden] { display: none; }

  /* directional entry animations via data-motion */
  .ox-navmenu-content[data-state="open"][data-motion="from-start"] {
    animation: ox-navmenu-from-left 200ms cubic-bezier(0.2, 0, 0, 1);
  }
  .ox-navmenu-content[data-state="open"][data-motion="from-end"] {
    animation: ox-navmenu-from-right 200ms cubic-bezier(0.2, 0, 0, 1);
  }
  .ox-navmenu-content[data-state="open"]:not([data-motion]) {
    animation: ox-navmenu-in 160ms cubic-bezier(0.2, 0, 0, 1);
  }

  @keyframes ox-navmenu-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ox-navmenu-from-left {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes ox-navmenu-from-right {
    from { opacity: 0; transform: translateX(8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* Viewport-mode content sits inside viewport container */
  .ox-navmenu-content--viewport {
    position: static;
    border: none;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
    padding: 0;
    min-width: unset;
  }
  .ox-navmenu-content--viewport[hidden] { display: none; }

  .ox-navmenu-content-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     LINKS
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-navmenu-link {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--ox-shape-md, 12px);
    text-decoration: none;
    color: var(--ox-on-surface, #1C1B1F);
    transition: background 120ms;
  }
  .ox-navmenu-link:hover {
    background: color-mix(in srgb, var(--ox-on-surface) 8%, transparent);
  }
  .ox-navmenu-link:focus-visible {
    outline: 2px solid var(--ox-primary, #6750A4);
    outline-offset: -2px;
  }
  .ox-navmenu-link--current,
  .ox-navmenu-link[data-current] {
    background: var(--ox-primary-container, #EADDFF);
    color: var(--ox-on-primary-container, #21005D);
  }
  .ox-navmenu-link--current:hover,
  .ox-navmenu-link[data-current]:hover {
    background: color-mix(in srgb, var(--ox-primary) 16%, var(--ox-primary-container));
  }

  .ox-navmenu-link-icon {
    font-size: 18px;
    line-height: 1;
    margin-top: 1px;
    flex-shrink: 0;
  }
  .ox-navmenu-link-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .ox-navmenu-link-label {
    font: 500 14px system-ui;
    color: inherit;
  }
  .ox-navmenu-link-desc {
    font: 400 12px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    line-height: 1.4;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     INDICATOR
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-navmenu-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: var(--ox-primary, #6750A4);
    pointer-events: none;
    transition:
      left 250ms cubic-bezier(0.2, 0, 0, 1),
      width 250ms cubic-bezier(0.2, 0, 0, 1),
      opacity 150ms;
    overflow: hidden;
  }
  .ox-navmenu-indicator[hidden] { display: none; }

  .ox-navmenu-indicator-arrow {
    width: 100%;
    height: 100%;
    background: var(--ox-primary, #6750A4);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     VIEWPORT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-navmenu-viewport-positioner {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    padding-top: 8px;
    z-index: 50;
  }

  .ox-navmenu-viewport {
    background: var(--ox-surface, #FFFBFE);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-lg, 16px);
    box-shadow:
      0 4px 8px 3px rgba(0,0,0,.12),
      0 1px 3px rgba(0,0,0,.2);
    overflow: hidden;
    padding: 12px;
    width: var(--viewport-width, 100%);
    height: var(--viewport-height, auto);
    transition: width 200ms, height 200ms;
    animation: ox-navmenu-in 160ms cubic-bezier(0.2, 0, 0, 1);
  }
  .ox-navmenu-viewport[hidden] { display: none; }
</style>
