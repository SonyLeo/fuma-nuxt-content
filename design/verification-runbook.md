---
title: Verification Runbook
sectionLabel: Guide
---

# Verification Runbook

## Purpose

This is the active entry point for local verification. Historical Playwright
migration results and benchmarks remain in `playwright-verification-plan.md`.

Playwright owns the E2E app server by default. It reuses a healthy local server
when one already exists, otherwise starts Nuxt before the tests and stops the
process it launched afterward. `PLAYWRIGHT_TEST_BASE_URL` opts into an external
server and disables automatic startup.

## Stable Commands

```powershell
pnpm typecheck
pnpm test:nuxt
pnpm validate:links
pnpm test:e2e -- <Playwright arguments>
pnpm test:e2e:full
```

`pnpm typecheck` uses `.nuxt-typecheck`, separate from the dev server's `.nuxt`
directory.

## Daily Flow

### Static or runtime-only changes

1. Inspect the changed contract and diff.
2. Run the smallest relevant Nuxt runtime spec when one exists.

   ```powershell
   pnpm test:nuxt -- tests/nuxt/docs-page-identity.nuxt.spec.ts
   ```

3. Run `pnpm typecheck` once at batch closeout.
4. Run `pnpm validate:links` only for content, route, link, or page identity
   changes.

### Browser behavior changes

1. Run one focused file, tag, or project. Playwright starts or reuses the app:

   ```powershell
   pnpm test:e2e -- tests/e2e/sidebar.spec.ts --project=chromium-desktop
   pnpm test:e2e -- --grep '@shell' --project=chromium-desktop
   pnpm test:e2e -- tests/e2e/toc-responsive.spec.ts --project=chromium-mobile
   pnpm test:e2e -- tests/e2e/content-components --workers=1
   ```

2. Use `pnpm test:e2e:full` only for milestone or pre-merge confidence.

`test:e2e:full` intentionally uses two workers. The suite shares one Nuxt
Content server, so maximizing browser workers increases navigation instability
without removing the server-side bottleneck. Focused runs may override workers
through Playwright arguments or `PLAYWRIGHT_WORKERS`.

The full suite uses viewport-aware tags instead of replaying every contract in
every project:

- desktop runs the complete baseline except `@mobile` and `@narrow` tests;
- tablet runs `@responsive`, `@narrow`, and `@tablet` tests;
- mobile runs `@responsive`, `@narrow`, and `@mobile` tests;
- untagged tests are viewport-independent and run on desktop only.

Keep these tags semantic: `@responsive` means all three viewport contracts,
`@narrow` means tablet plus mobile, and project-specific tags select one
responsive branch in addition to the desktop baseline when appropriate.

## Repository Gate

`.github/workflows/verify.yml` is the repository-level verification entry:

- pull requests run typecheck, Nuxt runtime tests, link validation, and the
  desktop `@fast` browser gate;
- pushes to `main` and manual workflow runs split the full E2E suite across two
  independent shards;
- CI installs Chrome and lets Playwright start the isolated `.nuxt-e2e` server;
- shard jobs publish blob reports, and a final job merges them into one HTML
  Playwright report.

The tracked `pnpm-lock.yaml` and `packageManager` field keep dependency
installation and the pnpm tooling version deterministic. CI installs with
`--frozen-lockfile` and uses the lockfile for pnpm store caching.

## Failure Classification

- Playwright webServer startup fails: inspect the Nuxt startup error or stale
  port owner before changing UI code.
- Nuxt runtime test fails: inspect rendering/data contracts before opening a
  browser.
- Playwright navigation or hydration fails: retry the same focused command once
  before widening scope.
- Content-heavy instability: rerun the same files with `--workers=1`.
- SQLite missing-table or corruption evidence: repair the content cache
  explicitly; do not treat every health failure as a database failure.

## Boundaries

- `test:e2e` is the only parameterized Playwright entry point.
- `test:e2e:full` is the only named Playwright suite entry point.
- Surface-specific combinations belong in command arguments, not
  `package.json`.
- Playwright uses `.nuxt-e2e`; typecheck uses `.nuxt-typecheck`; normal local
  development continues to use `.nuxt`.
- Legacy parity profiles are for reference capture, hidden DOM inspection, or
  surfaces without a Playwright contract.
