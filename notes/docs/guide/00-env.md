# 00 环境准备

目标：装好工具，摆好两个目录（**笔记仓库** + **上游源码**），并能预览这份文档。

预计时间：15–30 分钟。

## 0.1 你需要的目录关系

建议在同一层放两个目录（名字可改，后文命令请跟着改）。下面用 `~/dev/` 做例子：

```text
~/dev/
├── opencode/                 # 上游源码（只读对照，尽量别在里面改业务）
└── OpenCode-Rebuild-Notes/   # notes/（文档）+ rebuild/（复刻代码）
```

文档里的**源码出处**一律写成相对 `opencode/` 根目录，例如 `packages/cli/src/index.ts`。

## 0.2 检查操作系统

在终端执行：

```bash
uname -srm
cat /etc/os-release | head -5
```

本笔记在 **Ubuntu 24.04 / Linux x86_64** 上验证。其他发行版步骤类似，包管理器命令可能不同。

## 0.3 安装 git（若还没有）

```bash
git --version
```

若提示找不到命令：

```bash
sudo apt update
sudo apt install -y git
```

## 0.4 安装 bun（必须）

::: warning bun 版本很重要
1. **不要随便装「最新 bun」**，也不要长期死磕文档里写死的某一个数字。  
2. **以你当时对照的 OpenCode 为准**：打开上游根目录 `package.json`，看 `packageManager` 字段（例如 `bun@1.4.4`），本机就装这个版本。  
3. 本笔记基线（2026-10-29 / OpenCode 2.2.0）作者实测：**bun 1.4.4** 正常；**其他版本**访问 / 使用 OpenCode 时可能出现 **HTTP 429**。  
4. 以后若你换了上游 commit，请重新读 `packageManager`，再对齐 bun。
:::

出处：上游 `package.json`（`packageManager`）、`CONTRIBUTING.md`（Development）。

### 先读上游要哪个 bun

```bash
# 克隆上游之后（见下一节 0.5），在仓库根执行：
cd ~/dev/opencode
cat package.json | grep packageManager
# 或：
bun -e 'console.log(require("./package.json").packageManager)'
# 例：bun@1.4.4  → 本机就装 1.4.4
```

### 检查本机 bun

```bash
bun --version
which bun
```

### 按上游声明安装 / 对齐版本

没有 bun，或版本对不上时，用官方脚本装**指定版本**（把 `1.4.4` 换成你读到的版本号）：

```bash
curl -fsSL https://bun.sh/install | bash -s "bun-v1.4.4"
```

装完后让当前 shell 认到 bun（按安装脚本提示，常见是）：

```bash
source ~/.bashrc
# 或
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

再核对必须一致：

```bash
bun --version
# 应等于 packageManager 里的版本，例如 1.4.4
```

已装过 bun、只需改版本：同样用上面带版本号的安装命令，或看 [bun 安装文档](https://bun.sh/docs/installation)。

## 0.5 克隆上游 OpenCode（对照用）

若还没有上游仓库：

```bash
mkdir -p ~/dev
cd ~/dev
git clone https://github.com/anomalyco/opencode.git
cd opencode
```

钉到本笔记基线 commit（与 [基线锁定](/baseline) 一致）：

```bash
git fetch --all
git checkout fa1260d6ca484fe0fd868aa992ad81ab85343cf3
git log -1 --oneline
```

应看到类似：

```text
fa1260d6ca fix(tui): send pasted image and PDF paths to local servers (#59833)
```

> 当前阶段**不必**在上游执行 `bun install`。先会看目录、会打开文件即可。完整安装依赖放到后面步骤，避免一上来就卡在几十个 workspace 包上。

## 0.6 拿到本笔记仓库

若你已经在 `OpenCode-Rebuild-Notes` 里读这份文档，跳过 clone。否则：

```bash
cd ~/dev
# 按你实际托管方式 clone / 复制本仓库
cd OpenCode-Rebuild-Notes
ls
```

应能看到至少：

```text
notes/  rebuild/  README.md
```

其中文档站在 `notes/`：

```text
notes/.vitepress/
notes/docs/
notes/package.json
```

## 0.7 安装并预览文档站（VitePress）

文档站用 **VitePress**（Vue 生态的静态站点生成器），和复刻代码一样用 **bun** 安装依赖。

```bash
cd ~/dev/OpenCode-Rebuild-Notes/notes
bun install
```

验证脚本存在：

```bash
bun run dev --help
# 或直接看 package.json 里的 scripts: dev / build / preview
```

### 本地预览

```bash
cd ~/dev/OpenCode-Rebuild-Notes/notes
bun run dev
```

浏览器打开终端提示的地址（一般是 `http://127.0.0.1:5173`）。改 `docs/` 里的 Markdown 后会热更新。

### 生成静态 HTML（可以）

```bash
cd ~/dev/OpenCode-Rebuild-Notes/notes
bun run build
ls .vitepress/dist
```

`bun run build` 会产出纯静态文件（HTML/CSS/JS），可丢到任意静态托管（Nginx、GitHub Pages、对象存储等）。

本地预览构建结果：

```bash
bun run preview
```

产物目录 `.vitepress/dist` 已加入 `.gitignore`，不必提交。

## 0.8 可选：编辑器

任意能打开 TypeScript / Markdown 的编辑器即可。Cursor / VS Code 都适合对照两个文件夹。

建议把「上游 `opencode`」和「笔记 `OpenCode-Rebuild-Notes`」都加到工作区，方便一边看 `packages/...`，一边写 `rebuild/`。

## 验收清单

做完请自己打勾：

- [ ] `bun --version` 与上游 `packageManager` 声明一致（本基线为 1.4.4）  
- [ ] 上游目录存在，`git log -1` 对得上基线（或你已更新 [基线锁定](/baseline)）  
- [ ] 笔记仓库里有 `notes/.vitepress/`、`notes/docs/`、`rebuild/`  
- [ ] 在 `notes/` 下 `bun run dev` 能打开首页  
- [ ] （可选）`bun run build` 能生成 `.vitepress/dist`

全部通过后，进入 [01 读懂源码仓库](/guide/01-read-source)。
