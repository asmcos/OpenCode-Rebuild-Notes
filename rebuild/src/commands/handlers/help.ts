/**
 * Inspired by (upstream relative paths):
 * - packages/cli/src/commands/handlers/default.ts (shape only: one file per command)
 */

export async function run(_args: string[]) {
  console.log(`rebuild-cli — OpenCode rebuild scratch CLI

Usage:
  bun run src/index.ts <command>

Commands:
  help     Show this help
  version  Print version
  hello    Print a greeting (optionally: hello <name>)
  agent    Agent helpers: list | get <id> | resolve [id]
  chat     Chat via OpenCode Zen free (default, no personal API key)
           chat [--agent <id>] [prompt]
`)
}
