/**
 * Inspired by (upstream relative paths):
 * - packages/cli/src/commands/handlers/debug/agents.ts (list agents for humans)
 * - packages/core/src/agent.ts (list / get / resolve)
 */

import { get, list, resolve } from "../../agent/registry"

export async function run(args: string[]) {
  const sub = args[0] ?? "list"

  if (sub === "list") {
    for (const agent of list()) {
      const mark = agent.mode === "subagent" ? "sub" : "pri"
      console.log(`[${mark}] ${agent.id}\t${agent.description ?? ""}`)
    }
    return
  }

  if (sub === "get") {
    const id = args[1]
    if (!id) {
      console.error("usage: agent get <id>")
      process.exit(1)
    }
    const agent = get(id)
    if (!agent) {
      console.error(`agent not found: ${id}`)
      process.exit(1)
    }
    console.log(JSON.stringify(agent, null, 2))
    return
  }

  if (sub === "resolve") {
    const id = args[1]
    const agent = resolve(id)
    if (!agent) {
      console.error("no agent resolved")
      process.exit(1)
    }
    console.log(JSON.stringify(agent, null, 2))
    return
  }

  console.error(`unknown agent subcommand: ${sub}`)
  console.error("usage: agent <list|get|resolve> ...")
  process.exit(1)
}
