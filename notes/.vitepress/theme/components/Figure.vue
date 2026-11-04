<script setup lang="ts">
const props = defineProps<{
  name: "start" | "method" | "agent" | "read" | "permissions" | "shell" | "menu" | "search"
}>()

const captions: Record<typeof props.name, string> = {
  start: "图 · 从克隆到能对照上游",
  method: "图 · 三件事一起做",
  agent: "图 · Agent 是一份角色，不是整个程序",
  read: "图 · 一次 read：模型提出，本地执行，再回答",
  permissions: "图 · 仓库外的写入先问你，允许之后才写",
  shell: "图 · prepare 的顺序，然后才执行",
  menu: "图 · 先在菜单里选定，再进入对话",
  search: "图 · 先定位，再打开，再回答",
}
</script>

<template>
  <figure class="oc-fig">
    <div class="oc-fig-scroll">
      <svg v-if="name === 'start'" viewBox="0 0 720 140" role="img" :aria-label="captions.start">
        <defs>
          <marker id="mk-start" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <g>
          <rect class="box" x="8" y="18" width="156" height="104" />
          <text class="idx" x="22" y="40">01</text>
          <text class="label" x="22" y="66">克隆</text>
          <text class="sub" x="22" y="90">Bun 1.4.4</text>
          <text class="sub" x="22" y="108">进入 rebuild/</text>
        </g>
        <line class="line" x1="164" y1="70" x2="186" y2="70" marker-end="url(#mk-start)" />
        <g>
          <rect class="box" x="190" y="18" width="156" height="104" />
          <text class="idx" x="204" y="40">02</text>
          <text class="label" x="204" y="66">选模型</text>
          <text class="sub" x="204" y="90">菜单里点 Zen 免费</text>
          <text class="sub" x="204" y="108">不用个人 Key</text>
        </g>
        <line class="line" x1="346" y1="70" x2="368" y2="70" marker-end="url(#mk-start)" />
        <g>
          <rect class="box" x="372" y="18" width="156" height="104" />
          <text class="idx" x="386" y="40">03</text>
          <text class="label" x="386" y="66">干活</text>
          <text class="sub" x="386" y="90">grep、read、write</text>
          <text class="sub" x="386" y="108">shell 会先问你</text>
        </g>
        <line class="line" x1="528" y1="70" x2="550" y2="70" marker-end="url(#mk-start)" />
        <g>
          <rect class="box" x="554" y="18" width="156" height="104" />
          <text class="idx" x="568" y="40">04</text>
          <text class="label" x="568" y="66">对上号</text>
          <text class="sub" x="568" y="90">每一课指回上游</text>
          <text class="sub" x="568" y="108">仓库里的相对路径</text>
        </g>
      </svg>

      <svg v-else-if="name === 'method'" viewBox="0 0 720 140" role="img" :aria-label="captions.method">
        <defs>
          <marker id="mk-method" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <g>
          <rect class="box" x="12" y="18" width="200" height="104" />
          <text class="idx" x="26" y="40">跑</text>
          <text class="label" x="26" y="66">能跑起来</text>
          <text class="sub" x="26" y="90">每一步都有命令</text>
          <text class="sub" x="26" y="108">做完自己看得到结果</text>
        </g>
        <line class="line" x1="212" y1="70" x2="248" y2="70" marker-end="url(#mk-method)" />
        <g>
          <rect class="box" x="252" y="18" width="200" height="104" />
          <text class="idx" x="266" y="40">对</text>
          <text class="label" x="266" y="66">能对上号</text>
          <text class="sub" x="266" y="90">复刻代码指回上游</text>
          <text class="sub" x="266" y="108">仓库里的相对路径</text>
        </g>
        <line class="line" x1="452" y1="70" x2="488" y2="70" marker-end="url(#mk-method)" />
        <g>
          <rect class="box" x="492" y="18" width="216" height="104" />
          <text class="idx" x="506" y="40">写</text>
          <text class="label" x="506" y="66">能留下文档</text>
          <text class="sub" x="506" y="90">VitePress 写出这一站</text>
          <text class="sub" x="506" y="108">bun run build 得到静态页</text>
        </g>
      </svg>

      <svg v-else-if="name === 'agent'" viewBox="0 0 720 268" role="img" :aria-label="captions.agent">
        <defs>
          <marker id="mk-agent" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <rect class="box" x="28" y="28" width="250" height="84" />
        <text class="label" x="44" y="60">CLI</text>
        <text class="sub" x="44" y="86">终端菜单与 you&gt;</text>

        <line class="line" x1="278" y1="70" x2="408" y2="70" marker-end="url(#mk-agent)" />
        <text class="note" x="343" y="58" text-anchor="middle">选择</text>

        <rect class="box" x="412" y="28" width="276" height="84" />
        <text class="label" x="428" y="60">Agent</text>
        <text class="sub" x="428" y="86">系统提示、模式、权限</text>

        <line class="line" x1="550" y1="112" x2="550" y2="152" marker-end="url(#mk-agent)" />
        <text class="note" x="562" y="138">进入</text>

        <rect class="box" x="412" y="156" width="276" height="84" />
        <text class="label" x="428" y="188">Session</text>
        <text class="sub" x="428" y="214">一次对话的消息历史</text>

        <line class="line" x1="412" y1="184" x2="308" y2="184" marker-end="url(#mk-agent)" />
        <text class="note" x="360" y="176" text-anchor="middle">调用</text>

        <line class="line" x1="308" y1="212" x2="412" y2="212" marker-end="url(#mk-agent)" />
        <text class="note" x="360" y="232" text-anchor="middle">写回</text>

        <rect class="box" x="28" y="156" width="250" height="84" />
        <text class="label" x="44" y="188">Tool</text>
        <text class="sub" x="44" y="214">read write grep glob shell</text>
      </svg>

      <svg v-else-if="name === 'read'" viewBox="0 0 720 300" role="img" :aria-label="captions.read">
        <defs>
          <marker id="mk-read" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <line class="life" x1="100" y1="52" x2="100" y2="276" />
        <line class="life" x1="360" y1="52" x2="360" y2="276" />
        <line class="life" x1="620" y1="52" x2="620" y2="276" />
        <g>
          <rect class="box" x="48" y="12" width="104" height="36" />
          <text class="label" x="100" y="35" text-anchor="middle">你</text>
        </g>
        <g>
          <rect class="box" x="308" y="12" width="104" height="36" />
          <text class="label" x="360" y="35" text-anchor="middle">模型</text>
        </g>
        <g>
          <rect class="box" x="568" y="12" width="104" height="36" />
          <text class="label" x="620" y="35" text-anchor="middle">本地</text>
        </g>

        <line class="line" x1="100" y1="92" x2="352" y2="92" marker-end="url(#mk-read)" />
        <text class="note" x="226" y="82" text-anchor="middle">这个文件里写了什么</text>

        <line class="line" x1="360" y1="148" x2="612" y2="148" marker-end="url(#mk-read)" />
        <text class="note" x="486" y="138" text-anchor="middle">read 的 tool_call</text>

        <line class="line back" x1="620" y1="204" x2="368" y2="204" marker-end="url(#mk-read)" />
        <text class="note" x="494" y="194" text-anchor="middle">role = tool，文件内容</text>

        <line class="line back" x1="360" y1="258" x2="108" y2="258" marker-end="url(#mk-read)" />
        <text class="note" x="234" y="248" text-anchor="middle">最终回复</text>
      </svg>

      <svg v-else-if="name === 'permissions'" viewBox="0 0 720 360" role="img" :aria-label="captions.permissions">
        <defs>
          <marker id="mk-perm" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <rect class="box" x="220" y="12" width="280" height="58" />
        <text class="label" x="360" y="36" text-anchor="middle">模型发出 write</text>
        <text class="sub" x="360" y="56" text-anchor="middle">路径在仓库外，例如 /tmp</text>
        <line class="line" x1="360" y1="70" x2="360" y2="92" marker-end="url(#mk-perm)" />

        <rect class="box" x="170" y="96" width="380" height="58" />
        <text class="label" x="360" y="120" text-anchor="middle">询问 external_directory</text>
        <text class="sub" x="360" y="140" text-anchor="middle">harness 弹出，不是模型再追问</text>
        <line class="line" x1="360" y1="154" x2="360" y2="176" marker-end="url(#mk-perm)" />

        <polygon class="box" points="360,176 470,224 360,272 250,224" />
        <text class="label" x="360" y="228" text-anchor="middle">你的回复</text>

        <line class="line" x1="250" y1="224" x2="150" y2="224" />
        <line class="line" x1="150" y1="224" x2="150" y2="292" marker-end="url(#mk-perm)" />
        <text class="note" x="196" y="214" text-anchor="middle">o / a</text>

        <line class="line" x1="470" y1="224" x2="570" y2="224" />
        <line class="line" x1="570" y1="224" x2="570" y2="292" marker-end="url(#mk-perm)" />
        <text class="note" x="516" y="214" text-anchor="middle">r</text>

        <rect class="box" x="40" y="296" width="220" height="52" />
        <text class="label" x="150" y="318" text-anchor="middle">允许</text>
        <text class="sub" x="150" y="336" text-anchor="middle">再检查 edit，然后写入</text>

        <rect class="box" x="460" y="296" width="220" height="52" />
        <text class="label" x="570" y="318" text-anchor="middle">拒绝</text>
        <text class="sub" x="570" y="336" text-anchor="middle">停在这里，不写文件</text>
      </svg>

      <svg v-else-if="name === 'shell'" viewBox="0 0 720 268" role="img" :aria-label="captions.shell">
        <line class="line" x1="48" y1="36" x2="48" y2="228" />
        <g>
          <circle class="box" cx="48" cy="36" r="16" />
          <text class="label" x="48" y="41" text-anchor="middle">1</text>
          <text class="label" x="84" y="32">解析目录</text>
          <text class="sub" x="84" y="52">FileAccess.resolve 得到 workdir</text>
        </g>
        <g>
          <circle class="box" cx="48" cy="100" r="16" />
          <text class="label" x="48" y="105" text-anchor="middle">2</text>
          <text class="label" x="84" y="96">外部路径</text>
          <text class="sub" x="84" y="116">目录在仓库外，先过 external_directory</text>
        </g>
        <g>
          <circle class="box" cx="48" cy="164" r="16" />
          <text class="label" x="48" y="169" text-anchor="middle">3</text>
          <text class="label" x="84" y="160">shell 权限</text>
          <text class="sub" x="84" y="180">默认 ask。同意之后才继续</text>
        </g>
        <g>
          <circle class="box" cx="48" cy="228" r="16" />
          <text class="label" x="48" y="233" text-anchor="middle">4</text>
          <text class="label" x="84" y="224">前台执行</text>
          <text class="sub" x="84" y="244">有超时。这一阶段没有后台任务</text>
        </g>
      </svg>

      <svg v-else-if="name === 'menu'" viewBox="0 0 720 348" role="img" :aria-label="captions.menu">
        <defs>
          <marker id="mk-menu" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <rect class="box" x="280" y="12" width="160" height="44" />
        <text class="label" x="360" y="40" text-anchor="middle">菜单</text>

        <line class="line" x1="320" y1="56" x2="104" y2="104" marker-end="url(#mk-menu)" />
        <line class="line" x1="344" y1="56" x2="278" y2="104" marker-end="url(#mk-menu)" />
        <line class="line" x1="376" y1="56" x2="452" y2="104" marker-end="url(#mk-menu)" />
        <line class="line" x1="400" y1="56" x2="626" y2="104" marker-end="url(#mk-menu)" />

        <rect class="box" x="24" y="108" width="160" height="64" />
        <text class="label" x="104" y="134" text-anchor="middle">Zen 免费</text>
        <text class="sub" x="104" y="154" text-anchor="middle">只列出 free</text>

        <rect class="box" x="198" y="108" width="160" height="64" />
        <text class="label" x="278" y="134" text-anchor="middle">Go</text>
        <text class="sub" x="278" y="154" text-anchor="middle">只列出 free</text>

        <rect class="box" x="372" y="108" width="160" height="64" />
        <text class="label" x="452" y="134" text-anchor="middle">本地网关</text>
        <text class="sub" x="452" y="154" text-anchor="middle">当前 baseURL</text>

        <rect class="box" x="546" y="108" width="150" height="64" />
        <text class="label" x="621" y="134" text-anchor="middle">切换 agent</text>
        <text class="sub" x="621" y="154" text-anchor="middle">换完仍停在菜单</text>

        <path class="line back" d="M696 140 V36 H444" marker-end="url(#mk-menu)" />

        <line class="line" x1="104" y1="172" x2="200" y2="214" marker-end="url(#mk-menu)" />
        <line class="line" x1="278" y1="172" x2="278" y2="214" marker-end="url(#mk-menu)" />
        <line class="line" x1="452" y1="172" x2="360" y2="214" marker-end="url(#mk-menu)" />

        <rect class="box" x="150" y="218" width="260" height="52" />
        <text class="label" x="280" y="240" text-anchor="middle">记住选择</text>
        <text class="sub" x="280" y="258" text-anchor="middle">.rebuild-llm.json，按 0 不改</text>

        <line class="line" x1="280" y1="270" x2="280" y2="292" marker-end="url(#mk-menu)" />
        <rect class="box" x="190" y="296" width="180" height="40" />
        <text class="label" x="280" y="322" text-anchor="middle">you&gt;</text>
      </svg>

      <svg v-else-if="name === 'search'" viewBox="0 0 720 332" role="img" :aria-label="captions.search">
        <defs>
          <marker id="mk-search" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <rect class="box" x="250" y="12" width="220" height="44" />
        <text class="label" x="360" y="40" text-anchor="middle">要找的代码</text>

        <line class="line" x1="360" y1="56" x2="360" y2="78" />
        <line class="line" x1="180" y1="78" x2="540" y2="78" />
        <line class="line" x1="180" y1="78" x2="180" y2="104" marker-end="url(#mk-search)" />
        <line class="line" x1="540" y1="78" x2="540" y2="104" marker-end="url(#mk-search)" />

        <rect class="box" x="70" y="108" width="220" height="68" />
        <text class="label" x="180" y="136" text-anchor="middle">glob</text>
        <text class="sub" x="180" y="156" text-anchor="middle">按路径模式找文件</text>

        <rect class="box" x="430" y="108" width="220" height="68" />
        <text class="label" x="540" y="136" text-anchor="middle">grep</text>
        <text class="sub" x="540" y="156" text-anchor="middle">按内容找行</text>

        <line class="line" x1="180" y1="176" x2="180" y2="198" />
        <line class="line" x1="540" y1="176" x2="540" y2="198" />
        <line class="line" x1="180" y1="198" x2="540" y2="198" />
        <line class="line" x1="360" y1="198" x2="360" y2="220" marker-end="url(#mk-search)" />

        <rect class="box" x="250" y="224" width="220" height="48" />
        <text class="label" x="360" y="254" text-anchor="middle">read 打开确认</text>

        <line class="line" x1="360" y1="272" x2="360" y2="292" marker-end="url(#mk-search)" />
        <rect class="box" x="210" y="296" width="300" height="28" />
        <text class="label" x="360" y="316" text-anchor="middle">回答来自工具结果</text>
      </svg>
    </div>
    <figcaption>{{ captions[name] }}</figcaption>
  </figure>
</template>
