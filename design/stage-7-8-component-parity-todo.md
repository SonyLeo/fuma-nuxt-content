---
title: Stage 7.8 Component Parity TODO
sectionLabel: Temp
---

# Stage 7.8 Component Parity TODO

Temporary execution list for the next Fumadocs component parity batch.

Durable inventory and batching source:

- `design/fumadocs-component-parity-inventory.md`

## Goal

Align the remaining visible docs body and page-tail primitives that already have
local implementations but still need dedicated contract cards and parity
profiles.

## Scope

In scope:

- Cards / CardGrid
- Steps / Step
- Heading anchor behavior
- Prose defaults: links, images, tables, inline code, headings
- Preview / InstallCard
- Feedback / Pager

Out of scope for this batch:

- ImageZoom implementation
- Banner implementation
- `View as Markdown` per-page markdown URL export
- `AutoTypeTable`
- network-backed or product-only integrations

## Phase 0: Baseline

Status: done

Verified:

- [x] `pnpm dev:health -- --path=/guide/components --timeout=20000`
- [x] `Get-ChildItem -Recurse -Filter *.mjs -LiteralPath scripts/parity | ForEach-Object { node --check $_.FullName }`
- [x] `pnpm typecheck`
- [x] `git diff --check`
- [x] Restarted managed dev server after typecheck and verified
      `/guide/components` returns 200.

Progress: 12%.

## Phase 1: Cards / CardGrid

Status: done

Contract to capture:

- `Card` / `Cards` source ownership
- `data-card`
- root element switch: link vs non-link
- `icon`, `title`, `description`, default slot, `href`, `external`
- local `badge` extension boundary
- grid columns, gap, container behavior, mobile full-span behavior
- hover/focus state and long-text wrapping

Completed:

- [x] Added `icon` and boolean-like `external` support to `DocCard`.
- [x] Switched card links to `DocsLink` so cards consume the existing docs link
      protocol.
- [x] Added `data-card` and preserved the local `badge` extension.
- [x] Updated card grid/card CSS for Fumadocs-like grid, icon chip, title/body
      rhythm, link hover, and mobile full-span behavior.
- [x] Expanded the fixture to cover internal, current-page, external, non-link,
      slot body, badge, icon, and long-text states.
- [x] Added `cards` profile and registered it in `content-components`.

Verified:

- [x] `node scripts/parity/run.mjs --profile=cards --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9320 --settleMs=3000 --dump`
- [x] `pnpm typecheck`
- [x] `git diff --check`

Progress: 25%.

## Phase 2: Steps / Step

Status: done

Contract captured:

- Fumadocs source owns only the wrapper protocol: `Steps` renders
  `.fd-steps`, `Step` renders `.fd-step`.
- Local implementation keeps old list-based `DocSteps` authoring compatibility
  and adds explicit `DocStep` for Fumadocs-like authoring.
- CSS supports both `.fd-steps li` and `.fd-step` children with shared marker,
  rail, padding, counter, and prose-reset behavior.
- This batch does not add a remark-style step transform; it locks UI/component
  contract first.

Completed:

- [x] Added `DocStep.vue`.
- [x] Updated steps CSS to support both list items and explicit `DocStep`
      children.
- [x] Expanded the fixture to cover list-based and explicit step authoring,
      inline code, link content, and long wrapping text.
- [x] Added `steps` profile and registered it in `content-components`.

Verified:

- [x] `node scripts/parity/run.mjs --profile=steps --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9321 --settleMs=3000 --dump`
- [x] `pnpm typecheck`
- [x] `git diff --check`
- [x] Restarted managed dev server after typecheck and verified
      `/guide/components` returns 200.

Progress: 38%.

## Phase 3: Heading Anchor

Status: done

Contract captured:

- heading id ownership
- heading text link
- hover/focus copy anchor button
- copied state
- hash/clipboard behavior
- TOC extraction compatibility

Completed:

- [x] Updated `DocHeading` to render Fumadocs-like text anchor plus compact
      copy anchor button when an id exists.
- [x] Reused `DocsCopyButton`, `useCopyState`, and `writeDocsClipboardText`
      instead of adding feature-local copy state.
