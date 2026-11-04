/**
 * List / select models.
 *
 * - local: GET {baseURL}/models (zen-free-agent on :8787)
 * - zen / go: upstream free catalog only (paid and *contributor* hidden)
 *
 * `models zen` and `models go` switch endpoints and remember each side's model.
 */

import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { goKeySource, loadLlmConfig, resolveGoApiKey, type LlmConfig, type LlmProvider } from "../../llm/config"
import {
  FALLBACK_GO_MODEL,
  FALLBACK_ZEN_MODEL,
  isFreeModel,
  listFreeModels,
  modelsUrl,
  normalizeModelID,
  type FreeEndpoint,
} from "../../llm/free-catalog"
import { listModels } from "../../llm/openai-stream"
import { loadPrefs, prefsPath, savePrefs, type LlmPrefs } from "../../llm/prefs"

const dim = (s: string) => `\x1b[36m${s}\x1b[0m`

function maskKey(key: string) {
  if (!key) return "(none)"
  if (key.length <= 10) return `${key.slice(0, 4)}…`
  return `${key.slice(0, 8)}…${key.slice(-4)}`
}

function isEndpoint(value: string | undefined): value is "zen" | "go" | "local" {
  return value === "zen" || value === "go" || value === "local"
}

async function rememberModel(provider: LlmProvider, model: string, baseURL?: string) {
  const patch: LlmPrefs = { provider, model }
  const unset: (keyof LlmPrefs)[] = []
  if (provider === "zen") {
    patch.zenModel = model
    unset.push("baseURL")
  } else if (provider === "go") {
    patch.goModel = model
    unset.push("baseURL")
  } else if (baseURL) {
    patch.baseURL = baseURL
  }
  await savePrefs(patch, unset)
}

async function idsFor(llm: LlmConfig) {
  if (llm.provider === "zen" || llm.provider === "go") {
    return listFreeModels(llm.provider, llm.apiKey)
  }
  return listModels(llm.baseURL, llm.apiKey)
}

function printIds(ids: string[], current: string) {
  if (!ids.length) {
    console.log("(no models)")
    return
  }
  ids.forEach((id, i) => {
    const mark = id === current ? " *" : ""
    console.log(`  ${i + 1}) ${id}${mark}`)
  })
}

async function select(ids: string[], token: string) {
  const picked = /^\d+$/.test(token) ? ids[Number(token) - 1] : normalizeModelID(token)
  if (!picked || !ids.includes(picked)) {
    console.error(`unknown model: ${token}`)
    console.error(`known: ${ids.join(", ") || "(empty)"}`)
    process.exit(1)
  }
  return picked
}

async function promptPick(ids: string[]) {
  if (!process.stdin.isTTY || !ids.length) return
  const rl = readline.createInterface({ input, output })
  try {
    const answer = (await rl.question("select number (empty=skip): ")).trim()
    if (!answer) return
    const picked = ids[Number(answer) - 1]
    if (!picked) {
      console.error("invalid selection")
      process.exit(1)
    }
    return picked
  } finally {
    rl.close()
  }
}

