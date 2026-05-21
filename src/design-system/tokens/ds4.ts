/**
 * ┌──────────────────────────────────────────────────────────────┐
 * │ ds4-svelte — DS-4 Design Tokens                           │
 * │ Source de vérité unique pour tous les outils visuels Oxela  │
 * │                                                              │
 * │ Usages :                                                     │
 * │  • Plugins Chrome (Shadow DOM) → generateOXShadowCSS(theme)      │
 * │    injecté dans le shadow root via getStyles()               │
 * │  • Apps SvelteKit → injectOXIntoHead() ou CSS string        │
 * │  • Logique JS → import { OX } from 'ds4-svelte'          │
 * └──────────────────────────────────────────────────────────────┘
 */

// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// COLOR SCHEME — MD3 baseline (accent-agnostic)
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

export const OX = {
  // ── Primary (overridden per plugin via accent) ──
  primary:              '#6750A4',
  onPrimary:            '#FFFFFF',
  primaryContainer:     '#EADDFF',
  onPrimaryContainer:   '#21005D',

  // ── Secondary ──
  secondary:            '#625B71',
  onSecondary:          '#FFFFFF',
  secondaryContainer:   '#E8DEF8',
  onSecondaryContainer: '#1D192B',

  // ── Tertiary ──
  tertiary:             '#7D5260',
  onTertiary:           '#FFFFFF',
  tertiaryContainer:    '#FFD8E4',
  onTertiaryContainer:  '#31111D',

  // ── Error ──
  error:                '#B3261E',
  onError:              '#FFFFFF',
  errorContainer:       '#F9DEDC',
  onErrorContainer:     '#410E0B',

  // ── Success (custom) ──
  success:              '#146C2E',
  onSuccess:            '#FFFFFF',
  successContainer:     '#C3EFCD',
  onSuccessContainer:   '#002107',

  // ── Warning (custom — MD3 extension, amber) ──
  warning:              '#B45309',
  onWarning:            '#FFFFFF',
  warningContainer:     '#FEF3C7',
  onWarningContainer:   '#451A03',

  // ── Info (custom — MD3 extension, sky blue) ──
  info:                 '#0369A1',
  onInfo:               '#FFFFFF',
  infoContainer:        '#E0F2FE',
  onInfoContainer:      '#0C2E4D',

  // ── Surfaces (5 levels — tinted with primary) ──
  surface:              '#FFFBFE',
  surface1:             '#F4EEFF',   // +5% primary
  surface2:             '#EDE8F5',   // +8% primary
  surface3:             '#E6E0F2',   // +11% primary
  surface4:             '#E4DDEE',   // +12% primary
  surface5:             '#DFD8EA',   // +14% primary
  onSurface:            '#1C1B1F',
  onSurfaceVariant:     '#49454F',
  surfaceVariant:       '#E7E0EC',

  // ── Outline ──
  outline:              '#79747E',
  outlineVariant:       '#CAC4D0',

  // ── Pipeline phases (plugin-specific, shared) ──
  phaseSuggest:         '#8B4513',
  phaseExtract:         '#EAB308',
  phaseInject:          '#3B82F6',
  phaseValidate:        '#22C55E',
  phaseIdle:            '#EF4444',
  phaseLoop:            '#7C3AED',

  // ── Plugin accents ──
  accentTinax:          '#FD5068',
  accentZapax:          '#25D366',
  accentLC:             '#0A66C2',
  accentDefault:        '#6B7280',

  // ── Elevations ──
  elevation1: '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
  elevation2: '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)',
  elevation3: '0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)',
  elevation4: '0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.3)',
  elevation5: '0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px rgba(0,0,0,0.3)',

  // ── Shape scale ──
  shapeNone:   '0px',
  shapeXS:     '4px',
  shapeSM:     '8px',
  shapeMD:     '12px',
  shapeLG:     '16px',
  shapeXL:     '28px',
  shapeFull:   '9999px',

  // ── State layers (MD3) ──
  stateHover:  '0.08',
  statePress:  '0.10',
  stateFocus:  '0.10',
  stateDrag:   '0.16',

  // ── Focus ring ──
  focusRing:   '2px solid var(--ox-primary, #6750A4)',

  // ── Z-index scale (MD3 elevation order) ──
  zBase:       '0',
  zDropdown:   '1000',
  zSticky:     '1100',
  zFixed:      '1200',
  zModal:      '1300',
  zPopover:    '1400',
  zToast:      '1500',
  zTooltip:    '1600',

  // ── Motion ──
  durationShort1:  '50ms',
  durationShort2:  '100ms',
  durationShort3:  '150ms',
  durationMedium1: '200ms',
  durationMedium2: '300ms',
  durationMedium3: '400ms',
  durationLong1:   '450ms',
  durationLong2:   '500ms',
  easingStandard:  'cubic-bezier(0.2, 0, 0, 1)',
  easingEmphasized:'cubic-bezier(0.05, 0.7, 0.1, 1.0)',

  // ── Spacing (4px base, Tailwind-compatible) ──
  spacing0:  '0px',
  spacing1:  '4px',
  spacing2:  '8px',
  spacing3:  '12px',
  spacing4:  '16px',
  spacing5:  '20px',
  spacing6:  '24px',
  spacing8:  '32px',
  spacing10: '40px',
  spacing12: '48px',
  spacing16: '64px',

  // ── Breakpoints (MD3 window size classes) ──
  bpCompact:   '600px',   // 0–599 = compact (phone)
  bpMedium:    '840px',   // 600–839 = medium (tablet portrait)
  bpExpanded:  '1200px',  // 840–1199 = expanded (tablet landscape / small desktop)
  bpLarge:     '1600px',  // 1200–1599 = large (desktop)

  // ── Typography (font shorthand strings) ──
  displayLG:   "400 57px/64px 'Roboto', system-ui, sans-serif",
  displayMD:   "400 45px/52px 'Roboto', system-ui, sans-serif",
  displaySM:   "400 36px/44px 'Roboto', system-ui, sans-serif",
  headlineLG:  "400 32px/40px 'Roboto', system-ui, sans-serif",
  headlineMD:  "400 28px/36px 'Roboto', system-ui, sans-serif",
  headlineSM:  "400 24px/32px 'Roboto', system-ui, sans-serif",
  titleLG:     "500 22px/28px 'Roboto', system-ui, sans-serif",
  titleMD:     "500 16px/24px 'Roboto', system-ui, sans-serif",
  titleSM:     "500 14px/20px 'Roboto', system-ui, sans-serif",
  bodyLG:      "400 16px/24px 'Roboto', system-ui, sans-serif",
  bodyMD:      "400 14px/20px 'Roboto', system-ui, sans-serif",
  bodySM:      "400 12px/16px 'Roboto', system-ui, sans-serif",
  labelLG:     "500 14px/20px 'Roboto', system-ui, sans-serif",
  labelMD:     "500 12px/16px 'Roboto', system-ui, sans-serif",
  labelSM:     "500 11px/16px 'Roboto', system-ui, sans-serif",
} as const

