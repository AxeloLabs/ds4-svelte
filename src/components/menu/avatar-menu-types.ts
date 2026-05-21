import type { Component } from 'svelte'

export interface AvatarMenuItem {
  id: string
  label: string
  description?: string
  /** @deprecated use iconComponent (Lucide). SVG string ou emoji */
  icon?: string
  /** Composant Lucide (ou compatible) — recommandé, prend précédence sur icon */
  iconComponent?: Component<any>
  href?: string
  dividerBefore?: boolean
  danger?: boolean
  disabled?: boolean
}