export async function run(args: string[]) {
  const json = args.includes("--json")
  const pos = args.filter((a) => !a.startsWith("--"))
  const sub = pos[0]

  if (sub === "key") {
    const prefs = await loadPrefs()
    const action = pos[1]
    if (action === "set") {
      const key = pos[2]?.trim()
      if (!key) {
        console.error("usage: models key set <oc_sk_…>")
        process.exit(1)
      }
      await savePrefs({ goApiKey: key })
      console.log(dim(`saved go key ${maskKey(key)} → ${prefsPath()}`))
      console.log(dim("file is gitignored"))
      return
    }
    const key = resolveGoApiKey(prefs)
    console.log(dim(`go key: ${maskKey(key)} (${goKeySource(prefs)})`))
    if (!key) console.log("set one with: bun run models key set oc_sk_…")
    return
  }

  let switchTo: "zen" | "go" | "local" | undefined
  let useTokens: string[] = []

  if (sub === "endpoint") {
    if (!isEndpoint(pos[1])) {
      console.error("usage: models endpoint <zen|go|local>")
      process.exit(1)
    }
    switchTo = pos[1]
    useTokens = pos.slice(2)
  } else if (isEndpoint(sub) && sub) {
    switchTo = sub
    useTokens = pos.slice(1)
  } else   if (sub === "use") {
    if (isEndpoint(pos[1])) {
      switchTo = pos[1]
      useTokens = pos.slice(2)
    } else {
      useTokens = pos.slice(1)
    }
    if (!useTokens[0]) {
      console.error("usage: models use <id|index>   or   models use <zen|go|local> <id|index>")
      process.exit(1)
    }
  }

  if (switchTo === "go" && !resolveGoApiKey(await loadPrefs())) {
    console.error(
      "Go needs an API key (not stored in git).\n" +
        "  OPENCODE_API_KEY=oc_sk_… bun run models go\n" +
        "  or: bun run models key set oc_sk_…",
    )
    process.exit(1)
  }

  if (switchTo === "zen" || switchTo === "go") {
    const prefs = await loadPrefs()
    const endpoint = switchTo
    if (prefs.provider === "zen" && prefs.model) await savePrefs({ zenModel: prefs.model })
    if (prefs.provider === "go" && prefs.model) await savePrefs({ goModel: prefs.model })
    const remembered = endpoint === "go" ? (await loadPrefs()).goModel : (await loadPrefs()).zenModel
    const fallback = endpoint === "go" ? FALLBACK_GO_MODEL : FALLBACK_ZEN_MODEL
    const seed = remembered && isFreeModel(remembered, endpoint) ? remembered : fallback
    await rememberModel(endpoint, seed)
  } else if (switchTo === "local") {
    const prefs = await loadPrefs()
    if (prefs.provider === "zen" && prefs.model) await savePrefs({ zenModel: prefs.model })
    if (prefs.provider === "go" && prefs.model) await savePrefs({ goModel: prefs.model })
    await savePrefs({
      provider: "local",
      model: prefs.provider === "local" ? prefs.model || "beam-free" : "beam-free",
      baseURL: prefs.baseURL || "http://127.0.0.1:8787/v1",
    })
  }

  let llm: LlmConfig
  try {
    llm = await loadLlmConfig()
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  }

  if (llm.provider === "zen" || llm.provider === "go") {
    console.log(dim(`GET ${modelsUrl(llm.provider as FreeEndpoint)}  (free only)`))
  } else if (!json) {
    console.log(dim(`GET ${llm.baseURL}/models`))
  }

  let ids: string[]
  try {
    ids = await idsFor(llm)
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    if (llm.provider === "local") {
      console.error(
        "→ Is the gateway up? Example:\n" +
          "  USE_PROXY=1 ~/.bun/bin/bun zen-free-agent/index.mjs --api-only\n" +
          "  curl -s http://127.0.0.1:8787/v1/models",
      )
    }
    process.exit(1)
  }

  if ((llm.provider === "zen" || llm.provider === "go") && llm.model && !ids.includes(llm.model) && ids[0]) {
    await rememberModel(llm.provider, ids[0])
    llm = { ...llm, model: ids[0] }
  }

  if (useTokens.length) {
    const token = useTokens[0]
    if (!token) {
      console.error("usage: models use <id|index>   or   models use <zen|go|local> <id|index>")
      process.exit(1)
    }
    const picked = await select(ids, token)
    await rememberModel(llm.provider, picked, llm.baseURL)
    console.log(dim(`saved ${llm.provider} model=${picked}`))
    console.log(dim(`prefs: ${prefsPath()}`))
    return
  }

  printIds(ids, llm.model)
  if (llm.provider === "zen" || llm.provider === "go") {
    console.log(dim(`current: ${llm.provider}/${llm.model}  (* = selected, free only)`))
    console.log(dim("switch: bun run models zen | bun run models go | bun run models local"))
  } else {
    console.log(dim(`current: ${llm.model}  (* = selected)`))
    console.log(dim("switch: bun run models zen | bun run models go"))
  }

  if (json) console.log(JSON.stringify(ids))
  if (sub === "list" || json || !process.stdin.isTTY) return

  const picked = await promptPick(ids)
  if (!picked) return
  await rememberModel(llm.provider, picked, llm.baseURL)
  console.log(dim(`saved ${llm.provider} model=${picked}`))
  console.log(dim(`prefs: ${prefsPath()}`))
}
