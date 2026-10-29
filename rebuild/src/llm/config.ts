/**
 * LLM connection.
 *
 * Default: OpenCode Zen free (Bearer public) — same idea as:
 * - packages/sdk/js/example/chat-zen-free.mjs (gate fields; no USE_PROXY in core)
 *
 * Optional: classic OpenAI-compatible + API key when REBUILD_LLM_PROVIDER=openai
 */

export type LlmProvider = "zen" | "openai"

export type LlmConfig = {
  provider: LlmProvider
  baseURL: string
  model: string
  /** Only for provider=openai */
  apiKey?: string
  version: string
}

export function assertBunForZen() {
  if (typeof Bun === "undefined") {
    throw new Error("Zen free gate needs Bun ≥ 1.4 (Node often gets HTTP 429)")
  }
  const [major, minor] = Bun.version.split(".").map(Number)
  if (major < 1 || (major === 1 && minor < 4)) {
    throw new Error(`Bun ${Bun.version} is too old for Zen free; need 1.4.x`)
  }
}

export function loadLlmConfig(): LlmConfig {
  const provider = (process.env.REBUILD_LLM_PROVIDER || "zen").toLowerCase() as LlmProvider
  const version = process.env.OPENCODE_VERSION || "2.2.0"

  if (provider === "openai") {
    const apiKey = process.env.REBUILD_LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? ""
    if (!apiKey) {
      throw new Error(
        "REBUILD_LLM_PROVIDER=openai requires REBUILD_LLM_API_KEY (or OPENAI_API_KEY)",
      )
    }
    return {
      provider: "openai",
      apiKey,
      baseURL: (
        process.env.REBUILD_LLM_BASE_URL ??
        process.env.OPENAI_BASE_URL ??
        "https://api.openai.com/v1"
      ).replace(/\/$/, ""),
      model:
        process.env.REBUILD_LLM_MODEL ?? process.env.OPENAI_MODEL ?? process.env.MODEL ?? "gpt-4o-mini",
      version,
    }
  }

  assertBunForZen()
  return {
    provider: "zen",
    baseURL: (
      process.env.REBUILD_LLM_BASE_URL ??
      process.env.OPENCODE_ZEN_URL ??
      "https://opencode.ai/inference/openai/v1"
    ).replace(/\/$/, ""),
    model: process.env.REBUILD_LLM_MODEL ?? process.env.MODEL ?? "flint-40b-free",
    version,
  }
}
