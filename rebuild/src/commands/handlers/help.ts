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
  models   List / select models. zen and go show free models only.
           models                 # current endpoint
           models zen | models go # switch endpoint, list free models
           models use <id|n>      # save model (also: models use go <id>)
           models local           # back to :8787 gateway
           models key set <oc_sk> # Go key, gitignored prefs
  chat     Chat + tools read/write/shell (default provider=local :8787)
           chat [--agent <id>] [--model <id>] [--provider local|zen|go|openai]
                [--no-stream] [--ask-external|--allow-external] [prompt]
           Default: external paths need permission (ask)
           --allow-external  allow external paths without asking
           --ask-external    force ask on external paths

Gateway curl examples (zen-free-agent --api-only):
  curl -s http://127.0.0.1:8787/v1/models
  curl -s http://127.0.0.1:8787/v1/chat/completions \\
    -H 'Content-Type: application/json' \\
    -d '{"model":"beam-free","messages":[{"role":"user","content":"只回复：OK"}]}'
  curl -N http://127.0.0.1:8787/v1/chat/completions \\
    -H 'Content-Type: application/json' \\
    -d '{"model":"beam-free","stream":true,"messages":[{"role":"user","content":"你好"}]}'
`)
}
