---
title: Fumadocs Parity Reconstruction Workflow
description: Iterative workflow for reconstructing Fumadocs-like UI with measurable DOM, style, and layout parity.
sectionLabel: Design
---

# Fumadocs Parity Reconstruction Workflow

> Status: this file is now the historical case archive for parity work. The
> short daily execution entry point lives in the `fumadocs-parity` Codex skill.
> Project rules only keep the gate; detailed process belongs in the skill and
> its references.

This document records the working method for aligning this project with
Fumadocs. It is intentionally iterative: every parity MVP should update this
file with what worked, what failed, and which checks should be reused.

## Core Problem

Direct screenshot-driven implementation is too slow for this project.

If atomic components and CSS variables look close but the final page still
looks far away, the mismatch usually lives in one of these layers:

- DOM ownership and wrapper hierarchy
- parent layout grid / flex contracts
- prose and `not-prose` boundaries
- computed styles after cascade and specificity
- bounding boxes, spacing, and sticky positioning
- active / open / collapsed state attributes
- font, line-height, and reset differences

Therefore screenshots are treated as final regression evidence, not as the main
diagnostic tool.

## Reconstruction Loop

For each target surface, use this loop:

1. Pick one narrow surface and one reference page.
2. Extract Fumadocs reference data:
   - DOM skeleton
   - key attributes
   - computed styles
   - bounding boxes
   - CSS variables when relevant
3. Extract the same data from the local page.
4. Diff the two JSON structures.
5. Classify each mismatch as:
   - DOM contract
   - layout metric
   - computed style
   - token / variable
   - state / interaction
   - content fixture
6. Fix from outside to inside:
   - root layout
   - component wrapper
   - component internals
   - states
   - typography and fine spacing
7. Verify with the same extractor.
8. Record durable lessons here or in `design/implementation-notes.md`.

## MVP 1: Right TOC

Target:

- Fumadocs page: `https://www.fumadocs.dev/docs/ui/components`
- Local page: `http://127.0.0.1:3000/guide/component-detail`
- Surface: desktop right-side table of contents only

Components in scope:

- `app/components/docs/DocsToc.vue`
- `app/components/docs/DocsTocList.vue`
- `app/components/docs/DocsTocPopover.vue`
- TOC styles in `app/assets/css/shell.css`

Components out of scope:

- sidebar
- article header
- page actions
- prose content components
- pager / feedback

### Extractor Fields

Root TOC:

- selector presence
- tag name
- id
- role / aria label where present
- bounding box
- computed:
  - display
  - position
  - top
  - width
  - max-height / height
  - overflow
  - padding
  - color
  - background
  - border

Title:

- text
- tag name
- icon presence
- bounding box
- computed:
  - display
  - gap
  - margin
  - font-size
  - font-weight
  - color

List:

- list wrapper selector
- rail / active indicator presence
- bounding box
- computed:
  - padding
  - margin
  - font-size
  - line-height
  - color

Links:

- text
- href
- active state
- depth / indentation
- bounding box
- computed:
  - display
  - min-height / height
  - padding-left
  - padding-right
  - padding-top / padding-bottom
  - font-size
  - font-weight
  - line-height
  - color

### MVP Acceptance

This MVP is viable if it can tell us whether the mismatch is mainly:

- TOC data / heading protocol
- DOM hierarchy
- wrapper sizing / sticky placement
- link indentation and row rhythm
- active rail behavior
- color / typography

For the first pass, acceptance is not pixel-perfect. The TOC should satisfy:

- root appears as a desktop right rail, not a card
- root width is close to `268px`
- title reads `On this page` and includes an icon
- links are visible and ordered
- h2 / h3 indentation matches the reference pattern
- active link uses primary color
- a rail and active indicator are present
- no horizontal overflow is introduced

## MVP 1 Findings

Status: viable.

The extractor found concrete differences that were not obvious enough from
screenshots alone:

- The local root was initially an `aside` with sticky behavior on an inner
  wrapper. Fumadocs uses `div#nd-toc` as the sticky, full-height, flex root.
- Adding `grid-area: toc` to the root was not enough. The parent grid also
  needs a matching `grid-template-areas` contract, otherwise the browser places
  TOC into an implicit grid area after the article.
