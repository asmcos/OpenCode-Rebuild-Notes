/**
 * Optional overlay rules from env / file — last-win via evaluate findLast.
 */

import { join } from "node:path"
import type { PermissionRuleset } from "./types"
import { UPSTREAM_DEFAULT_PERMISSIONS } from "./evaluate"

const PREFS = join(import.meta.dir, "../../.rebuild-permissions.json")

export async function loadPermissionOverlay(opts?: {
  askExternal?: boolean
  allowExternal?: boolean
}): Promise<PermissionRuleset> {
  const out: PermissionRuleset = []

  // Match upstream schema default: external_directory allow (no ask)
  if (
    opts?.allowExternal ||
    process.env.REBUILD_ALLOW_EXTERNAL === "1" ||
    process.env.REBUILD_EXTERNAL_DIRECTORY === "allow"
  ) {
    out.push({ action: "external_directory", resource: "*", effect: "allow" })
  }

  // Explicit ask (redundant with teaching default, kept for docs / force)
  if (
    opts?.askExternal ||
    process.env.REBUILD_ASK_EXTERNAL === "1" ||
    process.env.REBUILD_EXTERNAL_DIRECTORY === "ask"
  ) {
    out.push({ action: "external_directory", resource: "*", effect: "ask" })
  }

  const file = Bun.file(PREFS)
  if (await file.exists()) {
    try {
      const data = (await file.json()) as PermissionRuleset
      if (Array.isArray(data)) out.push(...data)
    } catch {
      // ignore bad json
    }
  }

  return out
}

/** Replace agent rules with exact upstream default (for --allow-external alone we only overlay). */
export function upstreamDefaultPermissions() {
  return [...UPSTREAM_DEFAULT_PERMISSIONS]
}

export function permissionsPath() {
  return PREFS
}
