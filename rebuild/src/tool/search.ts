/**
 * Mini grep + glob.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/grep.ts
 * - packages/core/src/tool/plugin/glob.ts
 * - packages/core/src/filesystem.ts  (DEFAULT_SEARCH_LIMIT = 100)
 *
 * Walker instead of ripgrep. Skips node_modules / .git / dist and secret .env files.
 */

import { readdir, stat } from "node:fs/promises"
import { basename, join, relative, resolve, sep } from "node:path"
import { authorizeExternal } from "../permission/file-access"
import {
  assertPermission,
  PermissionBlockedError,
  PermissionDeclinedError,
  type PermissionRuntime,
} from "../permission/assert"
import { resolveToolPath, type ResolvedPath } from "./paths"

export const DEFAULT_SEARCH_LIMIT = 100
const MAX_FILE_BYTES = 512 * 1024
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".vitepress"])

type SearchArgs = {
  pattern?: string
  path?: string
  include?: string
  literal?: boolean
  caseSensitive?: boolean
  hidden?: boolean
  limit?: number
}

function slash(value: string) {
  return value.replaceAll("\\", "/")
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function isSecretEnv(name: string) {
  if (name === ".env") return true
  return name.startsWith(".env.") && name !== ".env.example"
}

function displayPath(absolute: string, cwd: string) {
  const rel = relative(cwd, absolute)
  if (rel === "") return "."
  if (rel.startsWith(`..${sep}`) || rel === ".." || rel.startsWith("/")) return absolute
  return slash(rel)
}

async function authorizeRoot(
  action: "grep" | "glob",
  pattern: string,
  rawPath: string | undefined,
  cwd: string,
  permission?: PermissionRuntime,
): Promise<ResolvedPath | { error: string }> {
  const raw = !rawPath || rawPath === "undefined" || rawPath === "null" ? "." : rawPath
  const target = resolveToolPath(raw, cwd)
  if (!target.ok) return { error: target.error }
  if (!permission) return target
  try {
    await authorizeExternal(permission, target)
    await assertPermission(permission, {
      action,
      resources: [pattern],
      save: ["*"],
    })
  } catch (err) {
    if (err instanceof PermissionBlockedError || err instanceof PermissionDeclinedError) {
      return { error: `Error: ${err.message}` }
    }
    return { error: `Error: ${err instanceof Error ? err.message : String(err)}` }
  }
  return target
}

async function walk(
  dir: string,
  root: string,
  hidden: boolean,
  visit: (absolute: string, rel: string) => Promise<boolean>,
): Promise<boolean> {
  let names: string[]
  try {
    names = await readdir(dir)
  } catch {
    return false
  }
  names.sort()
  for (const name of names) {
    if (!hidden && name.startsWith(".")) continue
    if (isSecretEnv(name)) continue
    const absolute = join(dir, name)
    let info
    try {
      info = await stat(absolute)
    } catch {
      continue
    }
    if (info.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue
      const stop = await walk(absolute, root, hidden, visit)
      if (stop) return true
      continue
    }
    if (!info.isFile() || info.size > MAX_FILE_BYTES) continue
    const rel = slash(relative(root, absolute))
    if (await visit(absolute, rel)) return true
  }
  return false
}

function formatGrep(matches: { path: string; line: number; text: string }[], truncated: boolean) {
  const lines = matches.length === 0 ? ["No matches found"] : [`Found ${matches.length} matches`]
  let current = ""
  for (const match of matches) {
    if (current !== match.path) {
      if (current) lines.push("")
      current = match.path
      lines.push(`${match.path}:`)
    }
    const text = match.text.length > 200 ? `${match.text.slice(0, 200)}…` : match.text
    lines.push(`  Line ${match.line}: ${text}`)
  }
  if (truncated) {
    lines.push(
      "",
      `(Results are truncated: showing first ${matches.length} results. Consider using a more specific path or pattern.)`,
    )
  }
  return lines.join("\n")
}

export async function grepTool(args: SearchArgs, cwd = process.cwd(), permission?: PermissionRuntime) {
  const pattern = args.pattern?.trim()
  if (!pattern) return "Error: pattern must not be empty"
  const limit = Math.max(1, Math.min(args.limit ?? DEFAULT_SEARCH_LIMIT, 500))
  const root = await authorizeRoot("grep", pattern, args.path, cwd, permission)
  if ("error" in root) return root.error

  let regex: RegExp
  try {
    const source = args.literal ? escapeRegExp(pattern) : pattern
    regex = new RegExp(source, args.caseSensitive === false ? "i" : "")
  } catch (err) {
    return `Error: invalid pattern: ${err instanceof Error ? err.message : String(err)}`
  }

  const include = args.include?.trim()
  const includeGlob = include ? new Bun.Glob(include) : undefined
  let info
  try {
    info = await stat(root.absolute)
  } catch {
    return `Error: path not found: ${args.path ?? "."}`
  }

  const matches: { path: string; line: number; text: string }[] = []
  const scanFile = async (absolute: string, relFromRoot: string) => {
    const shown = displayPath(absolute, resolve(cwd))
    const name = basename(absolute)
    if (
      includeGlob &&
      !includeGlob.match(name) &&
      !includeGlob.match(relFromRoot) &&
      !includeGlob.match(shown)
    ) {
      return false
    }
    let text: string
    try {
      text = await Bun.file(absolute).text()
    } catch {
      return false
    }
    if (text.includes("\0")) return false
    const rows = text.split(/\r?\n/)
    for (let i = 0; i < rows.length; i++) {
      if (!regex.test(rows[i])) continue
      matches.push({ path: shown, line: i + 1, text: rows[i] })
      if (matches.length > limit) return true
    }
    return false
  }

  let truncated = false
  if (info.isFile()) {
    truncated = await scanFile(root.absolute, basename(root.absolute))
  } else if (info.isDirectory()) {
    truncated = await walk(root.absolute, root.absolute, args.hidden === true, async (absolute, rel) =>
      scanFile(absolute, rel),
    )
  } else {
    return `Error: path is not a file or directory: ${args.path ?? "."}`
  }

  const shown = truncated ? matches.slice(0, limit) : matches
  return formatGrep(shown, truncated)
}

export async function globTool(args: SearchArgs, cwd = process.cwd(), permission?: PermissionRuntime) {
  const pattern = args.pattern?.trim()
  if (!pattern) return "Error: pattern must not be empty"
  const limit = Math.max(1, Math.min(args.limit ?? DEFAULT_SEARCH_LIMIT, 500))
  const root = await authorizeRoot("glob", pattern, args.path, cwd, permission)
  if ("error" in root) return root.error

  let info
  try {
    info = await stat(root.absolute)
  } catch {
    return `Error: path not found: ${args.path ?? "."}`
  }
  if (!info.isDirectory()) return `Error: search path is not a directory: ${args.path ?? "."}`

  const matcher = new Bun.Glob(pattern)
  const files: string[] = []
  const truncated = await walk(root.absolute, root.absolute, args.hidden === true, async (absolute, rel) => {
    if (!matcher.match(rel)) return false
    files.push(displayPath(absolute, resolve(cwd)))
    return files.length > limit
  })
  const shown = truncated ? files.slice(0, limit) : files
  if (shown.length === 0) return "No files found"
  const lines = [...shown]
  if (truncated) {
    lines.push(
      "",
      `(Results are truncated: showing first ${shown.length} results. Consider using a more specific path or pattern.)`,
    )
  }
  return lines.join("\n")
}
