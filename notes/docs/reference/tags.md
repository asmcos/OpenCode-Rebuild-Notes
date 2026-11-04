# 学习阶段与 Git Tag

本复刻仓库按**阶段**推进：文档写一段、`rebuild/` 长一点，阶段收口后再打 git tag，方便读者 `checkout` 回到某一课结束时的状态。

上游 OpenCode 的版本/commit 仍以 [基线锁定](/baseline) 为准；这里的 tag **只标记本笔记仓库**的学习进度。

## 约定

| 项 | 说明 |
|----|------|
| 命名 | `stage-NN-短名`，`NN` 两位数字 |
| 何时打 tag | 该阶段文档验收清单通过，且 `rebuild/` 行为稳定之后——**不提前打** |
| 节奏 | 一次只做一个小阶段，慢慢迭代；附录可先写计划，状态栏再从「计划」改为「已发布」 |
| 查阅 | `git tag -l 'stage-*'` |

回看某一阶段：

```bash
cd ~/dev/OpenCode-Rebuild-Notes
git fetch --tags
git checkout stage-03-write   # 换成表里的名字
```

回到最新学习分支（名称以你仓库为准）：

```bash
git checkout main
```

## 阶段对照表

| Tag | 状态 | 对应文档 | 本阶段结束时应有什么 |
|-----|------|----------|----------------------|
| `stage-00-bootstrap` | 已发布 | [基线](/baseline)、[00](/guide/00-env)、[01](/guide/01-read-source)、[02](/guide/02-hello-bun) | VitePress 可预览；最小 CLI（`help` / `version` / `hello`） |
| `stage-01-chat` | 已发布 | [03 认识 Agent](/guide/03-what-is-agent)、[04 最小 Chat](/guide/04-chat-llm) | 迷你 agent + 真实对话；`bun run chat`；Bun 1.4.x |
| `stage-02-tools` | 已发布 | [05 工具 read](/guide/05-tool-read) | `read` 真执行 + agent 循环；`bun run chat` 出现 `[tool]` |
| `stage-03-write` | 已发布 | [06 write](/guide/06-tool-write)、[07 权限](/guide/07-permissions)、[04 Chat](/guide/04-chat-llm) | `write` + FileAccess；本地 `:8787` / `models`；permissions |
| `stage-04-shell` | 已发布 | [08 工具 shell](/guide/08-tool-shell) | 受控 `shell` + permission `ask`；无 background |
| `stage-05-menu` | 已发布 | [09 启动菜单](/guide/09-menu) | 启动菜单切换 Zen / Go / 本地；只列 free 模型 |
| `stage-05-permissions` | 已并入 `stage-03-write` | [07](/guide/07-permissions) | 提前完成，勿再单独打这个名字的 tag |
| `stage-06-session` | 计划中 | 10（待写） | messages 落盘；`chat --continue` |
| `stage-07-search` | 计划中 | 11（待写） | `grep` / `glob` 迷你工具 |
| `stage-08-edit` | 计划中 | 12（待写） | `edit`（局部补丁，非整文件 overwrite） |
| `stage-09-agents` | 计划中 | 13（待写） | 多 agent / subagent 调度（explore 真跑起来） |
| `stage-10-…` | 选做 | — | webfetch、todo、轻量 TUI、MCP 等 |

> **状态说明**：「计划中」= 尚未打 tag；「已发布」= 仓库里已有该 tag；「已并入」= 内容落在别的 tag，编号保留以免读者迷路。

---

## 后续计划详解（从 04 起）

原则不变：**每阶段一小块、能指回上游相对路径、有验收命令**。permissions 已有，后面工具都挂同一套 `assert`。

### `stage-05-menu`

| 项 | 内容 |
|----|------|
| 对照 | 本地示例 `zen-free-agent` 的 Zen / Go 上游；交互选择相当于迷你 `/models` |
| 迷你目标 | `bun run chat` 先出菜单，用菜单切换 Zen 免费 / Go / 本地，再进入 `you>`；对话中 `/menu` 可再换 |
| 验收 | 选 Zen 免费模型序号后，头一行变成 `agent · model · zen` |
| 文档 | 指南 **[09 启动菜单](/guide/09-menu)** |

