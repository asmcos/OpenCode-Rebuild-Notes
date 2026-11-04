# 07 权限：allow / ask / deny

目标：对齐上游 **Permission**——写 `/tmp` 时不应是模型闲聊「要什么网页」，而是 harness 弹出 **permission ask**（`once` / `always` / `reject`）。

预计时间：40–60 分钟。对应 tag：`stage-03-write`（权限提前并入本阶段）。

## 7.1 上游怎么做

| 路径 | 作用 |
|------|------|
| `packages/schema/src/permission.ts` | Rule / Effect / Reply=`once\|always\|reject` |
| `packages/core/src/permission.ts` | `evaluate`（**findLast**）+ `assert` |
| `packages/core/src/file-write.ts` | 先 `external_directory`，再 `edit` |
| `packages/schema/src/agent.ts` | `Agent.Info.default` |

上游 **schema 默认**几乎全 `allow`，因此裸默认写 `/tmp` 往往**不问**。但工具路径上 **一定会** `assert(external_directory)`；只要规则是 `ask`，UI 就会出现权限卡（不是让模型追问需求）。

本课默认在 build 规则末尾加上：

```ts
{ action: "external_directory", resource: "*", effect: "ask" }
```

这样说「写到 /tmp」会先看到权限提示。若要完全贴 schema 默认：`bun run chat --allow-external`。

<Figure name="permissions" />

## 7.2 期望对话形态

```text
you> 帮我写一个 python 放在 /tmp
⟲ calling model (local/beam-free)…
assistant>
[tool] write({"path":"/tmp/hello.py",...})
⟲ running write (may ask permission if path is outside cwd)…
╭─ permission (OpenCode-style) ──
│ action:   external_directory
│ resource: /tmp/*
│  o once / a always / r reject
Waiting for your reply…
permission>
```

- **o** = 本次允许  
- **a** = 本 session 记住 `/tmp/*`  
- **r** = 拒绝，write 失败返回给模型  

若「一动不动」：以前是 chat 的 `you>` readline 没关，和 `permission>` 抢 stdin（假死）。现在每轮会先关掉 REPL 再跑工具。看 stderr 上的 `⟲` 状态行，以及黄色 `permission>` —— **在那里输入 o/a/r**，不是继续在 `you>` 里打字。

模型若只追问「要什么风格」而**不调用 write**，权限层永远不会出现——那是提示词问题，不是权限问题。

## 7.3 本仓库落点

| 路径 | 作用 |
|------|------|
| `rebuild/src/permission/evaluate.ts` | 默认规则（含 external ask） |
| `rebuild/src/permission/assert.ts` | assert + always → saved |
| `rebuild/src/permission/file-access.ts` | write/read 双层 assert |
| `rebuild/src/permission/ask-tty.ts` | TTY：`o`/`a`/`r` |

## 7.4 怎么试

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild

# 应弹出 permission> 而不是问网页类型
bun run chat "帮我写一个网页存到 /tmp/index.html，写完只回复路径"

# 对齐上游 schema 默认（/tmp 不问）
bun run chat --allow-external "写 /tmp/x.html 一行 hi"

# explore 不能 edit
bun run chat --agent explore "用 write 写 fixtures/nope.txt"
```

## 验收清单

- [ ] 「写到 /tmp」→ 先 `permission ask: external_directory`，不是模型问风格  
- [ ] `o`/`a`/`r` 行为正确；`a` 后同 session 不再问 `/tmp/*`  
- [ ] cwd 内 write 仍直接允许  
- [ ] 知道：上游 schema 默认更松；本课为展示 UX 默认 ask external  

下一步：shell 或 session。
