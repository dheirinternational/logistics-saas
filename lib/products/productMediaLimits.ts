/** Max product media files per product. */
export const MAX_PRODUCT_MEDIA_COUNT = 8

/**
 * Per-file upload cap. Media library uploads use signed URLs (browser → Supabase
 * directly), so this is no longer bounded by Vercel's ~4.5 MB request body limit.
 * Legacy proxy routes (receipts, avatars) have their own separate limits.
 */
export const MAX_PRODUCT_MEDIA_FILE_BYTES = 10 * 1024 * 1024

export const MAX_PRODUCT_MEDIA_FILE_LABEL = "10 MB"
