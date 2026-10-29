# OpenCode 复刻笔记

从零对照 [OpenCode](https://github.com/anomalyco/opencode) 源码，边读边搭迷你实现，并用 **VitePress** 记录可跟着做的步骤。

## 基线

| 项 | 值 |
|----|-----|
| 笔记日期 | 2026-10-29 |
| 上游版本 | 2.2.0 |
| 锁定 commit | `fa1260d6ca484fe0fd868aa992ad81ab85343cf3` |
| 工具 | bun（对齐上游 `packageManager`；本基线实测 `bun@1.4.4`） |

详情见文档站 [基线锁定](notes/docs/baseline.md)。

## Bun 1.4.4

仓库脚本通过 `scripts/bun.sh` **优先使用** `$HOME/.bun/bin/bun`（避免系统旧 bun）。建议把该目录放到 PATH 最前：

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

## 快速开始

```bash
# 1. 文档预览
cd notes
bun install
bun run dev
# http://127.0.0.1:5173

# 2. 复刻 CLI + Zen 免费 chat（默认无个人 Key）
cd ../rebuild
bun run dev
bun run dev hello
bun run chat --agent build "只回复：OK"
```

完整步骤从文档 **00 环境准备** 开始，不要跳。

## 目录

```text
scripts/bun.sh   # 固定优先 Bun 1.4.x
notes/           # VitePress
rebuild/         # 复刻代码
```

上游源码请单独克隆；文档中的出处均为相对上游根目录的路径。

## 生成静态 HTML

```bash
cd notes
bun run build
# 输出: notes/.vitepress/dist/
```
