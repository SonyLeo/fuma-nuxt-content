---
title: Fumadocs Component Parity Inventory
sectionLabel: Plan
---

# Fumadocs Component Parity Inventory

This document is the batching entry point for Fumadocs basic component parity.
It records the current component inventory, local implementation state, parity
profile coverage, and the recommended order for future alignment work.

It is intentionally different from `design/stage-7-7-component-parity-todo.md`:

- this file is the durable component inventory and batching map
- `stage-7-7-component-parity-todo.md` is the temporary execution checklist for
  the active Stage 7.7 loop

## Scope

Foundation parity means aligning the docs UI substrate that affects ordinary
documentation pages:

- default Markdown / MDX component mapping
- content primitives such as Callout, Tabs, Accordion, Files, TypeTable, Cards,
  Steps, InlineTOC, Heading, images, tables, and code blocks
- page-adjacent primitives such as page actions, feedback, pager, TOC, and
  sidebar

Foundation parity does not mean implementing every Fumadocs product or advanced
runtime feature. Network-backed, generator-backed, or product-specific features
should be classified before they enter the foundation queue.

## Reference Sources

Primary Fumadocs sources:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\mdx.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\accordion.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\callout.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\card.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\codeblock.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\files.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\heading.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\image-zoom.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\inline-toc.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\steps.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\tabs.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\type-table.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\page-actions.tsx`
- `D:\Projects\Learning\gh\fumadocs\apps\docs\source.config.ts`

Local implementation sources:

- `app/components/content`
- `app/components/docs`
- `app/assets/css/content.css`
- `app/assets/css/prose.css`
- `app/assets/css/shell.css`
- `mdc.config.ts`
- `content.config.ts`
- `scripts/parity/profiles`
- `scripts/parity/suites`

## Current Status Legend

- Implemented + profiled: local component exists and has a component-specific or
  suite-level parity profile.
- Implemented, needs second-pass parity: local component exists, but the current
  profile is missing or the Fumadocs protocol is only partially represented.
- Missing / decision required: no local equivalent exists, or only a placeholder
  route exists.
- Product / advanced: useful later, but should not block foundation parity.

Having a local Vue file is not the same as having parity. Each component still
needs a contract card that captures source ownership, DOM skeleton, states,
responsive behavior, computed styles, token usage, interaction semantics, and
fixtures.

## Implemented + Profiled

| Fumadocs surface | Local equivalent | Profile / suite | Current notes | Next action |
| --- | --- | --- | --- | --- |
| `CodeBlock`, `Pre`, `CodeBlockTabs`, `CodeBlockTab` | `DocCodeBlock`, `DocCodeTabs`, `DocTab`, `ProsePre` | `code-block`, `code` | Strongest current surface. It already covers fenced-code mapping, title meta, copy action, code tabs, language icons, highlight markers, line numbers, and viewport accessibility. | Keep as regression baseline. Extend only when new code paths are added. |
| `Card`, `Cards` | `DocCard`, `DocCardGrid` | `cards`, `content-components` | Second-pass contract now covers `data-card`, link/non-link roots, icon, external links, slot body, local badge extension, grid columns, and mobile full-span behavior. | Keep as regression baseline. |
| `Steps`, `Step` | `DocSteps`, `DocStep` | `steps`, `content-components` | Second-pass contract now covers list-based compatibility and explicit step authoring, marker/counter/rail geometry, prose reset, inline link/code content, and responsive wrapping. | Keep as regression baseline. Consider remark-style transform only if authoring ergonomics requires it later. |
| `Heading` | `DocHeading`, `ProseH1-H6` | `heading`, `content-components` | Second-pass contract now covers text anchor, independent copy anchor button, copied state, hash URL copying, flex rhythm, scroll margin, and prose/TOC compatibility. | Keep as regression baseline. |
| Default MDX/prose mapping | `ProseA`, `ProseCode`, `ProseImg`, `ProseTable`, `ProseH1-H6` | `prose-defaults`, `content-components` | Second-pass contract now covers internal/external links, external rel safety merge, inline code, table overflow wrapper, Markdown image/caption, and heading rhythm. | Keep as regression baseline. ImageZoom remains a separate boundary. |
| `Preview`, Install card | `DocPreview`, `DocInstallCard` | `preview`, `content-components` | Local docs primitives now cover preview shell/canvas/description/source, source copy action, install card title/description/command, code-block ownership, and responsive width. | Keep as local docs-components regression baseline. |
| Feedback, Pager | `DocsFeedback`, `DocsPager` | `feedback`, `pager`, `page-tail` | Page-tail contract now covers feedback selected/thanks state, live region, button sizing, pager next-only and previous-only states, text truncation, and mobile one-column behavior. | Keep as page-tail regression baseline. |
| `Callout` | `DocCallout`, `DocCalloutContainer`, `DocCalloutTitle`, `DocCalloutDescription` | `callout`, `content-components` | Second-pass contract covers `type`, legacy `tone`, aliases, low-level composition, tone matrix, no-title branch, icon/rail layout, and responsive behavior. | Keep as regression baseline. |
| `Tabs`, `Tab` | `DocTabs`, `DocTab`, `DocCodeTabs`, `UiTabs*` | `tabs`, `content-components` | Second-pass contract covers manual mode, simple `items/defaultIndex/label` mode, escaped values, mounted inactive panels, CodeTabs, and responsive overflow. | Keep as regression baseline. |
| `Accordions`, `Accordion` | `DocAccordions`, `DocAccordion` | `accordion`, `content-components` | Second-pass contract covers root type, default open state, stable item ids, `hidden="until-found"`, region semantics, copy link, hash behavior, and chevron state. | Keep as regression baseline. |
| `Files`, `File`, `Folder` | `DocFiles`, `DocFile`, `DocFolder` | `files`, `content-components` | Second-pass contract covers tree shell density, file/folder rows, nested border and indent, disabled folder state, closed folder opening, hover rhythm, and long filename truncation. | Keep as regression baseline. |
| `InlineTOC` | `DocInlineToc` | `inline-toc`, `content-components` | Second-pass contract covers shell, trigger, active link state, depth indentation, default-open/default-closed samples, and responsive behavior. | Keep as regression baseline. |
| `TypeTable` | `DocTypeTable` | `type-table`, `content-components` | Manual rows exist with collapsible details, hash-open, type/default/parameters/returns. | Keep manual component; classify auto-generation separately. |
| `TOC` / docs page TOC slots | `DocsToc`, `DocsTocPopover`, `DocsTocList` | `toc`, `toc-responsive`, `docs-shell`, `full-regression` | Base TOC profile covers desktop/current/link behavior. Responsive profile now covers shell bounds, desktop TOC below `xl`, sticky popover, mobile header clearance, popover close paths, mobile nav coexistence, and horizontal overflow. | Keep in shell regression. |
| Docs sidebar | `DocsSidebar`, `DocsSidebarTree`, `DocsSidebarItem`, mobile nav | `sidebar`, `docs-shell`, `full-regression` | Already treated as shell parity. | Keep in shell regression. |
| `MarkdownCopyButton`, `ViewOptionsPopover` | `DocsPageActions` | `page-actions`, `full-regression` | `Copy Markdown` and `Open` menu are aligned for current actions. `View as Markdown` still needs a per-page markdown URL. | Add markdown URL contract before adding menu item. |

## Implemented, Needs Second-Pass Parity

| Fumadocs surface | Local equivalent | Gap | Recommended profile |
| --- | --- | --- | --- |
| Default image mapping | `ProseImg` | Local image is plain `figure/img/figcaption`. Fumadocs can use ImageZoom and image options from remark processing. | Add `image` profile after ImageZoom decision. |
| `EditOnGitHub`, `PageLastUpdate` | Page header/actions/footer data | Some behavior is represented through page actions and metadata, but there is no direct parity card. | Decide whether to model directly or keep as product-layer page metadata. |

## Missing / Decision Required

| Fumadocs surface | Current local state | Classification recommendation | Notes |
| --- | --- | --- | --- |
| `ImageZoom` | No `DocImageZoom`; `ProseImg` is plain image output. | Foundation P1 candidate. | It affects common docs reading UX and image inspection. Add only after image contract is clear. |
| `Banner` | `content/guide/banner.md` is only a placeholder route. No `DocBanner`. | Decision required. | Fumadocs banner has dismiss state, localStorage, sticky behavior, and layout-height side effects. It may be shell/product rather than content. |
| `GitHubInfo` | No local equivalent. | Product / advanced. | Fetches repository stars/forks; network-backed and not required for foundation reading parity. |
| `DynamicCodeBlock` | No local dynamic runtime Shiki component. | Advanced. | Current foundation should keep static fenced-code path as the primary contract. |
| `ServerCodeBlock` | No direct local equivalent. | Advanced / framework-specific. | React server component path should not be copied into Nuxt foundation unless a real need appears. |
| `AutoTypeTable` | Manual `DocTypeTable` exists; no automatic remark generator. | Product / generator enhancement. | Do not treat as missing TypeTable UI parity. |
| `GraphView` | No local equivalent. | Product / app-specific. | Not a Fumadocs base-ui foundation blocker. |
| Search dialog variants | `DocsSearch*` exists locally. | Product / shell. | Search is outside current foundation component parity unless explicitly scoped. |
| Math / KaTeX / Twoslash / OpenAPI / AsyncAPI / Mermaid | Not part of current local foundation parity. | Advanced docs features. | Keep out of component parity batches unless product requirements pull them in. |

## Batch Status And Next Queue

### Completed Batch 1: Cards + Steps + Heading

Goal: reduce the most visible prose-body mismatch left after code blocks and
content primitives.

Targets:

- `DocCard.vue`
- `DocCardGrid.vue`
- `DocSteps.vue`
- possible `DocStep.vue`
- `DocHeading.vue`
- `ProseH1-H6.vue`
- `app/assets/css/content.css`
- `app/assets/css/prose.css`

Verification:

- added `cards`, `steps`, and `heading` profiles
- updated fixtures so icon cards, link cards, steps, and heading copy states
  are visible
- verified focused profiles and `content-components` / `full-regression`

### Completed Batch 2: Prose Defaults

Goal: ensure ordinary Markdown output has Fumadocs-like rhythm before adding
more product features.

Targets:

- `ProseA.vue`
- `ProseCode.vue`
- `ProseImg.vue`
- `ProseTable.vue`
- `ProsePre.vue`
- prose CSS and content CSS boundaries

Verification:

- added `prose-defaults` profile
- covered link, inline code, image caption, table overflow, and fenced-code
  fallback behavior

### Completed Batch 3: Preview + Page Tail

Goal: align local page-adjacent docs UX after the core body components are
stable.

Targets:

- `DocPreview.vue`
- `DocInstallCard.vue`
- `DocsFeedback.vue`
- `DocsPager.vue`
- `DocsPageFooter.vue`
- related `shell.css` and `content.css`

Verification:

- added `preview`, `feedback`, and `pager` profiles
- added narrow `page-tail` suite
- kept `page-actions` separate because its Open menu and copy state already
  have their own contract

### Completed Add-on: TOC Responsive Shell Parity

Goal: close the known right-side TOC responsive gap after body and page-tail
primitives were stable.

Targets:

- `DocsToc.vue`
- `DocsTocPopover.vue`
- `DocsTocList.vue`
- `DocsLayoutShell.vue`
- `DocsPage.vue`
- `app/assets/css/shell.css`

Verification:

- added `toc-responsive` profile
- added shell/content/page/sidebar/TOC/popover/mobile-nav geometry capture
- verified desktop, constrained-width, tablet-ish, and mobile viewport matrix
- added `toc-responsive` to `docs-shell` and `full-regression`

### Future Batch 4: ImageZoom / Banner Decision

Goal: decide whether these are foundation P1 components or product-layer
features.

Targets if accepted:

- `DocImageZoom.vue`
- `DocBanner.vue`
- prose image mapping
- shell layout height behavior if banner is sticky

Verification:

- add explicit fixture pages instead of placeholder-only routes
- include desktop and mobile behavior
- include interaction state: zoom open/close, banner dismiss/reappear rules

### Future Batch 5: Advanced / Product Backlog

Goal: avoid blocking foundation parity on non-essential capabilities while
keeping the backlog visible.

Candidates:

- `GitHubInfo`
- `DynamicCodeBlock`
- `AutoTypeTable`
- `GraphView`
- math / KaTeX
- Twoslash
- OpenAPI / AsyncAPI
- Mermaid

Rule:

- do not pull these into foundation batches unless a concrete product page
  requires them

## Contract Card Requirements

Before editing a component in future batches, capture a compact contract card:

- Fumadocs source files and exported component names
- local Vue files and CSS ownership
- fixture route and visible examples
- DOM skeleton, including wrapper hierarchy and key attributes
- state matrix, including open/closed, active/inactive, success/failed, disabled,
  hover, focus, and copied states where applicable
- responsive matrix for desktop, tablet, and mobile
- computed style metrics: spacing, border radius, border color, background,
  text color, icon size, shadow, overflow, sticky/fixed positioning
- interaction semantics: click, keyboard, hash handling, clipboard behavior,
  popover/collapsible behavior
- accessibility checks: labels, roles, focus-visible state, `aria-expanded`,
  `aria-controls`, region labels
- stable profile assertions and screenshot sanity only after DOM/state checks
  pass

## Completed Contract Cards

### Cards / CardGrid

Status: second-pass parity complete for the current foundation contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\card.tsx`