### `stage-04-shell`

| 项 | 内容 |
|----|------|
| 上游对照 | `packages/core/src/tool/plugin/shell.ts`、`packages/core/src/shell.ts` |
| 迷你目标 | 模型可 `shell`：在 cwd（或指定目录）跑命令，捕获 stdout/stderr |
| 必做限制 | 超时（如 30s）；`permission.assert({ action: "shell", … })` 默认 **ask**；拒绝交互式 TTY 程序 |
| 不做（本阶段） | 后台 job、PTY、完整 parse/deny 命令表 |
| 验收 | `bun run chat`：「在仓库里跑 `ls`」→ 黄框 permission → `o` → 看到目录列表 |
| 文档 | 指南 **08 工具 shell** |

### `stage-06-session`（编号保留 06）

| 项 | 内容 |
|----|------|
| 上游对照 | `packages/core/src/session/`（store / schema 概念） |
| 迷你目标 | 把 `messages` 落到 `rebuild/.sessions/<id>.json`；`chat --continue [id]` 接着聊 |
| 必做 | 新开 session 打印 id；列表 `sessions` 命令（可极简） |
| 不做 | 多设备同步、compaction、完整 Bus 事件 |
| 验收 | 退出后再 `--continue`，模型仍记得上一轮写过的文件名 |
| 文档 | 指南 **10 Session** |

### `stage-07-search`

| 项 | 内容 |
|----|------|
| 上游对照 | `packages/core/src/tool/plugin/grep.ts`、`glob.ts` |
| 迷你目标 | `grep`（内容搜）+ `glob`（路径模式）；结果截断 |
| 必做 | 默认搜 cwd；external 走已有 `external_directory` |
| 不做 | ripgrep 全特性、UI 高亮 |
| 验收 | 「找出所有含 `agentLoop` 的 ts 文件」→ tool 结果非空 |
| 文档 | 指南 **11 grep/glob** |

### `stage-08-edit`

| 项 | 内容 |
|----|------|
| 上游对照 | `packages/core/src/tool/plugin/edit.ts` |
| 迷你目标 | `edit`：按 old/new 字符串补丁改文件（失败要明确报错） |
| 必做 | 与 `write` 一样走 `edit` permission；唯一匹配才替换 |
| 不做 | diff 预览 UI、undo 栈、formatter |
| 验收 | 改 `fixtures/hello.txt` 一行，read 回来确认 |
| 文档 | 指南 **12 edit** |

### `stage-09-agents`

| 项 | 内容 |
|----|------|
| 上游对照 | `packages/core/src/tool/plugin/subagent.ts`、`packages/core/src/plugin/agent.ts` |
| 迷你目标 | `build` 可派 `explore` 只读子任务，汇总后再答用户 |
| 必做 | explore 的 permissions 已 deny edit——真跑一轮验证 |
| 不做 | 并行多子 agent、完整 job 系统 |
| 验收 | 「让 explore 查一下 permission 目录有哪些文件」→ 有子 agent 轨迹 |
| 文档 | 指南 **13 多 Agent** |

### 选做（`stage-10-…`）

按兴趣择一，不必按序：`webfetch` / `todo` / 问题确认 `question` / 极简 TUI / MCP 只读。每做成一个再打一个 tag。

---

## 推荐学习顺序（时间线）

```text
已发布:  00 → 01 → 02 → 03 → 04-shell → 05-menu
接下来:  06-session → 07-search → 08-edit → 09-agents
选做:    10+
```

`stage-05-permissions` 没有单独的 tag，内容在 `stage-03-write`。已发布的 05 是 `stage-05-menu`。

## 维护方式

每收口一个阶段：

1. 确认文档验收清单与 `rebuild/` 行为  
2. `git tag stage-NN-短名`（需要时再推远程）  
3. 把上表该行的**状态**改成「已发布」  
4. 若增加新阶段，只在表末追加一行，避免改已发布 tag 的含义  
