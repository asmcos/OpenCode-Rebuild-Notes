#!/usr/bin/env bun
/**
 * Mini CLI entry.
 *
 * Inspired by (upstream relative paths):
 * - packages/cli/src/index.ts
 * - packages/cli/package.json (scripts.dev / bin)
 *
 * Intentionally tiny: no Effect, no TUI, no server.
 */

const args = process.argv.slice(2)
const command = args[0]

if (!command || command === "help" || command === "--help" || command === "-h") {
  console.log(`rebuild-cli — OpenCode rebuild scratch CLI

Usage:
  bun run src/index.ts <command>

Commands:
  help     Show this help
  version  Print version
  hello    Print a greeting (optionally: hello <name>)
`)
  process.exit(0)
}

if (command === "version") {
  // Keep in sync with rebuild/package.json; later we can read the file like upstream version.ts
  console.log("0.0.1")
  process.exit(0)
}

if (command === "hello") {
  const name = args[1] ?? "opencode"
  console.log(`hello, ${name}`)
  process.exit(0)
}

console.error(`unknown command: ${command}`)
console.error(`try: bun run src/index.ts help`)
process.exit(1)
