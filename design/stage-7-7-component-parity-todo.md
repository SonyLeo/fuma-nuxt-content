---
title: Stage 7.7 Component Parity TODO
sectionLabel: Temp
---

# Stage 7.7 Component Parity TODO

Temporary execution list for the Fumadocs component parity gate.

Lifecycle rule:

- Keep this file while Stage 7.7 is active.
- After each phase, run review and fix current-phase issues before moving on.
- When all phases are complete, move durable lessons to
  `design/parity-reconstruction-workflow.md` or
  `design/implementation-notes.md`, then delete this file.

## Goal

Move the existing first-pass docs UI substrate from "implemented" to
"measurably aligned with Fumadocs enough to protect future product work".

This stage does not add advanced product features. It builds parity gates for
existing foundation surfaces and fixes only mismatches exposed by those gates.

## Reference Baseline

Primary Fumadocs references:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\mdx.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\codeblock.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\callout.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\tabs.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\accordion.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\files.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\type-table.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\inline-toc.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\image-zoom.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\page-actions.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\slots\footer.tsx`

Local fixture baseline:

- `http://127.0.0.1:8888/guide/component-detail`
- `content/guide/component-detail.md`
- Additional component fixture pages under `content/guide/*.md`

Runtime rule:

- Run HTTP preflight before browser extraction.
- Start/stop the local dev server through `scripts/dev-server.mjs` only:
  - `pnpm dev:restart -- --path=/guide/code-block --timeout=60000`
  - `pnpm dev:health -- --path=/guide/code-block --timeout=20000`
  - `pnpm dev:stop`
- If the local URL returns 404/500/502 or Nuxt Content SQLite errors, classify
  as `server-health` and do not trust screenshots.

## Phase 0: Gate Setup

Status: done

Tasks:

- [x] Confirm current dirty/staged files and avoid reverting unrelated changes.
- [x] Keep the temporary todo file scoped to Stage 7.7.
- [x] Confirm parity profiles can be split into modular runner files without
      weakening existing TOC/sidebar checks.
- [x] Define profile naming:
  - `code-block`
  - `content-components`
  - `page-actions`
  - `preview`

Review checklist:

- [x] The plan is split by narrow surfaces.
- [x] Every surface has a fixture requirement.
- [x] Every phase has a runtime proof or a documented server-health blocker.

## Phase 1: CodeBlock / CodeTabs Parity

Status: done

Target files:

- `app/components/content/DocCodeBlock.vue`
- `app/components/content/DocCodeTabs.vue`
- `app/components/content/DocTab.vue`
- `app/components/content/ProsePre.vue`
- `app/assets/css/content.css`
- `scripts/parity/profiles/code-block.mjs`
- `scripts/parity/suites/code.mjs`
- `content/guide/component-detail.md` or `content/guide/code-block.md`

Fumadocs contract to align:

- Markdown fenced code is the primary path, not only explicit
  `::doc-code-block` usage:
  - Nuxt Content `ProsePre` must normalize incoming code block props into the
    same wrapper contract that Fumadocs gets from MDX component mapping.
  - Fumadocs-style meta strings such as `title="config.js"` and `lineNumbers`
    must be parsed before reaching the visual shell.
  - The rendered code slot from Nuxt Content/Shiki remains the source of
    highlighted DOM; `DocCodeBlock` should wrap it instead of replacing it with
    plain text.
- `figure` root with `dir="ltr"`, code shell class, border, rounded card, and
  `not-prose` behavior.
- Titled code block header:
  - icon slot or reserved icon position
  - title text as `figcaption`
  - right actions area
  - copy button using shared button sizing
- Untitled code block:
  - floating copy button in top-right
  - enough right padding for toolbar
- Code viewport:
  - `role="region"`
  - `tabindex="0"`
  - max height around `600px`
  - horizontal overflow
  - focus-visible ring
- Copy behavior:
  - ignores toolbar nodes
  - copies rendered `pre` text when explicit code source is absent
  - has copied/failed state
- Code tabs:
  - rounded card root
  - top tab list with horizontal overflow
  - active trigger underline
  - nested code blocks should visually merge with tab container
