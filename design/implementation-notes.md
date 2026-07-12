---
title: Implementation Notes
sectionLabel: Record
---

# Implementation Notes

## 当前方向

- 技术底座固定为 `Nuxt + @nuxt/content`
- 设计语言参考 `fumadocs`
- 壳层节奏参考 `assistant-ui`
- 不照搬 `React / Tailwind` 实现
- Stage 0 已完成；当前 foundation hardening 入口是
  `foundation-alignment-matrix.md`
- TinyRobot monorepo 暂时不作为架构参考，只后置为组件 API、demo 内容和产品状态验证来源
- 基础依赖先按能力层评估，不照搬 Fumadocs / assistant-ui 的 React 依赖
- CSS 框架路线是：CSS tokens 作为设计语言源头，Tailwind CSS v4 作为 utility / `@theme` 编译层
- 已实际引入基础质量工具、`@lucide/vue` 和 Tailwind CSS v4 Vite 插件
- Tailwind CSS v4 使用 `@tailwindcss/vite` 接入，不走当前仍绑定 Tailwind v3 的 `@nuxtjs/tailwindcss`
- 当前不引入 Nuxt UI、shadcn-vue、VueUse；Reka UI 已通过 `UiPopover` POC
  验证，后续只通过本地 `Ui*` wrapper 分阶段迁移 interaction primitives
- 应用仓库保留 `pnpm-lock.yaml`，用于固定本地与 CI 的依赖解析结果

## 已验证结论

### 1. 不做源码硬搬

- `fumadocs` 和 `assistant-ui` 的 React layout 不能直接复用
- 只能借结构、视觉和组件语义

### Token 差异面

- Fumadocs 的设计语言核心是 `--color-fd-*` 语义变量契约，而不是完整 primitive 色板；本项目保留 `--docs-*` 作为源头，并用 `--color-fd-*` 完成合约桥接。
- Fumadocs 已覆盖 `background / foreground / muted / popover / card / border / primary / secondary / accent / ring / overlay`；本项目已补齐这些语义面，并直接以这套命名作为唯一实现。
- Fumadocs 具备 `.dark` 暗色覆盖；本项目已补暗色 token，但暂不实现主题切换 UI。
- Fumadocs 的状态色包含 `info / warning / error / success / idea`，代码 diff 包含 add/remove 背景和 symbol；本项目已补 `idea / error / diff`，并统一使用 `success / warning / error` 命名。
- Fumadocs 的 layout 运行变量包含 `--fd-layout-width / --fd-sidebar-width / --fd-toc-width / --fd-header-height` 等；本项目已映射到现有 docs shell 变量，后续布局可继续优先使用项目变量。
- Fumadocs typography 覆盖标题、列表、blockquote、表格、kbd、inline code、链接、媒体和 Shiki 状态；本项目已将 `prose.css` 和 `content.css` 扩到同等覆盖范围的底座层。

### 2. 最小链路已跑通

- `content/` -> `docs` collection -> `queryCollection()` -> `ContentRenderer` 已成立
- Markdown 中可直接渲染 `Vue` 组件
- `[...slug].vue` 已可按路径渲染页面
- `pnpm build` 已通过

### 3. Shell 必须自己重写

- `header / sidebar / toc / pager` 必须基于 `Nuxt Content` 数据接口重写
- 内容组件可以优先复用现成 Vue 版本

### 4. 当前环境约束

- 使用 `content.experimental.sqliteConnector = 'native'`
- `Nuxt 4.4.8` 需要显式 `buildDir: '.nuxt'`

## 当前实现状态

- `Nuxt + @nuxt/content` 已跑通
- `content/index.md` 和 `content/guide/getting-started.md` 已接入
- `content.config.ts` 已定义 `docs` page collection
- `app/pages/index.vue` 和 `app/pages/[...slug].vue` 已可渲染
- `PreviewCounter.vue` 已可在 Markdown 中使用
- `pnpm build` 已通过
- `app/types/docs.ts`
- `app/utils/docs-navigation.ts`
- `useDocsNavigation.ts`
- `useDocsPage.ts`
- `useDocsToc.ts`
- `app/layouts/docs.vue`
- `DocsHeader.vue`
- `DocsSidebar.vue`
- `DocsPage.vue`
- `DocsToc.vue`
- `DocsPager.vue`
- `tokens.css / shell.css / prose.css / content.css`
- `DocCallout.vue`
- `DocCard.vue`
- `DocCardGrid.vue`
- `DocTabs.vue`
- `DocTab.vue`
- `DocSteps.vue`
- `DocCodeBlock.vue`
- `DocPreview.vue`
- 首页最小 hero

## 当前已补充

- 项目级 `AGENTS.md` 之前缺失，当前已补为协作规约入口
- Stage 0 准备计划已新增到 `design/foundation-prep-plan.md`
- `README.md` 已从 Nuxt starter 模板收口为项目定位和 pnpm 命令
- 基础依赖和 CSS 框架评估已写入 `design/foundation-prep-plan.md`
- `package.json` 已补 `typecheck / lint / format` 脚本
- Tailwind CSS v4 已通过 `app/assets/css/tailwind.css` 做最小 `@theme` token 桥接
- `tokens.css` 已整理为 primitive / semantic / component 三层 token 基线
- `content.css` 已新增并接管 docs 内容组件基础样式
- `DocsNode[]` 归一化层已新增，sidebar、pager、layout 已开始消费项目协议类型
- docs frontmatter 已开始支持 `sectionLabel / order / hidden / badge / icon / status / defaultOpen / collapsible`
- `meta.json` 目录控制层已接入 `title / description / order / pages / root / defaultOpen / collapsible / badge / icon`
- `meta.json` 目录控制层已补 `pagesIndex`，可显式指定目录 index 绑定
- `pages` 目录排序语法已补 `!item`、`z...a` 以及字符串 link 语法
- docs link 节点已补 `external` 语义，sidebar 可按外链行为渲染
- `content/guide/protocol-playground/*` 已作为协议回归样本接入，用真实内容验证目录控制行为
- docs shell 第一轮 contract 收口已完成：
  - `DocsLayoutShell` 已作为 layout 级组合面接管 `docs.vue`
  - `DocsSidebar` 已拆成容器 / 树 / 单项三层
  - `DocsPage` 已改为 header / body / footer 组合面
  - `DocsPageHeader / DocsTitle / DocsDescription / DocsBody / DocsPageFooter` 已补齐
  - `DocsPager` 已开始消费 description，作为 page footer contract 的第一版
  - mobile nav 已补点击导航后关闭与 `Escape` 关闭
- TOC / mobile overlay 第二轮壳层交互已接入：
  - `useDocsTocState` 已补 active heading / progress 派生
  - `DocsTocList` 已作为桌面 / 移动端共用目录列表
  - `DocsTocPopover` 已补移动端 TOC popover
  - `useDocsOverlay` 已补滚动锁定、焦点回收、基础 focus trap、点击外部关闭
  - `DocsLayoutShell` 已把 TOC 状态统一分发给 desktop TOC 与 mobile TOC
- `slug / path transform` 第一版基础通道已接入：
  - docs frontmatter 已支持 `slug`
  - `resolveDocsRoutePath()` 已集中负责 source path -> route path 派生
  - `resolveDocsSourcePath()` 已集中负责 route path -> source path 回查
  - `DocsNode` 已显式拆分 `path` 与 `sourcePath`
  - docs page meta 归一化阶段已补 derived route 冲突校验
  - route 页面已改为先按最终 route 匹配，再按 source path 查询内容
  - `content/guide/protocol-playground/routing.md` 已作为 route transform fixture
  - `normalizeDocsRoutePath()` 现已按 segment 做 decode -> encode 归一化，对齐 Fumadocs 的 URI 编码策略
  - 非 ASCII / 空格 slug 现已通过真实 fixture 验证
  - `content/guide/protocol-playground/路径设计.md` 已作为编码归一化样本接入
  - `meta.json` separator 现已支持 `---[icon]Title---` 字符串语法
- breadcrumb / footer contract 第二轮已开始：
  - `useDocsBreadcrumbs()` 已支持 `includeRoot / includePage / includeSeparator`
  - breadcrumb 已从直接消费 `DocsNode[]` 改为消费显式 `DocsBreadcrumbItem[]`
  - route 页面已开始以 options 方式传递 breadcrumb policy
  - 当前默认策略先对齐 Fumadocs：不包含 root / 当前页 / separator
  - docs frontmatter 现已支持：
    - `breadcrumb`
    - `breadcrumbRoot`
    - `breadcrumbPage`
    - `breadcrumbSeparator`
  - root breadcrumb URL/title override 已正式开放到 page-level contract
  - `findDocsAncestors()` 已补前置 separator 路径语义，`includeSeparator` 不再是空选项
  - `DocsPageFooter` 已开始直接承接 `previous / next` pager contract
  - `[...slug].vue` 已不再直接组装 `DocsPager`，而是只传 page footer 所需协议数据
- `DocsPage` page-level options 第一版已接入：
  - `DocsPageProps` 已补 `toc / breadcrumb / footer`
  - `useDocsPage()` 已集中派生 page options
  - `full` 页面默认 TOC 策略已改为对齐 Fumadocs：默认关闭，页面显式 `toc: true` 时可覆盖开启
  - `tocPopover` 已补独立 frontmatter/config 通道，页面可单独控制 mobile TOC popover
  - `DocsLayoutShell` 已开始消费结构化 `toc` contract，而不是只吃 `DocsTocItem[]`
  - `[...slug].vue` 已改为消费 `pageOptions`
  - `useDocsBreadcrumbs()` 已支持接收响应式 options
  - `DocsPageFooter` 已补 `enabled`，route 页面不再手写 `v-if="pager"`
  - `DocsPage` 已开始直接消费 `header / footer` contract
  - `[...slug].vue` 已不再直接渲染 `DocsPageHeader` / `DocsPageFooter`，只传 page-level props
  - `useDocsPage()` 已补 `createHeader()`，用于把 route 查询结果收成 page header contract
- `DocAccordion` 第一版协议已接入：
  - `DocAccordions` 负责 root 状态和 `single / multiple` 收口
  - `DocAccordion` 负责 item 标题、锚点、hash 自动展开和 copy-link 扩展位
  - 当前 props 已先覆盖：
    - root: `type / defaultValue / collapsible`
    - item: `title / id / value / defaultOpen`
  - 当时实现保持 Vue 原生状态，未引入 `Reka UI`
  - `content/guide/components.md` 已补真实使用样本

## 本轮对照 Fumadocs 的新增结论

### 1. `DocsPage` contract 还差更深一层 option 消费

对照 `fumadocs/packages/base-ui/src/layouts/docs/page/index.tsx`，当前项目虽然已拆出：

- `DocsPage`
- `DocsPageHeader`
- `DocsBody`
- `DocsPageFooter`

当前项目已经正式承接：

- `breadcrumb`
- `footer`
- `toc`
- `tocPopover`（先通过 `toc` 选项中的默认策略间接收口）

当前已继续收口到 Vue 版 page contract：

- `DocsPage` 内部直接消费 `breadcrumb / toc / tocPopover / footer`
- `DocsPage` 自己拥有 TOC active/progress 状态
- `DocsPage` 提供 `breadcrumb / header / body / footer / toc / tocPopover` slots
- `[...slug].vue` 只负责查询内容和传递 page contract，不再把 TOC 挂到 layout 级外栏

这说明 page primitives 和 page contract 已经足够进入产品层扩展。

### 2. `full` 页面默认策略已对齐第一版

Fumadocs 的 `full` 页面默认不展示 TOC；当前项目现在也已改为：

- `full: true` 默认关闭 TOC
- frontmatter `toc: true` 仍可覆盖开启

`tocPopover` 现在也由 `DocsPage` 自身消费。

### 3. `DocAccordion` 应按语义协议建模

对照 `fumadocs/packages/base-ui/src/components/accordion.tsx`，`DocAccordion` 当前已按语义协议实现第一版：

- hash 命中时自动展开
- `id` 和 `value` 分离
- copy-link 扩展位
- root/item 双层协议
- `hidden="until-found"` 作为浏览器查找命中后的可发现性降级

### 4. 目录控制层仍有高价值尾差

对照 Fumadocs page tree builder，当前项目没有引入完整 transformer API，但已补 Foundation 阶段最小语义：

- 可见 docs tree 继续用于 sidebar / pager
- context tree 用于 excluded/hidden page 的 breadcrumb/headline/sidebar scope
- `!item` 只表示排除可见导航，不表示页面失去上下文
- `pagesIndex` 已补 link string fallback
- extraction/ownership 规则按“显式 index > 显式 pages/extract > rest”记录到 fixture 文档

## 本轮对照 Fumadocs 的新增结论

### 5. route path 应视为“编码后的最终消费键”

对照 `fumadocs/packages/core/src/source/plugins/slugs.ts`，Fumadocs 会对每个 slug segment 做 `encodeURI()`。

当前项目本轮已同步这个设计结论：

- `path` 一律代表最终 route consumption key
- 进入 route 比较前，先做 segment 级 decode/encode 归一化
- `sourcePath` 保持未编码内容路径语义

这意味着：

- 当前页面、breadcrumb、pager、sidebar 都应继续只消费 `path`
- `pagesIndex`、meta 匹配、内容查询继续只依赖 `sourcePath`

### 6. page tree 节点需要稳定 identity，而不应继续拿 title/path 临时兜底

对照 `fumadocs/packages/core/src/page-tree/definitions.ts` 与 builder 中的 `$id`，Fumadocs 明确把 node identity 作为独立层。

当前项目本轮已补 `DocsNode.id` / `DocsBreadcrumbItem.id`，用于：

- sidebar tree key
- breadcrumb key
- pager item contract
- separator/link 这类没有 route path 的节点身份稳定化

## 当前未完成

Foundation 阶段的 P0-P2 临时 TODO 已闭环，后续不再保留 `design/foundation-todo.md` 作为规划入口。

仍可后置增强，但不阻塞产品层起步：

- 第二批内容组件：`DocFiles / DocTypeTable / DocInlineToc`
- page actions / source link / copy markdown
- search / feedback / AI / blog / changelog / API
- 多版本 / i18n
- 更完整的 page-tree transformer/plugin runtime

## Roadmap 重新梳理结论

### 本轮更新：roadmap 改成 foundation UI substrate 优先

本轮对照官网页面：

- `https://www.fumadocs.dev/docs/ui`
- `https://www.fumadocs.dev/docs/ui/components`
- `https://www.fumadocs.dev/docs/ui/layouts`
- `https://www.fumadocs.dev/docs/ui/layouts/links`
- `https://www.fumadocs.dev/docs/ui/layouts/nav`

