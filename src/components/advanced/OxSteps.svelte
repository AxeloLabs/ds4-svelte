<script lang="ts">
  /**
   * OxSteps — DS-4 Step Indicator
   * CSS-powered — horizontal or vertical
   *
   * Props:
   *   steps       — array of step labels
   *   current     — current step index (0-based, bindable)
   *   orientation — 'horizontal' | 'vertical' (default: 'horizontal')
   */
  import { Check } from '@lucide/svelte'

  interface Props {
    steps: string[]
    current?: number
    orientation?: 'horizontal' | 'vertical'
    onStepClick?: (index: number) => void
  }

  let { steps, current = $bindable(0), orientation = 'horizontal', onStepClick }: Props = $props()
</script>

<div
  class="ox-steps ox-steps-{orientation}"
  data-ui="ox-steps"
  role="list"
  aria-label="Étapes"
>
  {#each steps as step, i}
    <div
      class="ox-step"
      class:ox-step-completed={i < current}
      class:ox-step-active={i === current}
      role="listitem"
    >
      <!-- Connector line (not for first item) -->
      {#if i > 0}
        <div class="ox-step-connector" class:ox-step-connector-done={i <= current}></div>
      {/if}

      <button
        class="ox-step-circle"
        onclick={() => { if (onStepClick) { current = i; onStepClick(i); } }}
        disabled={!onStepClick}
        aria-label="Étape {i + 1}: {step}"
        aria-current={i === current ? 'step' : undefined}
      >
        {#if i < current}
          <span class="ox-step-check"><Check size={16} strokeWidth={3} /></span>
        {:else}
          <span class="ox-step-num">{i + 1}</span>
        {/if}
      </button>

      <span class="ox-step-label">{step}</span>
    </div>
  {/each}
</div>

<style>
  .ox-steps {
    display: flex;
    align-items: flex-start;
    font-family: system-ui, sans-serif;
  }

  /* Horizontal */
  .ox-steps-horizontal {
    flex-direction: row;
    gap: 0;
  }
  .ox-steps-horizontal .ox-step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .ox-steps-horizontal .ox-step-connector {
    position: absolute;
    top: 16px;
    right: 50%;
    left: -50%;
    height: 2px;
    background: var(--ox-outline-variant, #CAC4D0);
    transition: background 200ms;
  }
  .ox-steps-horizontal .ox-step-connector-done {
    background: var(--ox-primary, #6750A4);
  }

  /* Vertical */
  .ox-steps-vertical {
    flex-direction: column;
    gap: 0;
  }
  .ox-steps-vertical .ox-step {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 16px;
    position: relative;
    padding-bottom: 24px;
  }
  .ox-steps-vertical .ox-step:last-child { padding-bottom: 0; }
  .ox-steps-vertical .ox-step-connector {
    position: absolute;
    left: 16px;
    top: -24px;
    bottom: auto;
    width: 2px;
    height: 24px;
    background: var(--ox-outline-variant, #CAC4D0);
    transition: background 200ms;
  }
  .ox-steps-vertical .ox-step-connector-done {
    background: var(--ox-primary, #6750A4);
  }

  /* Step circle */
  .ox-step-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 2px solid var(--ox-outline-variant, #CAC4D0);
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-on-surface-variant, #49454F);
    font: 500 14px system-ui;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    transition: border-color 200ms, background 200ms, color 200ms;
    cursor: default;
  }
  .ox-step-circle:not(:disabled) { cursor: pointer; }
  .ox-step-circle:not(:disabled):hover {
    background: var(--ox-surface-2, #EDE8F5);
  }

  .ox-step-active .ox-step-circle {
    border-color: var(--ox-primary, #6750A4);
    background: var(--ox-primary, #6750A4);
    color: var(--ox-on-primary, #fff);
  }

  .ox-step-completed .ox-step-circle {
    border-color: var(--ox-primary, #6750A4);
    background: var(--ox-primary-container, #EADDFF);
    color: var(--ox-primary, #6750A4);
  }

  .ox-step-check { font-size: 14px; line-height: 1; }
  .ox-step-num { font-size: 13px; line-height: 1; }

  /* Label */
  .ox-step-label {
    font: 400 12px/1.3 system-ui;
    color: var(--ox-on-surface-variant, #49454F);
    text-align: center;
    margin-top: 6px;
    max-width: 80px;
    word-break: break-word;
  }
  .ox-step-active .ox-step-label {
    color: var(--ox-on-surface, #1C1B1F);
    font-weight: 600;
  }
  .ox-steps-vertical .ox-step-label {
    text-align: left;
    max-width: none;
    margin-top: 6px;
    padding-top: 2px;
  }
</style>
