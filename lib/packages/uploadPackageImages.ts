import { createClient } from "@supabase/supabase-js"
import type { PoolClient } from "pg"

const supabase = createClient(
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL!
    : process.env.NEXT_PUBLIC_SUPABASE_URL_TEST!,
  process.env.NODE_ENV === "production"
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.SUPABASE_SERVICE_ROLE_KEY_TEST!
)

function getImageFiles(entries: FormDataEntryValue[]): File[] {
  return entries.filter((entry): entry is File => entry instanceof File && entry.size > 0)
}

/**
 * Uploads optional package photos to Storage and inserts rows into package_images.
 * Matches existing POST /api/packages behavior (package_id, image_url, is_primary).
 */
export async function uploadPackageImages(
  client: PoolClient,
  packageId: number,
  imageEntries: FormDataEntryValue[]
): Promise<void> {
  const files = getImageFiles(imageEntries)
  if (files.length === 0) return

  const primaryRes = await client.query(
    `SELECT 1 FROM package_images WHERE package_id = $1 AND is_primary = true LIMIT 1`,
    [packageId]
  )
  let hasPrimary = primaryRes.rows.length > 0

  const uploadedUrls: { url: string; isPrimary: boolean }[] = []

  for (const file of files) {
    const filePath = `package${packageId}-${Date.now()}-${file.name}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage.from("packages").upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`)
    }

    const { data: publicUrl } = supabase.storage.from("packages").getPublicUrl(filePath)
    const isPrimary = !hasPrimary
    if (isPrimary) hasPrimary = true
    uploadedUrls.push({ url: publicUrl.publicUrl, isPrimary })
  }

  const values: unknown[] = []
  const rowsSql = uploadedUrls.map((row, index) => {
    const base = index * 3
    values.push(packageId, row.url, row.isPrimary)
    return `($${base + 1}, $${base + 2}, $${base + 3})`
  })

  await client.query(
    `INSERT INTO package_images (package_id, image_url, is_primary)
     VALUES ${rowsSql.join(", ")}`,
    values
  )
}
