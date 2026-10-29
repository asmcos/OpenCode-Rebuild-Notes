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

## 快速开始

```bash
# 1. 文档预览（VitePress，可导出静态站）
cd notes
bun install
bun run dev
# 浏览器打开终端提示的地址，一般是 http://127.0.0.1:5173

# 2. 跑最小复刻 CLI
cd ../rebuild
bun run dev
bun run dev hello
```

完整步骤从文档 **00 环境准备** 开始，不要跳。

## 目录

```text
notes/           # VitePress：.vitepress/ + docs/
rebuild/         # 复刻代码（由小到大）
```

上游源码请单独克隆；文档中的出处均为相对上游根目录的路径。

## 生成静态 HTML

可以。VitePress 构建产物是纯静态文件：

```bash
cd notes
bun run build
# 输出: notes/.vitepress/dist/

bun run preview   # 本地预览构建结果
```

把 `dist/` 部署到任意静态托管即可。
