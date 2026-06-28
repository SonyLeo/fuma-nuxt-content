---
title: Foundation Implementation Spec
sectionLabel: Plan
---

# Foundation Implementation Spec

## 文档定位

这份文档不再是单纯的对齐分析文档。

从现在开始，它用于指导“基础层”实现。

它负责说明：

- 为什么这样设计
- 基础层的边界是什么
- 每一层协议怎么定义
- 推荐目录怎么拆
- 当前项目要改哪些位置
- 对应参考源码在哪里

它不负责产品层能力规划。

产品层能力统一放到：

- `design/product-roadmap.md`

## 当前状态

这份文档现在作为“基础层协议依据”和历史实现依据保留，不再作为当前执行清单逐条推进。

下文较早章节中的“当前项目状态”“当前问题”“直接改造映射”均按历史上下文阅读。

当前主动规划入口以这些文件为准：

- `design/roadmap.md`
- `design/foundation-roadmap.md`
- `design/product-roadmap.md`
- `design/implementation-notes.md`

当前基础层已经完成一轮闭环：

- `docs` collection 已成立
- `DocsNode[]` 已成为 sidebar / breadcrumb / pager / homepage cards 的共同输入
- `meta.json` 目录控制层已接入
- `DocsPage` 已承接 header / breadcrumb / toc / tocPopover / footer contract
- route 页面已收口为 query + props 装配
- 第一批内容组件和样式分层已具备 foundation 级可用性

因此，后续不应继续把 Fumadocs 的完整 loader、page-tree transformer、plugin runtime 当作 foundation 阶段目标。

下一阶段应转入：

- `design/product-roadmap.md` 的 site config
- page actions
- GitHub source link
- Copy Markdown

Fumapress 作为产品层参考，VitePress 作为未来兼容边界；二者都不反向改写当前 foundation protocol。

## 一、基础层的目标

基础层要解决的是：

- 文档内容如何组织
- 导航树如何生成
- layout 和 page 如何分层
- Markdown 和 Vue 组件如何稳定协作
- 样式系统如何长期演进

一句话：

- 基础层负责把“文档系统”做成立

## 二、基础层边界

基础层包含这些层：

1. 内容协议层
2. 内容标准化层
3. docs tree 层
4. layout protocol 层
5. page protocol 层
6. 基础 UI primitives 层
7. docs content components 层
8. 样式系统层

基础 UI primitives 包含：

- left sidebar
- right TOC
- mobile nav
- breadcrumb / pager / footer
- prose table / inline code / kbd / media
- code highlight / code block / code tabs
- component preview / code preview

基础层明确不包含：

- 搜索
- feedback
- page actions
- blog / changelog / api
- llms / mcp
- story / playground
- sitemap / rss / seo

这些都属于产品层。

## 三、设计依据

### 1. `fumadocs`

它最值得借鉴的不是截图，而是实现链路：

- `schema`
- `source`
- `page tree`
- `layout protocol`
- `docs component`

参考源码：

- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\schema.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\source.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\page-tree\builder.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\page-tree\definitions.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\client.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\index.tsx`

### 2. `assistant-ui`

它值得借鉴的是 docs 壳层节奏：

- 固定主栏
- 固定 sidebar
- 右栏扩展位

参考源码：

- `../assistant-ui-main/apps/docs/components/docs/layout/docs-root-layout.tsx`
- `../assistant-ui-main/apps/docs/components/docs/layout/docs-layout.tsx`

### 3. `fumapress`

它值得借鉴的是“产品层封装方式”，不是基础层本体。

对于当前基础实现，主要借鉴它的分层思维，不直接搬能力。

参考源码：

- `D:\Projects\Learning\gh\fumapress\packages\core\src\config.ts`
- `D:\Projects\Learning\gh\fumapress\packages\core\src\layouts\docs.tsx`
- `D:\Projects\Learning\gh\fumapress\apps\docs\press.config.tsx`

### 4. `VitePress`

旧 VitePress prototype 值得保留的是 theme wrapper、内容组件、page actions 和视觉经验。

它不适合作为当前基础层架构来源。

原因：

- VitePress 已经内置 routing、sidebar、outline、local search
- 旧 prototype 的 page tree 是从 VitePress sidebar 适配出来的
- 当前项目的基础协议应继续以 `Nuxt Content -> DocsNode[] -> DocsLayout / DocsPage` 为主线

参考源码：

- `D:\Projects\Work\tiny-robot-docs-ui\docs\.vitepress\config.ts`
- `D:\Projects\Work\tiny-robot-docs-ui\docs\.vitepress\theme\composables\useDocsPageTree.ts`
- `D:\Projects\Work\tiny-robot-docs-ui\docs\.vitepress\theme\components\DocsPageActions.vue`

## 四、基础层总体结构

推荐最终目录：

```text
fuma-nuxt-content
├─ app
│  ├─ layouts
│  │  └─ docs.vue
│  ├─ pages
│  │  ├─ index.vue
│  │  └─ [...slug].vue
│  ├─ composables
│  │  ├─ useDocsTree.ts
│  │  ├─ useDocsPage.ts
│  │  ├─ useDocsBreadcrumbs.ts
│  │  ├─ useDocsPager.ts
│  │  └─ useDocsToc.ts
│  ├─ types
│  │  └─ docs.ts
│  ├─ components
│  │  ├─ docs
│  │  │  ├─ layout
│  │  │  │  ├─ DocsLayoutShell.vue
│  │  │  │  ├─ DocsNavbar.vue
│  │  │  │  ├─ DocsSidebar.vue
│  │  │  │  ├─ DocsSidebarTree.vue
│  │  │  │  ├─ DocsSidebarItem.vue
│  │  │  │  ├─ DocsMobileNav.vue
│  │  │  │  ├─ DocsToc.vue
│  │  │  │  ├─ DocsTocList.vue
│  │  │  │  └─ DocsPager.vue
│  │  │  └─ page
│  │  │     ├─ DocsPage.vue
│  │  │     ├─ DocsPageHeader.vue
│  │  │     ├─ DocsTitle.vue
│  │  │     ├─ DocsDescription.vue
│  │  │     ├─ DocsBody.vue
│  │  │     ├─ DocsPageFooter.vue
│  │  │     └─ DocsBreadcrumb.vue
│  │  └─ content
│  │     ├─ DocAccordion.vue
│  │     ├─ DocCallout.vue
│  │     ├─ DocCard.vue
│  │     ├─ DocCardGrid.vue
│  │     ├─ DocTabs.vue
│  │     ├─ DocTab.vue
│  │     ├─ DocSteps.vue
│  │     ├─ DocCodeBlock.vue
│  │     ├─ DocPreview.vue
│  │     ├─ DocFiles.vue
│  │     └─ DocTypeTable.vue
│  └─ assets
│     └─ css
│        ├─ tokens.css
│        ├─ shell.css
│        ├─ prose.css
│        └─ content.css
├─ content
│  └─ docs
├─ content.config.ts
└─ nuxt.config.ts
```

## 五、协议一：内容协议

### 目标

把 Markdown 页面从“松散内容”变成“结构化 docs 页面”。

### collection 语义

历史项目状态：

- [content.config.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/content.config.ts)
  - 仍然使用 `collections.content`

基础层要求：

- 统一改为 `collections.docs`

原因：

- `docs` 表示这是 docs tree 的内容源
- 便于后续和 `blog / changelog / api` 分离

### frontmatter 协议

推荐统一为：

```yaml
title: Getting Started
description: 验证最小链路、docs shell 和交互组件。
group: Guide
order: 1
icon: rocket
badge: New
status: stable
full: false
toc: true
sidebar: true
pager: true
navigation: true
hero: false
links:
  - label: Components
    href: /guide/components
    description: 查看文档组件
```

字段定义：

- `title`
  - 页面标题
- `description`
  - 页面描述
- `group`
  - 导航分组名
- `order`
  - 同级排序
- `icon`
  - 页面或导航图标
- `badge`
  - 页面 badge
- `status`
  - 状态，如 `new / beta / deprecated / stable`
- `full`
  - 是否全宽页
- `toc`
  - 是否显示右侧目录
- `sidebar`
  - 是否进入 sidebar
- `pager`
  - 是否参与前后页
- `navigation`
  - 是否进入 docs tree
- `hero`
  - 是否可作为首页重点入口
- `links`
  - 页面增强链接或首页入口卡片数据

### 目录元信息协议

虽然当前先不强制引入 `meta.json`，但基础层必须预留这层能力。

参考源码：

- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\schema.ts`
- `D:\Projects\Learning\gh\fumapress\apps\docs\content\docs\meta.json`

后续可扩展字段：

- `title`
- `icon`
- `root`
- `defaultOpen`
- `collapsible`

结论：

- 页面 frontmatter 和目录元信息要分开设计
- 即使第一版不做 `meta.json`，类型和标准化层也要预留

## 六、协议二：运行时标准化协议