Local files:

- `app/components/content/DocCard.vue`
- `app/components/content/DocCardGrid.vue`
- `app/assets/css/content.css`
- `content/guide/components.md`
- `scripts/parity/profiles/cards.mjs`

Contract captured:

- root protocol: `data-card`, link vs non-link root, internal/external hrefs,
  `target="_blank"` and `rel` for external links
- content protocol: `icon`, `title`, `description`, default slot, and local
  `badge` extension boundary
- visual rhythm: 2-column grid, `12px` gap, `12px` radius, `16px` padding,
  14px title and body text, icon chip, hoverable link cards
- responsive behavior: cards stay two-column at desktop and medium widths, then
  span the full grid on mobile container widths
- fixture states: internal card, current-page card with badge, external card,
  non-link slot card, long title/body wrapping

Verification:

```bash
node scripts/parity/run.mjs --profile=cards --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9320 --settleMs=3000 --dump
pnpm typecheck
git diff --check
```

Result:

- `cards` profile passed `16/16`
- `pnpm typecheck` passed
- `git diff --check` passed

Process lesson:

- Fumadocs Card has an authoring contract (`icon`, `external`, `data-card`)
  that is easy to miss if only checking the visible card shell. The fixture must
  include link, external, non-link, slot-body, and long-text examples before the
  profile can protect the component.

