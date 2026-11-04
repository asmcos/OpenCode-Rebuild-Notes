<script setup lang="ts">
const props = defineProps<{
  name: "work" | "repos" | "rhythm" | "endpoints" | "packages" | "gateway" | "writefile" | "hello" | "baseline"
}>()

const captions: Record<typeof props.name, string> = {
  work: "图 · 菜单里选模型，再搜索、再读；越界会先问你",
  repos: "图 · 笔记仓库和上游源码并排放",
  rhythm: "图 · 打开上游，写成迷你版，再写成这一课",
  endpoints: "图 · 同一张菜单，接三种模型来源",
  packages: "图 · 先找到入口，不必先装完全部依赖",
  gateway: "图 · 本地网关听着，rebuild 当客户端",
  writefile: "图 · 写到磁盘上，再读回来核对",
  hello: "图 · 最小的 CLI，注释里写明上游路径",
  baseline: "图 · 对照钉在这一次提交上",
}
</script>

<template>
  <figure class="oc-fig">
    <div class="oc-fig-scroll">
      <svg v-if="name === 'work'" viewBox="0 0 760 400" role="img" :aria-label="captions.work">
        <rect class="box" x="16" y="16" width="336" height="368" rx="8" />
        <text class="sub" x="32" y="42">bun run chat</text>
        <line class="hair" x1="16" y1="56" x2="352" y2="56" />
        <text class="mono" x="32" y="88">build · beam-free · local</text>
        <text class="mono" x="32" y="116">tools grep, read, write, shell</text>
        <text class="mono" x="32" y="160">菜单</text>
        <text class="mono" x="32" y="188">  2) Zen 免费模型</text>
        <text class="mono" x="32" y="216">  3) Go 免费模型</text>
        <text class="mono" x="32" y="244">  4) 本地网关</text>
        <text class="mono" x="32" y="292">you&gt; 这个函数在哪</text>
        <text class="mono" x="32" y="328">[tool] grep</text>
        <text class="sub" x="32" y="358">src/llm/agent-loop.ts:12</text>

        <rect class="box" x="392" y="16" width="352" height="214" rx="8" />
        <text class="sub" x="408" y="42">工作目录</text>
        <line class="hair" x1="392" y1="56" x2="744" y2="56" />
        <text class="mono" x="408" y="92">src/llm/agent-loop.ts</text>
        <text class="mono" x="408" y="122">src/tool/search.ts</text>
        <text class="mono" x="408" y="152">src/tool/read.ts</text>
        <text class="mono" x="408" y="182">src/tool/write.ts</text>
        <circle class="glass" cx="688" cy="108" r="28" />
        <line class="line" x1="708" y1="128" x2="734" y2="156" stroke-width="2.4" />

        <rect class="box" x="392" y="250" width="352" height="134" rx="8" />
        <text class="sub" x="408" y="276">permission</text>
        <line class="hair" x1="392" y1="290" x2="744" y2="290" />
        <text class="mono" x="408" y="322">external_directory</text>
        <text class="mono" x="408" y="350">/tmp/*</text>
        <text class="sub" x="408" y="374">o 一次 · a 本会话 · r 拒绝</text>
      </svg>

      <svg v-else-if="name === 'repos'" viewBox="0 0 760 320" role="img" :aria-label="captions.repos">
        <path class="sheet" d="M16 108 V76 H110 L128 108 H268 V286 H16 Z" />
        <text class="label" x="32" y="142">笔记仓库</text>
        <text class="mono" x="32" y="176">notes/</text>
        <text class="sub" x="118" y="176">文档</text>
        <text class="mono" x="32" y="210">rebuild/</text>
        <text class="sub" x="130" y="210">迷你 agent</text>
        <text class="mono" x="32" y="244">scripts/</text>
        <text class="sub" x="124" y="244">Bun 1.4.x</text>

        <path class="sheet" d="M492 108 V76 H586 L604 108 H744 V286 H492 Z" />
        <text class="label" x="508" y="142">上游 opencode</text>
        <text class="mono" x="508" y="176">packages/cli</text>
        <text class="sub" x="668" y="176">入口</text>
        <text class="mono" x="508" y="210">packages/core</text>
        <text class="sub" x="668" y="210">工具</text>
        <text class="mono" x="508" y="244">packages/tui</text>
        <text class="sub" x="668" y="244">界面</text>

        <rect class="box" x="300" y="150" width="160" height="68" rx="6" />
        <text class="sub" x="380" y="176" text-anchor="middle">只写相对路径</text>
        <text class="mono" x="380" y="200" text-anchor="middle">packages/cli/…</text>
        <line class="line back" x1="268" y1="184" x2="300" y2="184" />
        <line class="line back" x1="460" y1="184" x2="492" y2="184" />
      </svg>

      <svg v-else-if="name === 'rhythm'" viewBox="0 0 760 300" role="img" :aria-label="captions.rhythm">
        <defs>
          <marker id="mk-rhythm" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <path class="sheet" d="M28 28 H176 L204 56 V248 H28 Z" />
        <path class="hair" d="M176 28 V56 H204" />
        <text class="label" x="44" y="84">上游文件</text>
        <line class="hair" x1="44" y1="108" x2="176" y2="108" />
        <line class="hair" x1="44" y1="128" x2="160" y2="128" />
        <line class="hair" x1="44" y1="148" x2="176" y2="148" />
        <line class="hair" x1="44" y1="168" x2="140" y2="168" />
        <text class="mono" x="44" y="210">plugin/read.ts</text>

        <line class="line" x1="214" y1="140" x2="250" y2="140" marker-end="url(#mk-rhythm)" />

        <path class="sheet" d="M268 28 H416 L444 56 V248 H268 Z" />
        <path class="hair" d="M416 28 V56 H444" />
        <text class="label" x="284" y="84">迷你实现</text>
        <line class="hair" x1="284" y1="108" x2="400" y2="108" />
        <line class="hair" x1="284" y1="128" x2="360" y2="128" />
        <line class="hair" x1="284" y1="148" x2="400" y2="148" />
        <text class="mono" x="284" y="210">rebuild/src/…</text>

        <line class="line" x1="454" y1="140" x2="490" y2="140" marker-end="url(#mk-rhythm)" />

        <rect class="box" x="508" y="28" width="224" height="220" rx="8" />
        <text class="sub" x="524" y="52">这一课</text>
        <line class="hair" x1="508" y1="66" x2="732" y2="66" />
        <text class="label" x="524" y="104">先找到再读</text>
        <line class="hair" x1="524" y1="128" x2="680" y2="128" />
        <line class="hair" x1="524" y1="148" x2="640" y2="148" />
        <line class="hair" x1="524" y1="168" x2="690" y2="168" />
        <text class="mono" x="524" y="210">bun run build</text>
      </svg>

      <svg v-else-if="name === 'endpoints'" viewBox="0 0 760 390" role="img" :aria-label="captions.endpoints">
        <defs>
          <marker id="mk-end" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <rect class="sheet" x="28" y="16" width="210" height="92" rx="8" />
        <text class="label" x="44" y="50">Zen 免费</text>
        <text class="sub" x="44" y="76">Bearer public</text>
        <text class="mono" x="44" y="96">opencode.ai</text>

        <rect class="sheet" x="274" y="16" width="210" height="92" rx="8" />
        <text class="label" x="290" y="50">OpenCode Go</text>
        <text class="sub" x="290" y="76">Bearer oc_sk_…</text>
        <text class="mono" x="290" y="96">inference/go</text>

        <rect class="sheet" x="520" y="16" width="214" height="92" rx="8" />
        <text class="label" x="536" y="50">本地网关</text>
        <text class="sub" x="536" y="76">OpenAI 兼容</text>
        <text class="mono" x="536" y="96">127.0.0.1:8787</text>

        <line class="line" x1="132" y1="108" x2="250" y2="168" marker-end="url(#mk-end)" />
        <line class="line" x1="380" y1="108" x2="380" y2="168" marker-end="url(#mk-end)" />
        <line class="line" x1="626" y1="108" x2="510" y2="168" marker-end="url(#mk-end)" />

        <rect class="box" x="150" y="172" width="460" height="196" rx="8" />
        <text class="sub" x="168" y="198">菜单</text>
        <line class="hair" x1="150" y1="212" x2="610" y2="212" />
        <text class="mono" x="168" y="248">2) Zen 免费模型</text>
        <text class="mono" x="168" y="278">3) Go 免费模型</text>
        <text class="mono" x="168" y="308">4) 本地网关模型</text>
        <text class="sub" x="168" y="344">按 0 返回，不改已保存的模型</text>
      </svg>

      <svg v-else-if="name === 'packages'" viewBox="0 0 760 300" role="img" :aria-label="captions.packages">
        <rect class="box" x="24" y="20" width="712" height="260" rx="8" />
        <text class="sub" x="44" y="48">~/dev/opencode</text>
        <line class="hair" x1="24" y1="62" x2="736" y2="62" />
        <path class="sheet" d="M48 96 V78 H150 L168 96 H340 V248 H48 Z" />
        <text class="label" x="68" y="132">cli</text>
        <text class="sub" x="68" y="160">从这里启动</text>
        <text class="mono" x="68" y="196">src/index.ts</text>
        <path class="sheet" d="M368 96 V78 H470 L488 96 H712 V248 H368 Z" />
        <text class="label" x="388" y="132">core</text>
        <text class="sub" x="388" y="160">工具、权限、循环</text>
        <text class="mono" x="388" y="196">tool/  permission/</text>
        <text class="sub" x="388" y="228">tui 与 schema 先知道在旁边</text>
      </svg>

      <svg v-else-if="name === 'gateway'" viewBox="0 0 760 300" role="img" :aria-label="captions.gateway">
        <defs>
          <marker id="mk-gw" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <rect class="box" x="16" y="20" width="300" height="260" rx="8" />
        <text class="sub" x="32" y="46">终端 1 · 网关</text>
        <line class="hair" x1="16" y1="60" x2="316" y2="60" />
        <text class="mono" x="32" y="96">zen-free-agent</text>
        <text class="mono" x="32" y="124">--api-only</text>
        <text class="mono" x="32" y="168">127.0.0.1:8787</text>
        <text class="sub" x="32" y="208">GET /v1/models</text>
        <text class="sub" x="32" y="236">POST /v1/chat/completions</text>

        <line class="line" x1="328" y1="150" x2="400" y2="150" marker-end="url(#mk-gw)" />
        <text class="note" x="364" y="138" text-anchor="middle">请求</text>

        <rect class="box" x="412" y="20" width="332" height="260" rx="8" />
        <text class="sub" x="428" y="46">终端 2 · rebuild</text>
        <line class="hair" x1="412" y1="60" x2="744" y2="60" />
        <text class="mono" x="428" y="100">bun run chat</text>
        <text class="mono" x="428" y="144">you&gt; 只回复：OK</text>
        <text class="mono" x="428" y="184">assistant&gt; OK</text>
        <text class="sub" x="428" y="236">provider  local</text>
      </svg>

      <svg v-else-if="name === 'writefile'" viewBox="0 0 760 280" role="img" :aria-label="captions.writefile">
        <defs>
          <marker id="mk-wr" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path class="head" d="M0 1.2 L9 5 L0 8.8 Z" />
          </marker>
        </defs>
        <rect class="box" x="20" y="36" width="200" height="150" rx="8" />
        <text class="sub" x="36" y="64">tool_call</text>
        <text class="mono" x="36" y="100">write</text>
        <text class="mono" x="36" y="128">hello.py</text>
        <text class="sub" x="36" y="160">整文件写入</text>
        <line class="line" x1="228" y1="110" x2="286" y2="110" marker-end="url(#mk-wr)" />

        <path class="sheet" d="M300 28 H430 L458 56 V230 H300 Z" />
        <path class="hair" d="M430 28 V56 H458" />
        <text class="mono" x="316" y="88">hello.py</text>
        <line class="hair" x1="316" y1="112" x2="430" y2="112" />
        <line class="hair" x1="316" y1="132" x2="410" y2="132" />
        <line class="hair" x1="316" y1="152" x2="430" y2="152" />
        <line class="hair" x1="316" y1="172" x2="380" y2="172" />
        <text class="sub" x="316" y="208">磁盘上的文件</text>

        <line class="line" x1="470" y1="110" x2="528" y2="110" marker-end="url(#mk-wr)" />
        <rect class="box" x="540" y="36" width="200" height="150" rx="8" />
        <text class="sub" x="556" y="64">再 read</text>
        <text class="mono" x="556" y="100">hello.py</text>
        <text class="sub" x="556" y="136">内容回到对话</text>
        <text class="sub" x="556" y="160">核对写成功了</text>
      </svg>

      <svg v-else-if="name === 'hello'" viewBox="0 0 760 250" role="img" :aria-label="captions.hello">
        <rect class="box" x="20" y="24" width="360" height="200" rx="8" />
        <text class="sub" x="36" y="50">rebuild/</text>
        <line class="hair" x1="20" y1="64" x2="380" y2="64" />
        <text class="mono" x="36" y="108">$ bun run hello</text>
        <text class="mono" x="36" y="148">hello</text>
        <text class="sub" x="36" y="196">最小 CLI，先跑通</text>

        <path class="sheet" d="M430 24 H620 L648 52 V224 H430 Z" />
        <path class="hair" d="M620 24 V52 H648" />
        <text class="mono" x="448" y="84">index.ts</text>
        <text class="sub" x="448" y="120">注释里写上来源</text>
        <text class="mono" x="448" y="160">packages/cli/</text>
        <text class="mono" x="448" y="184">src/index.ts</text>
      </svg>

      <svg v-else-if="name === 'baseline'" viewBox="0 0 760 220" role="img" :aria-label="captions.baseline">
        <path class="sheet" d="M28 48 V28 H140 L160 48 H250 V192 H28 Z" />
        <text class="label" x="48" y="88">opencode</text>
        <text class="mono" x="48" y="122">2.2.0</text>
        <text class="sub" x="48" y="152">只读对照</text>

        <rect class="box" x="300" y="36" width="432" height="156" rx="8" />
        <text class="sub" x="320" y="66">锁定的提交</text>
        <text class="mono" x="320" y="108">fa1260d6ca</text>
        <text class="sub" x="320" y="142">2026-10-28 · bun@1.4.4</text>
        <text class="sub" x="320" y="168">换基线就改这一页的表</text>
      </svg>
    </div>
    <figcaption>{{ captions[name] }}</figcaption>
  </figure>
</template>
