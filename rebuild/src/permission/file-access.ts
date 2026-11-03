/**
 * Mini FileAccess authorize for read/write.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/file-access.ts   (authorizeExternal, authorizeRead)
 * - packages/core/src/file-write.ts    (target → authorize edit)
 */

import { dirname, join } from "node:path"
import { resolveToolPath, type ResolvedPath } from "../tool/paths"
import { assertPermission, type PermissionRuntime } from "./assert"

function slash(value: string) {
  return value.replaceAll("\\", "/")
}

/** Parent dir pattern for external_directory, e.g. /tmp/* */
export function externalDirectoryResource(absoluteFile: string) {
  return slash(join(dirname(absoluteFile), "*"))
}

export async function authorizeExternal(
  runtime: PermissionRuntime,
  target: ResolvedPath,
): Promise<void> {
  if (!target.external) return
  const resource = externalDirectoryResource(target.absolute)
  await assertPermission(runtime, {
    action: "external_directory",
    resources: [resource],
    save: [resource],
  })
}

export async function authorizeRead(
  runtime: PermissionRuntime,
  raw: string | undefined,
  cwd: string,
): Promise<ResolvedPath> {
  const target = resolveToolPath(raw, cwd)
  if (!target.ok) throw new Error(target.error)
  await authorizeExternal(runtime, target)
  await assertPermission(runtime, {
    action: "read",
    resources: [target.resource],
    save: ["*"],
  })
  return target
}

export async function authorizeWrite(
  runtime: PermissionRuntime,
  raw: string | undefined,
  cwd: string,
): Promise<ResolvedPath> {
  const target = resolveToolPath(raw, cwd)
  if (!target.ok) throw new Error(target.error)
  await authorizeExternal(runtime, target)
  await assertPermission(runtime, {
    action: "edit",
    resources: [target.resource],
    save: ["*"],
  })
  return target
}