- Link rhythm is mostly mechanical: `text-sm`, `line-height: 20px`,
  `py: 6px`, first item `pt: 0`, last item `pb: 0`, and depth offsets
  `20px / 32px / 44px`.
- Fumadocs hides desktop TOC below `xl`. Local TOC was previously hidden only
  below the mobile layout breakpoint.
- Nuxt Content currently normalizes missing optional boolean frontmatter to
  `false` in the queried page payload. For this MVP fixture, `tocPopover: true`
  is explicit so the responsive TOC can be validated, but the foundation
  protocol still needs a separate solution for distinguishing missing values
  from explicit `false`.

Changes made for the MVP:

- `DocsToc` now renders `div#nd-toc` with direct `h3#toc-title` and list
  children.
- `DocsTocList` now mirrors the Fumadocs shape more closely: a scroll shell
  with a direct flex list of anchor items.
- `.docs-toc` owns sticky position, `grid-area: toc`, full viewport height,
  `268px` width, and Fumadocs-like padding.
- `.docs-page-frame` declares `grid-template-areas` so `page`, `toc`, and
  `toc-popover` are explicit layout slots.
- Desktop TOC hides below `1279px`, matching Fumadocs' `max-xl:hidden`
  behavior.
- The MVP fixture page explicitly enables `tocPopover` for responsive
  comparison.

Verified with CDP at `1440x1000`:

- Fumadocs root: `div#nd-toc`, `display: flex`, `position: sticky`,
  `grid-area: toc`, `width: 268px`, `height: 1000px`,
  `padding: 48px 16px 8px 0px`.
- Local root now matches those structural metrics.
- Fumadocs title: `h3#toc-title`, icon present, `font-size: 14px`,
  `font-weight: 400`, `line-height: 20px`, `gap: 6px`.
- Local title now matches those structural and typographic metrics.
- Local link display, font size, font weight, line height, first/middle/last
  padding pattern, and depth offsets now match the Fumadocs pattern.

Remaining gaps from that pass:

- Local x-position was still `16px` left of the Fumadocs reference at `1440px`.
  That belonged to the outer docs shell/sidebar/gutter contract, not the TOC
  component itself. This was resolved in MVP 1.1.
- The local fixture has four headings while the reference page has three, so
  list height and second-link indentation are not a perfect content fixture
  comparison.
- The local active rail is a simpler static rail/thumb. Fumadocs computes a
  curved SVG track and animated thumb path from real anchor positions.
- The local TOC popover is only partially aligned. Its existence and breakpoint
  can now be validated, but trigger height, text switching, icon set, and
  sticky header rhythm still need a dedicated popover pass.
- Missing-vs-explicit boolean semantics must be fixed before relying on
  default `tocPopover` policy globally.

Reusable lesson:

Do not start with token tweaking. First compare the root DOM and the parent
layout contract. If `grid-area`, sticky ownership, or wrapper height differs,
pixel-level styling changes are noise.

## MVP 1.1: TOC Parity v2

Status: viable and reusable.

The second pass extended MVP 1 from a one-off CDP snippet into a reusable
repository script:

```bash
node scripts/parity-extract.mjs \
  --reference=https://www.fumadocs.dev/docs/ui/components \
  --local=http://[::1]:3001/guide/component-detail \
  --selector=#nd-toc \
  --viewports=1440x1000,994x1000 \
  --out=$env:TEMP/toc-parity-v2.json
```

Use `http://[::1]:3001` when the Nuxt dev server is listening on IPv6 loopback
only. `127.0.0.1:3001` can return `502` in that state even when the page is
healthy.

### v2 Scope

This pass validated:

- desktop right TOC root ownership and metrics
- desktop TOC title, link rhythm, indentation, and active color contract
- responsive breakpoint where desktop TOC hides below `1280px`
- top TOC popover presence, sticky position, trigger height, width, and padding
- default `tocPopover` policy when the page does not explicitly declare it

This pass intentionally did not solve:

- final color token parity
- Fumadocs' dynamic curved SVG rail and animated active path
- content fixture parity with the exact reference heading tree
- opened popover panel internals

### v2 Fixes

