# 08 工具 `shell`：受控命令

目标：对齐上游 **ShellTool** 的关键路径——`prepare`（workdir + permission）再前台执行；默认超时；本阶段**不做** background / Job。

预计时间：40–60 分钟。对应 tag：`stage-04-shell`。

## 8.1 先看上游

| 路径 | 抓住什么 |
|------|----------|
| `packages/core/src/tool/plugin/shell.ts` | `name=shell`；Input=`command` / `workdir` / `timeout` / `background`；`DEFAULT_TIMEOUT_MS = 2*60*1000`；`prepare` → create → result |
| `packages/core/src/shell/parse.ts` | 把命令扫成 permission `resource` / `save` |
| `packages/core/src/shell/result.ts` | `notice`（timeout / signal / 非 0 exit） |
| `packages/core/src/shell.ts` | 真正 spawn + 超时杀进程 |

`prepare` 顺序（必须同构）：

1. `FileAccess.resolve` workdir（directory）  
2. `authorizeExternal`（workdir 与解析出的目录）  
3. `permission.assert({ action: "shell", resources, save })`  
4. 确认 workdir 仍是目录，再 spawn  

本阶段简化：不做完整 `ShellParse` / background；permission resource = 整句命令，`save` = `首词 *`。

## 8.2 本仓库落点

| 路径 | 作用 |
|------|------|
| `rebuild/src/tool/shell.ts` | 工具叶：spawn bash -lc、超时、截断 |
| `rebuild/src/shell/prepare.ts` | 迷你 prepare |
| `rebuild/src/shell/result.ts` | notice / formatToolText |
| `rebuild/src/tool/defs.ts` | `SHELL_TOOL` 进 `TOOLS` |

默认规则：`shell *` → **ask**（教学上要看到 permission 框）。`plan` deny shell；`explore` allow shell（对齐上游 explore）。

## 8.3 验收

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild
bun run chat
# you> 在当前目录执行 ls，只根据工具输出简短回复
```

期望：

1. `⟲ running shell…`  
2. 黄色 `permission`：`action: shell`  
3. 输入 `o` 后出现目录列表  
4. 模型基于输出回答  

超时自测：

```bash
bun -e '
import { shellTool } from "./src/tool/shell.ts"
import { allowAsk } from "./src/permission/ask-tty.ts"
import { DEFAULT_PERMISSIONS } from "./src/permission/evaluate.ts"
const perm = { rules: DEFAULT_PERMISSIONS, saved: [], ask: allowAsk }
console.log(await shellTool({ command: "sleep 2", timeout: 200 }, process.cwd(), perm))
'
# 应含 Timed out / exceeded timeout
```

## 8.4 差距

| 已有 | 尚未做 |
|------|--------|
| 前台 shell + timeout + ask | background / Job / 完成通知 |
| 迷你 resource/save | 完整 ShellParse + 目录扫描 |
| bash -lc | PowerShell / ShellSelect |

## 验收清单

- [ ] 能指认上游 `ShellTool.prepare` 三步（external → shell assert → 校验目录）  
- [ ] chat 里 `ls` 会先 permission 再出结果  
- [ ] 超时命令返回 timeout 说明  
- [ ] 清楚：本阶段没有 background  

下一步：[阶段与 Tag](/reference/tags) 里的 `stage-06-session`。
