import type { PortalDashboardCounts } from "@/lib/portal/dashboard"
import Link from "next/link"

type PortalHomeStatusStripProps = {
  counts: PortalDashboardCounts
}

const STATUS_ITEMS = [
  {
    label: "On the way",
    countKey: "waiting_to_be_stored" as const,
    href: "/base/waiting_to_be_stored",
  },
  {
    label: "In warehouse",
    countKey: "total_packages" as const,
    href: "/base/packages",
  },
  {
    label: "Pay due",
    countKey: "pending_payments" as const,
    href: "/base/pending_payments",
    highlight: true,
  },
  {
    label: "In transit",
    countKey: "shipment" as const,
    href: "/base/orders_shipped",
  },
]

export function PortalHomeStatusStrip({ counts }: PortalHomeStatusStripProps) {
  return (
    <div className="portal-home__status-strip" role="list">
      {STATUS_ITEMS.map((item) => {
        const value = counts[item.countKey]
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`portal-home__status-chip${item.highlight && value > 0 ? " is-alert" : ""}`}
            role="listitem"
          >
            <span className="portal-home__status-value">{value}</span>
            <span className="portal-home__status-label">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
