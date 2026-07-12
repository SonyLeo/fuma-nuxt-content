---
title: Parity Case Summary
sectionLabel: Archive
status: historical
type: archive
owner: foundation-ui
lastReviewed: 2026-07-12
---

# Parity Case Summary

## Purpose

This is a curated summary of reusable parity lessons. Full historical plans,
profiles, diffs, and command output remain available in Git history. Daily
parity work starts from the `fumadocs-parity` skill and current project rules.

## General Reconstruction Loop

1. Define one narrow surface, fixture, and viewport set.
2. Inspect upstream source ownership and runtime DOM/state.
3. Inspect local normalized data and runtime output.
4. Classify the mismatch before editing.
5. Fix outside-in: protocol, wrapper, state, layout, then fine styling.
6. Verify semantic state before visual output.

Screenshots are review artifacts, not the primary diagnosis method.

## Sidebar Lessons

- Separator, folder, page, index link, and external link are different tree
  semantics.
- Do not infer “should be clickable” from appearance alone.
- Folder navigation and folder disclosure require separate controls and state.
- Mobile drawer and desktop sidebar may share tree data without sharing layout
  mechanics.
- Active ancestry belongs to the normalized tree/runtime, not CSS selectors.
- Drawer validation must include overlay, Escape, scroll lock, close on
  navigation, and focus return.

## TOC Lessons

- Desktop rail and narrow popover are separate responsive contracts.
- Active heading state should derive from observed headings and scroll state,
  not arbitrary last-item fallbacks.
- Sticky geometry must account for header height and viewport width.
- A floating popper wrapper is not appropriate for an in-flow TOC disclosure.
- Avoid synthetic parent-active state when the observed heading is a child.

## Provider And Layout Lessons

- Shared slot defaults and replacement slots need explicit ownership.
- Optional Boolean props that fall back to provider state must preserve
  `undefined`; Vue Boolean casting can otherwise shadow provider state.
- Home and not-found shells should reuse layout options rather than fork the
  navigation contract.
- Arbitrary fixture content-count thresholds are brittle; assert stable
  ownership and surface presence instead.

## Theme Lessons

- Root state must be correct before individual switch styling is evaluated.
- First-paint behavior is part of the theme contract.
- Dark code tokens must remain reachable through the same root state.
- Presets change variables, not component DOM.

## Content Component Lessons

- UI component parity and Markdown authoring transforms are separate gates.
- Keep inactive tabs mounted when the public contract requires persistence.
- Long labels, nested files, mobile columns, and overflow require explicit
  fixtures.
- Interactive profiles should wait for semantic state, not fixed sleeps.

## Verification Lessons

- Prefer Playwright for local actionability, focus, responsive, and hydration
  contracts.
- Use the legacy parity runner only for upstream reference capture, hidden DOM,
  or surfaces without a Playwright contract.
- Classify server, content database, hydration, and UI failures separately.
- Current executable policy lives in
  [Verification Runbook](../verification-runbook.md).
