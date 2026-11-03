/**
 * Inspired by (upstream relative paths):
 * - packages/core/src/shell/result.ts  (notice / output shaping)
 */

export type ShellCapture = {
  output: string
  truncated: boolean
  exit?: number
  signal?: string
  timeout?: boolean
}

export function notice(output: Pick<ShellCapture, "exit" | "signal" | "timeout">) {
  if (output.timeout) return "Timed out before completion"
  if (output.signal !== undefined) return `Killed by ${output.signal}`
  if (output.exit !== undefined && output.exit !== 0) return `Exited with code ${output.exit}`
}

/** Join stdout body + optional notice — same idea as ShellTool.resultMessages. */
export function formatToolText(capture: ShellCapture, timeoutMs?: number) {
  let body = capture.output
  if (capture.timeout && timeoutMs !== undefined) {
    body = `${body}\n\nCommand exceeded timeout of ${timeoutMs} ms. Retry with a larger timeout if the command is expected to take longer.`
  }
  const note = notice(capture)
  return [body, note].filter((s) => s !== undefined && s !== "").join("\n\n")
}
