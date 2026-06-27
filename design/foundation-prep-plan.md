---
title: Foundation Prep Plan
sectionLabel: Plan
---

# Foundation Prep Plan

## 定位

这份文档是正式进入基础层开发前的准备计划。

它解决的是：

- agent 协作规约是否清楚
- 依赖和脚本底座是否稳定
- 设计语言和 token 体系是否收口
- 风格参考和取舍是否明确
- 开发前验收口径是否统一

它不解决：

- docs tree 具体实现
- layout/page 组件拆分
- TinyRobot 组件 demo 接入
- 搜索、AI、page actions 等产品层能力

## 当前结论

当前阶段先不使用 TinyRobot monorepo 作为架构参考。

TinyRobot monorepo 后续只作为：

- 组件 API 内容来源
- demo 内容来源
- 产品状态效果验证来源
- 真实使用场景素材

当前基础准备阶段只关注：

- Fumadocs 的协议和分层
- assistant-ui 的 docs shell 节奏
- 旧 tiny-robot-docs-ui 的 Vue 组件经验和失败教训

## Stage 0 目标

在进入 `foundation-roadmap.md` 的 Phase 1 前，先完成下面几件事：

1. 建立项目级 `AGENTS.md`
2. 明确设计文档的 source of truth
3. 定义依赖和脚本基线
4. 定义设计语言和 token 层级
5. 定义风格对齐口径
6. 定义正式开发前检查清单

## 参考取舍

### Fumadocs

借：

- `source -> page tree -> layout protocol -> page protocol`
- `meta.json` 目录控制思想
- sidebar/page/toc/content component primitives
- CSS variable 驱动的布局协议

不借：

- React 组件实现
- Next runtime 约束
- 具体 Tailwind class 组织

### assistant-ui

借：

- docs shell 的密度和节奏
- 固定 header、固定 sidebar、右侧 TOC 的布局关系
- page title 旁边预留 pager/actions 的思路
- TOC 区承载页面操作的产品层扩展位
- 数据驱动 API/props table 的思路

暂不借：

- AI assistant panel
- platform switcher
- analytics
- search dialog
- markdown copy / edit actions 的具体实现
- heavy product-layer dependencies

### tiny-robot-docs-ui

借：

- Vue 内容组件实现经验
- CSS 分层经验
- 项目级 agent 规约经验
- 从 screenshot-first 转向 primitive-first 的结论

不借：

- VitePress adapter
- VitePress private APIs
- 基于 `VPSidebar` / outline 的宿主模型

## 依赖和脚本基线

当前核心运行时依赖保持很薄：

- `nuxt`
- `@nuxt/content`
- `vue`
- `vue-router`

本阶段已经补齐质量工具、图标资产和 Tailwind CSS v4 Vite 接入。后续原则是继续保持 foundation 依赖克制，只在交互复杂度真实出现时再引入 headless primitives 或 composable 库。

### 联网核对记录

核对时间：2026-06-27。

通过 npm registry 和官方文档索引核对到：

- `tailwindcss` latest: `4.3.1`
- `@tailwindcss/vite` latest: `4.3.1`
- `@tailwindcss/postcss` latest: `4.3.1`
- `@nuxtjs/tailwindcss` latest: `6.14.0`
  - 依赖 `tailwindcss ~3.4.17`
  - 不适合作为 Tailwind v4 路线的默认入口
- `unocss` / `@unocss/nuxt` latest: `66.7.3`
- `@nuxt/ui` latest: `4.9.0`
  - 依赖面很宽，包含 Tailwind v4、Reka UI、VueUse、TipTap、tables、virtual 等
- `@nuxt/eslint` latest: `1.16.0`
- `vue-tsc` latest: `3.3.5`
- `typescript` latest: `6.0.3`
- `prettier` latest: `3.8.5`
- `lucide-vue-next` latest: `1.0.0`
  - 已 deprecated，实际安装时改用 `@lucide/vue`
