import type { PortalDashboardCounts } from "@/lib/portal/dashboard"
import {
  IconBox,
  IconCreditCard,
  IconPackage,
  IconTruckDelivery,
} from "@tabler/icons-react"
import type { TablerIcon } from "@tabler/icons-react"
import Link from "next/link"

type StatCard = {
  label: string
  value: number | string
  hint?: string
  href: string
  icon: TablerIcon
  alert?: boolean
}

type PortalHomeStatsCardsProps = {
  counts: PortalDashboardCounts
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function PortalHomeStatsCards({ counts }: PortalHomeStatsCardsProps) {
  const cards: StatCard[] = [
    {
      label: "On the way",
      value: counts.waiting_to_be_stored,
      hint: "Not in warehouse yet",
      href: "/base/waiting_to_be_stored",
      icon: IconPackage,
    },
    {
      label: "In warehouse",
      value: counts.total_packages,
      hint: "Ready to ship",
      href: "/base/packages",
      icon: IconBox,
    },
    {
      label: "Active shipments",
      value: counts.shipment,
      hint:
        counts.total_shipments > 0
          ? `${counts.delivered_shipments} delivered total`
          : "None yet",
      href: "/base/orders_shipped",
      icon: IconTruckDelivery,
    },
    {
      label: "Payments due",
      value: counts.pending_payments,
      hint:
        counts.pending_payments_total > 0
          ? formatNaira(counts.pending_payments_total)
          : "All clear",
      href: "/base/pending_payments",
      icon: IconCreditCard,
      alert: counts.pending_payments > 0,
    },
  ]

  return (
    <div className="portal-home__stats" role="list">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Link
            key={card.label}
            href={card.href}
            className={`portal-home__stat-card${card.alert ? " is-alert" : ""}`}
            role="listitem"
          >
            <span className="portal-home__stat-card-icon" aria-hidden>
              <Icon size={22} stroke={1.5} />
            </span>
            <span className="portal-home__stat-card-body">
              <span className="portal-home__stat-card-label">{card.label}</span>
              <span className="portal-home__stat-card-value">{card.value}</span>
              {card.hint ? (
                <span className="portal-home__stat-card-hint">{card.hint}</span>
              ) : null}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