export type OXType = typeof OX

// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// PLUGIN THEMES — per-plugin accent overrides
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

export interface PluginTheme {
  /** Primary color — used for FAB, active tab underline, switch ON */
  primary:           string
  onPrimary:         string
  primaryContainer:  string
  onPrimaryContainer:string
  /** Surface tints (based on primary) */
  surface1: string
  surface2: string
  /** Full DS4 theme overrides (optional — fall back to OX.* defaults) */
  secondary?:             string
  onSecondary?:           string
  secondaryContainer?:    string
  onSecondaryContainer?:  string
  tertiary?:              string
  onTertiary?:            string
  tertiaryContainer?:     string
  onTertiaryContainer?:   string
  surface?:               string
  surface3?:              string
  surface4?:              string
  surface5?:              string
  surfaceVariant?:        string
  onSurface?:             string
  onSurfaceVariant?:      string
  outline?:               string
  outlineVariant?:        string
  error?:                 string
  errorContainer?:        string
  onErrorContainer?:      string
  primaryRgb?:            string
  tertiaryRgb?:           string
}

/**
 * Derive a plugin theme from a hex accent color.
 * Computes light tints for surface-1 and surface-2.
 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return [r, g, b]
}

function hexToRgbString(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  return `${r}, ${g}, ${b}`
}

function mixWithWhite(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

function contrastColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  // Perceived luminance
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.5 ? '#1C1B1F' : '#FFFFFF'
}

export function makePluginTheme(accent: string): PluginTheme {
  return {
    primary:            accent,
    onPrimary:          contrastColor(accent),
    primaryContainer:   mixWithWhite(accent, 0.78),
    onPrimaryContainer: accent,
    surface1:           mixWithWhite(accent, 0.95),
    surface2:           mixWithWhite(accent, 0.90),
  }
}

// Pre-built plugin themes — tinax/zapax: full DS4 palette matching themes/*.css
export const THEME_TINAX: PluginTheme = {
  primary:               '#E11D48',
  onPrimary:             '#FFFFFF',
  primaryContainer:      '#FFA8B8',
  onPrimaryContainer:    '#4C0519',
  surface1:              '#FFE0E7',
  surface2:              '#FFC8D5',
  secondary:             '#F59E0B',
  onSecondary:           '#422006',
  secondaryContainer:    '#FEF3C7',
  onSecondaryContainer:  '#78350F',
  tertiary:              '#6366F1',
  onTertiary:            '#FFFFFF',
  tertiaryContainer:     '#E0E7FF',
  onTertiaryContainer:   '#1E1B4B',
  surface:               '#FFF5F7',
  surface3:              '#FFAFC1',
  surface4:              '#FF8FA6',
  surface5:              '#FF6F8D',
  surfaceVariant:        '#FFE0E7',
  onSurface:             '#1A050A',
  onSurfaceVariant:      '#6B1829',
  outline:               '#4C0519',
  outlineVariant:        '#FFC8D5',
  error:                 '#DC2626',
  errorContainer:        '#FEE2E2',
  onErrorContainer:      '#7F1D1D',
  primaryRgb:            '225, 29, 72',
  tertiaryRgb:           '99, 102, 241',
}

export const THEME_ZAPAX: PluginTheme = {
  primary:               '#16A34A',
  onPrimary:             '#FFFFFF',
  primaryContainer:      '#86EFAC',
  onPrimaryContainer:    '#052E16',
  surface1:              '#CBFADB',
  surface2:              '#9EEDB4',
  secondary:             '#EAB308',
  onSecondary:           '#422006',
  secondaryContainer:    '#FEF9C3',
  onSecondaryContainer:  '#713F12',
  tertiary:              '#475569',
  onTertiary:            '#FFFFFF',
  tertiaryContainer:     '#E2E8F0',
  onTertiaryContainer:   '#0F172A',
  surface:               '#F0FDF4',
  surface3:              '#6EE08E',
  surface4:              '#4ADE80',
  surface5:              '#22C55E',
  surfaceVariant:        '#CBFADB',
  onSurface:             '#052E16',
  onSurfaceVariant:      '#166534',
  outline:               '#052E16',
  outlineVariant:        '#9EEDB4',
  error:                 '#DC2626',
  errorContainer:        '#FEE2E2',
  onErrorContainer:      '#7F1D1D',
  primaryRgb:            '22, 163, 74',
  tertiaryRgb:           '71, 85, 105',
}

export const THEME_LC:    PluginTheme = makePluginTheme(OX.accentLC)
export const THEME_DEFAULT: PluginTheme = makePluginTheme(OX.accentDefault)

// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// CSS GENERATORS
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

/**
 * Generate a CSS :root block with all DS4 --ox-* custom properties.
 * Used by SvelteKit apps (injected into app.css or <style>).
 * Pass a PluginTheme to override the primary color group.
 */
