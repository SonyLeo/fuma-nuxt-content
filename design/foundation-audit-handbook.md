---
title: Foundation Audit Handbook
sectionLabel: Guide
status: active
type: handbook
owner: foundation
lastReviewed: 2026-07-13
---

# Foundation Audit Handbook

## Purpose

This handbook transfers the foundation audit to a fresh Agent session without
requiring the previous conversation. It defines how to reassess the current
Nuxt/Vue implementation against current Fumadocs protocols and observable docs
behavior before integration or product work continues.

The existing implementation and status documents are evidence, not proof of
alignment. A row marked `First Pass+` may still contain protocol, authoring,
accessibility, responsive, or visual gaps. The audit must inspect current code
and runtime behavior before accepting any recorded status.

## Objective

Determine which foundation contracts are genuinely reusable, which are only a
visual first pass, and which must be corrected before integration work is
economically justified.

The audit covers:

- source, route, metadata, and page-tree protocols;
- provider, layout, page, theme, and CSS ownership;
- Markdown authoring and transform protocols;
- code highlighting, code metadata, code tabs, and copy behavior;
- ordinary documentation content components;
- shell components required by an ordinary docs site;
- interaction primitives, responsive behavior, and accessibility;
- fixtures and tests that claim to prove these contracts.

## Non-Goals

Do not implement or expand these during the audit:

- remote search providers or search backends;
- feedback backends;
- AI, MCP, chat, story, or playground products;
- blog, changelog, API product composition;
- versioning, i18n, OpenAPI, or AsyncAPI;
- RSS, image CDN, or multi-source product routing;
- speculative components without an ordinary documentation use case.

Do not begin a broad refactor merely because Fumadocs uses a different React
implementation. The target is protocol and behavior alignment in Vue, not a
line-for-line port.

## Sources Of Truth

Read these before making conclusions:

1. Project rules in `AGENTS.md`.
2. [Roadmap](./roadmap.md) for the current boundary.
3. [Foundation Status](./foundation-status.md) for existing maturity claims.
4. [Component Inventory](./component-inventory.md) for current surface claims.
5. [Verification Runbook](./verification-runbook.md) for executable checks.
6. [Architecture Decisions](./decisions.md) for durable local boundaries.
7. [Parity Cases](./archive/parity-cases.md) for reusable failure lessons.
8. Current project code and runtime output.
9. Current local Fumadocs source under
   `D:\Projects\Learning\gh\fumadocs`.

Useful upstream areas include:

- `packages/core/src/source/`
- `packages/core/src/content/`
- `packages/core/src/toc.tsx`
- `packages/core/test/fixtures/page-trees/`
- `packages/core/test/fixtures/remark-*`
- `packages/base-ui/src/layouts/`
- `packages/base-ui/src/components/`
- `packages/base-ui/src/mdx.tsx`
- `packages/base-ui/css/`

Use upstream documentation or a live reference site only after identifying the
specific version and surface. Do not compare an unknown deployment against an
unrelated local source revision without recording that uncertainty.

## Audit Principles

### Evidence before status

For every conclusion, distinguish:

- verified fact: supported by source, runtime, or test evidence;
- inference: a likely explanation that still needs confirmation;
- unknown: evidence is missing or the comparison target is ambiguous;
- intentional divergence: local behavior differs for an explicit reason.

### Protocol before appearance

Review in this order:

1. ownership and data contract;
2. normalization and state model;
3. DOM and accessibility semantics;
4. interaction and responsive behavior;
5. layout geometry and CSS variables;
6. typography, color, and visual polish.

Do not use screenshot similarity to approve an incorrect data or state model.

### Audit before implementation

The first pass is review-only. Do not edit production code while building the
gap inventory. When the evidence matrix is complete, present the proposed
priority and implementation batches for confirmation.

After confirmation, implement one bounded contract at a time. If a surface
requires changing a deeper protocol, stop and update the proposed scope before
patching the renderer or CSS.

### Session and drift control

Do not audit the whole foundation in one pass. One session owns one audit slice
or one confirmed implementation batch. At the start, state this checkpoint:

```text
Stage and objective:
Current slice or batch:
Allowed repair boundary:
Explicit non-goals:
Acceptance gates:
Starting HEAD:
```

Treat the repository sources of truth and current diff as authoritative; chat
history is supporting context only. Stop and re-scope when a new P0/P1 changes
the repair order, a deeper protocol must change, the work crosses a layer
boundary, two correction rounds do not converge, or the checkpoint can no
longer be restated without relying on prior conversation.

Use a fresh execution task for each batch. Use a fresh coordinator at a phase
boundary or after material context drift. Carry forward confirmed decisions,
status, commit IDs, and open gates, not complete transcripts.

## Required Audit Status

Use these audit labels. They are separate from roadmap maturity labels.

