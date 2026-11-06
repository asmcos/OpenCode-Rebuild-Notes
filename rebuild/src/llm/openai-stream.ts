/**
 * OpenAI-compatible streaming chat/completions (tools + tool_calls).
 * Used for local gateway (e.g. zen-free-agent on :8787) and generic openai provider.
 */

import type { ChatMessage, ToolCall } from "./messages"
import { TOOLS } from "../tool/defs"

export type OpenAIStreamInput = {
  baseURL: string
  model: string
  apiKey?: string
  messages: ChatMessage[]
  tools?: typeof TOOLS | null
  stream?: boolean
  onDelta?: (chunk: string) => void
}

function authHeaders(apiKey?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  return headers
}

/** Non-streaming one-shot (no tools aggregation). */
export async function openaiChatOnce(input: OpenAIStreamInput): Promise<string> {
  const res = await fetch(`${input.baseURL}/chat/completions`, {
    method: "POST",
    headers: authHeaders(input.apiKey),
    body: JSON.stringify({
      model: input.model,
      stream: false,
      messages: input.messages,
    }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${text.slice(0, 800)}`)
  const data = JSON.parse(text) as {
    choices?: Array<{ message?: { content?: string | null } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (typeof content !== "string" || !content) {
    throw new Error(`LLM empty content: ${text.slice(0, 400)}`)
  }
  return content
}

/** Streaming complete; may include tool_calls. */
export async function openaiComplete(
  input: OpenAIStreamInput,
): Promise<Extract<ChatMessage, { role: "assistant" }>> {
  const stream = input.stream !== false
  const tools = input.tools === null ? undefined : (input.tools ?? TOOLS)

  const res = await fetch(`${input.baseURL}/chat/completions`, {
    method: "POST",
    headers: authHeaders(input.apiKey),
    body: JSON.stringify({
      model: input.model,
      stream,
      max_completion_tokens: 2048,
      messages: input.messages,
      ...(tools ? { tools } : {}),
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`LLM HTTP ${res.status}: ${text.slice(0, 800)}`)
  }

  if (!stream) {
    const text = await res.text()
    const data = JSON.parse(text) as {
      choices?: Array<{
        message?: {
          content?: string | null
          tool_calls?: ToolCall[]
        }
      }>
    }
    const msg = data.choices?.[0]?.message
    const content = msg?.content ?? null
    const calls = msg?.tool_calls ?? []
    if (content) input.onDelta?.(content)
    if (!content && calls.length === 0) {
      throw new Error(`LLM empty content: ${text.slice(0, 400)}`)
    }
    return {
      role: "assistant",
      content,
      ...(calls.length ? { tool_calls: calls } : {}),
    }
  }

  if (!res.body) throw new Error("LLM response missing body")

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
    throw new Error("LLM returned empty content and no tool_calls")
  }

  return {
    role: "assistant",
    content: content || null,
    ...(calls.length ? { tool_calls: calls } : {}),
  }
}

export async function listModels(baseURL: string, apiKey?: string) {
  const res = await fetch(`${baseURL}/models`, {
    headers: authHeaders(apiKey),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`GET ${baseURL}/models → HTTP ${res.status}: ${text.slice(0, 400)}`)
  const data = JSON.parse(text) as { data?: Array<{ id: string }> }
  return (data.data ?? []).map((m) => m.id)
}
