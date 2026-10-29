# 包地图（对照用）

基于基线 **2.2.0 / `fa1260d6ca`**。路径均相对上游仓库根目录。

详细职责原文：`CONTRIBUTING.md` → `### Packages`。

## 主链路（优先读）

| 相对路径 | 包名 | 备注 |
|----------|------|------|
| `packages/schema` | `@opencode/schema` | 共享契约 |
| `packages/util` | `@opencode/util` | 工具与 Effect 辅助 |
| `packages/protocol` | `@opencode/protocol` | 公共 API 定义 |
| `packages/core` | `@opencode/core` | 领域与持久化 |
| `packages/server` | `@opencode/server` | HTTP 与运行时 |
| `packages/client` | `@opencode/client` | 生成客户端；改 API 后在该包 `bun run generate` |
| `packages/cli` | `@opencode/cli` | CLI 入口 |
| `packages/tui` | `@opencode/tui` | 终端 UI |
| `packages/app` | `@opencode/app` | Web UI |
| `packages/desktop` | — | Electron |
| `packages/plugin` | `@opencode/plugin` | 插件 API |
| `packages/sdk` | `@opencode/sdk` | SDK 组合 |

## 其它（知道存在即可）

根下 `packages/` 还有例如：`ai`、`web`、`ui`、`theme`、`console`、`stats`、`plugins/*` 等。复刻前期不必展开。

列出当前基线包目录：

```bash
cd ~/dev/opencode
ls packages/
```
