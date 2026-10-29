/**
 * OpenCode Zen free models — no personal API key.
 *
 * Same client-gate tricks as packages/sdk/js/example/chat-zen-free.mjs
 * (Bearer public, stream, read tool, ses_, <env>).
 *
 * Streaming also accumulates tool_calls (see zen-free-agent complete()).
 */

import { newSessionID } from "./zen-id"
import type { ChatMessage, ToolCall } from "./messages"
import { TOOLS } from "../tool/defs"

export type { ChatMessage, ToolCall }

export type ZenCompleteInput = {
  baseURL: string
  model: string
  version: string
  messages: ChatMessage[]
  sessionID?: string
  cwd?: string
  tools?: typeof TOOLS
  onDelta?: (chunk: string) => void
}

export function envBlock(cwd = process.cwd()) {
  return `<env>
  Working directory: ${cwd}
  Workspace root folder: ${cwd}
  Is directory a git repo: no
  Platform: ${process.platform}
  Today's date: ${new Date().toISOString().slice(0, 10)}
</env>`
}

function sessionHeaders(sessionID: string, version: string) {
  return {
    Authorization: "Bearer public",
    "Content-Type": "application/json",
    "User-Agent": `opencode/latest/${version}/cli`,
    "x-opencode-client": "cli",
    "x-opencode-project": "global",
    "x-opencode-session": sessionID,
    "x-opencode-session-id": sessionID,
    "x-session-affinity": sessionID,
    "x-session-id": sessionID,
  }
}

export function withZenEnv(messages: ChatMessage[], cwd = process.cwd()): ChatMessage[] {
  const block = envBlock(cwd)
  const out = messages.map((m) => ({ ...m })) as ChatMessage[]
  const sys = out.find((m) => m.role === "system")
  if (sys && sys.role === "system") {
    if (!sys.content.includes("<env>")) {
      sys.content = `${sys.content}\n\n${block}`
    }
  } else {
    out.unshift({
      role: "system",
      content: `You are an AI agent running in a coding harness. Use the read tool when you need file contents.\n\n${block}`,
    })
  }
  return out
}

/** One streaming completion; may include tool_calls. */
export async function zenComplete(
  input: ZenCompleteInput,
): Promise<{ sessionID: string; message: Extract<ChatMessage, { role: "assistant" }> }> {
  const sessionID = input.sessionID ?? newSessionID()
  const messages = withZenEnv(input.messages, input.cwd)
  const tools = input.tools ?? TOOLS

  const res = await fetch(`${input.baseURL}/chat/completions`, {
    method: "POST",
    headers: sessionHeaders(sessionID, input.version),
    body: JSON.stringify({
      model: input.model,
      stream: true,
      max_completion_tokens: 2048,
      messages,
      tools,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Zen HTTP ${res.status}: ${text.slice(0, 800)}`)
  }
  if (!res.body) throw new Error("Zen response missing body")

  let content = ""
  const toolCalls = new Map<number, { id?: string; name?: string; arguments: string }>()
  let buffer = ""

  for await (const chunk of res.body as AsyncIterable<Uint8Array>) {
    buffer += Buffer.from(chunk).toString()
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      if (!line.startsWith("data:")) continue
      const data = line.slice(5).trim()
      if (!data || data === "[DONE]") continue
      let json: {
        choices?: Array<{
          delta?: {
            content?: string
            tool_calls?: Array<{
              index?: number
              id?: string
              function?: { name?: string; arguments?: string }
            }>
          }
        }>
      }
      try {
        json = JSON.parse(data)
      } catch {
        continue
      }
      const delta = json.choices?.[0]?.delta
      if (!delta) continue
      if (delta.content) {
        content += delta.content
        input.onDelta?.(delta.content)
      }
      if (Array.isArray(delta.tool_calls)) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0
          const cur = toolCalls.get(idx) || { arguments: "" }
          if (tc.id) cur.id = tc.id
          if (tc.function?.name) cur.name = tc.function.name
          if (tc.function?.arguments) cur.arguments += tc.function.arguments
          toolCalls.set(idx, cur)
        }
      }
    }
  }

  const calls: ToolCall[] = [...toolCalls.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, c], i) => ({
      id: c.id || `call_${i}`,
      type: "function" as const,
      function: { name: c.name || "unknown", arguments: c.arguments || "{}" },
    }))
    .filter((c) => c.function.name !== "unknown")

  if (!content && calls.length === 0) {
    throw new Error("Zen returned empty content and no tool_calls")
  }

  return {
    sessionID,
    message: {
      role: "assistant",
      content: content || null,
      ...(calls.length ? { tool_calls: calls } : {}),
    },
  }
}

/** @deprecated use zenComplete + agentLoop; kept name for older call sites */
export async function zenChat(
  input: Omit<ZenCompleteInput, "sessionID"> & { onDelta?: (chunk: string) => void },
): Promise<{ sessionID: string; content: string }> {
  const { sessionID, message } = await zenComplete(input)
  const content = message.content || ""
  if (!content && !message.tool_calls?.length) {
    throw new Error("Zen returned empty content (check free-gate requirements)")
  }
  return { sessionID, content: content || "(tool_calls only)" }
}
