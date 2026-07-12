---
title: Sidebar Parity Plan
sectionLabel: Plan
---

# Sidebar Parity Plan

## Scope

This plan tracks the left sidebar parity loop against Fumadocs. It is a focused
contract card, not a new roadmap.

Reka UI interaction primitive migration for this surface is governed by
`design/reka-primitive-migration-plan.md`. This sidebar card keeps the
Fumadocs parity contract; the Reka plan decides which local interaction
wrappers should replace hand-written sidebar behavior.

Target surface:

- Remote reference: Fumadocs docs sidebar on a component page.
- Local fixture: `http://127.0.0.1:8888/guide/component-detail`.
- Viewports: `1440x1000`, `994x935`, `390x844`.
- Covered behavior: desktop sidebar, collapse and hover preview, layout tabs
  dropdown, folder trigger/link/content, active item, mobile drawer, overlay,
  scroll lock, Escape close, and focus return.

Out of scope for this card:

- Search implementation.
- Theme runtime.
- Content component parity.
- Site-level product navigation changes.

## Fumadocs Evidence

Source ownership:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\sidebar\base.tsx`
  owns `SidebarProvider`, `SidebarContent`, `SidebarDrawerOverlay`,
  `SidebarDrawerContent`, `SidebarViewport`, `SidebarFolder`,
  `SidebarFolderTrigger`, `SidebarFolderLink`, `SidebarFolderContent`,
  `SidebarItem`, `SidebarTrigger`, and `SidebarCollapseTrigger`.
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\sidebar\page-tree.tsx`
  maps page-tree nodes to `Item / Folder / Separator`.
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\slots\sidebar.tsx`
  assembles desktop `SidebarContent`, mobile `SidebarDrawer`, viewport content,
  layout tabs dropdown, footer slots, and page-tree renderers.

Key contract details:

- Mobile drawer uses `id="nd-sidebar-mobile"` and `data-state="open|closed"`.
- Mobile overlay is a separate fixed element with `data-state`.
- Drawer geometry is fixed to the right side, full height, `width: 85%`,
  `max-width: 380px`, border on the inline-start side, and panel shadow.
- Desktop sidebar uses a placeholder/panel split and a scroll viewport.
- Folder nodes are not plain links. They are `SidebarFolder` roots containing
  `SidebarFolderTrigger` or `SidebarFolderLink`, plus
  `SidebarFolderContent`.
- Folder open state defaults to open when the folder is active, explicitly
  default-open, under the provider default open level, or non-collapsible.
- Folder triggers expose collapsible state and chevron state through
  open/closed state.
- Active links expose current state through data/ARIA and auto-scroll into the
  active sidebar boundary.

## Local State Before This Loop

Current ownership:

- `app/components/docs/DocsLayoutShell.vue` provides sidebar state and assembles
  desktop sidebar plus mobile nav.
- `app/composables/useDocsSidebarState.ts` owns collapsed, hovered, mobile open,
  tabs open, and close-on-navigation state.
- `app/components/docs/DocsSidebar.vue` owns desktop sidebar chrome, layout
  tabs dropdown, footer, and tree rendering.
- `app/components/docs/DocsSidebarTree.vue` maps `DocsNode[]` to sidebar items.
- `app/components/docs/DocsSidebarItem.vue` renders separators, links, group
  labels, and recursive children.
- `app/components/docs/DocsHeader.vue` owns the mobile sidebar trigger.
- `app/components/docs/DocsMobileNav.vue` owns the mobile sidebar drawer and
  overlay.
- `app/components/docs/DocsTocPopover.vue` owns the mobile page TOC row inside
  the content frame.
- `app/assets/css/shell.css` owns desktop sidebar and mobile nav styling.

Observed gaps:

- The first implementation incorrectly treated the content-frame mobile top row
  as the left sidebar trigger. In Fumadocs that row belongs to `TOCPopover`;
  the left sidebar trigger belongs to the mobile header.
- Mobile navigation must remain a fixed drawer, not an inline static panel.
- `#nd-sidebar-mobile` is the drawer boundary and must not be duplicated by the
  embedded sidebar tree.
- Mobile overlay must stay a visible state contract.
- Folder nodes with children auto-expand, but they do not expose a
  folder root / trigger / link / content contract.
- Folder nodes do not expose `aria-expanded`, `aria-controls`, `data-state`,
  or a stable content id.
- Existing Playwright checks prove local usability but do not prove Fumadocs
  protocol parity for drawer and folder semantics.

## Target DOM Contract

Desktop:

