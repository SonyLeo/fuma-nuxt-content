---
title: Foundation Alignment Matrix
sectionLabel: Plan
---

# Foundation Alignment Matrix

## 定位

这份文档是当前 foundation hardening 的主动执行入口。

它和现有文档的分工如下：

- `design/foundation-roadmap.md`
  - 负责给出基础层的大阶段、边界和验收方向。
- `design/fumadocs-gap-audit.md`
  - 负责做周期性差异审计和排期建议。
- `design/foundation-alignment-matrix.md`
  - 负责把“当前基础层到底差在哪里、先补什么、按什么对照、什么算过关”拆成可执行矩阵。

它不是另一份 roadmap，也不是历史分析档案。

## 目标

在继续推进 integration P1、multi-source baseline 和 site product
composition 之前，先把 foundation 差异收口到一个更稳定的标准。

这里要解决的不是“还缺几个组件”，而是下面四件事：

1. 当前 foundation 哪些部分已经达到 `First Pass`，哪些还只是局部成立。
2. Fumadocs 真正作为参考的协议面有哪些，而不是只看视觉表象。
3. 哪些差异必须在 foundation exit gate 前补齐，哪些应该明确后移。
4. 每一个基础面要按什么证据、什么 fixture、什么验证路径来认定“对齐完成”。

## 当前判断

基于当前本地实现、规划文档和 Fumadocs 本地源码，我对项目现状的判断是：

- 当前整体成熟度更接近 `L2-`。
- foundation baseline 已经成立，不再是从 `0 -> 1`。
- 主要差异不在“有没有左侧栏、TOC、CodeBlock 这些表面功能”，而在：
  - 协议宽度还不够硬
  - 一些 contract 仍然是 first pass，而不是 gate-passed
  - Markdown transform 和 source/runtime boundary 仍明显窄于 Fumadocs
  - foundation 与 integration 的交界面还没有完全冻结

简化成一句话：

- 当前更大的问题不是“缺一个 UI”，而是“已经有不少实现，但还没有被整理成稳定可依赖的 foundation contract”。

## 证据基线

Fumadocs 侧关键证据：

- `D:\Projects\Learning\gh\fumadocs\packages\core\src\page-tree\definitions.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\page-tree\builder.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\mdx-plugins\index.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\provider\base.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\mdx.tsx`

本地关键证据：

- `content.config.ts`
- `mdc.config.ts`
- `app/types/docs.ts`
- `app/types/docs-site.ts`
- `app/utils/docs-navigation.ts`
- `app/utils/docs-page-tree-runtime.ts`
- `app/utils/docs-markdown-pipeline.ts`
- `app/components/docs/*`
- `app/components/content/*`
- `design/foundation-roadmap.md`
- `design/fumadocs-gap-audit.md`
- `design/fumadocs-component-parity-inventory.md`
- `design/theme-runtime-parity-plan.md`
- `design/layout-provider-parity-plan.md`

## 状态词

后续这份矩阵和相关 foundation 文档统一使用四级状态：

- `Draft`
  - 只有设计意图，或者只有局部实现，没有稳定验证。
- `First Pass`
  - 有实现、有 focused checks，但仍可能缺 protocol 明确性、边界冻结或 fixture 覆盖。
- `Gate Passed`
  - 已满足进入下一层的最小条件，当前层可安全作为后续默认依赖。
- `Product Ready`
  - 已达到站点产品层可以直接长期消费的成熟度。

当前很多 surface 实际只到 `First Pass`，不应直接按 “已完成” 处理。

## 工作方法

本轮基础层对齐统一遵守这几个方法：

1. 先对齐协议，再对齐视觉。
2. 先对齐 source/tree/layout/page/transform 的结构真相，再谈 product 扩展。
3. 一个基础面要过关，必须同时具备：
   - 参考证据
   - 本地 owner 文件
   - 当前状态判断
   - 明确的差异清单
   - 对应 fixture
   - 对应验证命令
4. defer 不是“以后再说”，必须写清楚为什么不放进 foundation exit gate。
5. 任何 integration 或 product 能力如果反过来要求补基础协议，必须先回到 foundation。

## Foundation 总览