### Steps / Step

Status: second-pass parity complete for the current foundation contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\steps.tsx`

Local files:

- `app/components/content/DocSteps.vue`
- `app/components/content/DocStep.vue`
- `app/assets/css/content.css`
- `content/guide/components.md`
- `scripts/parity/profiles/steps.mjs`

Contract captured:

- wrapper protocol: `.fd-steps` container and explicit `.fd-step` child
- compatibility protocol: old list-based `.fd-steps li` authoring still works
- visual rhythm: `48px` left padding, `32px` marker, `1px` connecting rail,
  counter increment, pill marker, and final-step rail omission
- content behavior: explicit steps reset first/last child margins and preserve
  inline link/code rendering
- fixture states: list-based steps, explicit steps, inline code, internal link,
  and long wrapping text across desktop, medium, and mobile widths

Verification:

```bash
node scripts/parity/run.mjs --profile=steps --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9321 --settleMs=3000 --dump
pnpm typecheck
git diff --check
```

Result:

- `steps` profile passed `16/16`
- `pnpm typecheck` passed
- `git diff --check` passed

Process lesson:

- Profile assertions must separate component protocol from fixture shape. In
  this pass, list-based steps intentionally included plain-text `li` items, so
  the profile checks text presence for that path and first-child margin reset
  only for explicit `DocStep` items.
- For CSS token values such as pill radius, prefer stable semantic thresholds
  when the exact computed expansion can vary (`999px` vs `9999px`), while
  keeping structural metrics like marker width and rail width strict.

### Heading

Status: second-pass parity complete for the current foundation contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\heading.tsx`

