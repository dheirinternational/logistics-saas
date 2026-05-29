import { pool } from "@/lib/db/db"
import { getSupabaseAdmin, parseProductStoragePath } from "@/lib/products/uploadProductMedia"

export async function deleteProductById(productId: number): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const imagesRes = await client.query<{ image_url: string }>(
      `SELECT image_url FROM product_images WHERE product_id = $1`,
      [productId]
    )

    await client.query(`DELETE FROM product_images WHERE product_id = $1`, [productId])
    await client.query(`DELETE FROM products WHERE id = $1`, [productId])

    await client.query("COMMIT")

    const paths = imagesRes.rows
      .map((row) => parseProductStoragePath(row.image_url))
      .filter((p): p is string => Boolean(p))

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
