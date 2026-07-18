---
title: Components
description: 检视已经迁入 Nuxt Content 的 docs content components。
sectionLabel: Guide
order: 2
badge: MVP
---

这个页面用于下一轮接入 docs content components。

当前先验证：

- 文档页已经挂上自定义 shell
- 左侧 sidebar 已来自 navigation
- 正文列宽和节奏已脱离默认模板

## 下一步

- 继续补 `toc`
- 继续补 `pager`

## Callout

::doc-callout{title="Info" tone="info" icon="book"}
这是一个最小提示块。
::

::doc-callout{title="Warning" type="warning"}
这个组件已经从旧的 Vue 沙盒迁移进来了。
::

::doc-callout{title="Warn alias" type="warn"}
`warn` alias should normalize to the warning tone without changing layout.
::

::doc-callout{title="Tip alias" type="tip"}
`tip` alias should normalize to the information tone.
::

::doc-callout{title="Success" type="success"}
Success callouts keep the same shell while changing the accent.
::

::doc-callout{title="Error" type="error"}
Error callouts should not change root spacing, icon alignment, or rail height.
::

::doc-callout{title="Idea" type="idea"}
Idea callouts use the idea accent and full icon fill behavior.
::

::doc-callout{type="info"}
This callout intentionally has no title and includes a much longer sentence to
verify wrapping, content width, and rail stretching across desktop and narrow
viewports without changing the component height model.
::

::doc-callout-container{type="success" icon="library"}
::doc-callout-title
Container API
::

::doc-callout-description
The split container/title/description API mirrors the Fumadocs component
protocol for pages that need lower-level composition.
::
::

## Cards

::doc-card-grid
::doc-card{title="Getting Started" href="/guide/getting-started" description="验证最小链路和内容渲染。" icon="book"}
::
::doc-card{title="Components" href="/guide/components" description="查看 docs content components 的迁移状态。" badge="MVP" icon="components"}
::
::doc-card{title="External Reference" href="https://www.fumadocs.dev/docs/ui/components" description="Open the upstream component reference in a new tab." external=true icon="github"}
::
::doc-card{title="A very long card title that verifies wrapping without breaking the grid" icon="palette"}

### Hidden card heading

This card intentionally uses the default slot so the profile can verify body
content, long wrapping text, and non-link card behavior.
::
::

## Tabs

::doc-tabs{default-value="preview"}
#triggers
::doc-tab{label="Preview" value="preview" trigger=true}
::
::doc-tab{label="Code" value="code" trigger=true}
::

#default
::doc-tab{value="preview" label="Preview"}
这是预览内容。
::

::doc-tab{value="code" label="Code"}
这里是代码内容。
::
::

::doc-tabs{items='["Long Preview","Code Example","Install Guide"]' default-index=1 label="Mode"}
::doc-tab{value="long-preview"}
Simple mode keeps panels mounted while hiding inactive content.
::

::doc-tab{value="code-example"}
The second tab is active by default through `defaultIndex`.
::

::doc-tab{value="install-guide"}
A third tab helps verify list overflow and keyboard order.
::
::

::doc-tabs{items='["pnpm","npm"]' default-value="pnpm" group-id="package-manager" persist=true label="Package manager"}
::doc-tab{value="pnpm"}
pnpm uses the workspace package manager contract.
::

::doc-tab{value="npm"}
npm remains available for synchronized authoring examples.
::
::

::doc-tabs{items='["pnpm","npm"]' default-value="pnpm" group-id="package-manager" persist=true label="Synchronized"}
::doc-tab{value="pnpm"}
The synchronized group follows pnpm.
::

::doc-tab{value="npm"}
The synchronized group follows npm.
::
::

## Code tabs

<DocCodeTabs :tabs='[{"label":"pnpm","language":"bash","code":"pnpm install"},{"label":"npm","language":"bash","code":"npm install"}]'></DocCodeTabs>

## Accordion

::doc-accordions{type="single" default-value="token-system"}
::doc-accordion{title="Token system" id="token-system"}
token 体系应该先定义语义层，再让 shell 和内容组件共享消费。
::

::doc-accordion{title="Why not keep VitePress" id="why-not-vitepress"}
之前基于 VitePress 的尝试能复用部分内容经验，但 docs shell 协议始终不够贴近 Fumadocs。
::

::doc-accordion{title="What this protocol gives us" id="accordion-protocol"}
这套协议先把 root/item 分层固定下来。

hash 命中时可以自动展开，内容区也能继续沿用现有 prose 节奏。
::
::

## Files

::doc-files
::doc-folder{name="app" default-open=true}
::doc-folder{name="components" default-open=true}
:doc-file{name="DocCodeBlock.vue"}
:doc-file{name="DocCalloutWithAnExceedinglyLongFileNameForOverflow.vue"}
::
::

::doc-files
::doc-folder{name="server"}
:doc-file{name="api/content.ts"}
::
::doc-folder{name="node_modules" disabled=true}
:doc-file{name="hidden-package.js"}
::
:doc-file{name="app.vue"}
:doc-file{name="nuxt.config.ts"}
::
::

## Inline TOC

::doc-inline-toc
::

::doc-inline-toc{title="Collapsed contents" default-open=false}
::

### Inline TOC nested item

This nested heading exists so the inline table of contents can verify depth
indentation instead of only top-level links.

## Type table

<DocTypeTable :rows='[{"id":"page-title","name":"title","type":"string","description":"Page title displayed in the docs header.","required":true,"typeDescription":"string"},{"id":"page-toc","name":"toc","type":"boolean","description":"Controls table of contents rendering for a page.","default":"true"},{"id":"page-legacy","name":"legacy","type":"boolean","description":"Deprecated compatibility flag kept for migration examples.","deprecated":true,"default":"false"},{"id":"page-on-change","name":"onChange","type":"(value) => void","description":"Callback fired when the page option changes.","typeDescription":"(value: string, event: Event) => void","typeDescriptionLink":"/guide/components","parameters":[{"name":"value","description":"The next option value."},{"name":"event","description":"The original browser event."}],"returns":"void"}]'></DocTypeTable>

## Steps

::doc-steps

<ol>
  <li>先搭 shell</li>
  <li>再迁内容组件</li>
  <li>最后补 toc 和 pager</li>
</ol>
::

::doc-steps
::doc-step
Install dependencies with `pnpm install` before running the local docs server.
::

::doc-step

### Verify the shell

Open the [components page](/guide/components) and verify the shell, body
components, and page tail all render together.
::

::doc-step
This intentionally longer step verifies wrapping, marker alignment, and rail
height when a step body spans more than one line on narrow viewports.
::
::

## Prose defaults

Default prose links include an [internal docs link](/guide/getting-started), an
[external docs link](https://www.fumadocs.dev), and `inline code` in the same
paragraph.

| Name  | Type   | Notes                                     |
| ----- | ------ | ----------------------------------------- |
| title | string | Used by headings and page metadata.       |
| link  | URL    | Verifies table overflow and inline links. |

![TinyRobot docs favicon](/favicon.ico)

## Preview

::doc-preview{description="这里验证 markdown 中的交互组件仍然可用。" source-title="PreviewCounter.vue" source-language="vue" source-code="<PreviewCounter />"}
#preview
::preview-counter
::
::

::doc-install-card{title="Install Preview" description="Copy the command into a local docs workspace." command="pnpm dlx fuma-nuxt-content add preview"}
::