- `@lucide/vue` latest: `1.21.0`
- `reka-ui` latest: `2.10.1`
- `shadcn-vue` latest: `2.7.4`
- `@vueuse/nuxt` latest: `14.3.0`

官方文档要点：

- Tailwind CSS v4 支持 CSS-first 配置，使用 `@theme` 定义设计 token，并将 theme values 暴露为 CSS custom properties。
- Tailwind CSS v4 官方 Vite 接入使用 `@tailwindcss/vite`。
- Nuxt 4 官方推荐使用 `@nuxt/eslint` 生成 project-aware ESLint 配置。
- UnoCSS 的 Nuxt 集成很直接，但 token、shortcuts、presets 会转移到 `uno.config.ts`。

### 包管理

- 统一 pnpm
- README 和 AGENTS 中不再鼓励 npm/yarn/bun 多套命令

### 质量脚本

第一批已新增：

- `typecheck`
- `lint`
- `lint:fix`
- `format`
- `format:check`

已安装依赖：

- `typescript`
- `vue-tsc`
- `eslint`
- `@nuxt/eslint`
- `prettier`

当前脚本形态：

```json
{
  "typecheck": "nuxi typecheck",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier . --write",
  "format:check": "prettier . --check"
}
```

注意：

- 不要只改 `package.json` 而不更新 lockfile。
- 这组依赖已和 lockfile 同步。
- 已新增 ESLint flat config，并通过 `@nuxt/eslint` 模块接入 Nuxt。
- `nuxi typecheck` 已在当前 Nuxt 4 / Content 环境下验证可运行。

### 图标

候选：

- `@lucide/vue`

使用时机：

- layout/page primitives 开始需要稳定 icon button 时再引入

结论：

- 已在第一批引入。
- 它和 Fumadocs / assistant-ui 的 icon 使用习惯一致。
- 它不改变设计系统架构，只提供图标资产。

### Headless primitives

候选：

- `reka-ui`

使用时机：

- 需要稳定 accessible tabs、accordion、popover、dialog、drawer 时再引入

结论：

- 当前不作为第一批基础依赖。
- `DocTabs`、`DocAccordion` 第一版可以先用 Vue 自身状态实现。
- 如果后续要做 command menu、popover、dialog、mobile drawer，再按组件需要引入。

### VueUse

候选：

- `@vueuse/nuxt`

使用时机：

- 重复出现 media query、scroll lock、event listener、local storage、intersection observer 等组合逻辑时再引入

结论：

- 当前不作为第一批基础依赖。
- 可以在 TOC active、mobile drawer、theme persistence 等交互开始前再评估。

### 样式工具

需要单独决策，不应把 “CSS 框架” 和 “UI 组件库” 混在一起。

#### Tailwind CSS v4

结论：已作为 foundation 基础样式工具引入，但只承担 utility 和 token 编译层职责。

推荐理由：

- v4 的 `@theme` 是 CSS-first，和当前 token 体系方向一致。
- theme values 会暴露为 CSS custom properties，适合主题化。
- Fumadocs / assistant-ui 生态都更接近 Tailwind + CSS variables 的组合。
- 可以只把 Tailwind 当 utility compiler，不必放弃 `tokens.css / shell.css / prose.css / content.css` 分层。
- 对后续 docs primitives 开发效率帮助最大。

当前引入方式：

- 使用 `tailwindcss` + `@tailwindcss/vite` 路线。
- 不使用 `@nuxtjs/tailwindcss` v6 作为默认入口，因为它当前依赖 Tailwind v3。
- 已通过 `app/assets/css/tailwind.css` 做最小 `@theme` token 桥接。
- 当前选择 Vite plugin，避免引入 PostCSS 配置面；后续只有在构建链需要时再评估 PostCSS plugin。

使用边界：

- `tokens.css` 仍是设计语言源头。
- Tailwind `@theme` 应桥接项目 token，而不是另建一套无关 token。
- 文档 prose 和 complex shell layout 仍允许写语义 CSS。
- 不允许在组件中散落任意颜色、任意阴影和任意圆角。

#### UnoCSS

结论：暂不推荐作为默认路线。

