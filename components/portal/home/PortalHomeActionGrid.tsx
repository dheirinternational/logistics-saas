import type { PortalDashboardCounts } from "@/lib/portal/dashboard"
import type { PortalHomeAction } from "@/lib/portal/homeActions"
import Link from "next/link"

type PortalHomeActionGridProps = {
  title: string
  subtitle?: string
  actions: PortalHomeAction[]
  counts: PortalDashboardCounts
  columns?: 2 | 3
}

export function PortalHomeActionGrid({
  title,
  subtitle,
  actions,
  counts,
  columns = 3,
}: PortalHomeActionGridProps) {
  return (
    <section className="portal-home__section">
      <div className="portal-home__section-head">
        <h2 className="portal-home__section-title">{title}</h2>
        {subtitle ? (
          <p className="portal-home__section-sub">{subtitle}</p>
        ) : null}
      </div>
      <div
        className={`portal-home__action-grid portal-home__action-grid--cols-${columns}`}
      >
        {actions.map((action) => {
          const Icon = action.icon
          const count =
            action.countKey != null ? counts[action.countKey] : undefined
          const isPrimary = action.emphasis === "primary"

          return (
            <Link
              key={action.id}
              href={action.href}
              className={`portal-home__action-card${isPrimary ? " is-primary" : ""}`}
            >
              <span className="portal-home__action-icon" aria-hidden>
                <Icon size={22} stroke={1.5} />
              </span>
              <span className="portal-home__action-body">
                <span className="portal-home__action-label">{action.label}</span>
                <span className="portal-home__action-desc">
                  {action.description}
                </span>
              </span>
              {count != null && count > 0 ? (
                <span className="portal-home__action-badge">{count}</span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