- `scripts/parity-extract.mjs` now captures reference and local pages through
  headless Chrome CDP and writes comparable JSON for repeated checks.
- The extractor separates scroll shell and actual list selection so an outer
  `nav` fallback does not hide `.docs-toc-list` measurements.
- The docs shell desktop grid now follows the Fumadocs-style column contract:
  sidebar, article area, and TOC without an extra 16px side gutter.
- The TOC popover trigger now matches the Fumadocs trigger metric at the tested
  responsive viewport: `40px` high with `10px 24px` padding.
- Page-level `tocPopover` defaulting now reads raw markdown frontmatter to
  distinguish a missing key from an explicit `false`.

### v2 Evidence

Verified with `scripts/parity-extract.mjs` at `1440x1000`:

- Fumadocs root: `rect=1157,0,268x1000`, `display:flex`,
  `position:sticky`, `grid-area:toc`, `padding:48px 16px 8px 0px`.
- Local root: `rect=1157,0,268x1000`, `display:flex`,
  `position:sticky`, `grid-area:toc`, `padding:48px 16px 8px 0px`.
- Local title keeps the same structural metrics as the reference:
  `14px / 20px`, `font-weight:400`, icon present.
- Local link rhythm matches the reference pattern:
  first row `0px 0px 6px 20px`, middle rows `6px 0px 6px ...`, final row
  `6px 0px 0px ...`.

Verified at `994x1000`:

- Fumadocs desktop TOC root: hidden.
- Local desktop TOC root: hidden.
- Fumadocs popover: `rect=268,0,711x40`, trigger padding `10px 24px`.
- Local popover: `rect=268,0,711x40`, trigger padding `10px 24px`.

### v2 Remaining Gaps

- Color values still differ because local tokens are not yet a Fumadocs token
  clone. Example: Fumadocs active link in the captured dark reference is
  `rgb(169, 206, 255)`, while local light active link is `rgb(37, 99, 235)`.
- Fumadocs has a richer TOC rail implementation. Local currently has a simple
  rail plus active thumb, enough for layout parity but not final interaction
  parity.
- The local fixture has a different heading tree from the reference page, so
  list height and some indentation rows cannot be interpreted as component
  defects by themselves.
- The closed popover trigger is aligned. The opened popover content, close
  button, scroll behavior, and active state need a separate extractor pass.

### v2 Reusable Lessons

- The fastest correction came from measuring parent shell columns, not from
  changing TOC internals. A 16px root x-offset was caused by outer grid gutters.
- When a component is hidden in one viewport, computed styles on its descendants
  can still exist but bounding boxes collapse to `0x0`; treat geometry as the
  source of truth for visibility.
- Extractors should prefer specific selectors in separate fallback steps.
  Combining specific and broad selectors in one `querySelector()` can return an
  earlier broad wrapper such as `nav` before reaching the intended child.
- Keep the extractor script in the repository and update it as the target
  surface grows. This turns parity work into a repeatable measurement loop
  instead of a screenshot guessing loop.

## MVP 1.2: Profile Compare Validation

Status: validated for TOC and ready to reuse as the baseline workflow.

This pass did not restore another UI surface. It tested whether the proposed
workflow can produce a useful automated report before we spend more time on
other components.

### Validation Command

```bash
node scripts/parity-extract.mjs \
  --reference=https://www.fumadocs.dev/docs/ui/components \
  --local=http://127.0.0.1:3002/guide/component-detail \
  --selector=#nd-toc \
  --viewports=1440x1000,994x1000 \
  --out=$env:TEMP/toc-parity-profile-mvp.json

node scripts/parity-compare.mjs \
  --profile=toc \
  --input=$env:TEMP/toc-parity-profile-mvp.json
```

Before running the parity commands, verify the local URL directly. In this
pass, older dev servers on `3000` and `3001` returned `404`, so a fresh server
was started on `127.0.0.1:3002`. This confirmed that parity validation needs a
local URL health check before extraction.

### Compare Result

The first compare attempt failed with one required mismatch:

- `link 3 style.paddingBottom`: reference `0px`, local `6px`

That failure was useful, but the classification was wrong. The reference page
has three TOC links and the local fixture has four, so the third reference link
is the final row while the third local link is not. The profile was updated so
last-row padding is a required check only when both rows have the same role
(both last or both non-last).

