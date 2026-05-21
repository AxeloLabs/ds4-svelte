<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxMockPhone — iPhone X CSS Mock                         │
   * │ Portage du device CSS de webagency2-app.web.app         │
   * │ Natural size : 428 × 868 px                             │
   * └─────────────────────────────────────────────────────────┘
   */
  interface Props {
    src?:      string
    videoSrc?: string
    width?:    number
    class?:    string
    style?:    string
  }

  const NATURAL_W = 428
  const NATURAL_H = 868

  let { src, videoSrc, width = NATURAL_W, class: className = '', style = '', ...rest }: Props = $props()

  const scale = $derived(width / NATURAL_W)
  const containerH = $derived(Math.round(NATURAL_H * scale))
</script>

<div
  class="ox-mock-phone-wrap {className}"
  style="width:{width}px;height:{containerH}px;{style}"
  data-ui="ox-mock-phone"
  {...rest}
>
  <div class="ox-mock-phone-inner" style="transform:scale({scale});transform-origin:top left">
    <div class="device device-iphone-x">
      <div class="device-frame">
        {#if videoSrc}
          <video class="device-content" src={videoSrc} autoplay loop muted playsinline></video>
        {:else if src}
          <img class="device-content" src={src} alt="" />
        {:else}
          <div class="device-content device-content--empty"></div>
        {/if}
      </div>
      <div class="device-stripe"></div>
      <div class="device-header"></div>
      <div class="device-sensors"></div>
      <div class="device-btns"></div>
      <div class="device-power"></div>
    </div>
  </div>
</div>

<style>
  /* ── Wrapper ── */
  .ox-mock-phone-wrap {
    position: relative;
    display: inline-block;
    overflow: visible;
    line-height: 0;
  }
  .ox-mock-phone-inner {
    position: absolute;
    top: 0;
    left: 0;
  }

  /* ── Device root ── */
  .device-iphone-x {
    height: 868px;
    width: 428px;
    position: relative;
  }

  /* ── Frame ── */
  .device-iphone-x .device-frame {
    background: #222;
    border-radius: 68px;
    box-shadow: inset 0 0 2px 2px #c8cacb, inset 0 0 0 7px #e2e3e4;
    height: 868px;
    padding: 28px;
    width: 428px;
    position: relative;
    box-sizing: border-box;
  }

  /* ── Content screen ── */
  .device-iphone-x .device-content {
    border-radius: 40px;
    height: 812px;
    width: 375px;
    display: block;
    object-fit: cover;
    object-position: top;
  }
  .device-content--empty {
    background: #1a1a2e;
  }

  /* ── Stripe (side separators) ── */
  .device-iphone-x .device-stripe::after,
  .device-iphone-x .device-stripe::before {
    border: solid rgba(51,51,51,.25);
    border-width: 0 7px;
    content: "";
    height: 7px;
    left: 0;
    position: absolute;
    width: 100%;
    z-index: 9;
  }
  .device-iphone-x .device-stripe::after  { top: 85px; }
  .device-iphone-x .device-stripe::before { bottom: 85px; }

  /* ── Header (notch) ── */
  .device-iphone-x .device-header {
    background: #222;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    height: 30px;
    left: 50%;
    margin-left: -102px;
    position: absolute;
    top: 28px;
    width: 204px;
    z-index: 10;
  }
  .device-iphone-x .device-header::after,
  .device-iphone-x .device-header::before {
    content: "";
    height: 10px;
    position: absolute;
    top: 0;
    width: 10px;
  }
  .device-iphone-x .device-header::after {
    background: radial-gradient(circle at bottom left, transparent 0, transparent 75%, #222 75%, #222 100%);
    left: -10px;
  }
  .device-iphone-x .device-header::before {
    background: radial-gradient(circle at bottom right, transparent 0, transparent 75%, #222 75%, #222 100%);
    right: -10px;
  }

  /* ── Sensors (speaker + camera) ── */
  .device-iphone-x .device-sensors::after,
  .device-iphone-x .device-sensors::before {
    content: "";
    position: absolute;
  }
  .device-iphone-x .device-sensors::after {
    background: #444;
    border-radius: 3px;
    height: 6px;
    left: 50%;
    margin-left: -25px;
    top: 32px;
    width: 50px;
    z-index: 11;
  }
  .device-iphone-x .device-sensors::before {
    background: #444;
    border-radius: 50%;
    height: 14px;
    left: 50%;
    margin-left: 40px;
    top: 28px;
    width: 14px;
    z-index: 11;
  }

  /* ── Buttons (left side) ── */
  .device-iphone-x .device-btns {
    background: #c8cacb;
    height: 32px;
    left: -3px;
    position: absolute;
    top: 115px;
    width: 3px;
  }
  .device-iphone-x .device-btns::after,
  .device-iphone-x .device-btns::before {
    background: #c8cacb;
    content: "";
    height: 62px;
    left: 0;
    position: absolute;
    width: 3px;
  }
  .device-iphone-x .device-btns::after  { top: 60px; }
  .device-iphone-x .device-btns::before { top: 140px; }

  /* ── Power button (right side) ── */
  .device-iphone-x .device-power {
    background: #c8cacb;
    height: 100px;
    position: absolute;
    right: -3px;
    top: 200px;
    width: 3px;
  }
</style>
