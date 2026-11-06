/**
 * Mini subagent tool — one child agent, in the foreground, then its text comes back.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/subagent.ts
 * - packages/core/src/plugin/agent.ts   (explore is read-only and cannot spawn)
 *
 * Upstream can run the child in the background and continue it by session id.
 * This lesson only runs explore to completion and returns its answer.
 */

import { get } from "../agent/registry"
import type { ChatMessage } from "../llm/messages"
import {
  PermissionBlockedError,
  PermissionDeclinedError,
  assertPermission,
} from "../permission/assert"
import { TOOLS } from "./defs"
import type { ToolRunContext } from "./run"

const CHILD_TOOLS = TOOLS.filter((tool) => tool.function.name !== "subagent") as typeof TOOLS

export async function subagentTool(
  args: { agent?: string; prompt?: string; description?: string },
  ctx: ToolRunContext,
): Promise<string> {
  const agentId = args.agent?.trim()
  const prompt = args.prompt?.trim()
  const label = args.description?.trim() || agentId || "subagent"
  if (!agentId || !prompt) return "Error: agent and prompt are required"
  if (!ctx.llm) return "Error: subagent has no model configured"
  if (!ctx.permission) return "Error: subagent has no permission runtime"
  if ((ctx.depth ?? 0) > 0) return "Error: a subagent cannot spawn another subagent"

  try {
    await assertPermission(ctx.permission, {
      action: "subagent",
      resources: [agentId],
      message: `Permission denied: subagent ${agentId}`,
    })
  } catch (err) {
    if (err instanceof PermissionBlockedError || err instanceof PermissionDeclinedError) {
      return `Error: ${err.message}`
    }
    return `Error: ${err instanceof Error ? err.message : String(err)}`
  }

  const child = get(agentId)
  if (!child || child.mode !== "subagent") {
    return `Error: ${agentId} is not a subagent. Available: explore.`
  }

  ctx.onStatus?.(`${child.id} · ${label}`)
  const messages: ChatMessage[] = []
  if (child.system) messages.push({ role: "system", content: child.system })
  messages.push({ role: "user", content: prompt })

  const { agentLoop } = await import("../llm/agent-loop")
  const text = await agentLoop({
    llm: ctx.llm,
    messages,
    cwd: ctx.cwd,
    stream: ctx.stream,
    tools: CHILD_TOOLS,
    depth: (ctx.depth ?? 0) + 1,
    permission: {
      rules: [...child.permissions],
      saved: [],
      ask: ctx.permission.ask,
      unattended: ctx.permission.unattended,
    },
    onStatus: (line) => ctx.onStatus?.(`${child.id}: ${line}`),
    onDelta: ctx.onDelta,
    onToolStart: (name, toolArgs) => ctx.onToolStart?.(`${child.id} ${name}`, toolArgs),
    onTool: (name, toolArgs, result) => ctx.onTool?.(`${child.id} ${name}`, toolArgs, result),
  })
  return text || `(${child.id} returned no text)`
}
