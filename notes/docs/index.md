# OpenCode 复刻笔记

## 为什么做这个项目

本项目的目的，是让大家**学会如何制作一个 agent**。

选择 [OpenCode](https://github.com/anomalyco/opencode) 的理由很简单：**开源**，而且**好用**。作者花了半年多时间，反复试用、对比了大量开源 agent；真正能接近 Cursor、Claude Code、Codex 体验的，还是 OpenCode。所以我们决定一起揭开 OpenCode 的面纱——一边拆解它怎么做成，一边自己动手搭；走完这条路，你也就学会了如何制作一个 agent。

## 我们怎么学

这份文档记录如何**从零理解并复刻** OpenCode。目标不是一天抄完整个代码，而是：

1. **能跑起来**：环境、工具、最小程序每一步都能亲自验证
2. **能对上号**：每一段复刻代码都能指回上游源码的**相对路径**
3. **能出文档站**：用 VitePress 写 Markdown，`bun run build` 生成静态 HTML

## 怎么用这份文档

按顺序做，不要跳：

| 步骤 | 你要得到什么 |
|------|----------------|
| [基线锁定](/baseline) | 知道我们对照的是哪一天、哪个 commit、哪个版本 |
| [00 环境准备](/guide/00-env) | 本机装好 bun、git、VitePress，目录摆好 |
| [01 读懂源码仓库](/guide/01-read-source) | 知道上游有哪些包、入口在哪、依赖怎么流 |
| [02 第一个 bun 程序](/guide/02-hello-bun) | 在 `rebuild/` 里跑通最小 CLI |
| [03 认识 Agent](/guide/03-what-is-agent) | 弄清 Agent 是「角色配置」，能 list/get 迷你 agent |
| [04 最小 Chat](/guide/04-chat-llm) | 默认 Zen 免费模型对话（无个人 Key，同 zen-free-agent 思路） |

每做完一步，文档里都会有「验收清单」。全部勾上再往下走。

学习进度用 git tag 按阶段冻结（慢慢迭代，收口再打）。对照表见 [阶段与 Tag](/reference/tags)。

## 仓库里有什么

```text
OpenCode-Rebuild-Notes/
├── notes/                # 文档站（VitePress）
│   ├── .vitepress/       # 配置与主题微调
│   ├── docs/             # 你现在看的 Markdown
│   └── package.json
├── rebuild/              # 我们自己写的复刻代码（从最小开始长）
└── README.md
```

上游 OpenCode 源码**不在**本仓库里。请在本机另有一份克隆（例如与本仓库并列放在 `~/dev/opencode`）。文档里提到的源码路径一律写成**相对上游仓库根目录**的路径，例如：

```text
packages/cli/src/index.ts
```

而不是绝对路径。

## 设计原则（复刻节奏）

- **一次只加一小块**：能跑、能解释、能链回源码，再继续
- **先读后写**：每一步先打开上游文件，再在 `rebuild/` 里写迷你版
- **工具跟上游一致**：包管理与脚本用 **bun**，版本以当时上游 `package.json` 的 `packageManager` 为准（错版本可能 429，见 [00 环境准备](/guide/00-env)）

准备好了，从 [基线锁定](/baseline) 开始。
