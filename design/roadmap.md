---
title: Roadmap
sectionLabel: Plan
---

# Roadmap

## 目标

当前项目的长期路线拆成四条边界：

1. 基础层
2. 集成 / 插件层
3. 站点产品组合层
4. 未来 VitePress 兼容边界

基础层负责“文档系统成立”。

集成 / 插件层负责“把文档系统能力配置化、路由化、输出化”。

站点产品组合层负责“把稳定底座和集成能力组合成具体站点体验”。

未来 VitePress 边界只负责“未来迁移、兼容或复用时如何映射”，不作为当前 `Nuxt + @nuxt/content` foundation 的架构来源。

## 文档架构

`design/` 目录固定为这些长期入口：

- `design/roadmap.md`
  - 总路线图
  - 说明基础层 / 集成插件层 / 站点产品组合层 / 未来 VitePress 边界
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
  - 集成 / 插件层和站点产品组合层详细演进顺序
  - site config、page actions、search、feedback、AI 等上层能力规划
  - 插件和站点产品组合边界
  - 验收标准

- `design/fumadocs-alignment-plan.md`
  - 对齐 `fumadocs / assistant-ui / fumapress / VitePress prototype` 的设计依据
  - 作为基础协议和历史分析资料保留

- `design/fumadocs-component-parity-inventory.md`
  - Fumadocs 基础组件 parity 清单
  - 当前本地实现 / profile 覆盖 / 缺失组件分类
  - 后续按批次对齐的执行入口

- [`design/layout-provider-parity-plan.md`](./layout-provider-parity-plan.md)
  - RootProvider / baseSlots / sidebar provider / layout variants 的详细契约卡
  - 作为 Stage 7.10 的执行设计，不作为总路线图

- [`design/theme-runtime-parity-plan.md`](./theme-runtime-parity-plan.md)
  - Theme runtime / theme switch / preset 的详细契约卡
  - 作为 Stage 7.9 的执行设计，不作为总路线图

- [`design/reka-primitive-migration-plan.md`](./reka-primitive-migration-plan.md)
  - Reka UI primitive 迁移治理、组件清单、sidebar 替换决策和排期
  - 作为 Stage 7.5 后续 primitive migration 的执行设计，不在 roadmap 展开

