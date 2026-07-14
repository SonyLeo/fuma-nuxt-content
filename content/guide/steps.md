---
title: Steps
description: Markdown Steps authoring transform fixture.
sectionLabel: Components
---

This fixture page keeps the component navigation route valid while exercising
the ordinary Markdown Steps authoring contract.

## 1. Install dependencies [#install-dependencies]

Install the project dependencies with pnpm.

```bash
pnpm install
```

### Pick a package manager [step]

- Keep the lockfile committed.
- Prefer the package manager declared by the project.

> Nested Steps keep ordinary Markdown blocks as semantic children.

### 2. Confirm the lockfile

The lockfile should remain in the review diff.

## Configure workspace [step]

Use the workspace defaults before changing product-layer options.

## 2026. Roadmap

This heading looks numeric, but it is not a Step because it does not start at
one for this boundary.

::doc-card-grid
::doc-card{title="Component-local heading fixture"}

### Hidden component heading

Component-local headings remain outside the page TOC.
::
::

## 1. Restart after boundary

This starts a fresh sequence after the ordinary boundary.

## 3. Gap remains ordinary

The gap is not consumed as a Step.
