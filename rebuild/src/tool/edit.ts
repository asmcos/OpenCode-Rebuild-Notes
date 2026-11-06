/**
 * Mini `edit` tool — replace one exact span in an existing file.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/edit.ts
 *
 * Upstream also retries with typographic quotes folded, preserves CRLF, and
 * hints at a near miss. This lesson keeps the contract that matters: exact
 * text, one match unless replaceAll, and a clear error that leaves the file
 * untouched.
 */

import { authorizeWrite } from "../permission/file-access"
import {
  PermissionBlockedError,
  PermissionDeclinedError,
  type PermissionRuntime,
} from "../permission/assert"
import { resolveToolPath } from "./paths"

const MAX_BYTES = 256 * 1024

export async function editFileTool(
  args: { path?: string; oldString?: string; newString?: string; replaceAll?: boolean },
  cwd = process.cwd(),
  permission?: PermissionRuntime,
): Promise<string> {
  if (typeof args.oldString !== "string" || typeof args.newString !== "string") {
    return "Error: oldString and newString must be strings"
  }
  if (args.oldString === "") {
    return "Error: oldString must not be empty. Use write to create or overwrite a file."
  }
  if (args.oldString === args.newString) {
    return "Error: No changes to apply: oldString and newString are identical."
  }

  let resolved
  try {
    if (permission) {
      resolved = await authorizeWrite(permission, args.path, cwd)
    } else {
      const found = resolveToolPath(args.path, cwd)
      if (!found.ok) return found.error
      resolved = found
    }
  } catch (err) {
    if (err instanceof PermissionBlockedError || err instanceof PermissionDeclinedError) {
      return `Error: ${err.message}`
    }
    return `Error: ${err instanceof Error ? err.message : String(err)}`
  }

  const file = Bun.file(resolved.absolute)
  if (!(await file.exists())) {
    return `Error: file not found: ${resolved.resource}. Use write to create it.`
  }
  const source = await file.text()
  if (Buffer.byteLength(source, "utf8") > MAX_BYTES) {
    return `Error: file too large (max ${MAX_BYTES} bytes)`
  }

  const matches = findOccurrences(source, args.oldString)
  if (matches.length === 0) {
    return (
      `Error: Could not find oldString in ${resolved.resource}. ` +
      "It must match exactly, including whitespace and indentation."
    )
  }
  if (matches.length > 1 && args.replaceAll !== true) {
    return (
      `Error: Found ${matches.length} matches for oldString, but expected exactly one. ` +
      "Add more surrounding context to make oldString unique, or set replaceAll to true."
    )
  }

  const next =
    args.replaceAll === true
      ? source.replaceAll(args.oldString, args.newString)
      : source.replace(args.oldString, args.newString)
  try {
    await Bun.write(resolved.absolute, next)
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`
  }

  const count = args.replaceAll === true ? matches.length : 1
  const note = resolved.external ? " (external)" : ""
  return `Edited ${resolved.resource}${note} (${count} replacement${count === 1 ? "" : "s"})`
}

function findOccurrences(content: string, search: string) {
  const found: number[] = []
  let offset = 0
  while ((offset = content.indexOf(search, offset)) !== -1) {
    found.push(offset)
    offset += search.length
  }
  return found
}
