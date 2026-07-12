# AGENTS.md

This file is the project-level guide for coding agents working in this
repository. User instructions still take priority. If a deeper `AGENTS.md` is
added later, the closest file to the edited path wins.

## Project Overview

- Project: Fumadocs-aligned Nuxt Content docs foundation.
- Stack: Nuxt 4, Vue 3, TypeScript, `@nuxt/content`.
- Package manager: pnpm.
- Current goal: build a stable Vue docs system foundation before product-layer
  features.
- Current planning source of truth: `design/roadmap.md`, with active foundation
  hardening in `design/foundation-alignment-matrix.md`.

## Reference Priority

Use references in this order:

1. Current project files and planning docs.
2. Local Fumadocs source in `D:\Projects\Learning\gh\fumadocs`.
3. Local assistant-ui docs source in `D:\Projects\Learning\gh\assistant-ui`.
4. The old VitePress prototype in `D:\Projects\Work\tiny-robot-docs-ui`.
5. TinyRobot monorepo only for later product examples, component API content,
   demos, and real-world validation.

Do not use the TinyRobot monorepo as the docs shell architecture source during
foundation work.

## Commands

- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Playwright E2E automatically starts or reuses the Nuxt app server.
- Build: `pnpm build`
- Generate static output: `pnpm generate`
- Preview built output: `pnpm preview`

Do not run installs, builds, or long-lived dev servers unless the user asks for
that class of action or the task clearly requires it. Prefer static inspection
for planning and foundation documentation changes.

## Foundation Boundary

Foundation work includes:

- content collection and frontmatter protocol
- content normalization
- docs tree and metadata protocol
- layout protocol
- page protocol
- docs content components
- design tokens and CSS layering
- route assembly rules
- basic home/docs shell consistency

Foundation work does not include:

- search
- feedback
- AI/chat/MCP
- blog/changelog/API product surfaces
- SEO artifacts
- story/playground
- versioning or i18n
- TinyRobot component demo integration

## Architecture Rules

- Borrow Fumadocs protocols, not React implementation details.
- Borrow assistant-ui docs shell rhythm, not its AI panel or product features.
- Borrow old docs-ui Vue component lessons and failure notes, not VitePress
  adapters or VitePress private APIs.
- Route-level Vue files should stay thin and assemble data plus components.
- Components should receive normalized project types instead of raw Nuxt Content
  navigation structures once the foundation protocol exists.

## Vue Rules

- Use Vue 3 Composition API with `<script setup lang="ts">`.
- Keep source state minimal and derive display state with `computed`.
- Use props down and emits up for component contracts.
- Use provide/inject only for deep shared context such as layout/sidebar state.
- Keep page/layout components as composition surfaces.
- Split large components when they combine data orchestration with multiple
  independent UI sections.

## Design Rules

- Docs pages are article-first, not marketing-first.
- Prefer a quiet, dense, utility-like docs UI.
- Keep Fumadocs structural clarity, assistant-ui shell density, and TinyRobot
  brand accent as separate layers.
- Use design tokens before hardcoded values.
- Do not let one hue dominate the entire UI.
- Keep long text wrapping, truncation, and overflow behavior explicit.
- Icon buttons need accessible names and visible focus states.

## Fumadocs Parity Rules

- For Fumadocs UI parity tasks, use the `fumadocs-parity` skill when available.
- Do not start from screenshot-only CSS guessing. Inspect source, DOM, state,
  computed styles, and layout metrics before visual fine-tuning.
- Run the relevant parity profile when one exists; if none exists, record the
  missing profile as part of the task review.
- Use `scripts/parity/run.mjs` for parity profiles and suites.
- Playwright tests use `webServer` and own only the process they start. Legacy
  parity profiles still require their target URL to be available separately.
- Treat `design/parity-reconstruction-workflow.md` as a historical case archive,
  not the daily execution entry point.

## CSS Rules

- `app/assets/css/tokens.css` owns design tokens only.
- `app/assets/css/shell.css` owns layout shell, sidebar, TOC, pager, mobile nav,
  and home/docs frame styles.
- `app/assets/css/prose.css` owns rendered Markdown typography and generic
  prose elements.
- `app/assets/css/content.css` owns docs content component styles.
- Prefer semantic tokens over component-local hardcoded colors.
- Avoid `transition: all`; list transitioned properties explicitly.

## Planning Rules

- Keep planning centralized. Do not add another roadmap unless it has a distinct
  role and is linked from `design/roadmap.md`.
- Stage 0 preparation is complete and retained in
  `design/foundation-prep-plan.md` as historical evidence.
- Record durable conclusions in `design/implementation-notes.md`.
- Keep product-layer ideas in `design/product-roadmap.md` until the foundation
  protocol is stable.

## Verification Rules

- Documentation-only changes: inspect diffs and run static checks only when
  needed.
- UI/style changes: re-read changed CSS and at least one consumer component.
- Component changes: check props, emits, slots, responsive behavior,
  accessibility labels, and token usage.
- Prefer layered local verification instead of replaying the whole stack every
  time:
  - iteration: one focused spec or one focused static check
  - batch closeout: `typecheck` once, then the smallest relevant regression
  - milestone or pre-merge: `pnpm test:e2e:full`
- `pnpm test:e2e:full` uses two workers because all browser workers share one
  Nuxt Content server. Focused runs may override workers when appropriate.
- E2E viewport selection is tag-driven: untagged contracts run on desktop,
  `@responsive` runs on all projects, `@narrow` runs on tablet/mobile, and
  `@tablet` / `@mobile` select project-specific branches.
- `pnpm typecheck` uses an isolated `.nuxt-typecheck` build directory.
- Playwright `webServer` reuses a healthy local server or starts Nuxt with the
  isolated `.nuxt-e2e` build directory. Setting `PLAYWRIGHT_TEST_BASE_URL`
  disables automatic startup and targets that external server instead.
- For non-responsive changes, prefer one desktop project first
  (`--project=chromium-desktop`). Add
  tablet/mobile only when the change touches layout, drawer/popover, touch, or
  responsive shell behavior.
- For Nuxt Content-heavy Playwright tests, prefer focused specs first and pass
  `--workers=1` when the failure signature points to shared content database
  instability instead of a UI regression.
- Do not treat the legacy parity runner as a daily default gate. Use it when a
  surface still lacks a Playwright contract, or when hidden DOM/reference
  comparison is the point of the task.
- If a runtime check is skipped, say which check was skipped and why.

## Git Rules

- Do not stage, commit, push, reset, or restore files unless the user asks.
- Never revert user changes unless explicitly requested.
- Keep changes narrowly scoped to the current task.
