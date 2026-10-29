/**
 * Mini `read` tool — text files under cwd only.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/read.ts
 * - packages/core/src/tool/read-filesystem.ts
 *
 * No permissions / paging / images yet.
 */

import { isAbsolute, normalize, relative, resolve } from "node:path"

const MAX_BYTES = 64 * 1024

export async function readFileTool(
  args: { path?: string; filePath?: string },
  cwd = process.cwd(),
): Promise<string> {
  const raw = args.path ?? args.filePath
  if (!raw || typeof raw !== "string") {
    return "Error: missing path"
  }

  const root = resolve(cwd)
  const target = resolve(root, raw)
  const rel = relative(root, target)
  if (rel.startsWith("..") || isAbsolute(rel)) {
    return `Error: path escapes working directory (${raw})`
  }

  const file = Bun.file(target)
  if (!(await file.exists())) {
    return `Error: file not found: ${raw}`
  }

  const size = file.size
  if (size > MAX_BYTES) {
    const text = await file.text()
    return (
      text.slice(0, MAX_BYTES) +
      `\n\n… truncated (${size} bytes total, showing first ${MAX_BYTES})`
    )
  }

  try {
    return await file.text()
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`
  }
}

/** Normalize for display */
export function displayPath(p: string) {
  return normalize(p)
}
