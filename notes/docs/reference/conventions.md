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

## 学习阶段 Tag

- 命名：`stage-NN-短名`；阶段验收通过后再打 tag，不提前打  
- 计划与状态见 [阶段与 Tag](/reference/tags)