以及本地源码：

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\mdx.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\search-trigger.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\theme-switch.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\language-select.tsx`

确认 foundation 还必须补这些 contract：

- default MDX/MDC components mapping
- link protocol / relative link
- shared layout options
- nav links item type
- search trigger slot
- theme switch slot
- language switch slot
- UI primitives baseline
- Home layout / not-found shell
- layout tabs / root section switcher
- markdown transform pipeline 映射

因此 roadmap 已更新为：

- 下一步不是 site config
- 下一步是 foundation Phase 3：default MDX/MDC components mapping 与 link protocol
- 随后是 foundation Phase 4：shared layout options、nav links contract、search/theme/language slots、UI primitives baseline
- 产品层只在 foundation Exit Gate 后开始

产品层第一步仍然是 site config，但它只负责生成 foundation layout props，不定义底层 contract。

### 0. 修正：foundation 不能只理解成数据协议

上一轮把 foundation 的重心过度压到 `source / page tree / page contract`，这个口径不完整。

对照 Fumadocs，foundation 还包含一套基础 UI substrate：

- layout primitives：left sidebar、right TOC、mobile nav、breadcrumb、pager、footer
- prose primitives：heading、paragraph、list、blockquote、table、inline code、kbd、media
- code primitives：syntax highlight、code block、copy button、line number、diff state、code tabs
- docs content components：Accordion、Callout、Card、Tabs、Steps、Files、InlineTOC、TypeTable、Heading、ImageZoom
- preview primitives：component preview、code preview、preview frame

这些不是产品层能力。

产品层只能消费这些基础 contract，不能靠 site config、page actions 或插件临时补基础 UI。

### 1. 当前 foundation 不应继续追 Fumadocs 全量

对照 `D:\Projects\Learning\gh\fumadocs`，Fumadocs 做到的是框架级协议和生态级基础设施：

- source loader
- page tree builder
- transformer/fallback
- i18n
- layout/page contract
- docs components
- search/openapi/story 等周边包

当前项目已经拿到了 foundation 阶段最关键的协议层：

- `DocsNode[]`
- route path / source path 分离
- meta 目录控制层
- context tree / visible tree 分离
- `DocsPage` page-level contract
- slots 扩展位
- 内容组件和 CSS 分层
- 基础 UI substrate 需要再做一轮完整性 gate

所以后续不应在 foundation 阶段继续追完整 loader、transformer 或 plugin runtime。

但也不应跳过基础 UI substrate。

进入产品层实现前，应先完成 foundation UI gate：

- table / prose primitives 静态审计
- code highlight / code block / code tabs 状态审计
- component preview / code preview contract 审计
- DocFiles / DocTypeTable / DocInlineToc 缺口确认
- sidebar / TOC / mobile nav / pager / footer 扩展位确认

### 2. Fumapress 证明下一步应该做产品配置层

对照 `D:\Projects\Learning\gh\fumapress`：

- `packages/core/src/config.ts` 用 `defineConfig()` 聚合 `content / site / meta / layouts / plugins / adapters`
- `packages/core/src/layouts/docs.tsx` 在 Fumadocs `DocsPage` 外注入 markdown copy、view options、last modified
- `packages/core/src/lib/types.ts` 用 `ServerPlugin` 承接 search、sitemap、middleware、render override
- `apps/docs/press.config.tsx` 通过配置接入 docs、blog、flexsearch、llms、image、link validation、sitemap、mcp

这说明 foundation UI gate 通过后，最合理的产品层第一步是建立最小产品配置层：

- site config
- nav links schema
- Git metadata config
- page actions contract
- GitHub source link
- Copy Markdown

### 3. VitePress 只作为未来兼容边界

旧 prototype `D:\Projects\Work\tiny-robot-docs-ui` 证明 VitePress 的能力边界是 runtime/theme product layer：

- `docs/.vitepress/config.ts` 通过 `themeConfig` 管 `nav / sidebar / search / outline / docFooter / lastUpdated`
- `useDocsPageTree.ts` 明确是 `vitepress-sidebar-adapter`
- `DocsPageActions.vue` 的 Copy Markdown / Open Markdown 属于 page actions，而不是 docs tree/page protocol

因此，VitePress 不应作为当前 Nuxt foundation 的架构来源。

未来只保留 adapter 映射：

- VitePress `themeConfig` -> 当前 site config
- VitePress sidebar/search/outline -> 产品层 adapter
- 旧 prototype 组件经验 -> 当前 Vue 内容组件或 page actions

## 当前文档

- `design/implementation-notes.md`
- `design/roadmap.md`
- `design/foundation-prep-plan.md`
- `design/foundation-roadmap.md`
- `design/product-roadmap.md`
- `design/nuxt-content-mvp-plan.md`
- `design/fumadocs-alignment-plan.md`
- `design/layout-provider-parity-plan.md`
- `design/theme-runtime-parity-plan.md`
- `design/fumadocs-gap-audit.md`

### Fumadocs source gap audit

本轮再次横向对比 Fumadocs 源码、当前实现和规划后，新增
`design/fumadocs-gap-audit.md` 作为差异审计入口。

审计覆盖：

- core source / page-tree / loader / llms
- MDX plugins / markdown transform
- base-ui provider / layout / default MDX components
- search clients/providers
- ImageZoom / Banner / advanced components
- OpenAPI / AsyncAPI / Story / TypeScript generator 等高级包

结论摘要：

- 正文基础组件和 page-adjacent primitives 大多已实现并有 profile。
- 剩余 foundation P1 主要是 Theme Runtime、Root Provider/Layout Variants、
  ImageZoom 和 Markdown Transform Pipeline。
- 剩余 integration P1 主要是 remote search/API、feedback backend、RSS、
  `llms-full.txt`、per-page markdown export、image CDN adapter 和 multi-source baseline。
- OpenAPI / AsyncAPI / Story / AutoTypeTable / DynamicCodeBlock / GitHubInfo /
  Mermaid / KaTeX / Twoslash 继续作为产品或高级能力后置。

排期同步：

- `design/product-roadmap.md` 的推荐执行顺序已同步为：
  Theme Runtime -> Root Provider/Layout Variants -> ImageZoom ->
  Markdown Transform -> Integration P1 -> Multi source -> Site product composition。

### Layout/provider gap audit against Fumadocs

本轮再次对照 Fumadocs layout 源码后，确认此前规划仍偏重内容组件和当前
`DocsLayoutShell`，对 layout/provider 协议排期不够明确。

Fumadocs 证据：

- `packages/base-ui/src/provider/base.tsx`：
  - `RootProvider` 承接 theme、search、i18n、dir 和 framework adapter 的公共入口。
- `packages/base-ui/src/layouts/shared/index.tsx`：
  - `BaseLayoutProps` 承接 `githubUrl / links / nav / slots / themeSwitch / searchToggle / i18n`。
  - `LayoutTab / getLayoutTabs / isLayoutTabActive` 是 layout tabs/root section switcher 的协议来源。
- `packages/base-ui/src/layouts/shared/client.tsx`：
  - `baseSlots()` 集中提供 `themeSwitch / searchTrigger / languageSelect` 默认 slot。
- `packages/base-ui/src/layouts/docs/client.tsx` 和 `layouts/docs/slots/sidebar.tsx`：
  - docs layout 把 container/header/sidebar/provider/root/trigger/useSidebar 都当作 slots/protocol。
  - sidebar 支持 banner、footer、components、collapsible、tabs dropdown、language/theme/search footer。
- `packages/base-ui/src/layouts/home/*`：
  - Home layout、navbar menu、default not-found 是基础 layout surface，不只是页面示例。
- `packages/base-ui/src/layouts/notebook/*`、`layouts/flux/*`：
  - Notebook / Flux 是 layout variants。当前不需要全量实现，但需要 decision card 防止漏排。

当前项目状态：

- 已有 `DocsLayoutShell / DocsHeader / DocsSidebar / DocsMobileNav / DocsPage / DocsToc`。
- 已有 `banner / search-trigger / theme-switch / language-select` slots。
- 已有 `nav.tabs` 和 sidebar dropdown 的第一版。
- 缺少独立 `RootProvider`、`baseSlots` 等价默认 slot provider、sidebar provider/state contract。
- Home 仍是 `app/pages/index.vue` 页面组合，不是共享 layout contract。
- Not-found shell 未纳入 foundation。
- Banner 只有 slot 和 `--fd-banner-height` 预留，缺少是否进入 foundation 的 decision card。
- Notebook / Flux 没有实现，也没有延期决策记录。

边界结论：

- 这些 layout/provider 面属于 Foundation Substrate P1，不属于站点产品组合层。
- Notebook / Flux 不应现在实现，但必须记录 deferred variant decision。
- Banner 需要先做 foundation/product decision；若进入 foundation，必须覆盖 dismiss、storage、sticky 和 layout height。

已更新规划：

- `design/roadmap.md` 新增 `Stage 7.10：Root Provider / Layout Variants Gate`。
- `design/roadmap.md` 保持扁平，只保留 Stage 7.10 的目标、产物和链接。
- `design/foundation-roadmap.md` 新增摘要型 `Root Provider / Layout Variants Contract` 和
  `Phase 5.6：Root Provider / Layout Variants Gate`。
- `design/layout-provider-parity-plan.md` 承接详细 contract、契约卡和 profile 设计。
- `design/fumadocs-component-parity-inventory.md` 新增 `Layout / Root Provider Parity Inventory`。

文档治理规则：

- `design/roadmap.md` 只保留扁平路线、阶段顺序、当前优先级和指向详细文档的锚点。
- 具体设计、契约卡、profile 细节进入独立计划文档。
- inventory 只记录清单和状态，不复制完整执行设计。

后续执行顺序：

1. Theme Runtime / Preset Gate。
2. RootProvider + baseSlots/default slot provider。
3. Sidebar provider/state contract。
4. Layout tabs / root section switcher。
5. Home layout + not-found shell。
6. Banner decision。
7. Notebook / Flux decision cards。
8. ImageZoom。
9. Markdown transform pipeline。

## Foundation UI Gate 完成记录

本轮已按临时 `foundation-ui-gate-todo.md` 完成 foundation UI substrate 第一轮闭环。

已实现：

- Nuxt Content / MDC 默认组件映射入口：
  - `ProseA`
  - `ProseH1-H6`
  - `ProseImg`
  - `ProseTable`
  - `ProseCode`
  - `ProsePre`
- `DocsLink` 和 `docs-link` utility：
  - internal link
  - external link
  - hash link
  - relative `.md/.mdx` docs link 到 route path
  - active link 判断
- `provideDocsLinkContext()`：
  - route 页面和 home 页面都提供当前 source path / docs pages map
  - Markdown link 可以复用 sourcePath/path 分离规则
- `DocCodeBlock` contract：
  - title / filename / language / meta
  - slot 优先渲染 Shiki 内容
  - `code` prop 作为 copy source
  - copy 状态：idle / copied / failed
- `DocCodeTabs`
- P0 content components：
  - `DocCollapsible`
  - `DocFiles`
  - `DocFile`
  - `DocFolder`
  - `DocInlineToc`
  - `DocTypeTable`
  - `DocHeading`
- shared layout options：
  - `DocsNavLink`
  - `DocsNavOptions`
  - `githubUrl`
  - `links`
  - `nav`
- product extension slots：
  - `banner`
  - `search-trigger`
  - `theme-switch`
  - `language-select`
  - `pageActions`

实现判断：

- 当时继续 Vue-native primitives，未引入 Reka UI / shadcn-vue。
- 旧 `tiny-robot-docs-ui` 的可复用内容组件经验已吸收，但没有倒灌 VitePress runtime。
- `DocImageZoom` 后置为 P1，不阻塞产品层起步。
- 完整 markdown transform pipeline、page-tree transformer/plugin runtime 后置，不阻塞产品层起步。

验证：

- `pnpm exec nuxi typecheck` 已通过。

## Stage 6 产品层起步完成记录

本轮已按临时 `stage-6-product-todo.md` 完成产品层第一轮闭环。

已实现：

- site config schema：
  - `DocsSiteConfig`
  - `DocsSiteBrandConfig`
  - `DocsSiteGithubConfig`
  - `DocsSiteNavConfig`
  - `DocsSitePageActionsConfig`
  - `defineDocsSiteConfig()`
- 产品配置入口：
  - `app/config/docs-site.ts`
  - 当前站点名、描述、GitHub owner/repo/branch/contentDir、nav links、page actions 开关集中在一处。
- config -> layout props adapter：
  - `createDocsSiteLayoutProps()`
  - `useDocsSite()`
  - layout/header/mobile nav 继续消费 foundation props，不直接读取 site config。
- nav links schema 第一轮消费：
  - `DocsNavLink.icon` 已被 header/mobile menu 消费。
  - GitHub icon 使用用户提供的 SVG path。
  - icon-only nav link 保留隐藏文本，避免丢失 accessible name。
- Git metadata helper：
  - `getDocsGithubRepositoryUrl()`
  - `resolveDocsGithubFilePath()`
  - `getDocsGithubSourceUrl()`
  - `getDocsGithubEditUrl()`
  - source/edit URL 基于 `sourcePath` 生成，不使用 route path 猜文件。
- page actions contract：
  - `DocsPageAction`
  - `DocsPageActionState`
  - `DocsPageActions.vue`
  - link action 和 button action 共用一个展示 contract。
- GitHub source/edit page actions：
  - route 页面根据当前 page `sourcePath` 生成 `View source` 和 `Edit page`。
  - GitHub 配置缺失或页面 source path 缺失时不渲染坏链接。
- Copy Markdown：
  - `readDocsMarkdownSource()` 通过 Vite raw import 读取 `content/**/*.md(x)`。
  - route 页面通过 `copy-markdown` button action 调用 `writeDocsClipboardText()`。
  - 状态覆盖 idle / loading / success / failed，并在短延迟后 reset。

实现判断：

- 产品 config 只在 `useDocsSite()` 和 route/home composition 层消费。
- `DocsLayoutShell`、`DocsHeader`、`DocsMobileNav`、`DocsPage` 没有 import 产品 config。
- `DocsPage` 仍只提供 `pageActions` slot，GitHub 和 Copy Markdown 都没有写进 page foundation 组件。
- Copy Markdown 初版没有使用 server fs API，因为当前项目未配置 Node type definitions；改用 Vite raw import 更轻，并避免新增依赖。
- Vite raw import 会把可复制的 Markdown 作为构建资源纳入 bundle/chunks，后续若内容规模变大，可以再切换到带 Node types 的 server API 或 Nitro storage。

验证：

- `pnpm exec nuxi typecheck` 已通过。
- `pnpm build` 已通过。
- build 仍存在 Nuxt/Vite/Nitro 既有 warning：
  - module-preload-polyfill sourcemap
  - Tailwind Vite sourcemap
  - Nitro cache-driver external dependency
  - Node trailing slash pattern deprecation

下一步：

- Stage 7 产品层增强第一轮已完成，后续可以进入 Stage 8 高级产品能力，或回补 Stage 7 的 P1 provider / backend 能力。

## Stage 7 产品层增强完成记录

本轮已按临时 `stage-7-product-todo.md` 完成产品层增强第一轮闭环。

已实现：

- Stage 6 runtime smoke 修复：
  - Nuxt Content 的 `path` 是 route path，不是 Markdown source path。
  - `DocsPageRecord` 已补 `stem`，source/edit/copy markdown 改为基于 `stem -> sourcePath`。
  - route 页面按最终 route 找 record，再用 record path 查询内容。
  - relative docs link 解析也改为按 sourcePath 匹配，再输出最终 route path。
- Search product：
  - `DocsSiteSearchConfig`
  - `DocsSearchTrigger`
  - `DocsSearchDialog`
  - `DocsSearch`
  - `useDocsSearch()`
  - `createDocsSearchIndex()`
  - `searchDocsIndex()`
  - 初版 local search 覆盖 title / description / section / headings / body excerpt。
- Feedback product：
  - `DocsSiteFeedbackConfig`
  - `DocsFeedback`
  - Helpful / Not helpful 前端状态与 thanks label。
  - 通过 `DocsPage` footer slot 接入，不写进 page foundation。
- SEO / sitemap：
  - `DocsSiteSeoConfig`
  - `createDocsSeoTitle()`
  - `createDocsCanonicalUrl()`
  - docs page 与 home page 已补 title / description / OG / canonical。
  - `/sitemap.xml` 已按 visible docs pages 输出 canonical URL。
- LLM consumption boundary：
  - `/llms.txt` 已输出站点标题、描述和 visible docs page list。
  - 当前只做 discoverability，不实现 chat / embedding / MCP。
- Image pipeline baseline：
  - `DocsSiteImageConfig`
  - `ProseImg` 默认 `loading="lazy"` 和 `decoding="async"`。
  - prose media / figure 已补 max-width、height auto 和 overflow 保护。
- Link validation：
  - `scripts/validate-docs-links.mjs`
  - `pnpm validate:links`
  - 离线检查 Markdown link、directive `href`、internal route、relative `.md/.mdx`、hash anchor、external URL format。

实现判断：

- Search、feedback、SEO、sitemap、llms、image rules、link validation 都留在产品层或 tooling 层。
- `DocsHeader`、`DocsLayoutShell`、`DocsPage` 没有直接读取产品 config。
- Search 通过既有 `search-trigger` slot 接入；feedback 通过 page footer slot 接入。
- route 页面作为 composition surface 变厚，但没有承载 search scoring、feedback UI 或 sitemap/llms 生成逻辑。
- 本轮确认 `stem/sourcePath` 是所有 source/edit/copy/relative link 的稳定基础，route `path` 只能作为最终消费键。
- RSS、远程 search provider、feedback backend、image CDN/zoom、`llms-full.txt` 均后置为 P1。

验证：

- `pnpm validate:links` 已通过。
- `pnpm exec nuxi typecheck` 已通过。
- `pnpm build` 已通过。
- build 仍存在 Nuxt/Vite/Nitro 既有 warning：
  - module-preload-polyfill sourcemap
  - Tailwind Vite sourcemap
  - Nitro cache-driver external dependency
  - Node trailing slash pattern deprecation

## Fumadocs UI Primitives 对照结论

本轮对照本地 Fumadocs 源码：

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\ui\button.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\ui\tabs.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\ui\accordion.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\ui\collapsible.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\ui\popover.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\ui\scroll-area.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\dialog\search.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\page-actions.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\search-trigger.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\codeblock.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\tabs.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\accordion.tsx`

确认 Fumadocs 不是把每个 feature 单独手写交互，而是三层模型：

1. `components/ui/*`
   - 对 `@base-ui/react` 做薄封装。
   - 提供 Button variants、Tabs、Accordion、Collapsible、Popover、ScrollArea 等底层行为和最小样式。
2. docs component wrapper
   - `components/tabs.tsx`
   - `components/accordion.tsx`
   - `components/codeblock.tsx`
   - `components/dialog/search.tsx`
   - 负责 docs authoring contract、copy、hash、search result、code toolbar 等语义。
3. layout/product consumer
   - search trigger
   - page actions
   - sidebar tabs dropdown
   - TOC / layout slots
   - 只消费 primitives 和 wrapper，不重复实现交互底座。

当前项目的差距：

- 已有 button/copy/dialog/popover/tabs/collapsible/accordion 行为，但分散在多个组件里。
- `DocsSearchDialog`、`DocsTocPopover`、`DocsMobileNav`、`DocsPageActions`、`DocsFeedback`、`DocCodeBlock`、`DocAccordion`、`DocTabs`、`DocTypeTable` 各自维护了部分按钮、弹层、copy 或展开状态。
- 当前 token 已有 `--color-fd-*` bridge，视觉标准具备对齐基础，但缺 primitive contract。

下一步结论：

- Stage 8 前插入 `Stage 7.5：Fumadocs-Aligned UI Primitives Gate`。
- 目标是让 Vue 实现的 contract 尽量对齐 Fumadocs，而不是照搬 React 代码。
- 第一版可以 Vue-native，但必须对齐：
  - button variant / size
  - open/closed data state
  - ARIA
  - focus-visible ring
  - overlay / portal / focus return
  - tabs controlled/uncontrolled / keep mounted / group sync / anchor
  - accordion/collapsible height transition / `hidden="until-found"`
  - copy state reset timing 和 unmount cleanup
- 如果 Vue-native 实现开始重复处理复杂 accessibility，应重新评估引入 Reka UI 或其他 Vue behavior primitive。

## Stage 7.5 UI Primitives Gate 完成记录

本轮已按临时 `stage-7-5-primitives-todo.md` 完成
Fumadocs-aligned UI primitives 第一轮闭环。

已实现：

- `UiButton`：
  - `primary / outline / ghost / secondary`
  - `color` alias
  - `sm / icon / icon-sm / icon-xs`
  - disabled / loading / pressed / focus-visible state
- `useCopyState()`：
  - `idle / loading / copied / failed`
  - async copy callback
  - success reset timer
  - unmount cleanup
- `UiPopover`：
  - Root / Trigger / Content / Close
  - controlled/uncontrolled open
  - Teleport content
  - ESC close
  - outside click close
  - focus return
  - `data-state`
