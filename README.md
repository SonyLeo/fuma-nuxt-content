# Fumadocs-Aligned Nuxt Content Foundation

This project is a Nuxt Content docs foundation that borrows Fumadocs protocols
and assistant-ui docs shell rhythm while staying Vue-first.

The current focus is foundation work: content protocol, docs tree, layout/page
primitives, design tokens, CSS layering, and docs content components. Product
features such as search, AI, feedback, blog, changelog, and TinyRobot component
demos are intentionally later.

Planning starts here:

- `design/roadmap.md`
- `design/foundation-roadmap.md`
- `design/foundation-alignment-matrix.md`
- `design/verification-runbook.md`
- `design/development-workflow-audit.md`

## Setup

Make sure to install dependencies:

```bash
pnpm install
```

## Development Server

Start the development server:

```bash
pnpm dev
```

Playwright automatically starts the E2E Nuxt server when needed and reuses a
healthy local server when one is already available.

Useful commands:

```bash
pnpm test:nuxt
pnpm test:e2e -- tests/e2e/sidebar.spec.ts --project=chromium-desktop
pnpm test:e2e:full
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```
