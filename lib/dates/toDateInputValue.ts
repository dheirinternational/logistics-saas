/** Format a DB/ISO timestamp for `<input type="date">` (yyyy-MM-dd). */
export function toDateInputValue(value: string | Date | null | undefined): string {
  if (value == null || value === "") return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/)
    return match?.[1] ?? ""
  }
  return date.toISOString().slice(0, 10)
}