- `UiDialog` and command dialog structure：
  - Overlay / Content / Header / Close
  - CommandInput / CommandList / CommandItem / CommandFooter
  - focus trap
  - focus return
  - ESC close
  - active result navigation
  - `aria-selected`
- `UiTabs`：
  - Root / List / Trigger / Content
  - controlled/uncontrolled value
  - `groupId`
  - optional persistence
  - optional anchor update
  - keep-mounted panels hidden by inactive state
  - ArrowLeft / ArrowRight / Home / End navigation
- `UiAccordion` / `UiCollapsible`：
  - Root / Item / Header / Trigger / Content
  - single/multiple
  - controlled/uncontrolled state
  - collapsible behavior
  - `hidden="until-found"` support where useful
  - stable trigger/content ids
- `UiScrollArea`：
  - Area / Viewport / Scrollbar / Thumb
  - browser-native overflow
  - tokenized visual scrollbar
- docs wrappers：
  - `DocsCopyButton`
  - `DocsActionGroup`

已迁移：

- `DocsSearchTrigger`
- `DocsSearchDialog`
- `DocsTocPopover`
- `DocsPageActions`
- `DocsFeedback`
- `DocCodeBlock`
- `DocAccordion`
- `DocAccordions`
- `DocCollapsible`
- `DocTabs`
- `DocTab`
- `DocTypeTable`

实现判断：

- 当时判断 Vue-native primitives 足够支撑下一阶段产品开发，暂不引入
  Reka UI / shadcn-vue / Nuxt UI；该判断已被后续 `UiPopover` Reka POC 更新。
- `components/ui/*` 只依赖 Vue 和 `utils/ui-*` context，不读取 docs tree、
  route、site config、search index 或产品配置。
- docs authoring 语义保留在 content/docs wrapper 层：
  - code copy
  - heading anchor copy
  - hash-triggered accordion open
  - page action grouping
  - search result rendering
- 产品/布局组件只组合数据和 primitives，不再各自手写按钮、copy state、
  popover/dialog/tabs/accordion/collapsible 底层交互。
- `ui.css` 现在是 primitive stylesheet；`shell.css` 和 `content.css`
  继续分别承接 docs shell 和 docs content 样式。
- ScrollArea 第一版保留浏览器原生滚动，避免为了视觉一致性牺牲键盘、
  wheel 和 touch 可访问性。

验证：

- `pnpm exec nuxi typecheck` 已通过。
- `pnpm build` 已通过。
- `pnpm validate:links` 已通过。
- `git diff --check` 已通过。
- build 仍存在 Nuxt/Vite/Nitro 既有 warning：
  - module-preload-polyfill sourcemap
  - Tailwind Vite sourcemap
  - Nitro cache-driver external dependency
  - Node trailing slash pattern deprecation

下一步：

- 可以进入 Stage 8 高级产品能力。
- 如果先补 P1，优先顺序建议是：
  1. remote search provider / search API
  2. feedback backend / GitHub issue template
  3. RSS
  4. image CDN / ImageZoom
  5. llms-full.txt / per-page markdown export
  6. blog / changelog / API 多 source

## Stage 7.6 Visual Layout Parity 完成记录

本轮已按临时 `stage-7-6-visual-parity-todo.md` 完成 Fumadocs visual shell
第一轮闭环。

已实现：

- 桌面 docs shell 改为 Fumadocs-like root grid：
  - `#nd-docs-layout`
  - `#nd-sidebar`
  - `article#nd-page`
  - `#nd-toc`
  - sidebar / article / toc 宽度对齐到约 `268px / 900px / 268px`
- 桌面顶栏降级，brand / search / footer links 进入 sidebar。
- `DocsPageHeader` 顺序对齐为 section/breadcrumb signal、`h1`、description、
  compact actions row。
- `DocsPageActions` 对齐为一层 `Copy Markdown` + `Open` popover：
  - source/edit 等 secondary actions 进入 popover
  - compact 30px 级按钮
  - 保留当前 copy/link action contract
- right TOC 补齐：
  - `On this page` 图标标题
  - SVG rail
  - active thumb
  - depth-aware padding：h2 `20px`、h3 `32px`、h4+ `44px`
  - mobile popover 圆形 progress trigger
- `DocsPage` 增加 rendered heading fallback：
  - 当 Nuxt Content 没有提供 `body.toc.links`，客户端从 `.docs-page-body`
    的 `h2/h3/h4[id]` 扫描生成 TOC
  - 仍尊重 page-level `toc: false`
- 新增 component detail fixture：`content/guide/component-detail.md`。
- 新增 / 对齐 detail primitives：
  - `DocInstallCard`
  - `DocPreview variant="sandbox"`
  - `DocCodeTabs` dedicated visual hook
  - `DocTypeTable` row id + hash-open
- 内容 primitive 视觉收敛：
  - callout 支持 `warn` alias、图标、左色条
  - code block 支持 untitled floating copy、focusable code region、600px max height
  - cards/code/tabs/files/inline-toc/type-table 阴影降级为 Fumadocs-like
  - feedback 改为 divider row
  - pager 改为轻量 border-first

经验：

- Nuxt Content / MDC 对复杂 props 的 YAML-like 写法不稳定时，可以让组件
  同时接受数组和 JSON string，避免 authoring 层被解析细节卡住。
- raw Vue component 在 Markdown 里不要依赖自闭合写法；显式 closing tag 更稳。
- Fumadocs 的 TOC 本质是 heading protocol，不应只依赖某一个 content provider
  的 `body.toc.links` 字段。需要保留 provider data 优先，同时提供 DOM fallback。
- prose stylesheet 的全局规则会压过内容组件内部元素，例如
  `.docs-page-body p` / `.docs-page-body figure`。内容组件需要用更具体的
  selector 保护内部 margin，尤其是 install card / code block 这类复合组件。
- build 能捕获 template parse 问题，typecheck 不一定能捕获，例如模板事件里
  多语句换行导致的 Vue expression parse error。
- Nuxt Content 的 navigation payload 会把未声明的 boolean 字段也序列化成
  `false`。pager 这类 Fumadocs-like 默认开启语义不能直接依赖
  `item.pager !== false`，否则所有未声明页面都会被排除出 previous/next。
  后续如果要精准支持显式 `pager: false`，需要保留 frontmatter 原始性或引入
  schema/default normalization 层。
- Markdown/MDC 里的 boolean-like props 可能以字符串形式进入 Vue 组件，例如
  `default-open=true` 会变成 `"true"`。面向 Markdown 的 wrapper 组件需要在
  边界层 normalize，再向底层 primitive 传标准 boolean。

验证：

- `pnpm exec nuxi typecheck` 已通过。
- `pnpm build` 已通过；最终检查使用 `NUXT_IGNORE_LOCK=1` 避开 dev server
  lock。
- 浏览器已验证 `http://127.0.0.1:3000/guide/component-detail`：
  - desktop grid columns: `268px / 900px / 268px`
  - actions: `Copy Markdown` + `Open`
  - preview / install card / code tabs / type table / feedback 均渲染
  - TOC fallback 生成 4 个 links，h2/h3 缩进符合预期
- 最终复验补充：
  - `/guide/components` 已恢复 previous/next pager。
  - `/guide/components` 的 Files 默认展开不再触发 `defaultOpen` prop warning。
  - `/guide/component-detail` 已验证 preview / install / code tabs / type tables /
    feedback / pager 同时渲染。

## Stage 7.7 Parity Probe 拆分记录

本轮已把旧单文件 parity runner 的增长压力迁移到模块化 runner：

- 新入口：`scripts/parity/run.mjs`
- profile 模块：`scripts/parity/profiles/*.mjs`
- suite 模块：`scripts/parity/suites/*.mjs`
- core 能力：HTTP preflight、Chrome/CDP、assertion helpers、report formatter
- 已迁移 profile：
  - `callout`
  - `tabs`
  - `accordion`
  - `files`
  - `inline-toc`
  - `type-table`
  - `code-block`
  - `toc`
  - `sidebar`
  - `page-actions`

执行策略：

- 改单个组件时先跑对应增量 profile，例如：
  `node scripts/parity/run.mjs --profile=callout --url=http://127.0.0.1:8888/guide/components`
- 再跑所在 suite，例如：
  `node scripts/parity/run.mjs --suite=content-components --url=http://127.0.0.1:8888/guide/components`
- 阶段收口时运行 `full-regression` suite；旧单文件入口已在迁移完成并验证后删除。

Callout 漏检原因：

- 旧 `content-components` profile 只检查 root display、rail 宽度、icon 尺寸和
  title 字重，没有检查真正影响精致度的 computed metrics。
- Fumadocs callout 的关键隐含契约是 flex 默认 stretch 和 title `my-0!`。
  本地实现曾被 `.docs-page-body p` 的全局 margin 覆盖，同时 rail 没有跟随内容
  高度 stretch。
- 以后内容组件 parity 必须把 prose reset 和关键 bounding box 写入组件级 profile：
  root layout、内部 margin reset、font/line-height、rail/icon/content 对齐，以及
  open/active/hover 等状态语义。

契约卡流程验证：

- `callout` profile 已增加 rich capture，采集 DOM tree、关键节点 rect、
  computed box model、typography、color/elevation、transition/transform 等字段。
- 新增 `--dump`，用于把 raw capture 写入 `.parity/artifacts`。该目录是本地诊断
  生成物，已加入 `.gitignore`。
- 新增非破坏式 `--mutation=callout-broken-layout`，运行时只向当前浏览器页面注入
  临时坏样式，不修改源码。
- mutation 验证可以稳定复现过去的漏检类型：
  - root `align-items` 从 `stretch` 变成 `flex-start`
  - root `line-height` 从 `20px` 变成 `24.5px`
  - title margin 从 `0px` 变成 `20px 0px`
  - rail 高度不再跟随 content 高度
- 结论：rich capture 适合作为诊断层，assertions 继续只提升稳定关键契约。
  这能让组件还原时有更多参考数据，同时避免把回归变成易碎的全量像素锁。

验证：

- `node scripts/parity/run.mjs --profile=callout --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935 --chromePort=9242 --settleMs=1000`
  已通过，`14/14` checks。
- `node scripts/parity/run.mjs --suite=content-components --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935 --chromePort=9243 --settleMs=1000`
  已通过，当前 suite 包含已迁移的 `callout` profile。
- `node scripts/parity/run.mjs --suite=content-components --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935 --chromePort=9250 --settleMs=1000`
  已通过，拆分后的 `callout` / `tabs` / `accordion` / `files` /
  `inline-toc` / `type-table` profiles 均通过。
- `node scripts/parity/run.mjs --profile=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935 --chromePort=9245 --settleMs=1000`
  已通过，`16/16` checks。
- `node scripts/parity/run.mjs --suite=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935 --chromePort=9246 --settleMs=1000`
  已通过，`16/16` checks。
- `node scripts/parity/run.mjs --suite=code --viewports=1440x1000,994x935 --chromePort=9252 --settleMs=1000`
  已通过，`42/42` checks。
- `node scripts/parity/run.mjs --suite=docs-shell --viewports=1440x1000,994x935 --chromePort=9253 --settleMs=1600`
  已通过，`toc` 与 `sidebar` profiles 均通过。
- 删除旧单文件入口后，`node scripts/parity/run.mjs --suite=full-regression --viewports=1440x1000,994x935 --chromePort=9256 --settleMs=1600`
  已通过，全部 migrated profiles 通过。
- `node scripts/parity/run.mjs --profile=callout --viewports=1440x1000,390x844 --chromePort=9260 --settleMs=1000 --dump`
  已通过，生成 rich capture dump。
- `node scripts/parity/run.mjs --profile=callout --viewports=1440x1000,390x844 --chromePort=9261 --settleMs=1000 --mutation=callout-broken-layout --dump`
  按预期失败，错误信息准确指向 root rhythm、rail stretch、title prose reset。
- mutation 后重新运行
  `node scripts/parity/run.mjs --profile=callout --viewports=1440x1000,390x844 --chromePort=9262 --settleMs=1000`
  已通过，证明 mutation 不污染源码或正常页面。
- `node scripts/parity/run.mjs --suite=full-regression --viewports=1440x1000,994x935 --chromePort=9263 --settleMs=1600`
  已通过，证明 dump/mutation 能力没有破坏现有 parity gates。

Page actions 契约卡验证：

- `page-actions` profile 从“可见且可展开”扩展为 button/menu contract：
  - 捕捉 `data-action-id / data-state / aria-label`、computed position、
    min/max width、按钮字号/高度、菜单项 display/font/href/target。
  - 新增断言覆盖 actions row `align-items:center`、Copy/Open 同字号同高度、
    popover `240px` 最小宽度、相对 trigger 的 top/left 几何、菜单项文案与外链。
- 新流程发现旧断言漏掉的差异：
  - Copy 走 `UiButton size=sm` 是 `12px`，Open trigger 只靠
    `.docs-page-action` 曾是 `14px`。
  - `UiPopoverContent` 内联 `minWidth: trigger.width` 会压过
    `.docs-page-open-popover { min-width: 15rem }`，导致菜单只有约 `153px`。
  - popover 打开后自动 focus 首个菜单项会触发页面滚动；同时移动端在固定定位前
    先测量 block 宽度，导致 top/left 偏离 trigger。
- 已对齐：
  - Page actions 按钮统一为 Fumadocs-like compact `12px / 34px` rhythm。
  - Copy 成功态保持 `Copy Markdown` 文案，只切换 check 图标，避免宽度跳动。
  - Open 菜单扩展为 `Open in GitHub / Edit page / Open in Scira AI /
Open in ChatGPT / Open in Claude / Open in Cursor`。
  - Popover 改为先隐藏固定定位测量，再写入最终位置，并使用
    `focus({ preventScroll: true })` 避免焦点滚动破坏几何。
- 验证：
  - `node scripts/parity/run.mjs --profile=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,390x844 --chromePort=9266 --settleMs=1200 --dump`
    已通过，`20/20` checks。最终 dump 关键值：desktop popover
    `left=439/top=216/width=240`，mobile popover `left=142/top=276/width=240`。
  - `node scripts/parity/run.mjs --suite=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,390x844 --chromePort=9267 --settleMs=1200`
    已通过，`20/20` checks。
  - `node scripts/parity/run.mjs --suite=full-regression --viewports=1440x1000,994x935 --chromePort=9270 --settleMs=1600`
    已通过。注意 full-regression 不应传单一 `--url` 覆盖所有 profile fixture。
- 已采纳流程优化：`scripts/parity/run.mjs` 现在会拒绝
  `--suite=full-regression --url=...`，避免全局 URL 覆盖混合 fixture 后产生
  假失败。需要固定页面时改跑窄 profile 或共享 fixture 的 suite。
- 后续待办：`View as Markdown` 需要先暴露 per-page markdown URL，再加入 Open
  菜单并补 profile 断言。
- 本轮 TypeTable 收口后重新验证 PageActions，发现首个 1440 视口偶发失败而后续
  视口通过。单视口长 settle 可通过，说明是 profile 首次交互窗口过紧，而不是
  组件实现回退。
- 已把 `page-actions` profile 的交互从固定 sleep 改为目标状态等待：
  - Open 等待 `aria-expanded="true"` 和 `.docs-page-open-option` 渲染完成。
  - Feedback 等待 pressed state 和 thanks text。
- 复验：
  - `node scripts/parity/run.mjs --profile=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9312 --settleMs=2500 --dump`
    通过，`28/28`。
  - `node scripts/parity/run.mjs --suite=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9313 --settleMs=2500`
    通过，`28/28`。
- 流程经验：交互 profile 应等待被断言的语义状态，而不是只依赖固定延迟。
  如果只有首视口失败、后续视口通过，优先排查 hydration/interaction readiness。

### Stage 7.7 Callout second-pass parity

本轮按新流程完成 Callout 二次对齐：

- `DocCallout` 支持 Fumadocs-style `type`，并保留旧 `tone`。
- alias 规则补齐为 `warn -> warning`、`tip -> info`。
- 新增低层组合协议：`DocCalloutContainer`、`DocCalloutTitle`、
  `DocCalloutDescription`。
- `content/guide/components.md` fixture 覆盖全 tone、alias、无标题长内容和
  container/title/description 组合。
- `callout` profile 从两个样本的视觉壳检查扩展为协议、DOM、computed style、
  responsive 检查。

验证：

- `node scripts/parity/run.mjs --profile=callout --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9286 --settleMs=2500 --dump`
  通过，`28/28`。
- `pnpm typecheck` 通过。

流程经验：fixture 或组件刚变更后，移动端 capture 可能与 HMR settle 竞争。
组件 profile 第一次验证建议使用 `--settleMs=2500`，确认稳定后再考虑降低。

### Stage 7.7 Tabs / CodeTabs second-pass parity

本轮按新流程完成 Tabs / CodeTabs 二次对齐：

- `DocTabs` 支持 simple mode：`items`、`defaultIndex`、`label`。
- 手写 triggers/panels 模式保持兼容。
- `tabs` profile 覆盖 ordinary tabs、simple mode 和 CodeTabs。
- profile 采集改为 direct ownership selector，避免普通 tabs 被嵌套或相邻
  CodeTabs 污染。

验证：

- `node scripts/parity/run.mjs --profile=tabs --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9296 --settleMs=2500 --dump`
  通过，`19/19`。

流程经验：

- slot-heavy fixture 应优先使用 MDC 语法，避免 raw PascalCase Vue blocks 在
  Markdown 中产生不稳定嵌套边界。
- `pnpm typecheck` 会触碰 `.nuxt` 生成物。若 dev server 正在运行，typecheck
  后继续跑 runtime parity 前必须重启 managed dev server。

### Stage 7.7 Accordion second-pass parity

本轮按新流程完成 Accordion 二次对齐：

- 确认当前 Vue 实现已经覆盖 root type、默认打开项、hash/copy/open state、
  `hidden="until-found"` 和 `role="region"`。
