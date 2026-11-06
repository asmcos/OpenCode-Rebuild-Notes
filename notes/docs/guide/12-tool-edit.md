# 12 工具 `edit`：改文件里的一段

目标：文件已经在磁盘上时，不要整篇覆盖。`edit` 用 `oldString` 找到那一段，换成 `newString`。对不上，或对上不止一处，就返回明确的错误，文件保持原样。

<Picture name="edit" />

预计时间：30–45 分钟。对应 tag：`stage-08-edit`。

## 12.1 先看上游

出处：`packages/core/src/tool/plugin/edit.ts`

| 点 | 上游 | 迷你版 |
|----|------|--------|
| 参数 | `path`、`oldString`、`newString`、可选 `replaceAll` | 同 |
| 默认 | `oldString` 必须只出现一次 | 同 |
| 出现多次 | 不改文件，除非 `replaceAll` | 同 |
| 找不到 | 报错，并提示附近的行 | 报错。不猜附近的行 |
| 引号、破折号、行尾空格的宽松匹配 | 有 | 不做。必须逐字相同，包括空格和缩进 |
| 权限 | 先 `external_directory`，再 `edit` | 和 `write` 走同一个 `authorizeWrite` |
| diff 预览、撤销、格式化 | 上游有一部分 | 不做 |

`oldString` 为空时，上游要求改用 `write`。迷你版同样拒绝，并在错误里写明去调用 `write`。

## 12.2 本仓库落点

| 路径 | 作用 |
|------|------|
| `rebuild/src/tool/edit.ts` | 读出全文，替换唯一一段，再写回 |
| `rebuild/src/tool/defs.ts` | 把 `edit` 放进发给模型的工具列表 |
| `rebuild/src/tool/run.ts` | 按名字分发 |
| `rebuild/src/permission/file-access.ts` | `authorizeWrite`：仓库外先问，然后检查 `edit` |

`build` 的默认规则允许 `edit`。`plan` 显式拒绝 `edit`。`explore` 先拒绝全部动作，只放开读和搜索，所以它也改不了文件。

整文件新建或覆盖仍用 `write`。`build` 的系统提示里写了这个分工。

## 12.3 怎么验收

在 `rebuild/` 下先复制一份，避免改掉课程夹具：

```bash
cd ~/dev/OpenCode-Rebuild-Notes/rebuild
cp fixtures/hello.txt fixtures/hello-edit.txt
bun run chat
```

```text
you> 用 edit 把 fixtures/hello-edit.txt 里的 stage-02-tools 改成 stage-08-edit，只改这一处，然后 read 回来
```

成功时工具结果类似 `Edited fixtures/hello-edit.txt (1 replacement)`。读回来的那一行是 `stage-08-edit`，其余文字不变。

下面三种都应该失败，并且文件内容不动：

- `oldString` 在文件里不存在
- `oldString` 出现两次，又没有 `replaceAll`
- `oldString` 和 `newString` 完全一样

测完删掉副本：`rm fixtures/hello-edit.txt`。

## 12.4 和上游的差距

| 已有 | 尚未做 |
|------|--------|
| 精确替换，唯一匹配才写入 | 引号和空白的宽松重试、附近行提示 |
| 和 `write` 同一条 `edit` 权限 | diff 预览、撤销栈、保存后格式化 |
| `replaceAll` 替换每一处 | 只改行尾 `\r` 的专门路径 |

## 验收清单

- [ ] 能指认上游 `packages/core/src/tool/plugin/edit.ts`
- [ ] `fixtures/hello-edit.txt` 里只有那一处被换掉，其余行还在
- [ ] 对不上或对上多处时，终端里的工具结果以 `Error:` 开头，文件未改
- [ ] 清楚：新建和整文件覆盖用 `write`，改一段用 `edit`

下一步：让 `build` 派出只读的 `explore`，见 [阶段与 Tag](/reference/tags) 里的 `stage-09-agents`。