| 基础面                                     | 当前判断               | 进入 Foundation Exit Gate 前是否必须收口 | 备注                                                                       |
| ------------------------------------------ | ---------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| 内容源与页面元数据                         | `First Pass`           | 是                                       | 协议已成立，但 fixture 和 source identity 还不够硬                         |
| Page tree builder / runtime                | `First Pass`           | 是                                       | 当前是强项，但 root/fallback、registry、multi-source 前置边界仍需冻结      |
| Root provider / layout slots / theme shell | `First Pass`           | 是                                       | 第一轮已做出，但 provider boundary 还需进一步标准化                        |
| Layout / page protocol                     | `First Pass+`          | 是                                       | 结构已成型，要继续固化 slot ownership 和 page contract                     |
| Default MDC mapping / link protocol        | `First Pass+`          | 是                                       | 常见面已覆盖，但 mapping inventory 和 generic prose contract 还需补齐      |
| Markdown transform pipeline                | `Draft -> First Pass-` | 是                                       | 这是当前最明显的基础差异之一                                               |
| Code system / preview                      | `First Pass+`          | 是                                       | UI 壳较强，但 authoring transform 仍不完整                                 |
| Docs content components                    | `First Pass+`          | 是                                       | 组件面已广，但 foundation 与 product backlog 的边界还要继续收硬            |
| Site config / foundation adapter boundary  | `First Pass`           | 部分                                     | Foundation 需要冻结 adapter 边界，但 remote provider 等属于 integration P1 |
| Verification / maturity gate               | `Draft -> First Pass`  | 是                                       | 这是把“做出来”变成“可依赖”的关键收口面                                     |
| Multi-source baseline 前置约束             | `Draft`                | 否                                       | 不属于当前 foundation exit，但必须在进入 blog/changelog/API 前完成         |

## 详细对照矩阵

### 1. 内容源与页面元数据

参考：

- Fumadocs `schema.ts`、`builder.ts`
- 本地 `content.config.ts`、`app/types/docs.ts`

本地现状：

- 已拆分 `docs` 与 `docsMeta` 两个 collection。
- 已有 `DocsPageMeta`、`DocsDirectoryMeta`、`DocsMetaPageEntry`。
- 已区分 `path`、`sourcePath`、`stem`、`slug`。
- `meta.json` 已支持 `separator / link / page / group / pagesIndex`。

当前判断：

- `First Pass`

详细对照点：

- `[已对齐到 First Pass]` 页面 frontmatter 与目录元信息已经分层，不再把目录控制混进 page frontmatter。
- `[已对齐到 First Pass]` `sourcePath` 与 `route path` 已经分离，`slug` 不再等同于源文件路径。
- `[已对齐到 First Pass]` `sourcePath` 现在保留真实 stem 的尾部 `index`；默认 route transform 才负责把 `/index` 和 `/dir/index` 折叠为 `/` 和 `/dir`。嵌套 index 页的源码读取、GitHub source/edit 和相对链接不再依赖路由身份猜文件。
- `[已对齐到 First Pass]` `meta.json` 的控制语法已经覆盖 separator、external/internal link、virtual group、pagesIndex。
- `[仍需收口]` 当前仍是单一 `docs` source，尚未形成将来可扩到 `blog / changelog / api` 的 source identity 说明。
- `[仍需收口]` 当前没有 Fumadocs builder 那种显式 `idPrefix`、locale-aware identity、storage ownership 约束。
- `[已对齐到 First Pass]` 协议测试已覆盖根/嵌套 index、中文与空格 slug、绝对 slug、重复 route path 冲突，并使用稳定 source identity 输出冲突来源。
- `[部分对齐]` `DocsPageIdentity` 已成为 content/source/route identity 的显式类型和解析入口；其中 `contentPath` 保留 Nuxt Content 查询键，`sourcePath` 表示源文件归属，`routePath` 表示最终路由。multi-source 引入前仍需补 locale、storage owner 和 `idPrefix` 维度。

本阶段行动：

1. 写清 source identity contract：
   - `sourcePath` 是内容查询与源文件归属 key
   - `path` 是 route consumption key
   - `stem` 只作为内容系统原始标识，不直接给 UI 消费
   - `slug` 只作为 route transform input，不作为 source identity
