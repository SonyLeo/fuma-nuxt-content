---
title: Foundation Roadmap
sectionLabel: Plan
---

# Foundation Roadmap

## 目标

基础层负责做出一套可长期演进的 Vue 文档系统底座。

它不追求搜索、博客、AI、SEO 这些产品能力。

它只追求：

- 内容结构稳定
- 页面结构稳定
- 组件协议稳定
- 样式层级稳定

## 基础层范围

基础层包含：

- `content.config.ts`
- `content/`
- `app/composables/useDocs*.ts`
- `app/layouts/docs.vue`
- `app/components/docs/*`
- `app/components/content/*`
- `app/assets/css/*`
- `app/pages/index.vue`
- `app/pages/[...slug].vue`

## 基础层设计目标

要对齐的是：

- `fumadocs` 的 `source -> page tree -> layout protocol -> docs component`
- `assistant-ui` 的 docs 壳层节奏

不对齐的是：

- React 实现
- Waku / Next 运行时
- Fumapress 的产品插件层

## Phase 1：内容协议

### 目标

把当前的 `Nuxt Content` 数据，收口成稳定 docs 协议。

### 需要完成的事情

1. 把 `content.config.ts` 的 `collections.content` 改成 `collections.docs`
2. 统一页面 frontmatter 协议
3. 定义 `DocsNode`
4. 统一 docs tree 标准结构
5. 建立内容标准化层
6. 建立目录元信息层
7. 预留 `status / badge / icon / slug` 数据增强通道

### 推荐文件结构

```text
app
├─ composables
│  ├─ useDocsTree.ts
│  ├─ useDocsPage.ts
│  ├─ useDocsBreadcrumbs.ts
│  ├─ useDocsPager.ts
│  └─ useDocsToc.ts
├─ types
│  └─ docs.ts
content
├─ index.md
└─ guide
```

### 参考源码

- `../fumadocs-dev/packages/core/src/source/schema.ts`
- `../fumadocs-dev/packages/core/src/source/page-tree/builder.ts`
- `../fumadocs-dev/packages/core/src/page-tree/definitions.ts`
- `../fumadocs-dev/packages/core/src/source/source.ts`
- `../fumadocs-dev/packages/core/src/source/plugins/slugs.ts`
- `../fumadocs-dev/packages/core/src/source/plugins/status-badges.tsx`
- `../fumapress-dev/apps/docs/content/docs/meta.json`

### 目录元信息层说明

这里的 `meta` 控制层，不一定第一版就必须实现成 `meta.json` 文件系统。

但基础层必须从现在开始预留这层边界。

推荐最小要求：

- 页面 frontmatter 负责页面信息
- section / folder 元信息单独建模
- docs tree 标准化阶段允许接入目录级元信息

后续可以有两种落地方式：

1. `meta.json`
2. 运行时 section meta 映射

无论选哪种，基础层都不能再假设“只有 page frontmatter，没有目录控制层”。

### 数据增强通道说明

这一层也属于基础层。

原因：

- `status`
- `badge`
- `icon`
- `slug`

这些字段会直接影响：

- docs tree
- sidebar item
- route path
- pager
- breadcrumb

所以它们必须在“数据标准化阶段”处理，而不是等到产品层再临时补。

推荐规则：

- `slug`
  - 进入内容路径标准化
- `icon`
  - 进入标准化后的 `DocsNode`
- `badge / status`
  - 进入导航展示元信息

### 当前项目对应改造点

- [content.config.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/content.config.ts)
- [useDocsNavigation.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/composables/useDocsNavigation.ts)
- [useDocsPage.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/composables/useDocsPage.ts)
- [useDocsToc.ts](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/composables/useDocsToc.ts)
- [\[...slug].vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/pages/[...slug].vue)

### 验收标准

- 页面查询统一使用 `docs`
- 所有导航结构统一收敛到 `DocsNode[]`
- docs tree 已预留目录级元信息输入
- `status / badge / icon / slug` 可在标准化层注入
- `sidebar / breadcrumb / pager / homepage cards` 共用同一份 docs tree
- 页面组件不再直接消费原始 `queryCollectionNavigation()` 结果

## Phase 2：布局协议

### 目标

把 docs shell 和 page shell 拆成稳定协议。

### 需要完成的事情

1. 拆 `DocsLayoutShell`
2. `DocsHeader` 改造成 `DocsNavbar`
3. 拆 `DocsSidebarTree`
4. 拆 `DocsSidebarItem`
5. 拆 `DocsPageHeader`
6. 拆 `DocsTitle`
7. 拆 `DocsDescription`
8. 拆 `DocsBody`
9. 拆 `DocsPageFooter`
10. 拆 `DocsBreadcrumb`
11. 补 `DocsMobileNav`

### 推荐文件结构

