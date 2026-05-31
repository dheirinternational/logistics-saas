import { pool } from "@/lib/db/db"
import type { PoolClient } from "pg"

export type ShopCatalogItem = {
  id: number
  title: string
  description: string
  image_url: string | null
  image_alt: string
  category_id: number | null
  category_name?: string | null
  media_asset_id?: number | null
  sort_order: number
  is_active?: boolean
}

const PUBLIC_CATALOG_SELECT = `
  SELECT
    sc.id,
    sc.title,
    sc.description,
    sc.image_alt,
    sc.category_id,
    sc.sort_order,
    COALESCE(ma.public_url, sc.image_url) AS image_url,
    c.name AS category_name
  FROM shop_catalog sc
  LEFT JOIN media_assets ma ON ma.id = sc.media_asset_id
  LEFT JOIN categories c ON c.id = sc.category_id
`

const ADMIN_CATALOG_SELECT = `
  SELECT
    sc.id,
    sc.title,
    sc.description,
    sc.image_alt,
    sc.category_id,
    sc.media_asset_id,
    sc.sort_order,
    sc.is_active,
    COALESCE(ma.public_url, sc.image_url) AS image_url,
    c.name AS category_name
  FROM shop_catalog sc
  LEFT JOIN media_assets ma ON ma.id = sc.media_asset_id
  LEFT JOIN categories c ON c.id = sc.category_id
`

export async function listPublicShopCatalog(): Promise<ShopCatalogItem[]> {
  const result = await pool.query(
    `
    ${PUBLIC_CATALOG_SELECT}
    WHERE sc.is_active = true
    ORDER BY sc.sort_order ASC, sc.id ASC
    `
  )

  return result.rows
}

export async function listAdminShopCatalog(): Promise<ShopCatalogItem[]> {
  const result = await pool.query(
    `
    ${ADMIN_CATALOG_SELECT}
    ORDER BY sc.sort_order ASC, sc.id ASC
    `
  )

  return result.rows
}

export async function getNextShopCatalogSortOrder(client?: PoolClient): Promise<number> {
  const db = client ?? pool
  const result = await db.query(
    `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM shop_catalog`
  )
  return Number(result.rows[0]?.next_order ?? 1)
}
