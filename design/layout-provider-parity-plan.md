---
title: Layout Provider Parity Plan
sectionLabel: Plan
---

# Layout Provider Parity Plan

This document owns the detailed design for Fumadocs layout/provider parity.
`design/roadmap.md` should stay flat and link here instead of carrying the full
contract.

## Scope

This plan covers Fumadocs layout surfaces that are broader than a single docs
page shell:

- Root provider
- shared layout props
- default layout slots
- sidebar state provider
- layout tabs / root section switcher
- Home layout
- not-found shell
- Banner decision
- Notebook / Flux layout variant decision cards

It does not implement all Fumadocs layout variants in the current foundation
phase.

## Current Status

Stage 7.10 is complete for the first foundation pass and is now covered by
focused and regression profiles.

Implemented:

- `DocsRootProvider` and `useDocsRootProvider()`
- `useDocsLayoutSlots()` as the Vue equivalent of shared default slots
- `useDocsSidebarState()` as the sidebar provider/state contract
- `nav.tabs` normalization and active tab selection
- `DocsHomeLayout`
- `DocsNotFound` and Nuxt error shell integration
- focused profiles: `root-provider`, `layout-slots`, `sidebar-state`,
  `layout-tabs`, `home-layout`, `not-found`
- `layout-provider` parity suite

Kept deferred:

- Banner remains a foundation layout slot plus height token.
- Notebook and Flux remain deferred layout variant decision cards.

## Fumadocs Evidence

