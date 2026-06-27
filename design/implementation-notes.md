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
- docs frontmatter 已开始支持 `sectionLabel / order / hidden / badge`

## 当前未完成

- 首页 feature cards
- 更细的 hero 视觉
- 移动端 docs 导航
- toc 当前高亮等细节交互
- `meta.json` 风格的目录控制层
- 更完整的 `DocsNode` 状态、图标和分组协议

## 当前文档

- `design/implementation-notes.md`
- `design/roadmap.md`
- `design/foundation-prep-plan.md`
- `design/foundation-roadmap.md`
- `design/product-roadmap.md`
- `design/nuxt-content-mvp-plan.md`
- `design/fumadocs-alignment-plan.md`