Local files:

- `app/components/content/DocHeading.vue`
- `app/components/content/ProseH1.vue`
- `app/components/content/ProseH2.vue`
- `app/components/content/ProseH3.vue`
- `app/components/content/ProseH4.vue`
- `app/components/content/ProseH5.vue`
- `app/components/content/ProseH6.vue`
- `app/assets/css/prose.css`
- `scripts/parity/profiles/heading.mjs`

Contract captured:

- root protocol: heading tag keeps the `id` and `.docs-heading` class
- anchor protocol: visible heading text links to `#id` and uses `data-card`
  to opt out of generic prose link underline rules
- copy protocol: independent compact `DocsCopyButton`, `icon-xs`, ghost
  variant, `Copy Anchor Link` / `Copied Anchor Link` labels, shared copy state
- clipboard behavior: copied URL preserves the current page URL and sets the
  hash to the heading id
- visual rhythm: flex row, wrapped layout, `4px` gap, centered items, `112px`
  scroll margin, hidden copy button until hover/focus-within

Verification:

```bash
node scripts/parity/run.mjs --profile=heading --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9322 --settleMs=3000 --dump
pnpm typecheck
git diff --check
```

Result:

- `heading` profile passed `16/16`
- `pnpm typecheck` passed
- `git diff --check` passed

Process lesson:

- Hash-copy profiles must compare against browser-serialized URLs. Non-ASCII
  heading ids are percent-encoded in `location.hash`, so the stable assertion is
  decoded hash equals source `id`, not raw string suffix.
- Heading parity is a good place to verify shared primitive reuse: copy state
  should come from `DocsCopyButton` / `useCopyState`, not another local copied
  timer.

### Prose Defaults

