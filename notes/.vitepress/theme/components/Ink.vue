<script setup lang="ts">
defineProps<{ name: "handoff" }>()
</script>

<template>
  <figure class="oc-ink">
    <svg v-if="name === 'handoff'" viewBox="0 0 680 330" role="img" aria-label="上游窗口递出一页源码，复刻窗口接住，下面是写成的这一课">
      <defs>
        <marker id="mk-ink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </marker>
      </defs>

      <!-- 上游窗口 -->
      <rect class="p-up" x="40" y="46" width="248" height="164" rx="12" />
      <text class="t-title" x="58" y="76">上游 opencode</text>
      <text class="t-sub" x="58" y="98">只读对照 · 不改动</text>
      <line class="i-hair" x1="58" y1="116" x2="270" y2="116" />
      <text class="t-mono" x="58" y="142">packages/core/agent-loop.ts</text>
      <text class="t-mono" x="58" y="166">packages/core/tool/</text>
      <line class="i-hair" x1="58" y1="184" x2="210" y2="184" />

      <!-- 递出的一页源码 -->
      <g transform="translate(-14 0)">
        <rect class="p-page" x="312" y="96" width="56" height="70" rx="6" />
        <path d="M324 116 H356 M324 130 H350 M324 144 H342" fill="none" stroke="#d85a30" stroke-width="1.4" stroke-linecap="round" />
      </g>
      <line class="i-line" x1="296" y1="128" x2="384" y2="128" marker-end="url(#mk-ink)" />
      <rect class="p-pill" x="288" y="52" width="104" height="26" rx="13" />
      <text class="pill-text" x="340" y="69" text-anchor="middle">对照着做</text>

      <!-- 复刻窗口 -->
      <rect class="p-mine" x="392" y="46" width="248" height="164" rx="12" />
      <text class="t-title" x="410" y="76">复刻 rebuild/</text>
      <text class="t-sub" x="410" y="98">写成迷你实现</text>
      <line class="i-hair" x1="410" y1="116" x2="622" y2="116" />
      <text class="t-mono" x="410" y="142">rebuild/src/llm/agent-loop.ts</text>
      <text class="t-mono" x="410" y="166">rebuild/src/tool/</text>
      <line class="i-hair" x1="410" y1="184" x2="540" y2="184" />

      <!-- 这一课 -->
      <rect class="p-doc" x="40" y="238" width="600" height="66" rx="12" />
      <text class="t-title" x="58" y="266">这一课</text>
      <text class="t-sub" x="58" y="286">边写边记成文档，每一步都链回上游源码</text>
      <text class="t-mono" x="512" y="278">guide/05-tool-read</text>
    </svg>
    <figcaption>图 · 上游递出一页源码，复刻接住写成迷你实现，再记成这一课</figcaption>
  </figure>
</template>
