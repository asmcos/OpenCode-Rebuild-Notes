/**
 * Inspired by (upstream relative paths):
 * - packages/cli/src/version.ts
 * - packages/cli/src/commands/handlers/* (one handler module per command)
 */

export async function run(_args: string[]) {
  const pkg = await Bun.file(new URL("../../../package.json", import.meta.url)).json()
  console.log(pkg.version)
}
