---
title: Reka Primitive Migration Plan
sectionLabel: Plan
---

# Reka Primitive Migration Plan

## Purpose

This document is the execution plan for migrating the local `Ui*` interaction
primitive layer to Reka UI.

The goal is not to create a new component library. The goal is to stop
hand-writing focus traps, outside click dismissal, Escape handling, roving
focus, popover positioning, drawer modality, and keyboard navigation in feature
components.

The migration boundary is:

- Reka owns interaction primitives.
- `app/components/ui/*` owns the stable local wrapper API.
- `app/assets/css/*.css` owns all visuals and tokens.
- docs/content/layout components own docs semantics and data contracts.
- `DocsNode[]`, route matching, active path, sidebar tree construction, and
  content authoring contracts stay project-owned.

## Evidence

Official Reka entry:

- `https://reka-ui.com/llms.txt`

Local Reka documentation and source:

- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\guides\controlled-state.md`
- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\guides\composition.md`
- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\guides\styling.md`
- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\guides\server-side-rendering.md`
- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\components\dialog.md`
- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\components\drawer.md`
- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\components\dropdown-menu.md`
- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\components\tabs.md`
- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\components\accordion.md`
- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\components\collapsible.md`
- `D:\Projects\Learning\gh\reka-ui\docs\content\docs\components\tree.md`
- `D:\Projects\Learning\gh\reka-ui\packages\core\src\Dialog\DialogRoot.vue`
- `D:\Projects\Learning\gh\reka-ui\packages\core\src\Drawer\DrawerRoot.vue`
- `D:\Projects\Learning\gh\reka-ui\packages\core\src\Tree\TreeRoot.vue`
- `D:\Projects\Learning\gh\reka-ui\packages\core\src\index.ts`

Local project evidence:

- `app/components/ui/UiPopover.vue`
- `app/components/ui/UiDialog.vue`
- `app/components/ui/UiTabs.vue`
- `app/components/ui/UiAccordion.vue`
- `app/components/ui/UiCollapsible.vue`
- `app/components/docs/DocsSidebar.vue`
- `app/components/docs/DocsSidebarItem.vue`
- `app/components/docs/DocsMobileNav.vue`
- `app/composables/useDocsOverlay.ts`
- `design/sidebar-parity-plan.md`

## Reka Usage Rules

- Use Reka through local wrappers only. Consumers should keep importing
  `UiPopover`, `UiDialog`, `UiTabs`, `UiAccordion`, and similar project
  components.
- Preserve current `Ui*` props, emits, slot names, classes, and DOM contract
  unless a contract card explicitly approves a breaking change.
- Use Reka `asChild` when the local wrapper needs to keep the existing element,
  class, or Nuxt routing component.
- Preserve controlled and uncontrolled behavior:
  - local `open` / `value` props map to Reka controlled state.
  - local `defaultOpen` / `defaultValue` props map to Reka uncontrolled initial
    state.
  - local `update:*` events remain the public output contract.
- Reka is unstyled. Do not move visual decisions into Reka wrappers.
- Teleported content must be styled from global CSS layers, not component-scoped
  assumptions.
- Stateful parts must expose or preserve `data-state` so existing CSS,
  Playwright checks, and parity probes can inspect state.
- After migrating a primitive, remove the duplicated local focus trap,
  outside-click, Escape, positioning, or roving-focus implementation for that
  primitive.
- Migrate one primitive at a time and run focused Playwright checks before
  touching the next primitive.

## Contract Card Additions

Every primitive migration card must capture these fields before implementation:

- Target primitive and current local wrapper files.
- Current public props, emits, slots, and provided context.
- Current consumers and their expected DOM/classes.
- Reka parts used and their state model.
- DOM ownership before/after.
- Accessibility contract:
  - role / aria attributes
  - focus entry
  - Escape behavior
  - focus return
  - keyboard navigation
- Responsive contract when the primitive appears in mobile or constrained
  layouts.
- CSS contract:
  - global CSS selectors
  - `data-state`
  - CSS variables exposed by Reka
  - token usage
- Focused Playwright checks.
- Impact suite to run after the focused check.

## Current Status

`UiPopover` is the baseline POC.

Current POC result:

- `reka-ui@2.10.1` is installed.
- `UiPopover`, `UiPopoverTrigger`, `UiPopoverContent`, and `UiPopoverClose`
  keep the local public API.
- Internals use Reka `PopoverRoot`, `PopoverTrigger`, `PopoverPortal`,
  `PopoverContent`, and `PopoverClose`.
- The old window keydown, pointerdown, resize, scroll, and manual positioning
  logic has been removed from the popover implementation.

This result is good enough to continue, but it does not authorize a broad
rewrite. It authorizes the staged primitive migration below.