- Rehype-code compatibility markers:
  - line numbers
  - line number start
  - language icon injection or deterministic fallback icon from language
  - highlighted line/word/diff/focus selectors should not break layout even if
    not all transforms are implemented yet

Fixture requirements:

- [x] Plain untitled code block.
- [x] Titled fenced code block using `title="..."` meta.
- [x] Long line overflow case.
- [x] Code block with copy button.
- [x] Code tabs with at least two tabs.
- [x] At least one diff/highlight-like sample marker in the fixture.

Development tasks:

- [x] Add or extend `code-block` profile in `scripts/parity/profiles/code-block.mjs`.
- [x] Capture root/header/actions/viewport/copy/tabs metrics.
- [x] Add strict checks for DOM ownership, copy button presence, viewport
      accessibility, and tabs active state.
- [x] Fix only real local mismatches found by the profile.
- [x] Reclassify first profile result as shell-only, because it did not verify
      the Fumadocs code compilation/rendering protocol.
- [x] Parse Fumadocs-style meta in `ProsePre`.
- [x] Add deterministic language icon support to `DocCodeBlock`.
- [x] Replace the `code-block` fixture with a page structure that follows
      Fumadocs' official component page.

Findings from the first runtime profile:

- Real mismatch: local code block treated `language` as a header trigger, so
  language-only blocks did not use Fumadocs-style floating copy actions.
- Real mismatch: horizontal scrolling lived on `pre` instead of the code
  viewport, so the viewport did not expose Fumadocs-like overflow ownership.
- Fix: `DocCodeBlock` root now carries `dir="ltr"`, `tabindex="-1"`,
  `shiki`, `not-prose`, optional line-number attributes, and header ownership
  is limited to title/filename/actions.
- Fix: code `pre` now uses `width: max-content` and delegates overflow to the
  viewport.

Verification:

- [x] `Get-ChildItem -Recurse -Filter *.mjs -LiteralPath scripts/parity | ForEach-Object { node --check $_.FullName }`
- [x] `pnpm typecheck`
- [x] `node scripts/parity/run.mjs --profile=code-block --url=http://127.0.0.1:8888/guide/code-block --viewports=1440x1000,994x935 --chromePort=9251`
- [x] Screenshot sanity only after DOM/state checks pass.

Runtime status:

- First profile run reached the browser and failed 4 checks:
  - missing untitled floating copy
  - missing viewport-owned horizontal overflow
- After fixes, static checks passed, but runtime re-check was blocked by Nuxt
  Content SQLite server-health failure:
  - `no such table: _content_docs`
  - `no such table: _content_docsMeta`
  - HTTP preflight returned `404`
- Dev server control was consolidated into `scripts/dev-server.mjs`.
- After `pnpm dev:restart -- --path=/guide/code-block --timeout=60000`, runtime
  profile passed with `20/20` checks:
  - `node scripts/parity/run.mjs --profile=code-block --url=http://127.0.0.1:8888/guide/code-block --viewports=1440x1000,994x935 --chromePort=9251`
- The first shell-only profile was insufficient: it passed while the page still
  looked unlike Fumadocs because the fixture used explicit `::doc-code-block`
  strings instead of the fenced-code path Fumadocs documents.
- Verified `shiki@4.2.0` and `@shikijs/transformers@4.2.0` are present through
  `@nuxt/content` / `@nuxtjs/mdc`; the mismatch was not missing dependencies.
- Nuxt Content currently renders highlighted fenced code as
  `.fd-doc-code-block-body > code > span.line`, not always `pre > code`, so
  the CSS baseline must cover both shapes.
- Updated the profile to validate the official Code Block page contract:
  preview wrapper, install card, Usage / Keep Background / Icons headings,
  titled fenced code, deterministic language icon, highlight markers, line
  numbers, viewport accessibility, and floating copy.
- After protocol/profile fixes, runtime profile passed with `26/26` checks:
  - `node scripts/parity/run.mjs --profile=code-block --url=http://127.0.0.1:8888/guide/code-block --viewports=1440x1000,994x935 --chromePort=9251`

Phase review:

