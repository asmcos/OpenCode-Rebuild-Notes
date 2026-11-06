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

function menuKey(ch: string): string | null {
  const folded = ch.normalize("NFKC").toLowerCase()
  return /^[1-5q]$/.test(folded) ? folded : null
}

/**
 * Main menu key. 1–5 and q take effect immediately, so the choice is not
 * left sitting on `选择>` until Enter. Enter on an empty line still means
 * “开始对话”. A following Enter in the same chunk is consumed.
 */
export async function askMenu(prompt: string): Promise<string> {
  if (!input.isTTY) {
    throw new Error("stdin is not a TTY; cannot prompt")
  }
  input.setRawMode(true)
  input.resume()
  output.write(prompt)
  let buf = ""
  let escape = ""
  try {
    return await new Promise((resolve) => {
      const finish = (value: string, rest = "") => {
        input.off("data", onData)
        if (rest.startsWith("\r\n")) rest = rest.slice(2)
        else if (rest.startsWith("\r") || rest.startsWith("\n")) rest = rest.slice(1)
        if (rest) input.unshift(rest)
        output.write("\n")
        resolve(value.normalize("NFKC").trim().toLowerCase())
      }
      const onData = (chunk: Buffer) => {
        const text = chunk.toString("utf8")
        for (let i = 0; i < text.length; i++) {
          const ch = text[i]
          if (escape) {
            escape += ch
            if (/^[0-9;]$/.test(ch) || ch === "[") continue
            escape = ""
            continue
          }
          if (ch === "\u001b") {
            escape = ch
            continue
          }
          if (ch === "\u0003") {
            output.write("^C\n")
            process.exit(130)
          }
          if (ch === "\r" || ch === "\n") {
            finish(buf, text.slice(i + 1))
            return
          }
          if (ch === "\u007f" || ch === "\b") {
            if (buf.length > 0) {
              buf = buf.slice(0, -1)
              output.write("\b \b")
            }
            continue
          }
          if (ch < " ") continue
          const key = buf.length === 0 ? menuKey(ch) : null
          if (key) {
            output.write(ch)
            finish(key, text.slice(i + 1))
            return
          }
          buf += ch
          output.write(ch)
        }
      }
      input.on("data", onData)
    })
  } finally {
    input.setRawMode(false)
    input.pause()
  }
}