### 目标

不让任何组件直接依赖 `queryCollectionNavigation()` 的原始结构。

### 标准节点结构

统一定义：

```ts
export type DocsLink = {
  label: string
  href: string
  description?: string
}

export type DocsNode = {
  title: string
  path: string
  description?: string
  group?: string
  order?: number
  icon?: string
  badge?: string
  status?: string
  full?: boolean
  toc?: boolean
  sidebar?: boolean
  pager?: boolean
  navigation?: boolean
  hero?: boolean
  links?: DocsLink[]
  children?: DocsNode[]
}
```

### 协议规则

基础层硬性规则：

- `DocsSidebarTree` 只接收 `DocsNode[]`
- `DocsBreadcrumb` 只接收 `DocsNode[]` 推导出的链路
- `DocsPager` 只接收标准化 `previous / next`
- 首页入口卡片只接收 `DocsNode[]` 派生数据
- layout 组件不能直接读 `queryCollectionNavigation()` 结果

### 标准化流程

推荐流程：

1. `queryCollection('docs')`
2. `queryCollectionNavigation('docs')`
3. 建立 `pageMetaMap`
4. `normalizeDocsTree(rawNavigation, pageMetaMap)`
5. 再由其他 composable 派生

### pageMetaMap 的作用

它负责把页面 frontmatter 信息补回导航节点：

- `description`
- `group`
- `order`
- `icon`
- `badge`
- `status`
- `full`
- `toc`
- `sidebar`
- `pager`
- `navigation`

### 当前项目对应位置

- [useDocsNavigation.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/composables/useDocsNavigation.ts)

历史问题：

- 里面已经有 `flattenNavigation / containsPath / findAncestors`
- 但还停留在原始导航结构操作

结论：

- 这些逻辑不该继续扩张
- 应该拆成标准化层 + 派生层

## 七、协议三：composables 协议

### 目标

让数据逻辑分层清晰，页面只做装配。

### 推荐 composables

#### 1. `useDocsTree.ts`

职责：

- 查询 docs navigation
- 标准化成 `DocsNode[]`
- 输出 `tree`
- 输出 `current`
- 输出 `section`

#### 2. `useDocsPage.ts`

职责：

- 查询当前 page
- 输出页面级元信息

输出建议：

- `title`
- `description`
- `full`
- `toc`
- `pager`
- `hero`

#### 3. `useDocsBreadcrumbs.ts`

职责：

- 基于 `DocsNode[]` + `path`
- 输出 breadcrumb 链路

#### 4. `useDocsPager.ts`

职责：

- 基于 `DocsNode[]` + `path`
- 输出 `previous / next`

#### 5. `useDocsToc.ts`

职责：

- 从 `page.body.toc.links` 读取
- 输出统一 toc item

### 当前项目对应位置

- [useDocsNavigation.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/composables/useDocsNavigation.ts)
- [useDocsPage.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/composables/useDocsPage.ts)
- [useDocsToc.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/composables/useDocsToc.ts)

### 推荐重构顺序

1. 新增 `app/types/docs.ts`
2. 新增 `useDocsTree.ts`
3. 新增 `useDocsBreadcrumbs.ts`
4. 新增 `useDocsPager.ts`
5. 收口 `useDocsPage.ts`
6. 逐步淘汰 `useDocsNavigation.ts`

## 八、协议四：layout protocol

### 目标

把 docs 外壳变成稳定 layout 协议。

