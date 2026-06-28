---
title: Product Roadmap
sectionLabel: Plan
---

# Product Roadmap

## 目标

产品层建立在 foundation 之上。

它不负责补基础 UI、重写 docs tree、重写 page protocol，也不直接改 Markdown rendering contract。

它只负责把已经稳定的 docs foundation 变成完整站点产品。

## 进入产品层的前置条件

进入产品层前，foundation 必须完成 Exit Gate。

必须可用：

- `DocsNode[]`
- source path / route path / slug transform
- directory meta / context tree
- default MDX/MDC components mapping
- link protocol / relative link
- shared layout options contract
- nav links contract
- layout/page slots
- root provider / theme shell / search trigger slot
- left sidebar / right TOC / mobile nav
- breadcrumb / pager / footer
- prose table / image / media
- code block / code tabs / copy button
- preview / code preview
- P0 docs content components

如果产品层工作需要新增这些基础能力，说明还不能进入产品层，应先回到 `design/foundation-roadmap.md`。

## 产品层范围

产品层包含：

- site config 数据来源
- layout shared options 生成
- nav links 数据生成
- Git metadata config
- page actions
- Copy Markdown
- GitHub source link
- search engine / index / API
- search provider config
- feedback
- blog / changelog / api 多 source
- sitemap / rss / SEO
- llms.txt
- link validation
- image pipeline
- AI / MCP / docs assistant
- story / playground runtime
- i18n / versioning 路由策略
- deploy / generate strategy

产品层不包含：

- default MDX components
- code block shell
- prose table
- sidebar implementation
- TOC implementation
- base layout grid
- UI primitives
- heading/link rendering protocol

## 设计原则

### 1. 不反向污染 foundation

产品能力不能破坏：

- `DocsNode`
- docs tree
- default MDX/MDC mapping
- layout protocol
- page protocol
- link protocol
- code/prose/preview contract

### 2. 以配置和扩展位接入

产品能力优先通过：

- config
- composable
- page slot
- layout slot
- provider slot
- adapter
- plugin

接入。

### 3. 产品层生成 props，不定义底层 contract

例如：

- `site config` 可以生成 `nav.title`
- `site config` 可以生成 `links`
- `Git metadata config` 可以生成 `githubUrl`
- `search config` 可以启用 search provider

但：

- `nav` 的形状属于 foundation
- `links` 的 item type 属于 foundation
- `searchToggle` slot 属于 foundation
- `DocsPageFooter` slot 属于 foundation

## 参考依据

### Fumapress

Fumapress 的产品层模式是：

- `defineConfig()`
- `content`
- `site`
- `meta`
- `layouts`
- `plugins`
- `adapters`

关键源码：

- `D:\Projects\Learning\gh\fumapress\packages\core\src\config.ts`
- `D:\Projects\Learning\gh\fumapress\packages\core\src\layouts\docs.tsx`
- `D:\Projects\Learning\gh\fumapress\packages\core\src\lib\types.ts`
- `D:\Projects\Learning\gh\fumapress\packages\core\src\plugins\flexsearch.ts`
- `D:\Projects\Learning\gh\fumapress\packages\core\src\plugins\sitemap.ts`
- `D:\Projects\Learning\gh\fumapress\apps\docs\press.config.tsx`

对当前项目的结论：

- 不做完整 Fumapress router/plugin runtime
- 先做最小 site config
- 再做 page actions
- search/sitemap/llms/feedback/blog 后置

### Fumadocs UI

Fumadocs UI 的 `BaseLayoutProps` 和 layout slots 是 foundation 参考，不是产品层参考。

产品层只消费这些 contract。