Status: second-pass parity complete for the current foundation contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\mdx.tsx`

Local files:

- `app/components/content/ProseA.vue`
- `app/components/content/ProseCode.vue`
- `app/components/content/ProseImg.vue`
- `app/components/content/ProseTable.vue`
- `app/components/content/DocHeading.vue`
- `app/components/docs/DocsLink.vue`
- `app/utils/docs-link.ts`
- `app/assets/css/prose.css`
- `content/guide/components.md`
- `scripts/parity/profiles/prose-defaults.mjs`

Contract captured:

- link mapping: internal docs links stay same-tab, external links open in a new
  tab and merge incoming rel values with `noreferrer noopener`
- inline code: `ProseCode` emits `.fd-doc-inline-code` with inline display,
  mono font, border, background, and compact radius
- table mapping: `ProseTable` owns `.fd-doc-table` overflow wrapper and resets
  nested table margin/border
- image mapping: `ProseImg` emits `.fd-doc-image`, lazy async image, alt text,
  and figcaption
- heading rhythm is covered through the `heading` profile and reused here as
  part of the prose defaults fixture

Verification:

```bash
node scripts/parity/run.mjs --profile=prose-defaults --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9323 --settleMs=3000 --dump
pnpm typecheck
git diff --check
```

Result:

- `prose-defaults` profile passed `16/16`
- `pnpm typecheck` passed
- `git diff --check` passed

Process lesson:

- Markdown-generated structures can add wrappers that do not appear in the
  component source. In this pass, image output was
  `<p><figure class="fd-doc-image">...`, so section-level profiles should query
  the relevant subtree instead of assuming every component is a top-level
  sibling.
- Link profiles should preserve and verify upstream rel values such as
  `nofollow` while also enforcing security tokens for external targets.

### Preview / InstallCard

Status: second-pass parity complete for the current local docs-components
contract.

Fumadocs source:

- No direct `base-ui` primitive. This card is a local docs foundation contract.

Local files:

- `app/components/content/DocPreview.vue`
- `app/components/content/DocInstallCard.vue`
- `app/components/content/DocCodeBlock.vue`
- `app/assets/css/content.css`
- `content/guide/components.md`
- `scripts/parity/profiles/preview.mjs`

Contract captured:

- preview shell: `.fd-doc-preview`, variant class, 12px radius, 1px border,
  hidden overflow
- preview canvas: region semantics, `aria-label`, grid centering, minimum
  height, preview slot content
- preview details: description row, source row, nested `DocCodeBlock`, source
  copy action, source code block margin/border reset
- install card: title, description, command area, nested bash `DocCodeBlock`,
  copy action, card padding/radius/border
- responsive behavior: install card width stays inside the same article column
  across desktop, medium, and mobile widths

Verification:

```bash
node scripts/parity/run.mjs --profile=preview --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9324 --settleMs=3000 --dump
pnpm typecheck
git diff --check
```

Result:

- `preview` profile passed `16/16`
- `pnpm typecheck` passed
- `git diff --check` passed

Process lesson:

- Component-local reset rules can lose to later generic prose rules when
  specificity ties. The preview source code block needed
  `.docs-page-body .fd-doc-preview-source .fd-doc-code-block` to preserve its
  zero-margin embedded layout.

### Feedback / Pager

Status: second-pass parity complete for the current page-tail contract.

Fumadocs source:

- Page-tail behavior is local foundation work in this Nuxt implementation.
  Fumadocs page footer rhythm remains the reference for placement and density.

Local files:

- `app/components/docs/DocsFeedback.vue`
- `app/components/docs/DocsPager.vue`
- `app/components/docs/DocsPageFooter.vue`
- `app/assets/css/shell.css`
- `scripts/parity/profiles/feedback.mjs`
- `scripts/parity/profiles/pager.mjs`
- `scripts/parity/suites/page-tail.mjs`

Contract captured:

- feedback shell: page metadata attributes, prompt, two outline buttons,
  responsive wrapping, top/bottom dividers
- feedback interaction: positive click sets pressed state, fills icon, and
  renders polite thanks state
- pager shell: one-column single-side state and two-column both-side contract
  when such a fixture exists
- pager links: previous/next direction classes, icon placement, no underline,
  compact card sizing, title/description truncation, mobile one-column behavior
- fixture coverage: `/guide/components` verifies next-only pager;
  `/guide/component-detail` verifies previous-only pager

Verification:

```bash
node scripts/parity/run.mjs --profile=feedback --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9325 --settleMs=3500 --dump
node scripts/parity/run.mjs --profile=pager --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9326 --settleMs=3500 --dump
node scripts/parity/run.mjs --profile=pager --url=http://127.0.0.1:8888/guide/component-detail --viewports=1440x1000,994x935,390x844 --chromePort=9327 --settleMs=3500 --dump
node scripts/parity/run.mjs --suite=page-tail --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9328 --settleMs=3500 --dump
pnpm typecheck
git diff --check
```

Result:

- `feedback` profile passed `16/16`
- `pager` profile passed `16/16` for next-only and previous-only fixtures
- `page-tail` suite passed
- `pnpm typecheck` passed
- `git diff --check` passed

Process lesson:

- Page-tail profiles should model available fixture states honestly. Current
  navigation data has next-only and previous-only pages, so the profile supports
  single-side pager states and separately verifies both directions.
- Interaction profiles are less flaky when they dispatch a bubbling
  `MouseEvent` after an animation frame and wait long enough for Vue state to
  commit.

### TOC Responsive Shell Parity

Status: complete for the current responsive shell contract.

Reason:

- The right-side TOC works at full desktop and some narrow widths, but some
  constrained widths still have incorrect display or interaction behavior.

Contract to capture:

- Fumadocs TOC source ownership, breakpoint policy, sticky/fixed behavior, and
  mobile replacement pattern
- local `DocsToc`, `DocsTocPopover`, page frame, left sidebar, and content
  column interaction across desktop, laptop, tablet, and mobile widths
- active heading state, scroll progress, popover/open state, keyboard/focus
  behavior, and overflow behavior
- collision checks so TOC does not overlap content, left sidebar, header, page
  actions, or mobile navigation

Initial viewport matrix:

- `2048x1152`
- `1440x1000`
- `1280x800`
- `1180x820`
- `1024x768`
- `994x935`
- `834x1112`
- `768x1024`
- `390x844`

Completed:

- Split `toc-responsive` from the existing base `toc` profile.
- Added shell/content/page/sidebar/TOC/popover/mobile-nav geometry capture.
- Added desktop, constrained width, tablet-ish, and mobile viewport matrix.
- Added checks for desktop TOC visibility at `>=1280px`, TOC popover below
  `1280px`, page-frame `toc-popover` row ownership, no page/TOC overlap,
  no horizontal document overflow, mobile sidebar replacement, mobile nav open,
  Escape/outside/link close paths, and sticky popover clearance under the
  mobile header.
- Fixed mobile sticky top so the TOC popover clears `.docs-header` instead of
  sitting at viewport top under the header.

Verification:

```bash
node scripts/parity/run.mjs --profile=toc-responsive --url=http://127.0.0.1:8888/guide/component-detail --viewports=2048x1152,1440x1000,1280x800,1180x820,1024x768,994x935,834x1112,768x1024,390x844 --chromePort=9341 --settleMs=2200 --dump
node scripts/parity/run.mjs --suite=docs-shell --url=http://127.0.0.1:8888/guide/component-detail --viewports=2048x1152,1440x1000,1280x800,1180x820,1024x768,994x935,834x1112,768x1024,390x844 --chromePort=9342 --settleMs=2600 --retries=1 --dump
node scripts/parity/run.mjs --suite=full-regression --viewports=1440x1000,994x935,390x844 --chromePort=9343 --settleMs=3200 --retries=1 --dump
pnpm typecheck
pnpm validate:links
git diff --check
```

Result:

- `toc-responsive` profile passed `100/100`.
- `docs-shell` suite passed with `toc 58/58`, `toc-responsive 100/100`,
  and `sidebar 85/85`.
- `full-regression` passed, including `toc-responsive 36/36` in the standard
  regression viewport set.
- `pnpm typecheck`, `pnpm validate:links`, and `git diff --check` passed.

Process lesson:

- Base behavior profiles should stay narrow. The original `toc` profile was
  useful for TOC semantics, but responsive shell parity needs its own card with
  layout collision and sticky interaction assertions.
- Raw CSS strings are not always stable profile targets. Browser-computed
  `50vh` becomes a pixel value, so profile assertions should compare the
  resolved metric to the viewport-derived expectation.

### Callout

Status: second-pass parity complete for the current foundation contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\callout.tsx`

