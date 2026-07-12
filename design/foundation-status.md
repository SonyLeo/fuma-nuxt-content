---
title: Foundation Status
sectionLabel: Plan
status: active
type: status
owner: foundation
lastReviewed: 2026-07-12
---

# Foundation Status

## Purpose

This is the single source of truth for foundation maturity, remaining gaps,
and the exit gate. It replaces the former foundation roadmap, gap audit, and
alignment matrix.

Status vocabulary:

- `Draft`: design exists, but no stable implementation.
- `First Pass`: implementation and focused checks exist.
- `Gate Passed`: safe for the next layer to depend on.
- `Product Ready`: meets the current product-quality target.

## Current Position

The foundation is beyond initial rendering and is currently `L2-`: the core
contracts exist, but several protocol boundaries still need to become
`Gate Passed` before broad product composition.

| Foundation area                       | Status      | Evidence                                                      | Remaining gate                                          |
| ------------------------------------- | ----------- | ------------------------------------------------------------- | ------------------------------------------------------- |
| Content collection and page identity  | Gate Passed | Ingestion, identity, collision, canonical-route tests         | Keep future sources on normalized metadata and identity |
| Source path / route path separation   | Gate Passed | Shared identity helpers and nested index coverage             | Keep all new consumers on the shared resolver           |
| Page tree and context tree runtime    | Gate Passed | Tree policy/search/directory Nuxt and browser tests           | Keep future adapters on normalized publishable input    |
| Root provider and layout slots        | Gate Passed | Adapter/slot Nuxt tests and layout-provider browser contracts | Keep app adapters on explicit props and public slots    |
| Theme runtime and presets             | First Pass+ | Theme project tests and parity profile                        | Treat product preset adapter separately                 |
| Docs page protocol                    | Gate Passed | Normalized page policy tests and focused shell checks         | Keep site adapters outside metadata policy              |
| Default MDC mapping and link protocol | First Pass+ | Runtime content tests and browser contracts                   | Complete authoring edge cases and external-link policy  |
| Markdown transform pipeline           | First Pass  | Heading ids, structured data, code meta baseline              | Steps/package-manager/code-tab/image transform policy   |
| Code system and preview               | First Pass+ | CodeBlock, tabs, preview and copy tests                       | Complete transform-driven authoring contract            |
| Content components                    | First Pass+ | Component inventory and responsive tests                      | Maintain parity; no broad new component batch           |
| UI interaction primitives             | First Pass+ | Reka-backed local wrappers                                    | Keep public wrappers stable; Tree remains deferred      |
| Verification infrastructure           | Gate Passed | Runtime tests, Playwright webServer, CI shards                | Maintain zero stale entry points and bounded runtime    |

## Contract Ownership

### Content and identity

- `content.config.ts` owns collection schemas.
- `shared/docs-metadata.ts` owns the normalized page and directory metadata
  contract; `build/docs-metadata-ingestion.ts` adapts native Nuxt Content parsed
  records into that contract before persistence.
- `shared/docs-identity.js` owns source/route normalization shared by runtime
  and tooling.
- `DocsPageIdentity` separates content query identity, source file identity,
  and public route identity.
- Hidden or excluded pages may remain in the context tree without entering
  visible sidebar or pager consumers.

### Tree and navigation

- `DocsNode[]` is the normalized navigation contract.
- Route components must not consume raw Nuxt Content navigation structures
  after normalization.
- Folder, separator, external link, page, index link, and hidden page semantics
  remain distinct.
- The runtime owns visible/context membership, ordinary-search inclusion,
  pager/homepage eligibility, and directory-target resolution.
- Navigation-excluded pages remain contextual and searchable by default;
  hidden pages remain contextual but are excluded from ordinary search.
- Sidebar, breadcrumb, pager, search entries, and homepage navigation use
  runtime-derived results and resolved public identity.

### Provider, layout, and page

- `DocsRootProvider` owns root-level shared state and feature availability.
- Its public state is limited to direction, search availability, and language
  availability plus label; it does not hold site config, page-tree runtime,
  navigation, page actions, feedback, SEO, or theme runtime services.
- The app site adapter is the sole raw site-config owner and derives root,
  docs-layout, home-layout, page-integration, content, and theme inputs.
- The public Nuxt docs layout slots are `default`, `banner`, `search-trigger`,
  `theme-switch`, and `language-select`. Header, sidebar, and mobile navigation
  replacement slots remain internal to `DocsLayoutShell`.
- Public replacement slots suppress their matching default implementation;
  absent slots preserve the current defaults and capability gates.
- `useDocsPage` owns normalized page metadata policy and final resolved page
  props. It reads only `docsMetadata`; tree/content owners supply breadcrumb,
  pager, and TOC derived data as explicit inputs.
- Catch-all routes own query, identity, redirect/404, SEO, and site integration
  assembly without reinterpreting page metadata defaults.
- `DocsPage` owns article composition, slots, TOC state, rendered-heading
  fallback, and page-adjacent rendering without reading product config.
- Home and not-found shells reuse shared layout options rather than creating
  separate navigation systems.

### Theme and CSS

- Root `.dark` and `data-docs-theme*` attributes are the theme state contract.
- `tokens.css` owns tokens only.
- `shell.css` owns shell/sidebar/TOC/page layout.
- `prose.css` owns generic rendered Markdown.
- `content.css` owns documentation components.
- Components consume semantic tokens and do not introduce private palettes.

### Interaction primitives

- Reka UI owns low-level interaction behavior through local `Ui*` wrappers.
- Feature components own documentation semantics, not primitive mechanics.
- Public props, emits, slots, class hooks, and data-state contracts remain
  project-owned.
- Reka Tree is not a substitute for unresolved page-tree modeling.

## Remaining Foundation Work

### P0: freeze the source and tree boundary

- Document route collision and source identity diagnostics.
- Remove remaining direct or duplicated route/source normalization.
- Add focused coverage whenever a new content source shape is introduced.

### P0: complete the Markdown authoring pipeline

- Define Steps authoring transform.
- Define package-manager command tabs.
- Define automatic code-tab grouping and persistence keys.
- Define image metadata, sizing, and placeholder policy.
- Keep UI component contracts separate from authoring transforms.

### P1: maintain public provider and page contracts

- Keep the root provider, public layout slot list, replacement semantics,
  resolved page options, and standalone breadcrumb ownership covered.
- Keep product adapters generating foundation props; foundation components must
  not read global site config.

### P1: maintain component parity

- Treat the component inventory as a regression map, not an endless feature
  backlog.
- Add a new foundation component only when ordinary documentation pages need
  it and the ownership boundary is clear.

## Foundation Exit Gate

Foundation reaches `Gate Passed` when all of the following are true:

- Content metadata and page identity have one documented owner.
- Page-tree construction and runtime consumption use the same normalized
  contract.
- Provider/layout/page public APIs are explicit and covered.
- Default MDC mapping and link protocol are stable.
- Required Markdown authoring transforms are implemented and tested.
- UI primitives preserve accessibility and public wrapper contracts.
- The component inventory has no contradictory status entries.
- `pnpm typecheck`, `pnpm test:nuxt`, `pnpm validate:links`, and the relevant
  Playwright gate pass.
- Product work can proceed without rewriting foundation shell or content
  components.

## Deferred From Foundation

These are not foundation exit requirements:

- remote search providers and APIs
- feedback backends
- RSS and extended LLM exports
- image CDN adapters
- multi-source product routing
- blog, changelog, API, story, playground, AI, MCP
- versioning and i18n product composition
- Notebook and Flux layout variants

Their active order lives in [Product Backlog](./product-backlog.md).
