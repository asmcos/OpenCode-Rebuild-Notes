/**
 * Single-owner stdin prompts for the mini CLI.
 *
 * OpenCode's TUI/Bus owns permission replies; we cannot stack two
 * readline.Interface on the same stdin (chat you> + permission>) or the
 * session looks "frozen". Always ask through this helper while the REPL
 * readline is closed/paused.
 */

import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`

export function status(line: string) {
  // stderr so it stays visible even while assistant streams on stdout
  console.error(cyan(`⟲ ${line}`))
}

export function warn(line: string) {
  console.error(yellow(line))
}

export function note(line: string) {
  console.error(dim(line))
}

/** One-shot line from stdin (TTY). Caller must not hold another readline open. */
export async function askLine(prompt: string): Promise<string> {
  if (!process.stdin.isTTY) {
    throw new Error("stdin is not a TTY; cannot prompt")
  }
  const rl = readline.createInterface({ input, output })
  try {
    return (await rl.question(prompt)).trim()
  } finally {
    rl.close()
  }
}
