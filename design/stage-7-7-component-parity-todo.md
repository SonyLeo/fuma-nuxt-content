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

Status: in progress

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
- [ ] Screenshot sanity only after DOM/state checks pass.

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

Status: in progress

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
- Tabs:
  - active trigger state
  - list overflow
  - keep-mounted panel behavior if applicable
  - code-tab visual merging
- Accordion:
  - hash-open behavior
  - copy anchor affordance
  - `hidden="until-found"` behavior where useful
  - chevron/data-state rhythm
- TypeTable:
  - prop/type header row
  - collapsible rows
  - hash-open row
  - required/deprecated/default/parameters/returns fields
- Files:
  - card shell
  - folder open/closed state
  - nested left border/indent
- InlineTOC:
  - compact card shell
  - collapsible behavior
  - nested link rhythm

Development tasks:

- [ ] Add `content-components` profile or split into smaller profiles if the
      first version becomes noisy.
- [ ] Shape fixtures so each component state is actually visible.
- [ ] Fix only required DOM/state/layout mismatches.

Verification:

- [x] `Get-ChildItem -Recurse -Filter *.mjs -LiteralPath scripts/parity | ForEach-Object { node --check $_.FullName }`
- [ ] `pnpm typecheck`
- [ ] component profile command
- [ ] screenshot sanity for representative components

Phase review:

- [ ] Separate fixture mismatch from implementation mismatch.
- [ ] Confirm no product-only component was pulled into foundation by accident.

## Phase 3: Preview / Page Actions / Feedback / Pager

Status: in progress

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
- [ ] Expose per-page markdown URL and add `View as Markdown` menu item.
- [ ] Add or expand `preview` probe profile.
- [ ] Fix `preview` / `feedback` / `pager` profile-exposed mismatches.

Verification:

- [x] static check for `page-actions`
- [x] runtime profile for `page-actions`
- [ ] screenshot sanity

Phase review:

- [ ] Ensure product actions still enter through slots/contracts.
- [ ] Ensure copy state uses shared helper.

## Phase 4: Missing / Postponed Components Decision

Status: pending

Known Fumadocs components not fully matched:

- `ImageZoom`
- `Banner`
- `GitHubInfo`
- `DynamicCodeBlock`
- `AutoTypeTable`
- `GraphView`

Tasks:

- [ ] Decide foundation vs product-aware vs postponed classification.
- [ ] For foundation components, add minimal contract and fixture.
- [ ] For product-aware components, document why they do not block parity.
- [ ] Replace placeholder-only fixture pages with either real examples or
      explicit postponed notes.

Verification:

- [ ] docs link validation still passes.
- [ ] route pages do not show broken placeholders as finished components.

Phase review:

- [ ] Roadmap and implementation notes use the same classification language.

## Phase 5: Documentation And Cleanup

Status: pending

Tasks:

- [ ] Update `design/parity-reconstruction-workflow.md` with reusable lessons.
- [ ] Update `design/implementation-notes.md` with verified Stage 7.7 result.
- [ ] Update `design/roadmap.md` status if the gate changes current progress.
- [ ] Delete this temporary todo file after all phases are complete.

Final verification:

- [ ] `pnpm validate:links`
- [ ] `pnpm typecheck`
- [ ] relevant parity profiles pass or have documented server-health blocker
- [ ] `git diff --check`
