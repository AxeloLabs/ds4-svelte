<script lang="ts">
  /**
   * OxGlobalSearch — DS-4 Global Search Input
   * CSS-powered — search bar for AppBar / AppShell
   *
   * Props:
   *   placeholder — input placeholder text (default: 'Rechercher…')
   *   value       — bindable search value
   *   onsubmit    — callback on form submit
   */
  import { Search } from '@lucide/svelte'

  interface Props {
    placeholder?: string
    value?: string
    onsubmit?: (value: string) => void
  }

  let { placeholder = 'Rechercher…', value = $bindable(''), onsubmit }: Props = $props()

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    onsubmit?.(value)
  }
</script>

<form data-ui="ox-global-search" class="ox-global-search" onsubmit={handleSubmit}>
  <Search class="ox-global-search-icon" size={15} strokeWidth={2} />
  <input
    class="ox-global-search-input"
    type="search"
    {placeholder}
    autocomplete="off"
    bind:value
  />
</form>

<style>
  .ox-global-search {
    position: relative;
    width: 120px;
    flex-shrink: 0;
  }

  :global(.ox-global-search-icon) {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 15px;
    height: 15px;
    color: var(--ox-on-surface-variant, #49454F);
    pointer-events: none;
  }

  .ox-global-search-input {
    width: 100%;
    padding: 7px 10px 7px 32px;
    border: 1px solid var(--ox-outline-variant, #CAC4D0);
    border-radius: var(--ox-shape-md, 12px);
    background: var(--ox-surface-1, #F7F2FA);
    color: var(--ox-on-surface, #1C1B1F);
    font: 400 13px system-ui;
    outline: none;
    box-sizing: border-box;
    transition: border-color 150ms, background 150ms;
  }

  .ox-global-search-input:focus {
    border-color: var(--ox-primary, #6750A4);
    background: var(--ox-surface, #FFFBFE);
  }

  /* Hide browser default clear button */
  .ox-global-search-input::-webkit-search-cancel-button {
    display: none;
  }
</style>
