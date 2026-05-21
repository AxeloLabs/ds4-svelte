// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// UI Components — barrel export
// Folders 1:1 avec sections book (cf. framework/apps/book/src/lib/nav.ts)
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

// ── Shell ───────────────────────────────────────
export { default as OxAppShell } from './shell/OxAppShell.svelte'
export { default as OxBranding } from './shell/OxBranding.svelte'
export { default as OxBurger } from './shell/OxBurger.svelte'
export { default as OxAppClock } from './shell/OxAppClock.svelte'
export { default as OxNavMenuItem } from './shell/OxNavMenuItem.svelte'
export { default as OxRailMenu } from './shell/OxRailMenu.svelte'
export { default as OxRailItem } from './shell/OxRailItem.svelte'
export { default as OxRailLabel } from './shell/OxRailLabel.svelte'
export { default as OxRailActionBtn } from './shell/OxRailActionBtn.svelte'
export { default as OxRailContextProvider } from './shell/OxRailContextProvider.svelte'
export type { OxShellNavItem, OxShellSidebarItem, OxShellSidebarDivider, OxShellSidebarSectionLabel } from './shell/shell-types.js'

// ── Layout ──────────────────────────────────────
export { default as OxAppBar } from './layout/OxAppBar.svelte'
export { default as OxNavigation } from './layout/OxNavigation.svelte'
export { default as OxNavigationDrawer } from './layout/OxNavigationDrawer.svelte'
export { default as OxSplitter } from './layout/OxSplitter.svelte'

// ── Buttons ─────────────────────────────────────
export { default as OxButton } from './buttons/OxButton.svelte'
export { default as OxSegment } from './buttons/OxSegment.svelte'
export { default as OxSwitch } from './buttons/OxSwitch.svelte'
export { default as OxToggleGroup } from './buttons/OxToggleGroup.svelte'

// ── Cards ───────────────────────────────────────
export { default as OxCard } from './cards/OxCard.svelte'
export { default as OxHoverCard } from './cards/OxHoverCard.svelte'

// ── CRM ─────────────────────────────────────────
export { default as OxCardCrmContact } from './crm/OxCardCrmContact.svelte'
export { default as OxCardCrmCalendar } from './crm/OxCardCrmCalendar.svelte'
export { default as OxCardCrmMap } from './crm/OxCardCrmMap.svelte'
export { default as OxCrmCalendar } from './crm/OxCrmCalendar.svelte'
export { default as OxCrmCalendarItem } from './crm/OxCrmCalendarItem.svelte'
export { default as OxCrmCalendarBadge } from './crm/OxCrmCalendarBadge.svelte'
export { default as OxCrmSidebarItem } from './crm/OxCrmSidebarItem.svelte'

// ── Notifications ───────────────────────────────
export { default as OxAlert } from './notifications/OxAlert.svelte'
export { default as OxBadge } from './notifications/OxBadge.svelte'
export { default as OxChip } from './notifications/OxChip.svelte'
export { default as OxSnackbar } from './notifications/OxSnackbar.svelte'
export { default as OxToast } from './notifications/OxToast.svelte'
export { default as OxToastItem } from './notifications/OxToastItem.svelte'
export { default as OxToastTerminal } from './notifications/OxToastTerminal.svelte'
export { default as OxToaster } from './notifications/OxToaster.svelte'
export { default as OxToasterSimple } from './notifications/OxToasterSimple.svelte'
export { default as OxToasterTimer } from './notifications/OxToasterTimer.svelte'
export { default as OxTooltip } from './notifications/OxTooltip.svelte'

// ── Navigation (résidu : GlobalSearch, SearchPalette, Stepper, Tabs, ToolbarSectionLabel) ──
export { default as OxGlobalSearch } from './navigation/OxGlobalSearch.svelte'
export { default as OxSearchPalette } from './navigation/OxSearchPalette.svelte'
export type { OxSearchItem, OxSearchCategory } from './navigation/OxSearchPalette.svelte'
export { default as OxToolbarSectionLabel } from './navigation/OxToolbarSectionLabel.svelte'
export { default as OxTabs } from './navigation/OxTabs.svelte'
export { default as OxStepper } from './navigation/OxStepper.svelte'
export type { OxStepperItem } from './navigation/OxStepper.svelte'

// ── Menu ────────────────────────────────────────
export { default as OxPopover } from './menu/OxPopover.svelte'
export { default as OxMenu } from './menu/OxMenu.svelte'
export { default as OxNavigationMenu } from './menu/OxNavigationMenu.svelte'
export { default as OxAvatarMenu } from './menu/OxAvatarMenu.svelte'
export type { AvatarMenuItem } from './menu/avatar-menu-types.js'

// ── Popup ───────────────────────────────────────
export { default as OxDialog } from './popup/OxDialog.svelte'
export { default as OxFloatingPanel } from './popup/OxFloatingPanel.svelte'

// ── List ────────────────────────────────────────
export { default as OxList } from './list/OxList.svelte'
export { default as OxListItem } from './list/OxListItem.svelte'
export { default as OxListContactSmall } from './list/OxListContactSmall.svelte'
export { default as OxListLogLarge } from './list/OxListLogLarge.svelte'
export { default as OxAccordion } from './list/OxAccordion.svelte'

