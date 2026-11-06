/**
 * Mini agent loop: complete → run tools → complete again.
 *
 * Upstream (packages/schema/src/agent.ts): `steps` is optional. The default
 * agent does not set it, so one user turn keeps going while the model calls
 * tools. A configured limit forces a text-only reply
 * (packages/core/src/session/runner/max-steps.ts,
 * packages/core/src/session/runner/step.ts when toolChoice is none).
 * The next user message starts a fresh turn. Long sessions stay alive by
 * compacting context (packages/core/src/session/compaction.ts), not by
 * aborting the loop.
 */

import type { ChatMessage } from "./messages"
import type { LlmConfig } from "./config"
import { zenComplete, withZenEnv } from "./zen-free"
import { openaiComplete } from "./openai-stream"
import { runTool } from "../tool/run"
import { newSessionID } from "./zen-id"
import type { PermissionRuntime } from "../permission/assert"
import { TOOLS } from "../tool/defs"

/** Shown once, when a configured step budget is spent. Tools stay off for this call. */
const STEP_LIMIT_PROMPT = `本轮工具步数已到上限。从现在到用户下一次发言，不要再调用工具。

用文字说明：
- 已经做完的事
- 还没做完的事
- 建议用户下一步说什么

只回复文字。`

export type AgentLoopInput = {
  llm: LlmConfig
  messages: ChatMessage[]
  cwd?: string
  /**
   * Tool rounds allowed in this user turn. Unset means no cap: stop when the
   * model replies with text. When set, the next call is text-only.
   */
  maxSteps?: number
  stream?: boolean
  /** Defaults to the full tool list. A child agent omits `subagent`. */
  tools?: typeof TOOLS
  permission?: PermissionRuntime
  /** Nesting depth. The subagent tool refuses to run above 0. */
  depth?: number
  onStatus?: (line: string) => void
  onDelta?: (chunk: string) => void
  /** Fired when a tool starts (before permission / IO). */
  onToolStart?: (name: string, args: string) => void
  onTool?: (name: string, args: string, result: string) => void
}

export async function agentLoop(input: AgentLoopInput): Promise<string> {
  const maxSteps = input.maxSteps
  const cwd = input.cwd ?? process.cwd()
  const sessionID = newSessionID()
  const messages = input.messages
  const { llm } = input

  for (let step = 0; ; step++) {
    const textOnly = maxSteps !== undefined && step >= maxSteps
    if (textOnly) {
      messages.push({ role: "user", content: STEP_LIMIT_PROMPT })
      input.onStatus?.("step limit reached, asking for a text summary…")
    } else {
      input.onStatus?.(
        step === 0
          ? `calling model (${llm.provider}/${llm.model})…`
          : `calling model again (step ${step + 1})…`,
      )
    }

    let message: Extract<ChatMessage, { role: "assistant" }>
    const tools = textOnly ? null : (input.tools ?? TOOLS)

    if (llm.provider === "zen" || llm.provider === "go") {
      const result = await zenComplete({
        baseURL: llm.baseURL,
        model: llm.model,
        version: llm.version,
        messages,
        sessionID,
        cwd,
        apiKey: llm.provider === "go" ? llm.apiKey : undefined,
        onDelta: input.onDelta,
        tools,
      })
      message = result.message
    } else {
      message = await openaiComplete({
        baseURL: llm.baseURL,
        model: llm.model,
        apiKey: llm.apiKey,
        messages: withZenEnv(messages, cwd),
        stream: input.stream !== false,
        onDelta: input.onDelta,
        tools,
      })
    }

    if (textOnly && message.tool_calls?.length) {
      message = { role: "assistant", content: message.content }
    }
    messages.push(message)

    if (textOnly || !message.tool_calls?.length) {
      const text = message.content || ""
      if (text && !text.endsWith("\n")) process.stdout.write("\n")
      return text
    }

    if (message.content) process.stdout.write("\n")

    for (const call of message.tool_calls) {
      const name = call.function.name
      const args = call.function.arguments
      input.onToolStart?.(name, args)
      input.onStatus?.(`running ${name}…`)
      const result = await runTool(name, args, {
        cwd,
        permission: input.permission,
        llm,
        stream: input.stream,
        depth: input.depth ?? 0,
        onStatus: input.onStatus,
        onDelta: input.onDelta,
        onToolStart: input.onToolStart,
        onTool: input.onTool,
      })
      input.onTool?.(name, args, result)
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: result,
      })
    }
  }
}
