---
title: Component Inventory
sectionLabel: Plan
status: active
type: inventory
owner: foundation-ui
lastReviewed: 2026-07-14
---

# Component Inventory

## Purpose

This is the current component and regression map for ordinary documentation
pages. It replaces the former long-running parity inventory and batch logs.

Status meanings follow [Foundation Status](./foundation-status.md).

## Content Components

| Surface          | Local owner                | Status      | Primary browser contract                    | Remaining work                                       |
| ---------------- | -------------------------- | ----------- | ------------------------------------------- | ---------------------------------------------------- |
| Prose defaults   | `prose.css`, MDC mapping   | First Pass+ | Runtime rendering, code/links/images/tables | Maintain generic authoring contract                  |
| Code block       | `DocCodeBlock`             | First Pass+ | `code-block.spec.ts`                        | Complete transform-driven metadata policy            |
| Code tabs / Tabs | `DocCodeTabs`, `DocTabs`   | First Pass+ | `tabs-accordion-files.spec.ts`              | Automatic grouping/package-manager transform         |
| Accordion        | `DocAccordion`             | First Pass+ | `tabs-accordion-files.spec.ts`              | Maintain hidden-until-found and keyboard behavior    |
| Files            | `DocFiles`                 | First Pass+ | `tabs-accordion-files.spec.ts`              | Maintain truncation and nesting                      |
| Cards            | `DocCards`, `DocCard`      | First Pass+ | `cards-callout.spec.ts`                     | Maintain responsive grid                             |
| Callout          | `DocCallout`               | First Pass+ | `cards-callout.spec.ts`                     | Maintain type/icon/split contract                    |
| Type table       | `DocTypeTable`             | First Pass+ | `inline-toc-type-table-steps.spec.ts`       | Generator integration remains product work           |
| Steps            | `DocSteps`, `DocStep`      | First Pass+ | `inline-toc-type-table-steps.spec.ts`       | Authoring covered by `docs-markdown-steps` Nuxt spec |
| Inline TOC       | `DocInlineToc`             | First Pass+ | `inline-toc-type-table-steps.spec.ts`       | Maintain open/active/depth semantics                 |
| Heading          | MDC heading wrappers       | First Pass+ | `heading-preview.spec.ts`                   | Complete custom-id transform policy                  |
| Preview          | `DocPreview`, install card | First Pass+ | `heading-preview.spec.ts`                   | Story/playground runtime is product work             |
| Image zoom       | `DocImageZoom`             | First Pass+ | `image-zoom.spec.ts`                        | CDN adapter and metadata transform deferred          |

## Page And Shell Components

| Surface              | Local owner                   | Status      | Primary contract                                       |
| -------------------- | ----------------------------- | ----------- | ------------------------------------------------------ |
| Root provider        | `DocsRootProvider`            | Gate Passed | Adapter Nuxt tests, `layout-provider.spec.ts`          |
| Shared layout slots  | layout composables/components | Gate Passed | Replacement-slot Nuxt tests, `layout-provider.spec.ts` |
| Theme runtime/switch | theme composable and switch   | Gate Passed | `docs-theme-runtime.nuxt.spec.ts`, `theme.spec.ts`     |
| Desktop sidebar      | `DocsSidebar`                 | First Pass+ | `sidebar.spec.ts`                                      |
| Mobile drawer        | `DocsMobileNav`               | First Pass+ | `sidebar.spec.ts` mobile tags                          |
| TOC rail             | `DocsToc`                     | First Pass+ | `toc.spec.ts`                                          |
| Responsive TOC       | `DocsTocPopover`              | First Pass+ | `toc-responsive.spec.ts`                               |
| Page actions         | `DocsPageActions`             | First Pass+ | `page-actions.spec.ts`                                 |
| Feedback             | `DocsFeedback`                | First Pass  | `page-actions.spec.ts`                                 |
| Pager                | `DocsPager`                   | First Pass+ | `page-actions.spec.ts`                                 |
| Home layout          | `DocsHomeLayout`              | Gate Passed | Adapter Nuxt tests, `layout-provider.spec.ts`          |
| Not-found shell      | `DocsNotFound`                | Gate Passed | Props-driven Nuxt test, `layout-provider.spec.ts`      |

## Interaction Primitives

| Wrapper           | Reka ownership       | Current state      |
| ----------------- | -------------------- | ------------------ |
| `UiPopover*`      | Popover              | Migrated           |
| `UiDialog*`       | Dialog               | Migrated           |
| `UiDropdownMenu*` | DropdownMenu         | Migrated           |
| `UiCollapsible*`  | Collapsible          | Migrated           |
| `UiAccordion*`    | Accordion            | Migrated           |
| `UiTabs*`         | Tabs                 | Migrated           |
| `UiScrollArea*`   | ScrollArea           | Migrated/monitored |
| Sidebar tree      | Project `DocsNode[]` | Reka Tree deferred |

## Deferred Components And Variants

These do not enter the foundation queue without a concrete product need:

- Banner beyond the existing slot/decision boundary
- Notebook and Flux layouts
- GitHub repository statistics
- Dynamic/server code blocks
- Auto-generated type tables
- Graph views
- OpenAPI/AsyncAPI product surfaces
- Story/playground runtime
- Mermaid, KaTeX, Twoslash

## Inventory Rules

- Keep one row per durable surface, not one section per implementation batch.
- Verification commands live only in
  [Verification Runbook](./verification-runbook.md).
- Completed batch logs belong in Git history or archive summaries.
- A component is not `Gate Passed` merely because its visual first pass exists.
- New entries require an owner, status, fixture, and focused verification path.
