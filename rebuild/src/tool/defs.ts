/**
 * Tool definitions sent to the model.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/read.ts
 * - packages/core/src/tool/plugin/write.ts
 */

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

export const TOOLS = [READ_TOOL, WRITE_TOOL]
