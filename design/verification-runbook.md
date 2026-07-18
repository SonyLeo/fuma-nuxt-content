---
title: Verification Runbook
sectionLabel: Guide
status: active
type: runbook
owner: quality
lastReviewed: 2026-07-18
---

# Verification Runbook

## Agent Quick Start

Use the smallest check that can disprove the change:

- documentation/config only: inspect the diff and run the relevant validator;
- content identity or Markdown structure: run a focused Nuxt/Vitest test;
- interaction, hydration, responsive, focus, scroll, or geometry: run focused
  Playwright;
- milestone/main confidence: run `pnpm test:e2e:full`.

Playwright starts or reuses Nuxt automatically. Do not add a manual `pnpm dev`,
`app:check`, managed dev-server, or wrapper prerequisite.

## Batch Verification Ownership

The execution Agent runs one final closeout against its final implementation
state and reports the exact commands. Run formatting, lint, and diff review
before that closeout so mechanical cleanup does not cause a second full pass.

The coordinator reviews the actual diff and acceptance contract. It does not
replay the complete execution matrix by default; it reruns the single check
most likely to disprove the change, or a check invalidated by a review fix.

| Change after evidence          | Checks invalidated                          |
| ------------------------------ | ------------------------------------------- |
| Documentation only             | docs validator and formatting               |
| Formatting only                | formatting and diff check                   |
| Test-only change               | affected test and static checks             |
| Local production behavior      | affected focused test; typecheck if typed   |
| Shared protocol/infrastructure | affected suite plus its closeout gate       |
| Phase or pre-merge closeout    | complete runtime and browser milestone gate |

One batch uses one execution task. A review correction stays in that task and
runs only the invalidated checks. A new batch starts a new task.

## Verification Layers

### Static and tooling checks

Use `typecheck`, the relevant validator, changed-file ESLint/Prettier, and
`git diff --check` for documentation, configuration, pure utilities, type
boundaries, and diff quality.

Do not run browser tests for prose-only changes unless the prose is itself a
browser fixture or changes a tested contract.

### Nuxt runtime tests

Entry:

```powershell
pnpm test:nuxt -- tests/nuxt/docs-page-identity.nuxt.spec.ts
pnpm test:nuxt -- --exclude tests/nuxt/docs-metadata-persistence.nuxt.spec.ts
pnpm test:nuxt
```

Runtime tests own contracts that do not require a real browser:

- source/route/page identity
- page-tree transformation helpers
- content rendering structure
- Markdown transform output
- normalized data contracts

Nuxt Content runtime specs share generated content artifacts and SQLite state.
Do not run them concurrently in one checkout; serialize focused specs. Retry a
plausibly transient `database is locked` failure once with the same command.

The persistence spec performs an isolated production build and adds about
45–70 seconds on the current Windows baseline. Exclude it for ordinary batches.
Run it directly for Content hooks, transformers, collection schemas,
SQL-facing metadata, or its isolation; run complete `test:nuxt` once at a phase
or pre-merge milestone.

```powershell
pnpm test:nuxt -- tests/nuxt/docs-metadata-persistence.nuxt.spec.ts
```

### Focused Playwright

Entry:

```powershell
pnpm test:e2e -- tests/e2e/sidebar.spec.ts --project=chromium-desktop
pnpm test:e2e -- tests/e2e/theme.spec.ts tests/e2e/layout-provider.spec.ts `
  --project=chromium-desktop --project=chromium-mobile --workers=1
```

Prefer one invocation containing the affected files and projects so they share
one `webServer` lifecycle. Use separate invocations only when project-specific
collection would add materially unrelated coverage.

Use Playwright for:

- hydration and client navigation
- visible interaction and actionability
- focus, keyboard, Escape, outside dismissal
- dialog, popover, drawer and scroll lock
- responsive layout and viewport geometry
- active scroll state
- touch/mobile behavior

### Full browser gate

Entry:

```powershell
pnpm test:e2e:full
```

Use once for a phase/milestone, main gate, infrastructure, broad CSS, or
pre-merge confidence. It is not a per-batch or review default.

## Service Lifecycle

Playwright `webServer` is the only automatic E2E service owner.

- If no healthy local E2E server exists, Playwright starts Nuxt.
- Locally, a healthy server may be reused.
- Playwright stops only the process it started.
- `PLAYWRIGHT_TEST_BASE_URL` disables automatic startup and targets an
  externally owned server.
- External callers own external server startup and cleanup.

Retired dev-server wrappers, Playwright wrappers, check-app helpers, and
`app:check` must not return.

## Build Directory Isolation

| Consumer           | Build directory   |
| ------------------ | ----------------- |
| Normal development | `.nuxt`           |
| Typecheck          | `.nuxt-typecheck` |
| Playwright E2E     | `.nuxt-e2e`       |

Rules:

- never point typecheck or E2E at the normal dev build directory;
- shared runtime modules must not depend on build-directory depth;
- use Nuxt aliases such as `#shared` for shared application modules;
- a test command must not repair, restart, or mutate an unrelated dev server.

## Package Script Policy

Testing package scripts remain limited to `test:nuxt`, `test:e2e`, and
`test:e2e:full`.

Do not add surface-specific scripts. Select files, tags, projects, workers,
repeat counts, or shards through Playwright arguments.

