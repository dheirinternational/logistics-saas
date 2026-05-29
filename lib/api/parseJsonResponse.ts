type ApiJson = {
  success?: boolean
  message?: string
  error?: string
  id?: number
  data?: unknown
}

const DB_BUSY_MESSAGE =
  "The server could not reach the database in time. Wait a few seconds and try again."

export async function parseJsonResponse(res: Response): Promise<ApiJson> {
  const text = await res.text()

  if (!text) {
    if (res.status === 413) {
      throw new Error("Upload too large. Try smaller images or upload one file at a time.")
    }
    if (res.status === 503) {
      throw new Error(DB_BUSY_MESSAGE)
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
    if (res.status === 503) {
      throw new Error(DB_BUSY_MESSAGE)
    }
    throw new Error(
      res.ok
        ? "Invalid response from server"
        : `Request failed (${res.status}). The server returned an unexpected response.`
    )
  }
}

export function apiErrorMessage(result: ApiJson, fallback: string): string {
  return result.message ?? result.error ?? fallback
}
