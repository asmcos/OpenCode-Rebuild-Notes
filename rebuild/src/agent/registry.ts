/**
 * In-memory agent registry (no Effect / Bus / State yet).
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/agent.ts
 * - packages/schema/src/agent.ts     (Agent.Info.default permissions)
 * - packages/core/src/plugin/agent.ts (explore permissions)
 */

import type { AgentInfo } from "./info"
import {
  DEFAULT_PERMISSIONS,
  EXPLORE_PERMISSIONS,
  PLAN_PERMISSIONS,
} from "../permission/evaluate"

const agents = new Map<string, AgentInfo>()

function seed() {
  if (agents.size > 0) return

  register({
    id: "build",
    name: "build",
    description: "Default coding agent (mini)",
    system:
      "You are a careful coding agent. Prefer small, correct changes. " +
      "Use grep and glob to find files, then read. Prefer those over shell. " +
      "Use edit to change part of an existing file: oldString must match the file exactly once. " +
      "Use write only to create a file or replace its whole contents. " +
      "When the user asks to create or save a file, call write immediately with a reasonable default — " +
      "do NOT ask clarifying questions unless they explicitly ask for options. " +
      "Permission prompts are handled by the harness, not by you.",
    mode: "primary",
    permissions: [...DEFAULT_PERMISSIONS],
  })

  register({
    id: "plan",
    name: "plan",
    description: "Planning-only agent (mini)",
    system:
      "You only plan. Do not call write or edit files; propose steps instead. " +
      "You may use the read tool to inspect files before planning.",
    mode: "primary",
    permissions: [...PLAN_PERMISSIONS],
  })

  register({
    id: "explore",
    name: "explore",
    description: "Read-only explore subagent (mini)",
    system:
      "You explore the codebase with the read tool and report findings. " +
      "Do not call write or modify files.",
    mode: "subagent",
    permissions: [...EXPLORE_PERMISSIONS],
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
