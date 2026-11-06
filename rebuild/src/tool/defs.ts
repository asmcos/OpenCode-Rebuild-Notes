/**
 * Tool definitions sent to the model.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/read.ts
 * - packages/core/src/tool/plugin/write.ts
 * - packages/core/src/tool/plugin/edit.ts
 * - packages/core/src/tool/plugin/subagent.ts
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

export const EDIT_TOOL = {
  type: "function" as const,
  function: {
    name: "edit",
    description:
      "Replace exact text in an existing file. oldString must match once, including whitespace. " +
      "If it matches more than once, the edit fails unless replaceAll is true. " +
      "Use write to create a file or replace its whole contents. Do not use edit for that.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File to edit" },
        oldString: { type: "string", description: "Exact text to find and replace" },
        newString: {
          type: "string",
          description: "Text to replace oldString with (must differ from oldString)",
        },
        replaceAll: {
          type: "boolean",
          description:
            "Replace every occurrence. When false or omitted, oldString must match exactly once.",
        },
      },
      required: ["path", "oldString", "newString"],
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

export const GREP_TOOL = {
  type: "function" as const,
  function: {
    name: "grep",
    description:
      "Search file contents for a regular expression or literal text. " +
      "Use this to find code before reading files. Defaults to the working directory. " +
      "Returns file paths, line numbers, and a short preview.",
    parameters: {
      type: "object",
      properties: {
        pattern: { type: "string", description: "Regular expression, or literal text when literal=true" },
        path: { type: "string", description: "File or directory to search. Defaults to the working directory." },
        include: { type: "string", description: 'Glob filter, for example "*.ts"' },
        literal: { type: "boolean", description: "Treat pattern as exact text (default false)" },
        caseSensitive: { type: "boolean", description: "Case-sensitive match (default true)" },
        limit: { type: "number", description: "Max matching lines (default 100)" },
      },
      required: ["pattern"],
      additionalProperties: false,
    },
  },
}

export const GLOB_TOOL = {
  type: "function" as const,
  function: {
    name: "glob",
    description:
      'Find files by path pattern (examples: "**/*.ts", "src/**/*.tsx"). Defaults to the working directory.',
    parameters: {
      type: "object",
      properties: {
        pattern: { type: "string", description: "Glob pattern" },
        path: { type: "string", description: "Directory to search. Defaults to the working directory." },
        hidden: { type: "boolean", description: "Include hidden files (default false)" },
        limit: { type: "number", description: "Max matching files (default 100)" },
      },
      required: ["pattern"],
      additionalProperties: false,
    },
  },
}

export const SUBAGENT_TOOL = {
  type: "function" as const,
  function: {
    name: "subagent",
    description:
      "Run a read-only subagent and wait for its answer. Use agent explore to search the codebase. " +
      "The prompt must include everything the child needs; it does not see this conversation. " +
      "explore cannot write, edit, or spawn another subagent.",
    parameters: {
      type: "object",
      properties: {
        agent: { type: "string", description: 'Subagent id. Use "explore".' },
        description: { type: "string", description: "Short label shown while it runs" },
        prompt: { type: "string", description: "Self-contained task for the subagent" },
      },
      required: ["agent", "prompt"],
      additionalProperties: false,
    },
  },
}

export const TOOLS = [READ_TOOL, WRITE_TOOL, EDIT_TOOL, SHELL_TOOL, GREP_TOOL, GLOB_TOOL, SUBAGENT_TOOL]
