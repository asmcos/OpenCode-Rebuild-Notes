/**
 * Inspired by (upstream relative paths):
 * - packages/core/src/permission.ts  (evaluate / merge)
 *
 * Last matching rule wins (findLast).
 */

import { match } from "./wildcard"
import type { PermissionRule, PermissionRuleset } from "./types"

export function evaluate(
  action: string,
  resource: string,
  ...rulesets: PermissionRuleset[]
): PermissionRule {
  return (
    rulesets
      .flat()
      .findLast((rule) => match(action, rule.action) && match(resource, rule.resource)) ?? {
      action,
      resource: "*",
      effect: "ask",
    }
  )
}

export function merge(...rulesets: PermissionRuleset[]): PermissionRuleset {
  return rulesets.flat()
}

/**
 * Build agent permissions.
 *
 * Upstream Agent.Info.default is mostly allow-all (so /tmp would NOT ask).
 * The approval UX still exists: FileAccess always asserts external_directory
 * first; when that rule is ask, the UI/TTY prompts once|always|reject.
 *
 * For this teaching rebuild we append external_directory → ask so writing
 * outside cwd (e.g. /tmp) surfaces that prompt — same assert path as OpenCode.
 * Use --allow-external to match schema default (no ask).
 */
export const DEFAULT_PERMISSIONS: PermissionRuleset = [
  { action: "*", resource: "*", effect: "allow" },
  { action: "read", resource: "*.env", effect: "ask" },
  { action: "read", resource: "*.env.*", effect: "ask" },
  { action: "read", resource: "*.env.example", effect: "allow" },
  { action: "external_directory", resource: "*", effect: "ask" },
  // Upstream often asks on shell via config; teaching default asks so the harness prompt shows.
  { action: "shell", resource: "*", effect: "ask" },
]

/** Exact upstream Agent.Info.default (no external ask). */
export const UPSTREAM_DEFAULT_PERMISSIONS: PermissionRuleset = [
  { action: "*", resource: "*", effect: "allow" },
  { action: "read", resource: "*.env", effect: "ask" },
  { action: "read", resource: "*.env.*", effect: "ask" },
  { action: "read", resource: "*.env.example", effect: "allow" },
]

/** Explore-like: deny write/edit, allow read (+ .env ask). */
export const EXPLORE_PERMISSIONS: PermissionRuleset = [
  { action: "*", resource: "*", effect: "deny" },
  { action: "read", resource: "*", effect: "allow" },
  { action: "grep", resource: "*", effect: "allow" },
  { action: "glob", resource: "*", effect: "allow" },
  { action: "read", resource: "*.env", effect: "ask" },
  { action: "read", resource: "*.env.*", effect: "ask" },
  { action: "read", resource: "*.env.example", effect: "allow" },
  { action: "external_directory", resource: "*", effect: "allow" },
  // Upstream explore allows shell — see packages/core/src/plugin/agent.ts
  { action: "shell", resource: "*", effect: "allow" },
  { action: "subagent", resource: "*", effect: "deny" },
]

/** Plan-like: no edits / no shell. */
export const PLAN_PERMISSIONS: PermissionRuleset = [
  { action: "*", resource: "*", effect: "allow" },
  { action: "edit", resource: "*", effect: "deny" },
  { action: "shell", resource: "*", effect: "deny" },
  { action: "read", resource: "*.env", effect: "ask" },
  { action: "read", resource: "*.env.*", effect: "ask" },
  { action: "read", resource: "*.env.example", effect: "allow" },
  { action: "external_directory", resource: "*", effect: "ask" },
  { action: "subagent", resource: "*", effect: "deny" },
]