- `accordion` profile 增加 root `data-type` 断言。
- profile 在首轮 capture 前增加短等待，并在点击前把 trigger 滚动到视口中间，
  避免 hydration 和 offscreen click 造成假失败。

验证：

- `node scripts/parity/run.mjs --profile=accordion --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9299 --settleMs=2500 --dump`
  通过，`10/10`。

### Stage 7.7 Files second-pass parity

本轮按新流程完成 Files / File / Folder 二次对齐：

- fixture 覆盖嵌套 open folder、closed folder opening、disabled folder、根级
  file、长文件名截断。
- `files` profile 增加 tree density、folder state、nested border/indent、
  disabled state、truncation 断言。

验证：

- `node scripts/parity/run.mjs --profile=files --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9303 --settleMs=3000 --dump`
  通过，`16/16`。

流程经验：

- 深层 MDC tree 中，leaf node 用 inline 语法 `:doc-file{}` 更稳定。
- 为了测量 parity，不必把所有状态塞进一棵大树；可以拆成多个 `DocFiles`
  样本，profile 跨样本聚合断言。

### Stage 7.7 InlineTOC second-pass parity

本轮按新流程完成 InlineTOC 二次对齐：

- `DocInlineToc` 的 `defaultOpen` 支持 boolean-like 字符串。
- fixture 增加 default-closed 样本和真实 `h3` 嵌套标题。
- `inline-toc` profile 覆盖 active link、depth padding、collapsed/open
  interaction 和三视口响应式。

验证：

- `node scripts/parity/run.mjs --profile=inline-toc --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9305 --settleMs=2500 --dump`
  通过，`10/10`。

流程经验：

- 断言某个状态前，fixture 必须真实呈现该状态。本轮 depth padding 初次失败，
  原因是页面没有任何嵌套 heading。

### Stage 7.7 TypeTable second-pass parity

本轮按新流程完成手写 `DocTypeTable` 二次对齐：

- fixture 扩展到 4 行，覆盖 required、default、deprecated、linked
  `typeDescription`、parameters、returns 和 hash-open details。
- `type-table` profile 覆盖 row matrix、detail 展开、`aria-expanded`、
  details grid display、参数名、返回值和 `#page-on-change` hash。
- 当前边界只验证手写 TypeTable UI contract；`AutoTypeTable` 仍归类为
  generator/product enhancement，不阻塞 foundation component parity。

验证：

- `node scripts/parity/run.mjs --profile=type-table --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9309 --settleMs=4000 --dump`
  通过，`16/16`。

流程经验：

- 会修改 `location.hash` 的 profile 必须在每次 capture 前后清理 hash。多视口
  运行会复用页面上下文，否则前一个视口的 hash/open state 会污染后一个视口，
  造成假失败。

### Stage 7.7 current batch regression

本轮 Callout / Tabs / Accordion / Files / InlineTOC / TypeTable / PageActions
批次已完成回归：

- `node scripts/parity/run.mjs --suite=content-components --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9317 --settleMs=3000 --dump`
  通过。
- `node scripts/parity/run.mjs --suite=page-actions --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9313 --settleMs=2500`
  通过。
- `node scripts/parity/run.mjs --suite=full-regression --viewports=1440x1000,994x935,390x844 --chromePort=9319 --settleMs=3000 --retries=1 --dump`
  通过。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。

回归经验：

- full-regression 初次运行时曾出现单 viewport 的 Nuxt `500 - Internal Server
Error`，dump 显示标题为 Nuxt 500 而不是组件 DOM 缺失。重跑通过，判断为
  dev-server rebuild/HMR 期间的 server-health 波动。长回归建议加
  `--retries=1`，并在失败 dump 中先区分 server-health 与 UI mismatch。

### Stage 7.8 Cards / CardGrid second-pass parity

本轮按新流程完成 Cards / CardGrid 二次对齐：

- `DocCard` 补齐 Fumadocs-like `icon`、`external`、`data-card` 合同，并改为
  通过 `DocsLink` 消费已有 docs link protocol。
- 保留本地 `badge` 作为扩展边界，不把它当作 Fumadocs 必需合同。
- `DocCardGrid` / card CSS 对齐到 2 列 grid、12px gap、12px radius、16px
  padding、14px title/body、icon chip 和移动端 full-span。
- fixture 覆盖 internal/current-page/external/non-link/slot body/badge/icon/
  long-text 状态。
- 新增 `cards` profile，并加入 `content-components` suite。

验证：

- `node scripts/parity/run.mjs --profile=cards --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9320 --settleMs=3000 --dump`
  通过，`16/16`。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。

流程经验：

- Card 这类看似简单的组件也必须采集 authoring contract。只看卡片外观会漏掉
  `data-card`、external link、icon chip、slot body 和 non-link root 这些未来
  很容易回退的细节。

### Stage 7.8 Steps / Step second-pass parity

本轮按新流程完成 Steps / Step 二次对齐：

- `DocSteps` 保留原有 list-based authoring 兼容性。
- 新增 `DocStep`，补齐 Fumadocs `Steps` / `Step` 的显式组件协议。
- steps CSS 同时覆盖 `.fd-steps li` 与 `.fd-step`，共享 counter、marker、
  rail、padding 和 prose margin reset。
- fixture 覆盖旧 `ol/li`、新 `DocStep`、inline code、内部链接和窄屏长文本
  wrapping。
- 新增 `steps` profile，并加入 `content-components` suite。

验证：

- `node scripts/parity/run.mjs --profile=steps --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9321 --settleMs=3000 --dump`
  通过，`16/16`。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。
- typecheck 后已重启托管 dev server，`/guide/components` 健康检查通过。

流程经验：

- profile 必须区分组件协议和 fixture 写法。旧 `li` 路径可以是纯文本，
  因此不能强制检查 `firstElementChild`；显式 `DocStep` 路径才检查
  first-child margin reset。
- 对 CSS token 的 computed value 要分层断言：marker `32px`、rail `1px`、
  padding `48px` 是结构硬指标；pill radius 这类 token 展开值可用语义阈值，
  避免 `999px` / `9999px` 差异制造假失败。

### Stage 7.8 Heading second-pass parity

本轮按新流程完成 Heading anchor 二次对齐：

- `DocHeading` 保持 `as` / `id` / default slot 合同，改为 Fumadocs-like
  “标题文本 anchor + 独立 copy anchor button”结构。
- 标题文本 anchor 增加 `data-card`，避免被通用 prose link underline 规则覆盖。
- copy 行为复用 `DocsCopyButton`、`useCopyState()` 和
  `writeDocsClipboardText()`，没有新增 feature-local copied timer。
- `prose.css` 增加 heading flex group、`112px` scroll margin、copy button
  hover/focus-within reveal。
- 新增 `heading` profile，并加入 `content-components` suite。

验证：

- `node scripts/parity/run.mjs --profile=heading --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9322 --settleMs=3000 --dump`
  通过，`16/16`。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。
- typecheck 后已重启托管 dev server，`/guide/components` 健康检查通过。

流程经验：

- 涉及 URL/hash 的 profile 不应直接用 raw suffix 对比。中文 heading id
  会被浏览器序列化为 percent-encoded hash，稳定断言应解码 hash 后与源
  `id` 比较。
- copy 类交互的契约卡要同时验证 DOM ownership、按钮 label/state、实际 copy
  payload，以及是否复用共享 copy primitive。

### Stage 7.8 Prose defaults second-pass parity

本轮按新流程完成默认 Markdown / prose 映射二次对齐：

- 在 `content/guide/components.md` 增加 compact fixture，覆盖 internal link、
  external link、inline code、Markdown table 和 Markdown image。
- 新增 `prose-defaults` profile，并加入 `content-components` suite。
- `resolveDocsLink()` 的外链 rel 逻辑改为 merge：保留输入 rel（例如
  `nofollow`），同时补齐 `noreferrer noopener`。
- profile 覆盖 link target/rel、inline code class/style、table overflow
  wrapper、image lazy/async/alt/caption，以及 heading rhythm 的组合场景。
- ImageZoom 仍保留为单独边界，不纳入本轮基础 prose defaults。

验证：

- `node scripts/parity/run.mjs --profile=prose-defaults --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9323 --settleMs=3000 --dump`
  通过，`16/16`。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。
- typecheck 后已重启托管 dev server，`/guide/components` 健康检查通过。

流程经验：

- Markdown 解析会引入组件源码里看不到的 wrapper。本轮 image 实际 DOM 是
  `<p><figure class="fd-doc-image">...`，因此契约卡应该采集 section 子树
  DOM，而不是只查 heading 后的顶层兄弟节点。
- 外链断言必须同时覆盖安全 token 和上游 token 保留。`nofollow` 这类输入值
  不能被 `noopener`/`noreferrer` 修复覆盖掉。

### Stage 7.8 Preview / InstallCard second-pass parity

本轮按新流程完成 Preview / InstallCard 二次对齐：

- 在 `content/guide/components.md` 为 `DocInstallCard` 增加 fixture，使主
  content-components suite 能覆盖 preview 与 install card。
- 新增 `preview` profile，并加入 `content-components` suite。
- profile 覆盖 preview shell、canvas region、description、source code block、
  source copy action、install title/description/command、install code block 和
  三视口宽度。
- 修复 preview source 内嵌 code block margin 被通用
  `.docs-page-body .fd-doc-code-block` 覆盖的问题，补充
  `.docs-page-body .fd-doc-preview-source .fd-doc-code-block { margin: 0; }`。

验证：

- `node scripts/parity/run.mjs --profile=preview --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9324 --settleMs=3000 --dump`
  通过，`16/16`。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。
- typecheck 后已重启托管 dev server，`/guide/components` 健康检查通过。

流程经验：

- 对嵌入型组件要采集 computed cascade，而不只检查 DOM 存在。本轮 profile
  抓到 `.fd-doc-preview-source .fd-doc-code-block` 与后置通用 prose code block
  规则 specificity 打平的问题；后置规则胜出导致 source code block 重新出现
  `16px 0` margin。

### Stage 7.8 Feedback / Pager second-pass parity

本轮按新流程完成 Feedback / Pager 二次对齐：

- 新增 `feedback` profile，覆盖 page metadata、prompt、按钮、pressed state、
  thanks live region 和三视口响应式 wrapping。
- 新增 `pager` profile，覆盖 single-side pager、链接语义、方向 class、title row、
  icon、truncation、移动端单列。
- 新增 `page-tail` suite，包含 `feedback` 和 `pager`。
- 修复 feedback button sizing cascade：`.docs-feedback-button` 的 pill 尺寸会被
  generic `.ui-button[data-size='sm']` 覆盖，因此补充
  `.docs-feedback-button.ui-button[data-size='sm']`。
- 当前导航 fixture 中 `/guide/components` 是 next-only pager，
  `/guide/component-detail` 是 previous-only pager；profile 支持单侧/双侧合同，
  本轮分别验证两个单侧方向。

验证：

- `node scripts/parity/run.mjs --profile=feedback --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9325 --settleMs=3500 --dump`
  通过，`16/16`。
- `node scripts/parity/run.mjs --profile=pager --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9326 --settleMs=3500 --dump`
  通过，`16/16`。
- `node scripts/parity/run.mjs --profile=pager --url=http://127.0.0.1:8888/guide/component-detail --viewports=1440x1000,994x935,390x844 --chromePort=9327 --settleMs=3500 --dump`
  通过，`16/16`。
- `node scripts/parity/run.mjs --suite=page-tail --url=http://127.0.0.1:8888/guide/components --viewports=1440x1000,994x935,390x844 --chromePort=9328 --settleMs=3500 --dump`
  通过。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。

流程经验：

- Page-tail profile 要尊重真实导航数据。没有双侧 pager fixture 时，不应强行
  要求当前页面同时有 previous/next；可以用两个 URL 分别锁 next-only 和
  previous-only，再等出现双侧 fixture 时补充严格双列检查。
- 交互 profile 建议在 click 前等一帧，并 dispatch bubbling `MouseEvent`，
  再等待 Vue state commit。直接调用 `.click()` 在 suite 串跑时更容易出现单
  viewport 假失败。

### Queued: TOC responsive shell parity

下一批优先处理右侧 TOC 响应式：

- 先读 Fumadocs TOC / docs layout 源码，确认 breakpoints、desktop sticky TOC、
  constrained-width 行为、mobile/popover 替代方案。
- 本地采集 `DocsToc`、`DocsTocPopover`、page frame、left sidebar、content
  column 的 DOM、computed style、bounding box、active item、scroll progress、
  open/focus/keyboard state。
- 视口矩阵至少覆盖 `2048x1152`、`1440x1000`、`1280x800`、`1180x820`、
  `1024x768`、`994x935`、`834x1112`、`768x1024`、`390x844`。
- profile 要增加 shell collision checks：TOC 不应覆盖正文、左侧目录、顶部
  header、page actions 或移动导航。

### Stage 7.8 batch regression

本轮 Cards / Steps / Heading / Prose Defaults / Preview / Feedback / Pager 批次
已完成回归：

- `content-components` suite 通过，覆盖本批新增 body primitives 以及既有
  Callout / Tabs / Accordion / Files / InlineTOC / TypeTable。
- `page-tail` suite 通过，覆盖 Feedback / Pager。
- 扩展后的 `full-regression` 通过，新增纳入 `cards`、`steps`、`heading`、
  `prose-defaults`、`preview`、`feedback`、`pager`。
- `pnpm typecheck` 通过。
- `pnpm validate:links` 通过：25 pages，11 links。
- `git diff --check` 通过。
- typecheck 后已重启托管 dev server，`/guide/components` 健康检查通过。

回归经验：

- full-regression 应及时纳入新增 profile，否则“全量通过”会遗漏刚沉淀的合同。
- 长 profile / suite 运行前后保持 dev server 健康检查，能减少 Nuxt rebuild/HMR
  中间态对多视口捕获的干扰。

### Stage 7.8 TOC responsive shell parity

本轮按新流程完成右侧 TOC 响应式壳层对齐：

- 对照 Fumadocs docs page / TOC 源码，确认其核心响应式 contract：
  `xl` 以上展示 desktop sticky TOC，`xl` 以下隐藏 desktop TOC，并由 sticky
  `toc-popover` 行承接目录入口。
- 新增 `toc-responsive` profile，独立于基础 `toc` profile：
  - `toc` 继续负责 TOC item、active/current、popover 基础开合等语义。
  - `toc-responsive` 专门负责 shell 几何、断点、sticky、碰撞、移动导航共存和
    常见分辨率矩阵。
- 新 profile 采集：
  - `#nd-docs-layout`
  - `.docs-shell-content`
  - `.docs-page-frame`
  - `#nd-page`
  - `#nd-sidebar`
  - `#nd-toc`
  - `.docs-toc-popover`
  - `.docs-mobile-nav`
  - `.docs-header`
- 首轮验证发现：
  - 既有 `toc` profile 已通过，但没有检查移动 header 与 sticky popover 的
    位置关系。
  - 移动端滚动后 `.docs-toc-popover` 的 computed `top` 仍是 `0px`，trigger
    会落在 header 区域下方/背后。
- 已修复：
  - 在 `max-width: 959px` 下将 `.docs-toc-popover` 的 sticky top 改为
    `var(--docs-header-height)`。
  - 960-1279 无移动 header 的区间继续保持 `top: var(--fd-banner-height)`。
- 已纳入：
  - `docs-shell` suite
  - `full-regression` suite

验证：

- `node scripts/parity/run.mjs --profile=toc-responsive --url=http://127.0.0.1:8888/guide/component-detail --viewports=2048x1152,1440x1000,1280x800,1180x820,1024x768,994x935,834x1112,768x1024,390x844 --chromePort=9341 --settleMs=2200 --dump`
  通过，`100/100`。
- `node scripts/parity/run.mjs --suite=docs-shell --url=http://127.0.0.1:8888/guide/component-detail --viewports=2048x1152,1440x1000,1280x800,1180x820,1024x768,994x935,834x1112,768x1024,390x844 --chromePort=9342 --settleMs=2600 --retries=1 --dump`
  通过，`toc 58/58`、`toc-responsive 100/100`、`sidebar 85/85`。
- `node scripts/parity/run.mjs --suite=full-regression --viewports=1440x1000,994x935,390x844 --chromePort=9343 --settleMs=3200 --retries=1 --dump`
  通过，包含 `toc-responsive 36/36`。
- `pnpm typecheck` 通过。
- `pnpm validate:links` 通过：25 pages，11 links。
- `git diff --check` 通过。
- typecheck 后已重启托管 dev server，`/guide/component-detail` 健康检查通过。

### 2026-07-11 verification flow tightening

- Local verification had become too cumulative: developers were effectively
  paying `health -> typecheck -> health -> focused e2e -> responsive e2e ->
parity/probe -> links -> diff` even when the change only touched one narrow
  desktop surface.
- Current Playwright coverage is already broad enough that the daily path does
  not need legacy parity plus multi-project grouped suites on every loop.
- The optimized local model is now:
  - iteration: one focused spec or one focused static check
  - batch closeout: one `typecheck`, then route-specific health, then the
    smallest relevant regression command
  - milestone/pre-merge: `test:e2e:fast` or `test:e2e:full:failfast`
- New package scripts were added to support that shorter path:
  - `test:e2e:*:desktop` for non-responsive work
  - `test:e2e:responsive` for tablet/mobile shell checks
  - `test:e2e:content:serial` for Nuxt Content-heavy fallback
  - `test:e2e:full:failfast` for broad but cheaper local failure detection
- Legacy parity remains useful, but only for unmigrated surfaces, hidden DOM,
  and reference comparison. It should not remain part of the default local loop
  for migrated visible behavior.
- A dedicated `scripts/run-playwright.mjs` wrapper now makes server ownership
  explicit by removing it from the test runner:
  - `test:e2e:*` scripts now assume a server is already running
  - the wrapper only checks reachability, then launches Playwright