Current batch closeout:

- `UiDialog*`, `DocsMobileNav`, `UiDropdownMenu*`, `UiCollapsible*`,
  `UiAccordion*`, `UiTabs*`, and `UiScrollArea*` have been migrated through
  local wrappers.
- `DocsTocPopover` now follows the Fumadocs in-flow `Collapsible` model through
  `UiCollapsible*`, instead of becoming a floating `Popover`.
- Sidebar S1-S3 are covered by Playwright:
  - mobile drawer behavior is Dialog-backed;
  - layout tabs dropdown is Reka DropdownMenu-backed;
  - folder disclosure is Reka Collapsible-backed.
- `useDocsOverlay` has been removed after confirming it has no runtime
  consumers.
- Folder regression now uses the visible `Protocol Playground` fixture instead
  of skipping when no folder is visible.
- Full closeout evidence is recorded in `design/implementation-notes.md` under
  `Reka sidebar folder disclosure closeout`.

## Component Inventory

### Already Migrated

- `UiPopover`
  - Keep as the reference implementation style.
  - Use page actions and theme tests as ongoing regression surfaces.
- `UiDialog`
  - Dialog root, overlay, content, and close now use Reka Dialog through local
    wrappers.
  - Search dialog and mobile sidebar drawer keep their local public contracts.
- `DocsMobileNav` / mobile sidebar drawer
  - The mobile sidebar is Dialog-backed and `useDocsOverlay` has been removed.
  - Reka Drawer remains deferred because it is Alpha.
- `UiDropdownMenu`
  - Added as a local wrapper over Reka DropdownMenu.
  - Sidebar layout tabs dropdown is the first production consumer.
- `UiCollapsible`
  - Disclosure behavior now uses Reka Collapsible.
  - `closeOnEscape` and `closeOnOutside` are opt-in wrapper behavior.
- `UiAccordion`
  - Accordion state and keyboard behavior now use Reka Accordion through local
    wrappers.
  - Docs accordion hash/copy/open contracts remain project-owned.
- `UiTabs`
  - Tabs now use Reka Tabs through local wrappers.
  - `groupId`, persistence, anchor updates, and keep-mounted panels remain in
    the project wrapper contract.
- `UiScrollArea`
  - Maps to Reka `ScrollAreaRoot`, `ScrollAreaViewport`,
    `ScrollAreaScrollbar`, and `ScrollAreaThumb`.
  - Browser-native scrolling and local tokenized visuals remain project-owned.
- `DocsTocPopover`
  - Uses the Fumadocs in-flow Collapsible model via `UiCollapsible`.
  - It intentionally does not use floating `UiPopover` positioning.

### Optional Or Later

- `UiCommandDialog`
  - Search currently keeps local command-list state because ranking, active
    result, and navigation are product-owned.
  - Re-evaluate only if repeated command-list keyboard gaps appear.

- Reka Drawer
  - Defer as a POC because the component is Alpha.
  - It may be useful for swipe-to-dismiss, close reason, and native-feeling
    mobile drawers, but it is not the first implementation path.

- Reka Tree
  - Defer behind sidebar stabilization.
  - It is Alpha and would require mapping `DocsNode[]` to Reka tree selection
    and expansion state.

### Keep Project-Owned

- `UiButton`
  - Keep local. It is visual/token variant infrastructure, not a complex
    interaction primitive.

- `useCopyState`
  - Keep local. It represents docs copy-state semantics shared by code copy,
    markdown copy, and link copy.

- `DocsLink`
  - Keep local. It owns Nuxt route/link protocol and external link behavior.

- `DocsNode[]` tree normalization and active path logic.
  - Keep local. Reka Tree can consume it later, but must not replace the docs
    source/page-tree protocol.

- Visual content components such as Callout, Card, Files, InlineTOC, TypeTable,
  and Preview.
  - Keep local unless they directly consume migrated primitives.

## Sidebar Navigation Decision

Current known gaps:

- Folder nodes combine navigation and disclosure behavior in
  `DocsSidebarItem.vue`.
- The chevron-only click can toggle a folder, but the folder link itself also
  mutates open state before navigation.
- Folder disclosure state is local to each item and not represented as a clear
  provider-level expanded map.
- Sidebar layout tabs dropdown is hand-written in `DocsSidebar.vue` with manual
  document pointer and Escape listeners.
- Mobile sidebar drawer uses `useDocsOverlay`, which reimplements focus trap,
  outside click, scroll lock, Escape close, and focus return.
- Mobile sidebar and page TOC ownership has already been clarified, but the
  drawer implementation still needs a primitive-level owner.

Decision:

- Do not replace the entire sidebar with Reka NavigationMenu.
  NavigationMenu is for website navigation menus and submenus, not a full docs
  page-tree sidebar.
