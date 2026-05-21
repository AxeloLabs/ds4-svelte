<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxImageCropper — Image crop with draggable selection
   * │ Powered by @zag-js/image-cropper
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id    — unique id (required)
   *   src   — image URL (required)
   */
  import * as imageCropper from '@zag-js/image-cropper'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id: string
    src: string
  }

  let { id, src }: Props = $props()

  const service = useMachine(imageCropper.machine, () => ({ id }))
  const api = $derived(imageCropper.connect(service, normalizeProps))
</script>

<div class="ox-imagecropper" data-ui="ox-image-cropper" {...api.getRootProps()}>
  <div class="ox-imagecropper-viewport" {...api.getViewportProps()}>
    <img
      {src}
      crossorigin="anonymous"
      alt="Crop preview"
      {...api.getImageProps()}
    />
    <div class="ox-imagecropper-selection" {...api.getSelectionProps()}>
      {#each imageCropper.handles as position}
        <div class="ox-imagecropper-handle" {...api.getHandleProps({ position })}>
          <span></span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .ox-imagecropper {
    width: 100%;
    font-family: system-ui, sans-serif;
  }

  .ox-imagecropper-viewport {
    position: relative;
    overflow: hidden;
    border-radius: var(--ox-shape-md, 12px);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    background: var(--ox-surface-1);
  }

  .ox-imagecropper-viewport img {
    display: block;
    width: 100%;
    height: auto;
    user-select: none;
    pointer-events: none;
  }

  .ox-imagecropper-selection {
    border: 2px solid #fff;
    box-shadow:
      0 0 0 9999px rgba(0, 0, 0, 0.5),
      0 0 8px rgba(0, 0, 0, 0.3);
  }

  .ox-imagecropper-handle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ox-imagecropper-handle span {
    width: 10px;
    height: 10px;
    background: #fff;
    border: 2px solid var(--ox-primary, #6750A4);
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
</style>