- [x] Added heading flex/scroll-margin/copy visibility styles in `prose.css`.
- [x] Added `heading` profile and registered it in `content-components`.

Verified:

- [x] `node scripts/parity/run.mjs --profile=heading --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9322 --settleMs=3000 --dump`
- [x] `pnpm typecheck`
- [x] `git diff --check`
- [x] Restarted managed dev server after typecheck and verified
      `/guide/components` returns 200.

Progress: 50%.

## Phase 4: Prose Defaults

Status: done

Contract captured:

- internal/external link behavior
- inline code rhythm
- table overflow wrapper
- image/caption behavior
- heading rhythm after Heading changes
- ImageZoom boundary

Completed:

- [x] Added a compact prose defaults fixture with internal link, external link,
      inline code, Markdown table, and Markdown image.
- [x] Added `prose-defaults` profile and registered it in
      `content-components`.
- [x] Fixed external link rel merging so generated links preserve incoming
      values such as `nofollow` while adding `noreferrer noopener`.
- [x] Confirmed Markdown image currently renders through `ProseImg` as
      `<p><figure class="fd-doc-image">...`, so the profile queries the section
      subtree instead of assuming top-level figure siblings.
- [x] Kept ImageZoom out of scope for this batch.

Verified:

- [x] `node scripts/parity/run.mjs --profile=prose-defaults --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9323 --settleMs=3000 --dump`
- [x] `pnpm typecheck`
- [x] `git diff --check`
- [x] Restarted managed dev server after typecheck and verified
      `/guide/components` returns 200.

Progress: 63%.

## Phase 5: Preview / InstallCard

Status: done

Contract captured:

- preview canvas/source/description
- source code block ownership
- install card command rhythm
- responsive overflow

Completed:

- [x] Added an install card fixture to the components page so Preview and
      InstallCard can share the main content-components regression page.
- [x] Added `preview` profile and registered it in `content-components`.
- [x] Verified preview shell, region label, preview content, description,
      source code block, source copy action, install card shell, command code
      block, and responsive widths.
- [x] Fixed preview source code block margin cascade by adding a stronger
      `.docs-page-body .fd-doc-preview-source .fd-doc-code-block` rule.

Verified:

- [x] `node scripts/parity/run.mjs --profile=preview --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9324 --settleMs=3000 --dump`
- [x] `pnpm typecheck`
- [x] `git diff --check`
- [x] Restarted managed dev server after typecheck and verified
      `/guide/components` returns 200.

Progress: 75%.

## Phase 6: Feedback / Pager

Status: done

Contract captured:

- feedback selected/thanks states
- pager previous/next combinations
- long title/description wrapping
- mobile one-column behavior

Completed:

- [x] Added independent `feedback` and `pager` profiles.
- [x] Added `page-tail` suite for focused footer regression.
- [x] Verified feedback prompt, buttons, selected state, thanks live region,
      route/source metadata, and responsive wrapping.
- [x] Verified pager next-only and previous-only states across desktop, medium,
      and mobile widths.
- [x] Fixed feedback button sizing cascade so local pill sizing is not
      overridden by generic `UiButton[data-size='sm']`.

Verified:

- [x] `node scripts/parity/run.mjs --profile=feedback --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9325 --settleMs=3500 --dump`
- [x] `node scripts/parity/run.mjs --profile=pager --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9326 --settleMs=3500 --dump`
- [x] `node scripts/parity/run.mjs --profile=pager --url=http://127.0.0.1:8888/guide/component-detail --viewports=1440x1000,994x935,390x844 --chromePort=9327 --settleMs=3500 --dump`
- [x] `node scripts/parity/run.mjs --suite=page-tail --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9328 --settleMs=3500 --dump`
- [x] `pnpm typecheck`
- [x] `git diff --check`

Progress: 88%.

## Phase 7: Regression And Documentation

Status: done

Verification target:

- [x] new focused profiles
- [x] containing suites
- [x] `full-regression`
- [x] `pnpm typecheck`
- [x] `pnpm validate:links`
- [x] `git diff --check`
- [x] durable documentation and contract-card updates
- [x] queued TOC responsive shell parity as the next batch

Verified:

- [x] `node scripts/parity/run.mjs --suite=content-components --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9330 --settleMs=3500 --dump`
- [x] `node scripts/parity/run.mjs --suite=page-tail --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9331 --settleMs=3500 --dump`
- [x] `node scripts/parity/run.mjs --suite=full-regression --viewports=1440x1000,994x935,390x844 --chromePort=9332 --settleMs=3500 --retries=1 --dump`
- [x] `pnpm typecheck`
- [x] `pnpm validate:links`
- [x] `git diff --check`
- [x] Restarted managed dev server after typecheck and verified
      `/guide/components` returns 200.

Progress: 100%.

## Completed Add-on: TOC Responsive Shell Parity

Status: done

Reason:

- The right-side table of contents still has responsive gaps. It works at full
  desktop and some narrow widths, but some constrained widths have incorrect
  display or interaction behavior.

Contract to capture:

- Fumadocs TOC source ownership, breakpoint policy, sticky/fixed behavior, and
  mobile replacement pattern.
- Local `DocsToc`, `DocsTocPopover`, page frame, left sidebar, and content
  column interaction across desktop, common laptop widths, tablet-ish widths,
  and mobile.
- Active heading state, scroll progress, popover/open state, keyboard/focus
  behavior, and overflow behavior.
- Shell collision checks: TOC must not overlap content, left sidebar, header,
  page actions, or mobile navigation.

Suggested first verification matrix:

- `2048x1152`
- `1440x1000`
- `1280x800`
- `1180x820`
- `1024x768`
- `994x935`
- `834x1112`
- `768x1024`
- `390x844`

Execution note:

- Start from Fumadocs source + DOM/computed style capture, then update the
  existing `toc` profile or split a dedicated `toc-responsive` profile. Do not
  tune from screenshots alone.

Completed:

- [x] Read Fumadocs docs page / TOC source and confirmed the responsive contract:
      desktop TOC is visible at `xl`, while below `xl` the TOC width collapses
      and a sticky `toc-popover` row replaces it.
- [x] Added `toc-responsive` as a split profile instead of growing the existing
      base `toc` profile.
- [x] Captured shell/content/page frame/sidebar/desktop TOC/TOC popover/mobile
      nav DOM, computed style, bounding boxes, sticky state, overflow, and
      interaction states.
- [x] Verified popover open, Escape close, outside-click close, link-click
      close, mobile nav open, and no horizontal overflow.
- [x] Fixed mobile sticky TOC popover so it clears the mobile header by using
      `top: var(--docs-header-height)` under `959px`.
- [x] Added `toc-responsive` to `docs-shell` and `full-regression`.

Verified:

- [x] `pnpm dev:health -- --path=/guide/component-detail --timeout=20000`
- [x] `node scripts/parity/run.mjs --profile=toc-responsive --url=http://127.0.0.1:8888/guide/component-detail --viewports=2048x1152,1440x1000,1280x800,1180x820,1024x768,994x935,834x1112,768x1024,390x844 --chromePort=9341 --settleMs=2200 --dump`
- [x] `node scripts/parity/run.mjs --suite=docs-shell --url=http://127.0.0.1:8888/guide/component-detail --viewports=2048x1152,1440x1000,1280x800,1180x820,1024x768,994x935,834x1112,768x1024,390x844 --chromePort=9342 --settleMs=2600 --retries=1 --dump`
- [x] `node scripts/parity/run.mjs --suite=full-regression --viewports=1440x1000,994x935,390x844 --chromePort=9343 --settleMs=3200 --retries=1 --dump`
- [x] `pnpm typecheck`
- [x] `pnpm validate:links`
- [x] `git diff --check`
- [x] Restarted managed dev server after typecheck and verified
      `/guide/component-detail` returns 200.

Progress: 100%.

Process lesson:

- Responsive shell parity needs a separate contract card from the base TOC
  behavior. The old `toc` profile proved active/current/link behavior, but it
  did not assert shell collisions, sticky top against the mobile header, mobile
  nav coexistence, or constrained-width layout bounds.
- Computed CSS values should be asserted as browser-resolved metrics. For
  example, `max-height: 50vh` resolves to pixels, so the profile should compare
  against `viewport.height * 0.5` rather than the raw string `50vh`.
