<script lang="ts">
  /**
   * OxNavigation — DS-4 Navigation Drawer (MD3)
   * CSS-powered
   *
   * Props:
   *   items    — array of { id, icon, label }
   *   activeId — currently active item id (bindable)
   *   title    — optional drawer header title
   *   onNavigate — callback(id: string) when item clicked
   */

  interface NavItem {
    id: string
    icon: string
    label: string
  }

  interface Props {
    items: NavItem[]
    activeId?: string
    title?: string
    onNavigate?: (id: string) => void
  }

  let {
    items,
    activeId = $bindable(items[0]?.id ?? ''),
    title,
    onNavigate,
  }: Props = $props()

  function handleClick(id: string) {
    activeId = id
    onNavigate?.(id)
  }

  function handleKeydown(e: KeyboardEvent, index: number) {
    let target = -1
    if (e.key === 'ArrowDown') target = (index + 1) % items.length
    else if (e.key === 'ArrowUp') target = (index - 1 + items.length) % items.length
    else if (e.key === 'Home') target = 0
    else if (e.key === 'End') target = items.length - 1
    if (target >= 0) {
      e.preventDefault()
      const btns = (e.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('.ox-nav-item')
      btns?.[target]?.focus()
    }
  }
</script>

<nav class="ox-nav-drawer" data-ui="ox-navigation">
  {#if title}
    <div class="ox-nav-header">
      <span class="ox-nav-header-title">{title}</span>
    </div>
  {/if}

  {#each items as item, i}
    <button
      class="ox-nav-item"
      class:ox-nav-item-active={activeId === item.id}
      data-ui="nav-item-{item.id}"
      onclick={() => handleClick(item.id)}
      onkeydown={(e) => handleKeydown(e, i)}
      aria-current={activeId === item.id ? 'page' : undefined}
    >
      <span class="ox-nav-item-icon">{item.icon}</span>
      <span class="ox-nav-item-label">{item.label}</span>
      {#if activeId === item.id}
        <span class="ox-nav-item-indicator" aria-hidden="true"></span>
      {/if}
    </button>
  {/each}
</nav>

<style>
  .ox-nav-drawer {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px 8px;
    background: var(--ox-surface-1, #F4EEFF);
    border-radius: var(--ox-shape-lg, 16px);
    font-family: system-ui, sans-serif;
    width: 240px;
  }

  .ox-nav-header {
    padding: 16px 16px 8px;
    margin-bottom: 4px;
  }
  .ox-nav-header-title {
    font: 500 18px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
  }

  .ox-nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    height: 56px;
    border-radius: 999px;
    border: none;
    background: transparent;
    cursor: pointer;
    font: 500 14px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    transition: background 120ms, color 120ms;
    width: 100%;
    text-align: left;
    overflow: hidden;
  }

  /* State layer */
  .ox-nav-item::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: transparent;
    transition: background 100ms;
  }
  .ox-nav-item:hover::before {
    background: rgba(29,27,32,0.16);
  }

  .ox-nav-item-active {
    background: var(--ox-secondary-container, #E8DEF8);
    color: var(--ox-on-secondary-container, #1D192B);
    font-weight: 600;
  }
  .ox-nav-item-active:hover::before { background: transparent; }

  .ox-nav-item-icon {
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .ox-nav-item-label {
    flex: 1;
    position: relative;
    z-index: 1;
  }
</style>