Reference files:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\provider\base.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\client.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\search-trigger.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\theme-switch.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\language-select.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\client.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\slots\sidebar.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\home\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\home\navbar.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\home\not-found.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\notebook\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\flux\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\sidebar\base.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\sidebar\tabs\index.tsx`

Observed protocol:

- `RootProvider` owns theme, search, i18n, direction, and framework adapter
  boundaries.
- `BaseLayoutProps` owns `githubUrl`, `links`, `nav`, `slots`,
  `themeSwitch`, `searchToggle`, and i18n-related options.
- `baseSlots()` centralizes default `themeSwitch`, `searchTrigger`, and
  `languageSelect`.
- Docs layout treats container, header, sidebar, sidebar provider, sidebar
  trigger, and `useSidebar` as replaceable slots/protocol.
- Sidebar supports banner, footer, custom components, collapsible behavior,
  tabs dropdown, theme/language controls, and search trigger.
- Home and not-found are layout surfaces, not just example pages.
- Notebook and Flux are layout variants. They should be recorded as deferred
  variants unless a concrete product need pulls them forward.

## Local State

Implemented or partially implemented:

- `DocsLayoutShell`
- `DocsHeader`
- `DocsSidebar`
- `DocsSidebarTree`
- `DocsSidebarItem`
- `DocsMobileNav`
- `DocsPage`
- `DocsToc`
- `DocsTocPopover`
- layout slots: `banner`, `search-trigger`, `theme-switch`, `language-select`
- `nav.tabs` and sidebar tabs dropdown

Missing or too implicit:

- no standalone `DocsRootProvider` or equivalent root provider contract
- no `baseSlots()` equivalent default slot provider
- sidebar collapsed/open/tabs/mobile state is mostly local component state
- Home is currently page composition, not a shared layout contract
- no foundation not-found shell
- Banner has only a slot and `--fd-banner-height` token
- Notebook / Flux have no deferred decision cards

## Boundary Decision

Foundation P1 should implement:

- Nuxt equivalent root provider contract
- default layout slot provider
- sidebar state provider
- layout tabs/root section switcher contract
- Home layout baseline
- basic not-found shell
- Banner decision
- Notebook / Flux deferred decision cards

Foundation P1 should not implement:

- full Notebook layout
- full Flux layout
- product-specific navbar mega menu
- full i18n/versioning route strategy

Those belong to future foundation variants or site product composition.

## Execution Order

1. Finish Theme Runtime / Preset Gate.
2. Add `DocsRootProvider` or equivalent provider plugin.
3. Add `useDocsLayoutSlots()` or equivalent default slot helper.
4. Add `useDocsSidebarState()` or equivalent provider.
5. Formalize layout tabs / root section switcher.
6. Add `DocsHomeLayout` baseline.
7. Add `DocsNotFound` baseline.
8. Write Banner decision card.
9. Write Notebook / Flux deferred variant decision cards.
10. Add focused parity profiles and suites.

## Contract Cards

### Root Provider

Capture:

- provider ownership
- theme state handoff
- search trigger default
- language/i18n/dir placeholder
- SSR/client boundary
- provider props and injection keys

Profile:

- `root-provider`

Checks:

- root receives theme data
- search/theme/language defaults are available
- user-provided replacements still win
- provider does not read product-only config directly

### Layout Slots

Capture:

- `searchTrigger`
- `themeSwitch`
- `languageSelect`
- default implementation
- replacement behavior
- header/sidebar/mobile nav consumption

Profile:

- `layout-slots`

Checks:

- default slots render once in expected surfaces
- replacement slots render in header/sidebar/mobile paths
- missing language implementation degrades intentionally

### Sidebar State

Capture:

- collapsed state
- hover preview
- mobile open state
- tabs dropdown open state
- Escape/outside/link close behavior
- focus return

Profile:

- `sidebar-state`

Checks:

- collapse trigger state is reflected on layout root
- hover preview does not permanently open collapsed sidebar
- tabs dropdown closes on outside click, Escape, and navigation
- mobile nav and desktop sidebar do not fight over the same state

### Layout Tabs

Capture:

- tab shape
- active matching
- root section selection
- sidebar dropdown behavior
- `tabMode` decision

Profile:

- `layout-tabs`

Checks:

- active tab follows current route
- nested active matching behaves like nav links
- dropdown item roles and current state are accessible
- unsupported `tabMode` values are documented rather than half-implemented

### Home Layout

Capture:

- shared brand/nav/links options
- search/theme/language slots
- header rhythm
- page body ownership

Profile:

- `home-layout`

Checks:

- home consumes the same shared layout options as docs
- header/nav/link behavior matches docs shell expectations
- page body stays product-composable

### Not Found

Capture:

- shared header/nav/link contract
- status/title/body/action text
- token usage
- mobile behavior

Profile:

- `not-found`

Checks:

- not-found works without product-specific config
- links use docs link protocol
- layout does not introduce separate visual language

### Banner Decision

Capture before implementation:

- foundation vs product classification
- dismiss behavior
- storage key
- sticky behavior
- `--fd-banner-height` ownership
- sidebar/header/TOC offset impact

Possible outcomes:

- foundation component: add `DocBanner` or `DocsBanner` plus `banner` profile
- product feature: keep only layout top slot and height token in foundation

Current Stage 7.10 decision:

- Keep Banner as a foundation layout slot plus `--fd-banner-height` ownership
  for now.
- Do not implement dismiss/persistence in this gate.
- Revisit as a foundation component only when a real docs-wide announcement or
  version banner needs storage, sticky offsets, and profile coverage.
- Any future implementation must update sidebar/header/TOC sticky offsets in the
  same change.

Profile:

- `banner-decision` before implementation
- `banner` if accepted into foundation

### Layout Variants

Capture for Notebook and Flux:

- source files reviewed
- layout grid differences
- sidebar/header/tab differences
- target product scenario
- decision to defer or implement

Profile:

- `layout-variants-audit`

Checks:

- variants are not silently forgotten
- deferral is explicit
- future compact/docs variants can reuse the decision card

Current Stage 7.10 decision:

- Notebook is deferred. Its main value is a compact docs variant with different
  nav/sidebar assumptions; current product need is still the default Docs
  layout.
- Flux is deferred. Its floating navigation panel and search-coupled motion are
  product-composition-heavy and should not be pulled into the foundation gate.
- This gate only keeps the common provider/slots/sidebar state contract strong
  enough that a future variant can reuse it.

## Verification Matrix

Use the common shell viewport set:

- `2048x1152`
- `1440x1000`
- `1280x800`
- `1180x820`
- `1024x768`
- `994x935`
- `834x1112`
- `768x1024`
- `390x844`

Run order:

1. Focused profile.
2. Containing shell suite.
3. `full-regression` after focused checks are clean.
4. Static checks: `git diff --check`.
5. Type checks only when runtime code changes.

Current verified commands:

- `pnpm typecheck`
- `git diff --check`
- run focused Playwright checks directly; Playwright starts or reuses the E2E server
- `node scripts\parity\run.mjs --suite=layout-provider --viewports=1440x1000,994x935,390x844 --chromePort=9371 --retries=1 --dump`
- `node scripts\parity\run.mjs --suite=docs-shell --url=http://127.0.0.1:8888/guide/component-detail --viewports=1440x1000,994x935,390x844 --chromePort=9372 --retries=1 --dump`
- `node scripts\parity\run.mjs --suite=fast-regression --viewports=1440x1000,994x935,390x844 --chromePort=9373 --retries=1 --dump`
- `pnpm validate:links`

Current results:

- `layout-provider`: 72/72 checks passed.
- `docs-shell`: 118/118 checks passed.
- `fast-regression`: 201/201 checks passed.
- docs link validation passed: 25 pages, 11 links.

Validation lessons:

- HTTP preflight must request `Accept: text/html`; otherwise Nuxt dev returns a
  JSON error payload for expected 404 routes and hides the custom SSR shell.
- Fixture profiles should avoid arbitrary content-count thresholds. Prefer
  stable contract checks such as shared layout options, content root presence,
  and expected body ownership.
- Optional Boolean props that fall back to provider state must default to
  `undefined`; otherwise Vue Boolean casting can shadow provider state with
  `false`.

## Linked Planning Entries

- [Roadmap Stage 7.10](./roadmap.md#stage-7-10-root-provider-layout-variants)
- [Foundation Phase 5.6](./foundation-roadmap.md#phase-5-6-root-provider-layout-variants)
- [Component Inventory Layout Section](./fumadocs-component-parity-inventory.md#layout-root-provider-parity-inventory)
