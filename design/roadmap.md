---
title: Roadmap
sectionLabel: Plan
---

# Roadmap

## 目标

当前项目的长期路线拆成三条边界：

1. 基础层
2. 产品层
3. 未来 VitePress 兼容边界

基础层负责“文档系统成立”。

产品层负责“文档系统产品化”。

未来 VitePress 边界只负责“未来迁移、兼容或复用时如何映射”，不作为当前 `Nuxt + @nuxt/content` foundation 的架构来源。

## 文档架构

`design/` 目录固定为这些长期入口：

- `design/roadmap.md`
  - 总路线图
  - 说明基础层 / 产品层 / 未来 VitePress 边界
  - 说明阶段优先级和当前下一步

- `design/foundation-prep-plan.md`
  - 正式开发前准备阶段
  - 说明 agent 规约、依赖基线、设计语言、token 体系和风格对齐口径
  - 作为进入基础层 Phase 1 前的 gate

- `design/foundation-roadmap.md`
  - 基础层详细演进顺序
  - foundation UI substrate 清单
  - 参考源码位置
  - 验收标准

- `design/product-roadmap.md`
  - 产品层详细演进顺序
  - site config、page actions、search、feedback、AI 等产品能力规划
  - 插件和产品能力边界
  - 验收标准

- `design/fumadocs-alignment-plan.md`
  - 对齐 `fumadocs / assistant-ui / fumapress / VitePress prototype` 的设计依据
  - 作为基础协议和历史分析资料保留

- `design/implementation-notes.md`
  - 只记录最新结论
  - 只记录当前状态
  - 只记录已验证经验

`design/nuxt-content-mvp-plan.md` 是早期 MVP 记录，后续只作为历史参考，不作为当前主动规划入口。

## 参考依据

### Fumadocs

Fumadocs 对当前项目的价值分成三层：

- `fumadocs-core`
  - source / loader / page tree / page conventions
  - TOC / breadcrumb / link / page-tree utils
  - MDX plugins：headings、rehype-code、remark-steps、remark-npm、remark-structure 等
- `fumadocs-ui`
  - default MDX components
  - layout / page / slots
  - sidebar / TOC / search shell / root provider
  - codeblock、tabs、callout、card、files、type-table 等 docs components
- integrations
  - search engines、feedback、AI、OpenAPI、Story、OG、content sources 等产品或增强能力

关键参考源码：

- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\schema.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\source.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\page-tree\builder.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\page-tree\definitions.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\mdx.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\sidebar\base.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\toc\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\codeblock.tsx`

关键官网页面：

- [Fumadocs UI](https://www.fumadocs.dev/docs/ui)
- [Fumadocs UI Components](https://www.fumadocs.dev/docs/ui/components)
- [Fumadocs UI Layouts](https://www.fumadocs.dev/docs/ui/layouts)
- [Docs Layout](https://www.fumadocs.dev/docs/ui/layouts/docs)
- [Docs Page](https://www.fumadocs.dev/docs/ui/layouts/page)
- [Layout Links](https://www.fumadocs.dev/docs/ui/layouts/links)
- [Navbar](https://www.fumadocs.dev/docs/ui/layouts/nav)
- [Markdown](https://www.fumadocs.dev/docs/markdown)

### Fumapress

Fumapress 对当前项目的价值是产品层封装方式：

- `defineConfig()`
- content / site / meta / layouts / plugins / adapters 聚合
- docs layout 二次封装
- search、sitemap、llms、image、feedback、blog 等插件化能力

关键参考源码：

- `D:\Projects\Learning\gh\fumapress\packages\core\src\config.ts`
- `D:\Projects\Learning\gh\fumapress\packages\core\src\layouts\docs.tsx`
- `D:\Projects\Learning\gh\fumapress\packages\core\src\lib\types.ts`
- `D:\Projects\Learning\gh\fumapress\packages\core\src\plugins\internal\defaults.ts`
- `D:\Projects\Learning\gh\fumapress\apps\docs\press.config.tsx`

### VitePress Prototype

旧 VitePress prototype 只作为未来兼容和经验来源：

- themeConfig 映射经验
- sidebar/search/outline adapter 经验
- page actions、内容组件、视觉节奏经验

关键参考源码：

- `D:\Projects\Work\tiny-robot-docs-ui\docs\.vitepress\config.ts`
- `D:\Projects\Work\tiny-robot-docs-ui\docs\.vitepress\theme\composables\useDocsPageTree.ts`
- `D:\Projects\Work\tiny-robot-docs-ui\docs\.vitepress\theme\components\DocsPageActions.vue`

## 边界定义

### 基础层

基础层负责所有让 docs 系统“成立”的协议和 UI substrate。

基础层包括：

- content collection / frontmatter / directory meta
- source path / route path / slug transform
- docs tree / context tree / page identity
- layout protocol
- page protocol
- shared layout options contract
- default MDX components contract
- link protocol / relative link
- markdown / MDC authoring protocol
- markdown transform pipeline
- root provider / theme shell / context providers
- UI primitives
- left sidebar / right TOC / mobile nav
- breadcrumb / pager / footer
- table / prose primitives
- code highlight / code block / code tabs / copy button
- component preview / code preview
- docs content components
- Home layout / basic not-found shell
- tokens / shell.css / prose.css / content.css

基础层的目标不是做“所有功能”，而是提供产品层可以安全挂载的稳定 contract。

### 产品层

产品层负责把稳定 foundation 变成完整站点产品。

产品层包括：

- site config
- nav links 数据来源
- Git metadata config
- page actions
- Copy Markdown / GitHub source link
- search engine / search index / search API
- feedback
- blog / changelog / api 多内容源
- sitemap / rss / seo / llms.txt
- image pipeline
- AI / MCP / docs assistant
- story / playground runtime
- i18n / versioning 完整路由策略
- 部署和生成策略

产品层不能反向补基础 UI 的洞。

如果一个产品能力需要新增基础布局、重写 code block、重写 table、重写 TOC、重写 sidebar 或重写 MDX component mapping，说明它应该先回到基础层。

### 未来 VitePress 边界

未来 VitePress 边界不参与当前实现排期。

它只记录：

- 当前 foundation protocol 如何映射到 VitePress `themeConfig`
- VitePress sidebar/search/outline 如何通过 adapter 消费当前协议
- 旧 VitePress prototype 中可复用的组件和视觉经验
- 哪些能力不能共享，避免把 VitePress private API 倒灌进 Nuxt foundation

## Foundation UI Substrate

Fumadocs UI 的关键启发是：foundation 不是只有数据协议，还包含一套 UI substrate。

当前项目的基础层至少要定义以下 contract。

### 1. Default MDX Components

基础层必须统一 Markdown/MDC 输出到项目组件：

- `a` -> docs link protocol
- `img` -> docs image protocol
- `h1-h6` -> heading / anchor protocol
- `table` -> overflow-safe table wrapper
- `pre` -> code block shell
- `CodeBlockTabs / CodeBlockTab / CodeBlockTabsList / CodeBlockTabsTrigger`
- `Card / Cards`
- `Callout`

这对应 Fumadocs `defaultMdxComponents`，不属于产品层。

### 2. Link Protocol

基础层必须处理：

- internal link
- external link
- relative file link
- active link 判断
- external `target / rel`
- route path normalization

site config 可以提供链接数据，但链接渲染和解析规则属于基础层。

### 3. Shared Layout Options

基础层需要定义等价于 Fumadocs `BaseLayoutProps` 的结构：

- `githubUrl`
- `links`
- `nav`
- `slots`
- `themeSwitch`
- `searchToggle`
- `languageSelect` 预留

这些是 layout contract。

产品层后续可以用 `site config` 生成这些 props，但不能直接绕过 contract 写进组件。

### 4. Nav Links Contract

基础层应支持一套稳定 nav item 结构：

- main link
- icon link
- button link
- menu link
- custom slot item
- `active: url / nested-url / none`
- `on: nav / menu / all`
- external state
- aria label

这会服务 navbar、mobile menu、home layout 和未来多 source / version / i18n 切换。

### 5. Layout And Page Slots

基础层必须保证这些 slot / replacement points 稳定：

- layout container
- layout header / navbar
- layout sidebar
- layout mobile nav
- layout top/banner area
- page container
- breadcrumb
- TOC main
- TOC popover
- page header
- page body
- page footer
- pager

产品层的 search、feedback、AI、page actions 都应通过这些 slot 接入。

### 6. UI Primitives

基础层应有一组 Vue-native interaction primitives 或等价 contract：

- button
- tabs
- popover
- collapsible
- dialog / command dialog
- scroll area
- navigation menu
- accordion
- focus trap / overlay
- copy button state

不要求第一版引入 Reka UI，但不能让每个 feature 各自重复实现一套交互状态。

### 7. Markdown Transform Pipeline

当前项目基于 Nuxt Content，不照搬 Fumadocs MDX。

但基础层仍要明确对应能力：

- heading id
- custom heading id
- TOC extraction
- hidden / only-in-TOC heading policy
- code meta parsing
- Shiki theme tokens
- line numbers
- highlighted line / word / diff / focus
- code tab grouping
- steps syntax
- package-manager command tabs
- structured data extraction for future search

其中 `structured data extraction` 是 search 的基础输入，不是 search 产品本身。

### 8. Layout Variants

P0 只实现当前 Docs Layout。

但 foundation 应预留 layout variant contract：

- Docs layout
- Home layout
- basic not-found shell
- future compact/notebook-like layout

不建议现在实现 Flux / Notebook 全量，但要避免把 layout variant 误判为产品层能力。

## 灰度边界

### 属于基础层

- `meta`
- `status / badge / icon / slug`
- table / prose primitives
- default MDX components
- relative link
- root provider / theme context shell
- shared layout options shape
- layout links shape
- search trigger / search dialog shell slot
- theme switch slot
- language switch slot
- code highlight / code block / code tabs / copy button
- component preview / code preview frame
- layout tabs / root section switcher
- Home layout / not-found shell

### 属于产品层

- site config 数据来源
- GitHub metadata fetching
- Copy Markdown 的数据读取和动作编排
- search engine / index / API
- feedback backend
- AI / MCP
- sitemap / rss / llms.txt / SEO metadata generation
- blog / changelog / API 多 source
- story controls / registry / interactive playground runtime
- i18n / versioning 路由策略

### 属于未来兼容边界

- VitePress `themeConfig`
- VitePress sidebar/outline/local-search adapter
- VitePress private DOM or private runtime state

## 总体阶段

### Stage 0：基础建设和设计语言

- 项目级 `AGENTS.md`
- 依赖和脚本基线
- token 层级
- CSS 分层基线
- 风格对齐口径
- 验证命令基线

### Stage 1：内容和树协议

- `docs` collection
- frontmatter schema
- directory meta
- source path / route path
- slug transform
- `DocsNode`
- visible tree / context tree
- breadcrumb / pager / homepage cards 共用 tree

### Stage 2：Layout / Page Protocol

- `DocsLayoutShell`
- navbar/header contract
- sidebar / sidebar tree / sidebar item
- mobile nav
- TOC / TOC list / TOC popover
- `DocsPage`
- page header / body / footer
- breadcrumb / pager
- slots and replacement points

### Stage 3：Foundation UI Substrate

- default MDX components mapping
- link protocol / relative link
- prose table / media / inline code / kbd
- code block / code tabs / copy button
- heading anchor / heading policy
- UI primitives baseline
- root provider / theme shell
- search trigger shell
- theme switch / language switch slots
- Home layout / not-found shell

### Stage 4：Docs Content Components

- Callout
- Card / CardGrid
- Accordion
- Tabs
- Steps
- CodeBlock / CodeTabs
- Preview / CodePreview
- Files
- InlineTOC
- TypeTable
- Heading
- ImageZoom

### Stage 5：Foundation UI Gate

进入产品层前必须完成：

- default MDX components 静态审计
- link protocol 静态审计
- layout options / nav links contract 审计
- sidebar / TOC / mobile nav 交互审计
- table / prose / media 审计
- code highlight / code tabs / copy button 审计
- preview / code preview 审计
- root provider / theme / search trigger slot 审计
- product extension slots 审计

### Stage 6：产品层起步

- site config schema
- layout shared options 由 config 生成
- nav links schema
- Git metadata config
- page actions contract
- GitHub source link
- Copy Markdown

### Stage 7：产品层增强

- search engine / search index / search API
- feedback
- sitemap / rss / SEO
- llms.txt
- image pipeline
- link validation

### Stage 8：产品层高级能力

- blog / changelog / API
- story / playground
- AI / MCP / docs assistant
- versioning
- i18n
- OpenAPI / AsyncAPI / type generation

### Stage 9：未来 VitePress 兼容评估

- VitePress themeConfig 映射表
- sidebar/search/outline adapter 可行性
- 旧 prototype 可复用组件清单
- Nuxt foundation 与 VitePress runtime 的不可共享边界

## 当前状态

已完成或基本完成：

- `docs` collection
- `DocsNode[]`
- directory meta / `meta.json`
- source path / route path 分离
- slug transform
- visible tree / context tree
- breadcrumb / pager / homepage cards 共用 tree
- `DocsPage` page-level contract
- TOC / TOC popover 基础消费
- page slots 第一版
- first batch content components
- token / shell / prose / content CSS 初版
- default MDX components mapping
- link protocol / relative link
- shared layout options
- nav links contract
- root provider / theme shell / search trigger slot
- prose table / image / media
- code highlight / code tabs / copy button
- preview / code preview
- Files / InlineTOC / TypeTable

Foundation UI Gate 已完成第一轮。

仍后置为 P1，不阻塞产品层起步：

- ImageZoom
- Home layout / not-found shell 深化
- sidebar layout tabs / root section switcher
- 完整 page-tree transformer/plugin runtime
- 完整 markdown transform pipeline

下一步进入 Stage 6：产品层起步。

优先顺序：

1. site config schema
2. layout shared options 由 config 生成
3. nav links schema
4. Git metadata config
5. page actions contract
6. GitHub source link
7. Copy Markdown
