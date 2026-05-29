type ApiJson = {
  success?: boolean
  message?: string
  id?: number
  data?: unknown
}

export async function parseJsonResponse(res: Response): Promise<ApiJson> {
  const text = await res.text()

  if (!text) {
    if (res.status === 413) {
      throw new Error("Upload too large. Try smaller images or upload one file at a time.")
    }
    throw new Error(
      res.ok
        ? "Empty response from server"
        : `Request failed (${res.status}). Check your connection and try again.`
    )
  }

  try {
    return JSON.parse(text) as ApiJson
  } catch {
    if (res.status === 413) {
      throw new Error("Upload too large for the server. Use smaller media files (under 4 MB each).")
    }
    throw new Error(
      res.ok
        ? "Invalid response from server"
        : `Request failed (${res.status}). The server returned an unexpected response.`
    )
  }
}
