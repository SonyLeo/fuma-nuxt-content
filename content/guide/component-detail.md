---
title: Accordion
description: Add accordions to your documentation.
sectionLabel: Components
order: 3
badge: Fixture
toc: true
---

::doc-preview{variant="sandbox"}
#preview
<div class="fd-fixture-preview-demo">Accordion preview</div>
::

::doc-install-card{command="npx @fumadocs/cli@latest add accordion"}
::

## Usage

Use accordions when a section has optional details that should not dominate the
page flow.

::doc-callout{title="Info" tone="info"}
Keep the first visible example close to the install command.
::

<DocCodeTabs :tabs='[{"label":"MDX","language":"mdx","code":"::doc-accordions\\n::doc-accordion{title=Question}\\nAnswer\\n::\\n::"},{"label":"Vue","language":"vue","code":"import { DocAccordions } from &apos;@/components/content&apos;"}]'></DocCodeTabs>

### Basic example

Place the short version first so readers can scan the component contract before
they compare variants.

### Nested details

Nested headings are useful for validating the TOC rail because the path has to
move between parent and child offsets without breaking the active indicator.

## Variants

Use variants to decide how much state the accordion owns and how much state the
page keeps nearby.

### Single item

The single-item variant keeps one panel open at a time. It works well for FAQ
sections where each answer should replace the previous one.

### Multiple items

The multiple-item variant lets several panels stay open together. It fits
configuration references and migration checklists.

## Behavior

Accordions should keep motion subtle and preserve keyboard navigation.

### Keyboard flow

The trigger remains the focus target. Enter and Space toggle the panel, while
Tab moves through interactive content inside the open panel.

### Reduced motion

When the user prefers reduced motion, the panel should still reveal content
clearly without relying on a long height animation.

## References

### Accordions

<DocTypeTable :rows='[{"id":"accordions-type","name":"type","type":"&apos;single&apos; | &apos;multiple&apos;","description":"Controls whether one or many accordion items can be open.","default":"single"},{"id":"accordions-default-value","name":"defaultValue","type":"string","description":"The item id that should be open on first render."}]'></DocTypeTable>

### Accordion

<DocTypeTable :rows='[{"id":"accordion-title","name":"title","type":"string","description":"The visible trigger label for the accordion item.","required":true},{"id":"accordion-id","name":"id","type":"string","description":"Optional stable hash target for direct links."}]'></DocTypeTable>

## Composition notes

Use composition notes to explain when an accordion should be paired with other
docs primitives.

### Inside callouts

Keep callout accordions short. If the body becomes a full task, move it into a
regular section instead.

### Inside previews

Preview accordions should demonstrate state changes without hiding the primary
example controls.