优点：

- Nuxt 模块接入直接。
- 原子 CSS 很快，配置能力强。
- shortcuts/blocklist 可以约束设计系统。

不选作默认的原因：

- Fumadocs / assistant-ui 的参考生态更偏 Tailwind。
- UnoCSS 的配置中心会变成 `uno.config.ts`，当前项目的目标是先让 CSS token 体系清晰。
- 团队/agent 后续更容易借鉴 Tailwind 语义和生态资料。

#### Nuxt UI

结论：不作为 foundation 依赖。

原因：

- 依赖面太大。
- 组件和主题系统有较强产品判断。
- 容易把我们从 “Fumadocs-aligned docs system” 带向 “Nuxt UI app”。
- 当前只需要 docs primitives，不需要完整 app UI library。

#### shadcn-vue

结论：暂不引入 CLI/registry。

可借：

- 组件拆法
- Reka UI 组合方式
- class/token 组织习惯

暂不引入的原因：

- 会默认带入 Tailwind、registry、组件复制流。
- 当前还没有确定哪些 headless primitives 必须使用。
- foundation 阶段更需要稳定协议，不需要组件仓库膨胀。

#### 纯 CSS tokens

结论：继续保留为基础层核心。

优点：

- 最可控。
- 最适合先定义设计语言。
- 不依赖任何工具链迁移。

限制：

- 后续组件开发效率较低。
- hover/focus/responsive 状态会重复写较多 CSS。
- 需要更强的命名纪律。

最终建议：

1. 继续以纯 CSS tokens 作为设计语言源头，完成 token 命名和分层。
2. 已引入 Tailwind CSS v4 作为 utility 和 `@theme` 编译层。
3. 不引入 `@nuxtjs/tailwindcss` v6、Nuxt UI、shadcn-vue、UnoCSS 作为第一批 foundation 依赖。

### 推荐依赖分批

#### Batch 1：质量和开发体验

- `typescript`
- `vue-tsc`
- `eslint`
- `@nuxt/eslint`
- `prettier`

状态：

- 已完成，建立 `typecheck / lint / format` 基线。

#### Batch 2：轻量运行时基础

- `@lucide/vue`

状态：

- 已完成，给 navbar、sidebar、page actions、callout 等组件预留统一 icon 资产。

#### Batch 3：样式工具接入

- `tailwindcss`
- `@tailwindcss/vite`

状态：

- 已完成，Tailwind v4 CSS-first token 与 Nuxt 4 当前项目可稳定共存。
- 已用 `@theme` 桥接 `--docs-*` tokens。

#### Batch 4：按需交互 primitives

- `reka-ui`
- `@vueuse/nuxt`

目标：

- 只在 popover、dialog、drawer、advanced tabs、TOC active 等交互复杂度出现后引入。

## CSS 框架最终结论

推荐路线：

- Foundation 设计语言源头：纯 CSS tokens。
- Foundation 开发效率工具：Tailwind CSS v4。
- Tailwind 接入方式：CSS-first `@theme`，通过 Vite/PostCSS 直接接入。
- 不使用：`@nuxtjs/tailwindcss` v6、Nuxt UI、shadcn-vue、UnoCSS 作为默认基础依赖。

核心理由：

- Tailwind v4 的 `@theme` 和 CSS custom properties 与我们的 token/主题化方向最吻合。
- Tailwind 的生态和 Fumadocs/assistant-ui 参考源码更接近。
- 保留 `tokens.css` 作为源头，可以避免被 utility class 反向绑架。
- 不引入 Nuxt UI/shadcn-vue，可以避免过早承担产品组件库和 registry 复杂度。

## 设计语言

目标风格：

- Fumadocs 的结构秩序
- assistant-ui 的安静密度
- TinyRobot 的轻量品牌点缀

关键词：

- article-first
- quiet
- dense
- precise
- neutral with accent
- component-system oriented

避免：

- landing-page hero 化 docs 页面
- 大面积单一暖色或单一蓝紫色
- 卡片堆叠式文档页
- 大圆角和大阴影到处出现
- 在 foundation 阶段加入产品化装饰

