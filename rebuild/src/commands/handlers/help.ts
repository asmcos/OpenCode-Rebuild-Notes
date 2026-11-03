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
  models   List / select models from local OpenAI gateway
           models              # list (+ interactive pick)
           models use <id|n>   # save selection to .rebuild-llm.json
  chat     Chat (default provider=local → http://127.0.0.1:8787/v1)
           chat [--agent <id>] [--model <id>] [--provider local|zen|openai]
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
