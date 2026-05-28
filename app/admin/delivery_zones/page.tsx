"use client"

import SearchComponent from "@/components/admin/delivery_zones/SearchComponent"
import { Table } from "@/components/admin/table/Table"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"
import { createColumnHelper, Row } from "@tanstack/react-table"
import { IconArrowDown, IconArrowUp, IconCalculator, IconMapPin } from "@tabler/icons-react"
import { useCallback, useEffect, useMemo, useState } from "react"

type DeliveryLocation = {
    id: number
    state_name: string
    price: number
}

type FilterParams = {
    search: string
}

const columnHelper = createColumnHelper<DeliveryLocation>()

const formatNaira = (value: number) => `₦ ${value.toLocaleString("en-NG")}`

export default function Page() {
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deliveryLocations, setDeliveryLocations] = useState<DeliveryLocation[]>([])
    const [filterValues, setFilterValues] = useState<FilterParams>({ search: "" })

    const fetchDeliveryLocations = useCallback(async () => {
        setIsDataLoading(true)
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
            toast.error("ERR:: Fetching Delivery Locations")
            setError("Failed to fetch delivery zones")
        } finally {
            setIsDataLoading(false)
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
                    <PriceCell
                        fetchDeliveryLocations={fetchDeliveryLocations}
                        row={row}
                        savedPrice={getValue()}
                    />
                ),
            }),
        ],
        [fetchDeliveryLocations]
    )

    const deleteDeliveryZones = async (rows: DeliveryLocation[]) => {
        const ids = rows.map((row) => String(row.id))
        try {
            const results = await Promise.all(
                ids.map(async (id) => {
                    const res = await fetch(`/api/delivery-zones/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                    })
                    return { ok: res.ok, id }
                })
            )

            const failed = results.filter((x) => !x.ok)
            if (failed.length > 0) {
                toast.error(`Failed to delete ${failed.length} delivery zone(s).`)
                return
            }

            setDeliveryLocations((prev) => prev.filter((item) => !ids.includes(String(item.id))))
            toast.success(`${ids.length} delivery zone(s) deleted.`)
        } catch (err) {
            console.error("ERR:: Deleting Delivery Zones", err)
            toast.error("Failed to delete selected delivery zones")
        }
    }

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
                    <DheirLoader color="var(--color-dheir-blue)" size={12} />
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
                                enableRowSelection
                                getRowId={(row) => String(row.id)}
                                onDeleteSelected={deleteDeliveryZones}
                            />
                        )}
                    </section>
                </>
            )}
        </div>
    )
}

function PriceCell({
    fetchDeliveryLocations,
    row,
    savedPrice,
}: {
    fetchDeliveryLocations: () => Promise<void>
    row: Row<DeliveryLocation>
    savedPrice: number
}) {
    const [value, setValue] = useState(String(savedPrice))
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        setValue(String(savedPrice))
    }, [savedPrice])

    const numericValue = value === "" ? 0 : Number(value)
    const hasChanges = numericValue !== savedPrice

    const editDeliveryZonePrice = async () => {
        if (!hasChanges) return

        setIsEditing(true)
        try {
            const res = await fetch("/api/delivery-zones", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: row.original.id, price: numericValue }),
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
                return
            }

            toast.success(result.message)
            await fetchDeliveryLocations()
        } catch (err) {
            toast.error("ERR:: Editing Delivery Zone Price")
            console.error("ERR:: Editing Delivery Zone Price", err)
        } finally {
            setIsEditing(false)
        }
    }

    return (
        <div className="admin-inline-price">
            <span className="admin-inline-price__currency">₦</span>
            <input
                type="number"
                value={value}
                min={0}
                onChange={(e) => setValue(e.target.value.replace(/^0+(?=\d)/, ""))}
                className="dheir-input admin-inline-price__input"
                aria-label={`Delivery fee for ${row.original.state_name}`}
            />
            {hasChanges ? (
                <button
                    type="button"
                    className="portal-home__table-link"
                    onClick={editDeliveryZonePrice}
                    disabled={isEditing}
                >
                    {isEditing ? <DheirLoader color="var(--color-dheir-blue)" size={8} /> : "Save"}
                </button>
            ) : null}
        </div>
    )
}
