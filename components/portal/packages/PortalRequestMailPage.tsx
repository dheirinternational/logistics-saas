"use client"

import { PortalRequestMailConfirmDialog } from "@/components/portal/packages/PortalRequestMailConfirmDialog"
import { PortalRequestMailPackageRow } from "@/components/portal/packages/PortalRequestMailPackageRow"
import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import { PortalPackagesToolbar } from "@/components/portal/packages/PortalPackagesToolbar"
import { PortalPolicyInfoButton } from "@/components/portal/PortalPolicyInfoButton"
import { LOGISTICS_SHIPPING_POLICY } from "@/lib/portal/customerPolicies"
import type { Package, ShippingRequest } from "@/types/entityTypeDef"
import { IconPlane, IconShip, IconTruck } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"
import {
  formatShippingQuantity,
  getShippingQuantityFieldLabel,
} from "@/lib/shipping/channelUnits"

const SHIPPING_CHANNELS = [
  { id: "air" as const, label: "Air", icon: IconPlane },
  { id: "sea" as const, label: "Sea", icon: IconShip },
  { id: "express" as const, label: "Express", icon: IconTruck },
]

const PAYMENT_OPTIONS = [
  { id: "pay_before_shipment" as const, label: "Pay before shipment" },
  { id: "pay_after_shipment" as const, label: "Pay after shipment" },
]

