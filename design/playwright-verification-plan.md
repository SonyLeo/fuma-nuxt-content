---
title: Playwright Verification Plan
sectionLabel: Plan
---

# Playwright Verification Plan

This document records the POC for replacing the custom CDP execution layer with
Playwright while keeping the existing Fumadocs parity contract process.

## Decision

Keep parity contract cards as the source of truth for what should be aligned.
Use Playwright for local verification:

- navigation and fixture loading
- locator-based DOM assertions
- actionability and auto-waiting
- responsive projects
- trace, screenshot, and video on failure

Do not use Playwright as a replacement for source review or Fumadocs reference
analysis.

## POC Scope

The first POC targets the current `layout-provider` suite because it is small,
recently verified, and covers provider/state/slot/page-shell behavior.

Mapped profiles:

- `root-provider`
- `layout-slots`
- `sidebar-state`
- `layout-tabs`
- `home-layout`
- `not-found`

The Playwright POC splits dropdown behavior into the dedicated `layout tabs`
test. The sidebar provider test focuses on provider-owned collapse, hover, and
mobile drawer state.

Viewports:

- `1440x1000`
- `994x935`
- `390x844`

## Files

- `playwright.config.ts`
- `tests/e2e/layout-provider.spec.ts`
- `tests/e2e/helpers/docs-page.ts`
- `tests/e2e/helpers/assertions.ts`

## Commands

```bash
pnpm test:e2e:layout
pnpm test:e2e:shell
pnpm test:e2e:toc
pnpm test:e2e:content
pnpm test:e2e:components
pnpm test:e2e:page
pnpm test:e2e:fast
pnpm test:e2e:full
```

Legacy comparison:

```bash
node scripts/parity/run.mjs --suite=layout-provider --viewports=1440x1000,994x935,390x844 --chromePort=9371 --retries=1 --dump
```

## Acceptance Criteria

- Playwright POC covers the same core contracts as `layout-provider`.
- Playwright test code is materially smaller than the six legacy profile files.
- Failures provide better diagnostics through trace/screenshot/video.
- The legacy suite remains available until enough profiles are migrated.

## POC Results

Status: accepted as a useful replacement for the local verification execution
layer.

Commands run:

```bash
pnpm test:e2e:layout
node scripts\parity\run.mjs --suite=layout-provider --viewports=1440x1000,994x935,390x844 --chromePort=9381 --retries=1 --dump
pnpm typecheck
git diff --check
```

Results:

- Playwright POC: `17 passed`, `1 skipped`, `20.1s`.
- Legacy `layout-provider`: `72/72` checks passed, `31.6s`.
- `pnpm typecheck`: passed.
- `git diff --check`: passed.

Code size comparison:

- Legacy six profile files: `384` lines.
- Playwright spec + helpers: `183` lines, `52.3%` reduction.
- Playwright spec + helpers + one-time config: `244` lines, `36.5%`
  reduction.

The POC did not fully replace the reference/diff workflow. It replaces the
local execution/assertion layer more cleanly than the custom CDP runner.

## Early Finding

The mobile layout tabs contract differed from the legacy profile during the POC.
The old `layout-tabs` profile clicked hidden desktop sidebar DOM at mobile
width, while the visible mobile drawer did not receive `nav.tabs`.

That gap has since been resolved by passing `nav` through
`DocsLayoutShell -> DocsMobileNav -> DocsSidebar`. Playwright now verifies the
visible mobile drawer tabs directly. The finding remains useful because it
shows why Playwright should verify visible user contracts, while the legacy
runner can still inspect hidden implementation DOM when needed.

Additional finding:

- Playwright caught a real mobile interaction bug: `.docs-mobile-nav-trigger`
  was visible but covered by `.docs-shell-content`, so a real click was
  intercepted. The custom parity runner missed this because it used
  programmatic `element.click()`.
- The fix was to define mobile grid areas for `.docs-mobile-nav` and
  `.docs-shell-content`, preventing overlap in the mobile shell.

## Recommendation

Proceed with a gradual migration:

