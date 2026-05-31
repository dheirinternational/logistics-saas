"use client"

import { PortalRequestMailConfirmDialog } from "@/components/portal/packages/PortalRequestMailConfirmDialog"
import { PortalRequestMailPackageRow } from "@/components/portal/packages/PortalRequestMailPackageRow"
import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import { PortalPackagesToolbar } from "@/components/portal/packages/PortalPackagesToolbar"
import { PortalPolicyInfoButton } from "@/components/portal/PortalPolicyInfoButton"
import { LOGISTICS_SHIPPING_POLICY } from "@/lib/portal/customerPolicies"
import type { Package } from "@/types/entityTypeDef"
import { IconPlane, IconShip, IconTruck } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
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
      const res = await fetch("/api/packages/user", { credentials: "include" })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message)
        return
      }
      setPackages(result.data ?? [])
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
                onClick={() => setShippingMethod(id)}
              >
                <Icon size={18} stroke={1.5} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="portal-request-mail__label">Payment timing</p>
          <div className="portal-request-mail__chips">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`portal-request-mail__chip${shippingPayment === opt.id ? " is-active" : ""}`}
                onClick={() => setShippingPayment(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="portal-request-mail__list" aria-label="Stored packages">
        {loading ? (
          <div className="portal-packages__empty portal-request-mail__loading">
            <DheirLoader color="var(--color-dheir-blue)" size={10} />
          </div>
        ) : storedPackages.length === 0 ? (
          <div className="portal-packages__empty">
            <p>No stored packages ready to ship.</p>
            <p className="portal-request-mail__empty-hint">
              Packages must be in warehouse storage before you can request shipment.{" "}
              <Link href="/customer/packages" className="portal-cart__link">
                View packages
              </Link>
            </p>
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
        disabled={selectedPackages.length === 0 || submitting}
        onClick={() => {
          if (selectedPackages.length === 0) {
            toast.error("Select at least one package")
            return
          }
          setConfirmOpen(true)
        }}
      >
        Request shipment
      </button>

      <PortalRequestMailConfirmDialog
        open={confirmOpen}
        submitting={submitting}
        onClose={() => setConfirmOpen(false)}
        onSubmit={handleSubmitRequest}
      />
    </div>
  )
}