After the profile fix:

- status: `PASS`
- required checks: `34/34`
- non-blocking observations: `4`

Tracked observations:

- different heading fixture link count
- fixture-driven last-row padding difference
- active link color difference from token/theme parity
- local simple rail versus Fumadocs dynamic rail

### Validation Conclusion

The workflow is viable if each surface has:

- an extractor profile that captures stable DOM, computed style, and geometry
- a compare profile that separates required structure from known non-blocking
  differences
- a local URL health check before capture
- fixture-aware rules for list-like components
- explicit observations for token/theme gaps and advanced interaction gaps

This means the next UI restoration task should not start by editing CSS. It
should start by adding or extending a compare profile for exactly one target
surface, then using the report to decide which layer to fix.

### Promotion Rule

Promote this flow to the next surface only when:

- the local target page returns `200`
- the extractor writes a complete reference/local capture
- the compare report has no required failures caused by the tool itself
- required failures map to actionable DOM/layout/style differences
- non-blocking differences are explicitly labeled with a reason

If a compare profile reports a failure caused by mismatched fixture roles, fix
the profile first. Do not change component code to satisfy a bad comparison.

## MVP 1.3: Process Optimization

Status: adopted for the next UI parity surfaces.

The dynamic TOC rail pass proved that the workflow should have a stricter
preflight and failure-classification phase. The most useful signal was not the
screenshot by itself; it was the compare report catching a real rhythm
regression after a DOM wrapper was inserted.

### Optimized Loop

Use this loop for each future surface:

1. Source mining
   - Check Fumadocs source for protocol, DOM ownership, and state behavior.
   - Check `D:\Projects\Work\tiny-robot-docs-ui` for existing Vue algorithms or
     prior component lessons.
   - Check the current implementation and public props before editing.
2. Fixture shaping
   - Add or adjust local content so the target states are visible.
   - Include first item, last item, nested item, active item, long text, and
     responsive states when relevant.
   - Do not compare a state that the fixture does not trigger.
3. Smoke preflight
   - Verify the local URL returns `200`.
   - Verify the SSR HTML is not tiny or empty.
   - Verify the main selector and expected SSR tokens exist.
4. Extract
   - Capture reference and local DOM, computed style, geometry, and state.
5. Compare
   - Keep required checks focused on DOM contract, geometry, row rhythm, and
     breakpoint behavior.
   - Put token/theme differences, fixture size differences, and advanced
     implementation differences into observations.
6. Classify failures
   - `profile-rule`: the profile compared the wrong role or selector.
   - `fixture-mismatch`: the local fixture and reference do not express the
     same state.
   - `real-regression`: the implementation violated a required contract.
   - `token-theme`: colors or variables differ but structure is correct.
   - `reference-unstable`: the reference state cannot be captured reliably.
7. Fix from contract inward
   - outer layout
   - root wrapper
   - DOM role / selector
   - state or measurement algorithm
   - row rhythm
   - token / color
   - motion and fine detail
8. Runtime proof
   - static checks
   - CDP/evaluate checks for critical generated state
   - at least one local screenshot for nonblank, visually plausible output
9. Cleanup and record
   - Stop any temporary dev server started for parity.
   - Record command, evidence, failures, and profile-rule changes here.

### Smoke Command

Use `scripts/parity-smoke.mjs` before extractor runs:

```bash
node scripts/parity-smoke.mjs \
  --url=http://127.0.0.1:3002/guide/component-detail \
  --selector=#nd-toc \
  --contains=.docs-toc-link,.docs-toc-popover
```

This catches stale dev servers, `404` pages, empty SSR output, and missing root
selectors before Chrome/CDP extraction. It is intentionally lightweight and does
not replace runtime extraction.

### Fixture Notes Template

Each new compare profile should include fixture requirements. Example for TOC:

- at least three `h2` headings
- at least two `h3` headings
- at least one `h2 -> h3 -> h2` level change
- enough body content to scroll
- a responsive viewport where the popover is used

Example for future code block parity:

- plain code block
- titled code block
- long line overflow
- copy button state
- diff add/remove lines
- language label and optional tabs

### Failure Classification Rule

