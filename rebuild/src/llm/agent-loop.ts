/**
 * Mini agent loop: complete → run tools → complete again.
 *
 * Inspired by (upstream / example relative paths):
 * - packages/core/src/tool/runtime.ts
 * - packages/core/src/session (runner concept)
 * - zen-free-agent/index.mjs  (agentAsk)
 */

import type { ChatMessage } from "./messages"
import type { LlmConfig } from "./config"
import { zenComplete, withZenEnv } from "./zen-free"
import { openaiComplete } from "./openai-stream"
import { runTool } from "../tool/run"
import { newSessionID } from "./zen-id"
import type { PermissionRuntime } from "../permission/assert"

const DEFAULT_MAX_STEPS = 8

export type AgentLoopInput = {
  llm: LlmConfig
  messages: ChatMessage[]
  cwd?: string
  maxSteps?: number
  stream?: boolean
  permission?: PermissionRuntime
  onStatus?: (line: string) => void
  onDelta?: (chunk: string) => void
  /** Fired when a tool starts (before permission / IO). */
  onToolStart?: (name: string, args: string) => void
  onTool?: (name: string, args: string, result: string) => void
}

export async function agentLoop(input: AgentLoopInput): Promise<string> {
  const maxSteps = input.maxSteps ?? DEFAULT_MAX_STEPS
  const cwd = input.cwd ?? process.cwd()
  const sessionID = newSessionID()
  const messages = input.messages
  const { llm } = input

  for (let step = 0; step < maxSteps; step++) {
    input.onStatus?.(
      step === 0
        ? `calling model (${llm.provider}/${llm.model})…`
        : `calling model again (step ${step + 1}/${maxSteps})…`,
    )

    let message: Extract<ChatMessage, { role: "assistant" }>

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
      })
    }

    messages.push(message)

    if (!message.tool_calls?.length) {
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
      })
      input.onTool?.(name, args, result)
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: result,
      })
    }
  }

  throw new Error(`agent loop exceeded maxSteps=${maxSteps}`)
}
