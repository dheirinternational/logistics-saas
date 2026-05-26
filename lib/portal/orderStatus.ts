import type { PackageStatusChipVariant } from "@/lib/portal/packageStatus"
import type { Order } from "@/types/entityTypeDef"

const ORDER_STATUS_VARIANTS: Record<
  Order["status"],
  PackageStatusChipVariant
> = {
  Confirmed: "blue",
  preparing: "orange",
  shipped: "blue",
  delivered: "green",
}

const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  Confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
}

export const ORDER_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
] as const

export function getOrderStatusLabel(status: string): string {
  return (
    ORDER_STATUS_LABELS[status as Order["status"]] ??
    status.replaceAll("_", " ")
  )
}

export function getOrderStatusVariant(
  status: string,
): PackageStatusChipVariant {
  return ORDER_STATUS_VARIANTS[status as Order["status"]] ?? "neutral"
}
