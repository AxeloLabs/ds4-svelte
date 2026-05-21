<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxVideoText — Video masked by text shape
   * │ SVG text as mask-image over a <video> element
   * │ Inspired by magicui/video-text
   * └─────────────────────────────────────────────────────────┘
   */

  interface Props {
    src: string
    text: string
    fontSize?: number | string
    fontWeight?: number | string
    fontFamily?: string
    autoplay?: boolean
    muted?: boolean
    loop?: boolean
    width?: string
    height?: string
    class?: string
  }

  let {
    src,
    text,
    fontSize = 20,
    fontWeight = 'bold',
    fontFamily = 'sans-serif',
    autoplay = true,
    muted = true,
    loop = true,
    width = '100%',
    height = '400px',
    class: className = '',
  }: Props = $props()

  let videoEl: HTMLVideoElement | undefined = $state()

  const responsiveFontSize = $derived(
    typeof fontSize === 'number' ? `${fontSize}vw` : fontSize
  )

  let containerEl: HTMLDivElement | undefined = $state()
  let containerW = $state(800)
  let containerH = $state(400)

  // Convert vw-based font size to absolute px for SVG mask
  const fontSizePx = $derived(
    typeof fontSize === 'number'
      ? Math.round((fontSize / 100) * containerW)
      : parseInt(fontSize, 10) || 120
  )

  // Strip CSS quotes from fontFamily for SVG attribute context
  const svgFontFamily = $derived(fontFamily.replace(/'/g, ''))

  const svgMask = $derived(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${containerW}" height="${containerH}"><text x="50%" y="50%" font-size="${fontSizePx}px" font-weight="${fontWeight}" text-anchor="middle" dominant-baseline="central" font-family="${svgFontFamily}" fill="white">${text}</text></svg>`
  )

  const dataUrlMask = $derived(
    `url("data:image/svg+xml,${encodeURIComponent(svgMask)}")`
  )

  // Track container dimensions for SVG mask
  $effect(() => {
    if (!containerEl) return
    const ro = new ResizeObserver(([entry]) => {
      containerW = Math.round(entry.contentRect.width)
      containerH = Math.round(entry.contentRect.height)
    })
    ro.observe(containerEl)
    return () => ro.disconnect()
  })

  // Force reload video when src changes
  $effect(() => {
    if (videoEl && src) {
      videoEl.load()
    }
  })
</script>

<div
  bind:this={containerEl}
  class="ox-video-text {className}"
  style="width:{width}; height:{height}"
  data-ui="ox-video-text"
>
  <div
    class="ox-vt-mask"
    style="
      -webkit-mask-image:{dataUrlMask};
      mask-image:{dataUrlMask};
      -webkit-mask-size:100% 100%;
      mask-size:100% 100%;
      -webkit-mask-repeat:no-repeat;
      mask-repeat:no-repeat;
      -webkit-mask-position:center;
      mask-position:center;
    "
  >
    <!-- svelte-ignore a11y_media_has_caption -->
    <video
      bind:this={videoEl}
      class="ox-vt-video"
      {src}
      autoplay={autoplay}
      muted={muted}
      loop={loop}
      preload="auto"
      playsinline
    ></video>
  </div>
  <span class="sr-only">{text}</span>
</div>

<style>
  .ox-video-text {
    position: relative;
    overflow: hidden;
    background: #0a0a0a;
  }
  .ox-vt-mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ox-vt-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
