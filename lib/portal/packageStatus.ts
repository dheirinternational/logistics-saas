import type { IncomingPackageStatus, PackageStatus } from "@/types/statusTypes"

export type PackageStatusChipVariant =
  | "neutral"
  | "blue"
  | "orange"
  | "green"
  | "muted"

const PACKAGE_STATUS_LABELS: Record<PackageStatus, string> = {
  stored: "At warehouse",
  requested_for: "Ready to ship",
  assigned_to_shipment: "In shipment",
  delivered: "Delivered",
}

const PACKAGE_STATUS_VARIANTS: Record<PackageStatus, PackageStatusChipVariant> =
  {
    stored: "blue",
    requested_for: "orange",
    assigned_to_shipment: "blue",
    delivered: "green",
  }

const INCOMING_STATUS_LABELS: Record<IncomingPackageStatus, string> = {
  expected: "On the way",
  received: "Received",
  cancelled: "Cancelled",
  stored: "Stored",
}

const INCOMING_STATUS_VARIANTS: Record<
  IncomingPackageStatus,
  PackageStatusChipVariant
> = {
  expected: "orange",
  received: "blue",
  cancelled: "muted",
  stored: "green",
}

export function getPackageStatusLabel(status: string): string {
  return (
    PACKAGE_STATUS_LABELS[status as PackageStatus] ??
    status.replaceAll("_", " ")
  )
}

export function getPackageStatusVariant(
  status: string,
): PackageStatusChipVariant {
  return (
    PACKAGE_STATUS_VARIANTS[status as PackageStatus] ?? "neutral"
  )
}

export function getIncomingStatusLabel(status: string): string {
  return (
    INCOMING_STATUS_LABELS[status as IncomingPackageStatus] ??
    status.replaceAll("_", " ")
  )
}

export function getIncomingStatusVariant(
  status: string,
): PackageStatusChipVariant {
  return (
    INCOMING_STATUS_VARIANTS[status as IncomingPackageStatus] ?? "neutral"
  )
}

const SHIPMENT_STATUS_VARIANTS: Record<string, PackageStatusChipVariant> = {
  processing: "orange",
  shipped: "blue",
  in_transit: "blue",
  arrived: "blue",
  out_for_delivery: "orange",
  delivered: "green",
}

export function getShipmentStatusVariant(
  status: string,
): PackageStatusChipVariant {
  return SHIPMENT_STATUS_VARIANTS[status] ?? "neutral"
}

export function getActivityStatusVariant(
  kind: "shipment" | "package" | "incoming",
  status: string,
): PackageStatusChipVariant {
  if (kind === "shipment") return getShipmentStatusVariant(status)
  if (kind === "incoming") return getIncomingStatusVariant(status)
  return getPackageStatusVariant(status)
}

export const PACKAGE_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "stored", label: "At warehouse" },
  { value: "requested_for", label: "Ready to ship" },
  { value: "assigned_to_shipment", label: "In shipment" },
  { value: "delivered", label: "Delivered" },
] as const
