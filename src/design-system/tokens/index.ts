// ── DS-4 Design Tokens (current) ────────────────────────────────
export { OX, makePluginTheme, generateOXRootCSS, generateOXShadowCSS, THEME_TINAX, THEME_ZAPAX, THEME_LC, THEME_DEFAULT } from './ds4'
export type { OXType, PluginTheme } from './ds4'

// ── Backward-compat aliases (DS3 → DS4) — do not remove ─────────
// Plugins (tinax, zapax, lc) still import DS3 / generateDS3ShadowCSS
export { OX as DS3, generateOXRootCSS as generateDS3RootCSS, generateOXShadowCSS as generateDS3ShadowCSS } from './ds4'
export type { OXType as DS3Type } from './ds4'
