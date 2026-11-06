<script setup lang="ts">
const props = defineProps<{
  name:
    | "handoff"
    | "repos"
    | "rhythm"
    | "endpoints"
    | "packages"
    | "gateway"
    | "writefile"
    | "hello"
    | "baseline"
    | "role"
    | "loop"
    | "gate"
    | "shellrun"
    | "finder"
    | "stages"
    | "session"
}>()

const captions: Record<typeof props.name, string> = {
  handoff: "图 · 上游把一页源码递出来，这边伸手接住",
  repos: "图 · 笔记仓库和上游源码并排放",
  rhythm: "图 · 打开上游，写成迷你版，再写成这一课",
  endpoints: "图 · 同一张菜单，接三种模型来源",
  packages: "图 · 先找到入口，不必先装完全部依赖",
  gateway: "图 · 本地网关听着，rebuild 当客户端",
  writefile: "图 · 写到磁盘上，再读回来核对",
  hello: "图 · 最小的 CLI，注释里写明上游路径",
  baseline: "图 · 对照钉在这一次提交上",
  role: "图 · Agent 是一张可以换上的角色卡",
  loop: "图 · 模型发指令，本地执行，结果再送回去",
  gate: "图 · 敏感操作先停下来问你",
  shellrun: "图 · 命令先准备，问过再跑",
  finder: "图 · 先用搜索定位，再打开文件",
  stages: "图 · 阶段 tag 走到搜索，后面还空着",
  session: "图 · 这一轮对话写进文件，下次还能接着聊",
}
</script>

