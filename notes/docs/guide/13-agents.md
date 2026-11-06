# 13 子 agent：让 `build` 派出 `explore`

目标：查找交给只读的 `explore` 去做。它查完，把文字交回 `build`，再由 `build` 回答你。`explore` 改不了文件，也不能再派下一层。

<Picture name="dispatch" />

预计时间：40–60 分钟。对应 tag：`stage-09-agents`。

## 13.1 这个名字

阶段 tag 仍叫 `stage-09-agents`。工具不叫 `agents`。

`agent` 在这份笔记里已经用过了：`build`、`plan`、`explore` 是三张角色卡，菜单里就能换。这一课多出来的是**派出去**。上游工具名是 `subagent`（`packages/core/src/tool/plugin/subagent.ts`）。Claude Code、Cursor 也叫 subagent。OpenAI Agents SDK 把控制权交出去叫做 handoff。LangGraph、CrewAI 常说 multi-agent，由一个 supervisor 调度 worker。迷你版采用上游的名字：`subagent`。

## 13.2 先看上游

| 点 | 上游 | 迷你版 |
|----|------|--------|
| 谁来派 | 主 agent 调用 `subagent` | `build` 调用同名工具 |
| 子角色 | `explore` 先拒绝全部动作，再放开读和搜索（`packages/core/src/plugin/agent.ts`） | 同一套规则，写在 `EXPLORE_PERMISSIONS` |
| 子会话 | 新的 session，上下文是空的 | 不落盘。只把系统提示和这次 `prompt` 交给它 |
| 跑完 | 默认前台，等它回答 | 同。不做后台，也不能用 session id 接着问 |
| 再派一层 | `explore` 的 `subagent` 权限是 deny | 子列表里拿掉 `subagent`，深度大于 0 再拒绝一次 |

`prompt` 必须自带任务说明。子 agent 看不到你和 `build` 的上一句。

## 13.3 本仓库落点

| 路径 | 作用 |
|------|------|
| `rebuild/src/tool/subagent.ts` | 检查权限，用 `explore` 的规则跑一轮 `agentLoop`，把文字交回 |
| `rebuild/src/tool/defs.ts` | 发给 `build` 的工具列表里有 `subagent` |
| `rebuild/src/permission/evaluate.ts` | `plan` 和 `explore` 拒绝 `subagent`；`explore` 拒绝 `edit` |
| `rebuild/src/agent/registry.ts` | `build` 的系统提示：用户点名 explore 时要去调用工具，不要自己搜 |

终端里子工具会多一个前缀，例如 `[tool] explore glob(...)`。这就是轨迹。

## 13.4 怎么验收

在 `rebuild/` 下：

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild
bun run chat
```

```text
you> 让 explore 查一下 src/permission 目录有哪些文件
```

你应该看到 `subagent` 被调用，接着是 `explore` 的 `glob` 或 `read`，最后 `build` 用这些结果回答。不要换成 explore 自己来聊；那只是菜单换角色，不是这一课。

再确认它改不了文件。`explore` 的规则会拒绝 `edit`。派它去改 `fixtures/hello.txt`，工具结果应以 `Error:` 开头，夹具保持原样。

## 13.5 和上游的差距

| 已有 | 尚未做 |
|------|--------|
| 前台派出 `explore`，等它答完 | 后台运行、用 session id 追问 |
| 子 agent 读和搜索，`edit` 被拒绝 | 并行多个子 agent、任务队列 |
| 终端里有 `explore` 前缀 | 单独的子会话文件 |

## 验收清单

- [ ] 能指认上游 `packages/core/src/tool/plugin/subagent.ts` 和 `explore` 的权限在 `packages/core/src/plugin/agent.ts`
- [ ] 「让 explore 查一下 src/permission 目录有哪些文件」出现 `explore` 的工具轨迹
- [ ] 回答来自 `build`，不是你在菜单里改成 explore 之后自己问的
- [ ] `explore` 去 `edit` 时得到 `Error:`，`fixtures/hello.txt` 未改
- [ ] 清楚：tag 叫 `stage-09-agents`，工具叫 `subagent`

下一步按兴趣选做：`webfetch`、`todo`、问题确认，见 [阶段与 Tag](/reference/tags) 里的 `stage-10-…`。
