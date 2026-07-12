---
title: Development Workflow Audit
sectionLabel: Plan
---

# Development Workflow Audit

> Status: audit snapshot. Its verification recommendations have been promoted
> into `design/verification-runbook.md`; use the runbook for current commands.

## 目的

这份文档用于收口三件事：

1. 当前仓库真实在执行的完整研发流程是什么。
2. 当前纸面规划和真实执行之间有哪些偏差。
3. 当前基础实现距离目标预期还差多少，以及流程上还能怎么优化。

这里的重点不是再写一份新 roadmap，而是把“真实交付路径”和“当前差距”
明确下来，避免后续继续在“第一轮完成”和“已经可以进入下一层”之间混淆。

## 证据来源

本地仓库证据：

- `design/roadmap.md`
- `design/foundation-roadmap.md`
- `design/product-roadmap.md`
- `design/fumadocs-gap-audit.md`
- `design/implementation-notes.md`
- `design/verification-runbook.md`
- `package.json`
- `playwright.config.ts`
- `scripts/run-typecheck.mjs`
- `README.md`

外部实践参考：

- [Martin Fowler: Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
- [Trunk Based Development: short-lived feature branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/)
- [Trunk Based Development: five-minute overview](https://trunkbaseddevelopment.com/5-min-overview/)
- [Google Cloud DevOps capabilities](https://docs.cloud.google.com/architecture/devops)
- [Google Cloud: automate and manage change](https://docs.cloud.google.com/architecture/framework/operational-excellence/automate-and-manage-change)
- [Playwright: running and debugging tests](https://playwright.dev/docs/running-tests)
- [Playwright: command line](https://playwright.dev/docs/test-cli)
- [Playwright: web server](https://playwright.dev/docs/test-webserver)

## 当前真实完整研发流程

当前真实流程已经不是“按 roadmap 线性推进一个阶段，然后进入下一个阶段”。
从本地脚本、验证计划和实现记录看，真实流程更接近下面这条闭环：

1. 先明确当前要对齐的 surface 或 contract。
2. 回看 Fumadocs / Fumapress / assistant-ui / 本项目现状，先做差异判断。
3. 把变更收敛成一个小范围实现，而不是同时推多个层级。
4. 先做最轻的验证，再逐步升级到更重的验证。
5. 当验证暴露出 contract 缺口时，回到 foundation 或 integration 层补洞。
6. 把稳定结论回写到设计文档、验证计划和 implementation notes。

换句话说，真实流程是：

`参考源码 -> 定义 contract -> 小步实现 -> 分层验证 -> 发现缺口 -> 回补底座 -> 回写规则`

而不是：

`roadmap 某阶段标记完成 -> 进入下一阶段 -> 不再回头`

### 当前已经存在的验证分层

从 `package.json`、`playwright.config.ts` 和
`design/verification-runbook.md` 看，当前验证已经形成了分层体系：

1. 静态检查
   - 读代码
   - 读 diff
   - 路由或内容改动时再跑 `validate:links`
2. 轻量运行时检查
   - `test:nuxt`
   - 适合 Markdown transform、内容渲染、结构性 contract
3. 聚焦 Playwright
   - 单文件
   - 单 tag
   - 单 project
   - 适合交互、响应式、hydration、scroll、dialog、focus 这类真实浏览器行为
4. 批次收口
   - `typecheck`
   - 最小相关回归
5. 阶段或预合并回归
   - `test:e2e:full`

### 当前 server 生命周期的真实规则

当前 repo 由 Playwright `webServer` 统一管理 E2E 服务生命周期。

- 默认没有健康服务时，Playwright 自动启动 Nuxt，并在测试结束后回收自己启动的进程。
- 本地已有健康服务时，`reuseExistingServer` 允许 Playwright 直接复用，不再启动第二个服务。
- 设置 `PLAYWRIGHT_TEST_BASE_URL` 时视为显式外部服务，Playwright 不负责启动或停止它。
- E2E 使用 `.nuxt-e2e`，typecheck 使用 `.nuxt-typecheck`，避免与日常开发的 `.nuxt`
  共享构建状态。

这说明本地实际规则已经变成：

- Playwright 是默认 E2E 服务的唯一自动 owner。
- 不要求开发者在测试前手动运行 `pnpm dev` 或额外健康检查脚本。
- 测试入口保持为参数化 `test:e2e` 和明确的 `test:e2e:full`。

这条规则使用 Playwright 官方生命周期能力，避免自定义 wrapper、重复 owner 和额外
诊断命令进入日常测试路径。

## 当前流程的主要问题

### 1. 纸面状态比真实状态乐观

`design/roadmap.md` 和 `design/foundation-roadmap.md` 中有大量
“已完成第一轮”“基本完成”“已完成并纳入回归”的描述。

问题不在于这些描述完全错误，而在于它们没有清晰区分：

- contract 已存在
- focused verification 已通过
- exit gate 已通过
- 可以安全进入下一层
- 已达到目标站点体验

当前很多 surface 实际上只是“第一轮成立”，还不是“成熟稳定且可作为上层默认依赖”。

### 2. 缺少一份单独的“真实交付流程”入口文档

现在流程规则散落在这些地方：

- `AGENTS.md`
- `design/playwright-verification-plan.md`
- `design/implementation-notes.md`
- 各种 parity / migration / todo 文档

这会导致：

- 新一轮开发容易重复走回旧流程
- 大家知道“有规则”，但不知道“默认该走哪条路”
- 一旦 roadmap 写得乐观，真实执行规则就会被淹没

### 3. 当前验证流程虽然已被优化，但还没有完全标准化

现在已经不是“全量回归起步”，这是进步。

但仍然缺少一个统一的“变更类型 -> 最小验证集”矩阵。例如：

- 改 prose/content CSS 到底默认跑哪层
- 改 markdown transform 到底先跑 `test:nuxt` 还是 Playwright
- 改 page actions、sidebar、TOC、theme 分别走哪组 focused suites
- 什么情况下必须升到 `fast`
- 什么情况下才需要 `full`

也就是说，脚本已经分层了，但“何时选哪层”还主要靠人记忆。

### 4. 仓库级 pre-merge gate 已建立

`.github/workflows/verify.yml` 现在把本地标准固化成仓库级 gate：

- pull request：typecheck、Nuxt runtime、links、desktop `@fast` E2E
- main push / 手动执行：同一批静态和 runtime checks，再用两个独立 shard 运行完整
  viewport-aware E2E 矩阵并合并报告
- Playwright 在 CI 冷环境自动安装 Chrome、启动 `.nuxt-e2e` 服务并上传失败诊断
- `pnpm-lock.yaml` 和 `packageManager` 固定依赖解析与 pnpm 工具版本，CI 使用
  `--frozen-lockfile` 和 pnpm store cache

后续重点不再是“有没有 CI”，而是根据真实耗时和故障率调整 gate 范围，避免把本地
focused loop 重新拖成全量流程。

### 5. 活跃文档与历史证据需要持续分界

`README.md`、`AGENTS.md` 和 `design/verification-runbook.md` 现在已经同步为当前入口；
旧 Playwright 计划和 implementation notes 中仍会保留当时的 wrapper、managed server
和健康检查命令作为历史证据。

后续检视时必须区分“活跃规则”和“历史记录”，不能因为搜索到旧命令就重新引入已退役
的流程。

## 当前基础实现与目标预期的差距

下面这个判断是基于当前本地文档、脚本和实现状态做的工程化归纳。

### 用成熟度层级来看

建议把当前项目状态理解为 5 层，而不是简单的“做完 / 没做完”：

1. `L0` 只能渲染内容
2. `L1` foundation contract 成立
3. `L2` foundation 标准化并可稳定扩展
4. `L3` integration / plugin platform 可复用
5. `L4` site product composition 接近目标站点

基于当前证据，我的判断是：

- 当前已经明显超过 `L1`
- 但整体更接近 `L2-`，还没有真正进入稳定的 `L3`

这是一个推断：

- 因为 foundation contract、theme/provider、page-tree runtime、markdown
  transform、ImageZoom、分层测试都已经有了第一轮实现和验证
- 但 integration P1、多 source、站点级 product composition 仍然存在明显空缺
- 同时“完成定义”和自动化 gate 还没有成熟到支撑稳定放大

### 差距 1：foundation 已成立，但成熟度还不够硬

当前已具备：

- docs tree / page tree runtime
- layout / page contract
- theme runtime / provider
- UI primitives baseline
- markdown transform 第一轮
- ImageZoom / content components
- 分层验证入口

但距离“foundation 可稳定成为后续默认底座”仍有差距：

- 第一轮完成和 exit gate 之间没有统一定义
- 当前规则更多沉在 notes 里，不在单一标准里
- 变更分类和验证路由还不够硬
- README / roadmap / verification doc 的入口口径还不完全一致

所以当前 foundation 的主要问题不是“没有实现”，而是“实现已存在，但成熟度口径、
交付口径、验证口径还没有完全标准化”。

### 差距 2：integration / plugin 层离目标还比较远

从 `design/product-roadmap.md` 和 `design/fumadocs-gap-audit.md` 看，
当前 integration 层仍明显缺这些目标能力：

- remote search provider / search API
- feedback backend 或 GitHub issue 提交流程
- RSS
- `llms-full.txt`
- per-page markdown export
- image CDN adapter
- multi-source loader baseline

这意味着当前项目虽然已经有“站点能力的第一轮入口”，但离“可配置、可复用、
可扩展的集成层平台”还有明显差距。

### 差距 3：站点产品组合层大部分仍未进入实做

从 roadmap 的目标定义看，目标预期不是只做出一个能渲染 docs 的基础站点，
而是要逐步接近完整的站点形态：

- blog / changelog / API
- story / playground
- AI / MCP / docs assistant
- versioning
- i18n
- OpenAPI / AsyncAPI / type generation

这些能力目前大多还在规划层，或者只有预留位，没有完整的 product composition。

因此“当前基础实现跟目标预期差很多”这句话是成立的，但要分层理解：

- 对 foundation baseline 来说，差距已经不是从 0 到 1。
- 对 integration platform 和 site product composition 来说，差距仍然很大。

## 可以继续优化的地方

下面的建议不是要把流程重新变复杂，而是要把“已经形成的好习惯”标准化、自动化、
并且与当前目标层次对齐。

### 1. 先统一状态口径

建议后续所有 roadmap / plan / audit 文档统一使用这四类状态：

- `Draft`
  - 只有设计和排期，还没有稳定实现
- `First Pass`
  - contract 已有实现，且有 focused checks
- `Gate Passed`
  - 已满足进入下一层的最小条件
- `Product Ready`
  - 已达到当前目标站点可依赖的成熟度

只要继续使用“已完成第一轮”而不补这套层级，就会持续误导推进节奏。

### 2. 给流程补一张“变更类型 -> 最小验证集”矩阵

建议把当前日常流程标准化成下面这张矩阵。

#### 内容或文档文字改动

- 默认：静态检查
- 如改动链接或路由：加 `validate:links`
- 不默认起 Playwright

#### Markdown transform / 内容渲染 / 结构 contract

- 默认：`test:nuxt` 或 focused runtime test
- 只有涉及真实浏览器行为时才加 Playwright

#### shell / theme / sidebar / TOC / dialog / page actions

- 默认：一个 focused Playwright spec
- 非响应式改动先跑 desktop
- 只有触及 tablet/mobile contract 时再补 responsive project

#### 路由、page tree、source path、content 结构

- 默认：focused runtime 或 page-tree spec
- 再加 `validate:links`

#### 批次收口

1. `typecheck`
2. 最小相关回归；需要浏览器行为时由 Playwright 自动准备服务

#### 阶段收口或预合并

- 用 `test:e2e` 参数选择所需 project、文件或 tag
- 必要时 `test:e2e:full`

### 3. 进一步贯彻“测试金字塔”思路

外部最佳实践反复强调：

- 低层测试应远多于高层 GUI 测试
- 高层浏览器回归要贵而少，用在必须依赖真实浏览器的场景

这对当前项目的落地含义很明确：

- 继续把结构性、非交互性 contract 往 `test:nuxt` 和更轻的层下沉
- Playwright 继续聚焦：
  - actionability
  - focus
  - dialog
  - responsive shell
  - hydration-sensitive behavior

这条方向其实已经开始做了，但还可以继续推进。

### 4. 让本地短流程和仓库级 gate 分层

当前本地流程已经偏“最小可验证”，这是对的。

本地短循环和仓库级自动化 gate 现在已经分开：

#### 本地默认循环

- 小步改动
- focused check
- 批次末尾再 `typecheck`
- 浏览器回归直接运行参数化 `test:e2e`，不增加手工服务前置步骤

#### 仓库级 pre-merge gate

当前已自动化：

- `typecheck`
- `test:nuxt`
- `test:e2e -- --grep '@fast' --project=chromium-desktop`
- `validate:links`

#### 阶段性或夜间回归

- `test:e2e:full`
- legacy parity / reference probe

这样可以避免把所有成本都压回每次本地迭代，同时又不至于只靠人工记忆守流程。

### 5. 用更小批次推进后续大差距能力

Trunk-Based Development 的经验很适合当前阶段：

- 保持小批次
- 保持短分支
- 快速回到主线
- 用连续验证保证 trunk 不坏

这对当前项目的实际含义是：

- 不要再把“foundation hardening + integration P1 + product composition”
  混成一次推进
- 每一轮只推进一个明确层级
- 每一层都先给出 exit gate，再进入下一层

## 推荐的下一步推进顺序

### P0：先修正文档和流程入口

1. 以本文件作为“真实研发流程和差距审计”入口。
2. 同步 README 的开发/验证入口。
3. 后续把 roadmap 状态从“第一轮完成”升级成标准状态口径。

### P1：把验证标准再标准化一层

1. 补一份简短的“change type -> verification matrix”。
2. 明确 `fast`、`full`、`validate:links` 的触发条件。
3. 明确哪些 contract 继续往 runtime/static 层下沉。

### P2：维护仓库级最小 pre-merge gate

当前 gate 已落地：

- `typecheck`
- `test:nuxt`
- `test:e2e -- --grep '@fast' --project=chromium-desktop`
- `validate:links`

后续只根据 CI 证据调整范围和并发，不再增加新的 package script 入口。

### P3：按层次补当前实现与目标预期之间的功能差距

推荐顺序保持为：

1. integration P1
   - remote search provider / search API
   - feedback backend
   - RSS
   - `llms-full.txt`
   - per-page markdown export
   - image CDN adapter
2. multi-source baseline
3. site product composition
   - blog / changelog / API
   - story / playground
   - AI / MCP / docs assistant
   - versioning / i18n
   - OpenAPI / AsyncAPI

## 审计结论

当前项目的核心问题已经不是“没有流程”，而是：

1. 真实流程已经形成，但没有被单点标准化。
2. foundation 已经做出第一轮底座，但还没有把成熟度定义清楚。
3. integration 和 site product composition 距离目标仍有明显差距。
4. 验证脚本已经分层，但仓库级 gate 还没有落地。

因此，接下来的最优策略不是重新发明一条新流程，而是：

- 把当前真实流程显式化
- 把完成定义标准化
- 把最小 gate 自动化
- 再按层级补功能差距

这样才能既保住当前已经优化出来的短反馈链路，又避免项目在“看起来做了很多，
但离目标站点还很远”的状态里继续模糊推进。