Local files:

- `app/components/content/DocCallout.vue`
- `app/components/content/DocCalloutContainer.vue`
- `app/components/content/DocCalloutTitle.vue`
- `app/components/content/DocCalloutDescription.vue`
- `app/assets/css/content.css`
- `content/guide/components.md`
- `scripts/parity/profiles/callout.mjs`

Contract captured:

- root shell: flex row, stretch alignment, 14px text, 20px line-height, 8px gap,
  12px radius, card background, card shadow, border
- component protocol: `type`, legacy `tone`, `warn -> warning`, `tip -> info`
- low-level composition protocol: container, title, description
- tone matrix: `info`, `warning`, `success`, `error`, `idea`
- no-title branch: body renders without an empty title node
- visual internals: 2px stretching rail, 20px icon, icon aligned to first content
  line, title margin reset, idea icon fill
- responsive coverage: desktop `1440x1000`, medium `994x935`, mobile `390x844`

Verification:

```bash
node scripts/parity/run.mjs --profile=callout --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9286 --settleMs=2500 --dump
pnpm typecheck
```

Result:

- `callout` profile passed `28/28`
- `pnpm typecheck` passed

Process lesson:

- After fixture or component hot updates, mobile capture can race with HMR at
  short settle windows. For component profiles that just changed fixture shape,
  use `--settleMs=2500` for the first runtime proof, then decide later whether
  the profile can safely return to a shorter window.

### Tabs / CodeTabs

