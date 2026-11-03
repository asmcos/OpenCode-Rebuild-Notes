/**
 * Chat with a real model + tool loop + permissions.
 *
 * Important: do NOT keep readline open while tools/permissions run — a second
 * readline on the same stdin deadlocks (looks like the agent "froze").
 * OpenCode avoids this via TUI/Bus; we close the REPL prompt for each turn.
 */

import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { resolve } from "../../agent/registry"
import { loadLlmConfig } from "../../llm/config"
import type { ChatMessage } from "../../llm/messages"
import { agentLoop } from "../../llm/agent-loop"
import { evaluate, merge } from "../../permission/evaluate"
import { loadPermissionOverlay } from "../../permission/load"
import { createTtyAskHandler } from "../../permission/ask-tty"
import type { PermissionRuntime } from "../../permission/assert"
import { status } from "../../cli/tty"

const dim = (s: string) => `\x1b[36m${s}\x1b[0m`
function info(line: string) {
  console.log(dim(line))
}

function parseArgs(args: string[]) {
  let agentId: string | undefined
  let model: string | undefined
  let provider: string | undefined
  let noStream = false
  let askExternal = false
  let allowExternal = false
  const positional: string[] = []
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === "--agent" || a === "-a") {
      agentId = args[++i]
      continue
    }
    if (a === "--model" || a === "-m") {
      model = args[++i]
      continue
    }
    if (a === "--provider") {
      provider = args[++i]
      continue
    }
    if (a === "--no-stream") {
      noStream = true
      continue
    }
    if (a === "--ask-external") {
      askExternal = true
      continue
    }
    if (a === "--allow-external") {
      allowExternal = true
      continue
    }
    positional.push(a)
  }
  return {
    agentId,
    model,
    provider,
    noStream,
    askExternal,
    allowExternal,
    prompt: positional.join(" ").trim(),
  }
}

export async function run(args: string[]) {
  const { agentId, model, provider, noStream, askExternal, allowExternal, prompt } =
    parseArgs(args)
  const agent = resolve(agentId)
  if (!agent) {
    console.error(agentId ? `agent not found: ${agentId}` : "no default agent")
    process.exit(1)
  }

  let llm
  try {
    llm = await loadLlmConfig({ model, provider })
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  }

  const overlay = await loadPermissionOverlay({ askExternal, allowExternal })
  const unattended =
    process.env.REBUILD_PERMISSION_UNATTENDED === "allow" ? "allow" : "deny"
  const permission: PermissionRuntime = {
    rules: merge(agent.permissions, overlay),
    saved: [],
    ask: createTtyAskHandler(unattended),
    unattended,
  }

  const externalPolicy = evaluate(
    "external_directory",
    "*",
    permission.rules,
    permission.saved,
  ).effect

  const messages: ChatMessage[] = []
  if (agent.system) {
    messages.push({ role: "system", content: agent.system })
  }

  info(`${agent.id} · ${llm.model} · ${llm.provider}`)
  const shellPolicy = evaluate("shell", "*", permission.rules, permission.saved).effect
  info(`tools read, write, shell · permissions external=${externalPolicy} shell=${shellPolicy}`)
  info("/exit to quit")
  console.log()

  const runTurn = async (userText: string) => {
    messages.push({ role: "user", content: userText })
    process.stdout.write(dim("assistant> "))
    try {
      await agentLoop({
        llm,
        messages,
        cwd: process.cwd(),
        stream: !noStream,
        permission,
        onStatus: (line) => status(line),
        onDelta: (d) => process.stdout.write(d),
        onToolStart: (name, toolArgs) => {
          console.log()
          info(`[tool] ${name}(${toolArgs})`)
        },
        onTool: (_name, _toolArgs, result) => {
          const preview = result.slice(0, 160).replace(/\n/g, " ")
          info(`[tool] → ${preview}${result.length > 160 ? "…" : ""}`)
        },
      })
      console.log()
    } catch (err) {
      messages.pop()
      const msg = err instanceof Error ? err.message : String(err)
      console.error("\nError:", msg)
      if (/429|FreeUsageLimit|limit reached/i.test(msg)) {
        console.error(
          "→ Free limit / Zen gate. Prefer local gateway:\n" +
            "  REBUILD_LLM_PROVIDER=local bun run chat",
        )
      }
      if (/ECONNREFUSED|fetch failed/i.test(msg)) {
        console.error("→ Start local gateway first (zen-free-agent --api-only on :8787)")
      }
    }
  }

  if (prompt) {
    await runTurn(prompt)
    return
  }

  // REPL: create readline ONLY while waiting for you>; close before each turn
  // so permission> can own stdin (otherwise the session appears frozen).
  while (true) {
    const rl = readline.createInterface({ input, output })
    let line: string
    try {
      line = (await rl.question("you> ")).trim()
    } finally {
      rl.close()
    }
    if (!line) continue
    if (line === "/exit" || line === "/quit") break
    await runTurn(line)
  }
}
