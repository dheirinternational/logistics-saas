"use client"

import { Table } from "@/components/admin/table/Table"
import { AddWarehouseModal } from "@/components/admin/warehouse/AddWarehouseModal"
import SearchComponent from "@/components/admin/warehouse/SearchComponent"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { Warehouse } from "@/types/entityTypeDef"
import { createColumnHelper } from "@tanstack/react-table"
import { IconBuildingWarehouse, IconPlane, IconShip, IconWorld } from "@tabler/icons-react"
import { NextPage } from "next"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "@/lib/ui/toast"

type FilterParams = {
    search: string
}

const columnHelper = createColumnHelper<Warehouse>()

const Page: NextPage = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterValues, setFilterValues] = useState<FilterParams>({
        search: "",
    })
    const [showAddModal, setShowAddModal] = useState(false)

    const loadWarehouses = useCallback(async (options?: { silent?: boolean }) => {
        if (!options?.silent) {
            setIsDataLoading(true)
        }

        try {
            const res = await fetch("/api/warehouses", { credentials: "include" })
            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message ?? "Failed to fetch warehouses")
                setError(result.message ?? "Failed to fetch warehouses")
                return
            }

            setWarehouses(result.data ?? [])
            setError(null)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong"
            setError(message)
            if (!options?.silent) {
                toast.error(message)
            }
        } finally {
            if (!options?.silent) {
                setIsDataLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        loadWarehouses()
    }, [loadWarehouses])

    const filteredData = useMemo(() => {
        const q = filterValues.search.trim().toLowerCase()
        if (!q) return warehouses

        return warehouses.filter(
            (w) =>
                w.name?.toLowerCase().includes(q) ||
                w.type?.toLowerCase().includes(q) ||
                w.phone?.toLowerCase().includes(q) ||
                w.city?.toLowerCase().includes(q) ||
                w.country?.toLowerCase().includes(q)
        )
    }, [warehouses, filterValues.search])

    const stats = useMemo(() => {
        const total = warehouses.length
        const air = warehouses.filter((w) => w.type === "air").length
        const sea = warehouses.filter((w) => w.type === "sea").length
        const local = warehouses.filter((w) => w.type === "local").length
        return { total, air, sea, local }
    }, [warehouses])

    const columnDef = [
        columnHelper.accessor("name", {
            header: "Name",
        }),
        columnHelper.accessor("type", {
            header: "Type",
            cell: ({ getValue }) => {
                const value = getValue()
                return value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : "-"
            },
        }),
        columnHelper.accessor("phone", {
            header: "Phone",
            cell: ({ getValue }) => getValue() || "-",
        }),
    ]

    const deleteWarehouses = async (rows: Warehouse[]) => {
        const ids = rows.map((r) => Number(r.id)).filter((x) => Number.isFinite(x))
        if (ids.length === 0) return

        try {
            const results = await Promise.all(
                ids.map((id) =>
                    fetch(`/api/warehouses/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                    })
                )
            )
            const failed = results.filter((r) => !r.ok).length
            if (failed > 0) toast.error(`Could not delete ${failed} warehouse(s)`)
            else toast.success("Deleted")

            if (failed === 0) await loadWarehouses({ silent: true })
        } catch (err) {
            console.error(err)
            toast.error("Could not delete warehouses")
        }
    }

    return (
        <div className="portal-home">
            <header className="portal-home__greeting">
                <div>
                    <p className="portal-home__greeting-label">Admin</p>
                    <h1 className="portal-home__greeting-title">Warehouses</h1>
                    <p className="portal-home__greeting-sub">
                        Manage, edit, and view all warehouse related data.
                    </p>
                </div>
            </header>

            {isDataLoading ? (
                <div className="portal-home__panel portal-home__loader">
                    <DheirLoader color="var(--color-dheir-blue)" size={12} />
                </div>
            ) : (
                <>
                    <div className="portal-home__stats" role="list" aria-label="Warehouse stats">
                        <div className="portal-home__stat-card" role="listitem">
                            <span className="portal-home__stat-card-icon" aria-hidden>
                                <IconBuildingWarehouse size={22} stroke={1.5} />
                            </span>
                            <span className="portal-home__stat-card-body">
                                <span className="portal-home__stat-card-label">Total</span>
                                <span className="portal-home__stat-card-value">{stats.total}</span>
                                <span className="portal-home__stat-card-hint">All locations</span>
                            </span>
                        </div>

                        <div className="portal-home__stat-card" role="listitem">
                            <span className="portal-home__stat-card-icon" aria-hidden>
                                <IconPlane size={22} stroke={1.5} />
                            </span>
                            <span className="portal-home__stat-card-body">
                                <span className="portal-home__stat-card-label">Air</span>
                                <span className="portal-home__stat-card-value">{stats.air}</span>
                                <span className="portal-home__stat-card-hint">Air cargo</span>
                            </span>
                        </div>

                        <div className="portal-home__stat-card" role="listitem">
                            <span className="portal-home__stat-card-icon" aria-hidden>
                                <IconShip size={22} stroke={1.5} />
                            </span>
                            <span className="portal-home__stat-card-body">
                                <span className="portal-home__stat-card-label">Sea</span>
                                <span className="portal-home__stat-card-value">{stats.sea}</span>
                                <span className="portal-home__stat-card-hint">Sea freight</span>
                            </span>
                        </div>

                        <div className="portal-home__stat-card" role="listitem">
                            <span className="portal-home__stat-card-icon" aria-hidden>
                                <IconWorld size={22} stroke={1.5} />
                            </span>
                            <span className="portal-home__stat-card-body">
                                <span className="portal-home__stat-card-label">Local</span>
                                <span className="portal-home__stat-card-value">{stats.local}</span>
                                <span className="portal-home__stat-card-hint">Local hubs</span>
                            </span>
                        </div>
                    </div>

                    <section className="portal-home__panel" aria-label="Warehouse filters">
                        <div className="portal-home__panel-head">
                            <div>
                                <h2 className="portal-home__section-title">Filters</h2>
                                <p className="portal-home__section-sub">
                                    Search by warehouse name, type, phone, or location.
                                </p>
                            </div>
                        </div>
                        <SearchComponent filter={filterValues} setFilter={setFilterValues} />
                    </section>

                    <section className="portal-home__panel" aria-labelledby="warehouse-records-heading">
                        <div className="portal-home__panel-head">
                            <div>
                                <h2 id="warehouse-records-heading" className="portal-home__section-title">
                                    Warehouse records
                                </h2>
                                <p className="portal-home__section-sub">A list of all warehouses in the system.</p>
                            </div>
                            <button
                                type="button"
                                className="portal-home__btn portal-home__btn--primary"
                                onClick={() => setShowAddModal(true)}
                            >
                                Add warehouse
                            </button>
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
                                onDeleteSelected={deleteWarehouses}
                            />
                        )}
                    </section>
                </>
            )}

            {showAddModal ? (
                <AddWarehouseModal
                    onClose={() => setShowAddModal(false)}
                    onSaved={() => loadWarehouses({ silent: true })}
                />
            ) : null}
        </div>
    )
}

export default Page
