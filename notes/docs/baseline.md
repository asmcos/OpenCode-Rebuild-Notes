# 基线锁定

复刻必须钉住「对照哪一份源码」。否则你读到的文件、跑通的脚本，过几天可能对不上。

## 本笔记锁定的基线

| 项 | 值 |
|----|-----|
| 笔记开始日期 | **2026-10-29** |
| 上游仓库 | [anomalyco/opencode](https://github.com/anomalyco/opencode) |
| 默认分支习惯 | `dev`（见上游 `AGENTS.md`） |
| `package.json` version | **2.2.0** |
| 基线时 packageManager | **bun@1.4.4**（以根 `package.json` 的 `packageManager` 为准；换基线后请重读该字段） |
| 锁定 commit | `fa1260d6ca484fe0fd868aa992ad81ab85343cf3` |
| 短 hash | `fa1260d6ca` |
| commit 日期 | 2026-10-28 |
| commit 说明 | `fix(tui): send pasted image and PDF paths to local servers (#59833)` |
| `git describe` 参考 | `github-v1.2.28-669-gfa1260d6ca` |

出处（上游根目录）：

- `package.json` — `name` / `version` / `packageManager`
- `AGENTS.md` — 默认分支与包依赖方向说明

## 你怎么自己核对

在上游克隆目录里执行：

```bash
cd ~/dev/opencode   # 按你的实际上游路径改

git rev-parse HEAD
git log -1 --format='%H %ci %s'
bun -e 'console.log(require("./package.json").version, require("./package.json").packageManager)'
```

期望大致看到：

- HEAD 以 `fa1260d6ca` 开头（若你主动更新了上游，记下**新** commit，并改本页表格）  
- version `2.2.0`，packageManager `bun@1.4.4`（本基线实测；**其他 bun 版本可能对 OpenCode 访问出现 429**，务必对齐 `packageManager`）

> **重要**：若你 `git pull` 了上游，请立刻更新本页表格，并按新的 `packageManager` 对齐本机 bun，后续步骤注明「相对哪次基线」。不要 silently 混用新旧源码叙述。

## 我们复刻什么、不复刻什么（当前阶段）

**先复刻理解路径上的骨架：**

- bun 多包仓库（workspace）思路  
- CLI 入口如何挂命令  
- 包之间「Schema → Core / Protocol → Server」的依赖方向（概念层）  

**暂时不做：**

- 完整 TUI、Desktop、Console、全部插件  
- 发布流水线、Nix、全量 typecheck 矩阵  

一步能跟着做完，比「文档写得很全但跑不起来」更重要。
