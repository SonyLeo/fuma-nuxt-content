---
title: Roadmap
sectionLabel: Plan
status: active
type: roadmap
owner: project
lastReviewed: 2026-07-19
---

# Roadmap

## Current Objective

Build a stable Vue-first documentation foundation aligned with Fumadocs
protocols before expanding product composition.

Foundation hardening is complete: Phase 2 authoring/code contracts and Phase 3
component, shell, and primitive contracts passed the Foundation Exit Gate.
The next priority is Product Backlog P0 integration; it has not started.

## Active Sources Of Truth

| Topic                               | Document                                                          |
| ----------------------------------- | ----------------------------------------------------------------- |
| Current priority and document map   | This file                                                         |
| Foundation maturity and exit gate   | [Foundation Status](./foundation-status.md)                       |
| Foundation audit method and handoff | [Foundation Audit Handbook](./foundation-audit-handbook.md)       |
| Unfinished integration/product work | [Product Backlog](./product-backlog.md)                           |
| Component and regression status     | [Component Inventory](./component-inventory.md)                   |
| Test policy and commands            | [Verification Runbook](./verification-runbook.md)                 |
| Authoring and code contracts        | [Authoring And Code Contracts](./authoring-and-code-contracts.md) |
| Remaining Reka work                 | [Reka Migration](./reka-migration.md)                             |
| Durable architecture decisions      | [Architecture Decisions](./decisions.md)                          |

Historical summaries live under `design/archive/` and are not active execution
inputs.

## Layer Boundaries

### Foundation

Owns:

- content and metadata protocol
- source/route/page identity
- page tree and context tree
- provider, layout, page, theme, and slots
- Markdown/MDC mapping and transforms
- docs shell and content components
- interaction wrappers and CSS layers
- verification substrate

### Integration

Owns:

- site config and adapters
- search/feedback providers
- server routes and generated outputs
- RSS, LLM exports, Markdown export
- image/CDN adapters
- multi-source loading

### Product composition

Owns:

- blog, changelog, API experiences
- story/playground
- AI/MCP/docs assistant
- versioning and i18n
- OpenAPI/AsyncAPI composition

Upper layers consume foundation contracts; they do not patch foundation
implicitly.

## Current Priority

### P0: integration completion

Remote search provider/API is Gate Passed.

1. feedback backend or GitHub issue flow
2. RSS
3. `llms-full.txt`
4. per-page Markdown export
5. image CDN adapter

### P1: multi-source baseline

1. docs/blog/changelog/API source boundary
2. deterministic route, metadata, navigation, and output ownership

### P2: product composition

1. blog/changelog/API presentation
2. story/playground and AI/MCP/docs assistant
3. versioning/i18n and schema-driven API integrations

Start from the ordered Product Backlog. Keep provider, transport, output, and
adapter ownership outside foundation; reopen it only for a proven defect.

## Reference Comparison Rule

The local Nuxt UI v4 baseline is `D:\Projects\Learning\gh\ui` at the
Coordinator-verified `v4` commit. Use pinned Fumadocs for protocol ownership and
Nuxt UI for Nuxt/MDC, Shiki, Reka, and ARIA evidence when relevant. Classify
results as direct reference, Nuxt adaptation, intentional divergence, defer,
or stop-condition evidence. Comparison does not authorize dependency migration
or visual rewriting.

## Working Rules

- Use `Draft`, `First Pass`, `Gate Passed`, and `Product Ready`.
- Advance one layer at a time.
- Use the smallest relevant verification during iteration.
- Close completed plans after extracting durable decisions.
- Do not create another roadmap; add a distinct active document only when its
  ownership cannot fit an existing source of truth.
- Keep full historical detail in Git, not active planning files.

## Stage Exit

The foundation stage is closed: the Foundation Exit Gate in
[Foundation Status](./foundation-status.md#foundation-exit-gate) passed with
the milestone gates in [Verification Runbook](./verification-runbook.md) green.
