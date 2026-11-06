/**
 * List saved chats.
 *
 * Upstream lists sessions from SQLite (packages/core/src/session/sql.ts).
 * We read rebuild/.sessions/*.json.
 */

import { listSessions } from "../../session/store"

export async function run(_args: string[]) {
  const sessions = await listSessions()
  if (!sessions.length) {
    console.log("(no sessions)")
    return
  }
  for (const session of sessions) {
    const when = session.updatedAt.replace("T", " ").slice(0, 16)
    console.log(`${session.id}  ${when}  ${session.agentId}  ${session.title}`)
  }
}
