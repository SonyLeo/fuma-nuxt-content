---
title: Nuxt Content MVP Plan
sectionLabel: Archive
---

# Nuxt Content MVP Plan

> Status: historical MVP record. Current foundation execution is governed by
> `foundation-alignment-matrix.md`.

## 目标

用 `Nuxt + @nuxt/content` 做一套可继续演进的 Vue 文档站骨架：

- Markdown 中直接渲染 `Vue` 组件
- docs shell 自己控制
- 视觉和结构对齐 `fumadocs / assistant-ui`

## MVP 范围

1. content query
2. docs shell
3. `tokens.css / shell.css / prose.css`
4. 6 个核心 docs components
5. 首页与标准文档页闭环

不做：

- 搜索
- 多版本
- 国际化
- 自动 API 文档

## 目录

```text
fuma-nuxt-content
├─ app
│  ├─ app.vue
│  ├─ layouts
│  │  └─ docs.vue
│  ├─ pages
│  │  ├─ index.vue
│  │  └─ [...slug].vue
│  ├─ components
│  │  ├─ docs
│  │  │  ├─ DocsHeader.vue
│  │  │  ├─ DocsSidebar.vue
│  │  │  ├─ DocsToc.vue
│  │  │  ├─ DocsPage.vue
│  │  │  └─ DocsPager.vue
│  │  └─ content
│  │     ├─ DocCallout.vue
│  │     ├─ DocCard.vue
│  │     ├─ DocCardGrid.vue
│  │     ├─ DocTabs.vue
│  │     ├─ DocTab.vue
│  │     ├─ DocSteps.vue
│  │     ├─ DocCodeBlock.vue
│  │     ├─ DocPreview.vue
│  │     └─ PreviewCounter.vue
│  ├─ composables
│  │  ├─ useDocsNavigation.ts
│  │  ├─ useDocsPage.ts
│  │  └─ useDocsToc.ts
│  └─ assets
│     └─ css
│        ├─ tokens.css
│        ├─ shell.css
│        └─ prose.css
├─ content
│  ├─ index.md
│  └─ guide
│     ├─ getting-started.md
│     ├─ components.md
│     └─ theme-language.md
├─ content.config.ts
├─ nuxt.config.ts
└─ package.json
```

## 页面和数据

- `app/pages/index.vue` 负责首页内容和 hero
- `app/pages/[...slug].vue` 负责页面查询和组装
- `app/layouts/docs.vue` 负责三栏 docs shell
- `queryCollectionNavigation()` 提供 sidebar 数据
- `page.body.toc.links` 提供 toc 数据
- section 内导航负责 pager

## 实现顺序

1. 跑通 `ContentRenderer`
2. 跑通 `queryCollectionNavigation()`
3. 搭 `DocsHeader + DocsSidebar + DocsPage`
4. 接 `DocsToc + DocsPager`
5. 接样式分层
6. 迁移内容组件
7. 做首页
8. 构建验证

## 验收标准

- Markdown 能正常渲染
- Markdown 中能直接使用 `Vue` 组件
- sidebar 来自 content navigation
- 文档页有自定义 `header / sidebar / toc / pager`
- 首页和文档页属于同一套设计系统
