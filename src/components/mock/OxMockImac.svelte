<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxMockImac — iMac CSS Mock                              │
   * │ Portage du device CSS de devices.css (picturepan2)      │
   * │ Natural size : 640 × 638 px                             │
   * └─────────────────────────────────────────────────────────┘
   */
  interface Props {
    src?:      string
    videoSrc?: string
    width?:    number
    class?:    string
    style?:    string
  }

  const NATURAL_W = 640
  const NATURAL_H = 638

  let { src, videoSrc, width = NATURAL_W, class: className = '', style = '', ...rest }: Props = $props()

  const scale = $derived(width / NATURAL_W)
  const containerH = $derived(Math.round(NATURAL_H * scale))
</script>

<div
  class="ox-mock-imac-wrap {className}"
  style="width:{width}px;height:{containerH}px;{style}"
  data-ui="ox-mock-imac"
  {...rest}
>
  <div class="ox-mock-imac-inner" style="transform:scale({scale});transform-origin:top left">
    <div class="device device-imac">
      <div class="device-frame">
        {#if videoSrc}
          <video class="device-content" src={videoSrc} autoplay loop muted playsinline></video>
        {:else if src}
          <img class="device-content" src={src} alt="" />
        {:else}
          <div class="device-content device-content--empty"></div>
        {/if}
      </div>
      <div class="device-power"></div>
      <div class="device-home"></div>
    </div>
  </div>
</div>

<style>
  /* ── Wrapper ── */
  .ox-mock-imac-wrap {
    position: relative;
    display: inline-block;
    overflow: visible;
    line-height: 0;
  }
  .ox-mock-imac-inner {
    position: absolute;
    top: 0;
    left: 0;
  }

  /* ── Device root ── */
  .device-imac {
    height: 540px;
    width: 640px;
    position: relative;
  }

  /* ── Frame (monitor body) ── */
  .device-imac .device-frame {
    background: #edeef0;
    border-radius: 18px;
    box-shadow: inset 0 0 0 1px #d4d5d7;
    height: 440px;
    padding: 16px 16px 80px 16px;
    position: relative;
    width: 640px;
    box-sizing: border-box;
  }

  /* ── Chin bar ── */
  .device-imac .device-frame::after {
    background: #d4d5d7;
    border-radius: 0 0 18px 18px;
    bottom: 1px;
    box-shadow: inset 0 0 18px 0 #c7c8cb;
    content: "";
    height: 63px;
    left: 1px;
    position: absolute;
    width: 638px;
  }

  /* ── Front camera ── */
  .device-imac .device-frame::before {
    background: #050505;
    border-radius: 50%;
    content: "";
    height: 6px;
    left: 50%;
    margin-left: -3px;
    position: absolute;
    top: 6px;
    width: 6px;
    z-index: 9;
  }

  /* ── Screen content ── */
  .device-imac .device-content {
    border: 2px solid #121212;
    border-radius: 2px;
    height: 342px;
    width: 608px;
    display: block;
    object-fit: cover;
    object-position: top;
    position: relative;
    z-index: 1;
  }
  .device-content--empty {
    background: #1a1a2e;
  }

  /* ── Stand ── */
  .device-imac .device-power::before {
    background: linear-gradient(to bottom, #9fa1a6 0, #c7c8cb 40%, #c7c8cb 85%, white 90%, #6b6e74 100%);
    content: "";
    height: 92px;
    margin: 0 auto;
    position: relative;
    width: 152px;
    display: block;
  }

  /* ── Stand base connector ── */
  .device-imac .device-power::after {
    background: radial-gradient(circle at center, #d4d5d7 85%, #9fa1a6 100%);
    border-top: 1px solid #d4d5d7;
    content: "";
    height: 6px;
    margin: 0 auto;
    position: relative;
    width: 152px;
    display: block;
  }

  /* ── Stand feet ── */
  .device-imac .device-home {
    background: transparent;
    border-radius: 0 0 3px 3px;
    bottom: 0;
    box-shadow: -61px 0 #d4d5d7, 61px 0 #d4d5d7;
    height: 2px;
    left: 50%;
    margin-left: -15px;
    position: absolute;
    width: 30px;
  }
</style>
