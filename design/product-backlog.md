---
title: Product Backlog
sectionLabel: Plan
status: active
type: backlog
owner: product
lastReviewed: 2026-07-19
---

# Product Backlog

## Purpose

This is the single source of truth for unfinished integration and product
composition work. Completed first-pass capabilities are summarized once and
are not repeated as active phases.

Product work must consume foundation contracts through config, adapters,
server routes, output routes, and slots. It must not repair foundation by
rewriting sidebar, TOC, page tree, Markdown components, or layout ownership.

## Completed Baseline

The following have a first-pass implementation:

- site configuration and config-to-layout adapter
- navigation links schema
- Git metadata helpers and source/edit links
- Copy Markdown action
- local search shell and local index
- static feedback UI
- sitemap, canonical and Open Graph metadata
- `llms.txt`
- image rendering safety baseline
- documentation link validation

These are `First Pass`, not evidence that the corresponding product area is
complete.

## Priority Backlog

### P0: integration completion

| Capability                 | Current state                           | Acceptance direction                                            |
| -------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| Remote search provider/API | Provider + API transport; local default | Provider selection, payload cutover, loading/error E2E          |
| Feedback backend           | Static local state                      | Configurable submit adapter or GitHub issue flow, failure state |
| RSS                        | Missing                                 | Stable feed route, metadata mapping, validation fixture         |
| `llms-full.txt`            | Basic `llms.txt` only                   | Full-content output with deterministic ordering                 |
| Per-page Markdown export   | Copy action reads source                | Stable route/output contract and source identity mapping        |
| Image CDN adapter          | Local image baseline                    | Optional adapter without changing content component API         |

### P1: multi-source baseline

Define source, route, metadata, navigation, and output boundaries for:

- docs
- blog
- changelog
- API reference

Acceptance direction:

- source types are explicit
- route ownership is deterministic
- shared layout consumes normalized data
- one source cannot silently alter another source's page tree
- links and generated outputs are validated

### P2: site product composition

- blog and changelog presentation
- API reference composition
- story and playground runtime
- AI/MCP/docs assistant surfaces
- versioning and i18n
- OpenAPI and AsyncAPI integrations

These begin only after the relevant integration and source contracts are
`Gate Passed`.

## Product Boundaries

- Search ranking/provider logic stays outside shell components.
- Feedback transport stays outside `DocsPage`.
- SEO and generated outputs are server/product concerns.
- Product config may produce foundation props; foundation components do not
  read product config directly.
- New product surfaces reuse the established theme, layout, page, link, code,
  and content contracts.

## Recommended Order

1. With the foundation gate passed, complete integration P0 in listed order.
2. Establish multi-source baseline.
3. Build blog/changelog/API composition.
4. Add story/playground and AI-assisted surfaces.
5. Add versioning/i18n and schema-driven API integrations.

## Product Gate

A backlog item can move to implementation only when it has:

- a clear foundation dependency
- an owner and data/config contract
- route and output ownership
- focused verification path
- explicit deferred scope
- no requirement to rewrite a foundation contract implicitly