export function generateOXRootCSS(theme?: Partial<PluginTheme>): string {
  const t = { ...OX, ...theme }
  return `:root {
  /* ── Primary ── */
  --ox-primary:               ${t.primary ?? OX.primary};
  --ox-on-primary:            ${t.onPrimary ?? OX.onPrimary};
  --ox-primary-container:     ${t.primaryContainer ?? OX.primaryContainer};
  --ox-on-primary-container:  ${t.onPrimaryContainer ?? OX.onPrimaryContainer};

  /* ── Secondary ── */
  --ox-secondary:               ${OX.secondary};
  --ox-on-secondary:            ${OX.onSecondary};
  --ox-secondary-container:     ${OX.secondaryContainer};
  --ox-on-secondary-container:  ${OX.onSecondaryContainer};

  /* ── Tertiary ── */
  --ox-tertiary:                ${OX.tertiary};
  --ox-on-tertiary:             ${OX.onTertiary};
  --ox-tertiary-container:      ${OX.tertiaryContainer};
  --ox-on-tertiary-container:   ${OX.onTertiaryContainer};

  /* ── Error ── */
  --ox-error:                   ${OX.error};
  --ox-on-error:                ${OX.onError};
  --ox-error-container:         ${OX.errorContainer};
  --ox-on-error-container:      ${OX.onErrorContainer};

  /* ── Success ── */
  --ox-success:                 ${OX.success};
  --ox-on-success:              ${OX.onSuccess};
  --ox-success-container:       ${OX.successContainer};
  --ox-on-success-container:    ${OX.onSuccessContainer};

  /* ── Warning ── */
  --ox-warning:                 ${OX.warning};
  --ox-on-warning:              ${OX.onWarning};
  --ox-warning-container:       ${OX.warningContainer};
  --ox-on-warning-container:    ${OX.onWarningContainer};

  /* ── Info ── */
  --ox-info:                    ${OX.info};
  --ox-on-info:                 ${OX.onInfo};
  --ox-info-container:          ${OX.infoContainer};
  --ox-on-info-container:       ${OX.onInfoContainer};

  /* ── Surfaces ── */
  --ox-surface:                 ${OX.surface};
  --ox-surface-1:               ${t.surface1 ?? OX.surface1};
  --ox-surface-2:               ${t.surface2 ?? OX.surface2};
  --ox-surface-3:               ${OX.surface3};
  --ox-surface-4:               ${OX.surface4};
  --ox-surface-5:               ${OX.surface5};
  --ox-on-surface:              ${OX.onSurface};
  --ox-on-surface-variant:      ${OX.onSurfaceVariant};
  --ox-surface-variant:         ${OX.surfaceVariant};
  --ox-outline:                 ${OX.outline};
  --ox-outline-variant:         ${OX.outlineVariant};

  /* ── Pipeline phases ── */
  --phase-suggest:    ${OX.phaseSuggest};
  --phase-extract:    ${OX.phaseExtract};
  --phase-inject:     ${OX.phaseInject};
  --phase-validate:   ${OX.phaseValidate};
  --phase-idle:       ${OX.phaseIdle};
  --phase-loop:       ${OX.phaseLoop};

  /* ── Elevations ── */
  --ox-elevation-1:  ${OX.elevation1};
  --ox-elevation-2:  ${OX.elevation2};
  --ox-elevation-3:  ${OX.elevation3};
  --ox-elevation-4:  ${OX.elevation4};
  --ox-elevation-5:  ${OX.elevation5};

  /* ── Shape ── */
  --ox-shape-none:   ${OX.shapeNone};
  --ox-shape-xs:     ${OX.shapeXS};
  --ox-shape-sm:     ${OX.shapeSM};
  --ox-shape-md:     ${OX.shapeMD};
  --ox-shape-lg:     ${OX.shapeLG};
  --ox-shape-xl:     ${OX.shapeXL};
  --ox-shape-full:   ${OX.shapeFull};

  /* ── State layers ── */
  --ox-state-hover:  ${OX.stateHover};
  --ox-state-press:  ${OX.statePress};
  --ox-state-focus:  ${OX.stateFocus};
  --ox-state-drag:   ${OX.stateDrag};

  /* ── Focus ring ── */
  --ox-focus-ring:   2px solid var(--ox-primary);

  /* ── Motion ── */
  --ox-duration-short1:  ${OX.durationShort1};
  --ox-duration-short2:  ${OX.durationShort2};
  --ox-duration-short3:  ${OX.durationShort3};
  --ox-duration-medium1: ${OX.durationMedium1};
  --ox-duration-medium2: ${OX.durationMedium2};
  --ox-duration-medium3: ${OX.durationMedium3};
  --ox-duration-long1:   ${OX.durationLong1};
  --ox-duration-long2:   ${OX.durationLong2};
  --ox-easing-standard:  ${OX.easingStandard};
  --ox-easing-emphasized:${OX.easingEmphasized};

  /* ── Z-index ── */
  --ox-z-base:       ${OX.zBase};
  --ox-z-dropdown:   ${OX.zDropdown};
  --ox-z-sticky:     ${OX.zSticky};
  --ox-z-fixed:      ${OX.zFixed};
  --ox-z-modal:      ${OX.zModal};
  --ox-z-popover:    ${OX.zPopover};
  --ox-z-toast:      ${OX.zToast};
  --ox-z-tooltip:    ${OX.zTooltip};

  /* ── Spacing ── */
  --ox-spacing-0:    ${OX.spacing0};
  --ox-spacing-1:    ${OX.spacing1};
  --ox-spacing-2:    ${OX.spacing2};
  --ox-spacing-3:    ${OX.spacing3};
  --ox-spacing-4:    ${OX.spacing4};
  --ox-spacing-5:    ${OX.spacing5};
  --ox-spacing-6:    ${OX.spacing6};
  --ox-spacing-8:    ${OX.spacing8};
  --ox-spacing-10:   ${OX.spacing10};
  --ox-spacing-12:   ${OX.spacing12};
  --ox-spacing-16:   ${OX.spacing16};

  /* ── RGB decomposition (for rgba presets) ── */
  --ox-primary-rgb:   ${hexToRgbString(t.primary ?? OX.primary)};
  --ox-secondary-rgb: ${hexToRgbString(OX.secondary)};
  --ox-tertiary-rgb:  ${hexToRgbString(OX.tertiary)};
  --ox-error-rgb:     ${hexToRgbString(OX.error)};
  --ox-success-rgb:   ${hexToRgbString(OX.success)};
  --ox-warning-rgb:   ${hexToRgbString(OX.warning)};
  --ox-info-rgb:      ${hexToRgbString(OX.info)};

  /* ── Typography ── */
  --ox-display-lg:   ${OX.displayLG};
  --ox-display-md:   ${OX.displayMD};
  --ox-display-sm:   ${OX.displaySM};
  --ox-headline-lg:  ${OX.headlineLG};
  --ox-headline-md:  ${OX.headlineMD};
  --ox-headline-sm:  ${OX.headlineSM};
  --ox-title-lg:     ${OX.titleLG};
  --ox-title-md:     ${OX.titleMD};
  --ox-title-sm:     ${OX.titleSM};
  --ox-body-lg:      ${OX.bodyLG};
  --ox-body-md:      ${OX.bodyMD};
  --ox-body-sm:      ${OX.bodySM};
  --ox-label-lg:     ${OX.labelLG};
  --ox-label-md:     ${OX.labelMD};
  --ox-label-sm:     ${OX.labelSM};
}`
}

