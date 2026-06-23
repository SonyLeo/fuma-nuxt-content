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

## 已验证结论

### 1. 不做源码硬搬

- `fumadocs` 和 `assistant-ui` 的 React layout 不能直接复用
- 只能借结构、视觉和组件语义

### 2. 最小链路已跑通

- `content/` -> `queryCollection()` -> `ContentRenderer` 已成立
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
- `app/pages/index.vue` 和 `app/pages/[...slug].vue` 已可渲染
- `PreviewCounter.vue` 已可在 Markdown 中使用
- `pnpm build` 已通过
- `useDocsNavigation.ts`
- `useDocsPage.ts`
- `useDocsToc.ts`
- `app/layouts/docs.vue`
- `DocsHeader.vue`
- `DocsSidebar.vue`
- `DocsPage.vue`
- `DocsToc.vue`
- `DocsPager.vue`
- `tokens.css / shell.css / prose.css`
- `DocCallout.vue`
- `DocCard.vue`
- `DocCardGrid.vue`
- `DocTabs.vue`
- `DocTab.vue`
- `DocSteps.vue`
- `DocCodeBlock.vue`
- `DocPreview.vue`
- 首页最小 hero

## 当前未完成

- 首页 feature cards
- 更细的 hero 视觉
- 移动端 docs 导航
- toc 当前高亮等细节交互
- 内容 collection 语义收口，当前仍使用 `content`

## 当前文档

- `design/implementation-notes.md`
- `design/roadmap.md`
- `design/foundation-roadmap.md`
- `design/product-roadmap.md`
- `design/nuxt-content-mvp-plan.md`
- `design/fumadocs-alignment-plan.md`
