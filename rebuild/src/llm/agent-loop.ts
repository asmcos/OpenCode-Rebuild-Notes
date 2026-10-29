/**
 * Mini agent loop: complete → run tools → complete again.
 *
 * Inspired by (upstream / example relative paths):
 * - packages/core/src/tool/runtime.ts
 * - packages/core/src/session (runner concept)
 * - zen-free-agent/index.mjs  (agentAsk)
 */

import type { ChatMessage } from "./messages"
import { zenComplete } from "./zen-free"
import { runTool } from "../tool/run"
import { newSessionID } from "./zen-id"

const DEFAULT_MAX_STEPS = 8

export type AgentLoopInput = {
  baseURL: string
  model: string
  version: string
  messages: ChatMessage[]
  cwd?: string
  maxSteps?: number
  onDelta?: (chunk: string) => void
  onTool?: (name: string, args: string, result: string) => void
}

export async function agentLoop(input: AgentLoopInput): Promise<string> {
  const maxSteps = input.maxSteps ?? DEFAULT_MAX_STEPS
  const cwd = input.cwd ?? process.cwd()
  const sessionID = newSessionID()
  const messages = input.messages

  for (let step = 0; step < maxSteps; step++) {
    const { message } = await zenComplete({
      baseURL: input.baseURL,
      model: input.model,
      version: input.version,
      messages,
      sessionID,
      cwd,
      onDelta: input.onDelta,
    })
    messages.push(message)

    if (!message.tool_calls?.length) {
      const text = message.content || ""
      if (text && !text.endsWith("\n")) process.stdout.write("\n")
      return text
    }

    if (message.content) process.stdout.write("\n")

    for (const call of message.tool_calls) {
      const result = await runTool(call.function.name, call.function.arguments, cwd)
      input.onTool?.(call.function.name, call.function.arguments, result)
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: result,
      })
    }
  }

  throw new Error(`agent loop exceeded maxSteps=${maxSteps}`)
}
