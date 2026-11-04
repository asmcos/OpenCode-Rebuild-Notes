# 10 工具 `grep` / `glob`：先找到再读

目标：模型不用猜路径，也不必用 `shell` 去搜。先用图看它该怎么找，再看命令。

<Figure name="search" />

预计时间：30–45 分钟。对应 tag：`stage-06-search`。

## 10.1 先看上游

| 路径 | 抓住什么 |
|------|----------|
| `packages/core/src/tool/plugin/grep.ts` | `pattern` / `path` / `include`；先 `external_directory`，再 `permission.assert({ action: "grep" })` |
| `packages/core/src/tool/plugin/glob.ts` | `pattern` 对路径；搜索根必须是目录 |
| `packages/core/src/filesystem.ts` | `DEFAULT_SEARCH_LIMIT = 100` |

上游用 ripgrep。本阶段自己遍历目录，行为对齐这三件事：默认 cwd、截断、仓库外路径走已有的 `external_directory`。

## 10.2 本仓库落点

| 路径 | 作用 |
|------|------|
| `rebuild/src/tool/search.ts` | `grepTool` / `globTool` |
| `rebuild/src/tool/defs.ts` | `GREP_TOOL`、`GLOB_TOOL` 进 `TOOLS` |
| `rebuild/src/tool/run.ts` | 按名字分发 |
| `rebuild/src/permission/evaluate.ts` | `explore` 允许 `grep` / `glob`（仍然拒绝改文件） |

跳过 `node_modules`、`.git`、`dist`、`.vitepress`。隐藏文件默认不搜。`.env` 和 `.env.*`（`.env.example` 除外）直接跳过，避免把密钥扫进工具结果。

输出形状跟上游的 `toModelContent` 一样：

```text
Found 2 matches
src/llm/agent-loop.ts:
  Line 34: export async function agentLoop(...)
```

没有命中时是 `No matches found` 或 `No files found`。超过 `limit` 会加一行 truncated。

## 10.3 验收

在 `rebuild/` 里可以直接打工具，不必先叫模型：

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild

~/.bun/bin/bun -e '
import { grepTool, globTool } from "./src/tool/search.ts"
console.log(await grepTool({ pattern: "agentLoop", include: "*.ts" }, process.cwd()))
console.log("---")
console.log(await globTool({ pattern: "src/llm/*.ts" }, process.cwd()))
'
```

期望：`grep` 里有 `src/llm/agent-loop.ts`，`glob` 列出该目录下的 `.ts` 文件。

再进对话：

```bash
bun run chat
# 菜单里开始对话后：
# 找出所有含 agentLoop 的 ts 文件，只根据工具结果回答
```

期望出现 `[tool] grep(...)`，回答里有路径。头一行工具列表包含 `grep, glob`。

## 10.4 差距

| 已有 | 尚未做 |
|------|--------|
| 内容搜 + 路径模式，默认 100 条 | ripgrep 的全套语法、上下文行、UI 高亮 |
| 仓库外目录走 `external_directory` | 按每个命中文件再问一次 `read` 权限 |
| `explore` 可以用这两个工具 | `build` 派 `explore` 去搜（下一阶段之后） |

## 验收清单

- [ ] 能指认上游 `grep` / `glob` 先解析路径，再 `assert`
- [ ] `grep` 能找到 `agentLoop`，结果带行号
- [ ] `glob` 的 `src/llm/*.ts` 非空
- [ ] 非法正则返回 `Error: invalid pattern`，而不是抛到进程外面
- [ ] 清楚：这不是 ripgrep，密钥文件默认不扫

下一步：局部 `edit`，见 [阶段与 Tag](/reference/tags) 里的 `stage-08-edit`。会话落盘仍是 `stage-07-session`。