- [`design/fumadocs-gap-audit.md`](./fumadocs-gap-audit.md)
  - 定期对比 Fumadocs 源码、当前实现和现有规划
  - 记录剩余差异、分类和排期建议

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
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\provider\base.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\client.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\client.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\home\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\home\not-found.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\notebook\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\flux\index.tsx`
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

Fumapress 对当前项目的价值是集成 / 插件层封装方式：

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
- theme runtime / theme switch / theme preset contract
- tokens / shell.css / prose.css / content.css

基础层的目标不是做“所有功能”，而是提供上层能力可以安全挂载的稳定 contract。

### 集成 / 插件层

集成 / 插件层负责把稳定 foundation 暴露成可配置、可替换的站点能力。

它对应 Fumapress 的主要价值：不是重写 Fumadocs UI，而是用 config、
adapters、server plugins、routing 和 output routes 把已有基建装配成产品。

集成 / 插件层包括：

- site config
- nav links 数据来源
- Git metadata config
- page actions 数据编排
- Copy Markdown / GitHub source link 的数据读取与动作编排
- search provider / index / API
- feedback backend / GitHub issue 引导
- sitemap / rss / seo / llms.txt / markdown export
- image pipeline / CDN adapter
- multi source loader / adapter
- deploy / generate strategy

集成 / 插件层不能反向补基础 UI 的洞。

如果一个集成能力需要新增基础布局、重写 code block、重写 table、重写 TOC、
重写 sidebar 或重写 MDX component mapping，说明它应该先回到基础层。

### 站点产品组合层

站点产品组合层负责把 foundation 和集成层能力组合成具体站点体验。

它对应 assistant-ui docs 的主要价值：直接消费 Fumadocs source/layout/page
合同，同时按自身产品需要组合 header、sidebar、TOC actions、pager、platform
filter、assistant panel、analytics、产品页和业务内容源。

站点产品组合层包括：

- brand / home / product pages
- docs shell 的站点级组合与 replacement
- 自定义 TOC actions / page header actions
- AI / MCP / docs assistant 入口
- story / playground runtime
- blog / changelog / api 内容体验
- i18n / versioning 完整路由策略
- analytics / conversion / business-specific routes

站点产品组合层只能消费 foundation contract 和集成层输出，不能把站点特例倒灌为
基础组件规则。

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

对照 Fumadocs，本项目的 primitive 设计基线应尽量复刻
`@fumadocs/base-ui` 的三层模型：

1. `components/ui/*`
   - 只负责行为 primitive 和最小视觉 variant。
   - Fumadocs 这里使用 `@base-ui/react`，当前项目需要提供 Vue 等价层。
   - 不在这一层读取 docs tree、site config、route、search provider 或产品数据。
2. docs component wrapper
   - `DocTabs / DocAccordion / DocCodeBlock / DocTypeTable` 等消费 ui primitive。
   - 这一层负责 docs authoring contract、图标、copy、hash anchor、content spacing。
3. layout / product consumer
   - `DocsSearch / DocsPageActions / DocsTocPopover / mobile nav` 等只消费 primitive 或 slot。
   - 产品能力不能各自再手写按钮、弹层、copy 状态和键盘交互。

与 Fumadocs 必须保持一致的标准：

- Button variant contract：
  - `primary`
  - `outline`
  - `ghost`
  - `secondary`
  - `color` alias 等价 `variant`
  - size 至少包含 `sm / icon / icon-sm / icon-xs`
  - 默认 class 语义对齐：`inline-flex / items-center / justify-center / rounded-md / text-sm / font-medium / transition-colors / disabled:pointer-events-none / disabled:opacity-50 / focus-visible:ring`
- Popover contract：
  - Root / Trigger / Content / Close 四件套。
  - Content 默认 portal 到 body，支持 `align`、`sideOffset`。
  - panel 使用 popover token、border、shadow、backdrop blur、`max-height` 和 viewport width 保护。
  - 需要有 open/closed data state，供动画和 active trigger 样式消费。
- Dialog / command dialog contract：
  - Root / Overlay / Content / Header / Input / Close / List / ListItem / Footer。
  - 必须支持 ESC 关闭、overlay、focus trap、focus return、keyboard result navigation。
  - Search dialog 可以先是产品组件，但结构应能迁移到 `UiDialog` / `UiCommandDialog`。
- Tabs contract：
  - Root / List / Trigger / Content。
  - 支持 controlled/uncontrolled value。
  - 支持 `groupId` 共享状态、`persist`、`updateAnchor`。
  - Content 默认 keep mounted，并用 inactive state 隐藏，避免 code/previews 重挂载。
- Accordion / Collapsible contract：
  - Root / Item / Header / Trigger / Content。
  - 支持 single/multiple、default value、controlled value、collapsible。
  - Content 使用 height transition，支持 `hidden="until-found"`。
  - Header/Trigger 暴露 data state，chevron 通过 data state 旋转。
- ScrollArea contract：
  - Root / Viewport / Scrollbar / Thumb。
  - Scrollbar hover 时显隐，thumb 使用 border token。
- Copy state contract：
  - 统一 `idle / loading / copied / failed` 或等价 boolean checked。
  - 成功态默认 1500ms reset。
  - unmount 时清 timer。
  - code copy、accordion anchor copy、markdown copy 都必须复用同一状态 helper。

实现策略：

- 第一版不强制引入 Reka UI，但所有 Vue-native primitive 必须按上述 contract 命名、状态和 ARIA 对齐。
- 如果 Vue-native 实现开始重复处理 focus trap、portal positioning、keyboard roving、dialog accessibility，应重新评估引入 Reka UI 或其他 Vue behavior primitive。
- 样式 token 优先使用 `--color-fd-*` bridge 和现有 `--docs-*` 源 token，避免 feature-local hardcoded colors。
- Fumadocs 的 React/`@base-ui/react` 代码不可照搬，但 DOM 语义、data state、ARIA、slot 分层和视觉节奏应尽量一致。

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

### 属于集成 / 插件层

- site config 数据来源
- GitHub metadata fetching
- Copy Markdown 的数据读取和动作编排
- search engine / index / API
- feedback backend
- AI / MCP
- sitemap / rss / llms.txt / SEO metadata generation
- image pipeline / CDN adapter

### 属于站点产品组合层

- blog / changelog / API 多 source
- story controls / registry / interactive playground runtime
- AI / MCP / docs assistant 入口
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

进入上层能力前必须完成：

- default MDX components 静态审计
- link protocol 静态审计
- layout options / nav links contract 审计
- sidebar / TOC / mobile nav 交互审计
- table / prose / media 审计
- code highlight / code tabs / copy button 审计
- preview / code preview 审计
- root provider / theme / search trigger slot 审计
- product extension slots 审计

### Stage 6：集成 / 插件层起步

- site config schema
- layout shared options 由 config 生成
- nav links schema
- Git metadata config
- page actions contract
- GitHub source link
- Copy Markdown

### Stage 7：集成 / 插件层增强

- search engine / search index / search API
- feedback
- sitemap / rss / SEO
- llms.txt
- image pipeline
- link validation

### Stage 7.5：Fumadocs-Aligned UI Primitives Gate

进入 Stage 8 前，应补一轮 primitive contract gate。

目标不是创建通用业务组件库，而是让当前 Vue docs UI 拥有与 Fumadocs
`@fumadocs/base-ui` 尽量一致的行为和设计底座。

当前第一轮 Vue-native primitive baseline 已完成；后续 Reka UI 迁移不在 roadmap
展开，执行设计见
[`design/reka-primitive-migration-plan.md`](./reka-primitive-migration-plan.md)。

必须完成：

- `UiButton` / button variants：
  - 对齐 Fumadocs `buttonVariants`
  - 支持 `primary / outline / ghost / secondary`
  - 支持 `sm / icon / icon-sm / icon-xs`
  - 支持 disabled、focus-visible ring、icon sizing
- `UiPopover`：
  - Root / Trigger / Content / Close
  - portal、position、outside click、ESC、focus return
  - `data-state` 或等价 open state
- `UiDialog` / `UiCommandDialog`：
  - overlay、content、header、input、close、list、list item、footer
  - keyboard navigation、active item、aria-selected、empty/loading state
- `UiTabs`：
  - Root / List / Trigger / Content
  - controlled/uncontrolled
  - group sync、persist、hash anchor
  - keep mounted content
- `UiAccordion` / `UiCollapsible`：
  - Root / Item / Header / Trigger / Content
  - single/multiple、collapsible、default value
  - height transition、`hidden="until-found"`
- `UiScrollArea`：
  - viewport、scrollbar、thumb
  - hover opacity、tokenized thumb
- `useCopyState()` 或等价 composable：
  - copy helpers 统一 reset timing、unmount cleanup、success/failed/loading state

必须迁移的现有消费者：

- `DocsSearchTrigger`
- `DocsSearchDialog`
- `DocsTocPopover`
- `DocsPageActions`
- `DocsFeedback`
- `DocCodeBlock`
- `DocAccordion`
- `DocCollapsible`
- `DocTabs`
- `DocTypeTable`
- `DocFolder`

验收标准：

- 不再出现新的 feature-local button style。
- 不再出现新的 feature-local popover/dialog/focus trap。
- code copy、markdown copy、accordion link copy 使用同一个 copy state helper。
- search dialog 与 Fumadocs search dialog 的结构能力对齐：overlay、content、header、input、close、list、footer、keyboard navigation。
- tabs/accordion/collapsible 的 data state、ARIA 和 keyboard 行为与 Fumadocs 尽量一致。
- 所有 primitive 使用 token，不新增局部硬编码色板。
- 完成后再进入 Stage 7.9 theme gate。

<a id="stage-7-9-theme-runtime-preset"></a>

### Stage 7.9：Theme Runtime / Preset Gate

目标：补齐 foundation 主题运行时、ThemeSwitch、首屏防闪和 CSS preset contract。

执行设计：

- [`design/theme-runtime-parity-plan.md`](./theme-runtime-parity-plan.md)
- [`design/product-roadmap.md#phase-1-5-theme-config-preset-adapter`](./product-roadmap.md#phase-1-5-theme-config-preset-adapter)

产物：

- theme runtime / provider contract
- `useDocsTheme()` contract
- first-paint script
- `DocsThemeSwitch`
- `themes.css` preset contract
- `theme` parity profile

<a id="stage-7-10-root-provider-layout-variants"></a>

### Stage 7.10：Root Provider / Layout Variants Gate

当前状态：已完成第一轮并纳入回归。

目标：补齐 Fumadocs layout 层的 provider、默认 slots、sidebar state、
Home/not-found 和 layout variant 决策，不在 roadmap 展开具体 contract。

执行设计：

- [`design/layout-provider-parity-plan.md`](./layout-provider-parity-plan.md)
- [`design/fumadocs-component-parity-inventory.md#layout-root-provider-parity-inventory`](./fumadocs-component-parity-inventory.md#layout-root-provider-parity-inventory)

产物：

- RootProvider / baseSlots parity card
- sidebar provider/state parity card
- layout tabs / root section switcher parity card
- Home layout / not-found shell parity cards
- Banner decision card
- Notebook / Flux deferred variant decision cards

### Stage 8：集成 / 插件层深化

- remote search provider / search API
- feedback backend / GitHub issue template
- RSS / llms-full.txt / per-page markdown export
- image CDN / ImageZoom adapter
- multi source adapter baseline

### Stage 9：站点产品组合层

- blog / changelog / API
- story / playground
- AI / MCP / docs assistant
- versioning
- i18n
- OpenAPI / AsyncAPI / type generation

### Stage 10：未来 VitePress 兼容评估

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
- page-tree transformer/plugin runtime 第一轮
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
- baseSlots / layout slots default provider
- sidebar provider/state contract
- layout tabs / root section switcher
- Home layout / basic not-found shell
- prose table / image / media
- code highlight / code tabs / copy button
- ImageZoom
- markdown transform pipeline 第一版：custom heading id、code meta、Shiki
  notation、structured data extraction
- preview / code preview
- Files / InlineTOC / TypeTable

Foundation UI Gate 已完成第一轮。

Stage 6：集成 / 插件层起步已完成第一轮。

已完成：

- site config schema
- layout shared options 由 config 生成
- nav links schema 第一轮消费
- Git metadata config/helper
- page actions contract
- GitHub source/edit link
- Copy Markdown

仍后置为 P1，不阻塞集成 / 插件层起步：

- page-tree runtime 的 site-level plugin registry / config-driven transformer 注册
- markdown transform pipeline 后续增强：steps/package-manager command tabs、
  richer structured component extraction

仍可后续增强但不阻塞 Stage 7：

- page actions 的图标体系扩展
- Copy Markdown 的 server/API 读取模式
- page actions 的更多 placement 和分组

Stage 7：集成 / 插件层增强已完成第一轮。

已完成：

- search config / trigger / dialog / local index
- page-level feedback
- docs page / home SEO metadata
- sitemap.xml
- llms.txt
- image pipeline baseline
- offline docs link validation

仍后置为 P1：

- remote search provider / search API
- feedback backend 或 GitHub issue 模板提交
- RSS
- image CDN adapter
- llms-full.txt / per-page markdown export

Stage 7.5：Fumadocs-Aligned UI Primitives Gate 已完成第一轮 Vue-native baseline。

已完成：

1. 对照 Fumadocs 审计当前重复交互。
2. 实现 `UiButton` / `useCopyState()` / docs action wrappers。
3. 实现 `UiPopover` / `UiDialog` / `UiCommandDialog` 的本地 wrapper baseline。
4. 实现 `UiTabs` / `UiAccordion` / `UiCollapsible` 的本地 wrapper baseline。
5. 实现 `UiScrollArea`。
6. 迁移现有 docs/content/product 消费者。
7. 完成 primitive boundary、CSS token、类型、构建和链接校验。

后续 Reka UI 迁移状态：

- `UiPopover`、`UiDialog`、mobile sidebar drawer、sidebar tabs dropdown、
  `UiCollapsible`、`UiAccordion`、`UiTabs`、`UiScrollArea`、`DocsTocPopover`
  已完成当前 wrapper 迁移批次，状态记录在
  [`design/reka-primitive-migration-plan.md`](./reka-primitive-migration-plan.md)。
- 左侧 sidebar 暂不整棵替换为 Reka Tree；当前 drawer、dropdown 和
  disclosure 交互层已替换。只有在后续仍出现明显 hierarchy/keyboard 缺口时，
  才进入 Tree POC 决策门。

Stage 7.7：Fumadocs component parity 当前批次已完成。

已完成并进入回归：

- Callout
- Tabs / CodeTabs
- Accordion
- Files
- InlineTOC
- TypeTable
- ImageZoom
- PageActions / Feedback / Pager 当前合同

后续基础组件 parity 按
`design/fumadocs-component-parity-inventory.md` 分批推进，下一批建议从
Banner decision 和 advanced/product backlog 中明确进入 foundation 的项开始。

下一步先回补 foundation 和集成层 P1 缺口，再进入站点产品组合层。

建议优先顺序：

1. 集成层 P1：remote search provider / search API、feedback backend、RSS、llms-full.txt / per-page markdown export。
2. Image pipeline adapter：在已有 ImageZoom foundation 上补 CDN/尺寸/源适配。
3. Multi source baseline：先建立 docs/blog/changelog/api 的 loader/route/content contract，再做具体页面体验。
4. Page-tree runtime 配置层：在 multi source 前补 site-level plugin registry / config-driven transformer 注册。
5. 站点产品组合层：story/playground、AI/MCP/docs assistant、versioning/i18n、OpenAPI/AsyncAPI/type generation。
