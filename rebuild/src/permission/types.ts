/**
 * Inspired by (upstream relative paths):
 * - packages/schema/src/permission.ts
 */

export type PermissionEffect = "allow" | "deny" | "ask"

/** User reply to an ask — same three replies as upstream. */
export type PermissionReply = "once" | "always" | "reject"

export type PermissionRule = {
  action: string
  resource: string
  effect: PermissionEffect
}

export type PermissionRuleset = PermissionRule[]

export type PermissionRequest = {
  action: string
  resources: string[]
  /** Patterns saved on reply=always (upstream Request.save) */
  save?: string[]
  message?: string
}
