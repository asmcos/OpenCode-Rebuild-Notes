# 09 启动菜单：切换 Zen / Go

目标：交互式 `bun run chat` 先停在菜单上。用菜单切换 **Zen 免费**、**OpenCode Go**、**本地网关**，或换一个 agent，再进入 `you>`。测试时不用改配置文件就能换模型。

预计时间：20–30 分钟。对应 tag：`stage-05-menu`。

指南编号和 tag 编号不是同一套数。指南 05 仍是 [工具 read](/guide/05-tool-read)；本课是 tag **05**，因为菜单才是 Zen / Go 的切换入口。

::: tip 带一句话启动会跳过菜单
`bun run chat "只回复：OK"` 直接用当前保存的模型。要看到菜单，不要在命令后面写 prompt。
:::

## 9.1 先看上游在选什么

上游用 TUI 对话框选模型，免费模型和普通模型是分开的入口。这里收成终端里的序号菜单。

| 上游路径 | 抓住什么 |
|----------|----------|
| `packages/tui/src/component/dialog-model.tsx` | 会话里选模型 |
| `packages/tui/src/component/dialog-model-free.tsx` | 免费模型单独列出来 |

本地示例 `zen-free-agent` 用 `/zen`、`/go`、`/models` 做同样的事。本课把这三步放进 `chat` 启动时的一张菜单。

## 9.2 你会看到什么

启动时先停在菜单。选模型之后才进入 `you>`。对话中途输入 `/menu` 可以再打开一次。

<Picture name="endpoints" />

<Figure name="menu" />

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild
bun run chat
```

```text
build · beam-free · local
tools read, write, shell · permissions external=ask shell=ask
/menu 菜单 · /exit 退出

菜单
  1) 开始对话   build · beam-free · local
  2) Zen 免费模型
  3) Go 免费模型
  4) 本地网关模型
  5) 切换 agent
  q) 退出
选择>
```

| 输入 | 结果 |
|------|------|
| `1` 或直接回车 | 用当前模型进入 `you>` |
| `2` | 拉取 Zen 免费模型，再选序号 |
| `3` | 拉取 Go 免费模型，再选序号 |
| `4` | 拉取本地 `:8787` 的 `/v1/models` |
| `5` | 在 `build` / `plan` / `explore` 之间换角色，然后回到这张菜单 |
| `0` | 从模型列表或 agent 列表返回，不改当前选择 |
| `q` | 退出 |

选中一个模型后，头一行会换成新的组合，例如 `build · big-pickle · zen`，然后出现 `you>`。对话中途输入 `/menu` 可以再换一次。

`*` 标的是这一侧记住的模型。Zen 和 Go 各自记自己的上次选择，来回切不会互相覆盖。选择写在 gitignore 的 `rebuild/.rebuild-llm.json`。

## 9.3 三个端点

| 菜单 | 端点 | 鉴权 | 列出的模型 |
|------|------|------|------------|
| Zen 免费模型 | `https://opencode.ai/inference/openai/v1` | `Bearer public` | 只要 free。`*contributor*` 不出现 |
| Go 免费模型 | `https://opencode.ai/inference/go/openai/v1` | `Bearer oc_sk_…` | 同样只要 free |
| 本地网关模型 | `http://127.0.0.1:8787/v1` | 网关自己的 key，默认可空 | 网关返回的列表 |

Zen 不用个人 Key，但要 **Bun 1.4.4**。更旧的 Bun 经常得到 HTTP 429。

Go 的 key 不要写进 git：

```bash
OPENCODE_API_KEY=oc_sk_… bun run chat
# 或记到 gitignore 的 prefs，菜单里选 3 就能用
bun run models key set oc_sk_…
bun run models key          # 只打印掩码
```

没有 key 就选 Go 时，菜单停在原地并打印怎么设置。选 `0` 或列表拉取失败也不会改掉当前端点。

本地网关要先在上游克隆里启动，例如：

```bash
~/.bun/bin/bun zen-free-agent/index.mjs --api-only
```

付费模型 id 在 Zen / Go 上会被拒绝。Zen 上不以 `-free` 结尾、但仍算免费的，目前保留 `big-pickle` 和 `grok-code`。

命令行仍然可以直接切，不必进菜单：

```bash
bun run models zen
bun run models use go beam-free
bun run chat --provider zen --model big-pickle "只回复：OK"
```

## 9.4 代码落点

| 本仓库路径 | 作用 |
|------------|------|
| `rebuild/src/cli/session-menu.ts` | 启动菜单、模型序号、agent 序号 |
| `rebuild/src/commands/handlers/chat.ts` | 打出头一行；`/menu` 再打开菜单 |
| `rebuild/src/commands/handlers/models.ts` | `models zen` / `models go`；记住每一侧的模型 |
| `rebuild/src/llm/free-catalog.ts` | 拉目录，丢掉付费和 `*contributor*` |
| `rebuild/src/llm/config.ts` | `zen` / `go` / `local` 的地址和 key |
| `rebuild/src/cli/tty.ts` | 菜单提问时单独占用 stdin，避免和 permission 提示卡死 |

选模型之后才写入 prefs。只打开列表再按 `0`，当前对话用的模型不变。

换 agent 会换掉 system 提示和权限。`plan` 不能写文件，`explore` 只读。选完 agent 还停在菜单，再选 `1` 或一个模型才开始说话。

## 9.5 差距

| 已有 | 尚未做 |
|------|--------|
| 序号菜单切换 Zen / Go / 本地 / agent | 上游那种可搜索的 TUI 模型框 |
| 只列 free，两侧分别记住上次的模型 | 付费模型目录、额度面板 |
| 对话中 `/menu` | 会话落盘后再打开仍记得上一轮（见 `stage-06-session`） |

## 验收清单

- [ ] `bun run chat` 不带 prompt 时，先看到菜单，再出现 `you>`
- [ ] 选 Zen 的一个序号后，头一行是 `… · <模型> · zen`，并且没有个人 Key
- [ ] 再选 Go（已配置 key）或返回 Zen，各自的 `*` 还在上次的模型上
- [ ] 模型列表里按 `0`，当前端点不变
- [ ] 对话里输入 `/menu` 可以换模型
- [ ] `bun run chat "只回复：OK"` 不出现菜单
- [ ] 清楚：`*contributor*` 和付费 id 不会进 Zen / Go 列表

下一步：[10 grep / glob](/guide/10-search)（tag `stage-06-search`）。
