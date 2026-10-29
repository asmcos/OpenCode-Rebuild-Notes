/**
 * Session id: `ses_` + descending id (same algorithm as OpenCode Identifier).
 *
 * Inspired by (upstream relative paths):
 * - packages/schema/src/identifier.ts
 * - chat-zen-free.mjs / zen-free-agent (local examples under opencode checkout)
 */

const ID_LENGTH = 26
const ID_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
let lastTimestamp = 0
let counter = 0

export function descendingID(timestamp = Date.now()) {
  if (timestamp !== lastTimestamp) {
    lastTimestamp = timestamp
    counter = 0
  }
  counter++
  const current = BigInt(timestamp) * 0x1000n + BigInt(counter)
  const value = ~current
  const time = Array.from({ length: 6 }, (_, index) =>
    Number((value >> BigInt(40 - 8 * index)) & 0xffn)
      .toString(16)
      .padStart(2, "0"),
  ).join("")
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH - 12))
  return time + Array.from(bytes, (byte) => ID_CHARS[byte % 62]).join("")
}

export function newSessionID() {
  return `ses_${descendingID()}`
}
