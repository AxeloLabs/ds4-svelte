<script lang="ts">
  /**
   * OxAvatar — DS-4 Avatar
   * Powered by @zag-js/avatar v1.38
   *
   * Props:
   *   id    — unique id (required)
   *   src   — image URL (optional)
   *   name  — display name, used for fallback initials
   *   size  — 'sm' (32px) | 'md' (40px) | 'lg' (56px)
   */
  import * as avatar from '@zag-js/avatar'
  import { useMachine, normalizeProps } from '@zag-js/svelte'

  interface Props {
    id?: string
    src?: string
    name: string
    size?: 'sm' | 'md' | 'lg'
  }

  let {
    id = `ox-avatar-${Math.random().toString(36).slice(2, 9)}`,
    src,
    name = '',
    size = 'md',
  }: Props = $props()

  const service = useMachine(avatar.machine, () => ({ id }))
  const api = $derived(avatar.connect(service, normalizeProps))

  const initials = $derived(name.slice(0, 2).toUpperCase())

  const sizeMap = { sm: 32, md: 40, lg: 56 } as const
  const fontSize = { sm: 12, md: 14, lg: 18 } as const
</script>

<div
  class="ox-avatar ox-avatar-{size}"
  {...api.getRootProps()}
  data-ui="ox-avatar"
  style="--ox-av-size:{sizeMap[size]}px; --ox-av-font:{fontSize[size]}px"
>
  <img
    class="ox-avatar-img"
    {...api.getImageProps()}
    src={src}
    alt={name}
    referrerpolicy="no-referrer"
  />
  <span class="ox-avatar-fallback" {...api.getFallbackProps()}>
    {initials}
  </span>
</div>

<style>
  .ox-avatar {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ox-av-size);
    height: var(--ox-av-size);
    border-radius: 50%;
    overflow: hidden;
    background: var(--ox-primary-container, #EADDFF);
    flex-shrink: 0;
  }

  .ox-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  .ox-avatar-img[hidden] {
    display: none;
  }

  .ox-avatar-fallback {
    font: 600 var(--ox-av-font) system-ui;
    color: var(--ox-on-primary-container, #21005D);
    letter-spacing: 0.02em;
    user-select: none;
  }
  .ox-avatar-fallback[hidden] {
    display: none;
  }
</style>
