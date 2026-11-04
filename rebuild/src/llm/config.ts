/**
 * LLM connection.
 *
 * Default: local OpenAI-compatible gateway (zen-free-agent style on :8787).
 * Optional:
 * - zen  — OpenCode Zen free (Bearer public)
 * - go   — OpenCode Go free (Bearer oc_sk_…)
 * - openai — any OpenAI-compatible endpoint with an API key
 */

import {
  FALLBACK_GO_MODEL,
  FALLBACK_ZEN_MODEL,
  GO_CHAT_URL,
  ZEN_CHAT_URL,
  isFreeModel,
  normalizeModelID,
  type FreeEndpoint,
} from "./free-catalog"
import { loadPrefs, type LlmPrefs } from "./prefs"

export type LlmProvider = "local" | "zen" | "go" | "openai"

export function resolveGoApiKey(prefs: LlmPrefs = {}) {
  return (
    process.env.OPENCODE_GO_API_KEY ||
    process.env.OPENCODE_API_KEY ||
    process.env.REBUILD_GO_API_KEY ||
    prefs.goApiKey ||
    ""
  ).trim()
}

export function goKeySource(prefs: LlmPrefs = {}) {
  if (process.env.OPENCODE_GO_API_KEY?.trim()) return "OPENCODE_GO_API_KEY"
  if (process.env.OPENCODE_API_KEY?.trim()) return "OPENCODE_API_KEY"
  if (process.env.REBUILD_GO_API_KEY?.trim()) return "REBUILD_GO_API_KEY"
  if (prefs.goApiKey?.trim()) return "prefs"
  return "missing"
}

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

  if (provider !== "local" && provider !== "zen" && provider !== "go" && provider !== "openai") {
    throw new Error(`unknown provider: ${provider} (local | zen | go | openai)`)
  }

  const version = process.env.OPENCODE_VERSION || "2.2.0"
  const explicitModel = normalizeModelID(
    overrides?.model || process.env.REBUILD_LLM_MODEL || process.env.MODEL || "",
  )
  const envBase = overrides?.baseURL || process.env.REBUILD_LLM_BASE_URL || process.env.OPENAI_BASE_URL

  if (provider === "zen" || provider === "go") {
    assertBunForZen()
    const endpoint = provider as FreeEndpoint
    const remembered = endpoint === "go" ? prefs.goModel : prefs.zenModel
    const model = explicitModel || remembered || (endpoint === "go" ? FALLBACK_GO_MODEL : FALLBACK_ZEN_MODEL)
    if (!isFreeModel(model, endpoint)) {
      throw new Error(
        `only free models on ${endpoint}, rejected: ${model || "(empty)"}\n` +
          `  bun run models ${endpoint}`,
      )
    }
    if (endpoint === "go" && !resolveGoApiKey(prefs)) {
      throw new Error(
        "Go needs an API key (not stored in git).\n" +
          "  OPENCODE_API_KEY=oc_sk_… bun run models go\n" +
          "  or: bun run models key set oc_sk_…",
      )
    }
    return {
      provider: endpoint,
      apiKey: endpoint === "go" ? resolveGoApiKey(prefs) : undefined,
      baseURL: (
        envBase ||
        (endpoint === "go" ? process.env.OPENCODE_GO_URL : process.env.OPENCODE_ZEN_URL) ||
        (endpoint === "go" ? GO_CHAT_URL : ZEN_CHAT_URL)
      ).replace(/\/$/, ""),
      model,
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
      baseURL: (envBase || "https://api.openai.com/v1").replace(/\/$/, ""),
      model: explicitModel || process.env.OPENAI_MODEL || "gpt-4o-mini",
      version,
    }
  }

  // local — OpenAI-compatible gateway (default http://127.0.0.1:8787/v1)
  return {
    provider: "local",
    apiKey: process.env.REBUILD_LLM_API_KEY || process.env.API_KEY || "sk-local",
    baseURL: (envBase || prefs.baseURL || "http://127.0.0.1:8787/v1").replace(/\/$/, ""),
    model:
      explicitModel ||
      (prefs.provider === "local" || !prefs.provider ? prefs.model : undefined) ||
      "beam-free",
    version,
  }
}