2. 增加 fixture 覆盖：
   - 中文路径
   - 空格路径
   - 同目录重复 slug
   - `meta.json` 中 root/pagesIndex/link/separator/virtual group 组合
3. 把 multi-source 前置假设单独列出来，避免后面把 foundation 的 `docs` 单源假设悄悄扩散到产品层。

Exit proof：

- 静态：`content.config.ts`、`app/types/docs.ts`、`app/utils/docs-navigation.ts` contract review
- focused checks：route/source fixture coverage
- regression：`page-tree-runtime` 和 link validation 不因 source identity 变化退化

### 2. Page Tree Builder / Runtime

参考：

- Fumadocs `page-tree/definitions.ts`
- Fumadocs `source/page-tree/builder.ts`
- 本地 `app/utils/docs-navigation.ts`
- 本地 `app/utils/docs-page-tree-runtime.ts`

本地现状：

- 已有 `DocsNode` 的 `page / group / separator / link` 四类节点。
- 已有 `visibleTree` 和 `contextTree` 双树。
- 已有 `page / group / separator / link / node / root` transformer contract。
- sidebar、breadcrumb、pager、homepage cards、search index 已统一消费同一套 tree/runtime。

当前判断：

- `First Pass`

详细对照点：

- `[已对齐到 First Pass]` page/group/separator/link 的基础语义已经成立。
- `[已对齐到 First Pass]` `root/defaultOpen/collapsible/index/pagesIndex` 等目录语义已有本地实现。
- `[已对齐到 First Pass]` `visibleTree` / `contextTree` 已覆盖“可见导航”和“可直达但被排除页面”的双树需求。
- `[已对齐到 First Pass]` source identity lookup 由 context tree 建表，隐藏或被排除页面不会进入 visible sidebar/pager，但仍可通过 source identity 找回页面上下文。
- `[部分对齐]` Fumadocs 的 `Root` + `fallback` 是一个明确协议；本地当前是双树 runtime，但没有把 “fallback semantics” 以单独 contract 写清楚。
- `[部分对齐]` Fumadocs builder 有 owner/priority/`$ref` 语义；本地当前更偏 route-consumption runtime，缺少这层显式 owner 说明。
- `[部分对齐]` 本地已有 transformer API，但还没有 site-level plugin registry 或 config-driven transformer registration。
- `[缺口]` locale-aware tree、storages、多 source builder 输入还没建立。
- `[缺口]` 需要区分：哪些 page-tree 能力是 foundation exit gate 必须项，哪些属于 multi-source 前置项。

本阶段行动：

1. 写一张 page-tree contract card：
   - `visibleTree`
   - `contextTree`
   - `getCurrent() / getVisibleCurrent()`
   - `getSidebarItems()`
   - `getBreadcrumbs()`
   - `getPager()`
   - `getFallbackPath()`
2. 明确本地双树和 Fumadocs `fallback` 的映射关系，避免后面又误把 excluded page 视为普通 visible node。
3. 冻结 transformer boundary：
   - foundation 内只允许 runtime-level transformer
   - site-level registry 留到 multi-source 前
4. 补 page-tree fixture matrix：
   - root section
   - pagesIndex
   - virtual group
   - excluded page
   - external link
   - separator in breadcrumb policy

Exit proof：

- `tests/e2e/page-tree-runtime.spec.ts`
- focused sidebar / pager / page-actions 回归
- 目录控制与 breadcrumb/pager/search 共用 tree 的一致性检查

### 3. Root Provider / Shared Layout Slots / Theme Shell

参考：

- Fumadocs `provider/base.tsx`
- Fumadocs `layouts/shared/*`
- 本地 `DocsRootProvider.vue`
- 本地 `useDocsLayoutSlots.ts`
- 本地 `useDocsRootProvider.ts`
- 本地 `useDocsTheme.ts`
- 本地 `theme-runtime-parity-plan.md`
- 本地 `layout-provider-parity-plan.md`

本地现状：

