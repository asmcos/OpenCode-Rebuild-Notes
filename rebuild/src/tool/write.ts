/**
 * Mini `write` tool — create/overwrite text files.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/write.ts
 * - packages/core/src/file-write.ts
 */

import { ensureParentDir, resolveToolPath } from "./paths"
import { authorizeWrite } from "../permission/file-access"
import {
  PermissionBlockedError,
  PermissionDeclinedError,
  type PermissionRuntime,
} from "../permission/assert"

const MAX_BYTES = 256 * 1024

export async function writeFileTool(
  args: { path?: string; content?: string },
  cwd = process.cwd(),
  permission?: PermissionRuntime,
): Promise<string> {
  if (typeof args.content !== "string") {
    return "Error: missing content (string required)"
  }
  if (Buffer.byteLength(args.content, "utf8") > MAX_BYTES) {
    return `Error: content too large (max ${MAX_BYTES} bytes)`
  }

  let resolved
  try {
    if (permission) {
      resolved = await authorizeWrite(permission, args.path, cwd)
    } else {
      const r = resolveToolPath(args.path, cwd)
      if (!r.ok) return r.error
      resolved = r
    }
  } catch (err) {
    if (err instanceof PermissionBlockedError || err instanceof PermissionDeclinedError) {
      return `Error: ${err.message}`
    }
    return `Error: ${err instanceof Error ? err.message : String(err)}`
  }

  const existed = await Bun.file(resolved.absolute).exists()
  try {
    await ensureParentDir(resolved.absolute)
    await Bun.write(resolved.absolute, args.content)
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`
  }

  const note = resolved.external ? " (external)" : ""
  return `${existed ? "Wrote" : "Created"} file successfully: ${resolved.resource}${note}`
}