```text
#nd-docs-layout[data-sidebar-collapsed][data-sidebar-mobile-open]
  #nd-sidebar.docs-sidebar[data-collapsed][data-hovered]
    .docs-sidebar-hover-zone
    .docs-sidebar-inner
      .docs-sidebar-header
      .docs-sidebar-search
      .docs-sidebar-tabs
        .docs-sidebar-tab-trigger[aria-expanded]
        .docs-sidebar-tab-panel[role="menu"]
      nav.docs-sidebar-nav
        ul.docs-sidebar-list
          li.docs-sidebar-item
            .docs-sidebar-folder[data-state][data-active]
              .docs-sidebar-folder-link[aria-expanded][aria-controls]
              .docs-sidebar-folder-content[id][data-state]
    .docs-sidebar-floating
```

Mobile:

```text
.docs-header
  button#docs-header-sidebar-trigger[aria-expanded][aria-controls="nd-sidebar-mobile"]
.docs-mobile-nav[data-open]
  .docs-mobile-nav-overlay[data-state]
  aside#nd-sidebar-mobile.docs-mobile-nav-panel[data-state]
    .docs-mobile-nav-header
    .docs-sidebar
    nav.docs-mobile-menu-links
.docs-page-frame
  .docs-toc-popover[data-state]
    button#docs-toc-popover-trigger[aria-controls="docs-toc-popover-panel"]
```

## Interaction Contract

Desktop:

- Collapse button updates `#nd-docs-layout[data-sidebar-collapsed]` and
  `#nd-sidebar[data-collapsed]`.
- Collapsed desktop sidebar hides the full panel and shows floating controls.
- Hover preview opens the collapsed sidebar panel without changing the
  collapsed source of truth.
- Floating pin restores expanded sidebar state.
- Tabs dropdown opens without shifting `.docs-sidebar-nav`.
- Escape closes tabs dropdown.

Folder:

- Folder roots expose `data-state="open|closed"`.
- Folder trigger/link exposes `aria-expanded`, `aria-controls`, and matching
  `data-state`.
- Active folders default open.
- Non-collapsible folders stay open.
- Folder content exists behind a stable id and exposes matching `data-state`.
- Clicking a folder chevron toggles children without requiring navigation.
- Navigation click still emits the sidebar `navigate` event.

Mobile:

- The header sidebar trigger opens a fixed right drawer and overlay.
- The content-frame mobile top row is the page TOC popover and must not open
  the left sidebar.
- Drawer exposes `id="nd-sidebar-mobile"` and `data-state="open|closed"`.
- Open drawer locks body scroll.
- Overlay click closes the drawer.
- Escape closes the drawer.
- Closing the drawer returns focus to `#docs-header-sidebar-trigger`.
- Drawer uses the same `DocsSidebar` tree as desktop and closes on navigation.

## Verification Matrix

Focused Playwright checks:

- Desktop tab trigger and menu state.
- Desktop collapse, hover preview, and floating pin.
- Folder semantics when a visible folder node exists.
- Mobile drawer geometry: fixed, right side, `85vw` or capped width, full
  height.
- Mobile overlay visibility and `data-state`.
- Body scroll lock while drawer is open.
- Escape and overlay close.
- Active item remains visible inside the drawer.

Static checks:

- Re-read changed Vue components for props, emits, ARIA, and state flow.
- Re-read changed CSS for token usage, breakpoints, and focus states.
- `git diff --check`.

Runtime checks:

- `pnpm test:e2e -- tests/e2e/sidebar.spec.ts`.
- `pnpm test:e2e -- --grep '@shell'` after CSS or layout changes.
- `pnpm typecheck` after Vue/TS changes.

## Implementation Phases

1. Add this contract card.
2. Strengthen Playwright sidebar checks for drawer and folder protocol.
3. Refactor `DocsSidebarItem.vue` to expose folder root / trigger / link /
   content semantics.
4. Refactor `DocsMobileNav.vue` from inline panel to fixed right drawer.
5. Keep the sidebar trigger in `DocsHeader.vue`; keep the content-frame mobile
   top row owned by `DocsTocPopover.vue`.
6. Update `shell.css` for mobile overlay/drawer and folder controls.
7. Run focused validation, then shell impact validation.
8. Record durable lessons in `design/implementation-notes.md`.

Reka-specific execution order is now:

1. Keep `DocsNode[]` and active path logic project-owned.
2. Replace mobile drawer behavior through a local Dialog-backed sheet wrapper.
3. Replace sidebar layout tabs dropdown through `UiDropdownMenu`.
4. Replace folder disclosure through `UiCollapsible` or equivalent local
   wrapper.
5. Evaluate Reka Tree only after those changes, and only through an isolated
   fixture POC.

## Durable Rules

- Do not grow a single parity probe indefinitely. Split checks by surface:
  desktop sidebar, mobile drawer, folder protocol, tabs dropdown, and collapse.
- Visible UI interactions should use Playwright real actions.
- Legacy probes remain useful for reference collection and hidden DOM sampling,
  but local regression should prefer Playwright.
- Screenshot review is allowed only after DOM, state, and computed geometry
  checks are clean.
