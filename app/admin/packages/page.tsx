"use client"

import { Table } from "@/components/admin/table/Table"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { DheirSelect } from "@/components/ui/DheirSelect"
import { toast } from "@/lib/ui/toast"
import { usePackageStore } from "@/store/incomingPackagesStore"
import { useEditModalStore } from "@/types/editModalStore"
import { Package, Warehouse } from "@/types/entityTypeDef"
import { PackageStatus } from "@/types/statusTypes"
import { createColumnHelper } from "@tanstack/react-table"
import { IconBox, IconChecks, IconLoader2, IconPackage } from "@tabler/icons-react"
import { NextPage } from "next"
import { useRouter } from "next/navigation"
import { ChangeEvent, useEffect, useMemo, useState } from "react"

type FilterValues = {
  search: string
  status: PackageStatus | ""
  warehouse_id: string
}

const columnHelper = createColumnHelper<Package>()

const Page: NextPage = () => {
  const { trigger, setSelectedPackage: setPackage, setReadOnly, resetReadOnly } = usePackageStore()
  const { setIsModalActive } = useEditModalStore()
  const router = useRouter()

  const [packages, setPackages] = useState<Package[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])

  const [error, setError] = useState<string | null>(null)
  const [filterValues, setFilterValues] = useState<FilterValues>({
    search: "",
    status: "",
    warehouse_id: "",
  })
  const [isDataLoading, setIsDataLoading] = useState(false)

  useEffect(() => {
    const fetchPackages = async () => {
      setIsDataLoading(true)
      try {
        const res = await fetch("/api/packages", { method: "GET", credentials: "include" })
        const result = await res.json()

        if (!res.ok) {
          toast.error(result.message)
          setError(result.message)
          return
        }

        setPackages(result.data ?? [])
      } catch (err) {
        console.error("ERR fetching packages", err)
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchPackages()
  }, [trigger])

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch("/api/warehouses", { credentials: "include" })
        const result = await res.json()
        if (!res.ok) return
        setWarehouses(result.data ?? [])
      } catch {
        // ignore
      }
    }

    fetchWarehouses()
  }, [])

  const filteredData = useMemo(() => {
    return packages
      .filter((pack) => (filterValues.warehouse_id ? pack.warehouse_id?.toString() === filterValues.warehouse_id : true))
      .filter((pack) => (filterValues.status ? pack.status?.toLowerCase() === filterValues.status.toLowerCase() : true))
      .filter((pack) => {
        const q = filterValues.search.trim().toLowerCase()
        if (!q) return true
        return (
          pack.incoming_package_id?.toLowerCase().includes(q) ||
          pack.package_name?.toLowerCase().includes(q) ||
          pack.customer_code?.toLowerCase().includes(q)
        )
      })
  }, [packages, filterValues])

  const stats = useMemo(() => {
    const stored = packages.filter((x) => x.status === "stored").length
    const requested = packages.filter((x) => x.status === "requested_for").length
    const assigned = packages.filter((x) => x.status === "assigned_to_shipment").length
    const delivered = packages.filter((x) => x.status === "delivered").length
    return { stored, requested, assigned, delivered }
  }, [packages])

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.currentTarget
    setFilterValues((prev) => ({ ...prev, [name]: value }))
  }

  const columnDef = [
    columnHelper.accessor("package_name", { header: "Name" }),
    columnHelper.accessor("customer_code", { header: "Customer Code" }),
    columnHelper.accessor("weight", { header: "Weight" }),
    columnHelper.accessor("warehouse_id", { header: "Warehouse" }),
    columnHelper.accessor("status", { header: "Status" }),
    columnHelper.accessor("received_at", {
      header: "Received At",
      cell: ({ getValue }) => <p>{new Date(getValue()).toDateString()}</p>,
    }),
    columnHelper.accessor("stored_at", {
      header: "Stored At",
      cell: ({ getValue }) => <p>{new Date(getValue()).toDateString()}</p>,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          type="button"
          className="portal-home__table-link"
          onClick={() => {
            resetReadOnly()
            setPackage(row.original)
            setIsModalActive()
          }}
        >
          View / edit
        </button>
      ),
    }),
  ]

  const deletePackages = async (rows: Package[]) => {
    const ids = rows.map((row) => String(row.id))
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/packages/${id}`, {
            method: "DELETE",
            credentials: "include",
          })
          const result = await res.json().catch(() => ({ message: "Delete failed" }))
          return { ok: res.ok, id, message: result.message as string }
        })
      )

      const failed = results.filter((x) => !x.ok)
      if (failed.length > 0) {
        const firstError = failed[0]?.message || "Delete failed"
        if (/unauthorized/i.test(firstError)) {
          toast.error("Session expired. Please sign in again.")
          router.push("/auth/login")
          return
        }
        toast.error(failed.length === 1 ? firstError : `Failed to delete ${failed.length} package(s). ${firstError}`)
        return
      }

      setPackages((prev) => prev.filter((item) => !ids.includes(String(item.id))))
      toast.success(`${ids.length} package(s) deleted.`)
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete selected packages.")
    }
  }

  return (
    <div className="portal-home">
      <header className="portal-home__greeting">
        <div>
          <p className="portal-home__greeting-label">Admin</p>
          <h1 className="portal-home__greeting-title">Packages</h1>
          <p className="portal-home__greeting-sub">
            Monitor, filter, and manage all packages from one control deck.
          </p>
        </div>
        <button
          type="button"
          className="portal-home__btn portal-home__btn--primary"
          onClick={() => {
            setReadOnly()
            setPackage({
              id: 0,
              incoming_package_id: "",
              package_name: "",
              user_id: 0,
              customer_code: "",
              warehouse_id: 0,
              weight: 0,
              weight_unit: "kg",
              amount: 0,
              condition: "good",
              status: "stored",
              received_at: "",
              stored_at: "",
              created_at: "",
            })
            setIsModalActive()
          }}
        >
          Add package
        </button>
      </header>

      {isDataLoading ? (
        <div className="portal-home__panel portal-home__loader">
          <DheirLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : (
        <>
          <div className="portal-home__stats" role="list" aria-label="Packages stats">
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconBox size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Stored</span>
                <span className="portal-home__stat-card-value">{stats.stored}</span>
                <span className="portal-home__stat-card-hint">At warehouse</span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconLoader2 size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Requested</span>
                <span className="portal-home__stat-card-value">{stats.requested}</span>
                <span className="portal-home__stat-card-hint">Ready to move</span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconPackage size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Assigned</span>
                <span className="portal-home__stat-card-value">{stats.assigned}</span>
                <span className="portal-home__stat-card-hint">In shipment</span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconChecks size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Delivered</span>
                <span className="portal-home__stat-card-value">{stats.delivered}</span>
                <span className="portal-home__stat-card-hint">Completed</span>
              </span>
            </div>
          </div>

          <section className="portal-home__panel" aria-label="Package filters">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Filters</h2>
                <p className="portal-home__section-sub">
                  Search by package name, identifier, customer code, warehouse, or status.
                </p>
              </div>
            </div>

            <div className="admin-filters">
              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Search</span>
                <input
                  type="text"
                  name="search"
                  className="dheir-input"
                  value={filterValues.search}
                  onChange={handleFilterChange}
                  placeholder="Input package name, id, or customer code"
                />
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Warehouse</span>
                <DheirSelect
                  name="warehouse_id"
                  value={filterValues.warehouse_id}
                  onChange={(e) => setFilterValues((prev) => ({ ...prev, warehouse_id: e.target.value }))}
                >
                  <option value="">All warehouses</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={String(w.id)}>
                      {w.name}
                    </option>
                  ))}
                </DheirSelect>
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Status</span>
                <DheirSelect
                  name="status"
                  value={filterValues.status}
                  onChange={(e) => setFilterValues((prev) => ({ ...prev, status: (e.target.value as PackageStatus) || "" }))}
                >
                  <option value="">All statuses</option>
                  <option value="stored">stored</option>
                  <option value="requested_for">requested_for</option>
                  <option value="assigned_to_shipment">assigned_to_shipment</option>
                  <option value="delivered">delivered</option>
                </DheirSelect>
              </label>
            </div>
          </section>

          <section className="portal-home__panel" aria-labelledby="packages-records-heading">
            <div className="portal-home__panel-head">
              <div>
                <h2 id="packages-records-heading" className="portal-home__section-title">
                  Packages
                </h2>
                <p className="portal-home__section-sub">A live record of all packages in the system.</p>
              </div>
            </div>

            {error ? (
              <div className="portal-home__panel-empty">
                <p className="portal-home__section-sub" style={{ color: "var(--color-dheir-red)" }}>
                  {error}
                </p>
              </div>
            ) : (
              <Table
                importedData={filteredData}
                columnDef={columnDef}
                globalFilter={filterValues.search}
                enableRowSelection
                getRowId={(row) => String(row.id)}
                onDeleteSelected={deletePackages}
              />
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default Page
