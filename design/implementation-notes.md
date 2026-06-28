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

下一步：

- 可以进入产品层第一步：
  - site config schema
  - layout shared options 由 config 生成
  - nav links schema
  - Git metadata config
  - page actions contract
  - GitHub source link
  - Copy Markdown