- [x] Confirm changed component props/slots remain compatible.
- [x] Confirm no feature-local button/copy implementation was added.
- [x] Record profile gaps as observations, not false required checks.
- [x] Confirm runtime evidence comes from a healthy `/guide/code-block` route on
      port `8888`; a 404/SQLite-health result invalidates screenshot review.

## Phase 2: Callout / Tabs / Accordion / TypeTable / Files / InlineTOC

Status: done for the current second-pass batch

Target files:

- `app/components/content/DocCallout.vue`
- `app/components/content/DocTabs.vue`
- `app/components/content/DocTab.vue`
- `app/components/content/DocAccordion.vue`
- `app/components/content/DocAccordions.vue`
- `app/components/content/DocTypeTable.vue`
- `app/components/content/DocFiles.vue`
- `app/components/content/DocFile.vue`
- `app/components/content/DocFolder.vue`
- `app/components/content/DocInlineToc.vue`
- `app/assets/css/content.css`
- fixture pages under `content/guide/`

Fumadocs contract to align:

- Callout:
  - `info / warning / error / success / idea / warn alias`
  - icon and left color rail
  - title/description spacing
  - `tip -> info` alias
  - low-level `DocCalloutContainer` / `DocCalloutTitle` /
    `DocCalloutDescription` composition protocol
- Tabs:
  - active trigger state
  - list overflow
  - keep-mounted panel behavior if applicable
  - code-tab visual merging
  - simple mode `items / defaultIndex / label`
  - direct ownership between tab list triggers and tab panels
- Accordion:
  - hash-open behavior
  - copy anchor affordance
  - `hidden="until-found"` behavior where useful
  - chevron/data-state rhythm
  - root `single` / `multiple` type contract
  - interaction profile should wait for hydration and scroll clicked trigger
    into view
- TypeTable:
  - prop/type header row
  - collapsible rows
  - hash-open row
  - required/deprecated/default/parameters/returns fields
  - profile must clear `location.hash` before and after capture
- Files:
  - card shell
  - folder open/closed state
  - nested left border/indent
  - disabled folder state
  - long filename truncation
  - complex tree fixture may be split into multiple `DocFiles` samples
- InlineTOC:
  - compact card shell
  - collapsible behavior
  - nested link rhythm
  - default-open and default-closed samples
  - active link state
  - fixture must include an actual nested heading before asserting depth padding

Development tasks:

- [x] Add `content-components` profile or split into smaller profiles if the
      first version becomes noisy.
- [x] Shape fixtures so each component state is actually visible.
- [x] Fix only required DOM/state/layout mismatches.

Callout second-pass status:

- [x] Extended the fixture to cover all tones, `warn` alias, `tip` alias,
      no-title body, long wrapping content, and low-level container/title/body
      composition.
- [x] Added `type` support while preserving legacy `tone`.
- [x] Added low-level Callout composition components.
- [x] Extended `callout` profile from visual shell checks to protocol, DOM,
      state, style, and responsive checks.
- [x] Verified:
  - `node scripts/parity/run.mjs --profile=callout --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9286 --settleMs=2500 --dump`
  - `pnpm typecheck`

Callout process lesson:

- Mobile profile capture can race with HMR immediately after fixture expansion.
  Use a longer first-pass settle window such as `--settleMs=2500` when the
  fixture shape changed, then keep the focused profile result as the source of
  truth.

Tabs / CodeTabs second-pass status:

- [x] Added `DocTabs` support for Fumadocs-like simple mode:
      `items`, `defaultIndex`, and `label`.
- [x] Preserved manual trigger/panel mode used by current MDC fixtures.
- [x] Extended `tabs` profile to verify manual tabs, simple mode, and CodeTabs.
- [x] Fixed profile ownership to use direct child selectors so nested CodeTabs
      do not pollute ordinary Tabs metrics.
- [x] Verified:
  - `node scripts/parity/run.mjs --profile=tabs --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9296 --settleMs=2500 --dump`

Tabs process lesson:

- Raw PascalCase Vue component blocks inside Markdown can produce unstable
  nested boundaries for slot-heavy examples. Prefer MDC syntax for parity
  fixtures.
