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

/** Full line for supplier copy - matches warehouse_address page. */
export function formatWarehouseCopyText(
  warehouse: WarehouseRow,
  memberCode: string,
  customerFullName?: string,
): string {
  const baseName = customerFullName?.trim() || warehouse.name.split("(")[0]?.trim() || "Dheir"
  const recipient = `${baseName}/${memberCode}`

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

export type WarehouseAddressDetail = {
  label: string
  value: string
}

/** Structured fields for the warehouse address page (below the copy block). */
export function getWarehouseAddressDetails(
  warehouse: WarehouseRow,
  memberCode: string,
  customerFullName?: string,
): WarehouseAddressDetail[] {
  const baseName = customerFullName?.trim() || warehouse.name.split("(")[0]?.trim() || "Dheir"
  const recipient = `${baseName}/${memberCode}`
  const addressLine = [
    warehouse.country === "CN" ? "KRC2530" : null,
    warehouse.province,
    warehouse.city,
    warehouse.district,
    warehouse.street,
    warehouse.building,
    memberCode,
  ]
    .filter(Boolean)
    .join(", ")

  return [
    { label: "Recipient / Shipment Name", value: recipient },
    { label: "Member code", value: memberCode || "-" },
    { label: "Phone", value: warehouse.phone || "-" },
    { label: "Country", value: warehouse.country || "-" },
    { label: "Province", value: warehouse.province || "-" },
    { label: "City", value: warehouse.city || "-" },
    { label: "District", value: warehouse.district || "-" },
    { label: "Street", value: warehouse.street || "-" },
    { label: "Building / unit", value: warehouse.building || "-" },
    { label: "Full address line", value: addressLine || "-" },
    { label: "Postal code", value: warehouse.postal_code || "-" },
  ]
}
