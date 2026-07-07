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

export function PortalPackagesHub() {
  const searchParams = useSearchParams()
  const initialTab =
    searchParams.get("tab") === "incoming" ? "incoming" : "warehouse"

  const [tab, setTab] = useState<TabId>(initialTab)
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

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { "": packages.length }
    for (const p of packages) {
      counts[p.status] = (counts[p.status] ?? 0) + 1
    }
    return counts
  }, [packages])

  const filteredPackages = packages.filter((p) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      p.incoming_package_id.toLowerCase().includes(q) ||
      p.package_name.toLowerCase().includes(q)
    const matchesStatus = !status || p.status === status
    return matchesSearch && matchesStatus
  })

  const filteredIncoming = incoming.filter((p) => {
    const q = search.toLowerCase()
    return (
      !q ||
      p.incoming_tracking_number.toLowerCase().includes(q) ||
      p.declared_item_name.toLowerCase().includes(q)
    )
  })

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
            </Link>
          )
        })}
      </div>

      <div className="portal-packages__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "warehouse"}
          className={`portal-packages__tab${tab === "warehouse" ? " is-active" : ""}`}
          onClick={() => setTab("warehouse")}
        >
          At warehouse
          <span className="portal-packages__tab-count">{packages.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "incoming"}
          className={`portal-packages__tab${tab === "incoming" ? " is-active" : ""}`}
          onClick={() => setTab("incoming")}
        >
          On the way
          <span className="portal-packages__tab-count">{incoming.length}</span>
        </button>
      </div>

      {tab === "warehouse" ? (
        <div className="portal-packages__pipeline" role="list">
          {PACKAGE_FILTER_OPTIONS.map((opt) => {
            const count =
              opt.value === ""
                ? packages.length
                : (statusCounts[opt.value] ?? 0)
            return (
              <button
                key={opt.value || "all"}
                type="button"
                role="listitem"
                className={`portal-packages__pipeline-chip${status === opt.value ? " is-active" : ""}`}
                onClick={() => setStatus(opt.value)}
              >
                <span className="portal-packages__pipeline-value">{count}</span>
                <span className="portal-packages__pipeline-label">{opt.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}

      <PortalPackagesToolbar
        search={search}
        onSearchChange={setSearch}
        status={tab === "warehouse" ? status : ""}
        onStatusChange={setStatus}
        statusOptions={
          tab === "warehouse"
            ? PACKAGE_FILTER_OPTIONS
            : [{ value: "", label: "On the way" }]
        }
        searchPlaceholder={
          tab === "warehouse"
            ? "Search tracking or package name…"
            : "Search tracking or item name…"
        }
      />

      <div className="portal-packages__list">
        {loading ? (
          <div className="portal-packages__loading">
            <DheirLoader color="var(--color-dheir-blue)" size={12} />
          </div>
        ) : tab === "warehouse" ? (
          filteredPackages.length === 0 ? (
            <div className="portal-packages__empty">
              <p>No packages match your filters.</p>
              <Link href="/customer/add_package" className="portal-packages__text-link">
                Add your first incoming package
              </Link>
            </div>
          ) : (
            filteredPackages.map((p) => (
              <PortalPackageCard
                key={p.id}
                packag={p}
                warehousesMap={warehousesMap}
              />
            ))
          )
        ) : filteredIncoming.length === 0 ? (
          <div className="portal-packages__empty">
            <p>No packages on the way right now.</p>
            <Link href="/customer/add_package" className="portal-packages__text-link">
              Register expected tracking
            </Link>
          </div>
        ) : (
          filteredIncoming.map((p) => (
            <PortalIncomingPackageCard
              key={p.id}
              packag={p}
              warehousesMap={warehousesMap}
            />
          ))
        )}
      </div>
    </div>
  )
}
