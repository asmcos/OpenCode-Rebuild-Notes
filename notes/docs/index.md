<div class="oc-hero">
  <span class="oc-hero-kicker">stage-06-search</span>
  <h1>从零搭一个会找代码的 agent</h1>
  <p>对照 OpenCode 的源码，一边读一边做一个迷你实现：能对话、能搜索、能读写文件、能在问过你之后跑命令。每一步都有文档，也有可以 checkout 的 tag。</p>
  <div class="oc-actions">
    <a class="primary" href="#怎么开始">先看路径</a>
    <a class="ghost" href="./guide/09-menu">打开启动菜单这一课</a>
  </div>
</div>

<div class="oc-learn">
  <p class="oc-learn-title">你会做到</p>
  <ul>
    <li>用菜单换 Zen 免费、Go 和本地模型</li>
    <li>让模型先搜索，再读文件、写文件</li>
    <li>shell 和仓库外写入会先问你</li>
    <li>每一课都能指回上游源码的相对路径</li>
  </ul>
</div>

<Picture name="handoff" />

## 怎么开始

从锁定的提交走到会话。每一组里的课按顺序来，每课末尾有验收清单。

<p class="oc-path">先安顿</p>
<Grid>
  <Card href="/baseline" no="基线" title="锁定提交">对照 OpenCode 2.2.0 的哪一次提交。</Card>
  <Card href="/guide/00-env" no="00" title="环境">Bun 1.4.4，笔记和上游源码并排放。</Card>
  <Card href="/guide/01-read-source" no="01" title="读仓库">包怎么分，入口在哪。</Card>
  <Card href="/guide/02-hello-bun" no="02" title="第一个程序">跑通 help、version、hello。</Card>
</Grid>

<p class="oc-path">接上模型</p>
<Grid>
  <Card href="/guide/03-what-is-agent" no="03" title="角色">提示、模式、权限。Agent 是一张卡片。</Card>
  <Card href="/guide/04-chat-llm" no="04" title="对话">接上真实模型。</Card>
  <Card href="/guide/09-menu" no="09" title="菜单">tag stage-05-menu。切换 Zen、Go、本地。</Card>
</Grid>

<Picture name="endpoints" />

<p class="oc-path">让它干活</p>
<Grid>
  <Card href="/guide/05-tool-read" no="05" title="读文件">模型发出 read，本地执行后再答。</Card>
  <Card href="/guide/06-tool-write" no="06" title="写文件">整文件写入。仓库外要先得到允许。</Card>
  <Card href="/guide/07-permissions" no="07" title="权限">允许、询问、拒绝，发生在程序里。</Card>
  <Card href="/guide/08-tool-shell" no="08" title="命令">先准备，再询问，再执行。</Card>
  <Card href="/guide/10-search" no="10" title="搜索">tag stage-06-search。先找到文件，再去读。</Card>
  <Card href="/guide/11-session" no="11" title="会话">退出后再接着聊。</Card>
  <Card href="/guide/12-tool-edit" no="12" title="局部修改">只换文件里的一段，对不上就不写。</Card>
</Grid>

<p class="oc-note">后面还空着真正派出 explore（stage-09）。</p>

## 为什么做这个项目

本项目的目的，是让大家**学会如何制作一个 agent**。

选择 [OpenCode](https://github.com/anomalyco/opencode) 的理由很简单：**开源**，而且**好用**。作者花了半年多时间，反复试用、对比了大量开源 agent；真正能接近 Cursor、Claude Code、Codex 体验的，还是 OpenCode。所以我们决定一起揭开 OpenCode 的面纱——一边拆解它怎么做成，一边自己动手搭；走完这条路，你也就学会了如何制作一个 agent。

## 我们怎么学

三件事同时发生，所以笔记不会变成一份只可远观的源码说明书。

<Picture name="rhythm" />

## 仓库里有什么

<Picture name="repos" />

```text
OpenCode-Rebuild-Notes/
├── README.md             # 仓库首页：三分钟试跑
├── notes/                # 文档站（VitePress）
│   ├── .vitepress/       # 配置与主题微调
│   ├── docs/             # 你现在看的 Markdown
│   └── package.json
├── rebuild/              # 迷你 agent：chat、工具、权限、菜单
└── scripts/bun.sh        # 优先使用 Bun 1.4.x
```

上游 OpenCode 源码**不在**本仓库里。请在本机另有一份克隆（例如与本仓库并列放在 `~/dev/opencode`）。文档里提到的源码路径一律写成**相对上游仓库根目录**的路径，例如：

```text
packages/cli/src/index.ts
```

而不是绝对路径。正文里的路径，例如 `packages/cli/src/index.ts`，可以点开，会到锁定提交上的 GitHub 文件。这份笔记本身在 [asmcos/OpenCode-Rebuild-Notes](https://github.com/asmcos/OpenCode-Rebuild-Notes)。

## 设计原则（复刻节奏）

- **一次只加一小块**：能跑、能解释、能链回源码，再继续
- **先读后写**：每一步先打开上游文件，再在 `rebuild/` 里写迷你版
- **工具跟上游一致**：包管理与脚本用 **bun**，版本以当时上游 `package.json` 的 `packageManager` 为准（错版本可能 429，见 [00 环境准备](/guide/00-env)）

准备好了，从 [基线锁定](/baseline) 开始。
