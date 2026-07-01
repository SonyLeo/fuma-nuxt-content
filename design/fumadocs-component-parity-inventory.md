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
| `Callout` | `DocCallout` | `callout`, `content-components` | Visual shell and tones exist. Fumadocs also has `CalloutContainer`, `CalloutTitle`, `CalloutDescription`, `icon`, `type`, `warn -> warning`, and `tip -> info` protocol. | Second-pass protocol card before more CSS tuning. |
| `Tabs`, `Tab` | `DocTabs`, `DocTab`, `UiTabs*` | `tabs`, `content-components` | Basic active state and layout exist. Fumadocs simple mode supports `items`, `defaultIndex`, `label`, escaped values, and keep-mounted panels. | Verify simple-mode parity and code-tab merging. |
| `Accordions`, `Accordion` | `DocAccordions`, `DocAccordion` | `accordion`, `content-components` | Hash-open and copy link behavior exist. | Verify `hiddenUntilFound`, wrapper hierarchy, header id ownership, and keyboard state. |
| `Files`, `File`, `Folder` | `DocFiles`, `DocFile`, `DocFolder` | `files`, `content-components` | Basic shell, file row, folder row, and nested content exist. | Lock nested border/indent, disabled behavior, and hover rhythm. |
| `InlineTOC` | `DocInlineToc` | `inline-toc`, `content-components` | Collapsible inline table of contents exists. | Verify depth indentation and active-state behavior across desktop/mobile. |
| `TypeTable` | `DocTypeTable` | `type-table`, `content-components` | Manual rows exist with collapsible details, hash-open, type/default/parameters/returns. | Keep manual component; classify auto-generation separately. |
| `TOC` / docs page TOC slots | `DocsToc`, `DocsTocPopover`, `DocsTocList` | `toc`, `docs-shell`, `full-regression` | Already treated as shell parity, not content primitive parity. | Keep in shell regression. |
| Docs sidebar | `DocsSidebar`, `DocsSidebarTree`, `DocsSidebarItem`, mobile nav | `sidebar`, `docs-shell`, `full-regression` | Already treated as shell parity. | Keep in shell regression. |
| `MarkdownCopyButton`, `ViewOptionsPopover` | `DocsPageActions` | `page-actions`, `full-regression` | `Copy Markdown` and `Open` menu are aligned for current actions. `View as Markdown` still needs a per-page markdown URL. | Add markdown URL contract before adding menu item. |

## Implemented, Needs Second-Pass Parity

| Fumadocs surface | Local equivalent | Gap | Recommended profile |
| --- | --- | --- | --- |
| `Card`, `Cards` | `DocCard`, `DocCardGrid` | Local implementation is simpler. Fumadocs supports `icon`, `title`, `description`, `href`, `external`, `data-card`, hover color, and responsive full-span behavior. | Add `cards` profile. |
| `Steps`, `Step` | `DocSteps` | Local wrapper exists, but there is no `DocStep` component or verified remark-style step transformation. Current CSS appears to style list items inside `.fd-steps`. | Add `steps` profile and decide list-based vs explicit step component contract. |
| `Heading` | `DocHeading`, `ProseH1-H6` | Local headings wrap text in an anchor. Fumadocs also shows a hover-only copy anchor button with copied state. | Add `heading` profile. |
| Default link mapping | `ProseA`, `DocsLink` | Needs a prose-level contract for internal/external links, target behavior, icon rhythm, and focus state. | Add `prose-defaults` profile or fold into `prose` suite. |
| Default image mapping | `ProseImg` | Local image is plain `figure/img/figcaption`. Fumadocs can use ImageZoom and image options from remark processing. | Add `image` profile after ImageZoom decision. |
| Default table mapping | `ProseTable` | Local wrapper exists. Needs scroll container, overflow behavior, border rhythm, and mobile behavior verification. | Add `prose-table` or `prose-defaults` profile. |
| Inline code | `ProseCode` | Exists, but not separately contracted against Fumadocs prose behavior. | Include in `prose-defaults`. |
| `Preview` | `DocPreview` | Local component exists but is not a Fumadocs base-ui primitive. Still important for local docs pages. | Add `preview` profile. |
| Install card | `DocInstallCard` | Local product-adjacent utility exists. Not a Fumadocs base-ui primitive. | Keep with `preview` or a local docs-components suite. |
| Feedback | `DocsFeedback` | Local component exists. Needs divider rhythm, active/thanks state, accessibility, and mobile checks. | Add `feedback` profile or expand page-tail suite. |
| Pager | `DocsPager` | Local component exists. Needs previous/next layout, border-first lightweight styling, wrapping, and mobile one-column behavior. | Add `pager` profile or page-tail suite. |
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

## Recommended Batches

### Batch 1: Cards + Steps + Heading

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

- add `cards`, `steps`, and `heading` profiles
- add or update fixtures so icon cards, link cards, steps, and heading copy
  states are visible
- run the focused profiles first, then `content-components` or
  `full-regression`

### Batch 2: Prose Defaults

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

- add `prose-defaults` profile
- cover link, inline code, image caption, table overflow, and fenced-code
  fallback behavior

### Batch 3: Preview + Page Tail

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

- add `preview`, `feedback`, and `pager` profiles, or a narrow `page-tail`
  suite
- keep `page-actions` separate because its Open menu and copy state already
  have their own contract

### Batch 4: ImageZoom / Banner Decision

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

### Batch 5: Advanced / Product Backlog

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

## Open TODO

- [ ] Add profile for Cards.
- [ ] Add profile for Steps and decide whether to add `DocStep`.
- [ ] Add profile for Heading anchor copy behavior.
- [ ] Add prose defaults profile for links, inline code, images, and tables.
- [ ] Add Preview profile.
- [ ] Add Feedback and Pager profiles or a page-tail suite.
- [ ] Decide ImageZoom foundation/product classification.
- [ ] Decide Banner foundation/product classification.
- [ ] Replace placeholder-only Banner fixture if Banner enters foundation.
- [ ] Keep `GitHubInfo`, `DynamicCodeBlock`, `AutoTypeTable`, `GraphView`, and
      advanced docs features out of foundation batches until explicitly scoped.
