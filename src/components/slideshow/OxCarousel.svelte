<script lang="ts">
  /**
   * OxCarousel — DS-4 Carousel
   * Powered by embla-carousel-svelte v8
   *
   * Props:
   *   slides     — Snippet rendering slide content
   *   loop       — infinite loop (default false)
   *   autoplay   — auto-advance (default false)
   *   showDots   — show dot indicators (default true)
   *   showArrows — show prev/next arrows (default true)
   */
  import emblaCarouselSvelte from 'embla-carousel-svelte'
  import type { EmblaCarouselType } from 'embla-carousel'
  import type { Snippet } from 'svelte'
  import { ChevronLeft, ChevronRight } from '@lucide/svelte'

  interface Props {
    slides: Snippet
    loop?: boolean
    autoplay?: boolean
    showDots?: boolean
    showArrows?: boolean
  }

  let {
    slides,
    loop = false,
    autoplay = false,
    showDots = true,
    showArrows = true,
  }: Props = $props()

  let emblaApi = $state<EmblaCarouselType | undefined>(undefined)
  let selectedIndex = $state(0)
  let scrollSnaps = $state<number[]>([])
  let canPrev = $state(false)
  let canNext = $state(false)

  const options = $derived({ options: { loop }, plugins: [] as import('embla-carousel').EmblaPluginType[] })

  function onInit(event: CustomEvent<EmblaCarouselType>) {
    emblaApi = event.detail
    scrollSnaps = emblaApi.scrollSnapList()
    updateState()
    emblaApi.on('select', updateState)
    emblaApi.on('reInit', () => {
      scrollSnaps = emblaApi!.scrollSnapList()
      updateState()
    })

    if (autoplay) startAutoplay()
  }

  function updateState() {
    if (!emblaApi) return
    selectedIndex = emblaApi.selectedScrollSnap()
    canPrev = emblaApi.canScrollPrev()
    canNext = emblaApi.canScrollNext()
  }

  function scrollTo(index: number) {
    emblaApi?.scrollTo(index)
  }

  let autoplayTimer: ReturnType<typeof setInterval> | undefined

  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      if (!emblaApi) return
      if (emblaApi.canScrollNext()) emblaApi.scrollNext()
      else emblaApi.scrollTo(0)
    }, 4000)
  }

  $effect(() => {
    return () => {
      if (autoplayTimer) clearInterval(autoplayTimer)
    }
  })
</script>

<div class="ox-carousel" data-ui="ox-carousel">
  <div
    class="ox-car-viewport"
    data-ui="carousel-viewport"
    use:emblaCarouselSvelte={options}
    onemblaInit={onInit}
  >
    <div class="ox-car-container">
      {@render slides()}
    </div>
  </div>

  {#if showArrows}
    <button
      class="ox-car-arrow ox-car-prev"
      data-ui="carousel-prev"
      aria-label="Previous slide"
      disabled={!canPrev && !loop}
      onclick={() => emblaApi?.scrollPrev()}
    >
      <ChevronLeft size={20} strokeWidth={1.5} />
    </button>
    <button
      class="ox-car-arrow ox-car-next"
      data-ui="carousel-next"
      aria-label="Next slide"
      disabled={!canNext && !loop}
      onclick={() => emblaApi?.scrollNext()}
    >
      <ChevronRight size={20} strokeWidth={1.5} />
    </button>
  {/if}

  {#if showDots && scrollSnaps.length > 1}
    <div class="ox-car-dots" data-ui="carousel-dots">
      {#each scrollSnaps as _, i}
        <button
          class="ox-car-dot"
          class:active={i === selectedIndex}
          data-ui="carousel-dot-{i}"
          aria-label="Go to slide {i + 1}"
          onclick={() => scrollTo(i)}
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .ox-carousel {
    position: relative;
    width: 100%;
    font-family: system-ui, sans-serif;
  }

  .ox-car-viewport {
    overflow: hidden;
    border-radius: var(--ox-shape-md, 12px);
  }

  .ox-car-container {
    display: flex;
  }

  /* Arrows */
  .ox-car-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: var(--ox-surface, #FFFBFE);
    color: var(--ox-on-surface, #1C1B1F);
    box-shadow: var(--ox-elevation-1,
      0 1px 3px 1px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 150ms, box-shadow 150ms;
    z-index: 2;
  }
  .ox-car-arrow:hover:not(:disabled) {
    background: var(--ox-surface-2, #F4EEFF);
    box-shadow: var(--ox-elevation-2,
      0 2px 6px 2px rgba(0,0,0,.15),
      0 1px 2px rgba(0,0,0,.3));
  }
  .ox-car-arrow:disabled {
    opacity: .38;
    cursor: not-allowed;
  }

  .ox-car-prev { left: 8px; }
  .ox-car-next { right: 8px; }

  /* Dots */
  .ox-car-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 12px;
  }

  .ox-car-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    padding: 0;
    background: var(--ox-outline-variant, #CAC4D0);
    cursor: pointer;
    transition: background 200ms, transform 200ms;
  }
  .ox-car-dot.active {
    background: var(--ox-primary, #6750A4);
    transform: scale(1.25);
  }
  .ox-car-dot:hover:not(.active) {
    background: var(--ox-on-surface-variant, #49454F);
  }
</style>