/**
 * Generate a minimal CSS block for Shadow DOM injection (plugins Chrome).
 * Only custom properties — no element selectors.
 * The host/root element will inherit all --ox-* vars.
 */
export function generateOXShadowCSS(theme: PluginTheme): string {
  return `:host {
  /* DS4 tokens — auto-generated from ds4-svelte/tokens */
  --ox-primary:               ${theme.primary};
  --ox-on-primary:            ${theme.onPrimary};
  --ox-primary-container:     ${theme.primaryContainer};
  --ox-on-primary-container:  ${theme.onPrimaryContainer};
  --ox-secondary:             ${theme.secondary ?? OX.secondary};
  --ox-on-secondary:          ${theme.onSecondary ?? OX.onSecondary};
  --ox-secondary-container:   ${theme.secondaryContainer ?? OX.secondaryContainer};
  --ox-on-secondary-container:${theme.onSecondaryContainer ?? OX.onSecondaryContainer};
  --ox-tertiary:              ${theme.tertiary ?? OX.tertiary};
  --ox-on-tertiary:           ${theme.onTertiary ?? OX.onTertiary};
  --ox-tertiary-container:    ${theme.tertiaryContainer ?? OX.tertiaryContainer};
  --ox-on-tertiary-container: ${theme.onTertiaryContainer ?? OX.onTertiaryContainer};
  --ox-error:                 ${theme.error ?? OX.error};
  --ox-on-error:              ${OX.onError};
  --ox-error-container:       ${theme.errorContainer ?? OX.errorContainer};
  --ox-on-error-container:    ${theme.onErrorContainer ?? OX.onErrorContainer};
  --ox-success:               ${OX.success};
  --ox-on-success:            ${OX.onSuccess};
  --ox-success-container:     ${OX.successContainer};
  --ox-on-success-container:  ${OX.onSuccessContainer};
  --ox-warning:               ${OX.warning};
  --ox-on-warning:            ${OX.onWarning};
  --ox-warning-container:     ${OX.warningContainer};
  --ox-on-warning-container:  ${OX.onWarningContainer};
  --ox-info:                  ${OX.info};
  --ox-on-info:               ${OX.onInfo};
  --ox-info-container:        ${OX.infoContainer};
  --ox-on-info-container:     ${OX.onInfoContainer};
  --ox-z-base:                ${OX.zBase};
  --ox-z-dropdown:            ${OX.zDropdown};
  --ox-z-sticky:              ${OX.zSticky};
  --ox-z-fixed:               ${OX.zFixed};
  --ox-z-modal:               ${OX.zModal};
  --ox-z-popover:             ${OX.zPopover};
  --ox-z-toast:               ${OX.zToast};
  --ox-z-tooltip:             ${OX.zTooltip};
  --ox-surface:               ${theme.surface ?? OX.surface};
  --ox-surface-1:             ${theme.surface1};
  --ox-surface-2:             ${theme.surface2};
  --ox-surface-3:             ${theme.surface3 ?? OX.surface3};
  --ox-surface-4:             ${theme.surface4 ?? OX.surface4};
  --ox-surface-5:             ${theme.surface5 ?? OX.surface5};
  --ox-on-surface:            ${theme.onSurface ?? OX.onSurface};
  --ox-on-surface-variant:    ${theme.onSurfaceVariant ?? OX.onSurfaceVariant};
  --ox-surface-variant:       ${theme.surfaceVariant ?? OX.surfaceVariant};
  --ox-outline:               ${theme.outline ?? OX.outline};
  --ox-outline-variant:       ${theme.outlineVariant ?? OX.outlineVariant};
  --phase-suggest:            ${OX.phaseSuggest};
  --phase-extract:            ${OX.phaseExtract};
  --phase-inject:             ${OX.phaseInject};
  --phase-validate:           ${OX.phaseValidate};
  --phase-idle:               ${OX.phaseIdle};
  --phase-loop:               ${OX.phaseLoop};
  --ox-elevation-1:           ${OX.elevation1};
  --ox-elevation-2:           ${OX.elevation2};
  --ox-elevation-3:           ${OX.elevation3};
  --ox-elevation-4:           ${OX.elevation4};
  --ox-elevation-5:           ${OX.elevation5};
  --ox-shape-none:            ${OX.shapeNone};
  --ox-shape-xs:              ${OX.shapeXS};
  --ox-shape-sm:              ${OX.shapeSM};
  --ox-shape-md:              ${OX.shapeMD};
  --ox-shape-lg:              ${OX.shapeLG};
  --ox-shape-xl:              ${OX.shapeXL};
  --ox-shape-full:            ${OX.shapeFull};
  --ox-duration-medium1:      ${OX.durationMedium1};
  --ox-easing-standard:       ${OX.easingStandard};
  --ox-easing-emphasized:     ${OX.easingEmphasized};
  --ox-spacing-0:             ${OX.spacing0};
  --ox-spacing-1:             ${OX.spacing1};
  --ox-spacing-2:             ${OX.spacing2};
  --ox-spacing-3:             ${OX.spacing3};
  --ox-spacing-4:             ${OX.spacing4};
  --ox-spacing-6:             ${OX.spacing6};
  --ox-spacing-8:             ${OX.spacing8};
  --ox-primary-rgb:           ${theme.primaryRgb ?? hexToRgbString(theme.primary)};
  --ox-secondary-rgb:         ${hexToRgbString(theme.secondary ?? OX.secondary)};
  --ox-tertiary-rgb:          ${theme.tertiaryRgb ?? hexToRgbString(theme.tertiary ?? OX.tertiary)};
  --ox-error-rgb:             ${hexToRgbString(theme.error ?? OX.error)};
  --ox-success-rgb:           ${hexToRgbString(OX.success)};
}`
}
