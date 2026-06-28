---
title: Foundation Roadmap
sectionLabel: Plan
---

# Foundation Roadmap

## 目标

基础层负责做出一套可长期演进的 Vue 文档系统底座。

它不追求搜索引擎、反馈系统、AI、SEO、博客、多版本这些产品能力。

它追求：

- 内容结构稳定
- docs tree 稳定
- layout / page protocol 稳定
- default MDX/MDC components 稳定
- link / heading / TOC / code 等内容协议稳定
- 基础 UI primitives 稳定
- docs content components 稳定
- 样式 token 和 CSS 分层稳定
- 产品层扩展位稳定

一句话：

- foundation 不是“页面能渲染”就结束，而是要提供一套产品层可以放心消费的 docs UI substrate。

## 基础层范围

基础层包含：

- `content.config.ts`
- `content/`
- `app/types/docs.ts`
- `app/utils/docs-navigation.ts`
- `app/composables/useDocs*.ts`
- `app/layouts/docs.vue`
- `app/components/docs/*`
- `app/components/content/*`
- `app/assets/css/tokens.css`
- `app/assets/css/shell.css`
- `app/assets/css/prose.css`
- `app/assets/css/content.css`
- `app/pages/index.vue`
- `app/pages/[...slug].vue`

基础层也可以新增：

- `app/components/ui/*`
- `app/components/mdc/*` 或 `app/components/content/*` 的 default mapping
- `app/config/docs-foundation.ts`
- `app/utils/docs-link.ts`
- `app/utils/docs-mdc.ts`

这些文件只承接 foundation contract，不承接产品配置。

## 参考源码

### Fumadocs Core

- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\schema.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\source.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\source\page-tree\builder.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\page-tree\definitions.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\page-tree\utils.ts`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\toc`
- `D:\Projects\Learning\gh\fumadocs\packages\core\src\mdx-plugins`

### Fumadocs UI / Base UI

- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\mdx.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\client.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\search-trigger.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\theme-switch.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\shared\slots\language-select.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\client.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\slots\sidebar.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\layouts\docs\page\slots\toc.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\sidebar\base.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\toc\index.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\codeblock.tsx`
- `D:\Projects\Learning\gh\fumadocs\packages\base-ui\src\components\type-table.tsx`

### 官网参考

- [Fumadocs UI](https://www.fumadocs.dev/docs/ui)
- [Components](https://www.fumadocs.dev/docs/ui/components)
- [Layouts](https://www.fumadocs.dev/docs/ui/layouts)
- [Docs Layout](https://www.fumadocs.dev/docs/ui/layouts/docs)
- [Docs Page](https://www.fumadocs.dev/docs/ui/layouts/page)
- [Layout Links](https://www.fumadocs.dev/docs/ui/layouts/links)
- [Navbar](https://www.fumadocs.dev/docs/ui/layouts/nav)
- [Markdown](https://www.fumadocs.dev/docs/markdown)
- [Rehype Code](https://www.fumadocs.dev/docs/headless/mdx/rehype-code)
- [Headings](https://www.fumadocs.dev/docs/headless/mdx/headings)

## Foundation Matrix

### 1. Content Protocol

必须稳定：

- `docs` collection
- page frontmatter
- directory meta
- source path
- route path
- slug transform
- hidden / excluded semantics
- status / badge / icon
- full / toc / pager / breadcrumb page policy

验收：

- 页面查询统一使用 `docs`
- route 页面不直接消费原始 Nuxt Content navigation
- 所有导航结构统一收敛到 `DocsNode[]`
- `path` 是最终 route consumption key
- `sourcePath` 是内容查询和 meta 匹配 key

### 2. Page Tree Protocol

必须稳定：

- `DocsNode.id`
- page / group / separator / link
- visible tree
- context tree
- fallback / excluded context
- root folder
- pagesIndex
- explicit order
- link string fallback

验收：

- sidebar、breadcrumb、pager、homepage cards 共用 tree
- excluded page 不进入 visible sidebar/pager，但仍保留上下文
- separator 可参与 breadcrumb policy
- link node 有 external 语义

### 3. Layout Protocol

必须稳定：

- docs layout container
- grid columns / rows
- header / navbar
- left sidebar
- right TOC
- TOC popover
- mobile drawer
- layout slots
- layout options shape
- layout width tokens

基础 options 需要预留：

- `githubUrl`
- `links`
- `nav`
- `slots`
- `themeSwitch`
- `searchToggle`
- `languageSelect`

验收：

- 产品层可以用 config 生成 layout props
- navbar/sidebar/TOC 不直接读产品配置
- search/theme/language 都有 slot 或 trigger 位置
- layout 尺寸通过 token / CSS variables 控制

### 4. Page Protocol

必须稳定：

- page container
- page header
- page title
- page description
- page body
- breadcrumb
- TOC main
- TOC popover
- footer
- pager
- full mode
- slots replacement

验收：

- `DocsPage` 自己消费 `toc / breadcrumb / footer`
- route 页面只传 page-level contract
- page actions 后续可挂入 header/footer，不改正文结构
- footer 可承接 pager、last updated、feedback 等产品增强

### 5. Default MDX / MDC Components

必须稳定：

- `a`
- `img`
- `h1-h6`
- `table`
- `pre`
- `code`
- `blockquote`
- `Card / Cards`
- `Callout`
- `CodeBlockTabs`

验收：

- Markdown/MDC 输出不直接裸奔到浏览器默认样式
- table 有 overflow wrapper
- heading 有 anchor/id policy
- image 有尺寸、圆角、媒体节奏
- `pre` 统一进入 `DocCodeBlock`
- links 统一走 docs link protocol

### 6. Link Protocol

必须稳定：

- internal link
- external link
- relative file link
- hash link
- active state
- external target/rel
- normalized route comparison

验收：

- `./file.md` / `../file.mdx` 有明确处理策略
- external link 不需要每个组件重复判断
- sidebar/nav/prose link 使用同一 active 判断语义

### 7. Nav Links Contract

必须稳定：

- main item
- icon item
- button item
- menu item
- custom item
- `active: url / nested-url / none`
- `on: nav / menu / all`
- aria label
- external state

验收：

- site config 只提供数据
- navbar / mobile menu / home layout 共享同一 link item type
- GitHub shortcut 可以映射为 icon item

### 8. UI Primitives

必须稳定一组 Vue-native contract：

- button
- tabs
- popover
- collapsible
- dialog / command dialog
- scroll area
- navigation menu
- accordion
- overlay / focus trap
- copy button state

验收：

- docs components 不重复造交互状态
- search shell、page actions、sidebar switcher 可复用 primitives
- focus-visible、Escape、outside click、aria state 有统一规则

### 9. Prose / Typography

必须稳定：

- headings
- paragraphs
- ordered / unordered lists
- blockquote
- table
- inline code
- kbd
- links
- images
- video / media
- horizontal rule

验收：

- `prose.css` 只管通用 Markdown typography
- `content.css` 只管 docs components
- table、code、media 不造成横向溢出
- light/dark tokens 都覆盖

### 10. Code System

必须稳定：

- Shiki style token bridge
- code block shell
- title / filename
- icon
- copy button
- line numbers
- highlighted line
- highlighted word
- diff add/remove
- focus line
- code tabs
- package-manager tabs 预留

验收：

- code block 不只是 `<pre>` 样式
- copy action 有状态
- code tabs 有稳定 dimensions 和 persistence 预留
- rehype-code 输出能被当前组件消费

### 11. Preview System

必须稳定：

- component preview frame
- code preview frame
- preview toolbar 预留
- loading / empty / error state
- prose spacing

验收：

- story/playground 后续复用 preview frame
- 产品层不再新增基础 preview 容器

### 12. Docs Content Components

P0:

- Callout
- Card
- CardGrid
- Tabs
- Tab
- Steps
- CodeBlock
- Preview
- Accordion

P1:

- Banner
- Files
- InlineTOC
- TypeTable
- CodeTabs
- Heading
- ImageZoom

P2 / Product-aware:

- GitHubInfo
- GraphView
- AutoTypeTable

验收：

- P0 组件有真实内容 fixture
- P1 组件在进入产品层前至少完成 contract 或明确 postponed
- P2 不阻塞产品层，但不能误归基础 gate

### 13. Home / Not Found Shell

必须稳定：

- Home layout baseline
- homepage section cards from docs tree
- basic not-found shell
- shared nav/header options

验收：

- 首页和 docs 页属于同一视觉系统
- not-found 不依赖产品层配置才能正常展示

### 14. Markdown Transform Pipeline

当前用 Nuxt Content，不照搬 Fumadocs MDX。

但需要建立能力映射：

- heading id
- custom heading id
- TOC extraction
- hidden / only-in-TOC heading policy
- code meta parsing
- code tab grouping
- steps syntax
- npm/package-manager syntax
- structured data extraction
- image metadata

验收：

- 明确哪些由 Nuxt Content 已提供
- 明确哪些需要项目侧补
- structured data 只作为 future search input，不实现 search engine

## 实施阶段

### Phase 1：内容协议和树协议

当前状态：基本完成。

剩余检查：

1. frontmatter schema 和 `DocsPageMeta` 是否一致
2. directory meta fixture 是否覆盖 root/pagesIndex/link/separator
3. route path/source path fixture 是否覆盖中文、空格、重复 slug
4. hidden/excluded context tree 行为是否有文档样例

验收：

- `DocsNode[]` 成为唯一导航结构
- route 页面只做查询和装配

### Phase 2：Layout / Page Protocol

当前状态：基本完成第一轮。

剩余检查：

1. `DocsLayoutShell` 是否有 shared layout options 接口位置
2. navbar 是否能承接 `nav / links / searchToggle / themeSwitch`
3. sidebar 是否支持 link item / root switcher 预留
4. TOC main / TOC popover slots 是否稳定
5. page container / header / footer / breadcrumb slots 是否稳定

验收：

- 产品层 page actions/search/theme 不需要改 layout 结构

### Phase 3：Default MDX Components 和 Link Protocol

当前状态：已完成第一轮。

已完成：

1. Nuxt Content / MDC 的默认组件映射入口使用 `components/content/Prose*.vue`
2. `DocsLink` 和 `docs-link` utility 已接入
3. relative docs link policy 已按当前 source path + docs pages map 解析
4. heading component / anchor policy 已接入 `DocHeading`
5. table wrapper 已接入 `ProseTable`
6. image/media wrapper 已接入 `ProseImg`
7. `pre` / code block 映射入口已接入 `ProsePre -> DocCodeBlock`

验收：

- `a / img / h1-h6 / table / pre` 都有项目 contract
- prose 不再依赖浏览器默认行为兜底

### Phase 4：Shared Layout Options 和 UI Primitives

当前状态：已完成第一轮。

已完成：

1. `DocsLayoutProps` 已补 `githubUrl / links / nav`
2. `DocsNavOptions` 已定义
3. `DocsNavLink` 已定义
4. search trigger slot 已接入
5. theme switch slot 已接入
6. language switch slot 已接入
7. 当前决策继续 Vue-native primitives，不引入 Reka UI / shadcn-vue

验收：

- site config 可以后续生成 layout props
- 当前 layout 不直接依赖 site config
- interaction primitives 不在各组件里重复发明

### Phase 5：Code / Preview / Prose Gate

当前状态：已完成第一轮。

已完成：

1. `DocCodeBlock` 已补 title / filename / language / meta / copy 状态
2. code tabs 已补 `DocCodeTabs`
3. package-manager tabs 只保留手写 tabs contract，不做产品级生成
4. preview frame 保留 `DocPreview` contract
5. table/image/media 已进入 Prose mapping
6. light/dark code token 沿用 `content.css` 中 Shiki 状态

验收：

- 技术文档最常见正文表达可稳定使用
- story/playground 可复用 preview contract

### Phase 6：Docs Content Components Gate

当前状态：P0 已完成。

已完成：

1. P0 组件 fixture 已补到 `content/guide/components.md`
2. `DocFiles`
3. `DocInlineToc`
4. `DocTypeTable`
5. `DocHeading`
6. `DocImageZoom` 后置为 P1

验收：

- 产品层不需要为了写 docs 页面临时新增基础内容组件

### Phase 7：Foundation Exit Gate

进入产品层前必须确认：

- content/tree/page/layout protocol 完整
- default MDX components 完整
- link protocol 完整
- shared layout options 完整
- UI primitives baseline 完整
- code/prose/preview 完整
- content components P0 完整，P1 有明确状态
- product extension slots 完整

## 当前下一步

Foundation UI Gate 已完成第一轮。

下一步进入产品层起步：

1. site config schema
2. layout shared options 由 config 生成
3. nav links schema
4. Git metadata config
5. page actions contract
6. GitHub source link
7. Copy Markdown
