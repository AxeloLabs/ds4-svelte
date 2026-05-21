<script lang="ts" module>
  export interface OxStepperItem {
    title: string
    description?: string
    icon?: string
    meta?: string
  }
</script>

<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxStepper — DS-4 Stepper / Timeline (MD3)
   * │ Powered by @zag-js/steps
   * │ Ref: https://zagjs.com/components/react/steps
   * │
   * │ Distinct from OxSteps (advanced/) which is a simple
   * │ CSS step indicator. OxStepper is the richer Zag-based
   * │ component with content panels and static timeline mode.
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id           — unique id (required)
   *   items        — array of OxStepperItem
   *   orientation  — 'horizontal' | 'vertical' (default 'horizontal')
   *   step         — current step index (bindable, default 0)
   *   linear       — restrict navigation to next/prev only (default false)
   *   display      — 'interactive' | 'static' (default 'interactive')
   *                  'static' = read-only timeline (no hover/click, all complete)
   *   itemContent  — snippet rendered inside each step content panel
   */
  import * as steps from '@zag-js/steps'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    id: string
    items: OxStepperItem[]
    orientation?: 'horizontal' | 'vertical'
    step?: number
    linear?: boolean
    display?: 'interactive' | 'static'
    itemContent?: Snippet<[{ index: number; item: OxStepperItem }]>
  }

  let {
    id,
    items,
    orientation = 'horizontal',
    step = $bindable(0),
    linear = false,
    display = 'interactive',
    itemContent,
  }: Props = $props()

  const service = useMachine(steps.machine, () => ({
    id,
    count: items.length,
    orientation,
    linear,
    step: display === 'static' ? items.length : step,
    onStepChange: (d: { step: number }) => {
      if (display !== 'static') step = d.step
    },
  }))

  const api = $derived(steps.connect(service, normalizeProps))
</script>

<!--
  Two layouts:
  - display="static" + orientation="vertical" → CV timeline:
    indicator + label + itemContent are all in the same grid item
  - else → standard Zag pattern: list of triggers, then content panels below
