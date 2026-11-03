/**
 * List / select models from OpenAI-compatible GET /v1/models
 * (e.g. zen-free-agent gateway on http://127.0.0.1:8787/v1).
 */

import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { loadLlmConfig } from "../../llm/config"
import { listModels } from "../../llm/openai-stream"
import { prefsPath, savePrefs } from "../../llm/prefs"

const dim = (s: string) => `\x1b[36m${s}\x1b[0m`

export async function run(args: string[]) {
  const sub = args[0]

  let llm
  try {
    llm = await loadLlmConfig()
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  }

  if (llm.provider === "zen") {
    console.error(
      "models list needs an OpenAI-compatible gateway (provider=local).\n" +
        "Start zen-free-agent API, then: REBUILD_LLM_PROVIDER=local bun run models\n" +
        "(local is now the default.)",
    )
    process.exit(1)
  }

  if (sub === "use") {
    const id = args[1]
    if (!id) {
      console.error("usage: models use <id|index>")
      process.exit(1)
    }
    const ids = await listModels(llm.baseURL, llm.apiKey)
    const picked = /^\d+$/.test(id) ? ids[Number(id) - 1] : id
    if (!picked || !ids.includes(picked)) {
      console.error(`unknown model: ${id}`)
      console.error(`known: ${ids.join(", ") || "(empty)"}`)
      process.exit(1)
    }
    await savePrefs({ provider: llm.provider, baseURL: llm.baseURL, model: picked })
    console.log(dim(`saved model=${picked}`))
    console.log(dim(`prefs: ${prefsPath()}`))
    return
  }

  console.log(dim(`GET ${llm.baseURL}/models`))
  let ids: string[]
  try {
    ids = await listModels(llm.baseURL, llm.apiKey)
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    console.error(
      "→ Is the gateway up? Example:\n" +
        "  USE_PROXY=1 ~/.bun/bin/bun zen-free-agent/index.mjs --api-only\n" +
        "  curl -s http://127.0.0.1:8787/v1/models",
    )
    process.exit(1)
  }

  if (!ids.length) {
    console.log("(no models)")
    return
  }

  ids.forEach((id, i) => {
    const mark = id === llm.model ? " *" : ""
    console.log(`  ${i + 1}) ${id}${mark}`)
  })
  console.log(dim(`current: ${llm.model}  (* = selected)`))

  if (sub === "list" || sub === "--json") {
    if (sub === "--json") console.log(JSON.stringify(ids))
    return
  }

  // interactive pick when no subcommand and stdin is a TTY
  if (!process.stdin.isTTY) return

  const rl = readline.createInterface({ input, output })
  try {
    const answer = (await rl.question("select number (empty=skip): ")).trim()
    if (!answer) return
    const picked = ids[Number(answer) - 1]
    if (!picked) {
      console.error("invalid selection")
      process.exit(1)
    }
    await savePrefs({ provider: llm.provider, baseURL: llm.baseURL, model: picked })
    console.log(dim(`saved model=${picked}`))
    console.log(dim(`prefs: ${prefsPath()}`))
  } finally {
    rl.close()
  }
}
