# 06 工具 `write`：写文件（对齐 FileAccess）

目标：在已有 `read` 循环上，加上 **`write`**——模型可以创建/覆盖文本文件。验收路径是：**写 → 再读**，确认磁盘上真有内容。

<Picture name="writefile" />

预计时间：40–60 分钟。对应 tag：`stage-03-write`。

## 6.1 先看上游

出处：`packages/core/src/tool/plugin/write.ts` + `packages/core/src/file-access.ts`

入门抓住：

| 点 | 上游 | 我们迷你版 |
|----|------|------------|
| 名字 | `write` | 同名 |
| 参数 | `path` + `content` | 同 |
| 路径 | `FileAccess.resolve`：相对 → Location；绝对在 Location/worktree 外 → **external** | 同：标 `external`，但先一律允许 |
| 权限 | `external_directory` 再 `edit` | **先不做**（permissions 阶段） |
| `/tmp` | **不特殊**；只是普通绝对路径。system 里会偏好 `$TMPDIR/opencode` | 同：不特殊拦截 |

上游 **没有**「必须停在 cwd 里」的硬围栏。逃出 cwd 靠权限层，不是路径解析层直接 `Error`。

## 6.2 本仓库落点

| 路径 | 作用 |
|------|------|
| `rebuild/src/tool/paths.ts` | 迷你 `resolvePath` / `contains` / internal·external |
| `rebuild/src/tool/write.ts` | 执行写入 |
| `rebuild/src/tool/defs.ts` | `TOOLS = [read, write]` |
| `rebuild/src/tool/run.ts` | 按名字分发 |

## 6.3 验收

在 `rebuild/` 下：

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild

bun run chat --agent build "用 write 在 fixtures/out-stage03.txt 写入一行：stage-03-write-ok，然后用 read 读回来，只回复文件原文"
```

期望：

1. 出现青色 `[tool] write(...)`  
2. 出现 `[tool] read(...)`（或等价的读回）  
3. 最终回答含 `stage-03-write-ok`  
4. 磁盘上存在该文件：

```bash
cat fixtures/out-stage03.txt
```

外部路径（对齐上游「可写 /tmp」）：

```bash
bun -e 'import { writeFileTool } from "./src/tool/write.ts"; console.log(await writeFileTool({ path: "/tmp/rebuild-demo.html", content: "<h1>ok</h1>" }))'
# → Created file successfully: /tmp/rebuild-demo.html (external path; …)
```

## 6.4 和上游的差距

| 已有 | 尚未做 |
|------|--------|
| write + 自动建目录；absolute/external 可写 | `edit`、undo、formatter |
| internal/external 分类 | 见 [07 权限](/guide/07-permissions) |
| system 提示区分 plan/explore 勿写 | 按 agent 裁剪 tools 列表 |

## 验收清单

- [ ] 能指认上游 `packages/core/src/tool/plugin/write.ts` 与 `file-access.ts`
- [ ] `bun run chat` 能写出 `fixtures/out-stage03.txt`（或你指定的路径）
- [ ] `/tmp/...` 可写（不是特殊目录，只是 external）
- [ ] 清楚：现在还没有权限系统，external 一律放行

下一步：[07 权限](/guide/07-permissions)。
