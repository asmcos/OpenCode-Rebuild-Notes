/**
 * Chat with a real model + optional tool loop (read).
 *
 * Inspired by (upstream / local example relative paths):
 * - packages/core/src/aisdk.ts
 * - packages/core/src/agent.ts
 * - packages/core/src/tool/plugin/read.ts
 * - packages/sdk/js/example/chat-zen-free.mjs
 */

import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { resolve } from "../../agent/registry"
import { loadLlmConfig } from "../../llm/config"
import { chatCompletion } from "../../llm/openai-compatible"
import type { ChatMessage } from "../../llm/messages"
import { agentLoop } from "../../llm/agent-loop"

/** Status lines — cyan on stdout (stderr often renders red and looks like failure). */
const dim = (s: string) => `\x1b[36m${s}\x1b[0m`
function info(line: string) {
  console.log(dim(line))
}

function parseArgs(args: string[]) {
  let agentId: string | undefined
  const positional: string[] = []
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === "--agent" || a === "-a") {
      agentId = args[++i]
      continue
    }
    positional.push(a)
  }
  return { agentId, prompt: positional.join(" ").trim() }
}

export async function run(args: string[]) {
  const { agentId, prompt } = parseArgs(args)
  const agent = resolve(agentId)
  if (!agent) {
    console.error(agentId ? `agent not found: ${agentId}` : "no default agent")
    process.exit(1)
  }

  let llm
  try {
    llm = loadLlmConfig()
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  }

  const messages: ChatMessage[] = []
  if (agent.system) {
    messages.push({ role: "system", content: agent.system })
  }

  info(`provider=${llm.provider}  agent=${agent.id}  model=${llm.model}  base=${llm.baseURL}`)
  if (llm.provider === "zen") {
    info("auth=Bearer public (Zen free — no personal API key)")
    info("tools=read (cwd-scoped)")
  }
  info("type /exit to quit")
  console.log()

  const askOnce = async (userText: string) => {
    messages.push({ role: "user", content: userText })
    try {
      if (llm.provider === "zen") {
        await agentLoop({
          baseURL: llm.baseURL,
          model: llm.model,
          version: llm.version,
          messages,
          cwd: process.cwd(),
          onDelta: (d) => process.stdout.write(d),
          onTool: (name, args, result) => {
            info(`[tool] ${name}(${args})`)
            const preview = result.slice(0, 160).replace(/\n/g, " ")
            info(`[tool] → ${preview}${result.length > 160 ? "…" : ""}`)
          },
        })
        console.log()
      } else {
        const reply = await chatCompletion({
          baseURL: llm.baseURL,
          apiKey: llm.apiKey!,
          model: llm.model,
          messages: messages.filter(
            (m): m is { role: "system" | "user" | "assistant"; content: string } =>
              (m.role === "system" || m.role === "user" || m.role === "assistant") &&
              typeof m.content === "string",
          ),
        })
        messages.push({ role: "assistant", content: reply })
        console.log(reply)
        console.log()
      }
    } catch (err) {
      // keep user message; drop incomplete assistant/tool turns is hard — pop user on hard fail
      messages.pop()
      const msg = err instanceof Error ? err.message : String(err)
      console.error("\nError:", msg)
      if (/429|FreeUsageLimit|limit reached/i.test(msg)) {
        console.error(
          "→ Zen free gate: use Bun≥1.4, stream:true, read tool, ses_ id, <env> block, User-Agent opencode/…",
        )
      }
    }
  }

  if (prompt) {
    await askOnce(prompt)
    return
  }

  const rl = readline.createInterface({ input, output })
  try {
    while (true) {
      const line = (await rl.question("you> ")).trim()
      if (!line) continue
      if (line === "/exit" || line === "/quit") break
      process.stdout.write(dim("assistant> "))
      await askOnce(line)
    }
  } finally {
    rl.close()
  }
}
