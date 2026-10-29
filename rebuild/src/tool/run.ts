/**
 * Dispatch tool_calls by name.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/runtime.ts  (concept: run tool by name)
 */

import { readFileTool } from "./read"

export async function runTool(
  name: string,
  argsJson: string,
  cwd = process.cwd(),
): Promise<string> {
  let args: Record<string, unknown> = {}
  try {
    args = JSON.parse(argsJson || "{}") as Record<string, unknown>
  } catch {
    return `Error: invalid JSON arguments: ${argsJson}`
  }

  if (name === "read") {
    return readFileTool(
      {
        path: typeof args.path === "string" ? args.path : undefined,
        filePath: typeof args.filePath === "string" ? args.filePath : undefined,
      },
      cwd,
    )
  }

  return `Error: unknown tool: ${name}`
}
