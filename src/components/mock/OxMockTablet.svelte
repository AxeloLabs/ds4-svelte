<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxMockTablet — iPad Pro CSS Mock                        │
   * │ Portage du device CSS de webagency2-app.web.app         │
   * │ Natural size : 560 × 804 px                             │
   * └─────────────────────────────────────────────────────────┘
   */
  interface Props {
    src?:      string
    videoSrc?: string
    width?:    number
    class?:    string
    style?:    string
  }

  const NATURAL_W = 560
  const NATURAL_H = 804

  let { src, videoSrc, width = NATURAL_W, class: className = '', style = '', ...rest }: Props = $props()

  const scale = $derived(width / NATURAL_W)
  const containerH = $derived(Math.round(NATURAL_H * scale))
</script>

<div
  class="ox-mock-tablet-wrap {className}"
  style="width:{width}px;height:{containerH}px;{style}"
  data-ui="ox-mock-tablet"
  {...rest}
>
  <div class="ox-mock-tablet-inner" style="transform:scale({scale});transform-origin:top left">
    <div class="device device-ipad-pro">
      <div class="device-frame">
        {#if videoSrc}
          <video class="device-content" src={videoSrc} autoplay loop muted playsinline></video>
        {:else if src}
          <img class="device-content" src={src} alt="" />
        {:else}
          <div class="device-content device-content--empty"></div>
        {/if}
      </div>
      <div class="device-header"></div>
      <div class="device-sensors"></div>
    </div>
  </div>
</div>

<style>
  /* ── Wrapper ── */
  .ox-mock-tablet-wrap {
    position: relative;
    display: inline-block;
    overflow: visible;
    line-height: 0;
  }
  .ox-mock-tablet-inner {
    position: absolute;
    top: 0;
    left: 0;
  }

  /* ── Device root ── */
  .device-ipad-pro {
    height: 804px;
    width: 560px;
    position: relative;
  }

  /* ── Frame ── */
  .device-ipad-pro .device-frame {
    background: #fff;
    border-radius: 38px;
    box-shadow: inset 0 0 0 2px #c8cacb, inset 0 0 0 6px #e2e3e4;
    height: 804px;
    padding: 62px 25px;
    width: 560px;
    box-sizing: border-box;
    position: relative;
  }

  /* ── Content screen ── */
  .device-ipad-pro .device-content {
    border: 2px solid #222;
    border-radius: 2px;
    height: 680px;
    width: 510px;
    display: block;
    object-fit: cover;
    object-position: top;
  }
  .device-content--empty {
    background: #1a1a2e;
  }

  /* ── Home button ── */
  .device-ipad-pro .device-header {
    border: 2px solid #c8cacb;
    border-radius: 50%;
    bottom: 17px;
    height: 34px;
    left: 50%;
    margin-left: -17px;
    position: absolute;
    width: 34px;
  }

  /* ── Front camera ── */
  .device-ipad-pro .device-sensors {
    background: #666;
    border-radius: 50%;
    height: 10px;
    left: 50%;
    margin-left: -5px;
    margin-top: -5px;
    position: absolute;
    top: 34px;
    width: 10px;
  }
</style>
