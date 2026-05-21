<script lang="ts">
  /**
   * OxPagination — DS-4 Pagination
   * Powered by @zag-js/pagination v1.38
   *
   * Props:
   *   id       — unique id (required)
   *   count    — total number of items
   *   pageSize — items per page (default 10)
   *   page     — current page (bindable)
   */
  import * as pagination from '@zag-js/pagination'
  import { useMachine, normalizeProps } from '@zag-js/svelte'
  import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte'

  interface Props {
    id: string
    count: number
    pageSize?: number
    page?: number
  }

  let {
    id,
    count,
    pageSize = 10,
    page = $bindable(1),
  }: Props = $props()

  const service = useMachine(pagination.machine, () => ({
    id,
    count,
    pageSize,
    page,
    onPageChange: (d: { page: number }) => {
      page = d.page
    },
  }))

  const api = $derived(pagination.connect(service, normalizeProps))

  // Sync controlled prop → machine
  $effect(() => {
    if (api.page !== page) {
      api.setPage(page)
    }
  })
</script>

<nav class="ox-pagination" data-ui="ox-pagination" {...api.getRootProps()}>
  <button
    class="ox-pg-btn ox-pg-prev"
    data-ui="pagination-prev"
    {...api.getPrevTriggerProps()}
  >
    <ChevronLeftIcon size={16} strokeWidth={1.5} />
  </button>

  {#each api.pages as p, i}
    {#if p.type === 'page'}
      <button
        class="ox-pg-btn ox-pg-page"
        data-ui="pagination-page-{p.value}"
        {...api.getItemProps(p)}
      >{p.value}</button>
    {:else}
      <span class="ox-pg-ellipsis" {...api.getEllipsisProps({ index: i })}>...</span>
    {/if}
  {/each}

  <button
    class="ox-pg-btn ox-pg-next"
    data-ui="pagination-next"
    {...api.getNextTriggerProps()}
  >
    <ChevronRightIcon size={16} strokeWidth={1.5} />
  </button>
</nav>

<style>
  .ox-pagination {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: system-ui, sans-serif;
  }

  .ox-pg-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    border: none;
    border-radius: var(--ox-shape-sm, 8px);
    background: transparent;
    color: var(--ox-on-surface, #1C1B1F);
    font: 500 13px system-ui;
    cursor: pointer;
    user-select: none;
    transition: background 150ms, color 150ms;
  }
  .ox-pg-btn:hover:not(:disabled) {
    background: var(--ox-surface-2, #F4EEFF);
  }
  .ox-pg-btn:disabled {
    opacity: .38;
    cursor: not-allowed;
  }

  /* Active page */
  .ox-pg-page[data-selected] {
    background: var(--ox-primary, #6750A4);
    color: var(--ox-on-primary, #FFFFFF);
  }
  .ox-pg-page[data-selected]:hover {
    background: var(--ox-primary, #6750A4);
    filter: brightness(1.1);
  }

  /* Prev/Next arrows */
  .ox-pg-prev,
  .ox-pg-next {
    color: var(--ox-on-surface-variant, #49454F);
  }

  .ox-pg-ellipsis {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    color: var(--ox-on-surface-variant, #49454F);
    font: 500 13px system-ui;
  }
</style>
