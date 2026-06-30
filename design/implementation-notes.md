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
- 正式进入上层开发前，先完成 `foundation-prep-plan.md` 的 Stage 0
- TinyRobot monorepo 暂时不作为架构参考，只后置为组件 API、demo 内容和产品状态验证来源
- 基础依赖先按能力层评估，不照搬 Fumadocs / assistant-ui 的 React 依赖
- CSS 框架路线是：CSS tokens 作为设计语言源头，Tailwind CSS v4 作为 utility / `@theme` 编译层
- 已实际引入基础质量工具、`@lucide/vue` 和 Tailwind CSS v4 Vite 插件
- Tailwind CSS v4 使用 `@tailwindcss/vite` 接入，不走当前仍绑定 Tailwind v3 的 `@nuxtjs/tailwindcss`
- 当前不引入 Nuxt UI、shadcn-vue、Reka UI、VueUse，避免 foundation 阶段过早扩大依赖面
- 按当前项目偏好，`.gitignore` 已加入 `pnpm-lock.yaml`；由于该文件已被 Git 跟踪，本次只保持不纳入提交范围，是否 untrack 需单独处理

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
  - 当前实现保持 Vue 原生状态，不引入 `Reka UI`
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

- 当前继续 Vue-native primitives，不引入 Reka UI / shadcn-vue。
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

- 当前 Vue-native primitives 足够支撑下一阶段产品开发，暂不引入
  Reka UI / shadcn-vue / Nuxt UI。
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