- `DocsRootProvider`、`useDocsRootProvider()`、`useDocsLayoutSlots()` 已存在。
- theme runtime、theme switch、layout slots、sidebar state、home layout、not-found 已完成 first pass。
- banner 仍明确保持为 slot + height token，不进入完整 foundation 组件实现。

当前判断：

- `First Pass`

详细对照点：

- `[已对齐到 First Pass]` `dir / theme / search / language` 已有 provider shell 和默认 slot 边界。
- `[已对齐到 First Pass]` `theme-switch / search-trigger / language-select` replacement slot 已存在。
- `[已对齐到 First Pass]` Home layout 和 not-found 已成为 layout surface，而不是页面拼装残余。
- `[部分对齐]` Fumadocs `RootProvider` 的 i18n/search/theme boundary 更完整；本地当前更偏 foundation shell，而不是完整 provider hierarchy。
- `[部分对齐]` 当前 layout/provider 已能工作，但 provider props、injection key、默认 slot owner 的文档化程度还不足。
- `[明确 defer]` Banner 先维持 slot + token，不做 dismiss/persistence。
- `[明确 defer]` Notebook / Flux 只保留 decision card，不进入当前 foundation exit。

本阶段行动：

1. 把 provider contract 从“实现存在”提升成“协议冻结”：
   - provider props shape
   - injection keys
   - default slot ownership
   - site config adapter input shape
2. 确认 layout 组件不直接消费产品 config，而是只消费 foundation props/composables。
3. 把 theme/search/language 的默认行为、替换行为和禁用行为写成 compact matrix。

Exit proof：

- `layout-provider`、`theme` focused profiles
- `docs-shell` / `fast-regression` 回归
- `git diff --check`

### 4. Layout / Page Protocol

参考：

- Fumadocs `layouts/docs/index.tsx`
- Fumadocs `layouts/docs/page/index.tsx`
- 本地 `app/layouts/docs.vue`
- 本地 `app/pages/[...slug].vue`
- 本地 `app/components/docs/*`

本地现状：

- `DocsLayoutShell`、`DocsPage`、`DocsPageHeader`、`DocsBody`、`DocsPageFooter`、
  `DocsBreadcrumb`、`DocsToc`、`DocsTocPopover`、`DocsPager` 已成立。
- route 页面已经偏 thin，主要承担查询和装配。
- shell / page / content 之间已有明显边界。

当前判断：

- `First Pass+`

详细对照点：

- `[已对齐到 First Pass+]` docs shell、page shell、sidebar、TOC、mobile nav 的结构已经成立。
- `[已对齐到 First Pass+]` page header/body/footer/breadcrumb/pager 的消费面已集中到 `DocsPage`。
- `[已对齐到 First Pass+]` route 页面不再直接渲染产品层行为，而是装配 page-level contract。
- `[仍需收口]` 需要一张 slot ownership matrix，明确哪些 slot 属于 foundation，哪些只能由 integration/product 挂入。
- `[仍需收口]` 当前 layout/page protocol 虽已存在，但“默认 props 形状”和“页面级增强位”还散在多个文档里。
- `[仍需收口]` page actions、feedback、search dialog 这些增强已经落地，但仍需持续证明它们没有反向污染 `DocsPage` 正文结构。

本阶段行动：

1. 汇总 layout/page slots matrix：
   - header
   - sidebar
   - mobile nav
   - TOC main
   - TOC popover
   - page header actions
   - footer tail
2. 冻结 rule：
   - 页面正文结构只能由 foundation page protocol 拥有
   - integration/product 只通过 props、slot、provider 扩展
3. 复核 `index.vue` 和 `[...slug].vue` 是否仍保持 thin route composition。

Exit proof：

- `docs-shell`、`page-tail`、`page-actions` focused coverage
- route-level code review
- `typecheck`

### 5. Default MDC Mapping / Link Protocol

参考：

- Fumadocs `base-ui/src/mdx.tsx`
- 本地 `Prose*.vue`
- 本地 `DocsLink.vue`
- 本地 `app/utils/docs-link.ts`
- 本地 `app/composables/useDocsLink.ts`

本地现状：

- `a / img / h1-h6 / table / pre` 都已走本地项目 contract。
- `DocsLink` 和 docs link utility 已接入 relative/internal/external 语义。
- ImageZoom 已并入默认 Markdown 图片表达路径。

