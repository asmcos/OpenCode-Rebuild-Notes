/**
 * LLM connection.
 *
 * Default: local OpenAI-compatible gateway (zen-free-agent style on :8787).
 * Optional: zen (Bearer public) or openai (needs API key).
 */

import { loadPrefs } from "./prefs"

export type LlmProvider = "local" | "zen" | "openai"

export type LlmConfig = {
  provider: LlmProvider
  baseURL: string
  model: string
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

export async function loadLlmConfig(overrides?: {
  provider?: string
  model?: string
  baseURL?: string
}): Promise<LlmConfig> {
  const prefs = await loadPrefs()
  const provider = (
    overrides?.provider ||
    process.env.REBUILD_LLM_PROVIDER ||
    prefs.provider ||
    "local"
  ).toLowerCase() as LlmProvider

  const version = process.env.OPENCODE_VERSION || "2.2.0"
  const modelOverride =
    overrides?.model || process.env.REBUILD_LLM_MODEL || process.env.MODEL || prefs.model
  const baseOverride =
    overrides?.baseURL ||
    process.env.REBUILD_LLM_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    prefs.baseURL

  if (provider === "zen") {
    assertBunForZen()
    return {
      provider: "zen",
      baseURL: (
        baseOverride ||
        process.env.OPENCODE_ZEN_URL ||
        "https://opencode.ai/inference/openai/v1"
      ).replace(/\/$/, ""),
      model: modelOverride || "flint-40b-free",
      version,
    }
  }

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
      baseURL: (baseOverride || "https://api.openai.com/v1").replace(/\/$/, ""),
      model: modelOverride || process.env.OPENAI_MODEL || "gpt-4o-mini",
      version,
    }
  }

  // local — OpenAI-compatible gateway (default http://127.0.0.1:8787/v1)
  return {
    provider: "local",
    apiKey: process.env.REBUILD_LLM_API_KEY || process.env.API_KEY || "sk-local",
    baseURL: (baseOverride || "http://127.0.0.1:8787/v1").replace(/\/$/, ""),
    model: modelOverride || "beam-free",
    version,
  }
}
