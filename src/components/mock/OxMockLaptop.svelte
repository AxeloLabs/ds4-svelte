<script lang="ts">
  /**
   * ┌─────────────────────────────────────────────────────────┐
   * │ OxMockLaptop — MacBook Pro CSS Mock                     │
   * │ Portage du device CSS de webagency2-app.web.app         │
   * │ Natural size : 740 × 444 px                             │
   * └─────────────────────────────────────────────────────────┘
   */
  interface Props {
    src?:     string
    videoSrc?: string
    width?:   number
    class?:   string
    style?:   string
  }

  const NATURAL_W = 740
  const NATURAL_H = 444

  let { src, videoSrc, width = NATURAL_W, class: className = '', style = '', ...rest }: Props = $props()

  const scale = $derived(width / NATURAL_W)
  const containerH = $derived(Math.round(NATURAL_H * scale))
</script>

<div
  class="ox-mock-laptop-wrap {className}"
  style="width:{width}px;height:{containerH}px;{style}"
  data-ui="ox-mock-laptop"
  {...rest}
>
  <div class="ox-mock-laptop-inner" style="transform:scale({scale});transform-origin:top left">
    <div class="device device-macbook-pro">
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
      <div class="device-power"></div>
    </div>
  </div>
</div>

<style>
  /* ── Wrapper ── */
  .ox-mock-laptop-wrap {
    position: relative;
    display: inline-block;
    overflow: visible;
    line-height: 0;
  }
  .ox-mock-laptop-inner {
    position: absolute;
    top: 0;
    left: 0;
  }

  /* ── Device root ── */
  .device-macbook-pro {
    height: 444px;
    width: 740px;
    position: relative;
  }

  /* ── Frame ── */
  .device-macbook-pro .device-frame {
    background: #0d0d0d;
    border-radius: 20px;
    box-shadow: inset 0 0 0 2px #c8cacb;
    height: 428px;
    margin: 0 auto;
    padding: 29px 19px 39px;
    position: relative;
    width: 614px;
  }
  .device-macbook-pro .device-frame::after {
    background: #272626;
    border-radius: 0 0 20px 20px;
    bottom: 2px;
    content: "";
    height: 26px;
    left: 2px;
    position: absolute;
    width: 610px;
  }
  .device-macbook-pro .device-frame::before {
    bottom: 10px;
    color: #c8cacb;
    content: "MacBook Pro";
    font-size: 12px;
    font-family: system-ui, sans-serif;
    height: 16px;
    left: 50%;
    line-height: 16px;
    margin-left: -100px;
    position: absolute;
    text-align: center;
    width: 200px;
    z-index: 1;
  }

  /* ── Content screen ── */
  .device-macbook-pro .device-content {
    border: 2px solid #121212;
    border-radius: 2px;
    height: 360px;
    width: 576px;
    display: block;
    object-fit: cover;
    object-position: top;
  }
  .device-content--empty {
    background: #1a1a2e;
  }

  /* ── Base / power ── */
  .device-macbook-pro .device-power {
    background: #e2e3e4;
    border: solid #d5d6d8;
    border-radius: 2px 2px 0 0;
    border-width: 2px 4px 0 4px;
    height: 14px;
    margin-top: -10px;
    position: relative;
    width: 740px;
    z-index: 9;
  }
  .device-macbook-pro .device-power::after {
    background: #d5d6d8;
    border-radius: 0 0 10px 10px;
    box-shadow: inset 0 0 4px 2px #babdbf;
    content: "";
    height: 10px;
    left: 50%;
    margin-left: -60px;
    position: absolute;
    top: -2px;
    width: 120px;
  }
  .device-macbook-pro .device-power::before {
    background: #a0a3a7;
    border-radius: 0 0 180px 180px / 0 0 12px 12px;
    box-shadow: inset 0 -2px 6px #474a4d;
    content: "";
    height: 12px;
    left: -4px;
    margin: 0 auto;
    position: absolute;
    top: 10px;
    width: 740px;
  }
</style>