- Do not immediately replace the entire sidebar with Reka Tree.
  Reka Tree is Alpha and would force a broad rewrite of active path, folder
  expansion, link nodes, separators, mobile-close behavior, and current docs
  tree rendering.
- Replace sidebar interaction primitives first:
  - mobile drawer via `UiSheet` / Dialog-backed drawer,
  - layout tabs via `UiDropdownMenu`,
  - folder disclosure via `UiCollapsible` or `UiAccordion`-backed wrappers.
- Re-evaluate Reka Tree only after those changes. If hierarchy switching,
  keyboard navigation, and active folder behavior still fail, run a contained
  Tree POC against a fixture page before replacing production sidebar rendering.

## Sidebar Schedule

### S0: Contract Tightening

Goal:

- Turn current sidebar issues into executable contract checks before migration.

Tasks:

- Update sidebar contract card with explicit folder link vs folder disclosure
  ownership.
- Add Playwright checks for:
  - folder link navigation does not unexpectedly collapse active ancestry,
  - chevron/disclosure toggles without navigation,
  - active descendant opens its folder,
  - mobile navigation closes after page link click,
  - Escape closes only the open sidebar surface.

Validation:

- `pnpm test:e2e -- tests/e2e/sidebar.spec.ts`
- `pnpm test:e2e:shell`

### S1: Mobile Drawer Primitive

Goal:

- Remove `useDocsOverlay` from the mobile sidebar path.

Tasks:

- Add a local `UiSheet` or `UiDrawer` wrapper backed by Reka Dialog first.
- Keep `id="nd-sidebar-mobile"` and the existing Fumadocs-aligned drawer DOM
  state contract.
- Move focus trap, Escape close, outside press, scroll lock, and focus return
  to Reka.
- Keep `useDocsSidebarState` as the source of truth for sidebar open state.

Validation:

- Header sidebar trigger opens the drawer.
- Page TOC popover does not open the sidebar.
- Overlay click and Escape close the drawer.
- Focus returns to `#docs-header-sidebar-trigger`.
- Body scroll lock is active while open.

### S2: Sidebar Tabs Dropdown

Goal:

- Replace the hand-written layout tabs dropdown with `UiDropdownMenu`.

Tasks:

- Add `UiDropdownMenu` wrapper parts around Reka DropdownMenu.
- Preserve current sidebar tab trigger class and option layout.
- Remove manual document pointer and Escape listeners from `DocsSidebar.vue`.
- Keep selected tab detection in `resolveDocsLayoutTabs()` /
  `findActiveDocsLayoutTab()`.

Validation:

- Trigger opens menu and exposes `aria-expanded`.
- Arrow keys move between options.
- Escape closes and returns focus to trigger.
- Selecting an option navigates and closes menu.

### S3: Folder Disclosure

Goal:

- Clarify folder navigation vs disclosure and stop mixing both on the same
  click path.

Tasks:

- Decide per folder shape:
  - folder with index page: title link navigates, chevron button discloses;
  - folder without index page: title button discloses;
  - non-collapsible folder: always open, no disclosure button.
- Move open state to a stable sidebar expanded-state map or a Reka
  Collapsible-backed item contract.
- Preserve active descendant auto-open.
- Preserve `aria-expanded`, `aria-controls`, `data-state`, and content ids.

Validation:

- Folder link click navigates.
- Chevron click toggles only.
- Active path keeps ancestors open.
- Mobile drawer closes on navigation but not on pure disclosure toggle.

### S4: Tree POC Decision Gate

Goal:

- Decide whether Reka Tree is worth a full sidebar replacement.

Enter this gate only if S1-S3 still leave meaningful keyboard or hierarchy
switching gaps.

POC constraints:

- Use a fixture route/page only.
- Do not replace production `DocsSidebarTree` directly.
- Map `DocsNode[]` to Reka `TreeRoot` with explicit `getKey`,
  `getChildren`, `expanded`, and selected/current state.
- Prove support for page, link, separator, group, index folder, non-index
  folder, active ancestry, and mobile close-on-navigation.

Acceptance:

- ArrowDown / ArrowUp / Home / End work.
- ArrowRight opens or enters a folder.
- ArrowLeft closes or moves to parent.
- Enter on a page navigates.
- Disclosure-only actions do not navigate.
- Active path and expanded path remain correct after route change.

If the POC fails or introduces too much mapping complexity, keep the
Collapsible/Dropdown/Dialog-based sidebar and document Tree as deferred.

## Migration Phases

Status: Phases 0 through 6 are complete for the current wrapper migration.
Phase 7 remains a deferred decision gate only.

### Phase 0: Governance

Status: this document.

Tasks:

