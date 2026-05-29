import { pool } from "@/lib/db/db"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { parseProductStoragePath } from "@/lib/products/uploadProductMedia"

export async function deleteProductById(productId: number): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const imagesRes = await client.query<{ image_url: string; media_asset_id: number | null }>(
      `SELECT image_url, media_asset_id FROM product_images WHERE product_id = $1`,
      [productId]
    )

    await client.query(`DELETE FROM product_images WHERE product_id = $1`, [productId])
    await client.query(`DELETE FROM products WHERE id = $1`, [productId])

    await client.query("COMMIT")

    const paths = imagesRes.rows
      .filter((row) => row.media_asset_id == null)
      .map((row) => parseProductStoragePath(row.image_url))
      .filter((p): p is string => Boolean(p && !p.startsWith("media-library/")))

    if (paths.length > 0) {
      try {
        const supabase = getSupabaseAdmin()
        await supabase.storage.from("products").remove(paths)
      } catch (err) {
        console.error("Product storage cleanup failed (product already removed from DB)", err)
      }
    }
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined)
    throw err
  } finally {
    client.release()
  }
}
