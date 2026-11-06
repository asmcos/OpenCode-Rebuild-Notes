# 11 会话：退出后再接着聊

目标：这一轮的 `messages` 写到磁盘上。退出之后用 `--continue` 打开，模型还看得到上一轮说过的话。

<Picture name="session" />

预计时间：30–45 分钟。对应 tag：`stage-07-session`。

## 11.1 先看上游

上游把「这一次聊天」和「里面的消息」拆开放。

| 路径 | 抓住什么 |
|------|----------|
| `packages/schema/src/session.ts` | `Session.Info`：`id`、`title`、`agent`、`time.created` / `time.updated` |
| `packages/core/src/session/sql.ts` | 会话一张表，消息另一张表 |

本课不搬 SQLite，也不做多设备同步和上下文压缩。一个会话一个 JSON 文件，字段对着上面那张 `Info` 收一收：`id`、`title`、`agentId`、时间、`messages`。

## 11.2 本仓库落点

| 路径 | 作用 |
|------|------|
| `rebuild/src/session/store.ts` | 读写 `rebuild/.sessions/<id>.json` |
| `rebuild/src/commands/handlers/chat.ts` | 每轮结束后保存；`--continue` 再读出来 |
| `rebuild/src/commands/handlers/sessions.ts` | 列出已有会话 |

`id` 是 8 位十六进制。标题用你的第一句话，截到 40 个字。目录在 gitignore 里，和模型 key 一样不进仓库。

## 11.3 怎么用

新开一轮会先印出 session id。说完一轮再退出：

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild
bun run chat
# session a1b2c3d4
# you> 记住这个名字：hello.py
# /exit
```

接着聊。不写 id 时，打开最近的一次：

```bash
bun run sessions
bun run chat --continue
bun run chat --continue a1b2c3d4
```

启动和 `--continue` 都直接进入 `you>`。要换模型，输入 `/menu`。

带一句话也可以：

```bash
bun run chat --continue -- "我刚才说的文件名是什么"
```

`--` 后面的字是发给模型的，不会被当成 session id。

## 11.4 和上游的差距

| 已有 | 尚未做 |
|------|--------|
| 一个 JSON 文件记住消息和 agent | SQLite、消息和会话分表 |
| `sessions` 按更新时间列出 | 多设备同步、压缩旧对话 |
| 退出后再 `--continue` | 分叉、归档、撤销 |

## 验收清单

- [ ] 能指认上游 `Session.Info` 在 `packages/schema/src/session.ts`，消息在另一张表
- [ ] `bun run chat` 印出 `session` 和 8 位 id
- [ ] 说一句之后，`rebuild/.sessions/<id>.json` 里有这条 user 消息
- [ ] 退出再 `bun run chat --continue`，文件里的上一轮消息还在
- [ ] `bun run sessions` 能看到 id 和标题
- [ ] 目录 `rebuild/.sessions/` 不在 git 里

下一步：局部 `edit`，见 [阶段与 Tag](/reference/tags) 里的 `stage-08-edit`。