- Link this plan from `design/roadmap.md`.
- Record durable conclusion in `design/implementation-notes.md`.
- Treat `UiPopover` as the reference POC.

### Phase 1: Dialog Foundation

Tasks:

- Migrate `UiDialog*` to Reka Dialog.
- Keep `UiCommandDialog` public API unchanged.
- Remove duplicated focus trap and Escape logic from local dialog internals.

Validation:

- `pnpm test:e2e -- tests/e2e/theme.spec.ts`
- `pnpm test:e2e -- tests/e2e/page-actions.spec.ts`
- focused search dialog checks if added in the same change.

### Phase 2: Mobile Sidebar Drawer

Tasks:

- Implement Dialog-backed `UiSheet` / `UiDrawer`.
- Migrate `DocsMobileNav`.
- Reduce or retire `useDocsOverlay` if no other consumer needs it.

Validation:

- `pnpm test:e2e -- tests/e2e/sidebar.spec.ts`
- `pnpm test:e2e:shell`

### Phase 3: Dropdown Menus

Tasks:

- Add `UiDropdownMenu*`.
- Migrate sidebar layout tabs dropdown.
- Leave page `Open` popover on `UiPopover` unless action-menu semantics require
  a dropdown.

Validation:

- `pnpm test:e2e -- tests/e2e/sidebar.spec.ts`
- `pnpm test:e2e -- tests/e2e/page-actions.spec.ts`

### Phase 4: Disclosure Components

Tasks:

- Migrate `UiCollapsible*`.
- Migrate sidebar folder disclosure if S3 chooses Collapsible.
- Migrate `UiAccordion*`.

Validation:

- `pnpm test:e2e -- tests/e2e/content-components.spec.ts`
- `pnpm test:e2e -- tests/e2e/sidebar.spec.ts`
- `pnpm test:e2e:content`

### Phase 5: Tabs

Tasks:

- Migrate `UiTabs*`.
- Preserve group sync, persistence, anchor update, and keep-mounted content.

Validation:

- `pnpm test:e2e -- tests/e2e/content-components.spec.ts`
- `pnpm test:e2e:content`

### Phase 6: Scroll Area And Cleanup

Tasks:

- Evaluate `UiScrollArea` after the higher-risk primitives are stable.
- Migrate `UiScrollArea*` to Reka ScrollArea parts if the focused search and
  TOC surfaces still pass.
- Keep `DocsTocPopover` aligned to Fumadocs' in-flow Collapsible model. Do not
  force it into `UiPopover`, because Reka Popper content introduces a floating
  wrapper and breaks the static top-TOC layout contract.
- Move TOC popover open/trigger/content semantics to `UiCollapsible*`.
- Keep outside/Escape dismissal as an opt-in `UiCollapsible` wrapper contract
  (`closeOnOutside`, `closeOnEscape`) so feature components do not own window
  listeners.
- Remove unused overlay helpers and dead feature-local manual listeners.
- Update contract cards with final primitive ownership.

Validation:

- `pnpm typecheck`
- `pnpm test:e2e:toc`
- `pnpm test:e2e:layout`
- `pnpm test:e2e -- tests/e2e/sidebar.spec.ts tests/e2e/content-components.spec.ts`
- `pnpm test:e2e:fast`
- `git diff --check`

### Phase 7: Reka Tree POC

Tasks:

- Run only if S4 gate opens.
- Keep POC isolated.
- Decide replace/defer based on evidence, not preference.

Validation:

- Dedicated sidebar-tree fixture spec.
- `pnpm test:e2e:shell` only after POC is promoted.

## Validation Policy

Per primitive:

- Re-read changed wrapper and at least one consumer.
- Run the focused Playwright spec for the changed surface.
- Run the impact suite:
  - sidebar/mobile drawer/menu: `pnpm test:e2e:shell`
  - content primitives: `pnpm test:e2e:content`
  - page actions/open menu: `pnpm test:e2e:page`
- Run `pnpm typecheck` when Vue/TS changes are made.
- Run `git diff --check` for every migration step.

Full regression:

- Use `pnpm test:e2e:full` only for phase closeout, broad CSS changes, or
  pre-merge confidence.
- Do not grow a single parity probe for this migration. Add or update focused
  Playwright checks per surface.

## Durable Rules

- Do not migrate feature components directly to Reka. Migrate the `Ui*` wrapper
  first, then let feature components consume the same local API.
- Do not let Reka replace docs data contracts.
- Do not use Reka Tree as a shortcut for unresolved sidebar data modeling.
- Prefer Dialog-backed sheet for the first mobile sidebar migration because
  Reka Drawer is Alpha.
- Keep screenshot review as a final visual sanity check, not the primary proof.
- If a primitive migration requires changing public API, stop and write the
  compatibility decision into this document before implementation.
