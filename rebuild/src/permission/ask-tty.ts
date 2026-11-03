/**
 * TTY prompt for permission ask — replies once | always | reject.
 *
 * Inspired by (upstream relative paths):
 * - packages/schema/src/permission.ts  (Reply)
 * - packages/cli/src/run/noninteractive.ts  (prints permission requested: …)
 *
 * Must not run while chat's readline still owns stdin — chat closes it first.
 */

import { askLine, warn } from "../cli/tty"
import type { AskHandler } from "./assert"
import type { PermissionReply } from "./types"

const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`

export function createTtyAskHandler(unattended: "deny" | "allow" = "deny"): AskHandler {
  return async (req) => {
    if (!process.stdin.isTTY || !process.stderr.isTTY) {
      if (unattended === "allow") return "once"
      warn(
        `permission requested: ${req.action} (${req.resources.join(", ")}); ` +
          `auto-rejecting (non-TTY — set REBUILD_PERMISSION_UNATTENDED=allow to auto-allow)`,
      )
      return "reject"
    }

    // Loud box on stderr (OpenCode-style: harness asks, not the model)
    console.error("")
    console.error(yellow("╭─ permission (OpenCode-style) ─────────────────"))
    console.error(yellow(`│ action:   ${req.action}`))
    for (const r of req.resources) {
      console.error(yellow(`│ resource: ${r}`))
    }
    if (req.save?.length) {
      console.error(yellow(`│ remember: ${req.save.join(", ")}  (if you pick always)`))
    }
    console.error(yellow("│"))
    console.error(yellow("│  o  once    — allow this time"))
    console.error(yellow("│  a  always  — allow & remember for this session"))
    console.error(yellow("│  r  reject  — deny"))
    console.error(yellow("╰───────────────────────────────────────────────"))
    console.error(yellow("Waiting for your reply (type o / a / r, then Enter)…"))

    while (true) {
      let raw: string
      try {
        raw = (await askLine(yellow("permission> "))).toLowerCase()
      } catch {
        return "reject"
      }
      if (raw === "o" || raw === "once") return "once" as PermissionReply
      if (raw === "a" || raw === "always") return "always" as PermissionReply
      if (raw === "r" || raw === "reject" || raw === "n" || raw === "no") {
        return "reject" as PermissionReply
      }
      warn("type o / a / r  (upstream Reply: once | always | reject)")
    }
  }
}

/** Auto-allow (tests / non-interactive). */
export const allowAsk: AskHandler = async () => "once"

/** Auto-reject. */
export const rejectAsk: AskHandler = async () => "reject"
