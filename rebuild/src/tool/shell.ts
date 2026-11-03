/**
 * Mini `shell` tool — foreground command only (no background / Job yet).
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/shell.ts  (name, Input, DEFAULT_TIMEOUT_MS, prepare → run)
 * - packages/core/src/shell.ts              (spawn + timeout kill concept)
 * - packages/core/src/shell/result.ts       (notice)
 */

import { prepareShell } from "../shell/prepare"
import { formatToolText, type ShellCapture } from "../shell/result"
import {
  PermissionBlockedError,
  PermissionDeclinedError,
  type PermissionRuntime,
} from "../permission/assert"

/** Upstream ShellTool.DEFAULT_TIMEOUT_MS */
export const DEFAULT_TIMEOUT_MS = 2 * 60 * 1_000
const MAX_BYTES = 64 * 1024

const OS =
  process.platform === "darwin"
    ? "macOS"
    : process.platform === "win32"
      ? "Windows"
      : process.platform === "linux"
        ? "Linux"
        : process.platform

export function shellToolDescription() {
  return [
    "Execute a shell command and return its output.",
    `Commands run on ${OS} using bash.`,
    "Quote file paths containing spaces or special characters.",
    "Prefer dedicated tools over shell commands when possible.",
    "When output is large, a truncated preview is returned.",
    `Commands accept an optional timeout (ms). Defaults to ${DEFAULT_TIMEOUT_MS}.`,
  ].join(" ")
}

export async function shellTool(
  args: { command?: string; workdir?: string; timeout?: number },
  cwd = process.cwd(),
  permission?: PermissionRuntime,
): Promise<string> {
  const command = typeof args.command === "string" ? args.command : ""
  let absoluteCwd: string
  try {
    ;({ absoluteCwd } = await prepareShell({
      command,
      workdir: typeof args.workdir === "string" ? args.workdir : undefined,
      cwd,
      permission,
    }))
  } catch (err) {
    if (err instanceof PermissionBlockedError || err instanceof PermissionDeclinedError) {
      return `Error: ${err.message}`
    }
    return `Error: ${err instanceof Error ? err.message : String(err)}`
  }

  const timeoutMs =
    typeof args.timeout === "number" && Number.isFinite(args.timeout) && args.timeout >= 0
      ? args.timeout
      : DEFAULT_TIMEOUT_MS

  try {
    const capture = await runForeground(command.trim(), absoluteCwd, timeoutMs)
    return formatToolText(capture, timeoutMs)
  } catch (err) {
    return `Unable to execute command: ${command.trim()}\n${err instanceof Error ? err.message : String(err)}`
  }
}

async function runForeground(
  command: string,
  absoluteCwd: string,
  timeoutMs: number,
): Promise<ShellCapture> {
  // Upstream sets AGENT / OPENCODE markers on the child env
  const proc = Bun.spawn(["bash", "-lc", command], {
    cwd: absoluteCwd,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      AGENT: "1",
      OPENCODE: "1",
      AI_AGENT: process.env.AI_AGENT || "rebuild",
    },
  })

  let timedOut = false
  let timer: ReturnType<typeof setTimeout> | undefined
  if (timeoutMs > 0) {
    timer = setTimeout(() => {
      timedOut = true
      try {
        proc.kill()
      } catch {
        /* ignore */
      }
    }, timeoutMs)
  }

  try {
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])
    let output = [stdout, stderr].filter(Boolean).join(stdout && stderr ? "\n" : "")
    let truncated = false
    if (Buffer.byteLength(output, "utf8") > MAX_BYTES) {
      output = output.slice(0, MAX_BYTES) + "\n… truncated"
      truncated = true
    }
    return {
      output,
      truncated,
      ...(timedOut ? { timeout: true } : { exit: exitCode }),
    }
  } finally {
    if (timer) clearTimeout(timer)
  }
}
