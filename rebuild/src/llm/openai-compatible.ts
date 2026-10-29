/**
 * Classic OpenAI-compatible chat/completions (needs API key).
 * Prefer Zen free via zen-free.ts for this course by default.
 */

export type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type ChatCompletionInput = {
  baseURL: string
  apiKey: string
  model: string
  messages: ChatMessage[]
}

export async function chatCompletion(input: ChatCompletionInput): Promise<string> {
  const url = `${input.baseURL}/chat/completions`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: input.model,
      messages: input.messages,
    }),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`LLM HTTP ${res.status}: ${text.slice(0, 800)}`)
  }

  const data = JSON.parse(text) as {
    choices?: Array<{ message?: { content?: string | null } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (typeof content !== "string" || content.length === 0) {
    throw new Error(`LLM empty content: ${text.slice(0, 400)}`)
  }
  return content
}
