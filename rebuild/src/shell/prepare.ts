/**
 * Mini ShellTool.prepare — resolve workdir, external_directory, shell permission.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/shell.ts  (prepare)
 * - packages/core/src/shell/parse.ts        (commands → resource/save; we keep a tiny stand-in)
 */

import { statSync } from "node:fs"
import { resolveToolPath } from "../tool/paths"
import { authorizeExternal } from "../permission/file-access"
import { assertPermission, type PermissionRuntime } from "../permission/assert"

/**
 * Upstream ShellParse builds rich resources (e.g. `git status`, save `git *`).
 * Mini: full command string as resource; save = first token + " *" for always.
 */
export function shellCommandPermission(command: string): { resource: string; save: string } {
  const resource = command.trim().replace(/\s+/g, " ")
  const head = resource.split(" ")[0] || resource
  return { resource, save: `${head} *` }
}

export async function prepareShell(input: {
  command: string
  workdir?: string
  cwd: string
  permission?: PermissionRuntime
}): Promise<{ absoluteCwd: string }> {
  const command = input.command?.trim()
  if (!command) throw new Error("Error: missing command")

  const workdirRaw = input.workdir?.trim() || input.cwd
  const target = resolveToolPath(workdirRaw, input.cwd)
  if (!target.ok) throw new Error(target.error)

  // Upstream: Environment.typeFollowing — exists + is directory
  let st
  try {
    st = statSync(target.absolute)
  } catch {
    throw new Error(`Working directory does not exist: ${target.absolute}`)
  }
  if (!st.isDirectory()) {
    throw new Error(`Working directory is not a directory: ${target.absolute}`)
  }

  if (input.permission) {
    await authorizeExternal(input.permission, target)
    const { resource, save } = shellCommandPermission(command)
    await assertPermission(input.permission, {
      action: "shell",
      resources: [resource],
      save: [save],
    })
  }

  return { absoluteCwd: target.absolute }
}
