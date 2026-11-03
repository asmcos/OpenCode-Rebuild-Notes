/**
 * Mini Permission.assert — allow / ask / deny.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/permission.ts  (assert, reply once|always|reject, saved rules)
 */

import { evaluate } from "./evaluate"
import type {
  PermissionEffect,
  PermissionReply,
  PermissionRequest,
  PermissionRule,
  PermissionRuleset,
} from "./types"

export class PermissionBlockedError extends Error {
  readonly action: string
  readonly resources: string[]
  constructor(action: string, resources: string[], reason?: string) {
    super(reason ?? `Permission denied: ${action}`)
    this.name = "PermissionBlockedError"
    this.action = action
    this.resources = resources
  }
}

export class PermissionDeclinedError extends Error {
  constructor(message = "Permission declined by user") {
    super(message)
    this.name = "PermissionDeclinedError"
  }
}

export type AskHandler = (req: PermissionRequest) => Promise<PermissionReply>

export type PermissionRuntime = {
  /** Agent + optional session/file overlays (last wins via findLast) */
  rules: PermissionRuleset
  /** Rules added by reply=always this session */
  saved: PermissionRule[]
  ask: AskHandler
  /**
   * When ask handler cannot prompt (see createTtyAskHandler): used only if
   * the handler defers — prefer handling inside ask. Kept for chat wiring.
   */
  unattended?: "deny" | "allow"
}

function denied(action: string, resources: string[], rules: PermissionRuleset) {
  return resources.some((resource) => evaluate(action, resource, rules).effect === "deny")
}

function settleEffect(
  action: string,
  resources: string[],
  rules: PermissionRuleset,
): PermissionEffect {
  if (denied(action, resources, rules)) return "deny"
  const effects = resources.map((resource) => evaluate(action, resource, rules).effect)
  return effects.includes("ask") ? "ask" : "allow"
}

/**
 * Like Permission.assert: deny → throw; allow → return; ask → prompt then once/always/reject.
 */
export async function assertPermission(
  runtime: PermissionRuntime,
  input: PermissionRequest,
): Promise<void> {
  const all = [...runtime.rules, ...runtime.saved]
  const effect = settleEffect(input.action, [...input.resources], all)

  if (effect === "deny") {
    throw new PermissionBlockedError(input.action, [...input.resources], input.message)
  }
  if (effect === "allow") return

  const reply = await runtime.ask(input)
  if (reply === "reject") {
    throw new PermissionDeclinedError(
      input.message ??
        `Permission declined: ${input.action} on ${input.resources.join(", ")}. ` +
          `Do not retry the same path; tell the user it was rejected or use a path under the working directory.`,
    )
  }
  if (reply === "always") {
    const patterns = input.save?.length ? input.save : input.resources
    for (const resource of patterns) {
      runtime.saved.push({
        action: input.action,
        resource,
        effect: "allow",
      })
    }
  }
}
