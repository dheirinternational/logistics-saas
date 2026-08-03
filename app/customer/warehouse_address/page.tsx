"use client"

import { PortalHomeWarehouseCard } from "@/components/portal/home/PortalHomeWarehouseCard"
import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import {
  PortalFormField,
  PortalFormSelect,
} from "@/components/portal/packages/PortalFormField"
import {
  formatWarehouseCopyText,
  getWarehouseAddressDetails,
} from "@/lib/portal/warehouseAddress"
import type { Warehouse } from "@/types/entityTypeDef"
import { useEffect, useMemo, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"

import { IconCopy } from "@tabler/icons-react"

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
          const list = (whRes.data as Warehouse[]).filter(
            (w) => !w.name.toLowerCase().includes("foshan")
          )
          list.sort((a, b) => {
            const aIsGz = a.name.toLowerCase().includes("guangzhou")
            const bIsGz = b.name.toLowerCase().includes("guangzhou")
            if (aIsGz && !bIsGz) return -1
            if (!aIsGz && bIsGz) return 1
            return 0
          })
          setWarehouses(list)
          if (list.length > 0) {
            setSelectedId(String(list[0].id))
          }
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

  const handleCopyField = (label: string, val: string) => {
    navigator.clipboard.writeText(val)
    toast.success(`${label} copied`)
  }

  if (loading) {
    return (
      <div className="portal-packages portal-packages__loading">
        <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
      </div>
    )
  }

  return (
    <div className="portal-packages">
      <PortalPackagesPageHeader
        title="Warehouse address"
        description="Give your supplier this address. Include your member code so we can match your goods."
        backHref="/customer"
        backLabel="Home"
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

      {selected && memberCode ? (
        <section className="portal-packages__detail-grid" aria-labelledby="warehouse-breakdown-heading">
          <h2 id="warehouse-breakdown-heading" className="portal-packages__detail-heading">
            Address breakdown
          </h2>
          {getWarehouseAddressDetails(selected, memberCode).map((row) => (
            <div
              key={row.label}
              className="portal-packages__detail-row"
              style={{ alignItems: "center", minHeight: 40, flexWrap: "nowrap", gap: 16 }}
            >
              <span className="portal-packages__detail-label" style={{ flexShrink: 0 }}>{row.label}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                <span className="font-mono text-sm select-all" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.value}
                </span>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 4,
                    color: "var(--color-dheir-blue)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  onClick={() => handleCopyField(row.label, row.value)}
                  title={`Copy ${row.label}`}
                >
                  <IconCopy size={16} stroke={1.5} />
                </button>
              </span>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  )
}
