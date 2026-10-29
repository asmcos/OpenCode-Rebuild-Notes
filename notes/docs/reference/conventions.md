# 本笔记约定

## 源码出处怎么写

- 只写**相对上游仓库根目录**的路径，例如 `packages/cli/src/index.ts`
- 不要写 `/home/.../opencode/...` 这类绝对路径
- 代码文件顶部用简短注释列出 inspired-by 路径
- 文档表格用「出处：`相对路径`」

## 版本与日期

- 改基线时先改 `notes/docs/baseline.md`，再改相关指南里的 commit
- `notes/.vitepress/config.mts` 页脚 / 注释里的基线信息与 baseline 保持一致

## 复刻节奏

- 每一步必须：可读原文 → 写迷你实现 → 有命令验收
- 不一次引入过多上游概念（Effect、TUI、完整 server 等）
- 包管理与脚本优先用 **bun**

## 文档站（VitePress）

在 `notes/` 目录下：

```bash
cd notes
bun install
bun run dev       # 本地预览
bun run build     # 静态站 → .vitepress/dist
bun run preview   # 预览构建产物
```

### 个性化 `base`（避免和大纲冲突）

共享的 `notes/.vitepress/config.mts` 里维护 **nav / sidebar**（大家都会改）。  
你自己的部署前缀（例如 `base: '/ocnotes/'`）**不要**写进该文件，否则每次合大纲容易冲突。

做法二选一：

1. 复制示例为本地文件（已 gitignore，必须用 **`.mjs`**）：

```bash
cp notes/.vitepress/config.local.mjs.example notes/.vitepress/config.local.mjs
# 编辑其中的 base
```

2. 或临时环境变量：

```bash
VP_BASE=/ocnotes/ bun run build
```

`config.local.mjs` 里只放个性化字段，**不要**整份复制 nav/sidebar。

## 学习阶段 Tag

- 命名：`stage-NN-短名`；阶段验收通过后再打 tag，不提前打  
- 计划与状态见 [阶段与 Tag](/reference/tags)
