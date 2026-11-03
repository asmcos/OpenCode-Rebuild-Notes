/**
 * Local LLM prefs (model / baseURL) — gitignored file under rebuild/.
 */

import { join } from "node:path"

export type LlmPrefs = {
  provider?: string
  baseURL?: string
  model?: string
}

const PREFS_PATH = join(import.meta.dir, "../../.rebuild-llm.json")

export async function loadPrefs(): Promise<LlmPrefs> {
  const file = Bun.file(PREFS_PATH)
  if (!(await file.exists())) return {}
  try {
    return (await file.json()) as LlmPrefs
  } catch {
    return {}
  }
}

export async function savePrefs(patch: LlmPrefs) {
  const cur = await loadPrefs()
  const next = { ...cur, ...patch }
  await Bun.write(PREFS_PATH, JSON.stringify(next, null, 2) + "\n")
  return next
}

export function prefsPath() {
  return PREFS_PATH
}
