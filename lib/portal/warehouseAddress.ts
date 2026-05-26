type WarehouseRow = {
  name: string
  country: string
  province?: string | null
  city?: string | null
  district?: string | null
  street?: string | null
  building?: string | null
  phone?: string | null
  postal_code?: string | null
}

/** Full line for supplier copy — matches warehouse_address page. */
export function formatWarehouseCopyText(
  warehouse: WarehouseRow,
  memberCode: string,
): string {
  const recipient = warehouse.name.split("(")[0]?.trim() || warehouse.name
  const addressCore = [
    warehouse.country === "CN" ? "KRC2530" : "Nigeria",
    warehouse.province || "",
    warehouse.city || "",
    warehouse.district || "",
    warehouse.street || "",
    warehouse.building || "",
    memberCode,
  ]
    .filter(Boolean)
    .join(", ")

  return [
    recipient,
    warehouse.phone || "",
    addressCore,
    warehouse.postal_code || "",
  ]
    .filter(Boolean)
    .join(" · ")
}
