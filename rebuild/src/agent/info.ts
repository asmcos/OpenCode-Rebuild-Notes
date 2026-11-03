/**
 * Mini agent shape.
 *
 * Inspired by (upstream relative paths):
 * - packages/schema/src/agent.ts  (Agent.Info)
 */

import type { PermissionRuleset } from "../permission/types"

export type AgentMode = "primary" | "subagent" | "all"

export type AgentInfo = {
  id: string
  name: string
  description?: string
  /** System prompt / instructions for this agent persona */
  system?: string
  mode: AgentMode
  hidden?: boolean
  /** Upstream Agent.Info.permissions */
  permissions: PermissionRuleset
}
