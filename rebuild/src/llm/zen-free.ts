/**
 * OpenCode Zen free models — no personal API key.
 *
 * Same client-gate tricks as packages/sdk/js/example/chat-zen-free.mjs
 * (Bearer public, stream, read tool, ses_, <env>).
 *
 * Missing any of those → often HTTP 429.
 */

import { newSessionID } from "./zen-id"
import type { ChatMessage } from "./openai-compatible"

export type ZenChatInput = {
  baseURL: string
  model: string
  version: string
  messages: ChatMessage[]
  cwd?: string
  /** Stream tokens to stdout while collecting */
  onDelta?: (chunk: string) => void
}

const READ_TOOL = {
  type: "function",
  function: {
    name: "read",
    description: "Read a file",
    parameters: {
      type: "object",
      properties: { filePath: { type: "string" } },
      additionalProperties: false,
    },
  },
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

/** Ensure system message contains required <env> block for Zen free gate. */
export function withZenEnv(messages: ChatMessage[], cwd = process.cwd()): ChatMessage[] {
  const block = envBlock(cwd)
  const out = messages.map((m) => ({ ...m }))
  const sys = out.find((m) => m.role === "system")
  if (sys) {
    if (!sys.content.includes("<env>")) {
      sys.content = `${sys.content}\n\n${block}`
    }
  } else {
    out.unshift({
      role: "system",
      content: `You are an AI agent running in a coding harness.\n\n${block}`,
    })
  }
  return out
}

export async function zenChat(input: ZenChatInput): Promise<{ sessionID: string; content: string }> {
  const sessionID = newSessionID()
  const messages = withZenEnv(input.messages, input.cwd)
  const res = await fetch(`${input.baseURL}/chat/completions`, {
    method: "POST",
    headers: sessionHeaders(sessionID, input.version),
    body: JSON.stringify({
      model: input.model,
      stream: true,
      max_completion_tokens: 2048,
      messages,
      tools: [READ_TOOL],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Zen HTTP ${res.status}: ${text.slice(0, 800)}`)
  }
  if (!res.body) throw new Error("Zen response missing body")

  let content = ""
  let buffer = ""
  for await (const chunk of res.body as AsyncIterable<Uint8Array>) {
    buffer += Buffer.from(chunk).toString()
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      if (!line.startsWith("data:")) continue
      const data = line.slice(5).trim()
      if (!data || data === "[DONE]") continue
      let json: { choices?: Array<{ delta?: { content?: string } }> }
      try {
        json = JSON.parse(data)
      } catch {
        continue
      }
      const delta = json.choices?.[0]?.delta?.content
      if (!delta) continue
      content += delta
      input.onDelta?.(delta)
    }
  }

  if (!content) {
    throw new Error("Zen returned empty content (check free-gate requirements)")
  }
  return { sessionID, content }
}
