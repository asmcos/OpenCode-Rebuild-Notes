# 03 认识 Agent：它到底是什么

目标：弄清 OpenCode 里的 **Agent** 不是「整个程序」，而是一份**可切换的角色配置**（名字、系统提示、模式、权限等）。读上游契约，再在 `rebuild/` 里放几个迷你 agent，用 CLI 列出来。

预计时间：40–60 分钟。对应 tag 计划：`stage-01-what-is-agent`（收口后再打）。

::: tip 从这里开始碰 agent
环境与 bun CLI 已经能跑（[00](/guide/00-env)–[02](/guide/02-hello-bun)）。后面章节都围着「怎么做一个 agent」展开；不必再单独学命令表——`rebuild/src/commands/` 里的分发代码可自行翻看。
:::

## 3.1 先建立正确心智模型

在 OpenCode 里，大致可以这么记：

| 概念 | 一句话 |
|------|--------|
| **Agent** | 一种「人设 + 规则」：系统提示、模式、权限、可选模型等 |
| **Session** | 一次对话 / 任务上下文（消息历史等）——后面章节再拆 |
| **Tool** | agent 可调用的能力（读文件、改文件、跑命令…）——后面再拆 |
| **CLI / TUI** | 人怎么操作上面这些东西 |

所以「做 agent」第一步不是接大模型 API，而是：**说清楚一个 agent 的数据结构长什么样**。

## 3.2 读上游：`Agent.Info`

出处：`packages/schema/src/agent.ts`

```bash
cd ~/dev/opencode
sed -n '1,55p' packages/schema/src/agent.ts
```

关注 `Info` 结构（字段名以你基线源码为准），入门先抓住：

| 字段 | 含义（口语） |
|------|----------------|
| `id` / `name` | 标识与显示名（默认里常见 `build`） |
| `system` | 系统提示 / 角色说明 |
| `description` | 给人看的简介 |
| `mode` | `primary` / `subagent` / `all` |
| `hidden` | 是否在选择列表里藏起来 |
| `model` / `request` | 用哪个模型、请求怎么拼（本步先不实现） |
| `permissions` | 允许 / 询问 / 拒绝哪些操作（本步先不实现） |

运行时登记与查询在：

出处：`packages/core/src/agent.ts`

里面有 `list` / `get` / `resolve` / `select`，以及默认 id `build`（`defaultID`）。本步我们只做**内存里的迷你 registry**，不引入 Effect。

配置侧还有：`packages/schema/src/config/agent.ts`（用户配置文件里写的 agent 片段）。先会读 `Agent.Info` 即可。

## 3.3 在 `rebuild/` 里放迷你形状

### 类型 — `rebuild/src/agent/info.ts`

```ts
/**
 * Mini agent shape.
 *
 * Inspired by (upstream relative paths):
 * - packages/schema/src/agent.ts  (Agent.Info)
 */

export type AgentMode = "primary" | "subagent" | "all"

export type AgentInfo = {
  id: string
  name: string
  description?: string
  /** System prompt / instructions for this agent persona */
  system?: string
  mode: AgentMode
  hidden?: boolean
}
```

### 注册表 — `rebuild/src/agent/registry.ts`

内置三个例子：`build`、`plan`、`explore`（explore 为 `subagent`），提供 `list` / `get` / `resolve`。

出处对照：

- `packages/core/src/agent.ts` — `list` / `get` / `resolve`、`defaultID = build`
- `packages/schema/src/agent.ts` — 字段含义

完整文件以仓库里现成代码为准；你也可以自己敲一遍再对比。

### CLI — `agent` 命令

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild

bun run dev agent list
bun run dev agent get build
bun run dev agent resolve
bun run dev agent resolve plan
```

| 命令 | 期望 |
|------|------|
| `agent list` | 列出内置 agent（含 pri/sub 标记） |
| `agent get build` | 打印该 agent 的 JSON（含 `system`） |
| `agent resolve` | 无 id 时落到默认 `build` |
| `agent resolve plan` | 得到 `plan` |

实现文件：

- `rebuild/src/commands/handlers/agent.ts`
- 并在 `rebuild/src/commands/handlers.ts` 表里挂上 `agent`（若你本地还是 stage-00 单文件入口，先看现成仓库结构，或自行把 `agent` 接到你的 CLI）

## 3.4 和上游的差距（刻意留白）

| 已有（迷你） | 尚未做 |
|--------------|--------|
| Agent 字段子集 | `permissions` / `model` / `request` |
| 内存 Map 注册 | Effect `State` + `Bus` 事件 |
| CLI 列出 / 查看 | TUI 切换 agent、会话里绑定 agent |
| 写死的三个种子 | 从配置文件 / markdown 发现 agent |

下一步：[04 接真实模型：最小 Chat](/guide/04-chat-llm)——把 `system` 接上真实大模型。本步仍**不必**调 LLM。

## 验收清单

- [ ] 能打开并指认 `packages/schema/src/agent.ts` 里的 `Info`  
- [ ] 能说明 `primary` 与 `subagent` 的差别（用人话）  
- [ ] `bun run dev agent list` / `get` / `resolve` 行为符合上表  
- [ ] 清楚：本步还没有调用 LLM，只是在定义「角色是什么」；对话见 04  

预览文档：

```bash
cd ~/dev/OpenCode-Rebuild-Notes/notes
bun run dev
```
