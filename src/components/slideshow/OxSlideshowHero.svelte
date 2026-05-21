<script lang="ts" module>
  export interface OxSlideshowHeroSlide {
    handle: string
    title: string
    description?: string
    image?: string | null
    video?: string | null
    poster?: string | null
    href?: string
    centered?: boolean
    hideHandle?: boolean
    hideTitle?: boolean
    noOverlay?: boolean
  }
</script>

<script lang="ts">
  /**
   * OxSlideshowHero — DS-4 Hero Slideshow
   *
   * Plein écran (svh-driven) avec image de fond, titre + handle + description,
   * CTAs primaire/secondaire, flèches glass, dots, compteur.
   * Themable via tokens --ox-* (placeholder, accent dot, CTAs).
   *
   * Props:
   *   slides       — Array<{ handle, title, description?, image?, href? }>
   *   primaryCta   — { label, href? } : CTA principal (slide.href surcharge si présent)
   *   secondaryCta — { label, href }  : CTA secondaire
   *   loading      — état chargement (skeleton)
   *   height       — hauteur CSS (default '100svh')
   *   fullBleed    — breakout container (default true, pour escape de .container)
   *   titleFont    — font-family du titre (default '"Payday", system-ui')
   *   onCtaPrimary — callback alternatif au href (preventDefault si fourni)
   */
  import { fade } from 'svelte/transition'
  import { ChevronLeft, ChevronRight } from '@lucide/svelte'

  interface Props {
    slides: OxSlideshowHeroSlide[]
    primaryCta?: { label: string; href?: string }
    secondaryCta?: { label: string; href: string }
    loading?: boolean
    height?: string
    fullBleed?: boolean
    titleFont?: string
    onCtaPrimary?: (slide: OxSlideshowHeroSlide) => void
    'data-ui'?: string
  }

  let {
    slides = [],
    primaryCta,
    secondaryCta,
    loading = false,
    height = '100svh',
    fullBleed = true,
    titleFont = '"Payday", system-ui, sans-serif',
    onCtaPrimary,
    'data-ui': dataUi = 'ox-slideshow-hero'
  }: Props = $props()

  let current = $state(0)
  let transitioning = $state(false)

  function goTo(index: number) {
    if (transitioning || index === current || slides.length === 0) return
    transitioning = true
    current = index
    setTimeout(() => (transitioning = false), 400)
  }

  function prev() { goTo((current - 1 + slides.length) % slides.length) }
  function next() { goTo((current + 1) % slides.length) }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft')  prev()
    if (e.key === 'ArrowRight') next()
  }

  function handlePrimary(slide: OxSlideshowHeroSlide, e: MouseEvent) {
    if (onCtaPrimary) {
      e.preventDefault()
      onCtaPrimary(slide)
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
  data-ui={dataUi}
  class="ox-hero"
  class:ox-hero--bleed={fullBleed}
  style="--_h:{height}; --_title-font:{titleFont}"
  aria-label="Slideshow hero"
  tabindex="-1"
  onkeydown={handleKey}
>
  {#if loading}
    <div class="ox-hero__skeleton" data-ui="{dataUi}__skeleton"></div>
  {:else}
    {#each slides as slide, i (slide.handle)}
      {#if i === current}
        <div
          class="ox-hero__slide"
          data-ui="{dataUi}__slide-{slide.handle}"
          data-slide-index={i + 1}
          in:fade={{ duration: 400 }}
          out:fade={{ duration: 400 }}
        >
          {#if slide.video}
            <video
              class="ox-hero__img ox-hero__video"
              src={slide.video}
              poster={slide.poster ?? undefined}
              autoplay
              muted
              playsinline
              preload="metadata"
            ></video>
          {:else if slide.image}
            {@const isResponsiveSrc = /\.(png|jpe?g)$/i.test(slide.image)}
            {@const base = slide.image.replace(/\.(png|jpe?g)$/i, '')}
            {#if isResponsiveSrc}
              <picture>
                <source
                  type="image/webp"
                  media="(max-width: 768px)"
                  srcset="{base}-600.webp"
                />
                <source
                  type="image/webp"
                  media="(max-width: 1280px)"
                  srcset="{base}-1024.webp"
                />
                <source
                  type="image/webp"
                  srcset="{base}-1920.webp"
                />
                <img
                  class="ox-hero__img"
                  src={slide.image}
                  alt={slide.title}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchpriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              </picture>
            {:else}
              <img
                class="ox-hero__img"
                src={slide.image}
                alt={slide.title}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchpriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            {/if}
          {:else}
            <div class="ox-hero__placeholder"></div>
          {/if}

          {#if !slide.noOverlay}
            <div class="ox-hero__overlay"></div>
          {/if}

          <div
            class="ox-hero__content"
            class:ox-hero__content--centered={slide.centered}
            data-ui="{dataUi}__content"
          >
            {#if !slide.hideHandle}
              <p class="ox-hero__handle" data-ui="{dataUi}__handle">{slide.handle}</p>
            {/if}
            {#if !slide.hideTitle}
              <h1 class="ox-hero__title" data-ui="{dataUi}__title">{slide.title}</h1>
            {/if}
            {#if slide.description}
              <p class="ox-hero__desc" data-ui="{dataUi}__desc">{slide.description}</p>
            {/if}

            {#if primaryCta || secondaryCta}
              <div class="ox-hero__ctas" data-ui="{dataUi}__ctas">
                {#if primaryCta}
                  <a
                    class="ox-hero__cta ox-hero__cta--primary"
                    data-ui="{dataUi}__cta-primary"
                    href={slide.href ?? primaryCta.href ?? '#'}
                    onclick={(e) => handlePrimary(slide, e)}
                  >
                    {primaryCta.label}
                  </a>
                {/if}
                {#if secondaryCta}
                  <a
                    class="ox-hero__cta ox-hero__cta--secondary"
                    data-ui="{dataUi}__cta-secondary"
                    href={secondaryCta.href}
                  >
                    {secondaryCta.label}
                  </a>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/each}

    {#if slides.length > 1}
      <button
        type="button"
        class="ox-hero__nav ox-hero__nav--prev"
        data-ui="{dataUi}__prev"
        aria-label="Précédent"
        onclick={prev}
      >
        <ChevronLeft size={24} strokeWidth={2} />
      </button>
      <button
        type="button"
        class="ox-hero__nav ox-hero__nav--next"
        data-ui="{dataUi}__next"
        aria-label="Suivant"
        onclick={next}
      >
        <ChevronRight size={24} strokeWidth={2} />
      </button>

      <div class="ox-hero__dots" data-ui="{dataUi}__dots">
        {#each slides as slide, i (slide.handle)}
          <button
            type="button"
            class="ox-hero__dot"
            class:is-active={i === current}
            data-ui="{dataUi}__dot-{i + 1}"
            data-active={i === current}
            aria-label="Slide {i + 1}"
            onclick={() => goTo(i)}
          ></button>
        {/each}
      </div>

      <span class="ox-hero__counter" data-ui="{dataUi}__counter">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </span>
    {/if}
  {/if}
</section>

<style>
  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     ROOT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-hero {
    position: relative;
    width: 100%;
    height: var(--_h, 100svh);
    overflow: hidden;
    background: var(--ox-surface-4, #1a1a1a);
    user-select: none;
    outline: none;
  }
  .ox-hero--bleed {
    width: 100vw;
    left: 50%;
    transform: translateX(-50%);
  }

  .ox-hero__skeleton {
    position: absolute;
    inset: 0;
    background: var(--ox-surface-2, #f4f4f4);
    animation: ox-hero-pulse 1.4s ease-in-out infinite;
  }
  @keyframes ox-hero-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.55; }
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     SLIDE — image / placeholder / scrim
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-hero__slide { position: absolute; inset: 0; }

  .ox-hero__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .ox-hero__placeholder {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 18% 18%, color-mix(in srgb, var(--ox-primary-container, #e5e5e5) 70%, transparent) 0%, transparent 55%),
      radial-gradient(circle at 82% 82%, color-mix(in srgb, var(--ox-secondary-container, #e8def8) 60%, transparent) 0%, transparent 55%),
      linear-gradient(135deg, var(--ox-surface-3, #f5f5f5) 0%, var(--ox-surface-4, #eeeeee) 100%);
  }

  .ox-hero__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--ox-on-surface, #000) 82%, transparent) 0%,
      color-mix(in srgb, var(--ox-on-surface, #000) 28%, transparent) 50%,
      color-mix(in srgb, var(--ox-on-surface, #000) 8%,  transparent) 100%
    );
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     CONTENT
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-hero__content {
    position: absolute;
    bottom: 80px;
    left: 24px;
    right: 24px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  @media (min-width: 1024px) {
    .ox-hero__content { bottom: 96px; left: 64px; right: 64px; gap: 20px; }
  }

  /* Variant centré (cas particulier slide d'intro) */
  .ox-hero__content--centered {
    inset: 0;
    left: 24px;
    right: 24px;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .ox-hero__content--centered .ox-hero__title,
  .ox-hero__content--centered .ox-hero__desc {
    max-width: 40rem;
  }
  @media (min-width: 1024px) {
    .ox-hero__content--centered { left: 64px; right: 64px; }
  }

  .ox-hero__handle {
    margin: 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 500;
    color: color-mix(in srgb, var(--ox-primary-container, #fff) 92%, transparent);
  }

  .ox-hero__title {
    margin: 0;
    font-family: var(--_title-font, 'Payday', system-ui, sans-serif);
    font-weight: 400;
    font-size: clamp(2.25rem, 6vw + 0.5rem, 6rem);
    line-height: 0.9;
    color: var(--ox-on-primary, #fff);
    max-width: 50rem;
  }

  .ox-hero__desc {
    margin: 0;
    color: color-mix(in srgb, var(--ox-on-primary, #fff) 78%, transparent);
    font-size: 0.875rem;
    max-width: 32rem;
    line-height: 1.6;
  }
  @media (min-width: 1024px) {
    .ox-hero__desc { font-size: 1rem; }
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     CTAs
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-hero__ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
  }
  .ox-hero__cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 12px 24px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: transform 120ms ease, background-color 150ms ease, color 150ms ease;
  }
  .ox-hero__cta--primary {
    background: var(--ox-primary, #1a1a1a);
    color: var(--ox-on-primary, #fff);
  }
  .ox-hero__cta--primary:hover {
    background: color-mix(in srgb, var(--ox-primary, #1a1a1a) 86%, var(--ox-on-primary, #fff) 14%);
    transform: translateY(-1px);
  }
  .ox-hero__cta--secondary {
    background: color-mix(in srgb, var(--ox-on-primary, #fff) 14%, transparent);
    color: var(--ox-on-primary, #fff);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid color-mix(in srgb, var(--ox-on-primary, #fff) 26%, transparent);
  }
  .ox-hero__cta--secondary:hover {
    background: color-mix(in srgb, var(--ox-on-primary, #fff) 24%, transparent);
    transform: translateY(-1px);
  }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     NAV (prev / next)
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-hero__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--ox-on-primary, #fff) 25%, transparent);
    background: color-mix(in srgb, var(--ox-on-primary, #fff) 15%, transparent);
    color: var(--ox-on-primary, #fff);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 150ms ease;
  }
  .ox-hero__nav:hover {
    background: color-mix(in srgb, var(--ox-primary, #1a1a1a) 75%, transparent);
  }
  @media (min-width: 1024px) {
    .ox-hero__nav { width: 48px; height: 48px; }
  }
  .ox-hero__nav--prev { left: 16px; }
  .ox-hero__nav--next { right: 16px; }
  @media (min-width: 1024px) {
    .ox-hero__nav--prev { left: 32px; }
    .ox-hero__nav--next { right: 32px; }
  }
  .ox-hero__nav svg { width: 20px; height: 20px; }

  /* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     DOTS + COUNTER
     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */
  .ox-hero__dots {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    gap: 8px;
  }
  @media (min-width: 1024px) {
    .ox-hero__dots { bottom: 32px; }
  }
  .ox-hero__dot {
    height: 4px;
    width: 8px;
    border: none;
    border-radius: 999px;
    background: color-mix(in srgb, var(--ox-on-primary, #fff) 40%, transparent);
    cursor: pointer;
    padding: 0;
    transition: width 300ms ease, background-color 300ms ease;
  }
  .ox-hero__dot:hover {
    background: color-mix(in srgb, var(--ox-on-primary, #fff) 70%, transparent);
  }
  .ox-hero__dot.is-active {
    width: 32px;
    background: var(--ox-primary, #fff);
  }

  .ox-hero__counter {
    position: absolute;
    bottom: 20px;
    right: 24px;
    z-index: 20;
    color: color-mix(in srgb, var(--ox-on-primary, #fff) 50%, transparent);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }
  @media (min-width: 1024px) {
    .ox-hero__counter { bottom: 28px; right: 64px; }
  }
</style>