- `pnpm typecheck` can invalidate the running dev server's generated Nuxt
  Content database. Restart the managed dev server after typecheck before
  running additional runtime profiles.

Accordion second-pass status:

- [x] Confirmed current Vue implementation already exposes hash/copy/open
      state, `hidden="until-found"`, and region semantics.
- [x] Extended `accordion` profile with root type assertion and more reliable
      hydration/click timing.
- [x] Verified:
  - `node scripts/parity/run.mjs --profile=accordion --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9299 --settleMs=2500 --dump`

Accordion process lesson:

- Closed panel `hidden="until-found"` can be missing in the first capture if
  hydration has not finished. The profile should wait briefly before capture.
- Interaction profiles should scroll the trigger into view before clicking,
  especially when the target component is below long fixture content.

Files second-pass status:

- [x] Extended fixture coverage for nested open folders, closed folder opening,
      disabled folder, root-level files, and long filename overflow.
- [x] Extended `files` profile to assert tree density, folder state, nested
      border/indent, disabled state, and truncation.
- [x] Verified:
  - `node scripts/parity/run.mjs --profile=files --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9303 --settleMs=3000 --dump`

Files process lesson:

- For deep file-tree fixtures, inline leaf syntax such as `:doc-file{}` is more
  stable than block syntax for leaf nodes.
- Split fixture states across multiple `DocFiles` samples when MDC nesting would
  make one large tree ambiguous.

InlineTOC second-pass status:

- [x] Added default-closed fixture sample.
- [x] Added nested heading fixture so depth indentation is measurable.
- [x] Extended `inline-toc` profile to assert active state, depth padding,
      collapsed/open interaction, and responsive behavior.
- [x] Verified:
  - `node scripts/parity/run.mjs --profile=inline-toc --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9305 --settleMs=2500 --dump`

InlineTOC process lesson:

- Do not add profile assertions for states absent from the fixture. First make
  the target state visible, then assert it.

TypeTable second-pass status:

- [x] Extended fixture rows to cover required, default, deprecated, linked type
      descriptions, parameters, returns, and hash-open details.
- [x] Extended `type-table` profile to assert row matrix, rich details,
      `aria-expanded`, visible details grid, and hash update.
- [x] Verified:
  - `node scripts/parity/run.mjs --profile=type-table --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9309 --settleMs=4000 --dump`

TypeTable process lesson:

- Profiles that click hash-addressable rows must clear `location.hash` before
  and after capture. Multi-viewport runs reuse the same page context, so hash
  pollution can make the next viewport start from an unintended opened state.

Boundary:

- Current scope verifies manual `DocTypeTable` UI parity. `AutoTypeTable`
  remains a generator/product enhancement and should not block this component
  batch.

Verification:

- [x] `Get-ChildItem -Recurse -Filter *.mjs -LiteralPath scripts/parity | ForEach-Object { node --check $_.FullName }`
- [x] component profile command
- [x] `pnpm typecheck`
- [x] screenshot sanity for representative components

Phase review:

- [x] Separate fixture mismatch from implementation mismatch.
- [x] Confirm no product-only component was pulled into foundation by accident.

## Phase 3: Preview / Page Actions / Feedback / Pager

Status: current PageActions / Feedback / Pager contract verified; remaining
product and dedicated Preview work pending

Target files:

- `app/components/content/DocPreview.vue`
- `app/components/docs/DocsPageActions.vue`
- `app/components/docs/DocsFeedback.vue`
- `app/components/docs/DocsPager.vue`
- `app/assets/css/content.css`
- `app/assets/css/shell.css`

Fumadocs contract to align:

- Preview:
  - frame/sandbox variants
  - source slot rhythm
  - empty/loading/error states if supported
- Page actions:
  - `Copy Markdown` primary compact action
  - `Open` dropdown
  - `View as Markdown` link after per-page markdown URL is exposed
  - source/edit/open-in actions in menu
  - copy state labels and button size
- Feedback:
  - divider row rhythm
  - helpful/unhelpful active/thanks states
