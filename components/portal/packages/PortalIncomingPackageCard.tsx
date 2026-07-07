import { PortalPackageStatusBadge } from "@/components/portal/packages/PortalPackageStatusBadge"
import {
  getIncomingStatusLabel,
  getIncomingStatusVariant,
} from "@/lib/portal/packageStatus"
import type { IncomingPackage } from "@/types/entityTypeDef"

type PortalIncomingPackageCardProps = {
  packag: IncomingPackage
  warehousesMap?: Record<number, string>
}

export function PortalIncomingPackageCard({
  packag,
  warehousesMap,
}: PortalIncomingPackageCardProps) {
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
          {packag.warehouse_id && warehousesMap?.[Number(packag.warehouse_id)] && (
            <li>
              <strong>Warehouse:</strong> {warehousesMap[Number(packag.warehouse_id)]}
            </li>
          )}
          <li>
            <strong>Registered At:</strong>{" "}
            {new Date(packag.created_at).toLocaleDateString()}
          </li>
        </ul>
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
