<script lang="ts">
  /**
   * OxAccordion — DS-4 Accordion
   * Powered by @zag-js/accordion v1.38
   *
   * Props:
   *   id          — unique id (required)
   *   items       — array of { value, label, content }
   *   multiple    — allow multiple open (default false)
   *   collapsible — allow all closed (default true)
   */
  import * as accordion from '@zag-js/accordion'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id: string
    items: Array<{ value: string; label: string; content: string }>
    multiple?: boolean
    collapsible?: boolean
  }

  let {
    id,
    items,
    multiple = false,
    collapsible = true,
  }: Props = $props()

  const service = useMachine(accordion.machine, () => ({
    id,
    multiple,
    collapsible,
  }))

  const api = $derived(accordion.connect(service, normalizeProps))
</script>

<div class="ox-accordion" {...api.getRootProps()} data-ui="ox-accordion">
  {#each items as item}
    {@const itemProps = api.getItemProps({ value: item.value })}
    {@const triggerProps = api.getItemTriggerProps({ value: item.value })}
    {@const indicatorProps = api.getItemIndicatorProps({ value: item.value })}
    {@const contentProps = api.getItemContentProps({ value: item.value })}
    <div class="ox-acc-item" {...itemProps}>
      <button
        class="ox-acc-trigger"
        data-ui="acc-trigger-{item.value}"
        {...triggerProps}
      >
        <span class="ox-acc-label">{item.label}</span>
        <span class="ox-acc-indicator" {...indicatorProps}>▾</span>
      </button>
      <div class="ox-acc-content" {...contentProps}>
        <div class="ox-acc-body">{item.content}</div>
      </div>
    </div>
  {/each}
</div>

<style>
  .ox-accordion {
    width: 100%;
    font-family: system-ui, sans-serif;
    color: var(--ox-on-surface, #1C1B1F);
  }

  .ox-acc-item {
    border-bottom: 1px solid var(--ox-outline-variant, #CAC4D0);
  }

  .ox-acc-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 14px 16px;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    color: var(--ox-on-surface, #1C1B1F);
    transition: background 150ms;
  }
  .ox-acc-trigger:hover {
    background: rgba(0, 0, 0, 0.04);
  }
  .ox-acc-trigger[data-disabled] {
    opacity: 0.38;
    cursor: not-allowed;
  }

  .ox-acc-label {
    font: 500 14px system-ui;
  }

  .ox-acc-indicator {
    font-size: 16px;
    color: var(--ox-on-surface-variant, #49454F);
    transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
    flex-shrink: 0;
  }
  [data-state="open"] .ox-acc-indicator {
    transform: rotate(180deg);
  }

  .ox-acc-content {
    overflow: hidden;
    transition: height 200ms cubic-bezier(0.2, 0, 0, 1);
  }
  .ox-acc-content[hidden] {
    display: none;
  }

  .ox-acc-body {
    padding: 0 16px 14px;
    font: 400 13px/1.5 system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }
</style>