Status: second-pass parity complete for the current foundation contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\tabs.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\codeblock.tsx`

Local files:

- `app/components/content/DocTabs.vue`
- `app/components/content/DocTab.vue`
- `app/components/content/DocCodeTabs.vue`
- `app/components/ui/UiTabs.vue`
- `app/components/ui/UiTabsList.vue`
- `app/components/ui/UiTabsTrigger.vue`
- `app/components/ui/UiTabsContent.vue`
- `app/assets/css/content.css`
- `content/guide/components.md`
- `scripts/parity/profiles/tabs.mjs`

Contract captured:

- advanced/manual mode: explicit triggers slot and explicit panels
- simple mode: `items`, `defaultIndex`, `label`, escaped item values
- state semantics: active/inactive trigger state, `aria-selected`, hidden
  inactive panels while keeping panel DOM mounted
- list layout: horizontal overflow, no wrapping, active underline
- CodeTabs: nested code-tab shell, active first tab, direct panel-owned code
  block
- responsive coverage: desktop `1440x1000`, medium `994x935`, mobile `390x844`

Verification:

```bash
node scripts/parity/run.mjs --profile=tabs --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9296 --settleMs=2500 --dump
```

Result:

- `tabs` profile passed `19/19`

Process lessons:

- Tabs profiles must use direct ownership selectors such as
  `:scope > .fd-doc-tabs-list > .fd-doc-tab-trigger`; descendant selectors can
  accidentally include nested CodeTabs and create false failures.
- Avoid raw PascalCase Vue component blocks inside Markdown fixtures for nested
  slot-heavy components. MDC syntax gives more stable component boundaries.
- Running `pnpm typecheck` while a Nuxt dev server is active can invalidate the
  dev server's generated Nuxt Content database. If typecheck runs before more
  runtime parity checks, restart the managed dev server before trusting profile
  results.

### Accordion

Status: second-pass parity complete for the current foundation contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\accordion.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\ui\accordion.tsx`

Local files:

- `app/components/content/DocAccordions.vue`
- `app/components/content/DocAccordion.vue`
- `app/components/ui/UiAccordion.vue`
- `app/components/ui/UiAccordionItem.vue`
- `app/components/ui/UiAccordionTrigger.vue`
- `app/components/ui/UiAccordionContent.vue`
- `app/assets/css/content.css`
- `content/guide/components.md`
- `scripts/parity/profiles/accordion.mjs`

Contract captured:

- root protocol: `single` type, default open value, bordered card shell
- item protocol: stable `data-accordion-value`, `data-state`, trigger id,
  panel id, copy button when an id exists
- hidden semantics: closed panels use `hidden="until-found"` and keep
  `role="region"`
- interaction: clicking a closed item opens it and updates trigger
  `aria-expanded`
- visual state: chevron rotation follows item open state
- responsive coverage: desktop `1440x1000`, medium `994x935`, mobile `390x844`

Verification:

```bash
node scripts/parity/run.mjs --profile=accordion --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9299 --settleMs=2500 --dump
```

Result:

- `accordion` profile passed `10/10`

Process lesson:

- Accordion hydration and `hidden="until-found"` synchronization can lag the
  first DOM capture on desktop. The profile now waits briefly before capture and
  scrolls the clicked trigger into view before interaction.

### Files / File / Folder

Status: second-pass parity complete for the current foundation contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\files.tsx`

Local files:

- `app/components/content/DocFiles.vue`
- `app/components/content/DocFile.vue`
- `app/components/content/DocFolder.vue`
- `app/components/content/DocCollapsible.vue`
- `app/assets/css/content.css`
- `content/guide/components.md`
- `scripts/parity/profiles/files.mjs`

Contract captured:

- files shell: bordered card, compact padding, not-prose style ownership
- rows: file row and folder trigger share density, icon size, gap, hover rhythm
- folder state: default-open folders, closed folder click-to-open, disabled
  folder state
- nesting: folder content left border, margin, and padding
- overflow: long file names use title attribute, hidden overflow, ellipsis, and
  nowrap
- responsive coverage: desktop `1440x1000`, medium `994x935`, mobile `390x844`

Verification:

```bash
node scripts/parity/run.mjs --profile=files --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9303 --settleMs=3000 --dump
```

Result:

- `files` profile passed `16/16`

Process lesson:

- Deep MDC component trees can close differently than expected when every leaf
  is modeled as a block. Use inline leaf syntax for files, and split complex
  file-tree fixture states across multiple `DocFiles` samples when the goal is
  parity measurement rather than one giant example tree.

### InlineTOC

Status: second-pass parity complete for the current foundation contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\inline-toc.tsx`

Local files:

- `app/components/content/DocInlineToc.vue`
- `app/composables/useDocsInlineToc.ts`
- `app/composables/useDocsTocState.ts`
- `app/assets/css/content.css`
- `content/guide/components.md`
- `scripts/parity/profiles/inline-toc.mjs`

Contract captured:

- shell: compact bordered card, trigger, title, icon, chevron, content region
- content: link list, border-left rhythm, active link state
- depth: nested heading produces non-zero padding
- state: default-open sample and default-closed sample
- interaction: clicking closed sample opens content and updates
  `aria-expanded`