-->
{#if display === 'static' && orientation === 'vertical' && itemContent}
  <div
    class="ox-steps ox-steps-static"
    data-ui="ox-stepper"
    {...api.getRootProps()}
  >
    <div class="ox-steps-list" {...api.getListProps()}>
      {#each items as item, index (index)}
        <div class="ox-steps-item ox-steps-item-static" {...api.getItemProps({ index })}>
          <span class="ox-steps-rail">
            <span class="ox-steps-indicator" {...api.getIndicatorProps({ index })}>
              {#if item.icon}
                <span class="ox-steps-icon">{item.icon}</span>
              {:else}
                <span class="ox-steps-num">{index + 1}</span>
              {/if}
            </span>
            {#if index < items.length - 1}
              <span class="ox-steps-separator" {...api.getSeparatorProps({ index })}></span>
            {/if}
          </span>
          <div class="ox-steps-body">
            <div class="ox-steps-label">
              <span class="ox-steps-title" data-ui="step-title-{index}">{item.title}</span>
              {#if item.meta}
                <span class="ox-steps-meta">{item.meta}</span>
              {/if}
            </div>
            <div class="ox-steps-inline-content" data-ui="step-content-{index}">
              {@render itemContent({ index, item })}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div
    class="ox-steps"
    class:ox-steps-static={display === 'static'}
    data-ui="steps-{id}"
    {...api.getRootProps()}
  >
    <div class="ox-steps-list" {...api.getListProps()}>
      {#each items as item, index (index)}
        <div class="ox-steps-item" {...api.getItemProps({ index })}>
          <button
            class="ox-steps-trigger"
            data-ui="step-trigger-{index}"
            disabled={display === 'static'}
            {...api.getTriggerProps({ index })}
          >
            <span class="ox-steps-indicator" {...api.getIndicatorProps({ index })}>
              {#if item.icon}
                <span class="ox-steps-icon">{item.icon}</span>
              {:else}
                <span class="ox-steps-num">{index + 1}</span>
              {/if}
            </span>
            <span class="ox-steps-label">
              <span class="ox-steps-title" data-ui="step-title-{index}">{item.title}</span>
              {#if item.meta}
                <span class="ox-steps-meta">{item.meta}</span>
              {/if}
              {#if item.description && !itemContent}
                <span class="ox-steps-desc">{item.description}</span>
              {/if}
            </span>
          </button>
          {#if index < items.length - 1}
            <span class="ox-steps-separator" {...api.getSeparatorProps({ index })}></span>
          {/if}
        </div>
      {/each}
    </div>

    {#if itemContent}
      {#each items as item, index (index)}
        <div
          class="ox-steps-content"
          data-ui="step-content-{index}"
          {...api.getContentProps({ index })}
        >
          {@render itemContent({ index, item })}
        </div>
      {/each}
    {/if}
  </div>
{/if}

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ROOT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-steps {
    width: 100%;
    font-family: system-ui, sans-serif;
    color: var(--ox-on-surface, #1C1B1F);
    --ox-steps-indicator-size: 32px;
    --ox-steps-indicator-bg: var(--ox-surface-variant, #E7E0EC);
    --ox-steps-indicator-fg: var(--ox-on-surface-variant, #49454F);
    --ox-steps-active-bg: var(--ox-primary, #6750A4);
    --ox-steps-active-fg: var(--ox-on-primary, #FFFFFF);
    --ox-steps-line: var(--ox-outline-variant, #CAC4D0);
    --ox-steps-line-active: var(--ox-primary, #6750A4);
    --ox-steps-gap: 12px;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     LIST
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-steps-list[data-orientation='horizontal'] {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: var(--ox-steps-gap);
  }
  .ox-steps-list[data-orientation='vertical'] {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ITEM
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-steps-item[data-orientation='horizontal'] {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .ox-steps-item[data-orientation='vertical'] {
    display: grid;
    grid-template-columns: var(--ox-steps-indicator-size) 1fr;
    column-gap: var(--ox-steps-gap);
    row-gap: 0;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     TRIGGER (button wrapping indicator + label)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-steps-trigger {
    display: flex;
    align-items: flex-start;
    gap: var(--ox-steps-gap);
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    text-align: left;
    font: inherit;
    user-select: none;
    transition: background 120ms;
  }
  .ox-steps-item[data-orientation='horizontal'] .ox-steps-trigger {
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex-shrink: 0;
  }
  .ox-steps-item[data-orientation='vertical'] .ox-steps-trigger {
    flex-direction: row;
    align-items: flex-start;
    grid-column: 1 / -1;
  }

  .ox-steps-trigger:disabled {
    cursor: default;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     INDICATOR
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-steps-indicator {
    width: var(--ox-steps-indicator-size);
    height: var(--ox-steps-indicator-size);
    border-radius: 50%;
    background: var(--ox-steps-indicator-bg);
    color: var(--ox-steps-indicator-fg);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font: 600 14px system-ui;
    transition: background 200ms, color 200ms, transform 200ms;
  }
  .ox-steps-icon {
    font-size: 16px;
    line-height: 1;
  }

  /* States from Zag */
  .ox-steps-indicator[data-current],
  .ox-steps-indicator[data-complete] {
    background: var(--ox-steps-active-bg);
    color: var(--ox-steps-active-fg);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     LABEL (title + meta + optional desc)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-steps-label {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .ox-steps-title {
    font: 600 14px system-ui;
    letter-spacing: 0.1px;
    color: var(--ox-on-surface, #1C1B1F);
  }
  .ox-steps-meta {
    font: 500 12px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
  }
  .ox-steps-desc {
    font: 400 12px system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    margin-top: 2px;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     SEPARATOR
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-steps-separator {
    background: var(--ox-steps-line);
    transition: background 200ms;
  }
  .ox-steps-separator[data-orientation='horizontal'] {
    flex: 1;
    height: 2px;
    margin: calc(var(--ox-steps-indicator-size) / 2) 0 0 0;
    align-self: flex-start;
  }
  .ox-steps-separator[data-orientation='vertical'] {
    width: 2px;
    min-height: 24px;
    grid-column: 1;
    justify-self: center;
    margin: 4px 0;
  }
  .ox-steps-separator[data-complete] {
    background: var(--ox-steps-line-active);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     CONTENT (snippet panel)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-steps-content {
    padding: 12px 0;
  }
  .ox-steps[data-orientation='vertical'] .ox-steps-content {
    grid-column: 2;
    padding: 0 0 16px 0;
  }

  /* In static mode the content rendering is per-item next to indicator,
     not gated by current step → show all */
  .ox-steps-static .ox-steps-content {
    display: block !important;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     STATIC MODE — read-only timeline
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-steps-static .ox-steps-trigger {
    cursor: default;
  }
  .ox-steps-static .ox-steps-trigger:hover,
  .ox-steps-static .ox-steps-trigger:focus-visible {
    background: none;
    outline: none;
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     STATIC VERTICAL — CV timeline layout
     rail (indicator + line) on the left, body on the right
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-steps-item-static {
    display: grid;
    grid-template-columns: var(--ox-steps-indicator-size) 1fr;
    column-gap: var(--ox-steps-gap);
    align-items: stretch;
  }
  .ox-steps-rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    grid-column: 1;
  }
  .ox-steps-rail .ox-steps-separator {
    flex: 1;
    width: 2px;
    min-height: 16px;
    margin: 4px 0;
  }
  .ox-steps-body {
    grid-column: 2;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 24px;
  }
  .ox-steps-item-static:last-child .ox-steps-body {
    padding-bottom: 0;
  }
  .ox-steps-inline-content {
    /* host slot for cards rendered next to each indicator */
  }
</style>
