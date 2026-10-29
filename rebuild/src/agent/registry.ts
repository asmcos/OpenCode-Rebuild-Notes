/**
 * In-memory agent registry (no Effect / Bus / State yet).
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/agent.ts       (Agent.Service list / get / resolve)
 * - packages/schema/src/agent.ts     (Agent.Info.default, default id "build")
 */

import type { AgentInfo } from "./info"

const agents = new Map<string, AgentInfo>()

function seed() {
  if (agents.size > 0) return

  // Upstream default agent id is often "build" — see packages/core/src/agent.ts (defaultID)
  register({
    id: "build",
    name: "build",
    description: "Default coding agent (mini)",
    system:
      "You are a careful coding agent. Prefer small, correct changes. " +
      "When you need file contents, call the read tool with a path.",
    mode: "primary",
  })

  register({
    id: "plan",
    name: "plan",
    description: "Planning-only agent (mini)",
    system:
      "You only plan. Do not edit files; propose steps instead. " +
      "You may use the read tool to inspect files before planning.",
    mode: "primary",
  })

  register({
    id: "explore",
    name: "explore",
    description: "Read-only explore subagent (mini)",
    system:
      "You explore the codebase with the read tool and report findings. Do not modify files.",
    mode: "subagent",
  })
}

export function register(info: AgentInfo) {
  agents.set(info.id, info)
}

export function list(): AgentInfo[] {
  seed()
  return [...agents.values()].filter((a) => !a.hidden)
}

export function get(id: string): AgentInfo | undefined {
  seed()
  return agents.get(id)
}

export function resolve(id?: string): AgentInfo | undefined {
  seed()
  if (id) return agents.get(id)
  return agents.get("build") ?? [...agents.values()].find((a) => a.mode !== "subagent")
}
