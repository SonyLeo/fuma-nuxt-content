---
title: Authoring And Code Contracts
sectionLabel: Reference
status: active
type: contract
owner: foundation-authoring
lastReviewed: 2026-07-14
---

# Authoring And Code Contracts

## Purpose

This document is the durable contract and evidence registry for Phase 2
Markdown authoring and code-system work. It records stable inputs, owners,
outputs, dependencies, and proof without becoming an implementation log.

Architecture boundaries remain in [Architecture Decisions](./decisions.md).
Foundation maturity remains in [Foundation Status](./foundation-status.md),
and command policy remains in the
[Verification Runbook](./verification-runbook.md).

## Contract Matrix

| Batch | Contract                  | Canonical owner               | Status      | Dependency                          |
| ----- | ------------------------- | ----------------------------- | ----------- | ----------------------------------- |
| B1    | Markdown semantics        | `remarkDocsMarkdownSemantics` | Gate Passed | None                                |
| B2    | Steps authoring           | `remarkDocsMarkdownSteps`     | Draft       | B1 canonical records and TOC bridge |
| B3    | Tabs group state          | Tabs runtime state owner      | Draft       | Stable tab value/group protocol     |
| B4    | Code-tab transform        | Remark authoring transform    | Draft       | B3 group state                      |
| B5    | Package-manager transform | Remark authoring transform    | Draft       | B4 code-fence slot contract         |
| B6    | Highlight and code meta   | Shiki and code-meta pipeline  | Draft       | Stable code-fence AST               |
| B7    | CodeBlock interaction     | `DocCodeBlock`                | Draft       | B6 rendered metadata                |
| B8    | Image transform           | Markdown image transform      | Draft       | Image metadata policy               |
| B9    | Link protocol             | Markdown link mapping         | First Pass  | Canonical route/external policy     |

Callouts intentionally use MDC authoring only in Phase 2. Additional
admonition syntax is not part of the foundation contract. Files authoring
transforms remain deferred; existing MDC components remain supported.

## B1 Markdown Semantics

### Input and owner

- Input is remark/MDAST after earlier authoring transforms.
- `remarkDocsMarkdownSemantics` is the only owner for heading IDs,
  `[#custom-id]`, cleaned heading text, heading order/depth, canonical TOC
  records, and `structuredData`.
- Automatic IDs use standard `github-slugger` behavior.

### Output and lifecycle

- The semantic traversal emits `structuredData` and flat private
  `__docsCanonicalToc` records from the same cleaned heading values.
- Records contain only `id`, `text`, `depth`, and narrow optional Steps
  ownership data.
- MDC remains responsible for compilation and its default TOC selection.
- `content:file:afterParse` projects canonical records onto MDC-selected links,
  additionally admits Steps-owned records that satisfy `toc.depth`, and then
  removes the private records before query or persistence.
- The bridge does not scan compiled component ancestry, create IDs, rebuild
  structured content, or mutate rendered body content.

### Compatibility and evidence

- Duplicate, numeric, underscore, Unicode, inline-markup, and custom-ID cases
  are covered by `tests/nuxt/docs-markdown-semantics.nuxt.spec.ts`.
- Projection selection, order, nesting, metadata preservation, depth,
  `toc:false`, error paths, and cleanup are covered by
  `tests/nuxt/docs-content-toc-bridge.nuxt.spec.ts`.
- A real collection query proves canonical rendered headings, TOC, structured
  data, and private-key removal.
- The existing isolated persistence gate proves the private transport does not
  reach stored `body` or `meta` data.

## Planned Contract Boundaries

### B2 Steps

- Recognize only the confirmed numbered-heading and trailing `[step]` grammar.
- Run before B1 semantics and mark generated headings with `data-fd-step`.
- Produce project MDC `doc-steps` and `doc-step` nodes while preserving ordinary
  Markdown children.
- Do not implement TOC projection, links, code, tabs, images, or UI styling.

### B3-B5 Tabs authoring

- B3 freezes runtime group state, value identity, and persistence behavior.
- B4 freezes automatic code-tab grouping while retaining code fence AST so
  every fence continues through build-time Shiki.
- B5 adds package-manager synchronization on top of the same slot contract.
- Code content must not be serialized into JSON or raw-code component props.
- If MDC cannot express the required `DocTabs`/`DocTab`-equivalent slot tree
  while retaining code nodes, the transform batch stops.

### B6-B7 Code system

- B6 owns build-time highlighting, light/dark tokens, code meta, title, icon,
  language labels, line/word highlight, diff, and focus metadata.
- B7 owns copy behavior, accessible state, overflow, long lines, narrow-screen
  behavior, and interaction evidence.
- Code-tab authoring transforms do not take over CodeBlock rendering behavior.

### B8-B9 Media and links

- B8 freezes image metadata, dimensions, placeholder, caption, and zoom mapping
  without introducing a product CDN adapter.
- B9 freezes internal route identity, external-link behavior, rendered
  attributes, and accessibility semantics.

## Evidence Rules

- Inner loops use pure tests or the smallest focused Nuxt spec.
- Each transform batch closes with one real collection query/render evidence.
- Do not create a production-build persistence harness per batch.
- Run metadata persistence only when hooks, schema, or SQL change, or at Phase
  2 closeout.
- Use Playwright only for behavior that requires a browser, such as state,
  interaction, accessibility, overflow, or responsive geometry.
- Execution reports are evidence inputs. The Coordinator marks `Gate Passed`
  only after inspecting the actual diff and affected evidence.

## Maintenance

- Update only the row and contract section owned by the active batch.
- Link durable source and test owners; do not paste command output or chat
  history.
- Record intentional divergences and defers explicitly.
- Keep completed implementation detail in Git history.