## Token 层级

建议将 token 分三层。

### Primitive tokens

只表达基础值：

- color palette
- spacing scale
- radius scale
- shadow scale
- typography scale
- motion duration/easing

示例：

```css
--docs-gray-1
--docs-gray-2
--docs-accent-9
--docs-space-4
--docs-radius-md
```

### Semantic tokens

表达使用语义：

```css
--docs-color-background
--docs-color-foreground
--docs-color-muted
--docs-color-muted-foreground
--docs-color-border
--docs-color-primary
--docs-color-accent
--docs-color-ring
--docs-color-code-bg
```

### Component tokens

表达组件协议：

```css
--docs-header-height
--docs-sidebar-width
--docs-toc-width
--docs-page-width
--docs-shell-gap
--docs-link-active-bg
--docs-callout-info
--docs-code-radius
```

规则：

- 组件优先吃 semantic/component tokens
- primitive tokens 不直接散落到组件里
- 暗色主题优先覆盖 semantic tokens
- product-layer token 以后单独扩展，不污染 foundation tokens

## CSS 分层

推荐最终结构：

```text
app/assets/css
├─ tokens.css
├─ shell.css
├─ prose.css
└─ content.css
```

职责：

- `tokens.css`：变量和主题
- `shell.css`：docs shell、navbar、sidebar、TOC、pager、mobile nav
- `prose.css`：Markdown 正文排版
- `content.css`：文档内容组件，如 callout、tabs、cards、steps、accordion

正式开发前先不要把内容组件样式继续塞进 `prose.css` 或 `shell.css`。

## 风格对齐口径

第一轮对齐不追求像素级一致。

先对齐：

- header 高度和密度
- sidebar 宽度和 active 状态
- article 最大宽度和标题层级
- TOC 宽度、sticky top、文字密度
- code block / inline code 节奏
- callout / tabs / card / pager 的 surface 规则
- mobile 下 sidebar/TOC 的收起策略

后续再对齐：

- page actions
- copy markdown
- edit link
- search trigger
- AI panel/right extension

## 开发前检查清单

进入 `foundation-roadmap.md` Phase 1 前，应确认：

- [x] `AGENTS.md` 已存在并说明当前边界
- [x] `design/roadmap.md` 已包含 Stage 0
- [x] `design/foundation-prep-plan.md` 已成为准备阶段入口
- [x] token 层级和 CSS 分层已明确
- [x] 依赖和脚本基线已明确
- [x] 基础质量工具和脚本已落地
- [x] Tailwind CSS v4 已作为 token bridge / utility compiler 接入
- [x] `tokens.css` 已按 primitive / semantic / component 三层初步实物化
- [x] `content.css` 已接管 docs 内容组件基础样式
- [x] TinyRobot monorepo 已明确后置
- [x] 不引入 VitePress adapter 的原则已写入规约
- [x] 视觉验收口径已明确

## Stage 0 交付物

最小交付物：

- `AGENTS.md`
- `design/foundation-prep-plan.md`
- `design/roadmap.md` 中的 Stage 0
- `design/implementation-notes.md` 中的当前状态记录
- `README.md` 中的项目定位和 pnpm 命令收口
- lint/typecheck/format 基线
- Tailwind CSS v4 `@theme` token bridge
- `tokens.css` 三层 token 基线
- `content.css` 内容组件样式层

可后续补充：

- 暗色主题 token 覆盖策略
- 内容组件状态矩阵和视觉回归截图

## 进入 Phase 1 的条件

满足以下条件后，再开始内容协议开发：

1. 项目协作规则清楚
2. 设计语言和 token 分层清楚
3. 依赖和脚本策略清楚
4. 基础质量脚本可运行
5. token 和 CSS 分层已有可执行基线
6. 上层产品能力明确后置
7. 参考源码的借鉴边界明确

结论：

先把 Stage 0 做稳，再开始 `docs` collection、`DocsNode[]` 和 docs tree。
