import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import { getActivityStatusVariant } from "@/lib/portal/packageStatus"
import type { PortalDashboardActivityRow } from "@/lib/portal/dashboard"
import Link from "next/link"

type PortalHomeActivityTableProps = {
  rows: PortalDashboardActivityRow[]
}

const KIND_LABELS: Record<PortalDashboardActivityRow["kind"], string> = {
  shipment: "Shipment",
  package: "Package",
  incoming: "Incoming",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatNaira(amount: number | null) {
  if (amount == null || amount === 0) return "—"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount)
}

function rowHref(row: PortalDashboardActivityRow) {
  if (row.kind === "shipment") return "/base/orders_shipped"
  if (row.kind === "incoming") return "/base/waiting_to_be_stored"
  return "/base/packages"
}

export function PortalHomeActivityTable({ rows }: PortalHomeActivityTableProps) {
  return (
    <section className="portal-home__panel" aria-labelledby="activity-heading">
      <div className="portal-home__panel-head">
        <div>
          <h2 id="activity-heading" className="portal-home__section-title">
            Recent activity
          </h2>
          <p className="portal-home__section-sub">
            Latest packages and shipments in your account
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="portal-packages__empty">
          <p>No activity yet. Add a package to get started.</p>
        </div>
      ) : (
        <div className="portal-home__table-wrap">
          <table className="portal-home__table">
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Type</th>
                <th scope="col">Date</th>
                <th scope="col">Weight</th>
                <th scope="col">Route</th>
                <th scope="col">Fee</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.kind}-${row.id}`}>
                  <td>
                    <Link href={rowHref(row)} className="portal-home__table-link">
                      {row.title}
                    </Link>
                  </td>
                  <td>{KIND_LABELS[row.kind]}</td>
                  <td>
                    <time dateTime={row.createdAt}>{formatDate(row.createdAt)}</time>
                  </td>
                  <td>{row.weight != null ? `${row.weight} kg` : "—"}</td>
                  <td className="portal-home__table-route">{row.routeLabel}</td>
                  <td>{formatNaira(row.fee)}</td>
                  <td>
                    <PortalPackageStatusBadge
                      label={row.status.replaceAll("_", " ")}
                      variant={getActivityStatusVariant(row.kind, row.status)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
