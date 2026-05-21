<script lang="ts">
  /**
   * OxRating — DS-4 Rating (stars)
   * Powered by @zag-js/rating-group v1.38
   *
   * Props:
   *   id        — unique id (required)
   *   count     — number of stars (default 5)
   *   value     — current rating (bindable)
   *   readOnly  — disable interaction (default false)
   */
  import * as rating from '@zag-js/rating-group'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id: string
    count?: number
    value?: number
    readOnly?: boolean
  }

  let {
    id,
    count = 5,
    value = $bindable(0),
    readOnly = false,
  }: Props = $props()

  const service = useMachine(rating.machine, () => ({
    id,
    count,
    value,
    readOnly,
    onValueChange: (d: { value: number }) => {
      value = d.value
    },
  }))

  const api = $derived(rating.connect(service, normalizeProps))

  // Sync controlled prop → machine
  $effect(() => {
    if (value !== api.value) {
      api.setValue(value)
    }
  })
</script>

<div class="ox-rating" {...api.getRootProps()} data-ui="ox-rating">
  <label class="ox-rating-label" {...api.getLabelProps()}>Rating</label>
  <div class="ox-rating-control" {...api.getControlProps()}>
    {#each api.items as index}
      {@const itemProps = api.getItemProps({ index })}
      <span class="ox-rating-star" data-ui="rating-star-{index}" {...itemProps}>
        {#if api.getItemState({ index }).highlighted}★{:else}☆{/if}
      </span>
    {/each}
  </div>
  <input {...api.getHiddenInputProps()} />
</div>

<style>
  .ox-rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .ox-rating-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }

  .ox-rating-control {
    display: flex;
    gap: 2px;
  }

  .ox-rating-star {
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    user-select: none;
    color: var(--ox-outline-variant, #CAC4D0);
    transition: color 120ms, transform 120ms;
  }
  .ox-rating-star[data-highlighted] {
    color: var(--ox-primary, #6750A4);
  }
  .ox-rating-star:hover:not([data-readonly]) {
    transform: scale(1.15);
  }
  .ox-rating[data-readonly] .ox-rating-star {
    cursor: default;
  }
</style>
