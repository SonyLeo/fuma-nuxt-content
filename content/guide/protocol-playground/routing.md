---
title: Routing Contract
description: 验证被 meta 排除的页面仍然保持正常路由能力。
sectionLabel: Guide
slug: route-contract
---

这个页面现在同时用来验证两件事：

- `!archive` 只影响 docs tree 呈现，不影响实际内容路由
- `slug` 可以把文件路径和最终访问路径拆开

## 预期

- `archive.md` 不出现在 sidebar
- 直接访问 `/guide/protocol-playground/archive` 仍然可以打开
- 直接访问被排除页面时，breadcrumb/headline 仍应从 context tree 找回目录上下文
- 当前文件名仍然是 `routing.md`
- 实际访问路径已经变成 `/guide/protocol-playground/route-contract`
- 旧路径 `/guide/protocol-playground/routing` 不再作为最终 docs route 使用
- pager 只基于当前 docs tree 里可见的 page 节点计算

这能帮助我们把“源内容文件路径”和“对外 docs route”明确拆成两层协议。

## Path Policy

- `sourcePath` 只用于内容查询、`meta.json` 匹配和 `pagesIndex` 解析
- `path` 只用于最终 route、sidebar、breadcrumb 和 pager 消费
- 相对 `slug` 只替换当前 source path 的最后一段
- 绝对 `slug` 视为最终 docs route
- route path 比较前会做 segment 级 decode/encode 归一化
- 派生 route 冲突应 fail fast
