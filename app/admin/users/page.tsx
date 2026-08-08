"use client"

import { Table } from "@/components/admin/table/Table"
import SearchComponent from "@/components/admin/users/SearchComponent"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { User } from "@/types/entityTypeDef"
import { createColumnHelper } from "@tanstack/react-table"
import { IconUser, IconUserShield, IconUsers, IconUsersGroup } from "@tabler/icons-react"
import { NextPage } from "next"
import { useEffect, useMemo, useState } from "react"
import { toast } from "@/lib/ui/toast"

interface CustomerDetails extends User {
    code: string
    street?: string
    city?: string
    state?: string
    country?: string
    postal_code?: string
    full_address?: string
}

type FilterParams = {
    search: string
}

const columnHelper = createColumnHelper<CustomerDetails>()

const Page: NextPage = () => {
    const [users, setUsers] = useState<CustomerDetails[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterValues, setFilterValues] = useState<FilterParams>({
        search: "",
    })

    useEffect(() => {
        const fetchUsers = async () => {
            setIsDataLoading(true)
            try {
                const res = await fetch("/api/users", { credentials: "include" })
                const result = await res.json()

                if (!res.ok) {
                    toast.error(result.message)
                    setError(result.message)
                    return
                }

                setUsers(result.data ?? [])
            } catch (err) {
                toast.error("ERR:: Getting users data from database")
                console.log("ERR:: Getting users data from database", err)
            } finally {
                setIsDataLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const filteredData = useMemo(() => {
        const q = filterValues.search.trim().toLowerCase()
        if (!q) return users

        return users.filter(
            (x) =>
                x.email?.toLowerCase().includes(q) ||
                x.code?.toLowerCase().includes(q) ||
                x.first_name?.toLowerCase().includes(q) ||
                x.last_name?.toLowerCase().includes(q) ||
                x.full_address?.toLowerCase().includes(q) ||
                x.city?.toLowerCase().includes(q) ||
                x.state?.toLowerCase().includes(q)
        )
    }, [users, filterValues.search])

    const stats = useMemo(() => {
        const total = users.length
        const customers = users.filter((x) => x.role === "customer").length
        const admins = users.filter((x) => x.role === "admin").length
        const staff = users.filter((x) => x.role === "staff").length
        return { total, customers, admins, staff }
    }, [users])

    const columnDef = [
        columnHelper.accessor("last_name", {
            header: "Last name",
        }),
        columnHelper.accessor("first_name", {
            header: "First name",
        }),
        columnHelper.accessor("code", {
            header: "Customer code",
        }),
        columnHelper.accessor("email", {
            header: "Email",
        }),
        columnHelper.accessor("phone", {
            header: "Phone",
            cell: ({ getValue }) => getValue() || "-",
        }),
        columnHelper.accessor("full_address", {
            header: "Delivery Address",
            cell: ({ row }) => {
                const item = row.original
                const addr = item.full_address || [item.street, item.city, item.state, item.country].filter(Boolean).join(", ")
                return (
                    <span style={{ fontSize: "13px", color: addr ? "var(--color-dheir-ink)" : "var(--color-dheir-muted)", maxWidth: "260px", display: "inline-block", lineHeight: "1.4" }}>
                        {addr || "No address provided"}
                    </span>
                )
            },
        }),
        columnHelper.accessor("created_at", {
            header: "Joined at",
            cell: ({ getValue }) => <span>{new Date(getValue()).toDateString()}</span>,
        }),
    ]

    const deleteUsers = async (rows: CustomerDetails[]) => {
        const ids = rows.map((r) => Number(r.id)).filter((x) => Number.isFinite(x))
        if (ids.length === 0) return

        try {
            const results = await Promise.all(
                ids.map(async (id) => {
                    const res = await fetch(`/api/users/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                    })
                    const payload = await res.json().catch(() => ({ message: "Delete failed" }))
                    return {
                        ok: res.ok,
                        id,
                        message: (payload.message as string) || `Delete failed (${res.status})`,
                    }
                })
            )

            const failed = results.filter((r) => !r.ok)
            if (failed.length > 0) {
                console.error("User delete failures:", failed)
                const firstError = failed[0]?.message || "Delete failed"
                toast.error(
                    failed.length === 1
                        ? firstError
                        : `Could not delete ${failed.length} user(s). ${firstError}`
                )
            } else {
                toast.success("Deleted")
            }
            // Refresh list
            const res = await fetch("/api/users", { credentials: "include" })
            const result = await res.json()
            if (res.ok) setUsers(result.data ?? [])
        } catch (err) {
            console.error(err)
            toast.error("Could not delete users")
        }
    }

    return (
        <div className="portal-home">
            <header className="portal-home__greeting">
                <div>
                    <p className="portal-home__greeting-label">Admin</p>
                    <h1 className="portal-home__greeting-title">Users</h1>
                    <p className="portal-home__greeting-sub">Manage and view all user related data.</p>
                </div>
            </header>

            {isDataLoading ? (
                <div className="portal-home__panel portal-home__loader">
                    <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
                </div>
            ) : (
                <>
                    <div className="portal-home__stats" role="list" aria-label="Users stats">
                        <div className="portal-home__stat-card" role="listitem">
                            <span className="portal-home__stat-card-icon" aria-hidden>
                                <IconUsers size={22} stroke={1.5} />
                            </span>
                            <span className="portal-home__stat-card-body">
                                <span className="portal-home__stat-card-label">Total</span>
                                <span className="portal-home__stat-card-value">{stats.total}</span>
                                <span className="portal-home__stat-card-hint">All accounts</span>
                            </span>
                        </div>

                        <div className="portal-home__stat-card" role="listitem">
                            <span className="portal-home__stat-card-icon" aria-hidden>
                                <IconUser size={22} stroke={1.5} />
                            </span>
                            <span className="portal-home__stat-card-body">
                                <span className="portal-home__stat-card-label">Customers</span>
                                <span className="portal-home__stat-card-value">{stats.customers}</span>
                                <span className="portal-home__stat-card-hint">Portal users</span>
                            </span>
                        </div>

                        <div className="portal-home__stat-card" role="listitem">
                            <span className="portal-home__stat-card-icon" aria-hidden>
                                <IconUserShield size={22} stroke={1.5} />
                            </span>
                            <span className="portal-home__stat-card-body">
                                <span className="portal-home__stat-card-label">Admins</span>
                                <span className="portal-home__stat-card-value">{stats.admins}</span>
                                <span className="portal-home__stat-card-hint">Admin access</span>
                            </span>
                        </div>

                        <div className="portal-home__stat-card" role="listitem">
                            <span className="portal-home__stat-card-icon" aria-hidden>
                                <IconUsersGroup size={22} stroke={1.5} />
                            </span>
                            <span className="portal-home__stat-card-body">
                                <span className="portal-home__stat-card-label">Staff</span>
                                <span className="portal-home__stat-card-value">{stats.staff}</span>
                                <span className="portal-home__stat-card-hint">Team members</span>
                            </span>
                        </div>
                    </div>

                    <section className="portal-home__panel" aria-label="User filters">
                        <div className="portal-home__panel-head">
                            <div>
                                <h2 className="portal-home__section-title">Filters</h2>
                                <p className="portal-home__section-sub">
                                    Search by customer code, email, or name.
                                </p>
                            </div>
                        </div>
                        <SearchComponent filter={filterValues} setFilter={setFilterValues} />
                    </section>

                    <section className="portal-home__panel" aria-labelledby="user-records-heading">
                        <div className="portal-home__panel-head">
                            <div>
                                <h2 id="user-records-heading" className="portal-home__section-title">
                                    User records
                                </h2>
                                <p className="portal-home__section-sub">A list of all users in the system.</p>
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
                                onDeleteSelected={deleteUsers}
                            />
                        )}
                    </section>
                </>
            )}
        </div>
    )
}

export default Page