1. Keep `scripts/parity/run.mjs` for reference probes and not-yet-migrated
   profiles.
2. Migrate local verification for high-interaction profiles to Playwright:
   `theme`, `page-actions`, `toc-responsive`, `code-block`.
3. Use Playwright for actionability-sensitive behavior and responsive visible
   UX.
4. Keep legacy parity for hidden DOM inspection and remote/reference
   comparison until each surface has an equivalent Playwright contract.

## Migration Model

The durable model is:

- Contract cards define what to verify.
- Playwright verifies local visible behavior, actionability, ARIA, layout boxes,
  responsive projects, and user interactions.
- The legacy parity runner remains a reference/probe layer for hidden DOM,
  source/reference collection, and profiles not migrated yet.

Do not keep expanding one large verification file. Each migrated surface should
have a dedicated spec and, when needed, a small reusable helper.

## Playwright Entrypoints

- `pnpm test:e2e:layout`: root provider, layout slots, sidebar provider,
  layout tabs, home layout, and not-found.
- `pnpm test:e2e:shell`: layout provider plus theme, responsive TOC, and
  sidebar shell contracts.
- `pnpm test:e2e:toc`: desktop TOC rail plus responsive TOC popover.
- `pnpm test:e2e:content`: prose defaults, code block, and content component
  contracts.
- `pnpm test:e2e:components`: docs content primitives only.
- `pnpm test:e2e:page`: page actions, preview, feedback, and pager.
- `pnpm test:e2e:fast`: Playwright equivalent of the old local
  `fast-regression` intent.
- `pnpm test:e2e:full`: all migrated Playwright local checks.

The old runner keeps these commands for comparison and reference sampling:

```bash
node scripts/parity/run.mjs --suite=layout-provider --viewports=1440x1000,994x935,390x844 --chromePort=9381 --retries=1 --dump
node scripts/parity/run.mjs --suite=fast-regression --viewports=1440x1000,994x935,390x844 --chromePort=9382 --retries=1 --dump
```

## Migration Matrix

| Legacy profile | Playwright spec | Local status | Legacy runner role |
| --- | --- | --- | --- |
| `root-provider` | `tests/e2e/layout-provider.spec.ts` | migrated-local | keep-probe |
| `layout-slots` | `tests/e2e/layout-provider.spec.ts` | migrated-local | keep-probe |
| `sidebar-state` | `tests/e2e/layout-provider.spec.ts` | migrated-local | keep-probe |
| `layout-tabs` | `tests/e2e/layout-provider.spec.ts` | migrated-local | keep-probe |
| `home-layout` | `tests/e2e/layout-provider.spec.ts` | migrated-local | keep-probe |
| `not-found` | `tests/e2e/layout-provider.spec.ts` | migrated-local | keep-probe |
| `theme` | `tests/e2e/theme.spec.ts` | migrated-local | keep-probe |
| `prose-defaults` | `tests/e2e/prose-defaults.spec.ts` | migrated-local | keep-probe |
| `code-block` | `tests/e2e/code-block.spec.ts` | migrated-local | keep-probe |
| `toc-responsive` | `tests/e2e/toc-responsive.spec.ts` | migrated-local | keep-probe |
| `sidebar` | `tests/e2e/sidebar.spec.ts` | migrated-local | keep-probe |
| `page-actions` | `tests/e2e/page-actions.spec.ts` | migrated-local | keep-probe |
| `callout` | `tests/e2e/content-components.spec.ts` | migrated-local | keep-probe |
| `tabs` | `tests/e2e/content-components.spec.ts` | migrated-local | keep-probe |
| `accordion` | `tests/e2e/content-components.spec.ts` | migrated-local | keep-probe |
| `cards` | `tests/e2e/content-components.spec.ts` | migrated-local | keep-probe |
| `files` | `tests/e2e/content-components.spec.ts` | migrated-local | keep-probe |
| `inline-toc` | `tests/e2e/content-components.spec.ts` | migrated-local | keep-probe |
| `type-table` | `tests/e2e/content-components.spec.ts` | migrated-local | keep-probe |
| `steps` | `tests/e2e/content-components.spec.ts` | migrated-local | keep-probe |
| `heading` | `tests/e2e/content-components.spec.ts` | migrated-local | keep-probe |
| `preview` | `tests/e2e/content-components.spec.ts`, `tests/e2e/page-actions.spec.ts` | migrated-local | keep-probe |
| `feedback` | `tests/e2e/page-actions.spec.ts` | migrated-local | keep-probe |
| `pager` | `tests/e2e/page-actions.spec.ts` | migrated-local | keep-probe |
| `toc` | `tests/e2e/toc.spec.ts` | migrated-local | keep-probe |

