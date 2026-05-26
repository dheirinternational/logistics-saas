import type { PackageStatusChipVariant } from "@/lib/portal/packageStatus"

type PortalPackageStatusBadgeProps = {
  label: string
  variant?: PackageStatusChipVariant
}

export function PortalPackageStatusBadge({
  label,
  variant = "neutral",
}: PortalPackageStatusBadgeProps) {
  return (
    <span className={`portal-packages__badge portal-packages__badge--${variant}`}>
      {label}
    </span>
  )
}
