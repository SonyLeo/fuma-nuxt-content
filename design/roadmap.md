---
title: Roadmap
sectionLabel: Plan
---

# Roadmap

## 目标

把当前项目拆成两条长期演进路线：

1. 基础层
2. 产品层

基础层负责“文档系统成立”。

产品层负责“文档系统产品化”。

## 文档架构

后续 `design/` 目录建议固定为这 6 份文档：

- `design/roadmap.md`
  - 总路线图
  - 说明基础层 / 产品层边界
  - 说明阶段优先级

- `design/foundation-prep-plan.md`
  - 正式开发前准备阶段
  - 说明 agent 规约、依赖基线、设计语言、token 体系和风格对齐口径
  - 作为进入基础层 Phase 1 前的 gate

- `design/foundation-roadmap.md`
  - 基础层详细演进顺序
  - 参考源码位置
  - 实现顺序
  - 验收标准

- `design/product-roadmap.md`
  - 产品层详细演进顺序
  - 站点能力规划
  - 插件和产品能力规划
  - 验收标准

- `design/fumadocs-alignment-plan.md`
  - 对齐 `fumadocs / assistant-ui / fumapress` 的设计依据
  - 参考源码位置
  - 架构思想和借鉴点

- `design/implementation-notes.md`
  - 只记录最新结论
  - 只记录当前状态
  - 只记录已验证经验

`design/nuxt-content-mvp-plan.md` 是早期 MVP 记录，后续只作为历史参考，不作为当前主动规划入口。

## 边界定义

### 边界依据

这套边界不是凭感觉拆的，而是直接参考两套源码职责：

- `fumadocs`
  - 更偏基础层
  - 重点在 `schema / source / page tree / docs layout / docs page / docs components`
- `fumapress`
  - 更偏产品层
  - 重点在 `config / layouts 封装 / plugins / site capability`

对应参考源码：

- `../fumadocs-dev/packages/core/src/source/schema.ts`
- `../fumadocs-dev/packages/core/src/source/source.ts`
- `../fumadocs-dev/packages/core/src/source/page-tree/builder.ts`
- `../fumadocs-dev/packages/base-ui/src/layouts/docs/index.tsx`
- `../fumapress-dev/packages/core/src/config.ts`
- `../fumapress-dev/packages/core/src/layouts/docs.tsx`

### 基础层边界

基础层只负责这些事情：

- 内容协议
- 内容标准化
- docs tree
- docs tree 元信息
- layout protocol
- page protocol
- 文档内容组件
- 样式 token / shell / prose
- route 装配规则
- 首页和 docs 页基本骨架

这些能力在 `fumadocs` 中更接近基础能力：

- `pageSchema / metaSchema`
- source 标准化
- page tree 构建
- `DocsLayout`
- `DocsPage`
- `Accordion / Tabs / Callout` 这类 docs components

一句话：

- 基础层解决“文档站怎么成立”

### 产品层边界

产品层只负责这些事情：

- site config
- 多内容源
- blog / changelog / api
- 搜索
- page actions
- feedback
- llms / mcp
- sitemap / rss / seo
- image pipeline
- story / playground
- i18n / versioning
- 部署与生成策略

这些能力在 `fumapress` 中更接近产品能力：

- `defineConfig()`
- layouts 二次封装
- docs page actions
- search plugins
- site metadata
- 多 source / i18n / build mode

一句话：

- 产品层解决“文档站怎么变成完整产品”

### 灰度边界

下面这些能力最容易混层，统一按这套规则处理：

- `meta`
  - 属于基础层
  - 因为它直接影响 docs tree、sidebar、pager、breadcrumb
- `status / badge / icon / slug`
  - 属于基础层
  - 因为它们属于内容标准化结果，不应等产品层临时补
- `page actions`
  - 属于产品层
  - 因为它是页面增强动作，不改变 page protocol
- `search`
  - 属于产品层
  - 因为它应通过插件或索引接入，不反向改 docs tree
- `story / playground`
  - 属于产品层
  - 因为它是文档消费体验增强，不是文档系统成立的必要条件
- `blog / changelog / api`
  - 属于产品层
  - 因为它们是多内容源扩展，不是 docs 基础协议本身
- `i18n / versioning`
  - 当前按产品层处理
  - 因为它们会扩大内容组织和路由策略，但不应先污染基础层结构

### 分层判断规则

后续遇到新能力，统一按下面规则判断归属：

1. 会不会改变 `DocsNode`、docs tree 或 frontmatter 协议
2. 会不会改变 layout / page protocol
3. 是不是 docs 页面成立所必需
4. 能不能通过 config / plugin / slot / adapter 接入

判定原则：

- 满足 `1 / 2 / 3` 的，优先归基础层
- 主要满足 `4` 的，归产品层

## 总体演进顺序

推荐顺序固定为：

### Stage 0：基础建设和设计语言收口

- 项目级 `AGENTS.md`
- 依赖和脚本基线
- token 层级
- CSS 分层基线，包含 `content.css`
- 风格对齐口径
- 正式开发前检查清单

### Stage 1：基础层协议收口

- `docs` collection
- frontmatter 协议
- `DocsNode`
- docs tree
- meta 控制层
- `layout / page` 分层

### Stage 2：基础层数据增强与组件补齐

- `status badge / icon / slug` 数据增强
- sidebar tree
- page primitives
- `DocAccordion / DocFiles / DocTypeTable`
- 首页 section entry

### Stage 3：基础层视觉稳定

- token 扩展
- `content.css` 状态矩阵和细节收口
- mobile nav
- toc 高亮
- pager / footer 收口

### Stage 4：产品层起步

- site config
- page actions
- GitHub source link
- Copy Markdown
- blog / changelog 预留

### Stage 5：产品层增强

- search
- feedback
- sitemap / rss
- llms / mcp
- image pipeline

### Stage 6：产品层高级能力

- story / playground
- 多版本
- 国际化
- API schema / OpenAPI / 自动 type table

## 为什么这样划分

这个划分的核心好处是：

- 基础层可以先稳定协议
- 产品层不会反向污染基础结构
- 后续新增能力时，不会把组件层反复打散

## 当前建议

当前只做一件事：

- 先按 `foundation-prep-plan.md` 完成 Stage 0

产品层 roadmap 现在先规划，不先实现。
