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
 * Fetch the inbox for a given customer:
 * 1 unified "DHEIR Support" direct conversation + broadcast announcements.
 */
export async function getPortalInboxMessages(
  userId: number,
): Promise<InboxMessage[]> {
  // 1. Fetch broadcast announcements
  const broadcastsRes = await pool.query(
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
    WHERE m.is_broadcast = TRUE
      AND m.parent_id IS NULL
    ORDER BY m.created_at DESC
    `,
    [userId],
  )

  // 2. Fetch the unified direct support chat for this customer
  const directRes = await pool.query(
    `
    SELECT
      root.id AS root_id,
      latest.body AS latest_body,
      COALESCE(latest.created_at, root.created_at) AS latest_created_at,
      (
        SELECT COUNT(*)
        FROM inbox_messages unread_m
        LEFT JOIN inbox_read_receipts r ON r.message_id = unread_m.id AND r.user_id = $1
        WHERE (unread_m.id = root.id OR unread_m.parent_id = root.id OR unread_m.thread_id = root.id)
          AND unread_m.sender_role = 'admin'
          AND r.read_at IS NULL
      ) AS unread_admin_messages
    FROM inbox_messages root
    LEFT JOIN LATERAL (
      SELECT body, created_at
      FROM inbox_messages
      WHERE thread_id = root.id OR id = root.id OR parent_id = root.id
      ORDER BY created_at DESC
      LIMIT 1
    ) latest ON true
    WHERE root.is_broadcast = FALSE
      AND (root.recipient_id = $1 OR root.sender_id = $1)
      AND root.parent_id IS NULL
    ORDER BY root.created_at ASC
    LIMIT 1
    `,
    [userId],
  )

  const messages: InboxMessage[] = []

  // Always include exactly ONE unified Support Chat entry
  if (directRes.rows.length > 0) {
    const d = directRes.rows[0]
    messages.push({
      id: String(d.root_id),
      title: "DHEIR Support",
      body: d.latest_body || "Chat directly with DHEIR administration.",
      isBroadcast: false,
      isRead: Number(d.unread_admin_messages ?? 0) === 0,
      createdAt: d.latest_created_at
        ? new Date(d.latest_created_at).toISOString()
        : new Date().toISOString(),
    })
  } else {
    messages.push({
      id: "support-chat",
      title: "DHEIR Support",
      body: "Chat directly with DHEIR administration.",
      isBroadcast: false,
      isRead: true,
      createdAt: new Date().toISOString(),
    })
  }

  // Append broadcast announcements
  for (const row of broadcastsRes.rows) {
    messages.push({
      id: String(row.id),
      title: row.title,
      body: row.body ?? "",
      isBroadcast: true,
      isRead: Boolean(row.is_read),
      createdAt: row.created_at
        ? new Date(row.created_at).toISOString()
        : new Date().toISOString(),
    })
  }

  return messages
}

/**
 * Count unread inbox messages for a user.
 * Counts unread broadcasts and unread direct admin messages.
 */
export async function getInboxUnreadCount(userId: number): Promise<number> {
  const res = await pool.query(
    `
    SELECT COUNT(*) AS count
    FROM inbox_messages m
    LEFT JOIN inbox_read_receipts r
      ON r.message_id = m.id AND r.user_id = $1
    WHERE (
      (m.is_broadcast = TRUE AND m.parent_id IS NULL)
      OR
      (m.is_broadcast = FALSE AND m.sender_role = 'admin' AND (m.recipient_id = $1 OR m.sender_id != $1))
    )
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
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)
  if (!isUuid) return

  await pool.query(
    `
    INSERT INTO inbox_read_receipts (message_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, message_id) DO NOTHING
    `,
    [messageId, userId],
  )
}
