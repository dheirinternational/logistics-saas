/** Empty filter value — show all rows for that dimension. */
export const ADMIN_FILTER_ALL = ""

export function matchesStatusFilter(
  rowStatus: string | null | undefined,
  filterStatus: string
): boolean {
  const filter = filterStatus.trim().toLowerCase()
  if (!filter) return true
  return String(rowStatus ?? "").toLowerCase() === filter
}

export function matchesWarehouseFilter(
  rowWarehouseId: string | number | null | undefined,
  filterWarehouseId: string
): boolean {
  const filter = filterWarehouseId.trim()
  if (!filter) return true
  return String(rowWarehouseId ?? "") === filter
}