### 参考源码

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\client.tsx`
- `../assistant-ui-main/apps/docs/components/docs/layout/docs-root-layout.tsx`

### 推荐结构

```text
app/components/docs/layout
├─ DocsLayoutShell.vue
├─ DocsNavbar.vue
├─ DocsSidebar.vue
├─ DocsSidebarTree.vue
├─ DocsSidebarItem.vue
├─ DocsMobileNav.vue
├─ DocsToc.vue
├─ DocsTocList.vue
└─ DocsPager.vue
```

### 每个组件的协议职责

#### `DocsLayoutShell.vue`

只负责：

- header
- left sidebar
- center content area
- right toc area

不负责：

- 查询数据
- 推导导航树
- 渲染页面标题

#### `DocsNavbar.vue`

只负责：

- 品牌
- 顶部 links
- 动作区
- 移动端入口

后续要预留：

- search trigger
- theme switch
- version switch

#### `DocsSidebar.vue`

只负责：

- sidebar 容器
- section 标题
- 滚动区

不负责：

- 递归树逻辑

#### `DocsSidebarTree.vue`

只负责：

- 递归渲染 `DocsNode[]`

#### `DocsSidebarItem.vue`

只负责：

- 单节点显示
- active state
- badge / status / icon
- 子级展开

#### `DocsMobileNav.vue`

只负责：

- 移动端 sidebar drawer
- drawer 开关

#### `DocsToc.vue`

只负责：

- toc 容器
- toc 区头部

#### `DocsTocList.vue`

只负责：

- toc items
- 当前高亮

#### `DocsPager.vue`

只负责：

- prev / next

### 当前项目对应位置

- [docs.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/layouts/docs.vue)
- [DocsHeader.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsHeader.vue)
- [DocsSidebar.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsSidebar.vue)
- [DocsToc.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsToc.vue)
- [DocsPager.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsPager.vue)

### route 层职责

#### `app/layouts/docs.vue`

只负责：

- layout 注入

不负责：

- 数据查询

#### `app/pages/[...slug].vue`

只负责：

- 查 page
- 查 tree
- 查 breadcrumb
- 查 pager
- 查 toc
- 组装 props

当前项目对应位置：

- [\[...slug].vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/pages/[...slug].vue)

## 九、协议五：page protocol

### 目标

把页面结构变成稳定 page primitives 协议。

### 参考源码

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\slots\footer.tsx`

### 推荐结构

```text
app/components/docs/page
├─ DocsPage.vue
├─ DocsPageHeader.vue
├─ DocsTitle.vue
├─ DocsDescription.vue
├─ DocsBody.vue
├─ DocsPageFooter.vue
└─ DocsBreadcrumb.vue
```

### 每个组件的协议职责

#### `DocsPage.vue`

只负责：

- 页面主容器
- page header / body / footer / pager 的编排

#### `DocsPageHeader.vue`

只负责：

- breadcrumb
- title
- description

后续预留：

- page actions

#### `DocsTitle.vue`

只负责：

- `h1`

#### `DocsDescription.vue`

只负责：

- 描述文本

#### `DocsBody.vue`

只负责：

- 正文容器
- prose wrapper

#### `DocsPageFooter.vue`

只负责：

- footer 区元信息

基础层第一版可以先空壳，但必须存在。

#### `DocsBreadcrumb.vue`

只负责：

- 路径链路

### 建议页面装配形式

```vue
<NuxtLayout name="docs" v-bind="layoutProps">
  <DocsPage :full="pageMeta.full">
    <DocsPageHeader
      :breadcrumbs="breadcrumbs"
      :title="pageMeta.title"
      :description="pageMeta.description"
    />

    <DocsBody>
      <ContentRenderer :value="page" />
    </DocsBody>

    <DocsPageFooter />
    <DocsPager :previous="previous" :next="next" />
  </DocsPage>
</NuxtLayout>
```

这个协议非常重要。

因为后续产品层所有增强都要挂在这一层上，而不是反过来改正文结构。

## 十、协议六：docs content components 协议

### 目标

把高频 docs 表达收口成稳定内容组件体系。

### 第一批必须做

- `DocAccordion`
- `DocCallout`
- `DocCard`
- `DocCardGrid`
- `DocTabs`
- `DocTab`
- `DocSteps`
- `DocCodeBlock`
- `DocPreview`

### 第二批建议做

- `DocBanner`
- `DocFiles`
- `DocInlineToc`
- `DocTypeTable`
- `DocGithubInfo`

### 统一 props 协议

建议统一字段：

- `title`
- `description`
- `badge`
- `tone`
- `icon`
- `href`

正文统一走 slot。

### MDC 标签协议

统一使用 kebab-case：

- `doc-callout`
- `doc-card`
- `doc-card-grid`
- `doc-tabs`
- `doc-tab`
- `doc-steps`
- `doc-code-block`
- `doc-preview`
- `doc-accordion`
- `doc-files`
- `doc-type-table`

### 文档语义要求

这些组件不能只是普通 UI 组件换皮。

必须优先考虑：

- 文档页节奏
- 与 prose 的衔接
- 内容表达语义
- 后续可链接、可扩展

### 重点：`DocAccordion`

