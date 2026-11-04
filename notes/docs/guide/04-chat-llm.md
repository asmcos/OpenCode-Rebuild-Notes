# 04 接真实模型：最小 Chat

目标：用上一章的 **agent.system** 当角色提示，默认走 **本地 OpenAI 兼容网关**（`http://127.0.0.1:8787/v1`，如 zen-free-agent），**不必配置个人 API Key**。Zen 直连仍可选，但常限流。

预计时间：40–60 分钟。对应已发布 tag：`stage-01-chat`（含 03 的 agent 形状 + 本章 chat）。

::: tip 和 03 的关系
[03 认识 Agent](/guide/03-what-is-agent) 只定义角色；**本章才接模型**。两者同属 `stage-01-chat`。
:::

## 4.1 默认：本地 OpenAI 兼容网关（`:8787`）

Zen 直连经常 429。推荐先起 **zen-free-agent** 本地 API（上游克隆里），再让 rebuild 当客户端：

```bash
# 终端 1（在 opencode 仓库）
~/.bun/bin/bun zen-free-agent/index.mjs --api-only
# → http://127.0.0.1:8787/v1
```

对照：`zen-free-agent/README.md`（OpenAI 兼容接口一节）。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/models` | 列模型 |
| POST | `/v1/chat/completions` | 对话（`stream: true/false`） |

```bash
curl -s http://127.0.0.1:8787/v1/models

curl -s http://127.0.0.1:8787/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"beam-free","messages":[{"role":"user","content":"只回复：OK"}]}'

curl -N http://127.0.0.1:8787/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"beam-free","stream":true,"messages":[{"role":"user","content":"你好"}]}'
```

仍可选 `REBUILD_LLM_PROVIDER=zen` 直连 Zen（门闸字段见源码 `zen-free.ts`），但课程默认改为 **`local`**。

## 4.2 选模型 + 聊天

`rebuild` 的脚本已通过 `scripts/bun.sh` 优先使用 **`$HOME/.bun/bin/bun`（1.4.x）**。

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild

bun run models              # 列出 /v1/models，可交互选择
bun run models use beam-free

bun run chat                # 先出菜单：Zen / Go / 本地模型 / agent
bun run chat --model beam-free "只回复：OK"
bun run chat --no-stream --agent build "你好"
```

选择结果写入 `rebuild/.rebuild-llm.json`（gitignore）。

| 变量 | 含义 |
|------|------|
| `REBUILD_LLM_PROVIDER` | `local`（默认）/ `zen` / `go` / `openai` |
| `REBUILD_LLM_BASE_URL` | 默认 `http://127.0.0.1:8787/v1` |
| `REBUILD_LLM_MODEL` / `MODEL` | 默认 `beam-free`（可被 prefs 覆盖） |
| `BUN_BIN` | 覆盖 bun 路径 |
| `OPENCODE_ZEN_URL` | 仅 `provider=zen` 时用 |
| `OPENCODE_GO_URL` | 仅 `provider=go` 时用 |
| `OPENCODE_API_KEY` | Go 的 `oc_sk_…`（或 `bun run models key set`，写入 gitignore） |
| `OPENCODE_VERSION` | Zen User-Agent 版本，默认 `2.2.0` |

## 4.3 代码落点

| 本仓库路径 | 作用 |
|------------|------|
| `rebuild/src/llm/openai-stream.ts` | OpenAI 兼容 `/models` + chat（流式/非流式 + tools） |
| `rebuild/src/llm/prefs.ts` | 本地模型偏好 `.rebuild-llm.json` |
| `rebuild/src/llm/config.ts` | 默认 `provider=local` → `:8787` |
| `rebuild/src/llm/zen-free.ts` | Zen 免费流式（可选） |
| `rebuild/src/llm/free-catalog.ts` | Zen / Go 免费模型目录（丢掉付费和 `*contributor*`） |
| `rebuild/src/commands/handlers/models.ts` | `models zen` / `models go` / `models use` |
| `rebuild/src/commands/handlers/chat.ts` | 绑定 agent + REPL |

## 4.4 可选：自带 Key 的 OpenAI 兼容端

一般课程**不需要**。若要接自己的兼容网关：

```bash
REBUILD_LLM_PROVIDER=openai \
REBUILD_LLM_API_KEY=sk-... \
REBUILD_LLM_BASE_URL=https://api.openai.com/v1 \
REBUILD_LLM_MODEL=gpt-4o-mini \
bun run chat
```

示例见 `rebuild/.env.example`。不要提交 `.env`。

## 4.5 差距

| 已有 | 尚未做（见下一章） |
|------|--------|
| 本地网关真实对话 + 选模型 | 完整 tool 执行循环 → [05](/guide/05-tool-read) |
| agent.system 差异 | permissions、TUI、持久 Session |
| Zen 免费与 Go 互切，`models` 只列 free | 完整 provider catalog、付费模型 |

## 4.6 Zen 免费与 Go 互切

对应 tag：`stage-05-menu`。`bun run chat` 的启动菜单用来切换 Zen 免费、Go 和本地网关。目录只列出 free（`*contributor*` 不出现），并记住每一侧上次的模型。

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild

bun run models zen                 # 切到 Zen，列出免费模型
bun run models go                  # 切到 Go
bun run models use 2               # 当前这一侧选第 2 个
bun run models use go beam-free    # 切到 Go 并选模型
bun run models local               # 回到 :8787

bun run chat                       # 用刚才保存的端点 + 模型
```

Go 需要 key，而且**不要写进 git**：

```bash
OPENCODE_API_KEY=oc_sk_… bun run models go
# 或者记到 gitignore 的 rebuild/.rebuild-llm.json
bun run models key set oc_sk_…
bun run models key                 # 只打印掩码，不打印全文
```

| 端点 | 鉴权 | Chat |
|------|------|------|
| `zen` | `Bearer public` | `https://opencode.ai/inference/openai/v1` |
| `go` | `Bearer oc_sk_…` | `https://opencode.ai/inference/go/openai/v1` |

非 free 的 id（例如不带 `-free`、也不是 Zen 的 `big-pickle` / `grok-code`）会被拒绝。

## 验收清单

- [ ] 网关已起：`curl -s http://127.0.0.1:8787/v1/models` 能看到模型
- [ ] `bun run models` 能列出并选择模型
- [ ] `bun run models zen` 与 `bun run models go` 能互相切换，且列表里只有 free 模型
- [ ] `bun run chat` **不配个人 Key** 能拿到回复
- [ ] 换 `--agent plan` 能感到 system 不同
- [ ] 清楚：这是教学简化版，完整实现见上游 `aisdk` / `zen-free-agent`

下一步：[05 工具 read](/guide/05-tool-read)。
