/**
 * Command name → lazy loader table.
 *
 * Inspired by (upstream relative paths):
 * - packages/cli/src/index.ts  (Runtime.handlers({ ...: () => import(...) }))
 *
 * Upstream uses Effect Runtime.handlers; we keep a plain object with the same idea:
 * do not import every command up front — load the module when the user asks for it.
 */

export type HandlerModule = {
  run: (args: string[]) => void | Promise<void>
}

export const handlers: Record<string, () => Promise<HandlerModule>> = {
  help: () => import("./handlers/help"),
  version: () => import("./handlers/version"),
  hello: () => import("./handlers/hello"),
  agent: () => import("./handlers/agent"),
  chat: () => import("./handlers/chat"),
}

export function listCommands() {
  return Object.keys(handlers).sort()
}
