#!/usr/bin/env bun
/**
 * Mini CLI entry — dispatches via a handlers table.
 *
 * Inspired by (upstream relative paths):
 * - packages/cli/src/index.ts
 * - packages/cli/package.json (scripts.dev / bin)
 *
 * Intentionally tiny: no Effect, no TUI, no server.
 */

import { handlers, listCommands } from "./commands/handlers"

const args = process.argv.slice(2)
let command = args[0]
let rest = args.slice(1)

if (!command || command === "--help" || command === "-h") {
  command = "help"
  rest = []
}

const load = handlers[command]
if (!load) {
  console.error(`unknown command: ${command}`)
  console.error(`known: ${listCommands().join(", ")}`)
  console.error(`try: bun run src/index.ts help`)
  process.exit(1)
}

const mod = await load()
await mod.run(rest)
