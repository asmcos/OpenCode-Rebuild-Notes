import { defineConfig } from "vitepress"

/**
 * OpenCode 复刻笔记 — VitePress
 * 基线: 2026-10-29 / upstream 2.2.0 / fa1260d6ca
 */
export default defineConfig({
  lang: "zh-CN",
  title: "OpenCode 复刻笔记",
  description: "从零跟着搭一个迷你 OpenCode —— 读源码、写代码、写文档同步进行",
  srcDir: "docs",
  cleanUrls: true,
  lastUpdated: true,

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
})
