# ds4-svelte

> **DS-4** — Design System for Svelte 5. Material Design 3 styled,
> [Zag.js](https://zagjs.com) powered, fully typed, modular.

[![npm version](https://img.shields.io/npm/v/ds4-svelte.svg)](https://www.npmjs.com/package/ds4-svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **100+ components** ready out of the box (buttons, forms, layout,
  popups, tables, notifications, effects, shell)
- **Material Design 3** — opinionated visual baseline with color
  roles, elevation, shape tokens
- **Zag.js under the hood** — ARIA roles, keyboard navigation, focus
  management for free on every interactive component
- **Modular** — `sideEffects: false` + subpath exports for tree-shake
  reliability
- **6 themes** out of the box (`default`, `tinax`, `zapax`, `lc`,
  `bec`, `tt`) via `[data-theme="X"]`
- **TypeScript** — fully typed Props interfaces for every component

## Install

```bash
pnpm add ds4-svelte
# or
npm install ds4-svelte
# or
yarn add ds4-svelte
```

### Requirements

- Node ≥ 20
- Svelte ^5.0
- Vite 5+ or SvelteKit 2+

## Quick start

```svelte
<script>
  import { OxButton } from 'ds4-svelte'
</script>

<OxButton variant="filled" onclick={() => alert('Hi DS-4')}>
  My first button
</OxButton>
```

Import the CSS base in your `app.css` (once):

```css
@import 'ds4-svelte/src/design-system/tokens/themes.css';
@import 'ds4-svelte/src/design-system/presets/presets.css';
@import 'ds4-svelte/src/design-system/presets/components.css';
```

Pick a theme on `<html>`:

```html
<html data-theme="default">
  <!-- default | tinax | zapax | lc | bec | tt -->
</html>
```

## Philosophy

- **MD3 styled, not headless** — components ship with Material 3 visuals
  by default. Customize via CSS tokens (`--ox-*`), not by rewriting HTML.
- **Color roles enforced** — every `--ox-X` background has its
  `--ox-on-X` foreground twin. Contrast guaranteed system-wide.
- **Tree-shakable** — `sideEffects: false` + subpath exports let
  bundlers drop unused components.
- **Zag.js for behavior** — Dialog, Combobox, Menu, Tabs, etc. all
  use Zag for ARIA + keyboard + focus management. No reinvention.

## Components

| Category      | Examples                                                              |
|---------------|-----------------------------------------------------------------------|
| Buttons       | OxButton, OxSegment, OxSwitch, OxToggleGroup                          |
| Forms         | OxCheckbox, OxRadio, OxCombobox, OxNumberInput, OxPinInput            |
| Layout        | OxAppShell, OxAppBar, OxNavigationDrawer, OxSplitter                  |
| Popup         | OxDialog, OxPopover, OxMenu, OxTooltip, OxHoverCard                   |
| Tables        | OxTable, OxEntityTable, OxTableGrouped                                |
| Notifications | OxToaster (+ Timer + Terminal), OxBadge, OxChip                       |
| Effects       | OxConfetti, OxBacklight, OxAuroraText, OxWave, OxSplash               |
| Shell         | OxAppShell — responsive AppBar + Sidebar + Toolbar                    |

Full list (100+) in [`src/index.ts`](src/index.ts).

## Documentation

Live documentation site coming soon (see roadmap below).

For now, **read the source** — every component has a TypeScript
`interface Props` at the top with JSDoc on each prop. The pattern is
predictable across the library.

## Import patterns

```ts
// Recommended — barrel import
import { OxButton, OxCard, OxDialog } from 'ds4-svelte'

// Subpath alternative
import { OxButton } from 'ds4-svelte/components'
import { OX, generateOXRootCSS } from 'ds4-svelte/tokens'

// Types
import type { OxShellNavItem, ButtonVariant } from 'ds4-svelte'
```

## Theming

Override `--ox-*` CSS variables to customize. Each background token
has its paired foreground for guaranteed contrast (MD3 color roles):

```css
:root {
  --ox-primary: #6750A4;        /* background */
  --ox-on-primary: #FFFFFF;     /* text on primary bg */
  --ox-error: #DC2626;          /* error bg */
  --ox-on-error: #FFFFFF;       /* text on error bg */
}
```

For per-component customization, OxAppShell exposes 25 dedicated
tokens (`--ox-sidebar-*`, `--ox-appbar-*`) for sidebar/appbar styling
without `:global()` CSS overrides.

## Roadmap

- **v0.1.x** — initial release, core 100+ components, stabilization
- **v0.2.x** — live documentation site (book) with Props tables and
  accessibility info per component
- **v0.3.x** — Figma kit + design tokens sync
- **v1.0.0** — API frozen, semver guarantees

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, issue
guidelines and PR process.

## License

[MIT](LICENSE) © Axel Régnou
