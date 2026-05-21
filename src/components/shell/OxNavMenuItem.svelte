<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxNavMenuItem                                           │
   * │ AppShell header menu item — bottom border + hover gray  │
   * │                                                         │
   * │ Si `href` fourni → rendu en `<a>` (middle-click /       │
   * │ ctrl-click natifs ouvrent en nouvel onglet). Sinon →    │
   * │ `<button>` (callback JS uniquement).                    │
   * └─────────────────────────────────────────────────────────┘
   */
  interface Props {
    id?: string;
    label: string;
    active?: boolean;
    href?: string;
    target?: string;
    onclick?: (id: string) => void;
  }

  let { id = '', label, active = false, href, target, onclick }: Props = $props();

  function handleClick() {
    onclick?.(id);
  }
</script>

{#if href}
  <a
    class="ox-nav-menu-item"
    class:active
    {href}
    {target}
    rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    onclick={handleClick}
    data-ui="ox-nav-menu-{id}"
  >
    {label}
  </a>
{:else}
  <button
    class="ox-nav-menu-item"
    class:active
    onclick={handleClick}
    data-ui="ox-nav-menu-{id}"
  >
    {label}
  </button>
{/if}

<style>
  .ox-nav-menu-item {
    display: flex;
    align-items: center;
    padding: 0 18px;
    height: 64px;
    border: none;
    border-bottom: 2px solid transparent;
    background: none;
    cursor: pointer;
    color: var(--ox-on-surface-variant, #49454F);
    font: 500 13px system-ui;
    letter-spacing: -0.01em;
    white-space: nowrap;
    flex-shrink: 0;
    text-decoration: none;
    transition: color 120ms, border-color 120ms, background 100ms;
  }
  .ox-nav-menu-item:hover {
    color: var(--ox-on-surface, #1C1B1F);
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 8%, transparent);
  }
  .ox-nav-menu-item.active {
    color: var(--ox-on-surface, #1C1B1F);
    border-bottom-color: var(--ox-primary, #6750A4);
    font-weight: 600;
  }
</style>
