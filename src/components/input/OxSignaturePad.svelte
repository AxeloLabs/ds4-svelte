<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxSignaturePad — signature numérique (canvas SVG)
   * │ Powered by @zag-js/signature-pad
   * │ Émet la signature en base64 PNG via onChange/value.
   * └─────────────────────────────────────────────────────────┘
   */
  import * as signaturePad from '@zag-js/signature-pad'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id: string
    label?: string
    width?: number
    height?: number
    disabled?: boolean
    readOnly?: boolean
    /** base64 data URL (image/png) — bindable. Vide tant qu'aucune signature n'a été tracée. */
    value?: string
    onChange?: (dataUrl: string) => void
    onClear?: () => void
  }

  let {
    id,
    label = 'Signature',
    width = 600,
    height = 200,
    disabled = false,
    readOnly = false,
    value = $bindable(''),
    onChange,
    onClear,
  }: Props = $props()

  const service = useMachine(signaturePad.machine, () => ({
    id,
    disabled,
    readOnly,
    onDrawEnd(details) {
      details.getDataUrl('image/png').then((url) => {
        value = url
        onChange?.(url)
      })
    },
  }))

  const api = $derived(signaturePad.connect(service, normalizeProps))

  function handleClear() {
    api.clear()
    value = ''
    onClear?.()
  }
</script>

<div class="ox-sig" data-ui="ox-signature-pad" style="--ox-sig-w:{width}px; --ox-sig-h:{height}px;">
  <div class="ox-sig-root" {...api.getRootProps()}>
    {#if label}
      <label class="ox-sig-label" {...api.getLabelProps()}>{label}</label>
    {/if}

    <div class="ox-sig-control" {...api.getControlProps()}>
      <svg class="ox-sig-canvas" {...api.getSegmentProps()}>
        {#each api.paths as path, i (i)}
          <path {...api.getSegmentPathProps({ path })} />
        {/each}
        {#if api.currentPath}
          <path {...api.getSegmentPathProps({ path: api.currentPath })} />
        {/if}
      </svg>

      <button
        type="button"
        class="ox-sig-clear"
        aria-label="Clear signature"
        {...api.getClearTriggerProps()}
        onclick={handleClear}
      >
        ✕
      </button>

      <div class="ox-sig-guide" {...api.getGuideProps()}></div>
    </div>
  </div>
</div>

<style>
  .ox-sig {
    display: inline-flex;
    flex-direction: column;
    gap: 8px;
    font-family: system-ui, sans-serif;
  }
  .ox-sig-root {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ox-sig-label {
    font: 500 13px/1.2 system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    user-select: none;
  }
  .ox-sig-control {
    position: relative;
    width: var(--ox-sig-w, 600px);
    height: var(--ox-sig-h, 200px);
    border: 1px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-md, 12px);
    background: var(--ox-surface, #FFFBFE);
    overflow: hidden;
    transition: border-color 150ms;
  }
  .ox-sig-control:focus-within {
    border-color: var(--ox-primary, #6750A4);
    border-width: 2px;
  }
  .ox-sig-control[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }
  .ox-sig-control[data-readonly] {
    pointer-events: none;
    background: var(--ox-surface-variant, #E7E0EC);
  }
  .ox-sig-canvas {
    width: 100%;
    height: 100%;
    display: block;
    cursor: crosshair;
    touch-action: none;
  }
  .ox-sig-canvas :global(path) {
    fill: none;
    stroke: var(--ox-on-surface, #1C1B1F);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ox-sig-clear {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    background: var(--ox-surface-variant, #E7E0EC);
    color: var(--ox-on-surface-variant, #49454F);
    font: 600 14px system-ui;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 120ms, color 120ms;
  }
  .ox-sig-clear:hover {
    background: var(--ox-error-container, #F9DEDC);
    color: var(--ox-on-error-container, #410E0B);
  }
  .ox-sig-guide {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 16px;
    height: 1px;
    background: color-mix(in srgb, var(--ox-on-surface, #1C1B1F) 20%, transparent);
    pointer-events: none;
  }
</style>
