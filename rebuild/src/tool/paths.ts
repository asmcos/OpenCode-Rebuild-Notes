/**
 * Path resolve for read/write — mini FileAccess.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/file-access.ts  (resolvePath + resolve internal/external)
 * - packages/util/src/fs-util.ts      (contains)
 *
 * Upstream does NOT hard-fence cwd. Paths outside Location/worktree are
 * "external" and go through permission.assert(external_directory) then
 * read/edit. We classify the same way but always allow for now
 * (permissions stage later). /tmp is not special — just another absolute path.
 */

import { dirname, isAbsolute, normalize, relative, resolve, sep } from "node:path"
import { mkdir } from "node:fs/promises"

export type ResolvedPath = {
  /** Absolute filesystem path */
  absolute: string
  /** Model-facing resource (relative if internal, absolute if external) */
  resource: string
  /** true when outside cwd (upstream: needs external_directory permission) */
  external: boolean
  display: string
}

export type PathResult = { ok: true } & ResolvedPath | { ok: false; error: string }

/** Like FSUtil.contains — lexical, no realpath. */
export function contains(parent: string, child: string) {
  const result = relative(parent, child)
  return result === "" || (!isAbsolute(result) && result !== ".." && !result.startsWith(`..${sep}`))
}

/** Like FileAccess.resolvePath(directory, input) — ~ not expanded yet. */
export function resolvePath(directory: string, input: string) {
  return resolve(directory, input)
}

/**
 * Mini FileAccess.resolve({ path }).
 * Relative → under cwd. Absolute outside cwd → external (still allowed).
 */
export function resolveToolPath(raw: string | undefined, cwd = process.cwd()): PathResult {
  if (!raw || typeof raw !== "string") {
    return { ok: false, error: "Error: missing path" }
  }

  const root = resolve(cwd)
  const absolute = resolvePath(root, raw)
  const internal = contains(root, absolute)
  const resource = internal ? normalize(relative(root, absolute) || ".") : absolute

  return {
    ok: true,
    absolute,
    resource,
    external: !internal,
    display: resource,
  }
}

/** @deprecated name — use resolveToolPath (no longer a cwd fence) */
export function resolveInsideCwd(raw: string | undefined, cwd = process.cwd()) {
  return resolveToolPath(raw, cwd)
}

export async function ensureParentDir(target: string) {
  await mkdir(dirname(target), { recursive: true })
}