export function PortalRequestMailPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [pendingRequests, setPendingRequests] = useState<ShippingRequest[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState("")
  const [shippingMethod, setShippingMethod] = useState<"air" | "sea" | "express">("air")
  const [shippingPayment, setShippingPayment] = useState<
    "pay_before_shipment" | "pay_after_shipment"
  >("pay_before_shipment")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const [pkgRes, reqRes] = await Promise.all([
        fetch("/api/packages/user", { credentials: "include" }),
        fetch("/api/shipment-requests/user", { credentials: "include" }),
      ])
      const pkgResult = await pkgRes.json()
      const reqResult = await reqRes.json()

      if (!pkgRes.ok) {
        toast.error(pkgResult.message)
        return
      }

      setPackages(pkgResult.data ?? [])
      if (reqRes.ok && Array.isArray(reqResult.data)) {
        setPendingRequests(reqResult.data.filter((r: ShippingRequest) => r.status === "pending"))
      }
      setSelectedIds(new Set())
    } catch (err) {
      console.error(err)
      toast.error("Could not load packages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const storedPackages = useMemo(() => {
    const q = search.trim().toLowerCase()
    return packages
      .filter((p) => p.status === "stored")
      .filter(
        (p) =>
          !q ||
          p.incoming_package_id.toLowerCase().includes(q) ||
          p.package_name.toLowerCase().includes(q),
      )
  }, [packages, search])

  const pendingPackages = useMemo(() => {
    return packages.filter((p) => p.status === "requested_for")
  }, [packages])

  const selectedPackages = useMemo(
    () => packages.filter((p) => selectedIds.has(p.id)),
    [packages, selectedIds],
  )

  const totalWeight = useMemo(
    () => selectedPackages.reduce((acc, p) => acc + Number(p.weight || 0), 0),
    [selectedPackages],
  )

  const togglePackage = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCancelPendingRequest = async (requestId: string) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/shipment-requests/${requestId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || "Failed to cancel request")
      toast.success("Shipment request cancelled. Packages returned to storage.")
      await fetchPackages()
    } catch (err: any) {
      toast.error(err.message || "Could not cancel request")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitRequest = async (packagingOption: string, customerNote: string) => {
    if (selectedPackages.length === 0) return

    setSubmitting(true)
    try {
      const totalWeightUnit = shippingMethod === "sea" ? "cbm" : "kg"

      const res = await fetch("/api/shipment-requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_ids: selectedPackages.map((p) => p.id),
          user_id: selectedPackages[0].user_id,
          customer_code: selectedPackages[0].customer_code,
          channel: shippingMethod,
          payment_time: shippingPayment,
          total_weight: totalWeight,
          total_weight_unit: totalWeightUnit,
          customer_note: customerNote,
          packaging: packagingOption,
        }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.message)
        return
      }

      toast.success("Shipment request submitted")
      setConfirmOpen(false)
      await fetchPackages()
    } catch (err) {
      console.error(err)
      toast.error("Could not submit shipment request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="portal-packages portal-request-mail">
      <PortalPackagesPageHeader
        title="Ship my packages"
        description="Select stored packages in our warehouse, choose how you want them shipped, and submit a release request."
        backHref="/customer/packages"
        backLabel="Packages"
      />

      <section className="portal-account__card portal-request-mail__options">
        <PortalPackagesToolbar
          search={search}
          onSearchChange={setSearch}
          hideStatusFilter
          searchPlaceholder="Search tracking or package name…"
        />

        <div className="portal-request-mail__summary">
          <p className="portal-request-mail__summary-stat">
            <span>Selected</span>
            <strong>{selectedPackages.length}</strong>
          </p>
          <p className="portal-request-mail__summary-stat">
            <span>{getShippingQuantityFieldLabel(shippingMethod)}</span>
            <strong>
              {formatShippingQuantity(totalWeight, shippingMethod, {
                decimals: 2,
              })}
            </strong>
          </p>
        </div>

        <div>
          <p className="portal-request-mail__label portal-request-mail__label-row">
            Shipping method
            <PortalPolicyInfoButton
              policy={LOGISTICS_SHIPPING_POLICY}
              label="Shipping and waybill policy"
            />
          </p>
          <div className="portal-request-mail__channels" role="tablist">
            {SHIPPING_CHANNELS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={shippingMethod === id}
                className={`portal-request-mail__channel${shippingMethod === id ? " is-active" : ""}`}
                onClick={() => {
                  setShippingMethod(id)
                  if (id === "air" || id === "express") {
                    setShippingPayment("pay_before_shipment")
                  }
                }}
              >
                <Icon size={18} stroke={1.5} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="portal-request-mail__label">
            Payment timing
            {(shippingMethod === "air" || shippingMethod === "express") && (
              <span style={{ marginLeft: "8px", fontSize: "11px", color: "var(--color-dheir-orange)", fontWeight: 500 }}>
                {shippingMethod === "express"
                  ? "(Express shipping is strictly prepaid)"
                  : "(Air & Express shipping are strictly prepaid)"}
              </span>
            )}
          </p>
          <div className="portal-request-mail__chips">
            {PAYMENT_OPTIONS.map((opt) => {
              const isStrictPrepaidChannel = shippingMethod === "air" || shippingMethod === "express"
              const disabled = isStrictPrepaidChannel && opt.id === "pay_after_shipment"
              const channelLabel = shippingMethod === "express" ? "Express" : "Air"
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  title={disabled ? `${channelLabel} shipping is strictly prepaid before departure` : undefined}
                  className={`portal-request-mail__chip${shippingPayment === opt.id ? " is-active" : ""}`}
                  style={disabled ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                  onClick={() => {
                    if (disabled) {
                      toast.info(`${channelLabel} shipping is strictly prepaid before departure from China.`)
                      return
                    }
                    setShippingPayment(opt.id)
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="portal-request-mail__list" aria-label="Stored packages">
        {loading ? (
          <div className="portal-packages__empty portal-request-mail__loading">
            <DHEIRLoader color="var(--color-dheir-blue)" size={10} />
          </div>
        ) : storedPackages.length === 0 ? (
          <div className="portal-packages__empty" style={{ padding: "32px 16px" }}>
            {pendingPackages.length > 0 ? (
              <>
                <p style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-dheir-ink)", margin: "0 0 8px" }}>
                  You have {pendingPackages.length} package(s) already requested for shipment.
                </p>
                <p className="portal-request-mail__empty-hint" style={{ maxWidth: "520px", margin: "0 auto 20px" }}>
                  These packages are currently in &quot;Ready to ship&quot; status waiting for warehouse review. If you need to change your shipping method or re-request them, you can cancel the pending request below to return them to storage.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/customer/waiting_to_be_released" className="portal-packages__btn-secondary">
                    View shipment requests
                  </Link>
                  {pendingRequests.map((req) => (
                    <button
                      key={req.id}
                      type="button"
                      disabled={submitting}
                      onClick={() => handleCancelPendingRequest(req.id)}
                      className="portal-packages__btn-primary"
                    >
                      Cancel request #{req.id} &amp; ship again
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p>No stored packages ready to ship.</p>
                <p className="portal-request-mail__empty-hint">
                  Packages must be in warehouse storage before you can request shipment.{" "}
                  <Link href="/customer/packages" className="portal-cart__link">
                    View packages
                  </Link>
                </p>
              </>
            )}
          </div>
        ) : (
          storedPackages.map((packag) => (
            <PortalRequestMailPackageRow
              key={packag.id}
              packag={packag}
              selected={selectedIds.has(packag.id)}
              onToggle={() => togglePackage(packag.id)}
            />
          ))
        )}
      </section>

      <button
        type="button"
        className="portal-packages__btn-primary portal-packages__btn-primary--block"
        style={selectedPackages.length === 0 ? { opacity: 0.65 } : undefined}
        disabled={submitting}
        onClick={() => {
          if (submitting) return
          if (storedPackages.length === 0) {
            if (pendingPackages.length > 0) {
              toast.info("All your stored packages have already been submitted for shipment.")
            } else {
              toast.info("No stored packages available. Packages must arrive at warehouse first.")
            }
            return
          }
          if (selectedPackages.length === 0) {
            toast.error("Please click on at least one package in the list above to select it.")
            return
          }
          if ((shippingMethod === "air" || shippingMethod === "express") && shippingPayment === "pay_after_shipment") {
            setShippingPayment("pay_before_shipment")
          }
          setConfirmOpen(true)
        }}
      >
        Request shipment
      </button>

      <PortalRequestMailConfirmDialog
        open={confirmOpen}
        submitting={submitting}
        shippingMethod={shippingMethod}
        onClose={() => setConfirmOpen(false)}
        onSubmit={handleSubmitRequest}
      />
    </div>
  )
}
