---
title: Architecture Decisions
sectionLabel: Record
status: active
type: record
owner: architecture
lastReviewed: 2026-07-12
---

# Architecture Decisions

## Purpose

This file contains only decisions that remain active. Execution logs and
superseded experiments belong in Git history or the archive summaries.

## D001: Vue-first Fumadocs alignment

- Use Nuxt 4, Vue 3, TypeScript, and `@nuxt/content`.
- Borrow Fumadocs protocols and UI semantics, not React implementation details.
- Use assistant-ui as a shell-density reference, not as a product architecture
  source.
- Keep TinyRobot examples out of foundation architecture decisions.

## D002: Foundation before product composition

- Foundation owns content, tree, layout, page, theme, content components,
  tokens, and interaction substrate.
- Integration owns config, adapters, server routes, generated outputs, and
  providers.
- Product composition owns concrete site experiences.
- Product work cannot silently patch foundation gaps.

## D003: Separate source and route identity

- Content query identity, source file identity, and route identity are distinct.
- Nested `index` files keep their real source identity while routes may collapse
  the index segment.
- Production runtime and validation tooling share the same identity helpers.

## D004: Normalize page-tree consumers

- `DocsNode[]` is the project navigation protocol.
- Visible tree and context tree have different inclusion rules.
- Sidebar, breadcrumbs, pager, search context, and homepage navigation consume
  the normalized runtime rather than raw Nuxt Content navigation.

## D005: Explicit provider/layout/page ownership

- Root shared state belongs to `DocsRootProvider`.
- Layouts consume normalized options and slots.
- Pages compose article-adjacent surfaces without reading product config.
- Home and not-found reuse shared layout contracts.

## D006: Theme state lives at the document root

- Root `.dark` and `data-docs-theme*` attributes are the source of truth.
- Theme switches are synchronized consumers.
- Presets override semantic variables, not component-local palettes.
- Product theme adapters remain outside the foundation runtime.

## D007: CSS ownership is layered

- `tokens.css`: tokens only.
- `shell.css`: shell and page-adjacent layout.
- `prose.css`: generic Markdown output.
- `content.css`: docs content components.
- Avoid component-local values when a semantic token exists.

## D008: Reka stays behind local wrappers

- Feature components consume local `Ui*` APIs.
- Reka owns interaction mechanics, not docs data contracts.
- Public wrapper APIs and styling hooks remain project-owned.
- Reka Tree remains evidence-gated and deferred.

## D009: Playwright owns E2E server lifecycle

- Playwright `webServer` starts or reuses the E2E Nuxt server.
- Tests stop only the process they start.
- `PLAYWRIGHT_TEST_BASE_URL` opts into an externally owned server.
- `.nuxt`, `.nuxt-typecheck`, and `.nuxt-e2e` remain isolated.
- Managed dev-server wrappers and manual app-check prerequisites stay retired.

## D010: Browser coverage is viewport-aware

- Untagged contracts run on desktop.
- `@responsive` runs on all projects.
- `@narrow` runs on tablet and mobile.
- `@tablet` covers desktop baseline plus tablet.
- `@mobile` runs only on mobile.
- Local full regression uses two workers; CI full regression uses two shards.

## D011: Documentation has one source of truth per topic

- `roadmap.md` owns current priority and navigation.
- `foundation-status.md` owns foundation maturity.
- `product-backlog.md` owns unfinished product work.
- `component-inventory.md` owns component status.
- `verification-runbook.md` owns all test policy and commands.
- Completed plans are closed after durable decisions are extracted.
- Git history preserves full superseded plans; the repository keeps only
  curated historical summaries.

## Decision Maintenance

- Add a decision only when it changes a durable boundary.
- Update `lastReviewed` when decisions are revalidated.
- Mark a superseded decision explicitly before replacing it.
- Do not append command output, batch logs, or transient failures here.