When compare fails, do not edit component code immediately.

First decide whether the failure is:

- profile rule issue
- fixture mismatch
- real implementation regression
- token/theme difference
- reference capture instability

Only `real implementation regression` should directly trigger component edits.
For profile-rule failures, fix the profile and rerun. For fixture mismatches,
shape the fixture or mark the difference as a non-blocking observation.

### Lesson From Dynamic TOC Rail

The dynamic rail migration inserted a decorative node before the first link.
The existing CSS used `.docs-toc-link:first-child`, so the first visible link
lost its `padding-top: 0` rhythm. `parity-compare.mjs` caught the regression as
a required failure:

- `link 1 style.paddingTop`: reference `0px`, local `6px`

The correct fix was changing the selector to `.docs-toc-link:first-of-type`,
not relaxing the compare rule. This is the expected value of the workflow:
small structural regressions should become measurable before they turn into
visual guessing.

## MVP 1.4: Probe-First Optimization

Status: adopted as the new pre-extract step.

The wide-layout and bottom-active TOC pass showed that our workflow still had
one expensive gap: after smoke passed, we were hand-writing browser snippets to
answer basic runtime questions:

- Is the local dev server rendering the real page or a Nuxt error page?
- Which grid columns are active at the target viewport?
- Where are shell, sidebar, page, and TOC bounding boxes?
- Which TOC item has `aria-current` after scrolling to the bottom?
- Is the observed issue in layout geometry, state source, or final styling?

Those questions should be answered before opening the full reference/local
extract-and-compare loop. The new `scripts/parity-probe.mjs` command captures
that local runtime state in one pass.

### Probe Command

```bash
node scripts/parity-probe.mjs \
  --url=http://127.0.0.1:3002/guide/component-detail \
  --selector=#nd-toc \
  --viewports=2048x1152,994x935
```

The probe performs:

- HTTP preflight:
  - status must be `200`
  - HTML must be large enough
  - Nuxt error page marker must be absent
  - SSR selector token should exist
- Runtime capture in headless Chrome:
  - target root presence and display state
  - configured rect selectors
  - shell `grid-template-columns`
  - top-scroll active/current state
  - bottom-scroll active/current state
  - heading list and last heading id
- TOC-specific checks:
  - desktop TOC is visible at wide viewport
  - shell grid columns are captured
  - bottom current link reaches the last heading

### Updated Loop Placement

Use this order for every future UI parity task:

1. Source mining.
2. Fixture shaping.
3. Smoke preflight.
4. Local runtime probe.
5. Reference/local extract.
6. Compare profile.
7. Failure classification.
8. Fix from contract inward.
9. Runtime proof.
10. Cleanup and record.

The probe does not replace `parity-extract` or `parity-compare`. Its job is to
avoid wasting a full parity run on stale servers, Nuxt error pages, missing
selectors, wrong breakpoints, or broken state sources.

### Efficiency Test Result

The probe made the previous manual TOC verification reusable:

- Against a stale `3000` server, the probe failed in the HTTP preflight:
  `404`, short HTML, and missing `#nd-toc` SSR token. This prevented a bad
  server from entering screenshot or extractor analysis.
- Against a fresh `3002` server, the probe passed `10/10` checks in one run:
  `2048x1152` captured the Fumadocs-style five-column shell
  `240.5px 268px 1016px 268px 240.5px`, desktop TOC `flex/268px`, and bottom
  current `#inside-previews`; `994x935` captured hidden desktop TOC and the
  same bottom current state through the responsive path.
- It can fail fast when the target server is unhealthy instead of letting a
  screenshot or extractor inspect an error page.
- It reports the wide desktop shell columns directly, so the Fumadocs five-col
  grid contract can be checked without writing a custom CDP snippet.
- It scrolls to the bottom and checks `aria-current` against the last heading,
  which catches the exact class of TOC active-state bugs from the previous
  pass.
- It also captures the responsive viewport in the same command, so desktop TOC
  and TOC popover breakpoint behavior are checked together.

Reusable rule:

If the probe fails, do not run full reference extraction yet. Classify the
probe failure first as `server-health`, `runtime-selector`, `layout-contract`,
or `state-source`. Only move to reference/local comparison after the local
runtime is known to be healthy.