- responsive coverage: desktop `1440x1000`, medium `994x935`, mobile `390x844`

Verification:

```bash
node scripts/parity/run.mjs --profile=inline-toc --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9305 --settleMs=2500 --dump
```

Result:

- `inline-toc` profile passed `10/10`

Process lesson:

- A depth assertion is meaningless unless the fixture contains nested headings.
  Add an actual lower-level heading before requiring non-zero inline TOC
  indentation.

### TypeTable

Status: second-pass parity complete for the current manual component contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\type-table.tsx`

Local files:

- `app/components/content/DocTypeTable.vue`
- `app/components/ui/UiCollapsible.vue`
- `app/assets/css/content.css`
- `content/guide/components.md`
- `scripts/parity/profiles/type-table.mjs`

Contract captured:

- manual rows: prop name, optional marker, type value, description, and default
  value
- badges and states: `required`, `deprecated`, optional field naming, and
  deprecated code styling
- details: linked type description, parameters, returns, and collapsible detail
  grid
- interaction: clicking a row opens details, updates `aria-expanded`, and writes
  the row hash
- responsive coverage: desktop `1440x1000`, medium `994x935`, mobile
  `390x844`

Verification:

```bash
node scripts/parity/run.mjs --profile=type-table --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9309 --settleMs=4000 --dump
```

Result:

- `type-table` profile passed `16/16`

Boundary:

- This verifies the manual `DocTypeTable` UI contract. `AutoTypeTable` remains a
  generator/product enhancement and is not treated as missing UI parity.

Process lesson:

- Profiles that mutate `location.hash` must clean the hash before and after
  capture. Otherwise, later viewport captures can inherit an opened/hash state
  from an earlier capture and produce false failures.

### PageActions / Feedback / Pager

Status: page-adjacent parity complete for the current contract.

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\page-actions.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\slots\footer.tsx`

Local files:

- `app/components/docs/DocsPageActions.vue`
- `app/components/docs/DocsFeedback.vue`
- `app/components/docs/DocsPager.vue`
- `app/components/ui/UiPopover.vue`
- `app/components/ui/UiPopoverTrigger.vue`
- `app/components/ui/UiPopoverContent.vue`
- `app/assets/css/shell.css`
- `scripts/parity/profiles/page-actions.mjs`

Contract captured:

- actions row: compact Copy Markdown and Open buttons with matching height,
  typography, state attributes, and aligned action group
- Open popover: fixed geometry, minimum width, external links, labels, and menu
  item density
- feedback: two controls, pressed state, and thanks state
- pager: at least one previous/next link with title, icon, and href
- responsive coverage: desktop `1440x1000`, medium `994x935`, mobile
  `390x844`

Verification:

```bash
node scripts/parity/run.mjs --profile=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9312 --settleMs=2500 --dump
node scripts/parity/run.mjs --suite=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9313 --settleMs=2500
```

Result:

- `page-actions` profile passed `28/28`
- `page-actions` suite passed `28/28`

Process lesson:

- Interactive profiles should wait for the semantic target state they assert.
  Fixed sleeps can produce first-viewport false failures during hydration even
  when later viewports and single-viewport checks pass.

## Verification Policy

For each batch:

1. Run the focused profile first.
2. Fix only mismatches exposed by the contract or profile.
3. Re-run the focused profile.
4. Run the containing suite.
5. Run `full-regression` only after the focused suite is clean.
6. For long dev-server regressions, `--retries=1` is acceptable after inspecting
   the first failure. If the dump shows a Nuxt 500 or missing app shell, classify
   it as server-health before changing UI code.

Current runner entry:

```bash
node scripts/parity/run.mjs --profile=<profile> --viewports=1440x1000,994x935 --chromePort=<port> --settleMs=1200
```

Do not pass `--url` to `full-regression`; the runner rejects that combination
to prevent partial-regression false confidence.

## Future TODO

- [x] Add profile for Cards.
- [x] Add profile for Steps and decide whether to add `DocStep`.
- [x] Add profile for Heading anchor copy behavior.
- [x] Add prose defaults profile for links, inline code, images, and tables.
- [x] Add Preview profile.
- [x] Add Feedback and Pager profiles or a page-tail suite.
- [x] Add TOC responsive profile coverage for right TOC, TOC popover, shell
      collisions, and common constrained-width layouts.
- [ ] Decide ImageZoom foundation/product classification.
- [ ] Decide Banner foundation/product classification.
- [ ] Replace placeholder-only Banner fixture if Banner enters foundation.
- [x] Keep `GitHubInfo`, `DynamicCodeBlock`, `AutoTypeTable`, `GraphView`, and
      advanced docs features out of foundation batches until explicitly scoped.
