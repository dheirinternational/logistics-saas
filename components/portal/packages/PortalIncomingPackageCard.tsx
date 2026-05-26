import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import {
  getIncomingStatusLabel,
  getIncomingStatusVariant,
} from "@/lib/portal/packageStatus"
import type { IncomingPackage } from "@/types/entityTypeDef"

type PortalIncomingPackageCardProps = {
  packag: IncomingPackage
}

export function PortalIncomingPackageCard({
  packag,
}: PortalIncomingPackageCardProps) {
  return (
    <article className="portal-packages__card">
      <div className="portal-packages__card-head">
        <div className="portal-packages__card-title-block">
          <h3 className="portal-packages__card-title">
            {packag.declared_item_name}
          </h3>
          <p className="portal-packages__card-meta">
            Tracking: {packag.incoming_tracking_number}
          </p>
        </div>
        <PortalPackageStatusBadge
          label={getIncomingStatusLabel(packag.status)}
          variant={getIncomingStatusVariant(packag.status)}
        />
      </div>
      <div className="portal-packages__card-foot portal-packages__card-foot--split">
        <span className="portal-packages__card-meta">
          Qty: {packag.declared_item_quantity}
        </span>
        <time className="portal-packages__card-date" dateTime={packag.created_at}>
          {new Date(packag.created_at).toLocaleDateString()}
        </time>
      </div>
      {packag.customer_note ? (
        <p className="portal-packages__card-note">{packag.customer_note}</p>
      ) : null}
    </article>
  )
}
