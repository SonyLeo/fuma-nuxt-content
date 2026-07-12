---
title: Reka Migration
sectionLabel: Plan
status: active
type: migration
owner: foundation-ui
lastReviewed: 2026-07-12
---

# Reka Migration

## Purpose

This is the remaining migration and maintenance plan for Reka UI primitives.
It replaces the original multi-phase migration document.

## Boundary

- Reka owns primitive interaction behavior.
- Local `Ui*` wrappers own the stable project API and styling hooks.
- Feature components own documentation semantics and data contracts.
- CSS files own visuals and tokens.
- `DocsNode[]`, route matching, active ancestry, and page-tree construction
  remain project-owned.

## Completed Migration

- Popover
- Dialog and mobile sidebar sheet behavior
- Dropdown menu
- Collapsible and TOC in-flow disclosure
- Accordion
- Tabs
- Scroll area baseline
- Removal of unused feature-local overlay management

Current focused coverage exists across sidebar, TOC, layout provider, page
actions, theme, and content component Playwright specs.

## Remaining Work

### P0: wrapper maintenance

- Keep props, emits, slots, data attributes, and class hooks stable.
- Prevent feature components from importing Reka primitives directly.
- Remove manual document/window listeners only when the wrapper fully owns the
  corresponding behavior.
- Preserve SSR and hydration behavior.

### P1: accessibility review

- Verify focus entry and return.
- Verify Escape/outside dismissal ownership.
- Verify roving focus and keyboard navigation where relevant.
- Verify dialog modality and body scroll lock.

### Deferred: Reka Tree POC

Run an isolated POC only if the current sidebar tree fails a concrete gate that
cannot be solved within project-owned `DocsNode[]` semantics.

The POC must not replace:

- page-tree normalization
- route or active-path ownership
- folder link versus disclosure semantics
- hidden/context tree behavior

## Promotion Gate

A primitive migration is complete only when:

- the local public API is unchanged or an explicit compatibility decision is
  recorded
- at least one production consumer uses the wrapper
- focused accessibility and browser checks pass
- responsive behavior remains covered when applicable
- feature-local duplicate interaction code is removed
- the change does not move docs data ownership into Reka

Verification selection follows
[Verification Runbook](./verification-runbook.md).
