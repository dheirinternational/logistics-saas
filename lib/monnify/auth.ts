function getMonnifyBaseUrl() {
  const base = process.env.MONNIFY_BASE_URL
  if (!base) {
    throw new Error("MONNIFY_BASE_URL is not configured")
  }
  return base.replace(/\/$/, "")
}

export async function getMonnifyToken() {
  const apiKey = process.env.MONNIFY_API_KEY
  const secretKey = process.env.MONNIFY_SECRET_KEY

  if (!apiKey || !secretKey) {
    throw new Error("Monnify API credentials are not configured")
  }

  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64")
  const baseUrl = getMonnifyBaseUrl()

  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error("Monnify auth failed:", res.status, errorText)
    throw new Error("Failed to authenticate with Monnify")
  }

  const data = await res.json()
  return data.responseBody.accessToken as string
}

export { getMonnifyBaseUrl }