Probe-tool rule:

If a probe fails but manual inspection suggests the component is correct, audit
the probe timing before changing UI code. The first TOC probe read bottom
`aria-current` too early at the wide viewport. The fix was to wait until the
bottom scroll state and current heading settle, not to change the TOC component.

## MVP 1.5: State-Matrix Probe Profiles

Status: adopted for interaction-heavy parity surfaces.

The left sidebar pass exposed the next bottleneck: even after a probe-first
workflow existed, interaction components still required hand-written CDP
snippets for every round. The same questions repeated:

- Is the dropdown open state real, or is the panel always mounted?
- Does the panel participate in normal document flow?
- Does the collapse trigger update both component state and layout state?
- Does hover reveal change `data-hovered` and restore panel geometry?
- Does the floating trigger pin the sidebar back to the normal column?
- Are content fixture leaks polluting the visual comparison?

These questions are not screenshot questions. They are state-matrix questions,
so they should live in a reusable probe profile.

### New Probe Profile

`scripts/parity-probe.mjs` now supports `--profile=sidebar`.

```bash
node scripts/parity-probe.mjs \
  --profile=sidebar \
  --url=http://127.0.0.1:3002/guide/component-detail \
  --viewports=2048x1152,994x935
```

The sidebar profile keeps the existing HTTP preflight and then runs this local
state matrix:

1. Initial state
   - `#nd-sidebar` exists.
   - sidebar is not collapsed.
   - selected tab trigger matches the expected current product.
   - tab dropdown is closed and no panel is mounted.
   - expected separators exist.
   - expected current link is active.
2. Dropdown state
   - clicking the tab trigger opens the dropdown.
   - active tab has `aria-current="page"`.
   - sidebar nav top stays unchanged, proving the dropdown overlays instead of
     occupying real document flow.
3. Collapsed state
   - clicking collapse updates `#nd-docs-layout[data-sidebar-collapsed]`.
   - `#nd-sidebar[data-collapsed]` is true.
   - floating trigger exists.
   - sidebar panel is hidden in desktop geometry.
4. Hover reveal state
   - pointer enter on the left hover zone sets `data-hovered="true"`.
   - floating trigger hides while the preview panel is visible.
   - sidebar panel opacity and left position show it has moved into view.
5. Pinned state
   - clicking the floating pin returns the layout to non-collapsed.
   - floating trigger unmounts.

Profile-specific options:

```bash
--sidebarExpectedTab=Fumadocs UI
--sidebarExpectedCurrent=Accordion
--sidebarExpectedSeparators=Introduction,References,Components,Layouts
```

### Updated Party Flow

For interaction-heavy parity tasks, use this stricter order:

1. Source contract first
   - Identify the Fumadocs source files.
   - Record whether the surface is inline DOM, popover, portal, drawer, sticky
     root, controlled state, or provider state.
2. State matrix before CSS
   - List initial, opened, active, collapsed, hovered, focused, pinned,
     responsive, and empty states.
   - Do not implement style before knowing which states must exist.
3. Fixture shaping
   - Add enough local content to make the expected state visible.
   - Exclude unrelated fixture pages before visual comparison.
4. Local probe profile
   - Add or extend a `parity-probe` profile for the state matrix.
   - The profile must fail on stale server, missing selectors, wrong flow
     ownership, or broken interaction state.
5. Implement contract inward
   - provider/state ownership
   - root/layout data attributes
   - DOM mounting semantics
   - ARIA/data state
   - flow geometry
   - CSS rhythm
6. Runtime proof
   - Run the profile and read the failed checks before writing custom browser
     snippets.
   - Use screenshots only after DOM/state checks are passing.
7. Record the reusable probe
   - If the manual check had to be repeated twice, promote it into a profile.

### Efficiency Hypothesis

The expected efficiency gain is not fewer commands. It is fewer ambiguous
manual decisions.

Before the sidebar profile, one verification round required several manual
browser snippets:

- initial DOM capture
- dropdown click and panel geometry capture
- collapse capture
- hover-zone event dispatch
- floating pin capture
- content-leak inspection

With `--profile=sidebar`, those become one command with named checks. Future
rounds should only need custom CDP when the profile itself is wrong or a new
state is added.