- Pager:
  - previous/next border-first lightweight layout
  - title/description wrapping
  - mobile one-column behavior

Development tasks:

- [x] Add `page-actions` probe profile.
- [x] Fix `page-actions` profile-exposed mismatches.
- Deferred: expose per-page markdown URL and add `View as Markdown` menu item.
  This is a product/export enhancement, not part of the current PageActions
  parity contract.
- [x] Add or expand `preview` probe coverage for the current frame/source
      contract.
- [x] Fix `preview` / `feedback` / `pager` profile-exposed mismatches for the
      current page-adjacent contract.

Verification:

- [x] static check for `page-actions`
- [x] runtime profile for `page-actions`
- [x] multi-viewport suite for `page-actions`
- [x] screenshot sanity

PageActions revalidation:

- [x] Re-ran `page-actions` after the TypeTable/typecheck/dev-server restart.
- [x] Confirmed the implementation contract still passes:
  - Copy/Open button rhythm
  - Open popover options and geometry
  - Feedback selected/thanks state
  - Pager item contract
- [x] Improved the profile interaction flow to wait for target state instead of
      relying on fixed sleeps:
  - Open waits for `aria-expanded="true"` and rendered menu options.
  - Feedback waits for pressed state and thanks text.
- [x] Verified:
  - `node scripts/parity/run.mjs --profile=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9312 --settleMs=2500 --dump`
  - `node scripts/parity/run.mjs --suite=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9313 --settleMs=2500`

PageActions process lesson:

- Interactive profiles should wait for the semantic target state they assert.
  A fixed sleep can fail on the first hydrated viewport while later viewports
  pass, which makes the result look like an implementation regression.

Phase review:

- [x] Ensure product actions still enter through slots/contracts.
- [x] Ensure copy state uses shared helper.

Boundary:

- `View as Markdown` remains a product/export enhancement because it first
  needs a per-page markdown URL contract. It is tracked in
  `design/fumadocs-component-parity-inventory.md` and does not block the
  current PageActions parity contract.

## Current Batch Regression

Status: done

Verified:

- [x] `node scripts/parity/run.mjs --suite=content-components --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9317 --settleMs=3000 --dump`
- [x] `node scripts/parity/run.mjs --suite=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9313 --settleMs=2500`
- [x] `node scripts/parity/run.mjs --suite=full-regression --viewports=1440x1000,994x935,390x844 --chromePort=9319 --settleMs=3000 --retries=1 --dump`
- [x] `pnpm typecheck`
- [x] `git diff --check`

Regression note:

- One full-regression attempt observed a single viewport with Nuxt `500 -
  Internal Server Error` during dev-server rebuild/HMR. The rerun with
  `--retries=1` passed all profiles. Treat this as server-health instability,
  not a component parity mismatch.

## Phase 4: Missing / Postponed Components Decision

Status: done

Known Fumadocs components not fully matched:

- `ImageZoom`
- `Banner`
- `GitHubInfo`
- `DynamicCodeBlock`
- `AutoTypeTable`
- `GraphView`

Tasks:

- [x] Decide foundation vs product-aware vs postponed classification.
- [x] For foundation components, add minimal contract and fixture.
- [x] For product-aware components, document why they do not block parity.
- [x] Replace placeholder-only fixture pages with either real examples or
      explicit postponed notes.

Verification:

- [x] docs link validation still passes.
- [x] route pages do not show broken placeholders as finished components.

Phase review:

- [x] Roadmap and implementation notes use the same classification language.

## Phase 5: Documentation And Cleanup

Status: done for the current batch

Tasks:

- [x] Update `design/parity-reconstruction-workflow.md` with reusable lessons.
- [x] Update `design/implementation-notes.md` with verified Stage 7.7 result.
- [x] Update `design/roadmap.md` status if the gate changes current progress.
- [x] Retain this temporary todo file as a current-batch execution audit; the
      durable next-batch list lives in
      `design/fumadocs-component-parity-inventory.md`.

Final verification:

- [x] `pnpm validate:links`
- [x] `pnpm typecheck`
- [x] relevant parity profiles pass or have documented server-health blocker
- [x] `git diff --check`
