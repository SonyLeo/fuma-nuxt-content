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

::doc-callout{title="Info" tone="info"}
这是一个最小提示块。
::

::doc-callout{title="Warning" tone="warning"}
这个组件已经从旧的 Vue 沙盒迁移进来了。
::

## Cards

::doc-card-grid
::doc-card{title="Getting Started" href="/guide/getting-started" description="验证最小链路和内容渲染。"}
::
::doc-card{title="Components" href="/guide/components" description="查看 docs content components 的迁移状态。" badge="MVP"}
::
::

## Tabs

::doc-tabs{default-value="preview"}
#triggers
::doc-tab{label="Preview" value="preview" trigger=true}
::
::doc-tab{label="Code" value="code" trigger=true}
::

::doc-tab{value="preview" label="Preview"}
这是预览内容。
::

::doc-tab{value="code" label="Code"}
::doc-code-block{title="tokens.css" language="css" code=":root { --docs-color-primary: #2563eb; }"}
::
::
::

## Code tabs

## ::doc-code-tabs

tabs:

- label: pnpm
  language: bash
  code: pnpm install
- label: npm
  language: bash
  code: npm install

---

::

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
::doc-file{name="DocCodeBlock.vue"}
::
::doc-file{name="app.vue"}
::
::doc-file{name="nuxt.config.ts"}
::

## Inline TOC

::doc-inline-toc
::

## Type table

## ::doc-type-table

rows:

- name: title
  type: string
  description: Page title displayed in the docs header.
  required: true
- name: toc
  type: boolean
  description: Controls table of contents rendering for a page.
  default: true

---

::

## Steps

::doc-steps

<ol>
  <li>先搭 shell</li>
  <li>再迁内容组件</li>
  <li>最后补 toc 和 pager</li>
</ol>
::

## Preview

::doc-preview
#preview
::preview-counter
::

#description
这里验证 markdown 中的交互组件仍然可用。
::

#source
::doc-code-block{title="PreviewCounter.vue" language="vue" code="<PreviewCounter />"}
::
::
::