Status meaning:

- `migrated-local`: Playwright is the daily local regression source.
- `partial`: Playwright covers the visible user contract, but the old profile
  still owns hidden DOM or finer profile-specific assertions.
- `not-started`: legacy runner is still the primary executable check.

After the final local migration pass, no legacy `full-regression` profile is
`not-started` or `partial` for local visible behavior. The legacy runner remains
as a reference/probe layer, not the daily local regression source.

## Migration Checklist

For each remaining profile:

1. Read the old profile and source references.
2. Extract the user-visible contract into a dedicated Playwright spec.
3. Keep hidden DOM/source sampling in the legacy profile unless it becomes a
   visible behavior requirement.
4. Run the new spec.
5. Run the old profile once as a comparison sample.
6. Record result, timing, and any contract decisions in this document.

## Current Fast Regression Migration

The first migration batch maps the old local `fast-regression` intent to
Playwright:

- `theme`
- `prose-defaults`
- `code-block`
- `toc-responsive`
- `sidebar`
- `page-actions`

This batch intentionally uses separate specs instead of one `fast-regression`
spec. The command groups them for day-to-day use while keeping each contract
small enough to inspect and maintain.

## Current Full Migration Results

Commands run:

```bash
pnpm test:e2e:layout
pnpm test:e2e:shell
pnpm test:e2e:components
pnpm test:e2e:full
pnpm test:e2e:fast
pnpm test:e2e:content
pnpm test:e2e:toc
pnpm test:e2e:page
node scripts\parity\run.mjs --suite=layout-provider --viewports=1440x1000,994x935,390x844 --chromePort=9384 --retries=1 --dump
pnpm typecheck
pnpm validate:links
git diff --check
```

Results:

- `pnpm test:e2e:layout`: `18 passed`, `23.4s`.
- `pnpm test:e2e:shell`: `46 passed`, `8 skipped`, `53.6s`.
- `pnpm test:e2e:components`: `30 passed`, `31.1s`.
- `pnpm test:e2e:full`: `91 passed`, `8 skipped`, `1.4m`.
- `pnpm test:e2e:fast`: `39 passed`, `6 skipped`, `44.8s`.
- `pnpm test:e2e:content`: `39 passed`, `42.1s`.
- `pnpm test:e2e:toc`: `10 passed`, `5 skipped`, `18.9s`.
- `pnpm test:e2e:page`: `6 passed`, `9.4s`.
- legacy `layout-provider`: `72/72` checks passed.
- `pnpm typecheck`: passed.
- `pnpm validate:links`: passed, `25` pages and `11` links.
- `git diff --check`: passed.

Skips are viewport contract branches, not missing local coverage:

- desktop does not run mobile drawer/popover-only checks.
- mobile does not run persistent desktop sidebar pin checks.
- layout tabs now run against the visible desktop sidebar and mobile drawer.

Closeout notes:

- The old `layout-tabs` partial was resolved by passing `nav` through
  `DocsMobileNav` into the visible mobile `DocsSidebar`.
- Playwright full regression exposed an invalid split callout title structure:
  `DocCalloutTitle` rendered a `<p>` around MDC content that could itself be
  paragraph-wrapped. The component now renders a block wrapper and the spec
  targets the visible `Container API` callout instead of relying on a fixed
  array index.