- Playwright no longer starts or stops Nuxt automatically in this repo, which
  removes the extra window/process churn from local test commands.

### 2026-07-11 verification flow shortcuts

- Added `pnpm test:e2e:changed` and `pnpm test:e2e:last-failed` as lighter
  retry entrypoints around Playwright CLI selection flags.
- `test:e2e:last-failed` now uses a strict wrapper mode in this repo. When
  `.playwright/test-results/.last-run.json` has no failed tests, the command
  exits successfully and skips Playwright instead of silently falling back to a
  broader collection.
- `test:e2e:changed` is useful for Playwright-side changes such as specs and
  helpers, but it is not a generic affected-test solver for app source edits in
  this repo. The browser tests do not import ordinary Nuxt app files, so app
  changes still need one focused file, one focused tag, or one explicit grouped
  script.
- The default iteration loop should now start from the smallest relevant
  Playwright command. `dev:health` remains valuable after `pnpm typecheck` or
  when route/content/server state looks suspicious, but it should not stay in
  front of every focused retry by habit.
- The wrapper precheck now validates a real docs route, not just the app root:
  it probes `PLAYWRIGHT_TEST_HEALTH_PATH` or `/guide/components` by default,
  which catches stale `404`/Nuxt-error states after `typecheck` more reliably
  than a root-only ping.
- The old `tests/e2e/content-components.spec.ts` grouping has now been split
  into four surface-owned specs under `tests/e2e/content-components/`:
  - `cards-callout.spec.ts`
  - `tabs-accordion-files.spec.ts`
  - `inline-toc-type-table-steps.spec.ts`
  - `heading-preview.spec.ts`
- On PowerShell, tag filters such as `@callout` and `@files` must be quoted
  when passed to `--grep`; otherwise they can be misparsed before reaching
  Playwright.

### 2026-07-11 runtime content verification downshift

- Added a lighter Nuxt runtime test layer with `@nuxt/test-utils`, `vitest`,
  `@vue/test-utils`, and `happy-dom`.
- Added `test:nuxt`, `test:nuxt:content`, and `test:nuxt:watch` as local
  entrypoints for render-only or transform-heavy verification.
- The first runtime spec is `tests/nuxt/docs-content-rendering.nuxt.spec.ts`.
  It now owns:
  - prose defaults structure
  - markdown transform structure such as custom heading ids and code meta
  - code block shell rendering
- The retained Playwright split is now:
  - `tests/e2e/prose-defaults.spec.ts`: removed after full downshift
  - `tests/e2e/markdown-transform.spec.ts`: kept only for search-facing page
    behavior
  - `tests/e2e/code-block.spec.ts`: kept only for browser-only highlighting,
    overflow, and typography behavior
- The stable runtime harness pattern is:
  - read raw markdown with `readDocsMarkdownSource()`
  - parse it with the project rehype pipeline
  - render the parsed AST through `ContentRenderer`
  - wrap it in `DocsBody`
- Two earlier approaches were intentionally rejected:
  - mounting the full route page pulled in unrelated layout/site data and made
    structure tests noisy
  - calling `queryCollection()` inside runtime tests tried to fetch the Nuxt
    Content client SQL dump and failed on `/__nuxt_content/.../sql_dump.txt`
- Reusing `ContentRenderer` was the key fix. Direct `MDCRenderer` mounting did
  not inherit Nuxt Content's local component resolution map, so `doc-*`
  components such as `DocCallout` and `DocPreview` failed to resolve.
- Validation:
  - `pnpm run test:nuxt:content` passed: `3 passed`
  - `node scripts/dev-server.mjs health --path=/guide/code-block --timeout=30000`
    passed before the retained browser-only check
  - `pnpm run test:e2e -- tests/e2e/code-block.spec.ts --project=chromium-desktop --max-failures=1`
    passed on focused rerun after one hydration-timeout navigation blip

流程经验：

- 对响应式 shell 问题，不能只验证目标组件是否存在。契约卡必须同时采集
  shell/content/page/sidebar/TOC/popover/header 的 DOM、computed style 和
  bounding box。
- 组件 profile 与响应式 shell profile 应拆分。否则旧 profile 会无限增长，
  而新增断言也很难表达“这个 profile 到底保护什么”。
- computed CSS 要按浏览器解析后的值断言。例如 `50vh` 会变成像素值，应按
  `viewport.height * 0.5` 做容差比较。

### Boundary review: Fumadocs / Fumapress / assistant-ui

本轮重新复核 Fumadocs、Fumapress 和 assistant-ui docs 源码后，修正此前过于粗糙
的“基础层 / 产品层”二分法。

证据：

- Fumadocs 自身承担大量基建：
  - `packages/core/src/source/*` 提供 source loader、page tree、schema、llms。
  - `packages/core/src/search/*` 提供 search server / flexsearch from source。
  - `packages/base-ui/src/layouts/docs/*` 提供 DocsLayout / DocsPage / TOC / page slots。
  - `packages/base-ui/src/mdx.tsx` 和 `components/*` 提供 default MDX components、
    codeblock、tabs、accordion、callout、card、files、steps、type-table 等。
- Fumapress 主要是 Fumadocs 的应用框架封装：
  - `packages/core/src/config.ts` 聚合 content、site、layouts、plugins、adapters。
  - `packages/core/src/layouts/docs.tsx` 直接消费 Fumadocs `DocsLayout`、
    `DocsPage`、`MarkdownCopyButton`、`ViewOptionsPopover`。
  - `packages/core/src/lib/types.ts` 用 `ServerPlugin` 承接 route、middleware、
    render override 和 loader 配置。
  - `plugins/flexsearch.ts`、`plugins/llms.txt.ts` 等更多是在 Fumadocs core
    能力外面加 output route、mode 和 provider 装配。
- assistant-ui docs 直接消费 Fumadocs contract，但做了明显的站点产品组合：
  - `source.config.ts` 使用 `fumadocs-mdx/config` 定义 docs、examples、blog、
    careers 等 collections。
  - `lib/source.tsx` 使用 `fumadocs-core/source` loader，并加本地
    `platformsPlugin()`。
  - docs page 使用 Fumadocs `DocsPage` / `DocsBody`，但自定义 header、TOC
    actions、pager、sidebar、assistant panel、platform filter 和 analytics。

更新后的边界：

1. Foundation Substrate：
   Vue / Nuxt 版 Fumadocs 等价底座，包括 source/page tree、layout/page slots、
   TOC/sidebar/mobile nav、default MDC components、code/prose/preview/content
   components、UI primitives、tokens 和 CSS layering。
2. Integration / Plugin Layer：
   类 Fumapress 层，包括 site config、adapters、server/product routes、
   search provider、feedback backend、sitemap/RSS/SEO、llms/markdown export、
   image CDN、multi source loader 和 deploy/generate strategy。
3. Site Product Composition：
   类 assistant-ui 层，包括 brand/home/product pages、自定义 docs shell
   组合、TOC actions、AI/MCP/docs assistant、story/playground、blog/changelog/API
   页面体验、i18n/versioning、analytics 和业务路由。

结论：

- 当前项目不能直接复用 Fumadocs React 基建，所以仍要先把 Vue foundation
  substrate 补稳。
- Fumapress 不应被理解成“重写 docs UI 的产品层”，而应作为 config/adapter/plugin
  封装模式参考。
- assistant-ui 不应被理解成 foundation 来源，而应作为站点产品组合和自定义壳层
  节奏参考。
- Changelog / Open issues 暂不进入当前主线；它们应等 multi source / page metadata
  contract 稳定后再作为集成层和站点组合层能力推进。

后续执行顺序：

1. 基础缺口复核：
   - ImageZoom
   - Home layout
   - not-found shell
   - sidebar layout tabs / root section switcher
2. Markdown transform pipeline：
   - heading id / custom id
   - code meta parsing
   - line highlight / diff / focus / filename
   - structured data extraction
3. 集成层 P1：
   - remote search provider / search API
   - feedback backend / GitHub issue template
   - RSS
   - llms-full.txt / per-page markdown export
4. Image pipeline 深化：
   - 先补 ImageZoom foundation UI
   - 再接 CDN adapter / provider config
5. Multi source baseline：
   - docs / blog / changelog / api 的 loader、route、metadata、nav contract
   - 先建立内容源和 route 规则，再做具体 changelog/open issues 页面体验
6. 站点产品组合层：
   - blog/changelog/API 页面体验
   - story / playground runtime
   - AI / MCP / docs assistant
   - versioning / i18n

### Theme runtime / preset planning

本轮对照 Fumadocs theme 实现和当前项目状态，确认主题化不能只停留在 token 层。

Fumadocs 证据：

- `packages/base-ui/src/provider/base.tsx`：
  - `RootProvider` 内置 `next-themes`。
  - 默认 `attribute="class"`、`defaultTheme="system"`、`enableSystem`。
  - dark mode source of truth 是 root `.dark` class。
- `packages/base-ui/src/layouts/shared/slots/theme-switch.tsx`：
  - `ThemeSwitch` 使用 `useTheme()`。
  - 支持 `light-dark` 和 `light-dark-system`。
  - UI 是 icon button，不是文字按钮。
- `packages/base-ui/css/*.css`：
  - `neutral / black / purple / ocean / ruby ...` 等 theme preset 覆盖
    `--color-fd-*`。
  - `.dark` 下有独立 token 覆盖。
- `apps/docs/content/docs/ui/theme.mdx`：
  - Fumadocs 官方文档把 light/dark 和 colors 分开讲。
  - 自定义主题色也是覆盖 CSS/Theme variables。

当前项目状态：

- `app/assets/css/tokens.css` 已有 `:root` light token 和 `.dark` dark token。
- `--docs-*` 已桥接到 `--color-fd-*`。
- `app/assets/css/tailwind.css` 已通过 Tailwind v4 `@theme` 暴露 token。
- `DocsHeader / DocsLayoutShell / DocsSidebar` 已有 `theme-switch` slot。
- `DocsSidebar` 当前主题按钮只是静态占位，没有状态、持久化和切换行为。
- `docsSiteConfig` 没有 theme 配置。
- 缺少 first-paint inline script，因此即使补 client state，也可能出现 light/dark
  首屏闪烁。

边界判断：

- Theme runtime 属于 Foundation Substrate P1：
  - `light / dark / system`
  - `.dark` class
  - `useDocsTheme()`
  - `DocsThemeSwitch`
  - first-paint script
  - token/preset contract
- Theme config / preset adapter 属于 Integration / Plugin Layer：
  - `docsSiteConfig.theme`
  - defaultMode / switchMode / storageKey / preset
  - config -> provider/switch/preset props
- Theme gallery、品牌主题展示、在线颜色编辑器属于 Site Product Composition，后置。

已更新规划：

- `design/roadmap.md` 新增 `Stage 7.9：Theme Runtime / Preset Gate`。
- `design/roadmap.md` 保持扁平，只保留 Stage 7.9 的目标、产物和链接。
- `design/foundation-roadmap.md` 新增摘要型 `Theme Runtime / Preset Contract` 和
  `Phase 5.5：Theme Runtime / Preset Gate`。
- `design/theme-runtime-parity-plan.md` 承接详细 contract、实现步骤和 profile 设计。
- `design/product-roadmap.md` 新增 `Phase 1.5：Theme Config / Preset Adapter`。

文档治理规则：

- Theme Runtime 这类会展开大量实现细节的 gate，不直接塞进 roadmap。
- roadmap 只保留路线、阶段顺序、产物和锚点链接。
- foundation-roadmap 只保留 foundation 摘要和验收入口。

后续实现顺序：

1. `DocsThemeConfig` 类型和默认值。
2. `useDocsTheme()` composable。
3. theme client plugin。
4. first-paint inline script。
5. `DocsThemeSwitch.vue`。
6. 替换 sidebar 静态主题占位。
7. `themes.css` preset 覆盖。
8. site config theme adapter。
9. `theme` parity profile。

验证重点：

- root `.dark` 和 `data-docs-theme` 正确。
- localStorage 持久化正确。
- system mode 跟随 `prefers-color-scheme`。
- header/sidebar switch 状态一致。
- dark reload 无首屏错色。
- Shiki dark token 生效。
- theme preset 只通过 CSS variables 改色。

### Stage 7.9 Theme runtime implementation

本轮开始按 Stage 7.9 实现 Theme Runtime / Preset Gate：

- 新增 `app/types/docs-theme.ts`，把 `light / dark / system`、resolved mode、
  switch mode、preset 和默认值作为 foundation contract。
- 新增 `app/utils/docs-theme.ts`，集中处理 localStorage、安全读取、system
  preference、root `.dark`、`data-docs-theme`、`data-docs-theme-mode` 和
  `data-docs-theme-resolved`。
- 新增 `app/composables/useDocsTheme.ts`，组件只消费共享状态和显式 action，
  不直接读写 DOM 或 site config。
- 新增 `app/plugins/docs-theme.client.ts`，在 client 侧读取
  `docsSiteConfig.theme` 并初始化 runtime。
- `app/app.vue` 注入 first-paint inline script，hydration 前先设置 `.dark`、
  `data-docs-theme` 和 `color-scheme`。
- 新增 `DocsThemeSwitch.vue`，支持 `light-dark` 与
  `light-dark-system`，使用 icon button、`aria-label`、`aria-pressed` 和
  `data-active`。
- `DocsHeader`、`DocsSidebar`、`DocsMobileNav` 和 `DocsLayoutShell` 保留
  `theme-switch` slot replacement，同时在无替换时渲染默认 switch。
- 新增 `app/assets/css/themes.css`，preset 只覆盖 `--docs-*` 语义变量，
  `--color-fd-*` 继续通过 tokens bridge 派生。
- 新增 `theme` profile，并纳入 `docs-shell` 与 `full-regression`。

流程经验：

- Theme parity 不能从按钮开始做，应先补 runtime source of truth；否则
  Header、Sidebar、Mobile 三个入口会出现状态漂移。
- first-paint 与 client plugin 要共享同一份 config 和解析规则；首屏脚本只做
  root DOM 同步，不承载 Vue state。
- slot fallback 要在提供 slot 的上游同时处理。若上游传了空 slot，下游
  `<slot>` fallback 不会生效。
- profile 应聚焦 theme state、slot wiring、a11y 和 token smoke，不要把
  主题验证塞回旧的大型 parity probe。

### Parity validation performance rule

本轮对 Stage 7.9 后的验证流程做了实测，确认“先增量、再影响面、最后全量”
的收益足够客观，可以作为后续默认验证策略。

实测数据：

- `theme` focused profile：
  - 命令：`node scripts/parity/run.mjs --profile=theme --url=http://127.0.0.1:8888/guide/code-block --viewports=1440x1000,994x935,390x844 --chromePort=9361 --dump`
  - 结果：`29/29` 通过。
  - 耗时：约 `8.7s`。
- `docs-shell` impact suite：
  - 命令：`node scripts/parity/run.mjs --suite=docs-shell --url=http://127.0.0.1:8888/guide/component-detail --viewports=1440x1000,994x935,390x844 --chromePort=9362 --retries=1 --dump`
  - 结果：`theme / toc / toc-responsive / sidebar` 全部通过。
  - 耗时：约 `43.0s`。
- `full-regression` 默认等待：
  - 命令：`node scripts/parity/run.mjs --suite=full-regression --viewports=1440x1000,994x935,390x844 --chromePort=9363 --retries=1 --dump`
  - 结果：`19` 个 profile 全部通过。
  - 耗时：约 `129.7s`。

规则：

- 日常实现阶段先跑改动面对应 focused profile。
- 再跑对应 impact suite：
  - shell/layout/theme/sidebar/TOC 改动：`docs-shell`
  - 正文基础组件改动：`content-components`
  - page actions 改动：`page-actions`
  - feedback/pager 改动：`page-tail`
- 需要跨层烟测时跑 `fast-regression`，它覆盖 `theme / prose-defaults /
code-block / toc-responsive / sidebar / page-actions`。
- `full-regression` 只用于阶段收口、跨层大改、提交前总检。
- 不要给 `full-regression` 传全局高 `--settleMs=3200`。`toc` 和
  `toc-responsive` profile 已经在 profile 内部设置了必要的最低等待；全局高
  `settleMs` 会把所有 profile 的每个 viewport 都强制拉长。
- typecheck 后如果 dev server health 变成 404，先 `pnpm dev:restart` 再跑
  parity profile；不要把 Nuxt Content dev DB 中间态误判成 UI 回归。

### Stage 7.10 Root provider / layout variants implementation

本轮开始按 Stage 7.10 推进 Root Provider / Layout Variants Gate：

- `DocsRootProvider` 作为 Nuxt/Vue 等价 root provider boundary，负责提供
  `dir`、search enabled、language enabled 等 root context，并在 `<html>` 上
  暴露可采集的 provider attributes。
- Theme runtime 继续由 Stage 7.9 的 `useDocsTheme()`、client plugin 和
  first-paint script 负责，Root Provider 只做 provider boundary，不重复写主题
  source of truth。
- `useDocsLayoutSlots()` 作为 `baseSlots()` 的 Vue 等价集中点，负责判断
  search/theme/language slot replacement 和默认 ThemeSwitch。
- `useDocsSidebarState()` 作为 sidebar provider/state contract，集中管理
  desktop collapsed、hover preview、mobile drawer open、tabs dropdown open 和
  close-on-navigation。
- `DocsLayoutShell` 开始提供 sidebar state，`DocsSidebar` 和 `DocsMobileNav`
  消费同一份 provider state。
- `DocsHomeLayout` 把首页从 ad hoc page composition 收到 shared layout surface；
  `DocsNotFound` 和 `app/error.vue` 补 basic not-found shell。
- 新增 `layout-provider` suite，包含 `root-provider`、`layout-slots`、
  `sidebar-state`、`layout-tabs`、`home-layout`、`not-found`。

决策：

