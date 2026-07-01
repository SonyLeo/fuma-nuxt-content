---
title: Fumadocs Gap Audit
sectionLabel: Plan
---

# Fumadocs Gap Audit

This document records the current cross-source gap audit against local
Fumadocs source. It is a periodic audit document, not the roadmap itself.

## Scope

This audit compares:

- Fumadocs core source/page-tree/MDX/search surfaces
- Fumadocs base-ui provider/layout/content components
- Local Nuxt/Vue implementation
- Current planning documents

The goal is to identify what is already covered, what is scheduled, what is
missing, and what should remain deferred.

## Evidence Sources

Fumadocs source:

- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\schema.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\source.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\loader.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\page-tree\builder.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\page-tree\transformer-fallback.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\llms.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\mdx-plugins\index.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\mdx-plugins\remark-heading.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\mdx-plugins\remark-code-tab.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\mdx-plugins\remark-npm.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\mdx-plugins\remark-image.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\mdx-plugins\rehype-code.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\search\client.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\search\server.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\search\orama\create-server.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\search\server\build-index.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\mdx.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\provider\base.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components`
- `D:\Projects\Learning\gh\fumadocs\packages\openapi`
- `D:\Projects\Learning\gh\fumadocs\packages\typescript`

Local sources:

- `app/components/docs`
- `app/components/content`
- `app/components/ui`
- `app/composables`
- `app/utils`
- `app/types`
- `scripts/parity/profiles`
- `scripts/parity/suites`
- `design/roadmap.md`
- `design/foundation-roadmap.md`
- `design/product-roadmap.md`
- `design/fumadocs-component-parity-inventory.md`
- `design/theme-runtime-parity-plan.md`
- `design/layout-provider-parity-plan.md`

## Current Coverage Summary

Covered and profiled:

- Docs shell first pass: sidebar, TOC, mobile nav, page shell.
- Responsive TOC shell, including constrained-width viewports.
- Page contract: header, breadcrumb, body, footer, pager, TOC popover.
- Prose defaults: links, inline code, headings, table, image wrapper.
- Code block: shell, title/meta/copy, line numbers, highlights, code tabs.
- Content components: Callout, Tabs, Accordion, Files, InlineTOC, TypeTable,
  Cards, Steps, Heading.
- Preview/page-tail: Preview, install card, page actions, feedback, pager.
- UI primitives first pass: button, popover, dialog, command dialog, tabs,
  accordion, collapsible, scroll area, copy state.
- Product first pass: site config, page actions, local search, feedback, SEO,
  sitemap, `llms.txt`, image pipeline baseline, link validation.

Covered but scheduled for a hardening gate:

- Theme runtime and preset contract:
  [`theme-runtime-parity-plan.md`](./theme-runtime-parity-plan.md)
- RootProvider, baseSlots, sidebar state, Home/not-found, layout variants:
  [`layout-provider-parity-plan.md`](./layout-provider-parity-plan.md)

## Gap Matrix

| Fumadocs surface | Local state | Classification | Schedule decision |
| --- | --- | --- | --- |
| `RootProvider`, theme/search/i18n/dir provider boundary | Slots exist; no standalone provider contract | Foundation P1 | Stage 7.10 after Theme Runtime |
| `baseSlots()` default slot provider | Replacement slots exist; defaults are scattered | Foundation P1 | Stage 7.10 |
| `SidebarProvider` / layout state | Visual behavior exists; state is local to shell/sidebar | Foundation P1 | Stage 7.10 |
| `LayoutTab` / root section switcher | `nav.tabs` exists; no formal contract/profile | Foundation P1 | Stage 7.10 |
| `HomeLayout` | `app/pages/index.vue` ad hoc composition | Foundation P1 | Stage 7.10 |
| `DefaultNotFound` | No foundation shell | Foundation P1 | Stage 7.10 |
| `Banner` | Top slot and height token only; placeholder content page | Foundation decision | Stage 7.10 decision card, then implement only if accepted |
| `ImageZoom` | No `DocImageZoom`; `ProseImg` is plain wrapper | Foundation P1 | After Stage 7.10 |
| `remark-heading` custom id and TOC extraction policy | Heading component/profile exists; transform policy is incomplete | Foundation P1 | Markdown Transform Pipeline |
| `remark-code-tab` group/persist authoring transform | Manual CodeTabs works; automatic transform incomplete | Foundation P1 | Markdown Transform Pipeline |
| `remark-npm` package-manager command tabs | Manual install card/code tabs exist; no transform | Foundation P1/P2 | Markdown Transform Pipeline, after basic transforms |
| `remark-image` size/import/placeholder policy | Prose image wrapper exists; no size/import/placeholder transform | Foundation P1/P2 | ImageZoom/Image pipeline boundary |
| `rehype-code` full meta parser | Code UI exists; full parser/transform parity incomplete | Foundation P1 | Markdown Transform Pipeline |
| Structured data extraction for search | Local search index exists; structured extraction is lighter | Integration P1 | Remote/search API stage |
| Search clients/providers | Local search exists; no remote provider/API | Integration P1 | Product-roadmap P1 |
| Feedback backend / GitHub issue flow | Local/static feedback exists | Integration P1 | Product-roadmap P1 |
| `llms-full.txt` / per-page markdown export | `llms.txt` exists; full export not done | Integration P1 | Product-roadmap P1 |
| RSS | Not implemented | Integration P1 | Product-roadmap P1 |
| Image CDN adapter | Image baseline exists; CDN adapter missing | Integration P1 | After ImageZoom foundation UI |
| Multi-source loader baseline | Current docs source works; no docs/blog/changelog/api loader baseline | Integration P1/P2 | Before changelog/API product pages |
| i18n/versioning route strategy | Placeholders/slots only | Site product composition | Defer until multi-source/base routing is stable |
| Notebook layout | No equivalent | Deferred foundation variant | Decision card only |
| Flux layout | No equivalent | Deferred foundation variant | Decision card only |
| Navbar menu / navigation menu primitive | No dedicated home navbar menu primitive | Conditional foundation | Defer until Home layout requires menu links |
| `GitHubInfo` | No local equivalent | Product/advanced | Defer until product page requires repo stats |
| `DynamicCodeBlock` / server code block | Static code path is foundation baseline | Advanced | Defer |
| `AutoTypeTable` | Manual TypeTable UI is profiled | Generator/product enhancement | Defer |
| OpenAPI / AsyncAPI | No local product surface | Product/advanced | Defer to site product composition |
| Story/playground runtime | Preview frame exists; no story runtime | Product/advanced | Defer |
| Mermaid / KaTeX / Twoslash | Not implemented | Advanced docs feature | Defer until product need |

## Recommended Execution Order

Keep the current top-level order:

1. Theme Runtime / Preset Gate.
2. Root Provider / Layout Variants Gate.
3. ImageZoom foundation UI.
4. Markdown Transform Pipeline.
5. Integration P1.
6. Multi-source baseline.
7. Site product composition.

Detailed next steps:

1. Theme Runtime / Preset Gate:
   - implement `DocsThemeConfig`, `useDocsTheme`, first-paint script,
     `DocsThemeSwitch`, `themes.css`, and `theme` profile.
2. Root Provider / Layout Variants Gate:
   - implement provider/default slots/sidebar state/layout tabs profiles.
   - add Home layout and not-found shell.
   - write Banner, Notebook, and Flux decision cards.
3. ImageZoom:
   - add `DocImageZoom` or image zoom contract.
   - add `image` or `image-zoom` profile.
   - only then connect CDN/image adapter planning.
4. Markdown Transform Pipeline:
   - custom heading id.
   - code meta parser parity.
   - line/diff/focus semantics.
   - code tab grouping and package-manager tabs.
   - structured extraction for search input.
5. Integration P1:
   - remote search provider/API.
   - feedback backend or GitHub issue template.
   - RSS.
   - `llms-full.txt` and per-page markdown export.
   - image CDN adapter.
6. Multi-source baseline:
   - define docs/blog/changelog/api source and route contracts before building
     changelog or API product pages.

## Roadmap Hygiene

- Keep `design/roadmap.md` flat.
- Put detailed gate contracts into dedicated plan docs.
- Put component state/profiles into
  `design/fumadocs-component-parity-inventory.md`.
- Put long-lived conclusions into `design/implementation-notes.md`.
- Avoid copying the same gap matrix into multiple documents.
