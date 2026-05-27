/** Basic slugify for human-friendly URLs (no DB dependency). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

/**
 * Accepts either:
 * - "123"
 * - "gold-watch-123"
 * and returns "123" (as string) or "" if none.
 */
export function extractTrailingNumericId(value: string): string {
  const raw = String(value ?? "").trim()
  if (!raw) return ""
  if (/^\d+$/.test(raw)) return raw
  const match = raw.match(/(\d+)$/)
  return match?.[1] ?? ""
}

