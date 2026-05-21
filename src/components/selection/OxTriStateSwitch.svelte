<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxTriStateSwitch — 3-state cyclic switch
   * │ OFF → State2 → State3 → OFF (click cycles)
   * │ Deeper shadow at 2nd level for visual distinction
   * └─────────────────────────────────────────────────────────┘
   */

  interface TriState {
    label: string
    value: string
  }

  interface Props {
    id?: string
    states: [TriState, TriState, TriState]
    current?: number
    onchange?: (index: number, state: TriState) => void
  }

  let { id = 'ox-tri-state', states, current = $bindable(0), onchange }: Props = $props()

  function cycle() {
    current = (current + 1) % 3
    onchange?.(current, states[current])
  }

  const isOff = $derived(current === 0)
  const isLevel2 = $derived(current === 2)
</script>

<button
  {id}
  class="ox-tri-switch"
  class:ox-tri-off={isOff}
  class:ox-tri-level2={isLevel2}
  onclick={cycle}
  data-ui="ox-tri-state-switch"
  data-state={current}
  aria-label={states[current].label}
  aria-pressed={current === 0 ? 'false' : 'true'}
>
  <span class="ox-tri-label">{states[current].label}</span>
</button>

<style>
  .ox-tri-switch {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 56px;
    height: 32px;
    padding: 0 12px;
    border: 1.5px solid var(--ox-outline, #79747E);
    border-radius: var(--ox-shape-full, 9999px);
    background: var(--ox-primary, #6750A4);
    color: var(--ox-on-primary, #FFFFFF);
    font: 600 12px/1 system-ui;
    cursor: pointer;
    transition: all 200ms ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .ox-tri-off {
    background: var(--ox-surface-variant, #E7E0EC);
    color: var(--ox-on-surface-variant, #49454F);
    border-color: var(--ox-outline, #79747E);
    box-shadow: none;
  }
  .ox-tri-level2 {
    background: var(--ox-primary-container, #EADDFF);
    color: var(--ox-on-primary-container, #21005D);
    box-shadow: 0 2px 6px rgba(0,0,0,0.35), inset 0 1px 2px rgba(0,0,0,0.15);
  }
  .ox-tri-switch:hover { filter: brightness(0.95); }
  .ox-tri-switch:active { transform: scale(0.95); }
  .ox-tri-label { white-space: nowrap; }
</style>
