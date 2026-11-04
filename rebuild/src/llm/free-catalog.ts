/**
 * Free models on OpenCode Zen and OpenCode Go.
 *
 * Catalog URLs match zen-free-agent (not the chat base):
 * - Zen: https://opencode.ai/inference/v1/models
 * - Go:  https://opencode.ai/inference/go/v1/models
 *
 * Paid and *contributor* models are dropped. Contributor routes may train on requests.
 */

export type FreeEndpoint = "zen" | "go"

export const ZEN_CHAT_URL = "https://opencode.ai/inference/openai/v1"
export const GO_CHAT_URL = "https://opencode.ai/inference/go/openai/v1"
export const ZEN_MODELS_URL = "https://opencode.ai/inference/v1/models"
export const GO_MODELS_URL = "https://opencode.ai/inference/go/v1/models"

export const FALLBACK_ZEN_MODEL = "flint-40b-free"
export const FALLBACK_GO_MODEL = "minimax-m3.1-flash-free"

type CatalogRow = {
  id?: string
  cost?: {
    input?: number
    output?: number
    text?: { input?: { price?: number }; output?: { price?: number } }
  }
}

function textPrices(row: CatalogRow) {
  const input = row.cost?.text?.input?.price ?? row.cost?.input
  const output = row.cost?.text?.output?.price ?? row.cost?.output
  return { input, output }
}

export function normalizeModelID(model: string) {
  return model.trim().replace(/^(opencode|opencode-go)\//, "")
}

/** Free only. `*contributor*` is never free for this CLI. */
export function isFreeModel(id: string, endpoint: FreeEndpoint) {
  const m = normalizeModelID(id)
  if (!m || /contributor/i.test(m)) return false
  if (/free$/i.test(m)) return true
  if (endpoint === "zen" && (m === "big-pickle" || m === "grok-code")) return true
  return false
}

function rowIsFree(row: CatalogRow, endpoint: FreeEndpoint) {
  const id = row.id || ""
  if (!id || /contributor/i.test(id)) return false
  if (isFreeModel(id, endpoint)) return true
  const { input, output } = textPrices(row)
  return input === 0 && output === 0
}

export function modelsUrl(endpoint: FreeEndpoint) {
  return endpoint === "go" ? GO_MODELS_URL : ZEN_MODELS_URL
}

export async function listFreeModels(endpoint: FreeEndpoint, apiKey?: string): Promise<string[]> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": `opencode/latest/${process.env.OPENCODE_VERSION || "2.2.0"}/cli`,
    Authorization: endpoint === "go" ? `Bearer ${apiKey || ""}` : "Bearer public",
  }
  const url = modelsUrl(endpoint)
  const res = await fetch(url, { headers })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`GET ${url} → HTTP ${res.status}: ${text.slice(0, 400)}`)
  }
  const json = JSON.parse(text) as { data?: CatalogRow[] } | CatalogRow[]
  const rows = Array.isArray(json) ? json : (json.data ?? [])
  const ids = rows
    .filter((row) => rowIsFree(row, endpoint))
    .map((row) => normalizeModelID(row.id || ""))
    .filter(Boolean)
  return [...new Set(ids)].sort((a, b) => a.localeCompare(b))
}
