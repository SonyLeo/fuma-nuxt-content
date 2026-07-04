---
title: Product Roadmap
sectionLabel: Plan
---

# Product Roadmap

## 目标

上层能力建立在 foundation 之上。

它不负责补基础 UI、重写 docs tree、重写 page protocol，也不直接改 Markdown rendering contract。

本文件现在按两层描述：

1. 集成 / 插件层：把 foundation 暴露成可配置、可替换的站点能力。
2. 站点产品组合层：把 foundation 和集成层输出组合成具体站点体验。

这个边界修正来自 Fumadocs / Fumapress / assistant-ui 源码复核：
Fumadocs 自身已经提供大量基建；Fumapress 主要做 config、adapter、server
plugin、routing 和 output routes；assistant-ui 则在 Fumadocs contract 上做站点
产品体验组合。

## 进入上层能力的前置条件

进入集成 / 插件层或站点产品组合层前，foundation 必须完成 Exit Gate。

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

如果上层工作需要新增这些基础能力，说明还不能推进该能力，应先回到
`design/foundation-roadmap.md`。

## 上层能力范围

### 集成 / 插件层

对应 Fumapress 的主要价值：使用 Fumadocs 基建，并通过配置、adapter、plugin
和 route/output 封装成可消费能力。

包含：

- site config 数据来源
- layout shared options 生成
- nav links 数据生成
- Git metadata config
- theme config / preset adapter
- page actions 数据编排
- Copy Markdown / GitHub source link 的数据读取与动作编排
- search engine / index / API
- search provider config
- feedback backend / GitHub issue template
- multi source loader / adapter
- sitemap / rss / SEO
- llms.txt / llms-full.txt / per-page markdown export
- link validation
- image pipeline / CDN adapter
- deploy / generate strategy

### 站点产品组合层

对应 assistant-ui docs 的主要价值：消费 Fumadocs contract，并围绕具体产品形态
组合 header、sidebar、TOC actions、pager、assistant panel、platform filter、
业务页面和 analytics。

包含：

- brand / home / product pages
- docs shell 的站点级组合与 replacement
- blog / changelog / api 具体页面体验
- AI / MCP / docs assistant 入口
- story / playground runtime
- i18n / versioning 路由策略
- OpenAPI / AsyncAPI / type generation
- analytics / conversion / business-specific routes

上层能力不包含：

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

上层能力不能破坏：

- `DocsNode`
- docs tree
- default MDX/MDC mapping
- layout protocol
- page protocol
- link protocol
- code/prose/preview contract

### 2. 以配置和扩展位接入

上层能力优先通过：

- config
- composable
- page slot
- layout slot
- provider slot
- adapter
- plugin

接入。

### 3. 上层能力生成 props，不定义底层 contract

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

Fumapress 的集成 / 插件层模式是：

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

- Fumapress 不是替代 Fumadocs 的 docs UI 基建，而是对 Fumadocs source/layout/page
  contract 的应用框架封装。
- 当前项目不能照搬其 React/Waku 实现，但可以借鉴 config builder、adapter、
  server plugin 和 output route 的分层。
- 先保持当前轻量 site config，不急着做完整 plugin runtime。
- search/sitemap/llms/feedback 这类能力应视为集成 / 插件层能力，而不是基础
  UI 能力。
- blog/changelog/API 需要先有 multi source baseline，再进入站点产品组合层。

### Fumadocs UI

Fumadocs UI 的 `BaseLayoutProps` 和 layout slots 是 foundation 参考，不是上层能力参考。

集成 / 插件层和站点产品组合层都只消费这些 contract。