当前判断：

- `First Pass+`

详细对照点：

- `[已对齐到 First Pass+]` 常见 Markdown 元素的默认映射已经建立。
- `[已对齐到 First Pass+]` 相对链接解析和 active 判断不再散在组件里。
- `[已对齐到 First Pass+]` 表格 overflow、heading anchor、`pre -> DocCodeBlock` 这几个高价值默认映射已经成立。
- `[仍需收口]` 还需要一张 generic prose contract matrix，明确哪些元素靠显式 component mapping，哪些元素靠 `prose.css` 统一负责。
- `[仍需收口]` `blockquote`、`hr`、`kbd`、media 等 generic prose surface 的验收应更明确，避免默认样式“看起来没坏”就算完成。
- `[仍需收口]` default mapping inventory 需要固定入口，避免后续在组件里局部接管 Markdown 元素。

本阶段行动：

1. 写 default mapping inventory：
   - explicit component mapping
   - prose-owned elements
   - content-owned elements
2. 补 generic prose fixture：
   - `blockquote`
   - `hr`
   - `kbd`
   - nested list/table/code
3. 冻结规则：以后任何新的 Markdown 默认行为，都先加到 mapping inventory，再进实现。

Exit proof：

- `pnpm test:nuxt -- tests/nuxt/docs-content-rendering.nuxt.spec.ts`
- `prose-defaults` focused coverage
- 相关 Playwright focused spec

### 6. Markdown Transform Pipeline

参考：

- Fumadocs `core/src/mdx-plugins/index.ts`
- 本地 `mdc.config.ts`
- 本地 `app/utils/docs-markdown-pipeline.ts`
- 本地 `app/utils/docs-code-meta.ts`

本地现状：

- 已支持 custom heading id。
- 已支持 structured data extraction。
- 已支持 code meta 基础解析。
- 已通过 Shiki notation 覆盖 line highlight / word highlight / diff / focus 的主要视觉路径。

当前判断：

- `Draft -> First Pass-`

这部分是当前 foundation 差异最明显的地方之一。

详细对照点：

- `[已对齐到 First Pass]` heading id、custom id、structured data 已有本地入口。
- `[已对齐到 First Pass]` code meta 已有基础 parser，Shiki notation 已接管亮点行/词、diff、focus。
- `[明显缺口]` Fumadocs 的 plugin 面不止 `rehype-code`，还包括：
  - `remark-heading`
  - `remark-image`
  - `remark-structure`
  - `rehype-toc`
  - `remark-code-tab`
  - `remark-steps`
  - `remark-npm`
  - `remark-feedback-block`
  - `remark-llms`
- `[明显缺口]` 当前本地仍主要依赖手写 content component authoring，没有形成足够明确的“作者写法 -> transform -> foundation component”能力矩阵。
- `[明显缺口]` code tabs grouping、package manager commands、steps authoring transform、image metadata policy 仍不完整。
- `[边界待冻结]` `llms`、feedback block、mermaid 等不应直接混进当前 foundation exit gate，需要分清 must-have 与 defer。

本阶段行动：

1. 先产出一张 transform capability matrix：
   - 当前已有
   - foundation exit 必须补齐
   - integration/product 才需要
2. foundation exit 必补项建议收口为：
   - heading id / custom id / TOC extraction policy
   - code meta parser contract
   - code tabs grouping contract
   - steps authoring contract
   - package-manager authoring contract
   - image metadata baseline contract
3. 为每个 transform 补 content fixture 和 runtime test，不再只靠页面视觉观察。

Exit proof：

- `pnpm test:nuxt -- tests/nuxt/docs-content-rendering.nuxt.spec.ts`
- focused markdown runtime specs
- 保留的 browser-only focused E2E

### 7. Code System / Preview Contract

参考：

- Fumadocs `components/codeblock.tsx`
- 本地 `DocCodeBlock.vue`
- 本地 `DocCodeTabs.vue`
- 本地 `DocPreview.vue`
- 本地 `DocInstallCard.vue`

本地现状：

