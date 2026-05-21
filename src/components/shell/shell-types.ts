// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// SHELL NAV ITEMS
//
// `OxShellNavItem` = item régulier cliquable avec icône + label. Utilisé pour
// les top tabs (menuItems, appbarItems) et le footer (footerItems) — ces zones
// ne supportent que des items réguliers.
//
// `OxShellSidebarItem` = union étendue pour la sidebar gauche (`navItems`),
// qui supporte 3 kinds :
//   - item régulier         (kind absent ou 'item')
//   - 'divider'             : trait horizontal de séparation entre sections
//   - 'sectionLabel'        : petit titre discret au-dessus d'une section
//
// En rail mode (sidebarOpen=false) : `divider` reste rendu, `sectionLabel`
// est masqué (le rail n'a pas la place pour du texte).
//
// Icône : 2 modes au choix, priorité au composant si les deux sont fournis.
//   - `iconComponent` : composant Lucide (ou autre) — recommandé (cohérence
//     visuelle, tree-shaking)
//   - `iconSvg`       : string HTML SVG injectée via {@html} — legacy
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
import type { Component } from 'svelte'

export interface OxShellNavItem {
  kind?: 'item'
  id: string
  label: string
  /** Composant icône (Lucide ou compatible) — recommandé. Prend précédence sur iconSvg. */
  iconComponent?: Component<any>
  /** Strokeweight pour iconComponent Lucide (default 2). */
  iconStrokeWidth?: number
  /** SVG innerHTML — legacy. Préférer iconComponent pour le nouveau code. */
  iconSvg?: string
  href?: string
  /** Pour href externe ou ouverture forcée en nouvel onglet (`'_blank'`). */
  target?: string
  badge?: string | number
}

export interface OxShellSidebarDivider {
  kind: 'divider'
  id: string
}

export interface OxShellSidebarSectionLabel {
  kind: 'sectionLabel'
  id: string
  label: string
}

export type OxShellSidebarItem =
  | OxShellNavItem
  | OxShellSidebarDivider
  | OxShellSidebarSectionLabel

export interface OxShellToolbarItem {
  id: string
  label: string
  /** Composant icône (Lucide ou compatible) — recommandé. */
  iconComponent?: Component<any>
  /** Strokeweight pour iconComponent Lucide (default 2). */
  iconStrokeWidth?: number
  /** SVG innerHTML — legacy. Préférer iconComponent pour le nouveau code. */
  iconSvg?: string
  active?: boolean
}
