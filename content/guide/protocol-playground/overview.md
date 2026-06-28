---
title: Overview
description: 用真实内容验证目录控制协议是否按预期生效。
sectionLabel: Guide
slug: entry-contract
---

这个目录没有 `index.md`，而是通过 `meta.json` 里的 `pagesIndex: "overview"` 把当前页绑定成目录入口。

同时，这个页面还额外使用了 `slug: entry-contract`，用来验证：

- `pagesIndex` 仍然按 source file 语义匹配 `overview`
- 目录入口最终 route 可以和 source file 名称不同
- 非 ASCII slug 会被编码成稳定 route path

当前这组内容专门验证四件事：

- 目录标题应直接指向当前页
- sidebar 中应出现一个外链 `Fumadocs`
- sidebar 中应出现一个带中文 source file 的页面
- `archive.md` 不应出现在 sidebar
- `archive.md` 直接访问时仍应保留 breadcrumb 上下文
- `link-index` 应验证 `pagesIndex` 指向 link string 的 fallback 语义
- 剩余页面应按 `z...a` 反向排序
- `pagesIndex + slug` 组合后，目录入口仍然稳定
- 页面可以显式覆盖 breadcrumb inclusion / root override

## 验证点

- 目录入口：`Protocol Playground` 应跳到 `/guide/protocol-playground/entry-contract`
- `pagesIndex`：仍然通过 `overview` 识别当前页，而不是依赖最终 route 名称
- 外链：`external:[Fumadocs](https://fumadocs.dev)`
- 编码：`路径设计.md` + `slug: 真实 路径`
- 排除：`!archive`
- fallback：被排除页面不进入可见导航，但直接访问时使用 context tree 还原路径
- link index：`link-index/meta.json` 使用 `pagesIndex` 指向外链
- 反向 rest：`z...a`
- breadcrumb：`archive.md` 可单独开启 `includePage / includeSeparator / includeRoot override`

你仍然可以直接打开被排除的页面：[Archive Note](/guide/protocol-playground/archive)。

::doc-callout{title="Protocol Check" tone="info"}
这一组 fixture 不追求内容完整，只负责把协议行为钉实。
::
