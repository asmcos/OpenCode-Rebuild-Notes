/**
 * Startup menu for interactive chat: pick Zen / Go / local model, or agent.
 * Readline is opened only for the question, same rule as permission prompts.
 */

import { list } from "../agent/registry"
import type { AgentInfo } from "../agent/info"
import { askLine, askMenu } from "./tty"
import { loadLlmConfig, type LlmConfig } from "../llm/config"
import { listSelectableModels, rememberModel } from "../commands/handlers/models"

const dim = (s: string) => `\x1b[36m${s}\x1b[0m`

export type SessionChoice = {
  agent: AgentInfo
  llm: LlmConfig
}

function printModels(ids: string[], current: string) {
  ids.forEach((id, i) => {
    const mark = id === current ? " *" : ""
    console.log(`  ${i + 1}) ${id}${mark}`)
  })
  console.log("  0) 返回")
}

async function pickModel(endpoint: "zen" | "go" | "local"): Promise<LlmConfig | null> {
  let next: LlmConfig
  try {
    next = await loadLlmConfig({ provider: endpoint })
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return null
  }
  let ids: string[]
  try {
    console.log(dim(endpoint === "local" ? `GET ${next.baseURL}/models` : `GET ${endpoint} free models`))
    ids = await listSelectableModels(next)
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    if (endpoint === "local") {
      console.error("→ 先启动本地网关（zen-free-agent --api-only，:8787）")
    }
    return null
  }
  if (!ids.length) {
    console.log("(no models)")
    return null
  }
  printModels(ids, next.model)
  const answer = await askLine("选择序号> ")
  if (!answer || answer === "0") return null
  const picked = ids[Number(answer) - 1]
  if (!picked) {
    console.error("invalid selection")
    return null
  }
  await rememberModel(next.provider, picked, next.baseURL)
  return loadLlmConfig()
}

async function pickAgent(currentId: string): Promise<AgentInfo | null> {
  const agents = list()
  agents.forEach((agent, i) => {
    const mark = agent.id === currentId ? " *" : ""
    console.log(`  ${i + 1}) ${agent.id}${mark}`)
  })
  console.log("  0) 返回")
  const answer = await askLine("选择序号> ")
  if (!answer || answer === "0") return null
  const picked = agents[Number(answer) - 1]
  if (!picked) {
    console.error("invalid selection")
    return null
  }
  return picked
}

/** null = user quit. */
export async function sessionMenu(current: SessionChoice): Promise<SessionChoice | null> {
  let agent = current.agent
  let llm = current.llm

  for (;;) {
    console.log(dim("菜单"))
    console.log(`  1) 开始对话   ${agent.id} · ${llm.model} · ${llm.provider}`)
    console.log("  2) Zen 免费模型")
    console.log("  3) Go 免费模型")
    console.log("  4) 本地网关模型")
    console.log("  5) 切换 agent")
    console.log("  q) 退出")
    const answer = await askMenu("选择> ")
    if (answer === "q" || answer === "quit" || answer === "exit") return null
    if (answer === "1" || answer === "") return { agent, llm }
    if (answer === "2" || answer === "3" || answer === "4") {
      const endpoint = answer === "2" ? "zen" : answer === "3" ? "go" : "local"
      const picked = await pickModel(endpoint)
      if (picked) return { agent, llm: picked }
      continue
    }
    if (answer === "5") {
      const picked = await pickAgent(agent.id)
      if (picked) agent = picked
      continue
    }
    console.error("invalid selection")
  }
}
