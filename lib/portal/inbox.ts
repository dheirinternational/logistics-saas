import { pool } from "@/lib/db/db"

export type InboxMessage = {
  id: string
  title: string
  body: string
  isBroadcast: boolean
  isRead: boolean
  createdAt: string
}

/**
 * Fetch the inbox for a given user — returns direct messages addressed
 * to them plus all broadcast messages, with per-user read status.
 */
export async function getPortalInboxMessages(
  userId: number,
): Promise<InboxMessage[]> {
  const res = await pool.query(
    `
    SELECT
      m.id,
      m.title,
      m.body,
      m.is_broadcast,
      m.created_at,
      (r.read_at IS NOT NULL) AS is_read
    FROM inbox_messages m
    LEFT JOIN inbox_read_receipts r
      ON r.message_id = m.id AND r.user_id = $1
    WHERE m.recipient_id = $1 OR m.is_broadcast = TRUE
    ORDER BY m.created_at DESC
    `,
    [userId],
  )

  return res.rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    body: row.body ?? "",
    isBroadcast: Boolean(row.is_broadcast),
    isRead: Boolean(row.is_read),
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
  }))
}

/**
 * Count unread inbox messages for a user.
 * Fast single-column COUNT — safe for serverless DB.
 */
export async function getInboxUnreadCount(userId: number): Promise<number> {
  const res = await pool.query(
    `
    SELECT COUNT(*) AS count
    FROM inbox_messages m
    LEFT JOIN inbox_read_receipts r
      ON r.message_id = m.id AND r.user_id = $1
    WHERE (m.recipient_id = $1 OR m.is_broadcast = TRUE)
      AND r.read_at IS NULL
    `,
    [userId],
  )
  return Number(res.rows[0]?.count ?? 0)
}

/**
 * Mark a message as read for a given user (upsert — safe to call twice).
 */
export async function markInboxMessageRead(
  messageId: string,
  userId: number,
): Promise<void> {
  await pool.query(
    `
    INSERT INTO inbox_read_receipts (message_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, message_id) DO NOTHING
    `,
    [messageId, userId],
  )
}
