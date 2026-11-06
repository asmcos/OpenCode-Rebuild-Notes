/**
 * One JSON file per chat.
 *
 * Upstream keeps Session.Info and messages in separate SQLite tables
 * (packages/schema/src/session.ts, packages/core/src/session/sql.ts).
 * This lesson stores both in rebuild/.sessions/<id>.json.
 */

import { randomBytes } from "node:crypto"
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import type { ChatMessage } from "../llm/messages"

const DIR = join(dirname(fileURLToPath(import.meta.url)), "../../.sessions")
const ID_RE = /^[a-f0-9]{8}$/

export type StoredSession = {
  id: string
  title: string
  agentId: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

export function createSession(agentId: string, messages: ChatMessage[]): StoredSession {
  const now = new Date().toISOString()
  return {
    id: randomBytes(4).toString("hex"),
    title: "新会话",
    agentId,
    createdAt: now,
    updatedAt: now,
    messages,
  }
}

export async function saveSession(session: StoredSession): Promise<void> {
  if (!ID_RE.test(session.id)) throw new Error(`invalid session id: ${session.id}`)
  session.title = titleFrom(session.messages, session.title)
  session.updatedAt = new Date().toISOString()
  await mkdir(DIR, { recursive: true })
  const file = join(DIR, `${session.id}.json`)
  const tmp = `${file}.tmp`
  await writeFile(tmp, JSON.stringify(session, null, 2))
  await rename(tmp, file)
}

export async function loadSession(id: string): Promise<StoredSession> {
  if (!ID_RE.test(id)) throw new Error(`session not found: ${id}`)
  try {
    const raw = await readFile(join(DIR, `${id}.json`), "utf8")
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed || parsed.id !== id || !Array.isArray(parsed.messages)) {
      throw new Error(`session not found: ${id}`)
    }
    return parsed
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("session not found")) throw err
    throw new Error(`session not found: ${id}`)
  }
}

export async function listSessions(): Promise<StoredSession[]> {
  let names: string[]
  try {
    names = await readdir(DIR)
  } catch {
    return []
  }
  const sessions: StoredSession[] = []
  for (const name of names) {
    if (!name.endsWith(".json")) continue
    const id = name.slice(0, -".json".length)
    if (!ID_RE.test(id)) continue
    try {
      sessions.push(await loadSession(id))
    } catch {
      // skip a torn file
    }
  }
  sessions.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  return sessions
}

export async function latestSession(): Promise<StoredSession | null> {
  const all = await listSessions()
  return all[0] ?? null
}

function titleFrom(messages: ChatMessage[], current: string): string {
  if (current && current !== "新会话") return current
  const user = messages.find((message) => message.role === "user")
  if (!user || user.role !== "user") return current || "新会话"
  const line = user.content.replace(/\s+/g, " ").trim()
  return line.slice(0, 40) || "新会话"
}