| Audit status             | Meaning                                                    |
| ------------------------ | ---------------------------------------------------------- |
| `Aligned`                | Protocol and observable contract match the chosen target.  |
| `Partial`                | Core exists, but required contract or edge cases are open. |
| `Divergent`              | Local model conflicts with the target without approval.    |
| `Intentional Divergence` | Difference is documented and justified.                    |
| `Missing`                | Required foundation capability does not exist.             |
| `Unverified`             | Claim exists, but current evidence is insufficient.        |

Never convert `First Pass+` directly into `Aligned`.

## Evidence Matrix

Every audited item must record:

| Field            | Required content                                       |
| ---------------- | ------------------------------------------------------ |
| Surface          | One protocol, component, or behavior                   |
| Local owner      | Files/types/composables that currently own it          |
| Reference owner  | Exact Fumadocs files or documented contract            |
| Current behavior | What current code and runtime actually do              |
| Target behavior  | The contract being aligned to                          |
| Audit status     | One label from the table above                         |
| Root cause layer | Protocol, transform, component, state, CSS, or fixture |
| Evidence         | Source lines, DOM/state, computed style, tests         |
| Impact           | What later work would be blocked or distorted          |
| Priority         | P0, P1, P2, or defer                                   |
| Smallest repair  | Narrowest correct implementation boundary              |
| Verification     | Minimum check that would prove the repair              |

Findings must be ordered by impact, not by discovery time.

## Phase 0: Establish The Baseline

Before judging individual surfaces:

1. Read the active documents listed above.
2. Inspect `git status` and preserve unrelated user changes.
3. Record the Nuxt, Vue, Nuxt Content, Shiki, Reka, and Playwright versions.
4. Identify the local reference source revision when possible.
5. List the real page fixtures used for shell, content components, and code.
6. Run collection-only or static checks needed to understand current coverage.
7. Identify claims in `foundation-status.md` that lack a direct current test.

Output: baseline facts, uncertainties, and the ordered audit slices. Do not
change implementation in this phase.

## Phase 1: Protocol And Ownership Audit

Audit these contracts first because later components depend on them:

### Content identity and metadata

- collection schemas and frontmatter defaults;
- source path, route path, query identity, canonical URL;
- nested index behavior and route collisions;
- hidden, excluded, external, and draft content;
- directory metadata ownership and diagnostics.

Primary local areas:

- `content.config.ts`
- `shared/docs-identity.js`
- `app/types/docs.ts`
- `app/utils/docs-navigation.ts`
- `app/utils/docs-page-tree-runtime.ts`

### Page tree and consumers

- normalized node types and required fields;
- folder, separator, page, index link, and external-link semantics;
- visible tree versus context tree;
- ordering, defaults, metadata inheritance, and empty directories;
- consistent identity across sidebar, breadcrumb, pager, search, and home.

### Provider, layout, and page protocol

- root state ownership and public provider API;
- normalized layout options and replacement slots;
- page options, TOC, actions, feedback, pager, and footer ownership;
- home and not-found reuse of shared contracts;
- route components remaining thin assembly surfaces.

Output: protocol findings first. A protocol-level P0 blocks cosmetic repair and
later integration work.

## Phase 2: Authoring And Code System Audit

This phase must distinguish authoring transforms from rendered components.

### Markdown pipeline

- heading IDs, custom IDs, TOC extraction, and structured content;
- links, external-link policy, images, tables, and prose defaults;
- Steps authoring transform;
- callout/admonition transform;
- Files or other structured authoring transforms;
- package-manager tabs and automatic code-tab grouping;
- image metadata, dimensions, placeholders, and zoom mapping.

Primary local areas:

- `app/utils/docs-markdown-pipeline.ts`
- `app/utils/docs-markdown.ts`
- MDC component mapping and `Prose*` components;
- `tests/nuxt/docs-content-rendering.nuxt.spec.ts`.

### Code highlighting

Audit the complete code contract, not only whether colors appear:

- server/build-time versus client-time highlighting ownership;
- supported languages and unknown-language fallback;
- light/dark theme token output and first paint;
- line highlighting, diff markers, focus lines, and word highlighting;
- title, icon, filename, language label, and code metadata parsing;
- copy text versus rendered markup;
- line numbers, wrapping, overflow, viewport behavior, and long lines;
- code tabs, persistence key, package-manager synchronization;
- SSR/hydration stability and duplicate highlighting;
- Shiki CSS contract and semantic token ownership.

Primary local areas:

- `app/components/content/DocCodeBlock.vue`
- `app/components/content/DocCodeTabs.vue`
- `app/utils/docs-code-highlight.ts`
- `app/utils/docs-code-meta.ts`
- `app/assets/css/content.css`
- `app/assets/css/prose.css`
- `tests/e2e/code-block.spec.ts`.

