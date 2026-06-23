---
title: Components
description: 检视已经迁入 Nuxt Content 的 docs content components。
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

::doc-callout{title="Warning" tone="warn"}
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
  ::doc-tab{label="Preview" value="preview" trigger="true"}
  ::
  ::doc-tab{label="Code" value="code" trigger="true"}
  ::

  ::doc-tab{value="preview" label="Preview"}
  这是预览内容。
  ::

  ::doc-tab{value="code" label="Code"}
  ::doc-code-block{title="tokens.css" language="css" code=":root { --docs-color-primary: #2563eb; }"}
  ::
  ::
::

## Steps

::doc-steps
1. 先搭 shell
2. 再迁内容组件
3. 最后补 toc 和 pager
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
