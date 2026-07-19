---
title: Component Inventory
sectionLabel: Plan
status: active
type: inventory
owner: foundation-ui
lastReviewed: 2026-07-19
---

# Component Inventory

## Purpose

This is the current component and regression map for ordinary documentation
pages. It replaces the former long-running parity inventory and batch logs.

Status meanings follow [Foundation Status](./foundation-status.md).
`Gate Passed` means protocol-safe; UI-R now audits these surfaces for
`Product Ready` visual and primitive maturity.

## Content Components

| Surface          | Local owner                | Status      | Primary browser contract                      | Remaining work                                       |
| ---------------- | -------------------------- | ----------- | --------------------------------------------- | ---------------------------------------------------- |
| Prose defaults   | `prose.css`, MDC mapping   | Gate Passed | Runtime rendering, code/links/images/tables   | Maintain frozen B1-B9 authoring contracts            |
| Code block       | `DocCodeBlock`             | Gate Passed | Nuxt code-system and `code-block.spec.ts`     | Maintain B6-B7 code contracts                        |
| Code tabs / Tabs | `DocCodeTabs`, `DocTabs`   | Gate Passed | `tabs-accordion-files.spec.ts`                | Maintain B3-B5 authoring and state contracts         |
| Accordion        | `DocAccordion`             | Gate Passed | `tabs-accordion-files.spec.ts`                | Maintain hidden-until-found and keyboard behavior    |
| Files            | `DocFiles`                 | Gate Passed | `tabs-accordion-files.spec.ts`                | Maintain truncation and nesting                      |
| Cards            | `DocCards`, `DocCard`      | Gate Passed | `cards-callout.spec.ts`                       | Maintain responsive grid                             |
| Callout          | `DocCallout`               | Gate Passed | `cards-callout.spec.ts`                       | Maintain type/icon/split contract                    |
| Type table       | `DocTypeTable`             | Gate Passed | `inline-toc-type-table-steps.spec.ts`         | Generator integration remains product work           |
| Steps            | `DocSteps`, `DocStep`      | Gate Passed | `inline-toc-type-table-steps.spec.ts`         | Authoring covered by `docs-markdown-steps` Nuxt spec |
| Inline TOC       | `DocInlineToc`             | Gate Passed | `inline-toc-type-table-steps.spec.ts`         | Maintain open/active/depth semantics                 |
| Heading          | MDC heading wrappers       | Gate Passed | `heading-preview.spec.ts`                     | Maintain canonical semantic and TOC contract         |
| Preview          | `DocPreview`, install card | Gate Passed | `heading-preview.spec.ts`                     | Story/playground runtime is product work             |
| Image zoom       | `DocImageZoom`             | Gate Passed | Nuxt image transform and `image-zoom.spec.ts` | Maintain B8 transform and zoom adapter               |

## Page And Shell Components

| Surface              | Local owner                   | Status      | Primary contract                                       |
| -------------------- | ----------------------------- | ----------- | ------------------------------------------------------ |
| Root provider        | `DocsRootProvider`            | Gate Passed | Adapter Nuxt tests, `layout-provider.spec.ts`          |
| Shared layout slots  | layout composables/components | Gate Passed | Replacement-slot Nuxt tests, `layout-provider.spec.ts` |
| Theme runtime/switch | theme composable and switch   | Gate Passed | `docs-theme-runtime.nuxt.spec.ts`, `theme.spec.ts`     |
| Desktop sidebar      | `DocsSidebar`                 | Gate Passed | `sidebar.spec.ts`; UI-R scroll/collapse hardening      |
| Mobile drawer        | `DocsMobileNav`               | Gate Passed | `sidebar.spec.ts` mobile tags                          |
| TOC rail             | `DocsToc`                     | Gate Passed | `toc.spec.ts`                                          |
| Responsive TOC       | `DocsTocPopover`              | Gate Passed | `toc-responsive.spec.ts`                               |
| Search dialog shell  | `DocsSearchDialog`            | Gate Passed | UI-R migrates handwritten command to Reka Combobox     |
| Page actions         | `DocsPageActions`             | Gate Passed | UI-R aligns the Open menu with DropdownMenu            |
| Feedback shell       | `DocsFeedback`                | Gate Passed | UI-R selection primitive, then backend integration     |
| Pager                | `DocsPager`                   | Gate Passed | `page-actions.spec.ts`                                 |
| Home layout          | `DocsHomeLayout`              | Gate Passed | Adapter Nuxt tests, `layout-provider.spec.ts`          |
| Not-found shell      | `DocsNotFound`                | Gate Passed | Props-driven Nuxt test, `layout-provider.spec.ts`      |

## Interaction Primitives

| Wrapper           | Reka ownership       | Current state                     |
| ----------------- | -------------------- | --------------------------------- |
| `UiPopover*`      | Popover              | Migrated                          |
| `UiDialog*`       | Dialog               | Migrated                          |
| `UiDropdownMenu*` | DropdownMenu         | Migrated                          |
| `UiCollapsible*`  | Collapsible          | Migrated                          |
| `UiAccordion*`    | Accordion            | Migrated                          |
| `UiTabs*`         | Tabs                 | Migrated                          |
| `UiScrollArea*`   | ScrollArea           | Migrated/monitored                |
| `UiCommand*`      | Combobox candidate   | Handwritten/UI-R                  |
| `UiTooltip*`      | Tooltip              | Missing/UI-R                      |
| Sidebar tree      | Project `DocsNode[]` | Keep renderer; harden interaction |

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
