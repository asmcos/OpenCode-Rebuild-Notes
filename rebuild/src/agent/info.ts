/**
 * Mini agent shape.
 *
 * Inspired by (upstream relative paths):
 * - packages/schema/src/agent.ts  (Agent.Info)
 *
 * Only the fields we need for learning. Upstream also has model, request,
 * color, steps, permissions rulesets, etc.
 */

export type AgentMode = "primary" | "subagent" | "all"

export type AgentInfo = {
  id: string
  name: string
  description?: string
  /** System prompt / instructions for this agent persona */
  system?: string
  mode: AgentMode
  hidden?: boolean
}