- After `pnpm typecheck`, `pnpm dev:health` returned `404`; a health-backed
  restart restored the dev server before the remaining runtime checks.

## Execution Rules

- Keep default `workers` bounded (`4` local, `2` CI) so Nuxt dev hydration stays
  deterministic under Playwright load. Use `PLAYWRIGHT_WORKERS` or
  `--workers` only for explicit stress/measurement runs.
- Do not run `pnpm typecheck` in parallel with Playwright. `nuxi typecheck`
  can disturb the Nuxt dev/content state while browser tests are loading pages.
- After typecheck, always run a route-specific dev health check before any
  Playwright or legacy parity runtime check. Restart only if health fails with
  `404`, Nuxt error output, request timeout, stale/wrong server evidence, or
  Nuxt Content SQLite errors.
- In the Codex bridge shell, if `pnpm` tries to perform an interactive
  dependency reinstall before script execution, use direct commands:
  `node scripts/dev-server.mjs ...`, `node scripts/parity/run.mjs ...`, and
  `.\node_modules\.bin\playwright.cmd ...`.
- For content-heavy specs that show shared Nuxt Content database instability,
  rerun the focused case with `PLAYWRIGHT_WORKERS=1` or `--workers=1` before
  treating it as a component regression.
- Runtime checks can run in parallel with lightweight file reads, but not with
  Nuxt build/typecheck/generate commands.

## Worker and Hydration Tuning

Date: 2026-07-04.

Changes made:

- Removed the centralized `page.waitForTimeout(500)` hydration delay.
- Added `app/plugins/docs-ready.client.ts` as the Nuxt client ready marker.
- `waitForNuxtHydration()` now waits for the Vue root plus
  `data-docs-hydrated="true"`.
- The ready marker uses `app:suspense:resolve` for initial hydration,
  `page:start` / `page:finish` for later route transitions, a version guard
  against stale async writes, and two animation frames before marking ready.
- `gotoDocsFixture()` now waits for `load` instead of only
  `domcontentloaded`.
- Viewport-only skips run before navigation in sidebar/TOC specs.
- `content-components` no longer has a file-level `beforeEach` navigation; each
  test calls the fixture helper once after any test-local setup.
- `PLAYWRIGHT_WORKERS` can override the local default without changing config.

Observed before the final ready marker:

- `pnpm test:e2e:components -- --workers=6`: `29 passed`, `1 failed`,
  `32.6s`; the mobile TypeTable click focused the trigger but did not open it.
- Earlier `--workers=10` components runs failed on tabs/files/heading-copy
  interactions, showing the same first-click-before-interactive pattern.

Observed after the final ready marker:

| Command | Result | Time | Decision |
| --- | --- | --- | --- |
| `pnpm test:e2e:components -- --workers=6` | `30 passed` | `34.8s` | stable focused stress |
| `pnpm test:e2e:components -- --workers=10` | `30 passed` | `38.1s` | stable, not faster |
| `pnpm test:e2e:full` after restart | `91 passed`, `8 skipped` | `2.4m` | cold/warmup run only |
| `pnpm test:e2e:full -- --workers=6` | `91 passed`, `8 skipped` | `1.5m` | stable opt-in stress |
| `pnpm test:e2e:full -- --workers=10` | `91 passed`, `8 skipped` | `2.5m` | stable but slower |
| `pnpm test:e2e:full` warm | `91 passed`, `8 skipped` | `1.3m` | fastest daily default |

Conclusion:

- The previous flake came from an over-eager app-level ready signal, not from
  Playwright itself.
- `app:suspense:resolve` plus two animation frames is sufficient for the current
  local visible contract checks; `requestIdleCallback` was tested and rejected
  because it made full regression much slower under parallel load.
- Do not raise the default worker count. `4` remains the fastest daily setting
  in the measured warm full run.
- `6` and `10` are now valid opt-in stress values, but `10` is slower on this
  Nuxt dev setup and should not be used as the default.
- Further route reuse inside tests is not recommended because it would reduce
  Playwright isolation. Prefer focused commands and a warm dev server for speed.
