/**
 * Tool definitions sent to the model.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/read.ts
 * - packages/core/src/tool/plugin/write.ts
 * - packages/core/src/tool/plugin/shell.ts
 */

import { shellToolDescription, DEFAULT_TIMEOUT_MS } from "./shell"

export const READ_TOOL = {
  type: "function" as const,
  function: {
    name: "read",
    description:
      "Read the contents of a text file. Prefer paths relative to the working directory.",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "File path to read (relative to cwd or absolute)",
        },
        filePath: { type: "string", description: "Alias of path" },
      },
      additionalProperties: false,
    },
  },
}

export const WRITE_TOOL = {
  type: "function" as const,
  function: {
    name: "write",
    description:
      "Write a text file (creates parents, overwrites if exists). " +
      "Relative paths resolve against the working directory; absolute paths are allowed (may need permission).",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the file to write to",
        },
        content: {
          type: "string",
          description: "Full content to write to the file",
        },
      },
      required: ["path", "content"],
      additionalProperties: false,
    },
  },
}

export const SHELL_TOOL = {
  type: "function" as const,
  function: {
    name: "shell",
    description: shellToolDescription(),
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Shell command string to execute",
        },
        workdir: {
          type: "string",
          description:
            "Working directory to execute the command in. Defaults to the current working directory. When possible, avoid changing directories in the command and set the working directory here instead.",
        },
        timeout: {
          type: "number",
          description: `Timeout in milliseconds. Set to 0 to disable the timeout. Defaults to ${DEFAULT_TIMEOUT_MS}.`,
        },
      },
      required: ["command"],
      additionalProperties: false,
    },
  },
}

export const TOOLS = [READ_TOOL, WRITE_TOOL, SHELL_TOOL]
