<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxPortal — Téléporte ses children vers un autre noeud DOM
   * │
   * │ Usage:
   * │   <OxPortal target={document.body}>
   * │     <MyOverlay />
   * │   </OxPortal>
   * │
   * │ Use cases:
   * │  - Échapper à overflow:hidden d'un parent
   * │  - Échapper aux stacking contexts CSS (z-index local)
   * │  - Échapper à un Shadow DOM (cas tinax/zapax confetti)
   * │
   * │ La réactivité Svelte est préservée : seul le rendu DOM
   * │ est déplacé. Les events, props, state restent connectés.
   * └─────────────────────────────────────────────────────────┘
   */
  import { onMount, onDestroy, type Snippet } from 'svelte'

  interface Props {
    target?: HTMLElement | string
    disabled?: boolean
    children: Snippet
  }

  let { target = 'body', disabled = false, children }: Props = $props()

  let inlineHost: HTMLDivElement | undefined = $state()
  let portalHost: HTMLDivElement | null = $state(null)

  onMount(() => {
    if (disabled) return
    if (typeof document === 'undefined') return
    const t: HTMLElement | null = typeof target === 'string'
      ? document.querySelector<HTMLElement>(target)
      : target
    if (!t) return
    portalHost = document.createElement('div')
    portalHost.setAttribute('data-ui', 'ox-portal')
    t.appendChild(portalHost)
    // Déplace le contenu rendu inline vers le portal host
    if (inlineHost) {
      while (inlineHost.firstChild) {
        portalHost.appendChild(inlineHost.firstChild)
      }
    }
  })

  onDestroy(() => {
    portalHost?.remove()
    portalHost = null
  })
</script>

<div data-ui="ox-portal" bind:this={inlineHost} style="display: contents;">
  {@render children()}
</div>
