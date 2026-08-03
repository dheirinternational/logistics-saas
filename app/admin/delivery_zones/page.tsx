"use client"

import {
  EditDeliveryZoneModal,
  type DeliveryZoneRow,
} from "@/components/admin/delivery_zones/EditDeliveryZoneModal"
import SearchComponent from "@/components/admin/delivery_zones/SearchComponent"
import { Table } from "@/components/admin/table/Table"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"
import { createColumnHelper } from "@tanstack/react-table"
import { IconArrowDown, IconArrowUp, IconCalculator, IconMapPin } from "@tabler/icons-react"
import { useCallback, useEffect, useMemo, useState } from "react"

type FilterParams = {
  search: string
}

const columnHelper = createColumnHelper<DeliveryZoneRow>()

const formatNaira = (value: number) => `₦ ${value.toLocaleString("en-NG")}`

export default function Page() {
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deliveryLocations, setDeliveryLocations] = useState<DeliveryZoneRow[]>([])
  const [filterValues, setFilterValues] = useState<FilterParams>({ search: "" })
  const [editingZone, setEditingZone] = useState<DeliveryZoneRow | null>(null)

  const fetchDeliveryLocations = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsDataLoading(true)
    }

    try {
      const res = await fetch("/api/delivery-zones", {
        method: "GET",
        credentials: "include",
      })
      const response = await res.json()

      if (!res.ok) {
        toast.error(response.message)
        setError(response.message ?? "Failed to fetch delivery zones")
        return
      }

      setDeliveryLocations(response.data ?? [])
      setError(null)
    } catch (err) {
      console.error("ERR:: Fetching Delivery Locations", err)
      if (!options?.silent) {
        toast.error("Could not load delivery zones")
      }
      setError("Failed to fetch delivery zones")
    } finally {
      if (!options?.silent) {
        setIsDataLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchDeliveryLocations()
  }, [fetchDeliveryLocations])

  const filteredData = useMemo(() => {
    const q = filterValues.search.trim().toLowerCase()
    if (!q) return deliveryLocations

    return deliveryLocations.filter((zone) => zone.state_name?.toLowerCase().includes(q))
  }, [deliveryLocations, filterValues.search])

  const stats = useMemo(() => {
    const total = deliveryLocations.length
    const prices = deliveryLocations.map((zone) => Number(zone.price) || 0)
    const average = total > 0 ? Math.round(prices.reduce((sum, price) => sum + price, 0) / total) : 0
    const highest = prices.length > 0 ? Math.max(...prices) : 0
    const lowest = prices.length > 0 ? Math.min(...prices) : 0

    return { total, average, highest, lowest }
  }, [deliveryLocations])

  const columnDef = useMemo(
    () => [
      columnHelper.accessor("state_name", {
        header: "State",
      }),
      columnHelper.accessor("price", {
        header: "Delivery fee",
        cell: ({ getValue, row }) => (
          <div className="admin-inline-price">
            <span className="admin-inline-price__currency">₦</span>
            <input
              type="number"
              value={getValue()}
              disabled
              readOnly
              className="dheir-input admin-inline-price__input"
              aria-label={`Delivery fee for ${row.original.state_name}`}
            />
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            type="button"
            className="portal-home__table-link"
            onClick={() => setEditingZone(row.original)}
          >
            Edit
          </button>
        ),
      }),
    ],
    []
  )

  return (
    <div className="portal-home">
      <header className="portal-home__greeting">
        <div>
          <p className="portal-home__greeting-label">Admin</p>
          <h1 className="portal-home__greeting-title">Delivery zones</h1>
          <p className="portal-home__greeting-sub">
            Manage delivery fees for every state from one control deck.
          </p>
        </div>
      </header>

      {isDataLoading ? (
        <div className="portal-home__panel portal-home__loader">
          <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : (
        <>
          <div className="portal-home__stats" role="list" aria-label="Delivery zone stats">
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconMapPin size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Total</span>
                <span className="portal-home__stat-card-value">{stats.total}</span>
                <span className="portal-home__stat-card-hint">All states</span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconCalculator size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Average</span>
                <span className="portal-home__stat-card-value">{formatNaira(stats.average)}</span>
                <span className="portal-home__stat-card-hint">Mean delivery fee</span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconArrowUp size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Highest</span>
                <span className="portal-home__stat-card-value">{formatNaira(stats.highest)}</span>
                <span className="portal-home__stat-card-hint">Top delivery fee</span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconArrowDown size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Lowest</span>
                <span className="portal-home__stat-card-value">{formatNaira(stats.lowest)}</span>
                <span className="portal-home__stat-card-hint">Minimum delivery fee</span>
              </span>
            </div>
          </div>

          <section className="portal-home__panel" aria-label="Delivery zone filters">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Filters</h2>
                <p className="portal-home__section-sub">Search by state name.</p>
              </div>
            </div>
            <SearchComponent filter={filterValues} setFilter={setFilterValues} />
          </section>

          <section className="portal-home__panel" aria-labelledby="delivery-zones-records-heading">
            <div className="portal-home__panel-head">
              <div>
                <h2 id="delivery-zones-records-heading" className="portal-home__section-title">
                  Delivery zones
                </h2>
                <p className="portal-home__section-sub">
                  A record of all delivery zones in the system.
                </p>
              </div>
            </div>

            {error ? (
              <div className="portal-home__panel-empty">
                <p className="portal-home__section-sub" style={{ color: "var(--color-dheir-red)" }}>
                  {error}
                </p>
              </div>
            ) : filteredData.length < 1 ? (
              <div className="portal-home__panel-empty">
                <p className="portal-home__empty">No delivery zones found.</p>
              </div>
            ) : (
              <Table
                importedData={filteredData}
                columnDef={columnDef}
                globalFilter={filterValues.search}
                getRowId={(row) => String(row.id)}
              />
            )}
          </section>
        </>
      )}

      {editingZone ? (
        <EditDeliveryZoneModal
          key={editingZone.id}
          zone={editingZone}
          onClose={() => setEditingZone(null)}
          onSaved={() => fetchDeliveryLocations({ silent: true })}
        />
      ) : null}
    </div>
  )
}
