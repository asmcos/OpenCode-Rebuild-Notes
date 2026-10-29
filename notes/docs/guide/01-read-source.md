# 01 读懂源码仓库

目标：不装全量依赖，也能在上游仓库里「找得到门」。弄清仓库怎么拆成多个包、核心包干什么、CLI 从哪启动。

预计时间：30–45 分钟（纯阅读 + 终端浏览）。

## 1.1 先站在仓库根上看一眼

```bash
cd ~/dev/opencode
ls
```

你会看到（节选，以你的基线为准）：

| 路径 | 作用（入门级理解） |
|------|-------------------|
| `package.json` | 根 workspace、脚本、`packageManager`（决定本机 bun 版本） |
| `bun.lock` | bun 锁文件 |
| `packages/` | 几乎所有可发布/可开发的包 |
| `CONTRIBUTING.md` | 怎么本地开发、包职责简述 |
| `AGENTS.md` | 给贡献者/代理的硬约定（依赖方向、分支等） |
| `README.md` | 产品说明与安装 |

出处：以上均为上游仓库根目录相对路径。

打开根脚本（理解「官方怎么跑」）：

```bash
# 只看 scripts，不必改文件
bun -e 'const p=require("./package.json"); console.log(Object.keys(p.scripts).join("\n"))'
```

入门先记住两个：

| 脚本 | 含义 |
|------|------|
| `dev` | 跑 CLI：`bun run --cwd packages/cli src/index.ts` |
| `dev:web` / `dev:desktop` | Web / Desktop，后面再碰 |

出处：`package.json` → `scripts.dev`。

## 1.2 Workspace 是什么

OpenCode 把很多包放在**同一个 git 仓库**里管理（这种做法常叫 monorepo），用 **bun workspaces**：根 `package.json` 声明多个包目录。

出处：`package.json` → `workspaces.packages`：

```text
packages/*
packages/plugins/*
services/*
packages/console/*
packages/stats/*
```

自己列一下 `packages/`（不用背）：

```bash
ls packages/
```

包很多（`cli`、`core`、`server`、`tui`、`app`…）。**入门只盯下面这张「主链路」**。

## 1.3 主链路：数据与依赖怎么流

上游写得很清楚（请打开原文对照）：

出处：

- `CONTRIBUTING.md` → `### Packages`
- `AGENTS.md` → 关于 Protocol / Server / Client / Schema / Core 的依赖方向

用一张简化图记住：

```text
                  ┌─────────────┐
                  │   schema    │  共享契约（线协议 / 存储形状）
                  └──────┬──────┘
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
        protocol       core         (client 生成物等)
           │             │
           └──────┬──────┘
                  ▼
               server          HTTP / 运行时拼装
                  ▲
                  │
        cli  ─────┴────  tui / app / desktop / sdk …
```

`AGENTS.md` 里的硬规则（复刻时也要遵守精神）：

- Schema → Core、Protocol  
- Core、Protocol → Server  
- Client 运行时可以依赖 Schema、Protocol，**不要**依赖 Core / Server  
- `sdk` 再去组合 Client、Core、Server  

你现在**不用**实现这套图，只要知道：我们后面会先做一个「假 CLI」，再慢慢加 util → schema → …，而不是一上来抄 TUI。

## 1.4 核心包名片（只读文件名级别）

在上游执行，边 ls 边建立印象：

```bash
for p in schema util protocol core server client cli tui plugin sdk; do
  echo "===== packages/$p ====="
  test -f "packages/$p/package.json" && bun -e "const j=require('./packages/$p/package.json'); console.log(j.name, j.version)"
  ls "packages/$p" | head
done
```

对照表（与 `CONTRIBUTING.md` 一致，略作口语化）：

| 相对路径 | 包名（约） | 一句话 |
|----------|------------|--------|
| `packages/schema` | `@opencode/schema` | 共享契约 |
| `packages/util` | `@opencode/util` | 通用工具、Effect 辅助等 |
| `packages/protocol` | `@opencode/protocol` | 对外 API 定义 |
| `packages/core` | `@opencode/core` | 领域逻辑与持久化 |
| `packages/server` | `@opencode/server` | HTTP 服务与运行时拼装 |
| `packages/client` | `@opencode/client` | **生成**的 TS 客户端（勿手改） |
| `packages/cli` | `@opencode/cli` | 命令行入口与服务生命周期 |
| `packages/tui` | `@opencode/tui` | 终端 UI |
| `packages/app` | `@opencode/app` | 共享 Web 界面 |
| `packages/desktop` | （desktop） | Electron 桌面 |
| `packages/plugin` | `@opencode/plugin` | 插件 API |
| `packages/sdk` | `@opencode/sdk` | 对外 SDK 组合 |

更细的包列表见 [包地图](../reference/packages.md)。

## 1.5 找到 CLI 大门

开发时根目录 `bun dev` 实际进入：

出处：`package.json` → `scripts.dev` → `packages/cli/src/index.ts`

打开这个文件（编辑器或）：

```bash
sed -n '1,40p' packages/cli/src/index.ts
```

入门时抓住三件事即可：

1. shebang：`#!/usr/bin/env bun` — 用 bun 直接跑 TS  
2. 用 Effect / Node Runtime 搭运行时  
3. `Commands` + `Runtime.handlers(...)` — 把子命令懒加载到 `commands/handlers/...`

出处：

- `packages/cli/src/index.ts`  
- `packages/cli/src/commands/`（命令定义与 handlers）  

包的 npm 名字与 bin：

出处：`packages/cli/package.json`

- `"name": "@opencode/cli"`  
- `"bin": { "opencode": "./bin/opencode.cjs", ... }`  
- `"scripts.dev": "bun run src/index.ts"`  

## 1.6 一次「只读」漫步（推荐路线）

按顺序打开，每文件只看开头、export、目录结构，**不要深挖实现**：

1. `package.json` — version、scripts、workspaces  
2. `CONTRIBUTING.md` — Packages + Development  
3. `AGENTS.md` — 依赖方向（前几段）  
4. `packages/cli/package.json`  
5. `packages/cli/src/index.ts`（前 ~80 行）  
6. `ls packages/cli/src/commands`  
7. `ls packages/core/src | head`  
8. `ls packages/server/src | head`  

如果某文件太长：先记路径，后面复刻到那一块再精读。

## 1.7 和本笔记 `rebuild/` 的对应关系（心理模型）

| 上游 | 我们现阶段在 `rebuild/` 里做什么 |
|------|----------------------------------|
| 根 workspace | 先单包，以后再拆 workspace |
| `packages/cli` | 下一个步骤：最小 `bun` CLI |
| `packages/util` 等 | 再往后，按需迷你实现 |

**不要**现在就复制整个 `packages/`。复刻是「缩小版同构」，不是 git 拷贝。

## 验收清单

- [ ] 能说出 `bun dev` 最终跑的是哪个相对路径文件  
- [ ] 能说出至少 5 个核心包各自一句话职责  
- [ ] 理解 Schema / Core / Protocol / Server 的依赖方向（能指着 `AGENTS.md` 讲）  
- [ ] 打开过 `packages/cli/src/index.ts`，知道命令是 handlers 懒加载的  

通过后进入 [02 第一个 bun 程序](02-hello-bun.md)。
