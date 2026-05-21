// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// THEMES MANIFEST — single source of truth
// Used by book /ds/theme page + any consumer
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

export interface ThemeDef {
  slug: string
  name: string
  primary: string
  description: string
}

export const THEMES: ThemeDef[] = [
  // Ordre: chaud → froid (rose → marron → jaune → vert → bleu → violet → neutre)
  { slug: 'tinax',   name: 'Tinax',     primary: '#F43F5E', description: 'Rose vif — tinax-plugin' },
  { slug: 'tt',      name: 'TT',        primary: '#b14920', description: 'Rouille / cream — Toucher Terre (designer)' },
  { slug: 'bec',     name: 'BEC',       primary: '#FBBF24', description: 'Jaune lemon — Bienestar' },
  { slug: 'zapax',   name: 'Zapax',     primary: '#25D366', description: 'WhatsApp green — zapax-plugin' },
  { slug: 'cockpit', name: 'Cockpit',   primary: '#047857', description: 'Vert foncé — cockpit framework' },
  { slug: 'lc',      name: 'LC',        primary: '#0A66C2', description: 'LinkedIn blue — CRM2 (Oxela branding)' },
  { slug: 'book',    name: 'Book',      primary: '#7C3AED', description: 'Violet — book' },
  { slug: 'bw',      name: 'B&W',       primary: '#1A1A1A', description: 'Black & white neutre — theme par defaut (axelo)' },
]

// All color tokens we render swatches for (ordered by family)
export const COLOR_TOKENS: Array<{ name: string; pair?: string; family: string }> = [
  { name: '--ox-primary',                  pair: '--ox-on-primary',             family: 'Primary' },
  { name: '--ox-primary-container',        pair: '--ox-on-primary-container',   family: 'Primary' },
  { name: '--ox-secondary',                pair: '--ox-on-secondary',           family: 'Secondary' },
  { name: '--ox-secondary-container',      pair: '--ox-on-secondary-container', family: 'Secondary' },
  { name: '--ox-tertiary',                 pair: '--ox-on-tertiary',            family: 'Tertiary' },
  { name: '--ox-tertiary-container',       pair: '--ox-on-tertiary-container',  family: 'Tertiary' },
  { name: '--ox-surface-1',                family: 'Surface' },
  { name: '--ox-surface-2',                family: 'Surface' },
  { name: '--ox-surface-3',                family: 'Surface' },
  { name: '--ox-surface-4',                family: 'Surface' },
  { name: '--ox-surface-5',                family: 'Surface' },
  { name: '--ox-surface-variant',          family: 'Surface' },
  { name: '--ox-outline',                  family: 'Outline' },
  { name: '--ox-outline-variant',          family: 'Outline' },
  { name: '--ox-error',                    pair: '--ox-on-error-container',     family: 'Error' },
  { name: '--ox-error-container',          pair: '--ox-on-error-container',     family: 'Error' },
]

// App/plugin → theme mapping
export const APP_THEMES: Array<{ name: string; theme: string; port: number | string; type: 'app' | 'plugin' | 'framework' }> = [
  // Apps
  { name: 'axelo web',     theme: 'bw',      port: 5101, type: 'app' },
  { name: 'crm2 oxela',    theme: 'lc',      port: 5198, type: 'app' },
  { name: 'crm2 lc',       theme: 'lc',      port: 5196, type: 'app' },
  { name: 'toucher terre', theme: 'tt',      port: 5104, type: 'app' },
  { name: 'bienestar',     theme: 'bec',     port: 5109, type: 'app' },
  // Framework
  { name: 'cockpit',       theme: 'cockpit', port: 5190, type: 'framework' },
  { name: 'book',          theme: 'book',    port: 5193, type: 'framework' },
  // Plugins
  { name: 'tinax-plugin',  theme: 'tinax',   port: '—',  type: 'plugin' },
  { name: 'zapax-plugin',  theme: 'zapax',   port: '—',  type: 'plugin' },
  { name: 'lc-plugin',     theme: 'lc',      port: '—',  type: 'plugin' },
]
