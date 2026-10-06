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
  getWarehouseShippingChannel,
} from "@/lib/portal/warehouseAddress"
import type { Warehouse } from "@/types/entityTypeDef"
import { useEffect, useMemo, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"
import { PortalAirWarehouseNoticeModal } from "@/components/portal/warehouse/PortalAirWarehouseNoticeModal"

import { IconAlertCircle, IconCopy } from "@tabler/icons-react"

export default function WarehouseAddressPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [memberCode, setMemberCode] = useState("")
  const [selectedId, setSelectedId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const [airModalOpen, setAirModalOpen] = useState(false)
  const [pendingCopy, setPendingCopy] = useState<{ text: string; label: string } | null>(null)
  const [copiedTrigger, setCopiedTrigger] = useState(0)
  const [hasAcknowledgedAirTerms, setHasAcknowledgedAirTerms] = useState(false)

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
            (w) => w.country === "CN" && !w.name.toLowerCase().includes("foshan")
          )
          list.sort((a, b) => {
            const aIsAir = a.name.toLowerCase().includes("air")
            const bIsAir = b.name.toLowerCase().includes("air")
            if (aIsAir && !bIsAir) return -1
            if (!aIsAir && bIsAir) return 1
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
  const isAir = selected ? getWarehouseShippingChannel(selected) === "Air" : false

  const copyText = useMemo(() => {
    if (!selected || !memberCode) return ""
    return formatWarehouseCopyText(selected, memberCode)
  }, [selected, memberCode])

  const handleCardCopyClick = () => {
    if (isAir && !hasAcknowledgedAirTerms) {
      setPendingCopy({ text: copyText, label: "Warehouse address" })
      setAirModalOpen(true)
    } else {
      navigator.clipboard.writeText(copyText)
      setCopiedTrigger((prev) => prev + 1)
      toast.success("Warehouse address copied")
    }
  }

  const handleCopyField = (label: string, val: string) => {
    if (isAir && !hasAcknowledgedAirTerms) {
      setPendingCopy({ text: val, label })
      setAirModalOpen(true)
    } else {
      navigator.clipboard.writeText(val)
      toast.success(`${label} copied`)
    }
  }

  const handleConfirmAirNotice = async () => {
    if (pendingCopy) {
      try {
        await navigator.clipboard.writeText(pendingCopy.text)
        setHasAcknowledgedAirTerms(true)
        if (pendingCopy.label === "Warehouse address") {
          setCopiedTrigger((prev) => prev + 1)
          toast.success("Air warehouse address copied")
        } else {
          toast.success(`${pendingCopy.label} copied`)
        }
      } catch {
        toast.error("Could not copy address")
      }
    }
    setAirModalOpen(false)
    setPendingCopy(null)
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
        description="Give your supplier this address. Include your shipping method and member code so we can match your goods."
        backHref="/customer"
        backLabel="Home"
      />

      <div 
        className="my-4 p-4 rounded-xl border text-sm" 
        style={{ 
          backgroundColor: "#fef2f2", 
          borderColor: "#fca5a5", 
          color: "#991b1b",
          lineHeight: "1.6"
        }}
      >
        <p style={{ margin: 0, fontWeight: 600 }}>
          Important Shipment Name Notice:
        </p>
        <p style={{ margin: "4px 0 0" }}>
          Please use the shipping method followed by your unique code as the shipment name (example: <strong style={{ fontWeight: 700 }}>Air/{memberCode || "Ronke-DHI0040"}</strong> or <strong style={{ fontWeight: 700 }}>Sea/{memberCode || "Ronke-DHI0040"}</strong>). Goods without shipping method and unique code will be rejected!!!
        </p>
      </div>

      {warehouses.length > 1 ? (
        <div className="portal-packages__form">
          <PortalFormField label="Select warehouse">
            <PortalFormSelect
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value)
                setHasAcknowledgedAirTerms(false)
              }}
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

      {isAir ? (
        <div 
          className="my-3 p-4 rounded-xl border text-sm" 
          style={{ 
            backgroundColor: "#fffbeb", 
            borderColor: "#fde68a", 
            color: "#92400e",
            lineHeight: "1.6"
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <IconAlertCircle size={20} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: "#78350f" }}>
                Important Air Shipping Notice:
              </p>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18, listStyleType: "disc" }}>
                <li>The minimum we accept for air is <strong>1kg</strong>.</li>
                <li>Air shipping is <strong>prepaid</strong>, which means you pay the shipping fee before we ship out the goods.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {selected && copyText ? (
        <PortalHomeWarehouseCard
          warehouseName={selected.name}
          copyText={copyText}
          onCopyClick={handleCardCopyClick}
          copiedTrigger={copiedTrigger}
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

      <PortalAirWarehouseNoticeModal
        isOpen={airModalOpen}
        onClose={() => {
          setAirModalOpen(false)
          setPendingCopy(null)
        }}
        onConfirm={handleConfirmAirNotice}
        copyTargetLabel={pendingCopy?.label}
      />
    </div>
  )
}
