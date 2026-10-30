import crypto from "crypto"

export function verifyPaystackSignature(rawBody: string, signature: string): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY is not configured")
    return false
  }

  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex")

  return hash === signature
}