关键源码：

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\page-actions.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\index.tsx`

## Phase 1：Site Config

### 目标

建立最小站点配置层，作为上层能力的数据来源。

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
5. 定义 theme 数据：
   - enabled
   - defaultMode
   - switchMode
   - storageKey
   - preset
6. 提供 config -> foundation layout/theme props 的 adapter

### 不做

- 不定义新的 nav item type
- 不重写 navbar
- 不实现 page actions
- 不实现 search
- 不在 site config 阶段实现 theme runtime
- 不在 site config 阶段生成任意颜色算法

### 验收

- 品牌名不再散落在组件里
- GitHub URL 不再散落在组件里
- navbar/home/footer 能通过同一份 config 获取数据
- theme config 只生成 provider/switch/preset props，不直接操作 DOM

<a id="phase-1-5-theme-config-preset-adapter"></a>

## Phase 1.5：Theme Config / Preset Adapter

当前状态：已完成第一轮。

### 目标

在 Foundation Theme Runtime / Preset Gate 完成后，把站点配置接入主题系统。

Foundation runtime 设计见
[`design/theme-runtime-parity-plan.md`](./theme-runtime-parity-plan.md)。

### 前置

foundation 已有：

- `DocsThemeConfig`
- `useDocsTheme()`
- theme client plugin
- first-paint inline script
- `DocsThemeSwitch`
- `themes.css` preset contract

### 需要完成

1. 已在 `app/types/docs-site.ts` 暴露 `theme?: DocsThemeConfig`。
2. 已在 `app/config/docs-site.ts` 配置默认 theme。
3. 已通过 theme client plugin 和 first-paint script 把 site config theme 转成 foundation runtime 输入。
4. 允许 site config 选择 preset，但不允许组件读取 site config 后局部改色。
5. 为未来品牌主题预留 `preset` 扩展，不实现在线颜色编辑器。

### 不做

- 不实现 Fumadocs 全量 theme gallery。
- 不实现运行时任意色板生成。
- 不把 theme mode 写进 docs tree、page protocol 或 Markdown frontmatter。
- 不让 blog/changelog/API 单独定义不兼容的主题系统。

### 验收

- 删除或禁用 `theme` config 时，foundation 默认主题仍能独立工作。
- 修改 `preset` 后，只改变 CSS variables，不改变组件 DOM 结构。
- theme config 不破坏 `theme-switch` slot replacement。
- profile 能在默认 config 和至少一个 preset config 下通过。

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

## 当前阶段状态

Foundation UI Gate 已完成第一轮。

集成 / 插件层第一步也已完成第一轮：

1. site config
2. config -> layout props adapter
3. nav links schema 第一轮消费
4. Git metadata config/helper
5. page actions 第一批
6. GitHub source/edit link
7. Copy Markdown

当前实现结论：

- site config 是产品数据入口。
- layout 仍消费 foundation props，不直接读取产品 config。
- page actions 通过 `DocsPage` slot 挂载，不改 page foundation contract。
- GitHub source/edit 基于 page `sourcePath`，不基于 route path 猜文件。
- Copy Markdown 当前使用 Vite raw import 读取 `content/**/*.md(x)`，避免引入 Node type 依赖。

集成 / 插件层增强第一轮也已完成：

1. search config / local search shell / local index
2. feedback config / page footer feedback
3. sitemap / SEO / canonical / OG metadata
4. llms.txt
5. image pipeline baseline
6. link validation command

当前实现结论：

- Search 是 product composition，不进入 `DocsHeader` 或 `DocsLayoutShell`。
- Feedback 是 page footer slot 内容，不进入 `DocsPage` foundation。
- Sitemap / llms / SEO 是 server/product output，不要求 docs components 感知。
- Image pipeline 当前只定义产品规则和 prose safety baseline，不做 CDN。
- Link validation 是 tooling/product quality gate，复刻 sourcePath/routePath 规则离线检查。

Stage 7.5：Fumadocs-Aligned UI Primitives Gate 已完成第一轮。

当前实现结论：

- `DocsSearchTrigger` 已迁移到 Fumadocs-like `UiButton` variant contract。
- `DocsSearchDialog` 已迁移到 command dialog structure：
  - overlay
  - content
  - header
  - input
  - close
  - list
  - list item
  - footer
  - keyboard navigation
- `DocsPageActions` 已迁移到 shared action group 和 button/copy contract。
- `DocsFeedback` 已消费 shared button primitive。
- `DocsTocPopover` 已消费 shared popover behavior。
- `DocCodeBlock / DocAccordion / DocTabs / DocTypeTable` 已消费 shared
  copy/tabs/collapsible/accordion primitive。

边界复核后的下一步不直接进入 changelog/open issues 或完整站点产品能力。

推荐执行顺序：

1. ImageZoom：先补 foundation UI，再接 CDN/image adapter。
2. Markdown transform pipeline：heading id/custom id、code meta、line/diff/highlight、structured data extraction。
3. 集成层 P1：remote search provider / search API、feedback backend、RSS、llms-full.txt / per-page markdown export。
4. Multi source baseline：定义 docs/blog/changelog/api 的 loader、route、metadata 和 nav contract。
5. 站点产品组合层：blog/changelog/API 页面体验、story/playground、AI/MCP/docs assistant、versioning/i18n。
