---
title: Product Roadmap
sectionLabel: Plan
---

# Product Roadmap

## 目标

产品层建立在基础层之上。

它不负责改写 docs tree 和 page protocol。

它只负责把文档系统变成完整产品。

## 产品层范围

产品层包含：

- 站点配置
- 多内容源
- blog / changelog / api
- 搜索
- page actions
- feedback
- llms / mcp
- sitemap / rss / seo
- image pipeline
- story / playground
- 多版本 / 国际化

## 产品层设计原则

### 1. 不反向污染基础层

产品能力不能破坏：

- `DocsNode`
- docs tree
- layout protocol
- page protocol

### 2. 以配置和扩展位接入

产品能力优先通过：

- config
- composable
- page slot
- adapter
- plugin

接入，而不是直接把业务逻辑写死在基础组件中。

## Phase 1：站点级配置层

### 目标

建立类似 `fumapress` 的站点配置层。

### 需要完成的事情

1. 建立 site config 文档协议
2. 统一 nav links schema
3. 统一 Git metadata config
4. 统一首页 links schema

### 推荐后续形态

```text
app
├─ config
│  ├─ site.ts
│  ├─ docs.ts
│  └─ links.ts
```

### 参考源码

- `../fumapress-dev/apps/docs/press.config.tsx`
- `../fumapress-dev/packages/core/src/config.ts`

### 验收标准

- 品牌名、链接、仓库信息不再散落在组件里
- page actions / navbar / footer 都能读统一配置

## Phase 2：Page Actions

### 目标

给文档页补充产品级动作能力。

### 第一批

- GitHub source link
- Copy Markdown

### 第二批

- Open in ChatGPT
- Open in Claude
- Open in Cursor

### 参考源码

- `../fumadocs-dev/packages/base-ui/src/layouts/shared/page-actions.tsx`
- `../fumapress-dev/packages/core/src/layouts/docs.tsx`

### 建议接入位

- `DocsPageHeader`
- `DocsPageFooter`

### 验收标准

- page actions 不影响 page protocol
- actions 可统一配置开关

## Phase 3：Blog / Changelog / 多 source

### 目标

在 docs 之外补齐站点内容类型。

### 需要完成的事情

1. 增加 `blog`
2. 预留 `changelog`
3. 后续预留 `api`

### 推荐内容结构

```text
content
├─ docs
├─ blog
└─ changelog
```

### 参考源码

- `../fumapress-dev/apps/docs/source.config.ts`
- `../fumapress-dev/apps/docs/press.config.tsx`

### 验收标准

- docs 和 blog 不共用混乱 collection
- 站点已具备多 source 语义

## Phase 4：搜索

### 目标

补站内搜索。

### 推荐顺序

1. 先静态搜索
2. 再高级搜索

### 参考源码

- `../fumapress-dev/packages/core/src/plugins/flexsearch.ts`
- `../fumapress-dev/packages/core/src/plugins/orama-search.ts`
- `../fumapress-dev/packages/core/src/plugins/internal/defaults.ts`

### 验收标准

- 搜索配置可开关
- 没开搜索时 UI 自动隐藏

## Phase 5：SEO / 站点产物

### 目标

补站点生成时常见产物。

### 包含能力

- sitemap
- rss
- llms.txt
- link validation

### 参考源码

- `../fumapress-dev/packages/core/src/plugins/sitemap.ts`
- `../fumapress-dev/packages/core/src/plugins/llms.txt.ts`
- `../fumapress-dev/packages/core/src/plugins/link-validation.tsx`

### 验收标准

- 这些能力不需要改动 docs 组件协议
- 都通过产品层配置接入

## Phase 6：反馈和协作能力

### 目标

补产品交互能力。

### 包含能力

- 文档反馈
- GitHub issue / PR 引导
- 页尾反馈组件

### 参考源码

- `../fumapress-dev/packages/feedback/src/index.tsx`

### 验收标准

- 反馈能力是 page slot，不侵入正文结构

## Phase 7：AI 能力

### 目标

补 AI / MCP / docs assistant 能力。

### 包含能力

- llms
- mcp
- docs chat
- 索引驱动问答

### 参考源码

- `../fumapress-dev/packages/ai/src/index.tsx`
- `../fumapress-dev/packages/ai/src/mcp.ts`
- `../fumapress-dev/packages/ai/src/chat.tsx`

### 注意

这部分一定后置。

前提是：

- 基础层 page protocol 已稳定
- 右侧扩展位已经存在

## Phase 8：Story / Playground

### 目标

补文档交互式示例能力。

### 建议路线

不要复刻 React `@fumadocs/story`。

直接做 Vue 版 story 协议：

- `*.story.ts`
- schema-driven controls
- preview renderer
- page embedded playground

### 参考对象

- `../fumadocs-dev/packages/story/src/index.tsx`
- `../fumadocs-dev/packages/story/src/client/with-control.tsx`

### 验收标准

- story 系统不依赖 React
- story 系统不直接写死到 Markdown runtime

## Phase 9：多版本 / 国际化

### 目标

补大型文档站常见能力。

### 包含能力

- 版本切换
- 多语言
- locale-aware docs tree

### 前提

必须在这些能力都稳定后再做：

- docs tree
- nav schema
- page actions
- 多 source

## 产品层完成标志

产品层完成后，应满足：

- 站点配置层成立
- docs / blog / changelog 多 source 成立
- 搜索和 page actions 成立
- seo / llms / sitemap / feedback 成立
- story / playground 成立
- 大型文档站能力可继续扩展

## 当前阶段建议

产品层当前只做规划，不做实现。

当前最早可以先准备的只有：

1. site config schema
2. page actions 预留插槽

其他全部等基础层协议稳定后再做。
