/**
 * Chat / tool messages (OpenAI-compatible shapes).
 */

export type ToolCall = {
  id: string
  type: "function"
  function: { name: string; arguments: string }
}

export type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string }
