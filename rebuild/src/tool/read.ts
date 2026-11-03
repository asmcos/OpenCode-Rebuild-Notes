/**
 * Mini `read` tool — text files (cwd-relative or absolute/external).
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/read.ts
 * - packages/core/src/file-access.ts  (authorizeRead)
 */

import { authorizeRead } from "../permission/file-access"
import {
  PermissionBlockedError,
  PermissionDeclinedError,
  type PermissionRuntime,
} from "../permission/assert"
import { resolveToolPath } from "./paths"

const MAX_BYTES = 64 * 1024

export async function readFileTool(
  args: { path?: string; filePath?: string },
  cwd = process.cwd(),
  permission?: PermissionRuntime,
): Promise<string> {
  const raw = args.path ?? args.filePath

  let resolved
  try {
    if (permission) {
      resolved = await authorizeRead(permission, raw, cwd)
    } else {
      const r = resolveToolPath(raw, cwd)
      if (!r.ok) return r.error
      resolved = r
    }
  } catch (err) {
    if (err instanceof PermissionBlockedError || err instanceof PermissionDeclinedError) {
      return `Error: ${err.message}`
    }
    return `Error: ${err instanceof Error ? err.message : String(err)}`
  }

  const file = Bun.file(resolved.absolute)
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
