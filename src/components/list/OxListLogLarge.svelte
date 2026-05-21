<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxListLogLarge — Pre-styled log entry
   * │ Compact single-line: timestamp + OxChip xs + detail
   * │ Background tinted by status. Used in: plugin info/run.
   * └─────────────────────────────────────────────────────────┘
   *
   * Props:
   *   time    — timestamp string (e.g. "21:03:08")
   *   action  — action label (e.g. "REPLY", "LOOP")
   *   detail  — description text
   *   status  — 'ok' | 'error' | 'pending' (background tint)
   *   color   — action chip color (CSS color)
   */
  import OxChip from '../notifications/OxChip.svelte'

  interface Props {
    time: string
    action: string
    detail: string
    status?: 'ok' | 'error' | 'pending'
    color?: string
  }

  let { time, action, detail, status = 'ok', color = '#6b7280' }: Props = $props()

  const STATUS_BG: Record<string, string> = {
    ok:      'var(--ox-success-container, #dcfce7)',
    error:   'var(--ox-error-container, #fee2e2)',
    pending: '#fef9c3',
  }
</script>

<li class="ox-micro-log" data-ui="ox-list-log-large" style="background:{STATUS_BG[status] ?? 'transparent'}">
  <span class="ox-ml-time">{time}</span>
  <span class="ox-ml-chip">
    <OxChip variant="assist" size="xs" label={action} color={color} />
  </span>
  <span class="ox-ml-detail">{detail}</span>
</li>

<style>
  .ox-micro-log {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    min-height: 26px;
    border-bottom: 1px solid color-mix(in srgb, var(--ox-outline-variant, #CAC4D0) 40%, transparent);
    font-family: system-ui, sans-serif;
    list-style: none;
  }
  .ox-micro-log:last-child { border-bottom: none; }

  .ox-ml-time {
    font: 400 11px/1 monospace;
    color: var(--ox-on-surface-variant, #49454F);
    flex-shrink: 0;
    width: 58px;
  }
  .ox-ml-chip {
    display: inline-flex;
    width: 72px;
    flex-shrink: 0;
    justify-content: center;
  }
  .ox-ml-detail {
    font: 400 12px/16px system-ui;
    color: var(--ox-on-surface, #1C1B1F);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