Compare against current upstream codeblock components, Shiki CSS, highlight
tests, and Markdown fixtures. Record missing authoring capabilities separately
from rendering defects.

## Phase 3: Components And Docs-Site Behavior

Audit ordinary documentation surfaces before adding product features.

### Content components

- headings and anchor/copy interaction;
- callouts and compound callout structure;
- cards and card grids;
- tabs, code tabs, accordions, and collapsibles;
- files/folders and nested truncation;
- steps and step rails;
- type tables;
- inline TOC;
- preview/install cards;
- images and image zoom;
- tables, links, inline code, and generic prose.

For each component review:

- public props, slots, and authoring mapping;
- DOM and ARIA semantics;
- keyboard, focus, dismissal, and hidden-content behavior;
- responsive layout, overflow, long labels, and nesting;
- theme variables and CSS ownership;
- fixture quality and regression coverage.

### Shell components

- header and navigation rhythm;
- desktop sidebar, tabs, folders, separators, collapse, and hover state;
- mobile drawer, overlay, focus return, scroll lock, and navigation close;
- breadcrumb identity;
- desktop TOC rail and narrow TOC popover;
- page header, actions, feedback, pager, and footer;
- search trigger/dialog shell only, not provider integration;
- theme switch and first-paint state;
- home and not-found composition.

### Interaction primitives

Confirm that local `Ui*` wrappers preserve:

- stable local props, emits, slots, class hooks, and `data-state` contracts;
- Reka keyboard and focus behavior;
- teleport/portal, overlay, dismissal, and scroll-lock behavior;
- SSR and hydration behavior;
- feature semantics remaining outside primitive wrappers.

Do not replace page-tree semantics with a generic tree primitive.

## Phase 4: Runtime And Visual Evidence

For each P0/P1 surface:

1. Define one local route, reference route, and viewport set.
2. Inspect upstream source ownership first.
3. Capture local and reference DOM skeletons and semantic attributes.
4. Exercise open, closed, active, focus, keyboard, scroll, and navigation state.
5. Compare computed variables, bounding boxes, sticky/fixed geometry, overflow,
   and breakpoint behavior.
6. Use screenshots only after protocol and state evidence are understood.
7. Classify the mismatch before proposing a fix.

Use existing Playwright tests for browser contracts and existing parity profiles
for reference/hidden-DOM evidence. Do not create a new profile unless the
surface has no suitable probe and the new profile will remain reusable.

## Prioritization Rules

Use this order:

1. `P0`: incorrect shared protocol, ownership, identity, authoring output, or
   accessibility behavior that would force later rewrites.
2. `P1`: incomplete ordinary-docs component or shell contract with visible
   product impact.
3. `P2`: layout rhythm, fine responsive gaps, tokens, and visual polish after
   the contract is correct.
4. `Defer`: integration/product capability or optional component outside the
   foundation boundary.

Prefer repairs that remove multiple downstream inconsistencies. Do not rank a
highly visible CSS symptom above the protocol defect that causes it.

## Required Deliverables

The audit is complete only when it produces:

1. A findings-first summary ordered by P0, P1, P2, and defer.
2. The evidence matrix for every audited foundation area.
3. A list of current status claims that were confirmed, downgraded, or remain
   unverified.
4. A dependency map showing which gaps block later integration.
5. An implementation plan split into small, ordered repair batches.
6. Acceptance criteria and minimum verification for every batch.
7. A list of uncertainties requiring user choice or a live reference target.

Do not write a second audit document. During execution, update this handbook
only when the method changes, update `foundation-status.md` for current maturity,
`component-inventory.md` for surface status, and `decisions.md` for durable
boundaries. Temporary evidence tables may remain in the Agent response until
the findings are confirmed.

## Foundation Audit Exit Criteria

The audit phase, not the implementation phase, is complete when:

- all listed foundation areas have an audit status and evidence owner;
- no `First Pass+` claim is accepted without current evidence;
- protocol defects are separated from rendering and CSS symptoms;
- code highlighting covers authoring, metadata, SSR, theme, copy, and overflow;
- component coverage includes semantics, interaction, accessibility, and
  responsive behavior, not screenshots alone;
- intentional divergences are explicit;
- P0/P1 repair order and dependencies are agreed before implementation;
- integration/product work remains blocked until the relevant foundation exit
  gates pass.

## Fresh Session Handoff

Start a new audit session with this compact task card:

```text
Read AGENTS.md and design/foundation-audit-handbook.md, then load only the
sources of truth relevant to the named slice. Report the session checkpoint
before acting. This session is review-only unless an implementation batch is
explicitly confirmed. Findings need the handbook evidence fields and must be
ordered by impact. Stop on any scope-expansion condition. Do not add an audit,
plan, todo, or handoff document; route durable results to the existing owners.
```