```text
app/components/docs
├─ layout
│  ├─ DocsLayoutShell.vue
│  ├─ DocsNavbar.vue
│  ├─ DocsSidebar.vue
│  ├─ DocsSidebarTree.vue
│  ├─ DocsSidebarItem.vue
│  ├─ DocsMobileNav.vue
│  ├─ DocsToc.vue
│  ├─ DocsTocList.vue
│  └─ DocsPager.vue
└─ page
   ├─ DocsPage.vue
   ├─ DocsPageHeader.vue
   ├─ DocsTitle.vue
   ├─ DocsDescription.vue
   ├─ DocsBody.vue
   ├─ DocsPageFooter.vue
   └─ DocsBreadcrumb.vue
```

### 参考源码

- `../fumadocs-dev/packages/base-ui/src/layouts/docs/index.tsx`
- `../fumadocs-dev/packages/base-ui/src/layouts/docs/client.tsx`
- `../fumadocs-dev/packages/base-ui/src/layouts/docs/page/index.tsx`
- `../fumadocs-dev/packages/base-ui/src/layouts/docs/page/slots/footer.tsx`
- `../fumadocs-dev/packages/base-ui/src/layouts/docs/slots/sidebar.tsx`
- `../assistant-ui-main/apps/docs/components/docs/layout/docs-root-layout.tsx`

### 当前项目对应改造点

- [docs.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/layouts/docs.vue)
- [DocsHeader.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsHeader.vue)
- [DocsSidebar.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsSidebar.vue)
- [DocsPage.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsPage.vue)
- [DocsPager.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsPager.vue)
- [DocsToc.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/docs/DocsToc.vue)

### 验收标准

- `layout` 和 `page` 彻底分离
- `DocsSidebar` 不再兼管树逻辑
- `DocsPage` 不再兼管所有标题和页尾逻辑
- route 页面只负责组装 props

## Phase 3：内容组件协议

### 目标

把高频文档表达收口成稳定 Vue 组件体系。

### 第一批

- `DocAccordion`
- `DocCallout`
- `DocCard`
- `DocCardGrid`
- `DocTabs`
- `DocTab`
- `DocSteps`
- `DocCodeBlock`
- `DocPreview`

### 第二批

- `DocBanner`
- `DocFiles`
- `DocInlineToc`
- `DocTypeTable`
- `DocGithubInfo`

### 推荐组件协议

- 统一 props：
  - `title`
  - `description`
  - `badge`
  - `tone`
  - `icon`
  - `href`
- 正文统一走 slot
- MDC 标签统一走 kebab-case

### 参考源码

- `../fumadocs-dev/packages/base-ui/src/components/accordion.tsx`
- `../fumadocs-dev/packages/base-ui/src/layouts/shared/page-actions.tsx`

### 当前项目对应改造点

- [app/components/content](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/components/content)

### 验收标准

- 常见文档表达都能走组件
- props 风格统一
- 组件样式全部受 token 控制
- `DocAccordion` 预留文档语义扩展位

### `DocAccordion` 的基础语义要求

`DocAccordion` 不只是折叠样式。

基础层至少要预留：

- `anchor id`
- `copy link` 扩展位
- 打开后可定位能力
- 与 prose 节奏兼容

## Phase 4：首页和入口结构

### 目标

把首页从 demo 页收口成 docs system 入口页。

### 需要完成的事情

1. hero 收口
2. feature cards
3. section entry cards
4. 首页数据从 docs tree 派生

### 推荐组件

- `HomeHero.vue`
- `HomeFeatureCard.vue`
- `HomeSectionGrid.vue`

### 当前项目对应改造点

- [index.vue](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/pages/index.vue)

### 验收标准

- 首页和 docs 页是同一套设计语言
- 首页入口数据不再手写散落

## Phase 5：样式层稳定

### 目标

完成基础层 CSS 分层。

### 需要完成的事情

1. 扩 `tokens.css`
2. 收敛 `shell.css`
3. 收敛 `prose.css`
4. 新增 `content.css`
5. 统一 sidebar / toc / pager / code block 视觉节奏

### 推荐文件结构

```text
app/assets/css
├─ tokens.css
├─ shell.css
├─ prose.css
└─ content.css
```

### 当前项目对应改造点

- [tokens.css](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/assets/css/tokens.css)
- [shell.css](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/assets/css/shell.css)
- [prose.css](E:/LS_WorkSpace/learn/fuma-nuxt-content/app/assets/css/prose.css)

### 验收标准

- 颜色、尺寸、间距全部收敛到 token
- shell / prose / content 职责分离
- 改主题时不需要到处翻组件样式

## 基础层完成标志

基础层完成后，应满足：

- `docs` collection 成立
- docs tree 成立
- page protocol 成立
- sidebar / breadcrumb / pager / toc 共用同一协议
- docs content components 覆盖高频表达
- 首页和 docs 页属于同一系统
- 基础样式层稳定

## 当前阶段建议

当前下一步只建议做：

1. Phase 1：内容协议
2. Phase 2：布局协议

其他都后置。
