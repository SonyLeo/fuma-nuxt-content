---
title: Authoring And Code Contracts
sectionLabel: Reference
status: active
type: contract
owner: foundation-authoring
lastReviewed: 2026-07-18
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

| Batch | Contract                  | Canonical owner                    | Status      | Dependency                          |
| ----- | ------------------------- | ---------------------------------- | ----------- | ----------------------------------- |
| B1    | Markdown semantics        | `remarkDocsMarkdownSemantics`      | Gate Passed | None                                |
| B2    | Steps authoring           | `remarkDocsMarkdownSteps`          | Gate Passed | B1 canonical records and TOC bridge |
| B3    | Tabs group state          | `UiTabs`                           | Gate Passed | Stable tab value/group protocol     |
| B4    | Code-tab transform        | `remarkDocsMarkdownCodeTabs`       | Gate Passed | B3 group state                      |
| B5    | Package-manager transform | `remarkDocsMarkdownPackageManager` | Gate Passed | B4 code-fence slot contract         |
| B6    | Highlight and code meta   | `docsMarkdownCodeSystem`           | Gate Passed | Stable code-fence AST               |
| B7    | CodeBlock interaction     | `DocCodeBlock`                     | Draft       | B6 rendered metadata                |
| B8    | Image transform           | Markdown image transform           | Draft       | Image metadata policy               |
| B9    | Link protocol             | Markdown link mapping              | First Pass  | Canonical route/external policy     |

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

### B2 Steps

### Input and owner

- `remarkDocsMarkdownSteps` is the only owner for ordinary Markdown Steps
  authoring.
- It runs in the remark/MDAST phase before `remarkDocsMarkdownSemantics` in the
  focused parser and real Nuxt Content markdown config.
- Existing manual `doc-steps`/`doc-step` MDC containers remain valid authoring
  and are not rewritten by the transform.

### Grammar and output

- Numbered syntax is only a plain leading positive decimal `N` followed by
  `. ` and non-empty heading content. Numbered sequences start at `1`; same
  depth numbered continuation must be exactly `2`, `3`, and so on.
- Numeric-looking headings that start at another number, year-like headings,
  gaps, and out-of-order same-depth numbers remain ordinary headings at that
  boundary.
- Explicit marker syntax is only a trailing literal `[step]` at the end of a
  heading, including the remark-mdc empty `span`/`textComponent` shape. The
  transform removes only the terminal marker and adjacent trailing whitespace.
- Step grouping is same-depth and source-order based. A Step owns following
  Markdown children until the next same-depth Step heading or a boundary;
  deeper headings stay inside the current Step, and nested Step sequences are
  transformed recursively inside generated Step content.
- Output is an MDC slot tree: outer `containerComponent` `doc-steps`, with each
  generated item as `containerComponent` `doc-step`. The original heading and
  following Markdown nodes remain MDAST children; code fences, lists,
  blockquotes, paragraphs, inline markup, and custom ID markers stay semantic
  nodes for later owners.

### Lifecycle and evidence

- Generated Step headings receive numeric `data-fd-step` before B1 semantics.
- B1 remains the only owner for heading IDs, `[#custom-id]`, cleaned heading
  text, structured data, canonical TOC records, and Step ownership records.
- The existing afterParse bridge remains the only owner for final `body.toc`
  projection and private-record cleanup.
- Source owner: `app/utils/docs-markdown-steps.ts`; real authoring fixture:
  `content/guide/steps.md`; focused coverage:
  `tests/nuxt/docs-markdown-steps.nuxt.spec.ts`.
- Evidence covers numbered and marker grammar, invalid boundaries, nested
  Steps, manual MDC stability, idempotence, semantic child preservation, B1
  cleaned ownership, one real `/guide/steps` collection query, canonical TOC
  order, private-key cleanup, and unchanged component-local heading selection.
- The batch does not implement TOC projection, links, code tabs, package
  manager transforms, image transforms, UI styling, schema, hooks, SQL, or
  persistence changes.

## Planned Contract Boundaries

### B3 Tabs group state

- `DocTabs` only forwards the public authoring props `groupId`, `persist`, and
  `updateAnchor`; `UiTabs` owns the runtime group protocol.
- Tabs with the same non-empty `groupId` synchronize only values registered by
  each instance. A group event from an incompatible tab set is ignored rather
  than selecting an empty panel.
- Group selection is stored in `sessionStorage`; `persist=true` additionally
  stores it in `localStorage`. Session state wins during restoration, invalid
  stored value migration is not defined by B3, and unavailable storage does
  not break tab interaction.
- Code-tab and package-manager transforms may consume this protocol but do not
  replace its `UiTabs` owner.
- Browser evidence lives in
  `tests/e2e/content-components/tabs-accordion-files.spec.ts` with the real
  `content/guide/components.md` fixture.

### B4-B5 Tabs authoring

- `remarkDocsMarkdownCodeTabs` is the only B4 owner. It groups consecutive
  same-parent code fences with non-empty quoted `tab` metadata into a
  `doc-tabs`/`doc-tab` MDC named-slot tree.
- Trigger and panel values retain the exact authoring label. The first unique
  label is the default value; duplicate labels share one panel in source order.
- Generated named sections carry MDC's `component-slot`/`v-slot` transport
  because the source parser lifecycle has already completed before B4 runs.
- A non-empty `tab-group` on the first fence maps to the B3 `groupId` contract
  with `persist=true`; later group declarations do not take ownership.
- B4 consumes only `tab` and `tab-group`. Original code nodes, language, value,
  position, and all other code metadata remain available to build-time Shiki
  and the later B6 code-meta owner.
- `remarkDocsMarkdownPackageManager` is the only B5 owner. It runs after B4
  and before B1, and expands `package-install` or `npm` fences into npm, pnpm,
  yarn, and bun panels with npm as the default.
- Generated tabs use `groupId="package-manager"` and `persist=true`. Existing
  manual or B4-generated tabs remain unchanged, and the transform is
  idempotent.
- Each panel retains a MDAST code node with bash language and converted value;
  source metadata, position, and copied data remain available to Shiki and B6.
- Code content must not be serialized into JSON or raw-code component props.
- If MDC cannot express the required `DocTabs`/`DocTab`-equivalent slot tree
  while retaining code nodes, the transform batch stops.
- Focused evidence lives in
  `tests/nuxt/docs-markdown-package-manager.nuxt.spec.ts`; one real
  `/guide/package-manager` query proves eight generated panels reach Shiki.

### B6-B7 Code system

- `docsMarkdownCodeSystem` is the shared build-time Shiki owner for Content and
  direct MDC: Latte is default/light, Mocha is dark, and v3 notation produces
  line/word highlight, diff, and focus SSR output.
- `parseDocsCodeBlockMeta` owns case-insensitive canonical title, filename,
  icon, and line-number aliases while preserving unknown metadata.
- Focused direct and `/guide/code-block` collection evidence lives in
  `tests/nuxt/docs-markdown-code-system.nuxt.spec.ts`; B4 panels retain Shiki.
- B7 owns copy behavior, accessible state, overflow, long lines, narrow-screen
  behavior, and interaction evidence. Code-tab transforms do not own rendering.

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
