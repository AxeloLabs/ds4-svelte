<script lang="ts">
  /**
   * OxTagsInput — DS-4 Tags Input
   * Powered by @zag-js/tags-input v1.38
   *
   * Props:
   *   id          — unique id (required)
   *   value       — array of tag strings (bindable)
   *   placeholder — input placeholder
   *   max         — max number of tags
   */
  import * as tagsInput from '@zag-js/tags-input'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id: string
    value?: string[]
    placeholder?: string
    max?: number
    onValueChange?: (value: string[]) => void
  }

  let { id, value = $bindable([]), placeholder = 'Ajouter...', max, onValueChange }: Props = $props()

  const service = useMachine(tagsInput.machine, () => ({
    id,
    value,
    max,
    onValueChange: (d: { value: string[] }) => {
      value = d.value
      onValueChange?.(d.value)
    },
  }))

  const api = $derived(tagsInput.connect(service, normalizeProps))
</script>

<div class="ox-tags-root" data-ui="ox-tags-input" {...api.getRootProps()}>
  <div class="ox-tags-control" {...api.getControlProps()}>
    {#each api.value as tagValue, index}
      <span class="ox-tag" {...api.getItemProps({ value: tagValue, index })}>
        <span class="ox-tag-text" {...api.getItemTextProps({ value: tagValue, index })}>{tagValue}</span>
        <button
          class="ox-tag-delete"
          {...api.getItemDeleteTriggerProps({ value: tagValue, index })}
          aria-label="Supprimer {tagValue}"
        >✕</button>
      </span>
    {/each}
    <input
      class="ox-tags-input"
      placeholder={api.value.length === 0 ? placeholder : ''}
      {...api.getInputProps()}
    />
  </div>
</div>

<style>
  .ox-tags-root {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: system-ui, sans-serif;
  }

  .ox-tags-control {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1.5px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-sm, 8px);
    background: var(--ox-surface, #FFFBFE);
    transition: border-color 150ms;
    min-height: 44px;
  }
  .ox-tags-root:focus-within .ox-tags-control {
    border-color: var(--ox-primary, #6750A4);
    outline: 1px solid var(--ox-primary, #6750A4);
  }

  .ox-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 8px;
    background: var(--ox-secondary-container, #E8DEF8);
    color: var(--ox-on-secondary-container, #1D192B);
    border-radius: var(--ox-shape-xs, 4px);
    font: 500 12px system-ui;
    cursor: default;
  }
  .ox-tag[data-highlighted] {
    background: var(--ox-primary, #6750A4);
    color: var(--ox-on-primary, #fff);
  }

  .ox-tag-text { line-height: 1; }

  .ox-tag-delete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px; height: 20px;
    border: none; background: none;
    color: inherit;
    cursor: pointer;
    font-size: 10px;
    border-radius: 50%;
    padding: 0;
    transition: background 120ms;
    opacity: 0.7;
  }
  .ox-tag-delete:hover { background: rgba(0,0,0,0.12); opacity: 1; }

  .ox-tags-input {
    flex: 1;
    min-width: 80px;
    border: none;
    outline: none;
    background: none;
    font: 400 14px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    padding: 0;
  }
  .ox-tags-input::placeholder {
    color: var(--ox-on-surface-variant, #49454F);
  }
</style>
