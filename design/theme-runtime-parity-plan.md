---
title: Theme Runtime Parity Plan
sectionLabel: Plan
---

# Theme Runtime Parity Plan

This document owns the detailed design for theme runtime, theme switch, and
theme preset parity. `design/roadmap.md` should stay flat and link here instead
of carrying the full implementation contract.

## Scope

This plan covers foundation theme runtime:

- light / dark / system mode
- resolved theme state
- root `.dark` class
- root `data-docs-theme` preset marker
- localStorage persistence
- first-paint script
- `DocsThemeSwitch`
- CSS preset contract
- theme parity profile

It also records the boundary between foundation runtime and product config.

## Fumadocs Evidence

Reference files and docs:

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\provider\base.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\theme-switch.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\client.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\css`
- `D:\Projects\Learning\gh\fumadocs\apps\docs\content\docs\ui\theme.mdx`

Observed protocol:

- `RootProvider` owns the theme provider.
- Fumadocs uses root `.dark` as the dark-mode source of truth.
- Default theme behavior is system-aware.
- `ThemeSwitch` uses icon buttons and supports `light-dark` and
  `light-dark-system`.
- Theme colors are preset CSS variable overrides, not component-local styles.
- Custom theme colors still flow through semantic variables.

## Local State

Current local foundation state:

- `app/assets/css/tokens.css` has `:root` light tokens and `.dark` dark tokens.
- `--docs-*` is the source token layer.
- `--color-fd-*` bridges to Fumadocs-like semantic tokens.
- `app/assets/css/tailwind.css` exposes tokens through Tailwind v4 `@theme`.
- `DocsHeader`, `DocsLayoutShell`, and `DocsSidebar` already expose a
  `theme-switch` slot.
- Stage 7.9 implementation now adds `DocsThemeConfig`, `useDocsTheme()`,
  `docs-theme.client.ts`, first-paint head injection, `DocsThemeSwitch`,
  `themes.css`, and a focused `theme` profile.
- Header, sidebar, and mobile nav render a default `DocsThemeSwitch` when the
  `theme-switch` slot is not replaced.

Remaining after Stage 7.9:

- runtime visual verification across the full viewport matrix.
- broader preset gallery, online color editing, and brand theme showcase remain
  product-layer work.

## Boundary Decision

Foundation owns:

- `light / dark / system`
- resolved mode
- root `.dark`
- root `data-docs-theme`
- localStorage persistence
- first-paint script
- `useDocsTheme()`
- `DocsThemeSwitch`
- theme preset CSS contract

Integration / plugin layer owns:

- `docsSiteConfig.theme`
- config defaults
- config to provider/switch/preset props adapter

Site product composition owns:

- brand theme galleries
- online color editors
- theme showcase pages

## Contract

Suggested types:

```ts
export type DocsThemeMode = 'light' | 'dark' | 'system'
export type DocsThemeResolvedMode = 'light' | 'dark'
export type DocsThemeSwitchMode = 'light-dark' | 'light-dark-system'
export type DocsThemePreset = 'default' | 'neutral' | 'black' | 'purple'

