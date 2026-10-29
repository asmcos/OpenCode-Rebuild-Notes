# 04 接真实模型：最小 Chat（Zen 免费）

目标：用上一章的 **agent.system** 当角色提示，**默认走 OpenCode Zen 免费模型**，**不必配置个人 API Key**，和 `zen-free-agent` / `chat-zen-free.mjs` 同一类接法。

预计时间：40–60 分钟。对应 tag 计划：`stage-02-chat`。

::: tip 和 stage-01 的关系
[03 认识 Agent](/guide/03-what-is-agent) 只定义角色；**本章才接模型**。
:::

## 4.1 默认：Zen 免费（无个人 Key）

对照（在你的上游 OpenCode 克隆里，相对路径）：

- `chat-zen-free.mjs`
- `zen-free-agent/index.mjs`、`zen-free-agent/README.md`

要点：

| 项 | 说明 |
|----|------|
| 鉴权 | `Authorization: Bearer public`（客户端门闸，不是你的付费 Key） |
| 运行时 | **必须 Bun ≥ 1.4**（Node / 旧 Bun 容易 429） |
| 请求 | 必须 `stream: true`；带名为 `read` 的 tool；system 里含 `<env>…Working directory…</env>`；`ses_` 会话 id |
| 模型 | 免费模型，例如 `flint-40b-free` |

上游完整栈更重：`packages/core/src/aisdk.ts` 等。我们只复刻「能对话」的最短客户端。

## 4.2 直接聊（无需 .env）

`rebuild` 的脚本已通过 `scripts/bun.sh` 优先使用 **`$HOME/.bun/bin/bun`（1.4.x）**，不必每次手写路径。

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild

# 交互多轮（/exit 结束）
bun run chat
# 或
bun run dev chat --agent plan

# 单次
bun run dev chat --agent build "用一句话介绍你的职责"
```

可选环境变量：

| 变量 | 含义 |
|------|------|
| `REBUILD_LLM_MODEL` / `MODEL` | 默认 `flint-40b-free` |
| `OPENCODE_ZEN_URL` | 默认 `https://opencode.ai/inference/openai/v1` |
| `OPENCODE_VERSION` | User-Agent 里的版本，默认 `2.2.0` |
| `BUN_BIN` | 覆盖 bun 可执行文件路径 |


## 4.3 代码落点

| 本仓库路径 | 作用 |
|------------|------|
| `rebuild/src/llm/zen-free.ts` | Zen 免费流式 chat + 门闸字段 |
| `rebuild/src/llm/zen-id.ts` | `ses_` + descending id |
| `rebuild/src/llm/config.ts` | 默认 `provider=zen` |
| `rebuild/src/commands/handlers/chat.ts` | 绑定 agent + REPL |

若出现 429 / FreeUsageLimit，按 stderr 提示检查：Bun 版本、stream、read tool、ses_、`<env>`、User-Agent。

## 4.4 可选：自带 Key 的 OpenAI 兼容端

一般课程**不需要**。若要接自己的兼容网关：

```bash
REBUILD_LLM_PROVIDER=openai \
REBUILD_LLM_API_KEY=sk-... \
REBUILD_LLM_BASE_URL=https://api.openai.com/v1 \
REBUILD_LLM_MODEL=gpt-4o-mini \
bun run dev chat
```

示例见 `rebuild/.env.example`。不要提交 `.env`。

## 4.5 差距

| 已有 | 尚未做 |
|------|--------|
| Zen 免费真实对话 | 完整 tool 执行循环（现仅占位 `read` 过门闸） |
| agent.system 差异 | permissions、TUI、持久 Session |
| 与 zen-free-agent 同类接法 | Go 上游 `oc_sk_…`、本地 8787 代理服务 |

## 验收清单

- [ ] `bun run chat`（经 `scripts/bun.sh` 用上 1.4.x），**不配个人 Key** 能拿到回复
- [ ] 换 `--agent plan` 能感到 system 不同  
- [ ] 知道 429 时优先查 Bun≥1.4 与 Zen 门闸字段  
- [ ] 清楚：这是教学简化版，完整实现见上游 `aisdk` / `zen-free-agent`  
