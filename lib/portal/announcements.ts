import { pool } from "@/lib/db/db"

export type PortalAnnouncement = {
  id: string
  title: string
  message: string
  createdAt: string
}

export async function getPortalAnnouncements(): Promise<PortalAnnouncement[]> {
  const res = await pool.query(`
    SELECT id, title, message, created_at
    FROM announcements
    ORDER BY id DESC
  `)

  return res.rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    message: row.message ?? "",
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
  }))
}

export async function getPortalAnnouncementById(
  id: string,
): Promise<PortalAnnouncement | null> {
  const res = await pool.query(
    `
    SELECT id, title, message, created_at
    FROM announcements
    WHERE id = $1
    LIMIT 1
  `,
    [id],
  )

  const row = res.rows[0]
  if (!row) return null

  return {
    id: String(row.id),
    title: row.title,
    message: row.message ?? "",
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
  }
}