参考源码：

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\accordion.tsx`

第一版至少要预留：

- anchor id
- copy link 扩展位
- 文档页内可定位能力

### 当前项目对应位置

- [app/components/content](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/content)

## 十一、协议七：样式系统协议

### 目标

让样式层长期可维护。

### 文件分层

```text
app/assets/css
├─ tokens.css
├─ shell.css
├─ prose.css
└─ content.css
```

### `tokens.css`

只负责 token：

- color
- layout
- spacing
- typography
- surface

推荐 token：

- `--docs-color-background`
- `--docs-color-popover`
- `--docs-color-card`
- `--docs-color-border`
- `--docs-color-primary`
- `--docs-color-foreground`
- `--docs-color-muted-foreground`
- `--docs-header-height`
- `--docs-sidebar-width`
- `--docs-toc-width`
- `--docs-page-width`
- `--docs-font-sans`
- `--docs-font-mono`
- `--docs-radius-md`
- `--docs-shadow-card`

### `shell.css`

只负责：

- navbar
- sidebar
- toc
- docs grid
- pager
- footer
- hero
- mobile drawer

### `prose.css`

只负责：

- 标题
- 段落
- 列表
- 表格
- blockquote
- inline code
- code block
- 图片

### `content.css`

只负责：

- `DocCallout`
- `DocCard`
- `DocCardGrid`
- `DocTabs`
- `DocSteps`
- `DocAccordion`
- `DocFiles`
- `DocTypeTable`

### 当前项目对应位置

- [tokens.css](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/assets/css/tokens.css)
- [shell.css](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/assets/css/shell.css)
- [prose.css](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/assets/css/prose.css)

## 十二、基础层详细实现顺序

### Step 1：内容协议收口

1. `content.config.ts` 改 `docs`
2. 页面 frontmatter 协议收口
3. 新建 `app/types/docs.ts`
4. 建立 `DocsNode`

### Step 2：标准化层建立

1. 新建 `useDocsTree.ts`
2. 新建 `useDocsBreadcrumbs.ts`
3. 新建 `useDocsPager.ts`
4. 收口 `useDocsPage.ts`
5. 保留 `useDocsToc.ts`

### Step 3：layout protocol 重构

1. 拆 `DocsLayoutShell.vue`
2. 拆 `DocsNavbar.vue`
3. 拆 `DocsSidebarTree.vue`
4. 拆 `DocsSidebarItem.vue`
5. 拆 `DocsMobileNav.vue`
6. 收口 `docs.vue`

### Step 4：page protocol 重构

1. 拆 `DocsPageHeader.vue`
2. 拆 `DocsTitle.vue`
3. 拆 `DocsDescription.vue`
4. 拆 `DocsBody.vue`
5. 拆 `DocsPageFooter.vue`
6. 拆 `DocsBreadcrumb.vue`
7. 调整 `[...slug].vue` 为纯装配页

### Step 5：内容组件补齐

1. 补 `DocAccordion`
2. 补 `DocFiles`
3. 补 `DocTypeTable`
4. 校正已有组件 props 协议

### Step 6：首页收口

1. hero
2. feature cards
3. section entry cards
4. 首页数据从 docs tree 派生

### Step 7：样式层收口

1. 扩 token
2. 新增 `content.css`
3. 调整 sidebar / toc / code block / pager 节奏
4. 补移动端导航视觉

## 十三、当前项目的直接改造映射

### 第一优先级

- [content.config.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/content.config.ts)
- [useDocsNavigation.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/composables/useDocsNavigation.ts)
- [useDocsPage.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/composables/useDocsPage.ts)
- [\[...slug].vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/pages/[...slug].vue)

### 第二优先级

- [docs.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/layouts/docs.vue)
- [DocsHeader.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsHeader.vue)
- [DocsSidebar.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsSidebar.vue)
- [DocsPage.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsPage.vue)
- [DocsToc.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsToc.vue)
- [DocsPager.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsPager.vue)

### 第三优先级

- [app/components/content](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/content)
- [index.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/pages/index.vue)
- [tokens.css](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/assets/css/tokens.css)
- [shell.css](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/assets/css/shell.css)
- [prose.css](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/assets/css/prose.css)

## 十四、基础层验收标准

基础层完成后，必须满足：

- `docs` collection 成立
- `DocsNode[]` 成为唯一导航结构
- `useDocsTree / useDocsBreadcrumbs / useDocsPager / useDocsToc / useDocsPage` 分工清晰
- layout protocol 成立
- page protocol 成立
- docs content components 协议统一
- 样式分层稳定
- 首页和 docs 页属于同一系统

## 十五、最终结论

这套基础实现最重要的不是“先磨像不像”。

而是先把下面这条链做成立：

- 内容协议
- 标准化层
- docs tree
- layout protocol
- page protocol
- content components
- styles

一句话总结：

基础层实现要模仿的，是 `fumadocs` 的协议和分层，而不是它的 React 代码。
