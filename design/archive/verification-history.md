---
title: Verification History
sectionLabel: Archive
status: historical
type: archive
owner: quality
lastReviewed: 2026-07-12
---

# Verification History

## Migration Summary

The project originally relied heavily on a custom parity/CDP execution layer
and manually managed Nuxt services. This evolved through several stages:

1. parity profiles established semantic and geometry contracts;
2. Playwright POCs covered layout/provider and interaction behavior;
3. browser contracts moved into focused Playwright specs;
4. the custom Playwright wrapper and managed dev-server script were retired;
5. Playwright `webServer` became the E2E service owner;
6. runtime-only contracts moved into Nuxt/Vitest tests;
7. viewport-aware project filtering and CI sharding reduced duplicate work.

## Current Baseline History

- Package scripts were reduced to `test:nuxt`, parameterized `test:e2e`, and
  `test:e2e:full`.
- Typecheck moved to `.nuxt-typecheck`.
- E2E moved to `.nuxt-e2e`.
- Cold Playwright startup and cleanup were verified.
- Existing-server reuse was verified with a stable listener PID that remained
  alive after the test.
- Full regression stabilized at two local workers.
- Viewport-aware filtering reduced collection from 132 to 88 tests.
- Current project distribution is desktop 39, tablet 23, mobile 26.
- CI full regression is split into two balanced shards of 44 tests.
- Blob reports and HTML report merging were verified locally.

## Performance Findings

- Raising local workers increased navigation instability without removing the
  shared Nuxt Content bottleneck.
- Reducing duplicate viewport runs improved matrix quality more than local wall
  time; cold startup and navigation remain dominant.
- CI sharding across independent runners is the preferred wall-clock
  optimization.

## Retired Entrypoints

- `scripts/dev-server.mjs`
- `scripts/run-playwright.mjs`
- `scripts/check-app.mjs`
- `app:check`
- surface-specific E2E package scripts

Historical references to these names are not current instructions.

## Current Source Of Truth

Use [Verification Runbook](../verification-runbook.md) for all executable
policy, commands, authoring rules, failure classification, and CI behavior.
