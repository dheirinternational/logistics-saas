"use client"

import { PortalIncomingPackageCard } from "@/components/portal/packages/PortalIncomingPackageCard"
import { PortalPackageCard } from "@/components/portal/packages/PortalPackageCard"
import { PortalPackagesPageHeader } from "@/components/portal/packages/PortalPackagesPageHeader"
import { PortalPackagesToolbar } from "@/components/portal/packages/PortalPackagesToolbar"
import { PACKAGE_FILTER_OPTIONS } from "@/lib/portal/packageStatus"
import { PACKAGES_QUICK_LINKS } from "@/lib/portal/packagesNav"
import type { IncomingPackage, Package } from "@/types/entityTypeDef"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"

type TabId = "warehouse" | "incoming"

import { IconChevronRight } from "@tabler/icons-react"

export function PortalPackagesHub() {
  const searchParams = useSearchParams()

  const [packages, setPackages] = useState<Package[]>([])
  const [incoming, setIncoming] = useState<IncomingPackage[]>([])
  const [warehousesMap, setWarehousesMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")

  useEffect(() => {
    const q = searchParams.get("search")?.trim()
    if (q) setSearch(q)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([
      fetch("/api/packages/user", { credentials: "include" }).then((r) =>
        r.json().then((d) => ({ ok: r.ok, ...d })),
      ),
      fetch("/api/incoming-packages/user", { credentials: "include" }).then(
        (r) => r.json().then((d) => ({ ok: r.ok, ...d })),
      ),
      fetch("/api/warehouses", { credentials: "include" }).then((r) =>
        r.json().then((d) => ({ ok: r.ok, ...d })),
      ),
    ])
      .then(([pkgRes, incRes, whRes]) => {
        if (cancelled) return
        if (!pkgRes.ok) toast.error(pkgRes.message ?? "Could not load packages")
        else setPackages(pkgRes.data ?? [])
        if (!incRes.ok) toast.error(incRes.message ?? "Could not load incoming")
        else
          setIncoming(
            (incRes.data ?? []).filter(
              (x: IncomingPackage) => x.status === "expected",
            ),
          )
        if (whRes.ok) {
          const mapping: Record<number, string> = {}
          for (const w of (whRes.data ?? [])) {
            mapping[w.id] = w.name
          }
          setWarehousesMap(mapping)
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load packages")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filterOptions = useMemo(() => {
    return [
      { value: "", label: "All packages", count: packages.length + incoming.length },
      { value: "expected", label: "Not in warehouse yet", count: incoming.length },
      { value: "stored", label: "At warehouse", count: packages.filter((p) => p.status === "stored").length },
      { value: "requested_for", label: "Ready to ship", count: packages.filter((p) => p.status === "requested_for").length },
      { value: "assigned_to_shipment", label: "In shipment", count: packages.filter((p) => p.status === "assigned_to_shipment").length },
      { value: "delivered", label: "Delivered", count: packages.filter((p) => p.status === "delivered").length },
    ]
  }, [packages, incoming])

  const filteredPackages = useMemo(() => {
    return packages.filter((p) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        p.incoming_package_id.toLowerCase().includes(q) ||
        p.package_name.toLowerCase().includes(q)
      const matchesStatus = !status || p.status === status
      return matchesSearch && matchesStatus
    })
  }, [packages, search, status])

  const filteredIncoming = useMemo(() => {
    return incoming.filter((p) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        p.incoming_tracking_number.toLowerCase().includes(q) ||
        p.declared_item_name.toLowerCase().includes(q)
      const matchesStatus = !status || status === "expected"
      return matchesSearch && matchesStatus
    })
  }, [incoming, search, status])

  const showIncoming = status === "" || status === "expected"
  const showStored = status !== "expected"

  const totalResultsCount =
    (showIncoming ? filteredIncoming.length : 0) +
    (showStored ? filteredPackages.length : 0)

  return (
    <div className="portal-packages">
      <PortalPackagesPageHeader
        title="Packages"
        description="Track goods from China to your door. Add tracking, see warehouse status, and request shipment."
        action={
          <Link href="/customer/add_package" className="portal-packages__btn-primary">
            Add package
          </Link>
        }
      />

      <div className="portal-packages__quick-links">
        {PACKAGES_QUICK_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <Link key={link.id} href={link.href} className="portal-packages__quick-link">
              <Icon size={18} stroke={1.5} aria-hidden />
              <span>{link.label}</span>
              <IconChevronRight size={14} stroke={1.5} style={{ opacity: 0.7 }} />
            </Link>
          )
        })}
      </div>

      <div className="portal-packages__capsule-container" role="tablist">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={status === opt.value}
            className={`portal-packages__capsule-pill${status === opt.value ? " is-active" : ""}`}
            onClick={() => setStatus(opt.value)}
          >
            <span>{opt.label}</span>
            <span className="portal-packages__capsule-count">{opt.count}</span>
          </button>
        ))}
      </div>

      <PortalPackagesToolbar
        search={search}
        onSearchChange={setSearch}
        hideStatusFilter={true}
        searchPlaceholder="Search by tracking number or package name…"
      />

      <div className="portal-packages__list">
        {loading ? (
          <div className="portal-packages__loading">
            <DheirLoader color="var(--color-dheir-blue)" size={12} />
          </div>
        ) : totalResultsCount === 0 ? (
          <div className="portal-packages__empty">
            <p>No packages found matching your criteria.</p>
            <Link href="/customer/add_package" className="portal-packages__text-link">
              Add your first package
            </Link>
          </div>
        ) : (
          <>
            {showIncoming &&
              filteredIncoming.map((p) => (
                <PortalIncomingPackageCard
                  key={p.id}
                  packag={p}
                  warehousesMap={warehousesMap}
                />
              ))}
            {showStored &&
              filteredPackages.map((p) => (
                <PortalPackageCard
                  key={p.id}
                  packag={p}
                  warehousesMap={warehousesMap}
                />
              ))}
          </>
        )}
      </div>
    </div>
  )
}
