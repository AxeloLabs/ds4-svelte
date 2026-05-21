<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxBranding — Logo zone unifiée (icône + nom + lien)    │
   * │                                                         │
   * │ Règle DS : font 700 / 14px / system-ui, icône 28×28   │
   * │ Toujours cliquable → href (default : '/')              │
   * └─────────────────────────────────────────────────────────┘
   */
  import type { Snippet } from 'svelte'

  interface Props {
    name: string
    icon?: Snippet
    href?: string
  }

  let { name, icon, href = '/' }: Props = $props()
</script>

<a class="ox-branding" {href} data-ui="ox-branding">
  {#if icon}
    <span class="ox-branding-icon">{@render icon()}</span>
  {/if}
  <span class="ox-branding-name">{name}</span>
</a>

<style>
  .ox-branding {
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    flex-shrink: 0;
    border-radius: var(--ox-shape-sm, 6px);
    padding: 2px 4px;
    transition: opacity 120ms;
    user-select: none;
  }
  .ox-branding:hover { opacity: 0.8; }
  .ox-branding-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  .ox-branding-name {
    font: 700 14px/1 system-ui;
    color: var(--ox-on-surface);
    white-space: nowrap;
  }
</style>
