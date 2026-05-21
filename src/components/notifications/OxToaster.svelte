<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxToaster — Toast group container
   * │ Powered by @zag-js/toast group machine
   * │ Place once at app root. Use toaster.create() to show.
   * │ Supports stacking with overlap (hover to expand).
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   id      — unique id (default: 'ox-toaster')
   *   toaster — toast store from createOxToaster()
   */
  import * as toast from '@zag-js/toast'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import OxToastItem from './OxToastItem.svelte'

  interface Props {
    id?: string
    toaster: toast.Store
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  }

  let {
    id = 'ox-toaster',
    toaster,
    placement = 'bottom-end',
  }: Props = $props()

  const service = useMachine(toast.group.machine, () => ({
    id,
    store: toaster,
    placement,
  }))

  const api = $derived(toast.group.connect(service, normalizeProps))
</script>

<div class="ox-toaster" data-ui="ox-toaster" {...api.getGroupProps()}>
  {#each api.getToasts() as t, index (t.id)}
    <OxToastItem toast={t} {index} parent={service} />
  {/each}
</div>

<style>
  .ox-toaster {
    /* Zag handles position:fixed, inset offsets, flex via getGroupProps() */
    z-index: 2147483647;
    /* Override Zag center alignment → bottom-end */
    align-items: flex-end !important;
    /* 100px du bas au lieu du défaut Zag (~16px) */
    bottom: 100px !important;
  }
</style>