<template>
  <figure class="oc-spot">
    <svg viewBox="0 0 200 150" role="img" :aria-label="captions[name]">
      <template v-if="name === 'handoff'">
        <circle cx="100" cy="76" r="62" fill="#f2f7fc" />
        <path d="M28 28 h10 M33 23 v10" stroke="#2f6fb0" stroke-width="2" stroke-linecap="round" />
        <circle cx="172" cy="36" r="2.6" fill="#d8502f" />
        <rect x="22" y="48" width="36" height="28" rx="3" fill="#ffffff" stroke="#2f6fb0" stroke-width="1.5" />
        <path d="M27 56 h26 M27 61 h20 M27 66 h23" stroke="#c5d4e6" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="48" cy="58" r="11" fill="#f6c9a2" />
        <path d="M37 56 a11 11 0 0 1 22 0 h-4 a7 7 0 0 0 -14 0 Z" fill="#33415c" />
        <rect x="36" y="70" width="24" height="34" rx="10" fill="#2f6fb0" />
        <path d="M60 82 q16 4 22 14" stroke="#2f6fb0" stroke-width="7" fill="none" stroke-linecap="round" />
        <rect x="78" y="78" width="28" height="20" rx="2" fill="#149eca" />
        <path d="M83 85 h18 M83 90 h13" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="104" cy="92" r="4.5" fill="#f6c9a2" />
        <rect x="118" y="102" width="62" height="8" rx="3" fill="#e0b076" />
        <circle cx="146" cy="62" r="11" fill="#f6c9a2" />
        <path d="M135 60 a11 11 0 0 1 22 0 h-4 a7 7 0 0 0 -14 0 Z" fill="#1f2a44" />
        <rect x="134" y="74" width="24" height="34" rx="10" fill="#1f2a44" />
        <path d="M134 86 q-16 2 -24 12" stroke="#1f2a44" stroke-width="7" fill="none" stroke-linecap="round" />
        <circle cx="108" cy="98" r="4.5" fill="#f6c9a2" />
        <rect x="36" y="112" width="6" height="22" fill="#c8975f" />
        <rect x="158" y="112" width="6" height="22" fill="#c8975f" />
      </template>

      <template v-else-if="name === 'repos'">
        <circle cx="100" cy="78" r="62" fill="#fdf6ec" />
        <path d="M28 52 h26 l6 8 h18 v46 h-50 z" fill="#e9f1fa" stroke="#2f6fb0" stroke-width="1.6" />
        <path d="M28 52 h26 l6 8 h-32 z" fill="#2f6fb0" />
        <path d="M36 74 h22 M36 80 h16 M36 86 h20" stroke="#9fb8d4" stroke-width="1.6" stroke-linecap="round" />
        <text x="36" y="100" font-size="9" fill="#2f6fb0">notes</text>
        <path d="M78 60 h26 l6 8 h18 v46 h-50 z" fill="#fbeae4" stroke="#d8502f" stroke-width="1.6" />
        <path d="M78 60 h26 l6 8 h-32 z" fill="#d8502f" />
        <rect x="90" y="84" width="26" height="14" rx="2" fill="#ffffff" stroke="#e7b2a4" />
        <path d="M94 89 h18 M94 94 h12" stroke="#e7b2a4" stroke-width="1.4" stroke-linecap="round" />
        <text x="88" y="108" font-size="9" fill="#d8502f">rebuild</text>
        <path d="M132 40 h22 l5 6 h14 v34 h-41 z" fill="#f4f6f8" stroke="#8b95a8" stroke-width="1.5" stroke-dasharray="3 2" />
        <path d="M132 40 h22 l5 6 h-27 z" fill="#c5c9d2" />
        <text x="138" y="66" font-size="8" fill="#5a6478">opencode</text>
        <text x="140" y="92" font-size="8" fill="#b97a12">另放</text>
        <circle cx="168" cy="36" r="2.4" fill="#e9a23b" />
      </template>

      <template v-else-if="name === 'rhythm'">
        <circle cx="100" cy="76" r="62" fill="#f2f7fc" />
        <path d="M22 48 h22 l5 7 h14 v52 h-41 z" fill="#e9f1fa" stroke="#2f6fb0" stroke-width="1.5" />
        <path d="M22 48 h22 l5 7 h-27 z" fill="#2f6fb0" />
        <path d="M28 68 h24 M28 74 h18 M28 80 h22" stroke="#9fb8d4" stroke-width="1.4" stroke-linecap="round" />
        <text x="28" y="98" font-size="8" fill="#2f6fb0">上游</text>
        <path d="M70 58 l8 -4 l8 4" fill="none" stroke="#d8502f" stroke-width="1.6" stroke-linecap="round" />
        <path d="M78 48 h22 l5 7 h14 v52 h-41 z" fill="#fbeae4" stroke="#d8502f" stroke-width="1.5" />
        <path d="M78 48 h22 l5 7 h-27 z" fill="#d8502f" />
        <path d="M84 68 h24 M84 74 h16 M84 80 h20" stroke="#e7b2a4" stroke-width="1.4" stroke-linecap="round" />
        <text x="84" y="98" font-size="8" fill="#d8502f">迷你版</text>
        <path d="M126 58 l8 -4 l8 4" fill="none" stroke="#2e7d4f" stroke-width="1.6" stroke-linecap="round" />
        <rect x="138" y="46" width="40" height="58" rx="4" fill="#ffffff" stroke="#2e7d4f" stroke-width="1.5" />
        <rect x="144" y="54" width="22" height="5" rx="2" fill="#e8f4ec" />
        <path d="M144 68 h28 M144 74 h22 M144 80 h26" stroke="#c5d4e6" stroke-width="1.4" stroke-linecap="round" />
        <text x="146" y="96" font-size="8" fill="#2e7d4f">这一课</text>
      </template>

      <template v-else-if="name === 'endpoints'">
        <circle cx="100" cy="78" r="62" fill="#fdf6ec" />
        <rect x="28" y="36" width="42" height="16" rx="8" fill="#fbeae4" stroke="#d8502f" stroke-width="1.3" />
        <text x="38" y="47" font-size="9" fill="#d8502f">Zen</text>
        <rect x="78" y="28" width="42" height="16" rx="8" fill="#e9f1fa" stroke="#2f6fb0" stroke-width="1.3" />
        <text x="90" y="39" font-size="9" fill="#2f6fb0">Go</text>
        <rect x="128" y="36" width="42" height="16" rx="8" fill="#e8f4ec" stroke="#2e7d4f" stroke-width="1.3" />
        <text x="138" y="47" font-size="9" fill="#2e7d4f">本地</text>
        <path d="M48 52 q20 16 28 28" fill="none" stroke="#d8502f" stroke-width="1.3" />
        <path d="M99 44 v28" stroke="#2f6fb0" stroke-width="1.3" />
        <path d="M150 52 q-20 16 -28 28" fill="none" stroke="#2e7d4f" stroke-width="1.3" />
        <rect x="62" y="78" width="76" height="46" rx="6" fill="#ffffff" stroke="#1f2a44" stroke-width="1.4" />
        <text x="72" y="94" font-size="9" fill="#1f2a44">菜单</text>
        <path d="M72 102 h40 M72 110 h32" stroke="#d5deea" stroke-width="1.5" stroke-linecap="round" />
      </template>

      <template v-else-if="name === 'packages'">
        <circle cx="100" cy="76" r="62" fill="#f2f7fc" />
        <path d="M28 48 h28 l6 8 h22 v52 h-56 z" fill="#e9f1fa" stroke="#2f6fb0" stroke-width="1.6" />
        <path d="M28 48 h28 l6 8 h-34 z" fill="#2f6fb0" />
        <text x="40" y="78" font-size="11" fill="#2f6fb0">cli</text>
        <text x="40" y="94" font-size="8" fill="#5a6478">入口</text>
        <path d="M108 48 h28 l6 8 h22 v52 h-56 z" fill="#fbeae4" stroke="#d8502f" stroke-width="1.6" />
        <path d="M108 48 h28 l6 8 h-34 z" fill="#d8502f" />
        <text x="118" y="78" font-size="11" fill="#d8502f">core</text>
        <text x="118" y="94" font-size="8" fill="#5a6478">工具</text>
        <circle cx="168" cy="36" r="2.4" fill="#e9a23b" />
      </template>

      <template v-else-if="name === 'gateway'">
        <circle cx="100" cy="76" r="62" fill="#fdf6ec" />
        <rect x="24" y="48" width="62" height="48" rx="6" fill="#1f2a44" />
        <path d="M32 64 h28 M32 72 h20 M32 80 h24" stroke="#7dcea0" stroke-width="1.6" stroke-linecap="round" />
        <text x="32" y="112" font-size="8" fill="#5a6478">:8787</text>
        <path d="M90 70 h22" stroke="#d8502f" stroke-width="1.6" stroke-linecap="round" />
        <path d="M108 66 l6 4 l-6 4" fill="none" stroke="#d8502f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        <rect x="118" y="46" width="58" height="52" rx="6" fill="#ffffff" stroke="#2f6fb0" stroke-width="1.5" />
        <text x="128" y="68" font-size="9" fill="#2f6fb0">rebuild</text>
        <text x="128" y="84" font-size="8" fill="#5a6478">chat</text>
        <circle cx="36" cy="36" r="2.4" fill="#2f6fb0" />
      </template>

      <template v-else-if="name === 'writefile'">
        <circle cx="100" cy="76" r="62" fill="#f2f7fc" />
        <rect x="28" y="46" width="40" height="52" rx="3" fill="#ffffff" stroke="#d8502f" stroke-width="1.5" />
        <path d="M34 58 h28 M34 66 h22 M34 74 h26" stroke="#e7b2a4" stroke-width="1.5" stroke-linecap="round" />
        <path d="M72 70 h16" stroke="#2f6fb0" stroke-width="1.6" stroke-linecap="round" />
        <path d="M84 66 l6 4 l-6 4" fill="none" stroke="#2f6fb0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M96 42 h24 l6 8 h16 v52 h-46 z" fill="#e9f1fa" stroke="#2f6fb0" stroke-width="1.5" />
        <path d="M96 42 h24 l6 8 h-30 z" fill="#2f6fb0" />
        <text x="108" y="78" font-size="8" fill="#2f6fb0">磁盘</text>
        <path d="M118 100 q-20 16 -36 8" fill="none" stroke="#2e7d4f" stroke-width="1.4" stroke-dasharray="3 2" />
        <circle cx="168" cy="40" r="2.4" fill="#e9a23b" />
      </template>

      <template v-else-if="name === 'hello'">
        <circle cx="100" cy="76" r="62" fill="#fdf6ec" />
        <rect x="36" y="40" width="92" height="62" rx="6" fill="#1f2a44" />
        <circle cx="48" cy="52" r="2.2" fill="#d8502f" />
        <circle cx="56" cy="52" r="2.2" fill="#e9a23b" />
        <circle cx="64" cy="52" r="2.2" fill="#2e7d4f" />
        <text x="46" y="74" font-size="9" fill="#7dcea0">bun run hello</text>
        <text x="46" y="88" font-size="9" fill="#ffffff">hello</text>
        <rect x="136" y="48" width="36" height="46" rx="3" fill="#ffffff" stroke="#b97a12" stroke-width="1.4" />
        <path d="M142 60 h24 M142 68 h18 M142 76 h22" stroke="#e0b076" stroke-width="1.4" stroke-linecap="round" />
        <path d="M128 70 h8" stroke="#b97a12" stroke-width="1.4" />
      </template>

      <template v-else-if="name === 'baseline'">
        <circle cx="100" cy="76" r="62" fill="#f2f7fc" />
        <path d="M58 36 h46 l10 12 v62 h-56 z" fill="#ffffff" stroke="#2f6fb0" stroke-width="1.6" />
        <path d="M104 36 v12 h10" fill="none" stroke="#2f6fb0" stroke-width="1.6" />
        <text x="68" y="68" font-size="9" fill="#2f6fb0">2.2.0</text>
        <text x="68" y="84" font-size="8" fill="#1f2a44">fa1260d6ca</text>
        <text x="68" y="98" font-size="8" fill="#5a6478">bun 1.4.4</text>
        <circle cx="148" cy="48" r="8" fill="#d8502f" />
        <path d="M148 44 v8 M144 48 h8" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" />
        <path d="M148 56 v10" stroke="#d8502f" stroke-width="1.6" />
      </template>

      <template v-else-if="name === 'role'">
        <circle cx="100" cy="76" r="62" fill="#f2f7fc" />
        <g transform="rotate(-8 58 80)">
          <rect x="32" y="48" width="46" height="60" rx="5" fill="#ffffff" stroke="#c5d0de" stroke-width="1.4" />
          <rect x="38" y="56" width="18" height="5" rx="2" fill="#e9f1fa" />
          <path d="M38 70 h26 M38 76 h20" stroke="#d5deea" stroke-width="1.4" stroke-linecap="round" />
        </g>
        <g transform="rotate(8 146 80)">
          <rect x="122" y="48" width="46" height="60" rx="5" fill="#ffffff" stroke="#e4d3b0" stroke-width="1.4" />
          <rect x="128" y="56" width="18" height="5" rx="2" fill="#fdf3e0" />
          <path d="M128 70 h26 M128 76 h20" stroke="#ead9b4" stroke-width="1.4" stroke-linecap="round" />
        </g>
        <rect x="74" y="36" width="52" height="74" rx="6" fill="#ffffff" stroke="#d8502f" stroke-width="1.7" />
        <rect x="82" y="46" width="24" height="7" rx="3" fill="#fbeae4" />
        <circle cx="100" cy="70" r="9" fill="#f6c9a2" />
        <path d="M91 68 a9 9 0 0 1 18 0 h-3.5 a5.5 5.5 0 0 0 -11 0 Z" fill="#33415c" />
        <rect x="88" y="82" width="24" height="14" rx="6" fill="#d8502f" />
        <text x="86" y="104" font-size="8" fill="#d8502f">build</text>
      </template>

      <template v-else-if="name === 'loop'">
        <circle cx="100" cy="76" r="62" fill="#fdf6ec" />
        <rect x="26" y="40" width="56" height="36" rx="7" fill="#ffffff" stroke="#2f6fb0" stroke-width="1.5" />
        <circle cx="40" cy="54" r="2.6" fill="#2f6fb0" />
        <circle cx="50" cy="54" r="2.6" fill="#2f6fb0" />
        <path d="M38 66 h28" stroke="#c5d4e6" stroke-width="1.8" stroke-linecap="round" />
        <path d="M84 52 q14 6 8 20" fill="none" stroke="#d8502f" stroke-width="1.6" />
        <path d="M90 70 l4 3 l-5 1 z" fill="#d8502f" />
        <path d="M102 64 h20 l5 7 h14 v36 h-39 z" fill="#e9f1fa" stroke="#2f6fb0" stroke-width="1.4" />
        <path d="M102 64 h20 l5 7 h-25 z" fill="#2f6fb0" />
        <rect x="30" y="92" width="62" height="26" rx="4" fill="#1f2a44" />
        <path d="M38 104 h22 M38 110 h30" stroke="#7dcea0" stroke-width="1.5" stroke-linecap="round" />
        <path d="M64 92 q-4 -14 18 -24" fill="none" stroke="#2e7d4f" stroke-width="1.4" stroke-dasharray="3 2" />
      </template>

      <template v-else-if="name === 'gate'">
        <circle cx="100" cy="76" r="62" fill="#f2f7fc" />
        <path d="M86 32 L116 44 V74 Q116 104 86 118 Q56 104 56 74 V44 Z" fill="#e9f1fa" stroke="#2f6fb0" stroke-width="1.7" />
        <circle cx="86" cy="66" r="7" fill="#2f6fb0" />
        <path d="M82.5 69 h7 l4 14 h-15 Z" fill="#2f6fb0" />
        <circle cx="64" cy="48" r="9" fill="#b97a12" />
        <text x="60" y="52" font-size="11" fill="#ffffff">?</text>
        <rect x="124" y="58" width="40" height="28" rx="5" fill="#fbeae4" stroke="#d8502f" stroke-width="1.3" />
        <text x="132" y="76" font-size="9" fill="#d8502f">询问</text>
      </template>

      <template v-else-if="name === 'shellrun'">
        <circle cx="100" cy="76" r="62" fill="#fdf6ec" />
        <rect x="24" y="48" width="70" height="48" rx="6" fill="#1f2a44" />
        <text x="32" y="68" font-size="8" fill="#7dcea0">$ ls</text>
        <text x="32" y="82" font-size="8" fill="#ffffff">src  notes</text>
        <path d="M108 36 L132 46 V68 Q132 88 108 98 Q84 88 84 68 V46 Z" fill="#e9f1fa" stroke="#2f6fb0" stroke-width="1.4" />
        <circle cx="108" cy="62" r="5" fill="#2f6fb0" />
        <path d="M105.5 64 h5 l3 10 h-11 Z" fill="#2f6fb0" />
        <circle cx="162" cy="78" r="14" fill="#e8f4ec" stroke="#2e7d4f" stroke-width="1.5" />
        <path d="M156 78 l4 4 l8 -8" fill="none" stroke="#2e7d4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </template>

      <template v-else-if="name === 'finder'">
        <circle cx="100" cy="76" r="62" fill="#f2f7fc" />
        <path d="M30 58 h22 l5 7 h16 v40 h-43 z" fill="#e9f1fa" stroke="#2f6fb0" stroke-width="1.4" />
        <path d="M30 58 h22 l5 7 h-27 z" fill="#2f6fb0" />
        <path d="M78 70 h22 l5 7 h16 v28 h-43 z" fill="#fbeae4" stroke="#d8502f" stroke-width="1.4" />
        <path d="M78 70 h22 l5 7 h-27 z" fill="#d8502f" />
        <circle cx="132" cy="58" r="16" fill="#ffffff" stroke="#1f2a44" stroke-width="2.4" />
        <path d="M144 70 l12 12" stroke="#1f2a44" stroke-width="3" stroke-linecap="round" />
        <circle cx="168" cy="40" r="2.4" fill="#e9a23b" />
      </template>

      <template v-else-if="name === 'stages'">
        <circle cx="96" cy="82" r="60" fill="#fdf6ec" />
        <g font-size="8">
          <rect x="22" y="108" width="20" height="12" rx="3" fill="#2f6fb0" />
          <text x="26" y="117" fill="#ffffff">00</text>
          <rect x="40" y="96" width="20" height="12" rx="3" fill="#2f6fb0" />
          <text x="44" y="105" fill="#ffffff">01</text>
          <rect x="58" y="84" width="20" height="12" rx="3" fill="#2e7d4f" />
          <text x="62" y="93" fill="#ffffff">02</text>
          <rect x="76" y="72" width="20" height="12" rx="3" fill="#2e7d4f" />
          <text x="80" y="81" fill="#ffffff">03</text>
          <rect x="94" y="60" width="20" height="12" rx="3" fill="#b97a12" />
          <text x="98" y="69" fill="#ffffff">04</text>
          <rect x="112" y="48" width="20" height="12" rx="3" fill="#d8502f" />
          <text x="116" y="57" fill="#ffffff">05</text>
          <rect x="130" y="36" width="20" height="12" rx="3" fill="#d8502f" />
          <text x="134" y="45" fill="#ffffff">06</text>
        </g>
        <g fill="none" stroke="#c5c9d2" stroke-width="1.3">
          <rect x="154" y="48" width="16" height="11" rx="2" />
          <rect x="162" y="64" width="16" height="11" rx="2" />
          <rect x="170" y="80" width="16" height="11" rx="2" />
        </g>
        <text x="156" y="108" font-size="8" fill="#8b95a8">07–09</text>
      </template>

      <template v-else-if="name === 'session'">
        <circle cx="100" cy="76" r="62" fill="#f2f7fc" />
        <path d="M36 48 h28 l6 8 h22 v50 h-56 z" fill="#e9f1fa" stroke="#2f6fb0" stroke-width="1.5" />
        <path d="M36 48 h28 l6 8 h-34 z" fill="#2f6fb0" />
        <rect x="48" y="74" width="28" height="20" rx="2" fill="#ffffff" stroke="#9fb8d4" />
        <path d="M52 80 h20 M52 86 h14" stroke="#c5d4e6" stroke-width="1.4" stroke-linecap="round" />
        <path d="M112 78 h18" stroke="#d8502f" stroke-width="1.6" stroke-linecap="round" />
        <path d="M126 74 l6 4 l-6 4" fill="none" stroke="#d8502f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M128 70 h-18" stroke="#2e7d4f" stroke-width="1.6" stroke-linecap="round" />
        <path d="M114 66 l-6 4 l6 4" fill="none" stroke="#2e7d4f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        <rect x="136" y="58" width="36" height="40" rx="4" fill="#ffffff" stroke="#2e7d4f" stroke-width="1.4" />
        <path d="M142 70 h24 M142 78 h18 M142 86 h22" stroke="#b7d7c4" stroke-width="1.4" stroke-linecap="round" />
      </template>
    </svg>
    <figcaption>{{ captions[name] }}</figcaption>
  </figure>
</template>
