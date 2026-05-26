"use client"

import { PortalHomeWarehouseCard } from "@/components/portal/home/PortalHomeWarehouseCard"
import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import {
  PortalFormField,
  PortalFormSelect,
} from "@/components/portal/packages/PortalFormField"
import { formatWarehouseCopyText } from "@/lib/portal/warehouseAddress"
import type { Warehouse } from "@/types/entityTypeDef"
import { useEffect, useMemo, useState } from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

export default function WarehouseAddressPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [memberCode, setMemberCode] = useState("")
  const [selectedId, setSelectedId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/warehouses", { credentials: "include" }).then((r) =>
        r.json(),
      ),
      fetch("/api/users/my-data", { credentials: "include" }).then((r) =>
        r.json(),
      ),
    ])
      .then(([whRes, userRes]) => {
        if (whRes.data?.length) {
          const list = whRes.data as Warehouse[]
          setWarehouses(list)
          const cn =
            list.find((w) => w.country === "CN") ?? list[0]
          setSelectedId(String(cn.id))
        }
        if (userRes.data?.code) setMemberCode(userRes.data.code)
      })
      .catch(() => toast.error("Could not load warehouse details"))
      .finally(() => setLoading(false))
  }, [])

  const selected = warehouses.find((w) => String(w.id) === selectedId)

  const copyText = useMemo(() => {
    if (!selected || !memberCode) return ""
    return formatWarehouseCopyText(selected, memberCode)
  }, [selected, memberCode])

  if (loading) {
    return (
      <div className="portal-packages portal-packages__loading">
        <BeatLoader color="var(--color-dheir-blue)" size={12} />
      </div>
    )
  }

  return (
    <div className="portal-packages">
      <PortalPackagesPageHeader
        title="Warehouse address"
        description="Give your supplier this address. Include your member code so we can match your goods."
      />

      {warehouses.length > 1 ? (
        <div className="portal-packages__form">
          <PortalFormField label="Select warehouse">
            <PortalFormSelect
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </PortalFormSelect>
          </PortalFormField>
        </div>
      ) : null}

      {selected && copyText ? (
        <PortalHomeWarehouseCard
          warehouseName={selected.name}
          copyText={copyText}
        />
      ) : (
        <div className="portal-packages__empty">
          <p>No warehouse configured yet. Contact support.</p>
        </div>
      )}

      {selected ? (
        <div className="portal-packages__detail-grid">
          <div className="portal-packages__detail-row">
            <span className="portal-packages__detail-label">Recipient</span>
            <span>{selected.name.split("(")[0]?.trim() || selected.name}</span>
          </div>
          <div className="portal-packages__detail-row">
            <span className="portal-packages__detail-label">Phone</span>
            <span>{selected.phone || "—"}</span>
          </div>
          <div className="portal-packages__detail-row">
            <span className="portal-packages__detail-label">Postal code</span>
            <span>{selected.postal_code || "—"}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
