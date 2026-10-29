# 05 工具循环：先让 `read` 真的读文件

目标：模型不再只会聊天——它可以发出 `read` **tool_call**，本地执行后把内容喂回去，再生成最终回答。这是 agent 和「纯聊天机器人」的分界线。

预计时间：45–70 分钟。对应 tag 计划：`stage-02-tools`（收口后再打）。

## 5.1 心智模型

```text
user
  → model（可能返回 tool_calls）
  → 本地执行 read(path)
  → role=tool 把结果塞回 messages
  → model 再答（可多轮）
```

上游对照（浏览即可）：

| 相对路径 | 作用 |
|----------|------|
| `packages/core/src/tool/plugin/read.ts` | 正式 `read` 工具（name / path / 权限） |
| `packages/core/src/tool/read-filesystem.ts` | 读文件实现 |
| `packages/core/src/tool/runtime.ts` | 工具运行时 |

教学版不搬 Effect，逻辑更接近示例里的 `agentAsk` 循环。

## 5.2 本仓库代码落点

| 路径 | 作用 |
|------|------|
| `rebuild/src/tool/defs.ts` | 发给模型的 tools 列表 |
| `rebuild/src/tool/read.ts` | 只读 **cwd 内** 文本文件 |
| `rebuild/src/tool/run.ts` | 按名字分发 |
| `rebuild/src/llm/zen-free.ts` | 流式解析 `delta.tool_calls` |
| `rebuild/src/llm/agent-loop.ts` | complete → tool → complete |
| `rebuild/src/commands/handlers/chat.ts` | 接上循环；青色打印 `[tool] …` |

安全：`read` 拒绝逃出工作目录的路径（`../` 等）。

## 5.3 怎么验收

在 `rebuild/` 下（经 `scripts/bun.sh` 用 Bun 1.4.x）：

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild

bun run chat --agent build "请用 read 工具读取 fixtures/hello.txt，只把文件原文回复给我"
```

期望大致看到：

1. 青色 `[tool] read({...})`  
2. `[tool] → rebuild-fixture: hello from stage-02-tools…`  
3. 最终回答里包含该文件内容  

也可交互：

```bash
bun run chat
you> 读一下 fixtures/hello.txt，摘要一句
```

## 5.4 和上游的差距

| 已有 | 尚未做 |
|------|--------|
| `read` 真执行 + 多步循环 | `write` / `bash` / grep 等 |
| cwd 路径沙箱 | 完整 permissions / FileAccess |
| 流式 tool_calls 拼装 | 图片 / PDF / 分页 |

## 验收清单

- [ ] 能指认上游 `packages/core/src/tool/plugin/read.ts`  
- [ ] `bun run chat` 触发 `read` 时终端出现 `[tool]` 日志  
- [ ] 模型最终回答依赖了 `fixtures/hello.txt` 的内容  
- [ ] 试图 `read` 目录外路径会返回 Error（可自行试 `../`）  