- Banner 本轮保留为 foundation layout slot 和高度 token，不实现 dismiss/storage。
- Notebook / Flux 本轮只做 deferred variant decision，不实现全量 variant。

流程经验：

- Vue layout 的 pass-through slot 会让下游误以为 replacement slot 存在。默认
  slot 决策要放在最接近真实调用方 slot 的地方，并复用同一份 helper。
- Sidebar 旧 profile 适合保护视觉和几何；provider ownership 应拆成
  `sidebar-state` profile，避免旧 profile 继续无限增长。

### Stage 7.10 validation closeout

本轮完成 Stage 7.10 第一轮实现和回归收口：

- `pnpm typecheck` 通过。
- `git diff --check` 通过。
- `pnpm dev:restart` 后 health OK。
- `layout-provider` focused suite：
  - 命令：`node scripts\parity\run.mjs --suite=layout-provider --viewports=1440x1000,994x935,390x844 --chromePort=9371 --retries=1 --dump`
  - 结果：`root-provider / layout-slots / sidebar-state / layout-tabs / home-layout / not-found` 全部通过，`72/72` checks passed。
- `docs-shell` impact suite：
  - 命令：`node scripts\parity\run.mjs --suite=docs-shell --url=http://127.0.0.1:8888/guide/component-detail --viewports=1440x1000,994x935,390x844 --chromePort=9372 --retries=1 --dump`
  - 结果：`theme / toc / toc-responsive / sidebar` 全部通过，`118/118` checks passed。
- `fast-regression`：
  - 命令：`node scripts\parity\run.mjs --suite=fast-regression --viewports=1440x1000,994x935,390x844 --chromePort=9373 --retries=1 --dump`
  - 结果：`theme / prose-defaults / code-block / toc-responsive / sidebar / page-actions` 全部通过，`201/201` checks passed。
- `pnpm validate:links` 通过：`25` pages，`11` links。

修正项：

- `DocsSidebar` 的 optional Boolean `collapsed` 必须默认 `undefined`，否则 Vue
  Boolean casting 会把 provider 的 collapsed state 覆盖成 `false`。
- `sidebar-state` profile 的 Escape 事件应派发到 `document`，因为组件监听源是
  `document.addEventListener('keydown')`。
- profile 点击移动端 trigger 前必须判断真实可见性，不能只看 `display`；父级
  `display: none` 时，子节点的 computed display 仍可能不是 `none`。
- parity HTTP preflight 统一加 `Accept: text/html`。否则 Nuxt dev 在 expected
  404 route 上会返回 JSON error payload，导致 SSR selector 和 html size 假失败。
- home layout profile 不再使用“至少 4 个卡片”这类内容数量阈值，改为检查
  shared options、正文 composable root 和当前 fixture 的稳定入口数量。

流程经验：

- provider 类改造要同时检查 layout root attribute 和具体 consumer attribute；
  只检查其中一个会漏掉 source-of-truth 分裂。
- profile 的失败先分类：实现缺陷、fixture 假设、工具请求语义。不要把工具层
  的 `Accept`/selector 问题误修成组件逻辑。
- 内容数量不是契约。契约卡应采集 DOM ownership、state、slot/default 行为、
  SSR selector、ARIA 和 responsive visibility。

### Playwright verification POC

本轮按验证方案优化计划实现 Playwright POC，目标是验证能否用 Playwright 替换
自研 CDP runner 的本地执行层。

实现：

- 新增 `@playwright/test`，安装时使用 `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`，
  复用本机 Chrome。
- 新增 `playwright.config.ts`：
  - `baseURL=http://127.0.0.1:8888`
  - projects 对齐当前 parity 视口：`1440x1000`、`994x935`、`390x844`
  - `channel: chrome`
  - failure 时保留 trace / screenshot / video
- 新增 `tests/e2e/layout-provider.spec.ts`。
- 新增 `tests/e2e/helpers/docs-page.ts` 和
  `tests/e2e/helpers/assertions.ts`。
- 新增 `pnpm test:e2e` 和 `pnpm test:e2e:layout`。

验证结果：

- `pnpm test:e2e:layout`：
  - `17 passed`
  - `1 skipped`
  - `20.1s`
- legacy 对照：
  - `node scripts\parity\run.mjs --suite=layout-provider --viewports=1440x1000,994x935,390x844 --chromePort=9381 --retries=1 --dump`
  - `72/72` checks passed
  - `31.6s`
- `pnpm typecheck` 通过。
- `git diff --check` 通过。

代码量对比：

- legacy `layout-provider` 六个 profile 合计 `384` 行。
- Playwright spec + helpers 合计 `183` 行，减少 `52.3%`。
- 如果把一次性 `playwright.config.ts` 计入，合计 `244` 行，减少 `36.5%`。

POC 暴露并修复的问题：

- Playwright actionability 发现移动端 `Browse docs` 按钮可见但被
  `.docs-shell-content` 拦截。旧 parity 用程序化 `element.click()`，因此没有发现
  真实用户点击失败。
- 修复方式：移动端 `.docs-shell-body` 明确设置
  `grid-template-areas: 'mobile-nav' 'main'`，并为 `.docs-mobile-nav` 与
  `.docs-shell-content` 指定对应 `grid-area`。

流程结论：

- Playwright 适合替换本地执行层：页面加载、locator、交互、可见性、ARIA、
  trace 和响应式 project。
- parity 契约卡仍然保留，负责定义“要验证什么”。
- legacy runner 继续保留，用于远程/reference 采集、隐藏 DOM 检查和未迁移
  profile。
- 对可见交互，Playwright 比 `element.click()` 更接近真实用户行为，应优先作为
  日常回归入口。

### Playwright fast-regression migration

本轮开始把 Playwright 从 POC 推进到日常迁移主流程：

- 新增 Playwright 分层入口：
  - `pnpm test:e2e:shell`
  - `pnpm test:e2e:content`
  - `pnpm test:e2e:page`
  - `pnpm test:e2e:fast`
- 新增 helper 分层：
  - `tests/e2e/helpers/interaction.ts` 负责可见元素选择和真实点击。
  - `tests/e2e/helpers/layout.ts` 负责 shell/column/overlap 类断言。
  - `tests/e2e/helpers/assertions.ts` 补通用 CSS、box 和 overflow 断言。
- 将旧 `fast-regression` 的本地验证意图拆成独立 spec：
  - `theme`
  - `prose-defaults`
  - `code-block`
  - `toc-responsive`
  - `sidebar`
  - `page-actions`

流程规则更新：

- Playwright spec 按 surface 拆分，命令按 suite 组合；不要把新增契约塞回单个
  大型 probe。
- legacy parity runner 暂不删除，角色改为 reference/probe 和未迁移 profile 的
  primary check。
- 对可见 UI 交互，优先使用 Playwright locator/click/keyboard 断言；只有隐藏 DOM
  或 reference 采集继续使用 legacy runner。

### Playwright full-regression migration

本轮继续完成旧 `full-regression` 的 Playwright 本地验证迁移：

- 新增 `tests/e2e/content-components.spec.ts`：
  - cards
  - steps
  - heading
  - preview / install-card
  - callout
  - tabs / code-tabs
  - accordion
  - files
  - inline-toc
  - type-table
- 新增 `tests/e2e/toc.spec.ts`，覆盖桌面 TOC rail、响应式 popover shell 和
  桌面 bottom current 状态。
- 新增脚本：
  - `pnpm test:e2e:components`
  - `pnpm test:e2e:toc`
  - `pnpm test:e2e:full`
- `pnpm test:e2e:content` 现在包含 prose、code-block 和 content components。
- `pnpm test:e2e:shell` 现在包含 layout provider、theme、toc、toc-responsive
  和 sidebar。

验证结果：

- `pnpm test:e2e:fast`：`38 passed`、`7 skipped`、`37.8s`。
- `pnpm test:e2e:layout`：`17 passed`、`1 skipped`、`34.8s`。
- `pnpm test:e2e:components`：`30 passed`、`31.3s`。
- `pnpm test:e2e:toc`：`10 passed`、`5 skipped`、`17.1s`。
- `pnpm test:e2e:shell`：`40 passed`、`8 skipped`、`47.3s`。
- `pnpm test:e2e:page`：`6 passed`、`28.6s`。
- `pnpm test:e2e:full`：`89 passed`、`10 skipped`、`1.9m`。
- legacy `fast-regression`：`201/201` checks passed。
- legacy `full-regression`：`19` 个 profile 全部 PASS。

本轮发现并固化的流程规则：

- Playwright `workers` 本地固定为 `4`、CI 固定为 `2`，避免 Nuxt dev server 在
  高并发 hydration 下出现偶发页面半加载。
- 不要把 Playwright runtime checks 和 `pnpm typecheck` 并行跑。`nuxi typecheck`
  会触碰 `.nuxt` / content 状态，可能让正在运行的 dev server 回到 404。
- 如果 typecheck 后 `pnpm dev:health` 返回 404，先 `pnpm dev:restart` 再跑
  Playwright 或 legacy parity。
- 旧 runner 的程序化 click 可能点到真实用户点不到的隐藏/遮挡元素。Sidebar
  floating pin 的 Playwright 迁移已改成真实用户流程：先 hover 展开预览并确认
  floating 隐藏，再移出预览让 floating 重新出现，最后点击 pin。
- 后续已补齐移动端 layout tabs：`DocsLayoutShell -> DocsMobileNav ->
DocsSidebar` 现在会传递同一份 `nav.tabs` contract，Playwright 可以直接验证
  visible mobile drawer，不再依赖旧 runner 检查隐藏桌面 DOM。

### Playwright migration closeout

本轮完成 Playwright 本地验证迁移收口：

- `DocsMobileNav` 已接收并转发 `nav`，移动端 drawer 内的 `DocsSidebar` 现在和桌面
  sidebar 消费同一份 layout tabs contract。
- `layout-provider` 和 `sidebar` Playwright specs 已移除移动端 tabs skip，改为验证
  visible mobile drawer 的真实交互。
- `DocCalloutTitle` 从 `<p>` 改为 block wrapper，避免 MDC slot 内容被 paragraph
  包裹后形成不稳定的嵌套段落；对应 Playwright spec 也改为按可见文本定位
  `Container API` callout，而不是依赖固定数组下标。
- 最终 Playwright entrypoints 验证：
  - `pnpm test:e2e:layout`：`18 passed`。
  - `pnpm test:e2e:shell`：`46 passed`、`8 skipped`。
  - `pnpm test:e2e:components`：`30 passed`。
  - `pnpm test:e2e:full`：`91 passed`、`8 skipped`。
  - `pnpm test:e2e:fast`：`39 passed`、`6 skipped`。
  - `pnpm test:e2e:content`：`39 passed`。
  - `pnpm test:e2e:toc`：`10 passed`、`5 skipped`。
  - `pnpm test:e2e:page`：`6 passed`。
- legacy `layout-provider` probe 仍通过：`72/72` checks passed。旧 runner 继续作为
  reference/probe 层保留，不再作为日常本地回归主入口。
- 静态收口：
  - `pnpm typecheck` 通过。
  - `pnpm validate:links` 通过：`25` pages，`11` links。
  - `git diff --check` 通过。

流程经验：

- Playwright 迁移不只是“少写 probe”，还会暴露旧 CDP runner 看不到的真实 DOM 和
  actionability 问题。
- 对 MDC 渲染出来的内容组件，契约卡和 spec 都应优先按可见文本、ARIA 和稳定 class
  取目标，避免用“第几个节点”表达语义。
- `pnpm typecheck` 后 dev server 仍可能回到 404；运行任何后续 runtime check 前要先
  `pnpm dev:health`，失败则 `pnpm dev:restart`。

### Playwright route and worker tuning

本轮继续优化 Playwright 验证耗时和高并发稳定性，结论是：默认 worker 不放宽，
但允许显式压测。

实现调整：

- 新增 `app/plugins/docs-ready.client.ts`，把测试侧 ready 信号从“Vue root 已存在”
  提升到 Nuxt hydration / page suspense 生命周期。
- `waitForNuxtHydration()` 删除固定 `500ms` 等待，改为等待
  `data-docs-hydrated="true"`。
- ready marker 最终采用 `app:suspense:resolve` + `page:start/page:finish` +
  version guard + 两帧 `requestAnimationFrame`。
- 曾短暂验证 `requestIdleCallback`，但 full regression 明显变慢，因此未保留。
- viewport-only skip 已前移到导航前，避免已知会 skip 的 viewport 仍加载页面。
- `content-components` 删除 file-level `beforeEach` 导航，改成每个测试在本地 setup
  后显式调用一次 fixture helper。
- `playwright.config.ts` 支持 `PLAYWRIGHT_WORKERS` 显式覆盖，默认仍是本地 `4`、CI
  `2`。

实测结论：

- 在最终 ready marker 前，`pnpm test:e2e:components -- --workers=6` 曾出现
  mobile TypeTable 首次点击未展开：`29 passed / 1 failed`。
- 最终 ready marker 后：
  - `pnpm test:e2e:components -- --workers=6`：`30 passed`，`34.8s`。
  - `pnpm test:e2e:components -- --workers=10`：`30 passed`，`38.1s`。
  - `pnpm test:e2e:full -- --workers=6`：`91 passed / 8 skipped`，`1.5m`。
  - `pnpm test:e2e:full -- --workers=10`：`91 passed / 8 skipped`，`2.5m`。
  - 热身后的默认 `pnpm test:e2e:full`：`91 passed / 8 skipped`，`1.3m`。

规则更新：

- 不能用“机器能同时跑 10 workers”直接推导默认并发；Nuxt dev、Chrome 页面数和内容
  hydration 会互相争资源。
- 默认保持 `4`，因为本轮 full warm run 最快且稳定。
- `6 / 10` 只作为显式压力验证使用；其中 `10` 虽然已稳定通过，但不带来速度收益。
- 路由复用不作为当前优化方向。Playwright 每个 test 独立页面能保护状态隔离；后续提速
  优先靠 focused command、warm dev server、影响面分层和必要时的 preview/build
  server 验证。

### Mobile sidebar and TOC ownership

本轮对比 Fumadocs 移动端源码后确认：移动端存在两套独立入口，不能合并成一个
“移动目录条”。

- 左侧 docs sidebar 的触发器属于 header。Fumadocs 在
  `layouts/docs/slots/header.tsx` 中通过 `slots.sidebar.trigger` 渲染
  `SidebarIcon`，点击后驱动 sidebar provider 的 drawer open state。
- `#nd-sidebar-mobile` 是左侧 sidebar 的移动抽屉边界。Fumadocs 在
  `components/sidebar/base.tsx` 中固定使用这个 id 和 `data-state="open|closed"`，
  在 `layouts/docs/slots/sidebar.tsx` 中将 drawer 固定到右侧，宽度为 `85%` 且
  `max-width: 380px`。
- 正文顶部的移动端横条属于 page TOC popover。Fumadocs 在
  `layouts/docs/page/slots/toc.tsx` 中把它放在 `grid-area: toc-popover`，它只负责
  当前页面右侧目录/大纲的展开收起，不应该打开左侧 sidebar。

流程规则更新：

- 移动端响应式 parity 采集时必须先标注控件 ownership：`header sidebar trigger`
  和 `page toc popover trigger` 分别建 contract，不再用截图中的“顶部目录条”笼统命名。
- DOM 契约卡必须包含触发器所在组件、目标 panel id、`aria-controls`、`data-state`
  和关闭后的 focus return target。
- CSS 中不保留无 DOM 消费的旧 trigger 选择器，避免后续实现继续沿用错误契约。

### Reka UI primitive layer POC

本轮完成 Reka UI POC，先选择 `UiPopover` 而不是直接大面积迁移。原因是 page actions 的
`Open` 菜单能同时覆盖 trigger、portal、floating positioning、outside dismiss、
Escape close、focus return 和 viewport collision，是最容易验证收益的基础交互面。

实现结论：

- 新增依赖 `reka-ui@2.10.1`。
- `UiPopover` 继续保留原有外部 API：`open/defaultOpen/contentId/align/sideOffset`、
  `update:open`、默认 slot `{ open, close, toggle }`。
- `UiPopoverTrigger`、`UiPopoverContent`、`UiPopoverClose` 继续保留原组件名、class
  透传和 slot contract，内部改用 Reka `PopoverRoot / Trigger / Portal / Content /
Close`。
- 原先手写的 window `keydown`、`pointerdown`、resize/scroll 监听和弹层定位逻辑已从
  `UiPopover` / `UiPopoverContent` 移除，底层行为交给 Reka + Floating UI。

验证结论：

- `pnpm typecheck` 通过。
- `pnpm dev:restart` 后 dev server 健康检查通过。
- `pnpm test:e2e -- tests/e2e/page-actions.spec.ts` 通过：`6 passed`。
- `pnpm test:e2e -- tests/e2e/theme.spec.ts` 通过：`9 passed`。
- `pnpm test:e2e:fast` 通过：`40 passed`、`11 skipped`。

POC 过程中额外暴露的问题：

- 移动端 theme 控件已收敛到 mobile drawer，旧测试仍直接点击 header/全局可见按钮，
  导致窄屏下找不到 `.docs-theme-button[data-theme-mode="dark"]`。已把 theme
  runtime 测试调整为窄屏先打开 mobile nav，再点击真实可见控件。

后续建议：

- POC 结果正向。下一批可以继续按同样模式迁移 `UiDialog`、`UiTabs`、`UiCollapsible`，
  但每次只迁一个 primitive，并保持 `Ui*` 外部 contract 不变。
- 每迁一个 primitive 都要补一条 focused Playwright 行为验证，避免只通过类型检查却漏掉
  focus、dismiss、portal 或键盘行为。

### Reka UI migration governance

本轮将 Reka UI 迁移从“临时 POC 结论”提升为独立执行计划：

- 新增 `design/reka-primitive-migration-plan.md` 作为 Reka primitive migration
  source of truth。
