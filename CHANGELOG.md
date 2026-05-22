# Changelog

## 0.1.1

### Patch Changes

- 518f27c: Switch release pipeline to npm Trusted Publishing (OIDC) — no more
  long-lived NPM_TOKEN, publish provenance badge enabled.

All notable changes to `ds4-svelte` will be documented in this file.

Format inspired by [Keep a Changelog](https://keepachangelog.com).
Versioning follows [SemVer](https://semver.org/) (`MAJOR.MINOR.PATCH`).

## [0.1.0] — Initial release

First public release of the DS-4 design system as a Svelte 5 library.

### Features

- **100+ components** organized in 13 categories: buttons, forms,
  layout, popup, tables, notifications, effects, shell, navigation,
  CRM, mocks, slideshow, text-effects.
- **Material Design 3 visual baseline** — 5 button variants, shape
  scale, elevation system, typography (15 MD3 styles), motion tokens.
- **6 themes** out of the box (`default`, `tinax`, `zapax`, `lc`,
  `bec`, `tt`) activated via `[data-theme="X"]` selectors.
- **Color roles MD3** — every background token has its paired
  `on-*` foreground for guaranteed contrast.
- **OxAppShell** — responsive AppBar + Sidebar (fold/rail) + Toolbar
  with 25 dedicated CSS tokens for per-instance customization.
- **Zag.js powered** — Dialog, Combobox, Menu, Tabs, Accordion,
  Popover, RadioGroup, Slider, Switch, ToggleGroup, NumberInput,
  PinInput, etc. all use Zag for ARIA + keyboard + focus management.
- **TypeScript types** — every component exports a `Props` interface.
- **Subpath exports** — `ds4-svelte` (barrel), `ds4-svelte/components`,
  `ds4-svelte/tokens`, `ds4-svelte/themes`.
- **`sideEffects: false`** — reliable tree-shaking.
- **Zag.js / Lucide / Embla in `peerDependencies`** — consumers pin
  their own versions.

### Notes

- This is a pre-1.0 release. The public API is **not** considered
  stable yet — breaking changes may occur on minor bumps until
  v1.0.0 is published.
- Live documentation site (with Props tables, accessibility per
  component, interactive previews) ships in v0.2.x.
