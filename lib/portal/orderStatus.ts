import type { PackageStatusChipVariant } from "@/lib/portal/packageStatus"
import type { Order } from "@/types/entityTypeDef"

/** Values allowed by `orders.status` check constraint in Postgres. */
export const ORDER_STATUSES = [
  "Confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_ADMIN_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "Confirmed", label: "Confirmed" },
  { value: "preparing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

const ORDER_STATUS_VARIANTS: Record<OrderStatus, PackageStatusChipVariant> = {
  Confirmed: "blue",
  preparing: "orange",
  shipped: "blue",
  delivered: "green",
  cancelled: "neutral",
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Confirmed: "Confirmed",
  preparing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export const ORDER_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  ...ORDER_ADMIN_STATUS_OPTIONS,
] as const

export function isValidOrderStatus(status: string): status is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(status)
}

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