- 这是当前最强的 foundation surface 之一。
- code shell、copy state、line numbers、highlight markers、code tabs、preview frame 已经有较完整的 first pass。

当前判断：

- `First Pass+`

详细对照点：

- `[已对齐到 First Pass+]` code shell、tabs、copy、preview frame 的 UI contract 已经很完整。
- `[已对齐到 First Pass+]` 保留的 browser-only E2E 与 runtime tests 已有分层。
- `[仍需收口]` 代码块 authoring transform 仍依赖上一节的 pipeline hardening，不应把 UI 壳的完成误认为 pipeline 已完整。
- `[仍需收口]` package-manager tabs 和 richer code meta 仍需要和 markdown pipeline 一起补齐。
- `[明确 defer]` 动态 code runtime、server code block 等不放入当前 gate。

本阶段行动：

1. 将 code system 的“UI contract 已完成”和“authoring transform 仍未完成”明确拆开。
2. 让 code system 的所有增强都通过 markdown pipeline matrix 来追踪，而不是零散挂在组件任务里。

Exit proof：

- `code-block` focused coverage
- `pnpm test:nuxt -- tests/nuxt/docs-content-rendering.nuxt.spec.ts`
- `typecheck`

### 8. Docs Content Components

参考：

- Fumadocs component inventory
- 本地 `design/fumadocs-component-parity-inventory.md`
- 本地 `app/components/content/*`

本地现状：

- `Callout / Tabs / Accordion / Files / InlineTOC / TypeTable / Cards / Steps / Heading / ImageZoom / Preview` 已有较完整 first pass。
- 组件 parity 与 fixture/profile 已经比较成体系。

当前判断：

- `First Pass+`

详细对照点：

- `[已对齐到 First Pass+]` 组件面已经相对广，不再是 foundation 的第一瓶颈。
- `[仍需收口]` 需要持续防止 product/advanced surfaces 重新混进 foundation queue。
- `[仍需收口]` 组件 contract card、fixture、profile、defer decision 需要始终并行维护。
- `[明确 defer]` `GitHubInfo / DynamicCodeBlock / AutoTypeTable / GraphView / Mermaid / KaTeX / Twoslash / OpenAPI / AsyncAPI` 不进入当前 foundation exit gate。
- `[仍需决定]` Banner 是否永远停留在 layout slot，还是未来进入 foundation component，需要独立 decision card，不应顺手实现。

本阶段行动：

1. 保持 `fumadocs-component-parity-inventory.md` 作为唯一组件 inventory。
2. 所有新组件先分类：
   - foundation P0/P1
   - integration / product
   - advanced / defer
3. 禁止在 product 需求压力下把 advanced 组件伪装成 foundation blocker。

Exit proof：

- 组件 inventory 已更新
- 对应 focused profile/suite 已存在
- defer 列表显式、可追踪

### 9. Site Config / Foundation Adapter Boundary

参考：

- 本地 `app/types/docs-site.ts`
- 本地 `app/config/docs-site.ts`
- 本地 `design/product-roadmap.md`

本地现状：

- site config、layout props adapter、Git metadata、page actions、local search、feedback、SEO、`llms.txt`、image baseline 已有第一轮。

当前判断：

- `First Pass`

详细对照点：

- `[已对齐到 First Pass]` foundation props 与产品 config 已有基本边界。
- `[已对齐到 First Pass]` layout/page 主要仍消费 foundation props/composables，而不是直接在组件里读产品配置。
- `[仍需收口]` 需要继续防止 site config 漫入 foundation primitives。
- `[仍需收口]` transformer registry、多 source loader adapter、remote provider 不应提前混进 foundation hardening。
- `[明确分类]` 这部分只有 boundary freeze 属于 foundation 当前工作；remote search provider、feedback backend、RSS、markdown export、image CDN adapter 属于 integration P1。

本阶段行动：

1. 冻结一个简单规则：
   - foundation 定义 contract
   - adapter 生成 props
   - product config 不直接操作 DOM、tree、primitive
2. 所有后续 integration P1 能力都先检查是否触碰 foundation boundary；若触碰，先回补 foundation。

Exit proof：

- `docs-site` 类型审阅
- `DocsPage` / `DocsLayoutShell` / `DocsRootProvider` 不直接绑定产品层数据源

