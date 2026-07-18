---
title: Roadmap
sectionLabel: Plan
status: active
type: roadmap
owner: project
lastReviewed: 2026-07-18
---

# Roadmap

## Current Objective

Build a stable Vue-first documentation foundation aligned with Fumadocs
protocols before expanding product composition.

The current stage is foundation hardening. The baseline exists; the remaining
work is to freeze protocol ownership and complete the authoring pipeline so
upper layers can depend on it without reopening shell or content contracts.

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

### P0: foundation exit work

1. Freeze content metadata, page identity, and tree ownership.
2. Close Phase 2 with consolidated Nuxt, validator, docs, and browser gates.
3. Document stable provider/layout/page public contracts.
4. Keep component and Reka wrapper regressions green.

## Reference Comparison Plan

The local Nuxt UI v4 baseline is `D:\Projects\Learning\gh\ui` at the
Coordinator-verified `v4` commit. Compare it with the pinned local Fumadocs
source before opening each remaining Phase 2 batch:

1. **Content and authoring:** use Fumadocs remark plugins as protocol references;
   compare Nuxt UI's explicit MDC authoring and document any intentional
   adaptation to Nuxt Content lifecycle.
2. **Code system:** compare Shiki/meta/line-state inputs and SSR output before
   future CodeBlock styling changes.
3. **Runtime/UI:** compare Nuxt UI's Reka-backed slot and ARIA behavior only
   where it informs project-owned wrappers and CSS layers.
4. **Integration:** evaluate Content schemas, image, OG, schema, and LLM
   modules independently after Foundation ownership is stable.

The comparison does not authorize a dependency migration or a visual rewrite.
Each result must be classified as direct reference, Nuxt adaptation,
intentional divergence, defer, or stop-condition evidence. B1-B9 implementation
is complete; Phase 2 closeout is next.

### P1: integration completion

After the foundation exit gate:

1. remote search provider/API
2. feedback backend or GitHub issue flow
3. RSS
4. `llms-full.txt`
5. per-page Markdown export
6. image CDN adapter

### P2: multi-source and product composition

1. docs/blog/changelog/API source boundary
2. blog/changelog/API presentation
3. story/playground
4. AI/MCP/docs assistant
5. versioning/i18n
6. schema-driven API integrations

## Working Rules

- Use `Draft`, `First Pass`, `Gate Passed`, and `Product Ready`.
- Advance one layer at a time.
- Use the smallest relevant verification during iteration.
- Close completed plans after extracting durable decisions.
- Do not create another roadmap; add a distinct active document only when its
  ownership cannot fit an existing source of truth.
- Keep full historical detail in Git, not active planning files.

## Stage Exit

The current stage closes when the Foundation Exit Gate in
[Foundation Status](./foundation-status.md#foundation-exit-gate) passes and the
test gates in [Verification Runbook](./verification-runbook.md) are green.
