import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import {
  getIncomingStatusLabel,
  getIncomingStatusVariant,
} from "@/lib/portal/packageStatus"
import type { IncomingPackage } from "@/types/entityTypeDef"

import { PortalPackageTimeline } from "@/components/portal/packages/PortalPackageTimeline"

type PortalIncomingPackageCardProps = {
  packag: IncomingPackage
  warehousesMap?: Record<number, string>
}

export function PortalIncomingPackageCard({
  packag,
  warehousesMap,
}: PortalIncomingPackageCardProps) {
  const whName = packag.warehouse_id && warehousesMap?.[Number(packag.warehouse_id)] ? warehousesMap[Number(packag.warehouse_id)] : ""

  return (
    <article className="portal-packages__card">
      <div className="portal-packages__card-head">
        <div className="portal-packages__card-title-block">
          <h3 className="portal-packages__card-title">
            {packag.declared_item_name}
          </h3>
        </div>
        <PortalPackageStatusBadge
          label={getIncomingStatusLabel(packag.status)}
          variant={getIncomingStatusVariant(packag.status)}
        />
      </div>

      <div className="portal-packages__card-body">
        <ul className="portal-packages__details-list">
          <li><strong>Tracking:</strong> {packag.incoming_tracking_number}</li>
          <li>
            <strong>Declared Weight:</strong>{" "}
            {packag.declared_item_weight
              ? `${packag.declared_item_weight} ${packag.declared_item_weight_unit || "kg"}`
              : "Not weighed yet"}
          </li>
          <li>
            <strong>Quantity:</strong> {packag.declared_item_quantity}{" "}
            {Number(packag.declared_item_quantity) === 1 ? "item" : "items"}
          </li>
          {whName && (
            <li>
              <strong>Warehouse:</strong> {whName}
            </li>
          )}
        </ul>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-dheir-border)" }}>
          <PortalPackageTimeline
            packag={{
              status: packag.status,
              created_at: packag.created_at,
              warehouse_name: whName,
            }}
          />
        </div>
      </div>

      {packag.customer_note ? (
        <div className="portal-packages__card-note-wrapper">
          <strong>Customer Note:</strong>
          <p className="portal-packages__card-note">{packag.customer_note}</p>
        </div>
      ) : null}
    </article>
  )
}
