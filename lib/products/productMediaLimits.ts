/** Max product media files per product. */
export const MAX_PRODUCT_MEDIA_COUNT = 8

/**
 * Per-file upload cap for server routes (Vercel ~4.5 MB request body).
 * Keep client and API in sync.
 */
export const MAX_PRODUCT_MEDIA_FILE_BYTES = 4 * 1024 * 1024

export const MAX_PRODUCT_MEDIA_FILE_LABEL = "4 MB"
