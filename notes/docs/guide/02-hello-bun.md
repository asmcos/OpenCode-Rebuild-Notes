# 02 第一个 bun 程序

目标：在本笔记的 `rebuild/` 里，用 bun 跑通一个**最小 CLI**，并学会在注释/文档里写清「灵感来自上游哪份相对路径」。

预计时间：20–40 分钟。

## 2.1 我们模仿什么（先读再写）

上游开发入口：

| 我们要学的点 | 上游相对路径 |
|--------------|--------------|
| 根脚本如何指向 CLI | `package.json`（`scripts.dev`） |
| CLI 用 bun 跑 TypeScript | `packages/cli/src/index.ts`（文件头 shebang） |
| 包名与 bin | `packages/cli/package.json` |

打开对照：

```bash
cd ~/dev/opencode
sed -n '1,5p' packages/cli/src/index.ts
bun -e 'const j=require("./packages/cli/package.json"); console.log(j.name, j.bin, j.scripts.dev)'
```

上游入口很重（Effect、插件、几十个命令）。我们这一步**只保留形状**：

- 一个 `package.json`  
- 一个 `src/index.ts`  
- `bun run dev` 能打印帮助，并支持一个子命令  

## 2.2 目录约定

在笔记仓库：

```text
rebuild/
├── package.json
└── src/
    └── index.ts
```

若你是从零敲，下面命令会创建它们；若仓库里已有同名文件，请打开对照，确保内容一致后再跑。

```bash
cd ~/dev/OpenCode-Rebuild-Notes
mkdir -p rebuild/src
```

## 2.3 写 `rebuild/package.json`

创建文件 `rebuild/package.json`：

```json
{
  "name": "@rebuild/cli",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "packageManager": "bun@1.4.4",
  "scripts": {
    "dev": "bun run src/index.ts"
  }
}
```

说明：

- `name` 用 `@rebuild/cli`，避免和上游 `@opencode/cli` 混淆  
- `scripts.dev` 刻意对齐上游根/`packages/cli`「用 bun 直接跑入口 TS」的习惯  
- 出处对照：`packages/cli/package.json`、`package.json`（`scripts.dev`）

## 2.4 写 `rebuild/src/index.ts`

创建文件 `rebuild/src/index.ts`：

```ts
#!/usr/bin/env bun
/**
 * Mini CLI entry.
 *
 * Inspired by (upstream relative paths):
 * - packages/cli/src/index.ts
 * - packages/cli/package.json (scripts.dev / bin)
 *
 * Intentionally tiny: no Effect, no TUI, no server.
 */

const args = process.argv.slice(2)
const command = args[0]

if (!command || command === "help" || command === "--help" || command === "-h") {
  console.log(`rebuild-cli — OpenCode rebuild scratch CLI

Usage:
  bun run src/index.ts <command>

Commands:
  help     Show this help
  version  Print version
  hello    Print a greeting (optionally: hello <name>)
`)
  process.exit(command ? 0 : 0)
}

if (command === "version") {
  // Keep in sync with rebuild/package.json; later we can read the file like upstream version.ts
  console.log("0.0.1")
  process.exit(0)
}

if (command === "hello") {
  const name = args[1] ?? "opencode"
  console.log(`hello, ${name}`)
  process.exit(0)
}

console.error(`unknown command: ${command}`)
console.error(`try: bun run src/index.ts help`)
process.exit(1)
```

对照说明：

- shebang 与上游 `packages/cli/src/index.ts` 第一行同思路  
- 上游用 `Runtime.handlers` 懒加载大量命令；我们用最直白的 `if`，下一步再谈「命令表」  
- 版本暂时写死；上游有 `packages/cli/src/version.ts`，以后再学  

## 2.5 运行验收

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild

bun run dev
bun run dev version
bun run dev hello
bun run dev hello rebuild
bun run dev nope
```

期望：

| 命令 | 期望 |
|------|------|
| `bun run dev` | 打印 Usage / Commands |
| `bun run dev version` | `0.0.1` |
| `bun run dev hello` | `hello, opencode` |
| `bun run dev hello rebuild` | `hello, rebuild` |
| `bun run dev nope` | 报 unknown，退出码非 0 |

查退出码：

```bash
bun run dev nope; echo "exit=$?"
```

## 2.6 和上游的「像」与「不像」

| 像 | 不像（有意推迟） |
|----|------------------|
| bun 直接跑 TS 入口 | Effect、Layer、Observability |
| `dev` 脚本指向 `src/index.ts` | `bin/opencode.cjs` 打包分发 |
| 子命令分发的雏形 | `commands/handlers/**` 懒加载树 |
| 文件头注明上游相对路径 | 真实 auth / session / service |

下一步（尚未展开，预告）：把 `hello` / `version` 拆成「命令名 → 模块」的小表，形状更接近 `packages/cli/src/index.ts` 里的 `Runtime.handlers`。

## 验收清单

- [ ] `rebuild/package.json` 与 `rebuild/src/index.ts` 存在  
- [ ] `bun run dev` / `version` / `hello` 行为符合上表  
- [ ] 你能指着注释说出对应的上游相对路径  
- [ ] 清楚：这不是 OpenCode，只是复刻路上的第 1 个可运行脚印  

本步完成后，可以停下来休息。下一篇会再拆命令表（仍然很小）。若文档站要刷新：

```bash
cd ~/dev/OpenCode-Rebuild-Notes/notes
bun run dev
```
