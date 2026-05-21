<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxFileUpload — DS-4 File Upload / Dropzone
   * │ Powered by @zag-js/file-upload
   * │ Drag & drop + click to browse, file list with delete.
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id          — unique id (required)
   *   accept      — accepted MIME types (e.g. 'image/*')
   *   maxFiles    — max number of files (default: 1)
   *   maxFileSize — max size in bytes (default: 10MB)
   *   disabled    — boolean
   *   onFileChange — callback with { acceptedFiles, rejectedFiles }
   */
  import * as fileUpload from '@zag-js/file-upload'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { UploadCloud, X } from '@lucide/svelte'

  interface Props {
    id: string
    accept?: string | Record<string, string[]>
    maxFiles?: number
    maxFileSize?: number
    disabled?: boolean
    onFileChange?: (details: { acceptedFiles: File[]; rejectedFiles: any[] }) => void
  }

  let {
    id,
    accept,
    maxFiles = 1,
    maxFileSize = 10 * 1024 * 1024,
    disabled = false,
    onFileChange,
  }: Props = $props()

  const service = useMachine(fileUpload.machine, () => ({
    id,
    accept,
    maxFiles,
    maxFileSize,
    disabled,
    onFileChange,
  }))

  const api = $derived(fileUpload.connect(service, normalizeProps))

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
</script>

<div class="ox-fileupload" data-ui="ox-file-upload" {...api.getRootProps()}>
  <!-- Dropzone -->
  <div class="ox-fileupload-dropzone" {...api.getDropzoneProps()}>
    <input {...api.getHiddenInputProps()} />
    <div class="ox-fileupload-icon">
      <UploadCloud size={32} strokeWidth={1.5} />
    </div>
    <p class="ox-fileupload-text">Glisser vos fichiers ici</p>
    <p class="ox-fileupload-hint">ou</p>
    <button class="ox-fileupload-btn" {...api.getTriggerProps()}>
      Parcourir
    </button>
    <p class="ox-fileupload-constraints">
      {#if maxFiles > 1}Max {maxFiles} fichiers · {/if}Max {formatSize(maxFileSize)}
    </p>
  </div>

  <!-- File list -->
  {#if api.acceptedFiles.length > 0}
    <ul class="ox-fileupload-list" {...api.getItemGroupProps()}>
      {#each api.acceptedFiles as file}
        <li class="ox-fileupload-item" {...api.getItemProps({ file })}>
          <div class="ox-fileupload-item-info">
            <span class="ox-fileupload-item-name" {...api.getItemNameProps({ file })}>{file.name}</span>
            <span class="ox-fileupload-item-size">{formatSize(file.size)}</span>
          </div>
          <button class="ox-fileupload-item-delete" {...api.getItemDeleteTriggerProps({ file })} aria-label="Supprimer">
            <X size={16} strokeWidth={2} />
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .ox-fileupload {
    width: 100%;
    font-family: system-ui, sans-serif;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     DROPZONE
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-fileupload-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px 24px;
    border: 2px dashed var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-lg, 16px);
    background: var(--ox-surface-1, #F4EEFF);
    cursor: pointer;
    transition: border-color 150ms, background 150ms;
  }

  .ox-fileupload-dropzone[data-dragging] {
    border-color: var(--ox-primary, #6750A4);
    background: color-mix(in srgb, var(--ox-primary, #6750A4) 8%, var(--ox-surface-1, #F4EEFF));
  }

  .ox-fileupload-dropzone:hover:not([data-disabled]) {
    border-color: var(--ox-on-surface-variant, #49454F);
  }

  .ox-fileupload-dropzone[data-disabled] {
    opacity: 0.38;
    cursor: not-allowed;
  }

  .ox-fileupload-icon {
    color: var(--ox-on-surface-variant, #49454F);
    opacity: 0.6;
  }

  .ox-fileupload-text {
    font: 500 14px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    margin: 0;
  }

  .ox-fileupload-hint {
    font: 400 12px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    margin: 0;
  }

  .ox-fileupload-btn {
    padding: 8px 20px;
    border: 1px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-full, 999px);
    background: none;
    font: 500 13px system-ui;
    color: var(--ox-primary, #6750A4);
    cursor: pointer;
    transition: background 120ms;
  }
  .ox-fileupload-btn:hover {
    background: color-mix(in srgb, var(--ox-primary, #6750A4) 8%, transparent);
  }

  .ox-fileupload-constraints {
    font: 400 11px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    opacity: 0.6;
    margin: 4px 0 0;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     FILE LIST
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-fileupload-list {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ox-fileupload-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: var(--ox-shape-sm, 8px);
    background: var(--ox-surface-1, #F4EEFF);
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
  }

  .ox-fileupload-item-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ox-fileupload-item-name {
    font: 500 13px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ox-fileupload-item-size {
    font: 400 11px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }

  .ox-fileupload-item-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    color: var(--ox-on-surface-variant, #49454F);
    cursor: pointer;
    border-radius: 50%;
    flex-shrink: 0;
    transition: background 120ms, color 120ms;
  }
  .ox-fileupload-item-delete:hover {
    background: var(--ox-error-container, #F9DEDC);
    color: var(--ox-error, #B3261E);
  }
</style>
