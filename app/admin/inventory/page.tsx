"use client"

import { useEffect, useMemo, useState } from "react"
import { NextPage } from "next"
import { createColumnHelper } from "@tanstack/react-table"
import { IconBox, IconBuildingWarehouse, IconClock, IconScale } from "@tabler/icons-react"
import { Table } from "@/components/admin/table/Table"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { DHEIRSelect } from "@/components/ui/DHEIRSelect"
import { toast } from "@/lib/ui/toast"
import { usePackageStore } from "@/store/incomingPackagesStore"
import { useEditModalStore } from "@/types/editModalStore"
import type { Warehouse } from "@/types/entityTypeDef"

type InventoryItem = {
  id: number
  incoming_package_id: string
  package_name: string
  user_id: number
  customer_code: string
  warehouse_id: number
  warehouse_name?: string
  weight: number
  weight_unit: string
  amount: number
  condition: "good" | "damaged"
  status: string
  received_at: string
  stored_at: string
  created_at: string
}

type FilterValues = {
  search: string
  warehouse_id: string
  status: string
  age: string
}

const columnHelper = createColumnHelper<InventoryItem>()

function calculateStorageDays(item: InventoryItem): number {
  const dateStr = item.stored_at || item.created_at
  if (!dateStr) return 0
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

const InventoryPage: NextPage = () => {
  const { setSelectedPackage, resetReadOnly, trigger } = usePackageStore()
  const { setIsModalActive } = useEditModalStore()

  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  const [filterValues, setFilterValues] = useState<FilterValues>({
    search: "",
    warehouse_id: "",
    status: "",
    age: "",
  })

  useEffect(() => {
    let cancelled = false
    setIsDataLoading(true)

    Promise.all([
      fetch("/api/admin/inventory", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/warehouses", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([invRes, whRes]) => {
        if (cancelled) return
        if (invRes.success) {
          setInventory(invRes.data ?? [])
        } else {
          toast.error(invRes.message ?? "Could not load inventory")
        }
        if (whRes.success) {
          setWarehouses(whRes.data ?? [])
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load inventory data", err)
          toast.error("Failed to load inventory records")
        }
      })
      .finally(() => {
        if (!cancelled) setIsDataLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [trigger])

  const filteredData = useMemo(() => {
    return inventory.filter((item) => {
      // Warehouse Filter
      if (filterValues.warehouse_id && String(item.warehouse_id) !== filterValues.warehouse_id) {
        return false
      }

      // Status Filter
      if (filterValues.status && item.status.toLowerCase() !== filterValues.status.toLowerCase()) {
        return false
      }

      // Age Filter
      const days = calculateStorageDays(item)
      if (filterValues.age === "new" && days >= 7) return false
      if (filterValues.age === "7_14" && (days < 7 || days > 14)) return false
      if (filterValues.age === "over_14" && days <= 14) return false
      if (filterValues.age === "over_30" && days <= 30) return false

      // Search Filter
      const q = filterValues.search.trim().toLowerCase()
      if (q) {
        const matchesName = item.package_name?.toLowerCase().includes(q)
        const matchesTracking = item.incoming_package_id?.toLowerCase().includes(q)
        const matchesCode = item.customer_code?.toLowerCase().includes(q)
        const matchesWh = item.warehouse_name?.toLowerCase().includes(q)
        if (!matchesName && !matchesTracking && !matchesCode && !matchesWh) return false
      }

      return true
    })
  }, [inventory, filterValues])

  // Summary Statistics
  const stats = useMemo(() => {
    const totalStored = inventory.filter((x) => x.status === "stored").length
    const totalWeightKg = inventory
      .filter((x) => x.status === "stored")
      .reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
    const agingOver14 = inventory.filter((x) => x.status === "stored" && calculateStorageDays(x) > 14).length
    const activeHubsCount = warehouses.length

    return {
      totalStored,
      totalWeightKg: totalWeightKg.toFixed(2),
      agingOver14,
      activeHubsCount,
    }
  }, [inventory, warehouses])

  const columnDef = [
    columnHelper.accessor("package_name", {
      header: "Item Name",
      cell: ({ getValue }) => (
        <span className="font-medium text-dheir-ink">{getValue() || "Unnamed Item"}</span>
      ),
    }),
    columnHelper.accessor("incoming_package_id", {
      header: "Tracking ID",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-semibold text-dheir-blue select-all">
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("customer_code", {
      header: "Customer Code",
      cell: ({ getValue }) => (
        <span className="font-semibold text-dheir-ink">{getValue()}</span>
      ),
    }),
    columnHelper.accessor("warehouse_name", {
      header: "Warehouse",
      cell: ({ getValue, row }) => getValue() || `Warehouse ID: ${row.original.warehouse_id}`,
    }),
    columnHelper.accessor("amount", {
      header: "Quantity",
      cell: ({ getValue }) => `${getValue()} ${Number(getValue()) === 1 ? "pc" : "pcs"}`,
    }),
    columnHelper.accessor("weight", {
      header: "Weight",
      cell: ({ getValue, row }) => `${getValue()} ${row.original.weight_unit || "kg"}`,
    }),
    columnHelper.accessor("condition", {
      header: "Condition",
      cell: ({ getValue }) => {
        const cond = getValue()
        const isGood = cond === "good"
        return (
          <span
            className={`portal-packages__badge ${
              isGood ? "portal-packages__badge--green" : "portal-packages__badge--orange"
            }`}
          >
            {cond}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: "storage_days",
      header: "Storage Age",
      cell: ({ row }) => {
        const days = calculateStorageDays(row.original)
        const isAging = days > 14
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              isAging ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-800"
            }`}
          >
            {days} {days === 1 ? "day" : "days"}
          </span>
        )
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => {
        const s = getValue()
        let className = "portal-packages__badge"
        if (s === "stored") className = "portal-packages__badge portal-packages__badge--green"
        else if (s === "requested_for") className = "portal-packages__badge portal-packages__badge--orange"
        else if (s === "assigned_to_shipment") className = "portal-packages__badge portal-packages__badge--blue"
        return <span className={className}>{s}</span>
      },
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
            setSelectedPackage(row.original as any)
            setIsModalActive()
          }}
        >
          View details
        </button>
      ),
    }),
  ]

  const deleteInventoryItems = async (rows: InventoryItem[]) => {
    const ids = rows.map((row) => String(row.id))
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/packages/${id}`, {
            method: "DELETE",
            credentials: "include",
          })
          return { ok: res.ok, id }
        })
      )

      const failed = results.filter((x) => !x.ok)
      if (failed.length > 0) {
        toast.error(`Failed to delete ${failed.length} inventory item(s).`)
        return
      }

      setInventory((prev) => prev.filter((item) => !ids.includes(String(item.id))))
      toast.success(`${ids.length} inventory item(s) deleted.`)
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete selected inventory items.")
    }
  }

  return (
    <div className="portal-home">
      {/* Header matching exact admin greeting styling */}
      <header className="portal-home__greeting">
        <div>
          <p className="portal-home__greeting-label">Admin</p>
          <h1 className="portal-home__greeting-title">Warehouse Inventory</h1>
          <p className="portal-home__greeting-sub">
            Monitor physical stock, warehouse capacity, and aging package holdings.
          </p>
        </div>
      </header>

      {isDataLoading ? (
        <div className="portal-home__panel portal-home__loader">
          <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : (
        <>
          {/* Stat Cards Grid matching exact admin overview styling */}
          <div className="portal-home__stats" role="list" aria-label="Inventory stats">
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconBox size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Stored Packages</span>
                <span className="portal-home__stat-card-value">{stats.totalStored}</span>
                <span className="portal-home__stat-card-hint">In warehouse stock</span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconScale size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Gross Stored Weight</span>
                <span className="portal-home__stat-card-value">{stats.totalWeightKg} KG</span>
                <span className="portal-home__stat-card-hint">Total stored cargo</span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconClock size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Aging Cargo</span>
                <span className="portal-home__stat-card-value">{stats.agingOver14}</span>
                <span className="portal-home__stat-card-hint">Stored over 14 days</span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconBuildingWarehouse size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Active Hubs</span>
                <span className="portal-home__stat-card-value">{stats.activeHubsCount}</span>
                <span className="portal-home__stat-card-hint">Origin and destination</span>
              </span>
            </div>
          </div>

          {/* Filters section matching exact admin packages styling */}
          <section className="portal-home__panel" aria-label="Inventory filters">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Filters</h2>
                <p className="portal-home__section-sub">
                  Filter inventory by warehouse, status, storage age, or item tracking code.
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
                  onChange={(e) => setFilterValues((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Item name, tracking ID, customer code"
                />
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Warehouse</span>
                <DHEIRSelect
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
                </DHEIRSelect>
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Storage Age</span>
                <DHEIRSelect
                  name="age"
                  value={filterValues.age}
                  onChange={(e) => setFilterValues((prev) => ({ ...prev, age: e.target.value }))}
                >
                  <option value="">All storage ages</option>
                  <option value="new">Under 7 days</option>
                  <option value="7_14">7 to 14 days</option>
                  <option value="over_14">Over 14 days</option>
                  <option value="over_30">Over 30 days</option>
                </DHEIRSelect>
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Status</span>
                <DHEIRSelect
                  name="status"
                  value={filterValues.status}
                  onChange={(e) => setFilterValues((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All statuses</option>
                  <option value="stored">Stored</option>
                  <option value="requested_for">Release requested</option>
                  <option value="assigned_to_shipment">Assigned to shipment</option>
                  <option value="delivered">Delivered</option>
                </DHEIRSelect>
              </label>
            </div>
          </section>

          {/* Table section matching exact admin table styling */}
          <section className="portal-home__panel" aria-labelledby="inventory-records-heading">
            <div className="portal-home__panel-head">
              <div>
                <h2 id="inventory-records-heading" className="portal-home__section-title">
                  Inventory Records
                </h2>
                <p className="portal-home__section-sub">
                  Live stock records of customer packages currently held in D_HEIR warehouses.
                </p>
              </div>
            </div>

            <Table
              importedData={filteredData}
              columnDef={columnDef}
              globalFilter={filterValues.search}
              pageSize={15}
              enableRowSelection
              getRowId={(row) => String(row.id)}
              onDeleteSelected={deleteInventoryItems}
            />
          </section>
        </>
      )}
    </div>
  )
}

export default InventoryPage