- Reka 只接管交互 primitive：focus trap、Escape、outside dismiss、positioning、
  drawer modality、dropdown roving focus、tabs/accordion/collapsible keyboard。
- 本项目继续拥有 `DocsNode[]`、route path、active path、sidebar tree mapping、
  docs content contract、tokens 和 CSS。
- 后续迁移必须先改本地 `Ui*` wrapper，再让 docs/content/layout 消费者保持原 API
  继续工作。
- `UiPopover` 是参考 POC；下一批优先顺序是 `UiDialog`、mobile sidebar drawer、
  sidebar tabs dropdown、folder disclosure、`UiAccordion`、`UiTabs`。

Sidebar 决策：

- 不把整个 sidebar 直接替换成 Reka NavigationMenu；NavigationMenu 更适合站点导航
  和子菜单，不适合完整 docs page-tree。
- 不立即把整个 sidebar 替换成 Reka Tree；Tree 当前是 Alpha，并且会牵动
  `DocsNode[]` 到 selected/expanded/tree item 的完整映射。
- 先替换移动端 drawer、layout tabs dropdown 和 folder disclosure 交互层。
- 只有在这些交互层替换后，层级切换、键盘导航或 active ancestry 仍不达标时，
  才进入隔离的 Reka Tree POC。

### Reka UI primitive migration batch 1

本轮按 `design/reka-primitive-migration-plan.md` 推进第一批 primitive 替换：

- `UiDialog*` 改用 Reka `DialogRoot / Portal / Overlay / Content / Close`。
  本地继续保留 `open/defaultOpen/contentId/titleId/closeOnEscape/trapFocus` 和
  slot contract；新增 `unmountOnHide` 供 mobile drawer 保留关闭态 DOM。
- `DocsMobileNav` 改为 Dialog-backed drawer。Reka 负责 modal、Escape、outside
  dismiss 和 body scroll lock；由于它不是通过 Reka `DialogTrigger` 打开，仍保留一小段
  本地 focus return，把关闭后的焦点还给 `#docs-header-sidebar-trigger`。
- 新增 `UiDropdownMenu*` wrapper。Sidebar layout tabs 采用本地 wrapper trigger +
  Reka Root/Content/Item 的组合；trigger 主动注册到 Reka root 的 `triggerElement`，
  content/item 负责 menu role、Escape、outside dismiss 和 menuitem 行为。
- `UiCollapsible*` 改用 Reka `CollapsibleRoot / Trigger / Content`，保留
  `hidden="until-found"`、`data-state` 和 slot props。
- `UiAccordion*` 改用 Reka `AccordionRoot / Item / Trigger / Content`，保留
  standalone fallback、`hidden="until-found"`、`beforematch` fallback 和 expose
  方法。
- `UiTabs*` 改用 Reka `TabsRoot / List / Trigger / Content`，保留 `groupId`、
  `persist`、`updateAnchor`、inactive panel 常驻 DOM 和 `[hidden]` contract。

实现过程中沉淀的规则：

- Dialog / Popper 一旦 portal 到 body，原先依赖父选择器的移动端 CSS 必须补 panel
  作用域。例如 `.docs-mobile-nav .docs-sidebar` 需要同步覆盖
  `.docs-mobile-nav-panel .docs-sidebar`。
- Reka Popper 即使 `portal=false` 也会插入 `[data-reka-popper-content-wrapper]`。
  对 sidebar tabs 这类已有 absolute 定位的 surface，要把定位落在 wrapper 上，
  panel 自身恢复为静态填满，避免被 Popper wrapper 压成 0 宽。
- 不能在 dev server 正运行时把 `pnpm typecheck` 和 Playwright 连着跑。`typecheck`
  会动 `.nuxt`，可能让 Nuxt Content dev DB 丢表。新的顺序是：
  `pnpm typecheck` -> `pnpm dev:restart` -> Playwright。
- Reka primitive 迁移优先保持本地 `Ui*` API 和 DOM/CSS contract，不为了“纯 Reka”
  牺牲已验证的 docs shell 行为。

验证结论：

- `pnpm typecheck` 通过。
- `pnpm dev:restart` 健康检查通过。
- `pnpm test:e2e -- tests/e2e/sidebar.spec.ts tests/e2e/content-components.spec.ts tests/e2e/page-actions.spec.ts tests/e2e/theme.spec.ts`
  通过：`55 passed / 8 skipped`。
- `pnpm test:e2e:fast` 通过：`40 passed / 11 skipped`。
- `pnpm test:e2e:full` 通过：`92 passed / 13 skipped`。
- `git diff --check` 通过。

### Reka sidebar folder disclosure closeout

本轮继续补齐 `design/reka-primitive-migration-plan.md` 中的 S3 / Phase 6 尾项：

- `DocsSidebarItem` 的 folder disclosure 改为消费本地 `UiCollapsible`，由 Reka
  `CollapsibleRoot / Trigger / Content` 承接 open state、trigger 与 content 关联。
- `UiCollapsible` 新增 `contentId` 透传能力，并把 `class/data-*` 等外部契约属性落到
  实际 collapsible DOM，方便 sidebar 等场景保留稳定 id 和 selector。
- 有 index page 的 folder 拆成标题 `DocsLink` 与独立 chevron trigger；标题点击只导航并
  触发 `navigate`，chevron 点击只折叠/展开，不再混用同一 click path。
- 无 index page 的 folder 继续使用整行 trigger；`collapsible: false` 的 folder 保持常开。
- `Protocol Playground` 目录被纳入可见 sidebar fixture，用真实内容覆盖 folder 协议，避免
  Playwright folder case 因“当前页面没有 folder”继续 skip。
- `useDocsOverlay` 已无运行时消费者，正式删除。移动端 drawer 的 overlay、Escape、outside
  dismiss、scroll lock 与 focus trap 现在由 Reka Dialog-backed drawer 承担。
- 修复 `pagesIndex + slug` 场景下的目录 meta 命中：group 节点在 `meta.pages` 匹配与
  `reorderNodesByMeta()` 中都应优先按目录 `dirname` 找 `meta.json`，再退回 index page
  stem。否则目录会被 index page 的 source stem 偷换标题、默认展开、`pagesIndex` 和排除规则。

流程规则更新：

- folder 类交互不能只检查 DOM 是否存在，必须拆开验证“纯 disclosure 不导航”和“link
  navigation 才关闭 mobile drawer”。
- fixture 缺失时优先复用现有真实内容目录补足覆盖，不再接受关键契约长期
  `test.skip(folderCount === 0)`。
- 对照 Fumadocs 源码时借语义和 ownership，不强行复刻 React 里的 link 内 chevron click
  handler；本项目按计划卡采用更清晰的 link / trigger 分离契约。
- 对目录 fixture 不能只验证最终页面 200；还要验证该目录是否作为可见 sidebar folder
  承接自己的 `meta.json`，尤其是 `pagesIndex`、`slug`、`!item` 和 rest 排序同时存在时。

验证结论：

- `pnpm typecheck` 通过。
- `pnpm dev:restart` 健康检查通过。
- `pnpm test:e2e -- tests/e2e/sidebar.spec.ts` 通过：`13 passed / 8 skipped`。
- `pnpm test:e2e -- tests/e2e/content-components.spec.ts tests/e2e/page-actions.spec.ts tests/e2e/theme.spec.ts`
  首轮 `44 passed / 1 failed`，失败为 tablet 单测在 `page.goto` 阶段
  `net::ERR_ABORTED`；重跑失败用例通过：`3 passed`。
- `pnpm test:e2e:fast` 通过：`43 passed / 11 skipped`。
- `pnpm test:e2e:full` 通过：`95 passed / 13 skipped`。
- `pnpm validate:links` 通过：`25 pages / 11 links`。
- `git diff --check` 通过。

### Reka TOC popover and ScrollArea closeout

本轮继续补齐 `design/reka-primitive-migration-plan.md` 的 Phase 6：

- `DocsTocPopover` 对照 Fumadocs docs page TOC 源码后确认：顶部 TOC 条不是
  floating popover，而是 sticky row 内的 in-flow `Collapsible`。
- 因此本地不把它强行迁到 `UiPopover`。Reka Popper 即使 `portal=false` 也会插入
  floating wrapper，容易破坏当前已验证的 `position: static` 和正文上方展开节奏。
- `DocsTocPopover` 已改为消费 `UiCollapsible / UiCollapsibleTrigger /
UiCollapsibleContent`，保留原 `docs-toc-popover*` 类名、`docs-toc-popover-panel`
  id、`v-show` display contract，以及点击 TOC item 后关闭。
- `UiCollapsible` 新增 opt-in dismiss contract：`closeOnEscape` 和
  `closeOnOutside`。监听只在对应 prop 开启时注册，避免 sidebar/tree 内每个
  collapsible 都挂 window listener。
- `UiScrollArea / UiScrollViewport / UiScrollBar / UiScrollThumb` 已改用 Reka
  `ScrollAreaRoot / Viewport / Scrollbar / Thumb`，继续保留本地 wrapper、类名和
  tokenized visuals。
- `ui.css` 的 scroll area 样式补齐 Reka custom scrollbar 需要的 `overflow:
hidden`、viewport height、`touch-action: none`、显示态 pointer events 和 thumb
  flex contract。
- 新增 `layout-provider.spec.ts` 的 search dialog 回归：打开搜索、输入 query、
  验证 `.ui-scroll-viewport` 可见、有高度、结果可键盘选择并可 Escape 关闭。

流程规则更新：

- Fumadocs 名称里带 popover 的 surface 不一定应迁到 Popover primitive；先看源码
  ownership 和布局模型，TOC 顶栏这类 in-flow 展开面优先使用 Collapsible。
- Reka wrapper 迁移不能只看交互能力，也要检查生成 DOM wrapper 是否会改变
  positioning / grid / sticky contract。
- shared primitive 的可选增强必须按需注册副作用，尤其是 sidebar item 这类会大量
  实例化的组件。

验证结论：

- 首次在 dev server 仍运行时执行 `pnpm typecheck` 超时；执行 `pnpm dev:stop`
  后重跑通过。后续复验流程应更明确为：停止 dev server 或确认无运行态干扰 ->
  `pnpm typecheck` -> `pnpm dev:restart` / `pnpm dev:health` -> Playwright。
- `pnpm typecheck` 通过。
- `pnpm dev:restart` 首次健康检查早于 Nuxt 完全启动而失败；随后
  `pnpm dev:health` 通过。
- `pnpm test:e2e:toc` 通过：`10 passed / 5 skipped`。
- `pnpm test:e2e:layout` 通过：`21 passed`。
- `pnpm test:e2e -- tests/e2e/sidebar.spec.ts tests/e2e/content-components.spec.ts`
  通过：`43 passed / 8 skipped`。
- `pnpm test:e2e:fast` 通过：`43 passed / 11 skipped`。
- `pnpm test:e2e:full` 通过：`98 passed / 13 skipped`。
- `pnpm validate:links` 通过：`25 pages / 11 links`。
- `git diff --check` 通过。

### ImageZoom and markdown transform closeout

本轮按 roadmap 的下一步顺序收口 Foundation Gate、ImageZoom 和 Markdown
transform pipeline 第一版：

- `design/reka-primitive-migration-plan.md` 已把 Reka wrapper 当前批次从
  “Migrate Next” 收口为 “Already Migrated”，避免后续继续误读旧状态。
- `DocImageZoom` 成为 foundation content component。它保留 `figure/img/figcaption`
  的 Markdown 图片合同，同时用 Dialog-backed overlay 承接 zoom open/close、Escape、
  close button、focus return 和 viewport-bounded image sizing。
- `ProseImg` 默认接入 `DocImageZoom`，让普通 Markdown 图片也具备可检查能力；已有
  `.fd-doc-image`、caption、lazy loading 和 decoding contract 保持不变。
- Markdown transform pipeline 第一版落在 `app/utils/docs-markdown-pipeline.ts`，
  并通过 `nuxt.config.ts` 的 `content.build.markdown.rehypePlugins` 接入。这里必须同时
  提供 `instance` 和 `src`：`instance` 供 `@nuxt/content` parser 运行，`src` 供
  `@nuxtjs/mdc` 生成的 `#mdc-imports` 解析；`mdc.config.ts` 保持 Shiki transformer
  fallback，不再作为本项目 Nuxt 4 `srcDir` 结构下的 Markdown pipeline 入口：
  - heading 支持 Fumadocs 风格 `[#custom-id]`，并在渲染文本中移除该后缀；
  - heading id 在 Nuxt compiler 前生成，TOC 和 DOM 共享同一 id；
  - code block meta 结构化为 title/icon/lineNumbers/keepBackground 等 props；
  - `structuredData` 写入 Nuxt Content page data，供 local search index 优先消费。
- `ProsePre` 改为消费结构化 code meta props，同时保留对 raw `meta` 的兼容解析。
- `createDocsSearchIndex()` 优先使用 `structuredData.headings/contents`，缺失时才回退
  到 TOC 和 body AST 扫描。

流程规则更新：

- Markdown transform 能在 MDC rehype hook 中完成的，不要推迟到视觉组件里做
  ad hoc 字符串处理；组件只保留兼容 fallback。
- 新增 foundation 组件时，fixture 不能继续是 placeholder-only route；必须有真实
  Markdown 和组件样例，并进入 focused Playwright 覆盖。
- Dialog-backed 组件如果不是通过 primitive trigger 打开，需要自行保证 focus return。
- Search 的结构化输入属于 foundation/integration 边界的连接点；先让 local search
  消费同一结构，再排 remote search API。
- Markdown transform plugin 文件变更后，不能只热更新 dev server。Nuxt Content dev
  cache 不会把 plugin 文件内容计入当前解析 checksum；需要先停止 dev server，删除
  `.data/content/contents.sqlite`，再重新启动，确认日志出现 `0 cached` / 全量 parsed。
- Playwright 出现 `page.goto net::ERR_ABORTED` 时先按导航级 flaky 处理，单测 focused
  重跑仍失败时才归类为组件或页面回归。

验证结论：

- `pnpm typecheck` 通过。
- 停止 dev server 后删除 `.data/content/contents.sqlite`，再执行 `pnpm dev:start`，
  Nuxt Content 重新解析 `28 files`，页面 HTML 验证通过：
  - `/guide/code-block` 生成 `id="custom-keep-background"` 和对应 heading anchor；
  - 渲染文本不再残留 `Keep Background #custom-keep-background`；
  - code block 结构化属性包含 `data-line-numbers-start="5"` 与 `keep-background.tsx`；
  - `/guide/zoomable-image` 生成 `data-zoomable="true"` 与 `fd-doc-image-trigger`。
- `pnpm test:e2e -- tests/e2e/markdown-transform.spec.ts tests/e2e/image-zoom.spec.ts`
  通过：`9 passed`。
- `pnpm test:e2e:content` 首轮仅遇到 tablet case 的 `page.goto net::ERR_ABORTED`；
  focused 重跑通过，按导航级 flaky 记录，不视为本轮组件回归。
- `pnpm test:e2e:fast` 首轮仅遇到 desktop page-actions case 的
  `page.goto net::ERR_ABORTED`；focused 重跑通过，按导航级 flaky 记录。
- `pnpm validate:links` 通过：`25 pages / 11 links`。
- `pnpm dev:health` 通过。
- `git diff --check` 通过。

### Page-tree transformer/runtime closeout

本轮把之前分散在 tree、breadcrumb、pager、sidebar 和 search 里的导航派生逻辑收口到
`app/utils/docs-page-tree-runtime.ts`：

- `createDocsPageTreeRuntime()` 统一从 Nuxt Content navigation、page meta 和
  directory meta 生成 `visibleTree`、`contextTree`、flat list、route path map 和
  source path map。
- runtime 同时暴露 `getCurrent()`、`getVisibleCurrent()`、`getContextualTree()`、
  `getSidebarItems()`、`getSectionHeadline()`、`getBreadcrumbs()` 和 `getPager()`。
- 新增 transformer contract：`page / group / separator / link / node / root`，并把
  `visible` 与 `context` 两棵树的 `includeHidden / preserveExcluded` 语义传给
  transformer context。
- `useDocsTree()` 现在返回同一份 runtime；route 页面把 pager、breadcrumb、sidebar
  headline 和 search index 都改为消费 runtime。首页 cards 继续消费 `items`，但这个
  `items` 已由同一 runtime 的 `visibleTree` 派生。
- `useDocsPager()`、`useDocsBreadcrumbs()` 和 `createDocsSearchIndex()` 保留
  `DocsNode[]` fallback，方便已有调用逐步迁移；新 route-level 消费优先传 runtime。
- `tests/e2e/page-tree-runtime.spec.ts` 覆盖两条关键边界：可见页面的 pager/search/sidebar
  共享同一可见树，以及被 `meta.json` 排除但可直达的页面使用 context tree 生成 breadcrumb，
  同时不进入可见 sidebar/pager。
- `package.json` 的 `test:e2e:fast` 与 `test:e2e:shell` 已纳入 page-tree runtime
  profile，避免后续改 sidebar/search/pager 时绕过这条合同。

剩余边界：

- 当前已经有 transformer API 和 runtime 收口，但还没有 site-level plugin registry 或
  config-driven transformer 注册；后续 multi source/version/i18n 前再接入配置层。
- 当前 runtime 仍以 `docs` collection 为唯一内容源；blog/changelog/api loader contract
  仍属于下一阶段。
- 本轮只集中 page tree 派生规则，不实现 remote search provider、feedback backend、RSS、
  `llms-full.txt`、per-page markdown export 或 image CDN adapter。

验证结论：

- Codex bridge 当前 `pnpm` 解析到 bundled `pnpm@11.7.0`，而本仓库
  `node_modules` 来自 `pnpm@10.33.2`；直接执行 `pnpm ...` 会在脚本前尝试重装依赖。
  本轮为避免改动依赖树，改用本地 bin 和 `node scripts/...` 直接验证。
