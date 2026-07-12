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
- Page-tree construction consumes publishable page inputs containing normalized
  metadata and resolved identity; raw Nuxt navigation contributes only source
  structure that the normalized input cannot replace.
- Visible, contextual, searchable, pager/homepage, and directory-target policy
  belongs to the page-tree runtime and its policy helpers. Navigation exclusion
  does not imply search exclusion; `hidden` excludes ordinary search.
- Directory targets resolve in this order: page index, internal link index,
  first visible internal descendant, then no redirect. External indexes are not
  redirect targets.
- Sidebar and mobile navigation receive derived `DocsNode[]`; breadcrumbs,
  pager, homepage, and search receive their own derived results. Feature
  components do not consume raw Nuxt Content navigation or rebuild identity.

## D005: Explicit provider/layout/page ownership

- Raw site config is private to the app site adapter. The adapter derives root
  props, docs/home layout props, page actions, search, feedback, GitHub, SEO,
  content, and the unchanged theme input used by current theme entry points.
- Root shared state belongs to `DocsRootProvider` and is limited to direction,
  search availability, and language availability plus label. It is not a
  service locator for site config, runtime trees, navigation, page options,
  page actions, feedback, SEO, GitHub, or theme services.
- The public Nuxt docs layout slots are `default`, `banner`, `search-trigger`,
  `theme-switch`, and `language-select`. `DocsLayoutShell` may retain internal
  `header`, `sidebar`, and `mobile-nav` composition slots without exposing them
  as Nuxt layout API.
- A public replacement slot suppresses its matching default implementation;
  slot absence preserves the default, and search/language surfaces remain
  gated by root capabilities.
- `useDocsPage` is the single page protocol owner: it resolves normalized
  `docsMetadata` policy first, then assembles complete header, TOC, standalone
  breadcrumb, and footer props from explicit tree/content-derived inputs.
- Catch-all routes retain query, identity, redirect/404, SEO, and site adapter
  assembly, but do not reinterpret metadata defaults or rebuild page options.
- `DocsPage` renders the resolved contract and owns only DOM composition,
  slots, TOC interaction state, and rendered-heading fallback.
- Site actions, feedback, search, GitHub, and SEO stay adapter-owned integration
  inputs. They may
  affect outer assembly, such as keeping a footer container for feedback, but
  do not mutate page metadata policy.
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

## D012: Metadata is normalized at content ingestion

- `shared/docs-metadata.ts` owns strict page and directory schemas, exported
  metadata types, field ownership, and pure normalization.
- `build/docs-metadata-ingestion.ts` is the Nuxt Content adapter. A Content
  transformer captures metadata from the framework's native parsed record
  before heading/path title fallback, and `content:file:afterParse` writes the
  normalized `docsMetadata` result before SQL insertion.
- The adapter does not parse Markdown or YAML itself. Route, component, and
  runtime consumers never read raw frontmatter.
- Foundation consumers read the normalized `docsMetadata` JSON field instead of
  reconstructing missing, explicit-false, or invalid values from Boolean SQL
  columns, where Nuxt Content runtime refinement collapses `NULL` to `false`.
- Ordinary docs pages require an explicit non-empty frontmatter title. Draft
  filtering and filename-derived titles remain source-adapter responsibilities.

## Decision Maintenance

- Add a decision only when it changes a durable boundary.
- Update `lastReviewed` when decisions are revalidated.
- Mark a superseded decision explicitly before replacing it.
- Do not append command output, batch logs, or transient failures here.
