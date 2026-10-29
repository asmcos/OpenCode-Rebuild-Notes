/**
 * Inspired by (upstream relative paths):
 * - packages/cli/src/commands/handlers/* (one handler module per command)
 */

export async function run(args: string[]) {
  const name = args[0] ?? "opencode"
  console.log(`hello, ${name}`)
}
