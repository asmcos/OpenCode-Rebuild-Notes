/**
 * Tool definitions sent to the model.
 *
 * Inspired by (upstream relative paths):
 * - packages/core/src/tool/plugin/read.ts  (name = "read", path input)
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
        // Accepted for older gate examples; prefer `path`.
        filePath: { type: "string", description: "Alias of path" },
      },
      additionalProperties: false,
    },
  },
}

export const TOOLS = [READ_TOOL]
