import { pool } from "@/lib/db/db"
import { getShopSettings } from "@/lib/shop/shopSettings"
import type { PoolClient } from "pg"

export type ShopDeliveryFeeQuote = {
  zoneFee: number
  chargedFee: number
  freeDelivery: boolean
}

export async function getDeliveryZonePriceForState(
  stateName: string,
  client?: PoolClient
): Promise<number> {
  const db = client ?? pool
  const result = await db.query(
    `
    SELECT dz.price
    FROM delivery_zones dz
    JOIN states s ON dz.state_id = s.id
    WHERE LOWER(TRIM(s.name)) = LOWER(TRIM($1))
    LIMIT 1
    `,
    [stateName]
  )

  if (result.rowCount === 0) {
    return 0
  }

  return Number(result.rows[0].price) || 0
}

export async function resolveAuthorizedShopDeliveryFee(params: {
  stateName: string
  client?: PoolClient
}): Promise<ShopDeliveryFeeQuote> {
  const [zoneFee, settings] = await Promise.all([
    getDeliveryZonePriceForState(params.stateName, params.client),
    getShopSettings(params.client),
  ])

  const freeDelivery = settings.free_delivery_enabled

  return {
    zoneFee,
    chargedFee: freeDelivery ? 0 : zoneFee,
    freeDelivery,
  }
}