// ── Input ───────────────────────────────────────
export { default as OxCheckbox } from './input/OxCheckbox.svelte'
export { default as OxEditable } from './input/OxEditable.svelte'
export { default as OxField } from './input/OxField.svelte'
export { default as OxNumberInput } from './input/OxNumberInput.svelte'
export { default as OxPasswordInput } from './input/OxPasswordInput.svelte'
export { default as OxPinInput } from './input/OxPinInput.svelte'
export { default as OxRadio } from './input/OxRadio.svelte'
export type { OxRadioItem } from './input/OxRadio.svelte'
export { default as OxSignaturePad } from './input/OxSignaturePad.svelte'
export { default as OxTagsInput } from './input/OxTagsInput.svelte'

// ── Selection ───────────────────────────────────
export { default as OxCombobox } from './selection/OxCombobox.svelte'
export { default as OxTriStateSwitch } from './selection/OxTriStateSwitch.svelte'

// ── Tables ──────────────────────────────────────
export { default as OxTable } from './tables/OxTable.svelte'
export type { OxTableColumn, OxTableFilter } from './tables/OxTable.svelte'
export { default as OxEntityTable, entityActionsHtml, entityActionsDropdownHtml } from './tables/OxEntityTable.svelte'
export type { OxEntityAction } from './tables/OxEntityTable.svelte'
export { default as OxTableGrouped } from './tables/OxTableGrouped.svelte'
export type { OxTableGroupedColumn, OxTableGroupedFilter, OxTableGroupedCellContext } from './tables/OxTableGrouped.svelte'

// ── Loader ──────────────────────────────────────
export { default as OxCircularProgress } from './loader/OxCircularProgress.svelte'
export { default as OxProgress } from './loader/OxProgress.svelte'
export { default as OxSkeleton } from './loader/OxSkeleton.svelte'

// ── Framework (résidu : primitives sans famille) ─
export { default as OxAvatar } from './framework/OxAvatar.svelte'
export { default as OxDivider } from './framework/OxDivider.svelte'
export { default as OxIcon } from './framework/OxIcon.svelte'
export { default as OxImage } from './framework/OxImage.svelte'
export { default as OxLink } from './framework/OxLink.svelte'
export { default as OxPortal } from './framework/OxPortal.svelte'

// ── Advanced (résidu) ───────────────────────────
export { default as OxFileUpload } from './advanced/OxFileUpload.svelte'
export { default as OxImageCropper } from './advanced/OxImageCropper.svelte'
export { default as OxSteps } from './advanced/OxSteps.svelte'
export { default as OxTerminalLog } from './advanced/OxTerminalLog.svelte'
export { default as OxTimer } from './advanced/OxTimer.svelte'
export { default as OxClock } from './advanced/OxClock.svelte'

// ── Slideshow ───────────────────────────────────
export { default as OxSlideshowHero } from './slideshow/OxSlideshowHero.svelte'
export type { OxSlideshowHeroSlide } from './slideshow/OxSlideshowHero.svelte'
export { default as OxCarousel } from './slideshow/OxCarousel.svelte'

// ── Wave ────────────────────────────────────────
export { default as OxWave } from './wave/OxWave.svelte'
export { default as OxWaveOcean } from './wave/OxWaveOcean.svelte'
export { default as OxWaveOceanDouble } from './wave/OxWaveOceanDouble.svelte'

// ── Text Effects ────────────────────────────────
export { default as OxLetterpress } from './text-effects/OxLetterpress.svelte'
export { default as OxTextShadow } from './text-effects/OxTextShadow.svelte'
export { default as OxTextReveal } from './text-effects/OxTextReveal.svelte'
export { default as OxAuroraText } from './text-effects/OxAuroraText.svelte'
export { default as OxGradientText } from './text-effects/OxGradientText.svelte'
export { default as OxVideoText } from './text-effects/OxVideoText.svelte'

// ── Effects (résidu : confetti, splash, displacement, hero-animated) ──
export { default as OxDisplacementReveal } from './effects/OxDisplacementReveal.svelte'
export { default as OxHeroAnimated } from './effects/OxHeroAnimated.svelte'
export { default as OxConfetti } from './effects/OxConfetti.svelte'
export { default as OxSplash } from './effects/OxSplash.svelte'

// ── Effects Color (résidu : backlight, hueshift) ──
export { default as OxBacklight } from './effects-color/OxBacklight.svelte'
export { default as OxHueShift } from './effects-color/OxHueShift.svelte'

// ── Mock ────────────────────────────────────────
export { default as OxMockPhone } from './mock/OxMockPhone.svelte'
export { default as OxMockTablet } from './mock/OxMockTablet.svelte'
export { default as OxMockLaptop } from './mock/OxMockLaptop.svelte'
export { default as OxMockImac } from './mock/OxMockImac.svelte'

// ── Extra ───────────────────────────────────────
export { default as OxPagination } from './extra/OxPagination.svelte'
export { default as OxRating } from './extra/OxRating.svelte'
export { default as OxSlider } from './extra/OxSlider.svelte'