## Viewport Ownership

Projects use semantic title tags.

| Tag             | Projects                 | Use for                                                     |
| --------------- | ------------------------ | ----------------------------------------------------------- |
| no viewport tag | desktop                  | viewport-independent contract                               |
| `@responsive`   | desktop, tablet, mobile  | behavior or layout meaningful at all three widths           |
| `@narrow`       | tablet, mobile           | shared narrow-layout branch                                 |
| `@tablet`       | desktop baseline, tablet | persistent/wide behavior requiring tablet boundary coverage |
| `@mobile`       | mobile                   | drawer, overlay, touch, mobile header, mobile-only geometry |

Current collection baseline:

| Project | Tests |
| ------- | ----: |
| Desktop |    39 |
| Tablet  |    23 |
| Mobile  |    26 |
| Total   |    88 |

Authoring rules:

- decide viewport ownership before adding a test;
- do not copy every semantic test into all three projects;
- use project filtering instead of collecting an inapplicable test and then
  calling `test.skip()`;
- update the recorded baseline only after `--list` and full regression agree.

## Workers And Parallelism

- Local full regression uses two workers.
- Focused tests may override workers.
- Do not derive workers from the machine CPU count automatically.
- All local browser workers share one Nuxt Content server, so more workers can
  increase navigation instability without improving wall time.
- Do not run multiple full local Nuxt shard servers as the default workflow.

Examples:

```powershell
pnpm test:e2e -- tests/e2e/sidebar.spec.ts --workers=1
pnpm test:e2e -- --grep '@fast' --workers=4
```

## CI Gate And Sharding

The repository workflow is `.github/workflows/verify.yml`.

Pull requests run:

- typecheck
- Nuxt runtime tests
- documentation link validation
- documentation governance validation
- desktop `@fast` Playwright gate

Main pushes and manual runs additionally execute the full E2E matrix as two
independent shards:

```text
shard 1/2: 44 tests
shard 2/2: 44 tests
```

Each shard:

- runs on its own runner;
- installs Chrome;
- starts its own isolated `.nuxt-e2e` server;
- emits a blob report.

The merge job downloads both blob artifacts, runs `playwright merge-reports`,
and uploads one HTML report.

## Test Authoring Standard

- Prefer role, accessible name, label, or stable project-owned data attributes.
- Use CSS selectors only when the CSS/DOM contract itself is under test.
- Use web-first assertions; do not add fixed sleeps.
- Navigate docs fixtures through `gotoDocsFixture()` so hydration handling is
  consistent.
- Keep one independent surface or behavior per test.
- Extract repeated interaction into focused helpers.
- Use stable fixtures and semantic expectations, not arbitrary content counts.
- When a downstream Markdown owner consumes transformed input, run prerequisite
  transforms in production order and include a fixture that fails if one is
  omitted.
- Test public state: role, `aria-*`, `data-state`, visibility, focus, geometry,
  and navigation outcome.
- Do not depend on test order or state left by another page.
- Add a tag for the contract (`@fast`, `@shell`, `@content`, etc.) and a
  viewport tag only when applicable.

## Change-To-Verification Matrix

| Change                                 | Minimum check                                           |
| -------------------------------------- | ------------------------------------------------------- |
| Documentation text                     | diff + `validate:docs`                                  |
| Content route/link/source identity     | focused runtime + `validate:links`                      |
| Markdown transform                     | focused runtime test; browser only for browser behavior |
| Sidebar desktop                        | desktop sidebar spec                                    |
| Sidebar drawer/touch                   | mobile sidebar spec                                     |
| TOC rail                               | desktop TOC spec                                        |
| TOC popover/narrow shell               | tablet/mobile responsive TOC spec                       |
| Theme/provider/layout                  | focused project tests                                   |
| Content component semantics            | desktop component test                                  |
| Content component layout               | tagged responsive component test                        |
| BuildDir or Playwright config          | typecheck + cold focused E2E + port cleanup             |
| CI sharding/reporting                  | shard lists + blob report merge validation              |
| Broad shell/CSS or test infrastructure | focused checks, then full gate                          |

## Failure Classification

| Failure signature                    | First classification                                     |
| ------------------------------------ | -------------------------------------------------------- |
| `webServer` timeout                  | Nuxt startup, route 500, port owner                      |
| hydration timeout                    | cold Vite optimize, reload, client error                 |
| `ERR_ABORTED` / frame detached       | server rebuild or concurrency pressure                   |
| missing content table / SQLite error | Nuxt Content database evidence                           |
| locator/actionability failure        | overlay, visibility, disabled state, z-index             |
| geometry/overflow failure            | viewport tag, breakpoint, layout contract                |
| assertion mismatch                   | fixture, expected contract, or implementation regression |
| CI-only failure                      | runner resources, browser install, shard artifact        |

Retry the same focused command once only when the signature is plausibly
transient. Do not hide a stable failure with broad retries.

## Gate Vocabulary

- `Focused Passed`: the smallest relevant spec passed.
- `Runtime Passed`: the relevant Nuxt/Vitest contract passed.
- `Full Passed`: the complete local browser matrix passed.
- `CI Gate Passed`: the repository workflow and report merge passed remotely.

Reports must name the gate actually executed. A focused pass is not evidence of
full or CI completion.