- `.\node_modules\.bin\nuxi.cmd typecheck` 通过。
- `node .\scripts\dev-server.mjs restart --path=/guide/code-block --timeout=60000`
  通过，health 返回 `200`。
- `node .\scripts\dev-server.mjs health --path=/guide/component-detail --timeout=30000`
  通过，health 返回 `200`。
- `.\node_modules\.bin\playwright.cmd test tests/e2e/page-tree-runtime.spec.ts tests/e2e/sidebar.spec.ts tests/e2e/page-actions.spec.ts`
  通过：`25 passed / 8 skipped`。
- `.\node_modules\.bin\playwright.cmd test tests/e2e/theme.spec.ts tests/e2e/prose-defaults.spec.ts tests/e2e/code-block.spec.ts tests/e2e/markdown-transform.spec.ts tests/e2e/image-zoom.spec.ts tests/e2e/toc-responsive.spec.ts tests/e2e/sidebar.spec.ts tests/e2e/page-tree-runtime.spec.ts tests/e2e/page-actions.spec.ts`
  通过：`58 passed / 11 skipped`。
- 格式化后最终复验：
  - `.\node_modules\.bin\nuxi.cmd typecheck` 通过；
  - `node .\scripts\validate-docs-links.mjs` 通过：`25 pages / 11 links`；
  - `node .\scripts\dev-server.mjs restart --path=/guide/component-detail --timeout=60000`
    通过，health 返回 `200`；
  - `.\node_modules\.bin\playwright.cmd test tests/e2e/page-tree-runtime.spec.ts`
    通过：`6 passed`。
- `node .\scripts\validate-docs-links.mjs` 通过：`25 pages / 11 links`。
- `git diff --check` 通过。

### Sidebar page-tree parity correction

本轮针对 Fumadocs 远端真实页面重新校准左侧导航：

- 远端 `Components` / `Layouts` 不是 separator；它们是 folder/index 节点。之前本地用
  `---Components---` separator 加 `visualLevel` 字符串特判，把平级页面视觉伪装成子项，
  导致点击语义、active ancestry、缩进和 rail 都与真实树模型不一致。
- `content/guide/meta.json` 改用 virtual group 协议描述 `Components` 和 `Layouts`：
  `Components` 使用 `pagesIndex: "components"` 作为 folder link，组件页面作为 children；
  `Layouts` 作为无 index 的可折叠 group，承载 `Protocol Playground`。
- `docs-navigation` 支持 meta entry 里的 virtual group，并修正目录 meta 命中：group 需要从
  `stem/sourcePath/dirname` 候选中选最具体的目录 meta，不能让子目录继承父目录的
  `pages/pagesIndex`。
- `DocsSidebarTree` 移除 `Components` 标题驱动的 `visualLevel`；`DocsSidebarItem` 改为
  带 index 的 folder 使用单个 link row，chevron 命中时 `prevent/stop` 后只 toggle，文字区域
  继续导航。
- separator 样式按远端运行时 metrics 收口到 20px 行高/高度、`mt-6 mb-1 px-2` 等级；
  nested 缩进由真实 `data-level` 驱动，不再依赖伪视觉层级。

验证结论：

- `.\node_modules\.bin\playwright.cmd test tests/e2e/page-tree-runtime.spec.ts` 通过：`6 passed`。
- `.\node_modules\.bin\playwright.cmd test tests/e2e/sidebar.spec.ts` 通过：`16 passed / 8 skipped`。
- `.\node_modules\.bin\nuxi.cmd typecheck` 通过。
- `node .\scripts\validate-docs-links.mjs` 通过：`25 pages / 11 links`。
- `node .\scripts\dev-server.mjs health --path=/guide/component-detail --timeout=30000` 通过。
- `git diff --check` 通过。

### Verification workflow validation and promotion

本轮专门验证“health-first、少重启、聚焦测试、内容测试必要时串行”的新流程：

- 初始不重启，直接执行：
  - `node scripts/dev-server.mjs status --path=/guide/component-detail --timeout=30000`
  - `node scripts/dev-server.mjs health --path=/guide/component-detail --timeout=30000`
  - `node scripts/dev-server.mjs health --path=/guide/components --timeout=30000`
- 结果：当前 `8888` 是本工作区托管的 Nuxt dev server，`/guide/component-detail`
  和 `/guide/components` 都返回 `200`。
- Codex bridge shell 中直接执行 `pnpm ...` 会先触发 bundled pnpm 的依赖状态检查，
  并因非 TTY 的交互式 remove modules 确认失败。为了避免误改依赖树，验证时改用
  `node scripts/...` 和 `.\node_modules\.bin\*.cmd`。
- `.\node_modules\.bin\nuxi.cmd typecheck` 通过。typecheck 后两条内容路由 health
  都超时，端口 `8888` 仍处于 Listen，但请求无响应；日志没有 UI 回归或
  `_content_docsMeta` 错误。因此按 `server-health` 处理，只做了一次有证据的
  `node scripts/dev-server.mjs restart --path=/guide/components --timeout=90000`，
  restart 后 health 恢复 `200`。
- 后续没有再重启，直接完成：
  - `.\node_modules\.bin\playwright.cmd test tests/e2e/toc.spec.ts tests/e2e/toc-responsive.spec.ts`
    通过：`12 passed / 9 skipped`；
  - `$env:PLAYWRIGHT_WORKERS='1'; .\node_modules\.bin\playwright.cmd test tests/e2e/content-components.spec.ts -g "renders inline toc expanded"`
    通过：`3 passed`；
  - `node scripts/parity/run.mjs --profile=toc --url=http://127.0.0.1:8888/guide/component-detail --viewports=2048x1152,994x935 --chromePort=9234 --settleMs=2200`
    通过：`15/15`；
  - `node scripts/validate-docs-links.mjs` 通过：`25 pages / 11 links`；
  - `git diff --check` 通过；
  - 收尾 health 仍为 `200`。

推广结论：

- `restart` 不应该是默认验证动作；默认顺序是 `status/health -> typecheck ->
health -> focused e2e/parity -> validate:links -> git diff --check`。
- typecheck 后必须 health-first。若出现 `404`、Nuxt error、请求超时、端口监听但
  无响应、stale/wrong server 或 Nuxt Content sqlite 缺表，再 restart。
- 内容组件或 Nuxt Content 压力相关失败先用 focused case + `PLAYWRIGHT_WORKERS=1`
  复验；只有串行仍失败，才进入组件实现排查。
- Codex bridge shell 下优先用直接命令避免 `pnpm` 包装层误触发 install；本地人工终端
  仍可用 package scripts。

### Foundation alignment baseline

本轮把当前 foundation hardening 的主动执行入口收口到
`design/foundation-alignment-matrix.md`，并确认下面这些结论应作为长期基线：

- 当前更大的基础差异不在“还缺几个页面组件”，而在 `source identity -> docs tree ->
provider/layout -> markdown transform -> verification gate` 这条协议链还没有全部达到
  `Gate Passed`。
- `content.config.ts`、`app/utils/docs-navigation.ts`、
  `app/utils/docs-page-tree-runtime.ts`、`DocsRootProvider`、`DocsPage`、`DocsLink`、
  `app/utils/docs-markdown-pipeline.ts` 是当前 foundation hardening 的核心 owner 面。
- Markdown transform pipeline 仍是最明显的基础差异之一：当前已具备 custom heading id、
  structured data、code meta 和 Shiki notation baseline，但 steps、package-manager、
  code-tab grouping、image metadata policy 仍需继续补齐。
- integration P1 的 remote search provider、feedback backend、RSS、
  `llms-full.txt`、per-page markdown export、image CDN adapter 和 multi-source baseline
  不应与 foundation hardening 混在同一轮推进；除非它们先暴露出新的基础协议缺口。

### Source identity and route identity hardening

本轮只推进 foundation 第一阶段的 `content -> docs tree -> page identity`：

- 对照 Fumadocs page-tree `$ref` / `url` 分离后，确认本地仍把尾部 `index` 同时折叠在
  `sourcePath` 和 route path 中。这样会让嵌套 `index.md` 的源码读取、GitHub source/edit
  URL 和相对链接失去真实文件身份。
- `normalizeDocsSourcePath()` 改为保留真实 content stem；`resolveDocsRoutePath()` 单独负责
  默认 index route 折叠和 slug transform。
- 新增 `DocsPageIdentity` / `resolveDocsPageIdentity()`，统一输出 `contentPath / sourcePath /
routePath / stem / slug`。这里显式承认 `DocsPageRecord.path` 是 Nuxt Content 查询键，
  `DocsNode.path` 才是 route consumption key；meta map、route collision、route lookup 复用
  同一 identity 入口。
- route collision 错误改为报告稳定 source identity，不再报告可能已经是 route alias 的
  `record.path`。
- `DocsPageTreeRuntime` 的 source lookup 改由 `contextTree` 建表，并统一规范化查询 key；
  excluded/hidden 页面仍不进入 visible sidebar/pager，但可以按 source identity 找回。
- 新增 `tests/nuxt/docs-page-identity.nuxt.spec.ts`，覆盖根/嵌套 index、中文和空格 slug、
  route collision、hidden context identity。该测试显式使用 Node environment，避免纯工具测试
  额外启动完整 Nuxt DOM environment；`tests/nuxt/setup.ts` 同步允许 Node 环境安全加载。

验证结论：

- `pnpm exec vitest run tests/nuxt/docs-page-identity.nuxt.spec.ts`：`4 passed`。
- `pnpm run test:nuxt`：`7 passed`。
- `pnpm run validate:links`：`25 pages / 11 links`。
- `pnpm run typecheck`：通过。
- typecheck 后 route health 超时；`dev-server.mjs status` 显示 managed PID 存活但端口不可达。
  按“测试不拥有服务生命周期”的当前规则，本轮没有自动 restart，因此浏览器级
  page-tree 回归未执行。

### Documentation lifecycle and verification entry simplification

本轮按文档与测试服务审计结果完成减法治理：

- 删除已 100% 完成的 Stage 7.7 / Stage 7.8 临时 TODO；durable component 状态继续由
  `fumadocs-component-parity-inventory.md` 承接。
- `foundation-prep-plan.md`、`nuxt-content-mvp-plan.md`、
  `fumadocs-alignment-plan.md` 和 `playwright-verification-plan.md` 标记为历史记录，
  不再作为主动执行入口。
- 新增 `verification-runbook.md` 作为唯一活跃验证说明；旧 Playwright 文档只保留迁移、
  benchmark 和历史故障证据。
- `package.json` 的 Playwright 入口由 20 个收敛为两个：参数化 `test:e2e` 和明确的
  `test:e2e:full`。文件、tag、project、workers 和 last-failed 等选择全部通过参数传递。
- 测试链退役 managed dev-server 和 Playwright wrapper。服务由用户通过 `pnpm dev`
  管理；`app:check` 只执行一次只读 HTTP 检查。
- `typecheck` 使用 `.nuxt-typecheck`，避免与运行中的 dev server 共享 `.nuxt`。
- docs source/route identity 提取到 `shared/docs-identity.js`，生产导航、链接解析和离线
  link validator 共用同一套纯函数，避免验证器再次漂移。

验证结论：

- `package.json` 只剩 `test:nuxt`、`test:e2e`、`test:e2e:full` 三个测试入口。
- `pnpm test:e2e -- --list`：成功列出 `132 tests / 14 files`。
- `pnpm test:e2e -- --grep '@fast' --project=chromium-desktop --list`：成功筛选
  `23 tests / 8 files`，证明原 grouped scripts 可以由参数替代。
- `pnpm test:nuxt`：`7 passed`。
- `pnpm validate:links`：`25 pages / 11 links`。
- `pnpm typecheck`：通过；生成 `.nuxt-typecheck`，默认 `.nuxt/tsconfig.json` 时间未变化。
- `app:check` 对不可达测试地址会在指定 timeout 内返回非零，不启动或修复任何服务。
- 本轮未运行真实浏览器测试，因为现有服务由用户管理且当前未恢复健康状态。

### Playwright-owned E2E server lifecycle

本轮修正上一节“浏览器服务由用户手动管理”的临时结论，最终采用 Playwright 官方
`webServer` 生命周期：

- `test:e2e` 和 `test:e2e:full` 是仅有的 Playwright package scripts；文件、tag、project、
  workers 等选择继续通过参数传递。
- 默认没有健康服务时，Playwright 自动执行 Nuxt dev；本地已有健康服务时通过
  `reuseExistingServer` 复用。设置 `PLAYWRIGHT_TEST_BASE_URL` 时视为显式外部服务。
- E2E、typecheck 和日常开发分别使用 `.nuxt-e2e`、`.nuxt-typecheck` 和 `.nuxt`，避免
  buildDir 互相污染。
- 删除 `app:check` 和 `scripts/check-app.mjs`；测试前不再要求人工健康检查或手动启动服务。
- 不恢复已退役的 `scripts/dev-server.mjs` 和 `scripts/run-playwright.mjs`。

隔离 buildDir 首次验证暴露出应用通过相对路径导入 `shared/docs-identity.js` 时，Nitro
会生成依赖输出目录深度的错误路径。应用侧已改用 Nuxt 标准
`#shared/docs-identity.js` alias；离线 link validator 仍直接导入同一个共享模块。

冷启动验证结论：

- 删除工作区内 `.nuxt-e2e` 后执行 focused Playwright 用例，Playwright 自动创建
  `.nuxt-e2e`、启动 Nuxt、完成测试并在结束后释放 `127.0.0.1:8888`。
- 冷启动时 Nuxt/Vite 首次依赖优化会占用较多时间，因此单测 timeout 从 30 秒调整为
  60 秒；最终 focused case `1 passed`，总耗时约 40 秒。
- `pnpm typecheck` 通过。
- `pnpm test:nuxt` 通过：`7 passed`。
- `pnpm validate:links` 通过：`25 pages / 11 links`。
- `pnpm exec eslint`（相关配置与共享 identity consumers）和 `git diff --check` 通过。

### Test service standardization gate

本轮完成测试服务剩余三个标准化缺口：existing-server reuse、完整 E2E 和 CI gate。

复用行为实测：

- 人工启动一个隐藏的本工作区 Nuxt 临时服务后，记录 `8888` listener PID `22996`。
- 执行 focused Playwright 用例时没有出现第二个 listener；测试前后均为同一 PID。
- 测试结束后原服务仍返回 `200`，证明 Playwright 不会回收复用的外部进程。
- 验证完成后只停止了已核实的临时 PID。

全量行为实测：

- 首轮发现首页测试把 composable home contract 错写成“card/link 合计至少 3 个”；当前
  数据合法地只有两个入口。断言改为分别要求至少一个 card 和一个 foundation link。
- 4 workers 的长时间全量运行在 mobile 阶段出现一次 `page.goto net::ERR_ABORTED`；该
  用例在单 worker 下连续重复 3 次通过，判断为共享 Nuxt dev server 压力下的瞬时导航
  抖动，而不是稳定产品回归。
- 本机有 20 个逻辑核心，但浏览器 worker 共享一个 Nuxt Content server，CPU 不是主要
  瓶颈。`test:e2e:full` 因此固定为 2 workers；focused `test:e2e` 仍允许通过参数覆盖。
- 最终完整三 project 回归通过：`113 passed / 19 skipped`，耗时约 4.8 分钟。
- 测试结束后 `8888` 被正常释放。

仓库 gate：

- 新增 `.github/workflows/verify.yml`。
- pull request 执行 typecheck、Nuxt runtime、link validation 和 desktop `@fast` E2E。
- main push 和手动 workflow 执行完整 `test:e2e:full`。
- CI 使用 Playwright `webServer` 冷启动 `.nuxt-e2e`，失败时上传 report 和 test artifacts。
- `packageManager` 固定为 `pnpm@10.33.2`；`pnpm-lock.yaml` 纳入版本控制范围，
  CI 使用 `pnpm install --frozen-lockfile`。

### Viewport-aware E2E selection and CI sharding

本轮按 Playwright 官方 project filtering 和 sharding 方案验证全量加速：

- desktop 保留完整基线；viewport-independent 测试不再在 tablet/mobile 重复。
- `@responsive` 表示三 project contract，`@narrow` 表示 tablet + mobile，
  `@tablet` / `@mobile` 表示 project-specific branch。
- 最终收集矩阵从 `132` 条缩减为 `88` 条：desktop `39`、tablet `23`、mobile `26`。
- 两个 full-suite shard 各收集 `44` 条，`fullyParallel: true` 下负载均衡。
- 优化后的第一次完整回归执行 `90` 条，`88 passed / 2 skipped`，约 4.0 分钟；
  随后细化 `@narrow` / `@tablet` 标签，在收集阶段移除这两条无效 skip。
- 受标签调整影响的 sidebar + TOC responsive 矩阵复验通过：`20 passed`，无 skip。
- 最终 `88` 条零 skip 全量回归通过：`88 passed`，本轮冷启动总耗时约 4.6 分钟。

本地收益说明：

- 相比优化前 `113 passed / 19 skipped / 4.8 分钟`，用例调度减少约 33%，但两次优化后
  全量分别约 4.0 和 4.6 分钟。单机墙钟收益存在明显波动，主要成本仍来自共享 Nuxt
  服务、冷启动和导航，而不是纯浏览器 worker 数量。
- 本地继续使用一个 Nuxt server + 2 workers；不在单机上复制多个 shard server。

CI sharding 验证：

- `verify.yml` 的 main/manual full gate 改为两个独立 matrix shard。
- shard 使用 blob reporter，merge job 下载并执行 `playwright merge-reports --reporter html`。
- 本地用 desktop `@fast` 集合模拟两个并行 shard：shard 1 `10 passed`，shard 2
  `8 passed / 1 skipped`，两者约 52 秒并行完成。
- 两个 blob zip 已成功合并为统一 HTML report，证明 CI 命令和报告链路可执行。
