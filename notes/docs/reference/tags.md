# 学习阶段与 Git Tag

本复刻仓库按**阶段**推进：文档写一段、`rebuild/` 长一点，阶段收口后再打 git tag，方便读者 `checkout` 回到某一课结束时的状态。

上游 OpenCode 的版本/commit 仍以 [基线锁定](/baseline) 为准；这里的 tag **只标记本笔记仓库**的学习进度。

## 约定

| 项 | 说明 |
|----|------|
| 命名 | `stage-NN-短名`，`NN` 两位数字，与指南编号大致对齐 |
| 何时打 tag | 该阶段文档验收清单通过，且 `rebuild/` 行为稳定之后——**不提前打** |
| 节奏 | 一次只做一个小阶段，慢慢迭代；附录可先写计划，状态栏再从「计划」改为「已发布」 |
| 查阅 | `git tag -l 'stage-*'` |

回看某一阶段：

```bash
cd ~/dev/OpenCode-Rebuild-Notes
git fetch --tags          # 若从远程学
git checkout stage-00-bootstrap   # 换成表里的名字
```

回到最新学习分支（名称以你仓库为准）：

```bash
git checkout main   # 或 master / 你的开发分支
```

## 阶段对照表

| Tag | 状态 | 对应文档 | 本阶段结束时应有什么 |
|-----|------|----------|----------------------|
| `stage-00-bootstrap` | 已发布 | [基线](/baseline)、[00](/guide/00-env)、[01](/guide/01-read-source)、[02](/guide/02-hello-bun) | VitePress 文档站可预览；`rebuild/` 最小 CLI（`help` / `version` / `hello`）能跑 |
| `stage-01-what-is-agent` | 已发布（并入 `stage-02-chat`） | [03 认识 Agent](/guide/03-what-is-agent) | 迷你 `AgentInfo` + registry；`agent list/get/resolve`（不调 LLM） |
| `stage-02-chat` | 已发布 | [03](/guide/03-what-is-agent)、[04 最小 Chat](/guide/04-chat-llm) | Zen 免费对话 + agent.system；`bun run chat`；`scripts/bun.sh` 固定 1.4.x |
| `stage-03-…` | 计划中 | 待定 | tool / 权限等；按指南追加 |

> **状态说明**：「计划中」= 名字已定、尚未打 tag；「已发布」= 仓库里已有该 tag，可 checkout。

## 维护方式

每收口一个阶段：

1. 确认文档验收清单与 `rebuild/` 行为  
2. `git tag stage-NN-短名`（需要时再推远程）  
3. 把上表该行的**状态**改成「已发布」  
4. 若增加新阶段，只在表末追加一行，避免改已发布 tag 的含义  