### 10. Verification / Maturity Gate

参考：

- 本地 `design/verification-runbook.md`
- 本地 `design/development-workflow-audit.md`
- 当前 runtime / Playwright / docs link validation 分层

本地现状：

- 测试流程已经比以前标准化很多。
- 但 foundation 完成定义仍然偏散，很多 surface 只有 “实现 + 通过一次 focused check”，还没有明确的 gate。

当前判断：

- `Draft -> First Pass`

详细对照点：

- `[已建立基础]` 运行时测试、focused Playwright、responsive、typecheck/health 的分层路径已经形成。
- `[仍需收口]` 每个 foundation surface 还缺少统一的 maturity label 和记账方式。
- `[仍需收口]` 还缺少一份 “foundation exit scoreboard”，把所有 surface 的状态集中展示。
- `[仍需收口]` 还缺少一份 “change type -> minimum verification set” 的标准矩阵，避免每轮都靠记忆判断。

本阶段行动：

1. 为所有 foundation surface 统一记录：
   - 状态词
   - owner files
   - focused verification
   - containing suite
   - defer note
2. 增补一份简短的变更类型验证矩阵。
3. 在进入 integration P1 前，先完成 foundation exit scoreboard。

Exit proof：

- foundation scoreboard 可读
- verification matrix 可执行
- 至少一轮按 scoreboard 收口后的 batch 验证

## 推荐推进顺序

### Phase A：冻结口径

目标：

- 统一状态词
- 固定本矩阵作为 foundation hardening 执行入口
- 先停止“做了很多但状态不清楚”的推进方式

产物：

- 本文档
- roadmap 入口链接
- foundation surface 状态表

### Phase B：补 Source / Tree Contract

目标：

- 先把 `content -> docs tree -> page identity` 这条链再收硬

聚焦：

- source identity contract
- page-tree contract card
- page-tree fixture matrix
- transformer boundary freeze

### Phase C：补 Markdown Transform Pipeline

目标：

- 把当前最明显的基础差异面收口

聚焦：

- transform capability matrix
- must-have transforms for foundation exit
- runtime content fixtures + tests

### Phase D：补 Provider / Layout / Page Exit Gate

目标：

- 把 provider、layout、page、slot ownership 全部提升到 gate-passed

聚焦：

- provider contract freeze
- layout/page slot matrix
- route-level thin composition review

### Phase E：形成 Foundation Exit Scoreboard

目标：

- 把所有 surface 的状态、证据和 defer 统一收口

聚焦：

- surface-by-surface scoreboard
- change type -> verification matrix
- pre-integration checklist

## 当前不建议并行推进的内容

在 foundation matrix 没收口前，不建议把下面这些再混进同一条执行链：

- remote search provider / search API
- feedback backend
- RSS
- `llms-full.txt`
- per-page markdown export
- image CDN adapter
- multi-source loader baseline
- blog / changelog / API 页面体验
- AI / MCP / docs assistant
- versioning / i18n

原因不是这些不重要，而是它们会持续把 foundation 边界重新拉松。

## Foundation Exit Gate 建议

当且仅当下面这些条件同时满足时，才建议正式进入 integration P1 深化：

1. 内容源与页面元数据达到 `Gate Passed`。
2. page-tree/runtime/transformer boundary 达到 `Gate Passed`。
3. provider/layout/page/slot ownership 达到 `Gate Passed`。
4. default mapping、link protocol、generic prose contract 达到 `Gate Passed`。
5. markdown transform pipeline 的 foundation 必要项达到 `Gate Passed`。
6. code system 与 content components 的 defer boundary 明确且稳定。
7. foundation scoreboard 和 verification matrix 已存在并实际被使用。

## 结论

当前基础层真正需要的，不是再写一份抽象路线图，而是把“哪些已经是稳定底座，哪些还只是第一轮实现”明确区分出来。

这份矩阵的作用就是把 foundation hardening 从“凭经验推进”改成“按协议对照推进”。

后续只要某一轮工作仍在补 foundation，就应优先以这份矩阵为执行入口，而不是直接跳去 integration P1 或 site product composition。