### Sidebar Profile Validation Result

Validated against a fresh local server on `127.0.0.1:3002`:

```bash
node scripts/parity-probe.mjs \
  --profile=sidebar \
  --url=http://127.0.0.1:3002/guide/component-detail \
  --viewports=2048x1152,994x935 \
  --chromePort=9234
```

Result:

- status: `PASS`
- checks: `24/24`
- `2048x1152`: selected tab `Fumadocs UI`, `18` sidebar links,
  separators `Introduction / References / Components / Layouts`,
  collapsed panel opacity `0`, hover panel opacity `1`
- `994x935`: same state matrix passed

This replaced the previous manual sequence of browser snippets for initial
DOM, dropdown, collapse, hover reveal, and pin-back behavior. The remaining
manual work is now limited to interpreting failures or adding new profile
states.

Reusable rule:

Every parity surface should graduate from ad hoc snippets to a named probe
profile once it has more than two interactive states. A profile is not a visual
truth oracle; it is the guardrail that keeps us from fixing screenshots while
the underlying protocol is still wrong.

## MVP 1.6: Skill Extraction And Gate

The daily parity workflow has been extracted into the local Codex skill:

`C:\Users\song\.codex\skills\fumadocs-parity`

Project-level `AGENTS.md` now keeps only a short gate:

- use the `fumadocs-parity` skill when available;
- inspect source, DOM, state, computed styles, and layout metrics before
  screenshot-based fine tuning;
- run an existing parity profile when one exists;
- keep this document as the historical case archive.

### Validation Result

The skill folder passed structural validation:

```bash
python C:\Users\song\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\song\.codex\skills\fumadocs-parity
```

Result:

```text
Skill is valid!
```

The new flow was tested by using the skill's "prefer existing profile" path
against the current local dev server at `http://127.0.0.1:3000`.

```bash
node scripts/parity-probe.mjs --profile=sidebar --url=http://127.0.0.1:3000/guide/component-detail --viewports=2048x1152,994x935 --chromePort=9234
node scripts/parity-probe.mjs --profile=toc --url=http://127.0.0.1:3000/guide/component-detail --viewports=2048x1152,994x935 --chromePort=9234
```

Results:

```text
sidebar: PASS, 24/24 checks passed
toc: PASS, 10/10 checks passed
```

### Efficiency Result

The active execution entry point is now about 60 lines, while this historical
archive is more than 600 lines. Future parity work should load the short skill
first and open this archive only for prior cases, profile history, or lessons.

## MVP 1.7: Dev Server Control

Stage 7.7 exposed a repeated server-health failure that was not a component
bug:

- multiple Nuxt dev processes were listening or still alive for the same
  workspace;
- old `pnpm dev`, `cmd /c pnpm dev`, direct Nuxt, and temporary shell launches
  left inconsistent process trees;
- Nuxt Content SQLite intermittently failed with missing `_content_docs` and
  `_content_docsMeta` tables;
- parity profiles correctly failed in HTTP preflight, but repeated manual
  restarts made the loop noisy.

The project now has a single dev server control entry point:

```bash
pnpm dev:restart -- --path=/guide/code-block --timeout=60000
pnpm dev:health -- --path=/guide/code-block --timeout=20000
pnpm dev:status
pnpm dev:stop
```

Implementation:

- `scripts/dev-server.mjs`
- state file: `.nuxt/dev-control/server.json`
- logs: `.nuxt/dev-control/server.log`
- error logs: `.nuxt/dev-control/server.err.log`

Validation result:

```text
pnpm dev:restart -- --path=/guide/code-block --timeout=60000
Health: ok status=200 bytes=83957 url=http://127.0.0.1:8888/guide/code-block

node scripts/parity-probe.mjs --profile=code-block --url=http://127.0.0.1:8888/guide/code-block --viewports=1440x1000,994x935 --chromePort=9245
Status: PASS
Checks: 20/20 passed
```

Reusable rule:

For parity work, do not start ad hoc dev servers. Use `pnpm dev:restart` before
runtime profiles and `pnpm dev:stop` after the work if the server is no longer
needed. If `dev:health` fails, classify the issue as `server-health` before
debugging UI code.
