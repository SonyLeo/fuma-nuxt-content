---
title: Archive Note
description: 这个页面故意保留为可访问但不进入 sidebar 的样本。
sectionLabel: Guide
breadcrumbPage: true
breadcrumbSeparator: true
breadcrumbRoot:
  title: Protocol Root
  path: /guide/protocol-playground/entry-contract
---

这个页面存在于内容源里，但会被 `meta.json` 的 `!archive` 排除出 docs tree。

## 作用

- 验证排除语法只影响导航
- 验证直接访问页面仍然可用
- 给后续 breadcrumb / pager 规则提供一个边界样本

## Breadcrumb 策略

这个页面还专门验证 page-level breadcrumb options：

- 当前页应允许进入 breadcrumb
- 当前目录前面的 separator 应允许进入 breadcrumb
- root breadcrumb 应允许被页面显式 override
