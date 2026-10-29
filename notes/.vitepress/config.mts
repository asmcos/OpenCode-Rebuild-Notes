import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { defineConfig, type UserConfig } from "vitepress"

/**
 * OpenCode 复刻笔记 — VitePress
 * 基线: 2026-10-29 / upstream 2.2.0 / fa1260d6ca
 *
 * 个性化（如 base: '/ocnotes/'）请放进 gitignore 的 config.local.mjs
 * （用 .mjs，避免 Node 动态 import 不认 .mts）。
 * 不要改本文件顶部——避免和共享的 nav/sidebar 大纲总冲突。
 * 也可临时: VP_BASE=/ocnotes/ bun run build
 */

function localConfigCandidates() {
  // VitePress 加载 config 时 import.meta.url 可能不在 .vitepress/ 下，故同时试 cwd
  return [
    join(process.cwd(), ".vitepress", "config.local.mjs"),
    join(dirname(fileURLToPath(import.meta.url)), "config.local.mjs"),
  ]
}

async function loadLocal(): Promise<{ config: UserConfig; from?: string }> {
  for (const file of localConfigCandidates()) {
    if (!existsSync(file)) continue
    const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`)
    return { config: (mod.default ?? {}) as UserConfig, from: file }
  }
  return { config: {} }
}

const { config: local, from: localFrom } = await loadLocal()
const base = (process.env.VP_BASE || local.base || "/") as string
if (localFrom) {
  console.info(`[vitepress] loaded ${localFrom}`)
}
console.info(`[vitepress] base=${base}`)

export default defineConfig({
  lang: "zh-CN",
  title: "OpenCode 复刻笔记",
  description: "从零跟着搭一个迷你 OpenCode —— 读源码、写代码、写文档同步进行",
  srcDir: "docs",
  cleanUrls: true,
  lastUpdated: true,
  // 默认 "/"；个人目录：config.local.mjs 的 base，或环境变量 VP_BASE
  base,

  themeConfig: {
    logo: undefined,
    siteTitle: "OpenCode 复刻笔记",
    outline: { label: "本页目录", level: [2, 3] },
    lastUpdated: { text: "最后更新" },
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换到浅色",
    darkModeSwitchTitle: "切换到深色",
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "搜索", buttonAriaLabel: "搜索文档" },
          modal: {
            noResultsText: "没有结果",
            resetButtonTitle: "清除",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
    nav: [
      { text: "首页", link: "/" },
      { text: "基线", link: "/baseline" },
      {
        text: "动手指南",
        items: [
          { text: "00 环境准备", link: "/guide/00-env" },
          { text: "01 读懂源码仓库", link: "/guide/01-read-source" },
          { text: "02 第一个 bun 程序", link: "/guide/02-hello-bun" },
          { text: "03 认识 Agent", link: "/guide/03-what-is-agent" },
          { text: "04 最小 Chat", link: "/guide/04-chat-llm" },
          { text: "05 工具 read", link: "/guide/05-tool-read" },
        ],
      },
      {
        text: "参考",
        items: [
          { text: "包地图", link: "/reference/packages" },
          { text: "约定", link: "/reference/conventions" },
          { text: "阶段与 Tag", link: "/reference/tags" },
        ],
      },
    ],
    sidebar: [
      {
        text: "开始",
        items: [
          { text: "首页", link: "/" },
          { text: "基线锁定", link: "/baseline" },
        ],
      },
      {
        text: "动手指南",
        items: [
          { text: "00 环境准备", link: "/guide/00-env" },
          { text: "01 读懂源码仓库", link: "/guide/01-read-source" },
          { text: "02 第一个 bun 程序", link: "/guide/02-hello-bun" },
          { text: "03 认识 Agent", link: "/guide/03-what-is-agent" },
          { text: "04 最小 Chat", link: "/guide/04-chat-llm" },
          { text: "05 工具 read", link: "/guide/05-tool-read" },
        ],
      },
      {
        text: "参考",
        items: [
          { text: "包地图", link: "/reference/packages" },
          { text: "约定", link: "/reference/conventions" },
          { text: "阶段与 Tag", link: "/reference/tags" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/anomalyco/opencode",
        ariaLabel: "上游 OpenCode",
      },
    ],
    footer: {
      message: "对照上游 OpenCode 2.2.0 · commit fa1260d6ca · 笔记始于 2026-10-29",
      copyright: "复刻学习笔记 · 静态站由 VitePress 构建",
    },
  },

  // 本地覆盖放最后：可改 base 等，勿在 local 里复制整份 nav（会和共享大纲打架）
  ...local,
})