关键源码：

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\page-actions.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\index.tsx`

## Phase 1：Site Config

### 目标

建立最小站点配置层，作为产品能力的数据来源。

### 前置

foundation 已有：

- `DocsBaseLayoutOptions`
- `DocsNavOptions`
- `DocsLinkItem`
- page action slot
- search trigger slot
- theme/language slots

### 需要完成

1. 建立 `app/config/site.ts`
2. 定义站点基础信息：
   - name
   - description
   - baseUrl
   - logo/title
3. 定义 repository/git 信息：
   - provider
   - owner
   - repo
   - branch
   - rootDir
4. 定义 shared links 数据：
   - docs
   - components
   - GitHub
   - external links
5. 提供 config -> foundation layout props 的 adapter

### 不做

- 不定义新的 nav item type
- 不重写 navbar
- 不实现 page actions
- 不实现 search

### 验收

- 品牌名不再散落在组件里
- GitHub URL 不再散落在组件里
- navbar/home/footer 能通过同一份 config 获取数据

## Phase 2：Page Actions

### 目标

补文档页产品级动作。

### 第一批

- GitHub source link
- Copy Markdown
- Open Markdown

### 第二批

- Open in ChatGPT
- Open in Claude
- Open in Cursor

### 接入位

- page header slot
- page footer slot
- page action area

### 依赖 foundation

- button primitive
- popover/menu primitive
- copy button state
- link protocol
- page source path / route path
- Git metadata config

### 验收

- actions 可统一开关
- actions 不改变 page protocol
- Copy Markdown 不要求重写 `DocsBody`
- source link 由 config 和 page path 派生

## Phase 3：Search Product

### 目标

补站内搜索。

### 前置

foundation 已有：

- search trigger slot
- search dialog shell 或 replacement slot
- structured data extraction strategy
- default result rendering contract

### 推荐顺序

1. 先静态搜索
2. 再 API search
3. 再高级 provider

### 可选 engine

- FlexSearch
- Orama
- Algolia
- Typesense

### 不做

- 不在搜索阶段重写 search trigger
- 不在搜索阶段重写 dialog primitive
- 不在搜索阶段重写 Markdown result renderer

### 验收

- 搜索配置可开关
- 没开搜索时 UI 自动隐藏
- 搜索 provider 替换不影响 layout contract

## Phase 4：Page Metadata Product

### 目标

补文档页产品级元信息。

包含：

- last updated
- edit on GitHub
- view source
- page metadata footer
- authors / contributors 预留

### 依赖 foundation

- page footer slot
- page action slot
- Git metadata config
- source path

### 验收

- metadata 不进入 docs tree
- metadata 不污染 page body

## Phase 5：多 Source

### 目标

在 docs 之外补站点内容类型。

包含：

- blog
- changelog
- api

推荐结构：

```text
content
├─ docs
├─ blog
└─ changelog
```

### 前置

- site config 成立
- nav links contract 成立
- Home layout 可显示不同入口

### 验收

- docs 和 blog 不共用混乱 collection
- 多 source 不反向污染 docs tree

## Phase 6：SEO / 站点产物

### 目标

补站点生成常见产物。

包含：

- sitemap
- rss
- canonical
- Open Graph
- metadata
- llms.txt
- link validation

### 验收

- 产物由 config/plugin 生成
- 不要求 docs components 感知 SEO

## Phase 7：Feedback

### 目标

补产品反馈能力。

包含：

- helpful / not helpful
- feedback form
- GitHub issue 引导
- page footer feedback

### 前置

- page footer slot
- dialog/form primitive

### 验收

- feedback 是 page slot
- feedback 不侵入正文结构

## Phase 8：AI / MCP / Assistant

### 目标

补 AI 文档助手能力。

包含：

- llms
- MCP
- docs chat
- search-driven QA
- page actions 中的 AI shortcut

### 前置

- search 或 structured data
- right rail / floating action slot
- page action slot

### 验收

- AI 不改变 docs tree
- AI 不硬编码到 DocsPage body

## Phase 9：Story / Playground

### 目标

补交互式示例能力。

建议路线：

- Vue-native story protocol
- schema-driven controls
- preview renderer
- source preview
- page embedded playground

### 前置

- foundation preview frame
- code preview
- tabs/popover/dialog primitives

### 验收

- story 系统不依赖 React
- story 系统不直接写死到 Markdown runtime

## Phase 10：Versioning / I18n

### 目标

补大型文档站能力。

包含：

- version switcher
- language switcher
- locale-aware route
- locale-aware docs tree
- translated nav links

### 前置

- nav links contract
- language slot
- layout tabs/root switcher
- multi source
- page actions

### 验收

- i18n/versioning 不污染单语言基础 tree
- language/version switch 是 layout slot，不是 sidebar hack

## 当前阶段建议

当前不进入产品层实现。

先完成 foundation 的：

1. default MDX/MDC components mapping
2. link protocol / relative link
3. shared layout options
4. nav links contract
5. search/theme/language slots
6. UI primitives baseline
7. code/prose/preview gate

完成后，产品层第一步只做：

1. site config
2. config -> layout props adapter
3. Git metadata config
4. page actions 第一批
