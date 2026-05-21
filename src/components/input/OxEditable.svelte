<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxEditable — Inline editable text
   * │ Powered by @zag-js/editable
   * └─────────────────────────────────────────────────────────┘
   */
  import * as editable from '@zag-js/editable'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { PencilIcon, CheckIcon, XIcon } from '@lucide/svelte'

  interface Props {
    id: string
    defaultValue?: string
    placeholder?: string
    onValueCommit?: (details: { value: string }) => void
    /** Variante visuelle. `underline` = legacy (souligné), `outlined` = mêmes
        dimensions qu'un OxField outlined (input boxed, taille stable preview/edit,
        bg gainsboro en mode édit pour signaler éditabilité). */
    variant?: 'underline' | 'outlined'
  }

  let {
    id,
    defaultValue = 'Click to edit',
    placeholder = 'Type here...',
    onValueCommit,
    variant = 'underline',
  }: Props = $props()

  const service = useMachine(editable.machine, () => ({
    id,
    defaultValue,
    placeholder,
    onValueCommit,
  }))

  const api = $derived(editable.connect(service, normalizeProps))
</script>

<div class="ox-editable ox-editable-{variant}" data-ui="ox-editable" {...api.getRootProps()}>
  <div class="ox-editable-area" {...api.getAreaProps()}>
    <input class="ox-editable-input" {placeholder} {...api.getInputProps()} />
    <span class="ox-editable-preview" {...api.getPreviewProps()}>{api.valueText}</span>
  </div>
  <div class="ox-editable-controls">
    {#if !api.editing}
      <button class="ox-editable-btn ox-editable-edit" aria-label="Editer" {...api.getEditTriggerProps()}>
        <PencilIcon size={18} strokeWidth={2} />
      </button>
    {:else}
      <button class="ox-editable-btn ox-editable-save" aria-label="Valider" {...api.getSubmitTriggerProps()}>
        <CheckIcon size={18} strokeWidth={2} />
      </button>
      <button class="ox-editable-btn ox-editable-cancel" aria-label="Annuler" {...api.getCancelTriggerProps()}>
        <XIcon size={18} strokeWidth={2} />
      </button>
    {/if}
  </div>
</div>

<style>
  .ox-editable {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: system-ui, sans-serif;
  }
  .ox-editable-area { position: relative; }
  .ox-editable-input {
    font: 400 16px/1.4 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    border: none;
    border-bottom: 2px solid var(--ox-primary, #6750A4);
    background: transparent;
    outline: none;
    padding: 4px 2px;
    caret-color: var(--ox-primary, #6750A4);
  }
  .ox-editable-input[hidden] { display: none; }
  .ox-editable-preview {
    font: 400 16px/1.4 system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    padding: 4px 2px;
    border-bottom: 1px dashed var(--ox-outline-variant, #CAC4D0);
    cursor: text;
    transition: border-color 150ms;
  }
  .ox-editable-preview:hover {
    border-color: var(--ox-on-surface-variant, #49454F);
  }
  .ox-editable-preview[hidden] { display: none; }
  .ox-editable-controls { display: flex; gap: 4px; }
  .ox-editable-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-xs, 4px);
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    transition: background 120ms, color 120ms;
  }
  .ox-editable-btn:hover { background: var(--ox-surface-2); color: var(--ox-on-surface); }
  .ox-editable-save:hover { color: var(--ox-primary, #6750A4); border-color: var(--ox-primary); }
  .ox-editable-cancel:hover { color: var(--ox-error, #B3261E); border-color: var(--ox-error); }

  /* ── OUTLINED VARIANT ──
     Preview et input ont EXACTEMENT les mêmes dimensions (height/padding/border
     STABLES — pas de transition au focus). Bg gainsboro uniquement sur l'input
     pour signaler le mode édition. Boutons à droite de l'input, alignés sur la hauteur. */
  .ox-editable-outlined {
    align-items: stretch;
    gap: 8px;
  }
  .ox-editable-outlined .ox-editable-area {
    flex: 1;
    min-width: 0;
  }
  .ox-editable-outlined .ox-editable-input,
  .ox-editable-outlined .ox-editable-preview {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 56px;                                      /* hauteur fixe */
    padding: 16px;
    border: 1px solid var(--ox-outline, #79747E);      /* border 1px FIGÉE */
    border-radius: var(--ox-shape-xs, 4px);
    font: var(--ox-body-lg, 400 16px/24px system-ui);
    color: var(--ox-on-surface, #1C1B1F);
    background: var(--ox-surface, #fff);
  }
  .ox-editable-outlined .ox-editable-preview {
    cursor: text;
    transition: border-color 150ms;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* Hover propagé : hover sur n'importe quoi dans le composant en mode lecture
     (= présence du bouton edit) → preview ET bouton edit passent en hover state.
     Le composant agit comme un seul bloc cliquable. */
  .ox-editable-outlined:has(.ox-editable-edit):hover .ox-editable-preview {
    border-color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-editable-outlined .ox-editable-input {
    background: gainsboro;
    outline: none;
    caret-color: var(--ox-primary, #6750A4);
    transition: border-color 150ms;
  }
  .ox-editable-outlined .ox-editable-input:focus {
    border-color: var(--ox-primary, #6750A4);          /* couleur change, taille NON */
  }
  .ox-editable-outlined .ox-editable-input::placeholder {
    color: var(--ox-on-surface-variant, #49454F);
    opacity: 0.6;
  }

  /* GROS BOUTONS DS4 — 56×56, alignés sur la hauteur de l'input, charte vert/rouge */
  /* Largeur réservée FIGÉE = 2 boutons + gap (120px). En mode lecture le
     bouton edit s'aligne à droite dans cette zone → l'input ne bouge JAMAIS
     entre lecture et édition. */
  .ox-editable-outlined .ox-editable-controls {
    flex-shrink: 0;
    min-width: 120px;
    justify-content: flex-end;
    gap: 8px;
  }
  .ox-editable-outlined .ox-editable-btn {
    width: 56px;
    height: 56px;
    border-width: 1px;
    border-style: solid;
    border-radius: var(--ox-shape-xs, 4px);
    transition: background 120ms, color 120ms, border-color 120ms;
  }
  .ox-editable-outlined .ox-editable-btn :global(svg) {
    width: 22px;
    height: 22px;
  }
  /* Save = vert (DS4 success) */
  .ox-editable-outlined .ox-editable-save {
    background: color-mix(in srgb, #16a34a 12%, transparent);
    border-color: color-mix(in srgb, #16a34a 40%, transparent);
    color: #16a34a;
  }
  .ox-editable-outlined .ox-editable-save:hover {
    background: #16a34a;
    border-color: #16a34a;
    color: #fff;
  }
  /* Cancel = rouge (DS4 error) */
  .ox-editable-outlined .ox-editable-cancel {
    background: color-mix(in srgb, var(--ox-error, #B3261E) 12%, transparent);
    border-color: color-mix(in srgb, var(--ox-error, #B3261E) 40%, transparent);
    color: var(--ox-error, #B3261E);
  }
  .ox-editable-outlined .ox-editable-cancel:hover {
    background: var(--ox-error, #B3261E);
    border-color: var(--ox-error, #B3261E);
    color: #fff;
  }
  /* Edit = neutre (DS4 outline-variant) — preview cliquable secondaire au :hover sur l'input */
  .ox-editable-outlined .ox-editable-edit {
    background: var(--ox-surface, #fff);
    border-color: var(--ox-outline-variant, #CAC4D0);
    color: var(--ox-on-surface-variant, #49454F);
  }
  /* Hover propagé : si on hover n'importe où dans le composant, le bouton edit
     passe aussi en hover state (même si la souris est sur la preview). */
  .ox-editable-outlined:has(.ox-editable-edit):hover .ox-editable-edit,
  .ox-editable-outlined .ox-editable-edit:hover {
    background: var(--ox-surface-2, #f4f4f4);
    border-color: var(--ox-outline, #79747E);
    color: var(--ox-on-surface, #1C1B1F);
  }
</style>
