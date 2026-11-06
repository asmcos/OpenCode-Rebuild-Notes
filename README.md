# OpenCode 复刻笔记

对照 [OpenCode](https://github.com/anomalyco/opencode) 的源码，从零搭一个能对话、读文件、改文件、跑命令的迷你 coding agent。每完成一块就有文档和 git tag，克隆下来就能跑，不必先读完上游。

当前进度：**`stage-08-edit`**。模型可以用 `edit` 只改文件里的一段。退出后 `bun run chat --continue` 还能接着聊；`/menu` 切换 **Zen 免费模型**、**OpenCode Go** 或本地网关。

## 三分钟试一次

需要 **Bun 1.4.4**（和上游 `packageManager` 一致；更旧的 Bun 访问 Zen 经常 429）。

```bash
git clone https://github.com/asmcos/OpenCode-Rebuild-Notes.git
cd OpenCode-Rebuild-Notes/rebuild
bun run chat
```

进入 `you>` 后输入 `/menu`，选 **2) Zen 免费模型**，再选一个序号，然后输入：

```text
读一下仓库根目录的 README.md，用三句话说明这个项目能做什么
```

Zen 免费模型不用个人 API Key。Go 需要自己的 `oc_sk_…`（不要写进 git）。对话里输入 `/menu` 可以换模型或 agent，`/exit` 退出。

想看讲解而不是先跑代码：

```bash
cd notes
bun install
bun run dev
# http://127.0.0.1:5173
```

## 这一版已经能做什么

| 能力 | 你怎么用到它 |
|------|----------------|
| 选模型和 agent | 对话里输入 `/menu` |
| 免费模型 | Zen：`Bearer public`；Go：你的 key。列表里只有 free 模型 |
| 读、写、改一段、执行命令 | 让它读文件、写文件、用 `edit` 改一段，或跑 `ls` 这类命令 |
| 权限 | 写仓库外路径、跑 shell 时会停下来问你 |
| 按阶段回看 | `git checkout stage-05-menu`（更早的 tag 见下表） |

这是教学用的迷你实现，用来看清 agent 循环怎么接起来。它不是 OpenCode 本体，没有上游那套 TUI、会话同步和完整工具表。

## 学习顺序

文档按这个顺序写。tag 标的是本仓库的进度，不是上游版本号。

| Tag | 走到这里会得到 |
|-----|----------------|
| `stage-00-bootstrap` | 文档站和最小 CLI |
| `stage-01-chat` | 带角色的真实对话 |
| `stage-02-tools` | 模型可以 `read` 文件 |
| `stage-03-write` | `write`、本地网关、权限 |
| `stage-04-shell` | 受控 `shell`，执行前询问 |
| `stage-05-menu` | 菜单切换 Zen / Go / 本地模型。讲解：[09 启动菜单](notes/docs/guide/09-menu.md) |
| `stage-06-search` | `grep` / `glob` 找文件。讲解：[10 搜索](notes/docs/guide/10-search.md) |
| `stage-07-session` | 会话落盘，`chat --continue`。讲解：[11 会话](notes/docs/guide/11-session.md) |
| `stage-08-edit` | `edit` 按原文替换一段。讲解：[12 局部修改](notes/docs/guide/12-tool-edit.md) |

下一步还没做：子 agent。说明在文档站的 [阶段与 Tag](notes/docs/reference/tags.md)。局部修改的用法见 [12 局部修改](notes/docs/guide/12-tool-edit.md)。

## 基线

| 项 | 值 |
|----|-----|
| 笔记开始 | 2026-10-29 |
| 上游 | [OpenCode 2.2.0](https://github.com/anomalyco/opencode) |
| 锁定 commit | `fa1260d6ca484fe0fd868aa992ad81ab85343cf3` |
| Bun | 1.4.4 |

上游请另外克隆，只作对照。文档里的源码路径都相对上游根目录，例如 `packages/cli/src/index.ts`。

仓库脚本会优先用 `$HOME/.bun/bin/bun`：

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

## 目录

```text
OpenCode-Rebuild-Notes/
├── notes/          # VitePress 文档
├── rebuild/        # 迷你 agent（chat、工具、权限、菜单）
└── scripts/bun.sh  # 固定优先 Bun 1.4.x
```

生成静态文档：

```bash
cd notes
bun run build
# notes/.vitepress/dist/
```
