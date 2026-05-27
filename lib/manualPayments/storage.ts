import { createClient } from "@supabase/supabase-js"

const RECEIPT_BUCKET = "payment-receipts"

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
])

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024

function getSupabaseAdmin() {
  const url =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL!
      : process.env.NEXT_PUBLIC_SUPABASE_URL_TEST!
  const key =
    process.env.NODE_ENV === "production"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY!
      : process.env.SUPABASE_SERVICE_ROLE_KEY_TEST!

  return createClient(url, key)
}

export function validateReceiptFile(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Receipt file is required")
  }

  if (file.size > MAX_RECEIPT_BYTES) {
    throw new Error("Receipt must be 5MB or smaller")
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Receipt must be a JPG, PNG, WebP, or PDF file")
  }
}

export async function uploadPaymentReceipt(params: {
  file: File
  userId: number
  paymentType: string
  reference: string
}) {
  validateReceiptFile(params.file)

  const supabase = getSupabaseAdmin()
  const ext =
    params.file.type === "image/png"
      ? "png"
      : params.file.type === "image/webp"
        ? "webp"
        : params.file.type === "application/pdf"
          ? "pdf"
          : "jpg"
  const safeRef = params.reference.replace(/[^a-zA-Z0-9_-]/g, "_")
  const storagePath = `${params.userId}/${params.paymentType}/${safeRef}/${Date.now()}.${ext}`

  const buffer = Buffer.from(await params.file.arrayBuffer())

  const { error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .upload(storagePath, buffer, {
      contentType: params.file.type,
      upsert: false,
    })

  if (error) {
    console.error("Receipt upload failed:", error)
    throw new Error("Could not upload receipt. Please try again.")
  }

  return {
    storagePath,
    mimeType: params.file.type,
  }
}

export async function createReceiptSignedUrl(storagePath: string, expiresIn = 900) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error || !data?.signedUrl) {
    console.error("Signed URL failed:", error)
    throw new Error("Could not load receipt")
  }

  return data.signedUrl
}
