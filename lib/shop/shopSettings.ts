import { pool } from "@/lib/db/db"
import type { PoolClient } from "pg"

export type ShopSettings = {
  free_delivery_enabled: boolean
}

export async function getShopSettings(client?: PoolClient): Promise<ShopSettings> {
  const db = client ?? pool
  const result = await db.query(
    `SELECT free_delivery_enabled FROM shop_settings WHERE id = 1 LIMIT 1`
  )

  if (result.rowCount === 0) {
    return { free_delivery_enabled: false }
  }

  return {
    free_delivery_enabled: result.rows[0].free_delivery_enabled === true,
  }
}

export async function setFreeDeliveryEnabled(
  enabled: boolean,
  updatedBy: number,
  client?: PoolClient
): Promise<ShopSettings> {
  const db = client ?? pool

  await db.query(
    `
    INSERT INTO shop_settings (id, free_delivery_enabled, updated_by, updated_at)
    VALUES (1, $1, $2, NOW())
    ON CONFLICT (id) DO UPDATE SET
      free_delivery_enabled = EXCLUDED.free_delivery_enabled,
      updated_by = EXCLUDED.updated_by,
      updated_at = NOW()
    `,
    [enabled, updatedBy]
  )

  return { free_delivery_enabled: enabled }
}