export type DocsThemeConfig = {
  enabled?: boolean
  defaultMode?: DocsThemeMode
  switchMode?: DocsThemeSwitchMode
  storageKey?: string
  preset?: DocsThemePreset
  disableTransitionOnChange?: boolean
}
```

Suggested defaults:

- `enabled: true`
- `defaultMode: 'system'`
- `switchMode: 'light-dark-system'`
- `storageKey: 'fuma-nuxt-theme'`
- `preset: 'default'`
- `disableTransitionOnChange: true`

Suggested files:

- `app/types/docs-theme.ts`
- `app/composables/useDocsTheme.ts`
- `app/plugins/docs-theme.client.ts`
- `app/components/docs/DocsThemeSwitch.vue`
- `app/components/docs/DocsThemeInitScript.vue` or equivalent head injection
- `app/assets/css/themes.css`

## Implementation Steps

1. Define foundation `DocsThemeConfig` and defaults.
2. Implement `useDocsTheme()`:
   - `mode`
   - `resolvedMode`
   - `setMode(mode)`
   - `toggleMode()`
   - `mounted`
   - `isDark`
3. Add client plugin/provider:
   - read storage
   - apply default mode
   - listen to `prefers-color-scheme`
   - sync root `.dark`
   - sync root `data-docs-theme`
   - optionally disable transitions during mode changes
4. Add first-paint script:
   - runs before hydration
   - reads storage and system preference
   - sets `.dark`
   - sets `data-docs-theme`
   - has no framework dependency
5. Add `DocsThemeSwitch.vue`:
   - `light-dark` mode: one toggle button
   - `light-dark-system` mode: three icon buttons
   - fixed button dimensions
   - `aria-label`
   - `aria-pressed`
   - visible focus state
   - active state via data attribute or class
6. Wire layout slots:
   - keep `theme-switch` replacement slot
   - render default `DocsThemeSwitch` when no replacement exists
   - header/sidebar/mobile nav share one theme state
   - replace the static sidebar placeholder
7. Add `themes.css`:
   - keep default tokens in `tokens.css`
   - keep `--docs-*` as source tokens
   - keep `--color-fd-*` as bridge tokens
   - preset overrides only semantic variables
8. Add product adapter:
   - `docsSiteConfig.theme` maps to foundation props
   - site config does not directly mutate DOM or component styles
   - current implementation reads config in the client plugin and first-paint
     script; components consume only `useDocsTheme()`.

## CSS Preset Rule

Preset CSS should look like semantic variable overrides:

```css
:root[data-docs-theme='purple'] {
  --docs-color-primary: #7c3aed;
  --docs-color-primary-foreground: #ffffff;
  --docs-color-accent: color-mix(in srgb, var(--docs-color-primary) 14%, var(--docs-color-secondary));
}

.dark[data-docs-theme='purple'] {
  --docs-color-primary: #c4b5fd;
  --docs-color-primary-foreground: #111827;
  --docs-color-accent: rgba(196, 181, 253, 0.16);
}
```

Do not add component-local theme selectors unless a component genuinely owns a
semantic variable.

## Verification

Static checks:

- `DocsThemeConfig` is not read directly by layout/sidebar from site config.
- Components use `--docs-*` / `--color-fd-*`.
- No new local hardcoded theme palette appears in shell/content components.
- `DocsThemeSwitch` has labels, pressed state, and focus-visible state.

Runtime smoke:

- default load sets `data-docs-theme`
- dark mode adds root `.dark`
- light mode removes root `.dark`
- reload preserves stored mode
- system mode follows `prefers-color-scheme`
- header/sidebar switch state stays consistent

First-paint check:

- with dark storage before load, first screenshot should not flash light
  background
- first-paint script should set root class before hydration

Code/theme check:

- code blocks use dark Shiki token in dark mode
- prose/content components do not drift into wrong colors
- preset changes only CSS variables, not DOM structure

Profile:

- `theme`
- The profile is registered in `docs-shell` and `full-regression`.

Viewport matrix:

- `1440x1000`
- `994x935`
- `390x844`

Profile assertions:

- root `.dark`
- root `data-docs-theme`
- localStorage key/value
- active switch state
- header/sidebar/mobile entry consistency
- `color-scheme` computed value
- body background/foreground tokens
- code block dark token
- no mobile/sidebar overlap

Failure categories:

- `theme-state`
- `first-paint`
- `token-preset`
- `slot-wiring`
- `code-dark-token`

## Linked Planning Entries

- [Roadmap Stage 7.9](./roadmap.md#stage-7-9-theme-runtime-preset)
- [Foundation Phase 5.5](./foundation-roadmap.md#phase-5-5-theme-runtime-preset)
- [Product Theme Adapter](./product-roadmap.md#phase-1-5-theme-config-preset-adapter)
