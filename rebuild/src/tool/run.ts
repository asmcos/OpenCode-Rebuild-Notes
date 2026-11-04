/**
 * Dispatch tool_calls by name.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/runtime.ts
 */

import { readFileTool } from "./read"
import { writeFileTool } from "./write"
import { shellTool } from "./shell"
import { globTool, grepTool } from "./search"
import type { PermissionRuntime } from "../permission/assert"

export type ToolRunContext = {
  cwd?: string
  permission?: PermissionRuntime
}

export async function runTool(
  name: string,
  argsJson: string,
  ctx: ToolRunContext | string = process.cwd(),
): Promise<string> {
  const context: ToolRunContext = typeof ctx === "string" ? { cwd: ctx } : ctx
  const cwd = context.cwd ?? process.cwd()

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
      context.permission,
    )
  }

  if (name === "write") {
    return writeFileTool(
      {
        path: typeof args.path === "string" ? args.path : undefined,
        content: typeof args.content === "string" ? args.content : undefined,
      },
      cwd,
      context.permission,
    )
  }

  if (name === "grep") {
    return grepTool(
      {
        pattern: typeof args.pattern === "string" ? args.pattern : undefined,
        path: typeof args.path === "string" ? args.path : undefined,
        include: typeof args.include === "string" ? args.include : undefined,
        literal: typeof args.literal === "boolean" ? args.literal : undefined,
        caseSensitive: typeof args.caseSensitive === "boolean" ? args.caseSensitive : undefined,
        limit: typeof args.limit === "number" ? args.limit : undefined,
      },
      cwd,
      context.permission,
    )
  }

  if (name === "glob") {
    return globTool(
      {
        pattern: typeof args.pattern === "string" ? args.pattern : undefined,
        path: typeof args.path === "string" ? args.path : undefined,
        hidden: typeof args.hidden === "boolean" ? args.hidden : undefined,
        limit: typeof args.limit === "number" ? args.limit : undefined,
      },
      cwd,
      context.permission,
    )
  }

  if (name === "shell") {
    return shellTool(
      {
        command: typeof args.command === "string" ? args.command : undefined,
        workdir: typeof args.workdir === "string" ? args.workdir : undefined,
        timeout: typeof args.timeout === "number" ? args.timeout : undefined,
      },
      cwd,
      context.permission,
    )
  }

  return `Error: unknown tool: ${name}`
}
