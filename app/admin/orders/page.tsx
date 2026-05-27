"use client"

import SearchComponent from "@/components/admin/orders/SearchComponent"
import { Table } from "@/components/admin/table/Table"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { DheirSelect } from "@/components/ui/DheirSelect"
import { formatPaymentAmount } from "@/lib/portal/paymentDisplay"
import { toast } from "@/lib/ui/toast"
import { Order } from "@/types/entityTypeDef"
import { createColumnHelper } from "@tanstack/react-table"
import { IconCircleCheck, IconClock, IconPackage, IconTruckDelivery, IconX } from "@tabler/icons-react"
import { NextPage } from "next"
import { useEffect, useMemo, useState } from "react"

type FilterValues = {
    search: string
    status: string
}

const Page: NextPage = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const [filterValues, setFilterValues] = useState<FilterValues>({
        search: "",
        status: "",
    })

    useEffect(() => {
        const fetchOrders = async () => {
            setIsDataLoading(true)

            try {
                const res = await fetch("/api/orders", {
                    method: "GET",
                    credentials: "include"
                })

                const result = await res.json()

                if (!res.ok) {
                    toast.error(result.message)
                    setError(result.message)
                    return
                }

                setOrders(result.data)

            } catch (err) {
                console.error("ERR fetching orders", err)
            } finally {
                setIsDataLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const columnHelper = createColumnHelper<Order>()

    const columnDef = [
        columnHelper.accessor("order_id", {
            header: "Order ID",
        }),
        columnHelper.accessor("customer_code", {
            header: "Customer Code",
        }),
        columnHelper.accessor("total_price", {
            header: "Total Price",
            cell: ({ getValue }) => <span>₦ {getValue()}</span>,
        }),
        columnHelper.accessor("delivery_fee", {
            header: "Delivery Fee",
            cell: ({ getValue }) => <span>₦ {getValue()}</span>,
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: ({ getValue }) => {
                const value = getValue()
                return value ? String(value).replace(/_/g, " ") : "-"
            },
        }),
        columnHelper.accessor("created_at", {
            header: "Created At",
            cell: ({ getValue }) => (
                <p>{new Date(getValue()).toDateString()}</p>
            ),
        }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <button
                    type="button"
                    className="portal-home__table-link"
                    onClick={() => {
                        setSelectedOrder(row.original)
                    }}
                >
                    View / edit
                </button>
            ),
        }),
    ]

    const filteredData = useMemo(() => {
        const q = filterValues.search.trim().toLowerCase()
        const status = filterValues.status.trim().toLowerCase()
        return orders
            .filter((x) => {
                if (!q) return true
                const orderId = String(x.order_id ?? "").toLowerCase()
                const customer = String(x.customer_code ?? "").toLowerCase()
                return orderId.includes(q) || customer.includes(q)
            })
            .filter((x) => {
                if (!status) return true
                return String(x.status ?? "").toLowerCase() === status
            })
    }, [orders, filterValues.search, filterValues.status])

    const stats = useMemo(() => {
        const total = orders.length
        const confirmed = orders.filter((o) => String(o.status).toLowerCase() === "confirmed").length
        const processing = orders.filter((o) => String(o.status).toLowerCase() === "processing").length
        const shipped = orders.filter((o) => String(o.status).toLowerCase() === "shipped").length
        const delivered = orders.filter((o) => String(o.status).toLowerCase() === "delivered").length
        return { total, confirmed, processing, shipped, delivered }
    }, [orders])

    return (
        <>
            <div className="portal-home">
                <header className="portal-home__greeting">
                    <div>
                        <p className="portal-home__greeting-label">Admin</p>
                        <h1 className="portal-home__greeting-title">Orders</h1>
                        <p className="portal-home__greeting-sub">Manage, edit and view all Orders.</p>
                    </div>
                </header>

                {isDataLoading ? (
                    <div className="portal-home__panel portal-home__loader">
                        <DheirLoader color="var(--color-dheir-blue)" size={12} />
                    </div>
                ) : (
                    <>
                        <div className="portal-home__stats" role="list" aria-label="Orders stats">
                            <div className="portal-home__stat-card" role="listitem">
                                <span className="portal-home__stat-card-icon" aria-hidden>
                                    <IconPackage size={22} stroke={1.5} />
                                </span>
                                <span className="portal-home__stat-card-body">
                                    <span className="portal-home__stat-card-label">Total</span>
                                    <span className="portal-home__stat-card-value">{stats.total}</span>
                                    <span className="portal-home__stat-card-hint">All orders</span>
                                </span>
                            </div>

                            <div className="portal-home__stat-card" role="listitem">
                                <span className="portal-home__stat-card-icon" aria-hidden>
                                    <IconCircleCheck size={22} stroke={1.5} />
                                </span>
                                <span className="portal-home__stat-card-body">
                                    <span className="portal-home__stat-card-label">Confirmed</span>
                                    <span className="portal-home__stat-card-value">{stats.confirmed}</span>
                                    <span className="portal-home__stat-card-hint">Ready to process</span>
                                </span>
                            </div>

                            <div className="portal-home__stat-card" role="listitem">
                                <span className="portal-home__stat-card-icon" aria-hidden>
                                    <IconClock size={22} stroke={1.5} />
                                </span>
                                <span className="portal-home__stat-card-body">
                                    <span className="portal-home__stat-card-label">Processing</span>
                                    <span className="portal-home__stat-card-value">{stats.processing}</span>
                                    <span className="portal-home__stat-card-hint">Being prepared</span>
                                </span>
                            </div>

                            <div className="portal-home__stat-card" role="listitem">
                                <span className="portal-home__stat-card-icon" aria-hidden>
                                    <IconTruckDelivery size={22} stroke={1.5} />
                                </span>
                                <span className="portal-home__stat-card-body">
                                    <span className="portal-home__stat-card-label">Shipped</span>
                                    <span className="portal-home__stat-card-value">{stats.shipped}</span>
                                    <span className="portal-home__stat-card-hint">On the move</span>
                                </span>
                            </div>

                            <div className="portal-home__stat-card" role="listitem">
                                <span className="portal-home__stat-card-icon" aria-hidden>
                                    <IconPackage size={22} stroke={1.5} />
                                </span>
                                <span className="portal-home__stat-card-body">
                                    <span className="portal-home__stat-card-label">Delivered</span>
                                    <span className="portal-home__stat-card-value">{stats.delivered}</span>
                                    <span className="portal-home__stat-card-hint">Completed</span>
                                </span>
                            </div>
                        </div>

                        <section className="portal-home__panel" aria-label="Order filters">
                            <div className="portal-home__panel-head">
                                <div>
                                    <h2 className="portal-home__section-title">Filters</h2>
                                    <p className="portal-home__section-sub">
                                        Search by tracking number, customer code, or status.
                                    </p>
                                </div>
                            </div>
                            <SearchComponent state={filterValues} setState={setFilterValues} />
                        </section>

                        <section className="portal-home__panel" aria-labelledby="orders-records-heading">
                            <div className="portal-home__panel-head">
                                <div>
                                    <h2 id="orders-records-heading" className="portal-home__section-title">
                                        Orders
                                    </h2>
                                    <p className="portal-home__section-sub">A live record of all customer orders.</p>
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
                                    <p className="portal-home__empty">No orders found.</p>
                                </div>
                            ) : (
                                <Table importedData={filteredData} columnDef={columnDef} globalFilter={filterValues.search} />
                            )}
                        </section>
                    </>
                )}
            </div>

            {selectedOrder ? (
                <OrderModal
                    key={selectedOrder.order_id}
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdated={() => {
                        setSelectedOrder(null)
                        setFilterValues((prev) => ({ ...prev }))
                    }}
                />
            ) : null}
        </>
    )
}

const OrderModal = ({
    order,
    onClose,
    onUpdated,
}: {
    order: Order
    onClose: () => void
    onUpdated: () => void
}) => {
    const [status, setStatus] = useState<Order["status"]>(
        order?.status || "Confirmed"
    )

    const [isUpdating, setIsUpdating] = useState(false)
    const [items, setItems] = useState<any[]>([])
    const [loadingItems, setLoadingItems] = useState(true)

    useEffect(() => {
        let active = true
        setLoadingItems(true)
        fetch(`/api/orders/items/${encodeURIComponent(order.order_id)}`, {
            credentials: "include",
        })
            .then(async (res) => {
                const result = await res.json()
                if (!res.ok) {
                    throw new Error(result.message || "Could not load order items")
                }
                if (active) setItems(result.data ?? [])
            })
            .catch((err) => {
                console.error("Items fetch error:", err)
                if (active) setItems([])
            })
            .finally(() => {
                if (active) setLoadingItems(false)
            })

        return () => {
            active = false
        }
    }, [order.order_id])

    const updateStatus = async () => {
        setIsUpdating(true)

        try {
            const res = await fetch(`/api/orders/${order.order_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status })
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message || "Failed to update order")
                return
            }

            toast.success("Order status updated")
            onUpdated()

        } catch (err) {
            console.error("Update error:", err)
            toast.error("Something went wrong")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div
            className="dheir-dialog-backdrop"
            role="presentation"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="dheir-dialog admin-modal" role="dialog" aria-modal="true" aria-label="Edit order">
                <div className="dheir-dialog__head">
                    <div>
                        <h2 className="dheir-dialog__title">Order {order.order_id}</h2>
                        <p className="admin-modal__subtitle">Review and update this order.</p>
                    </div>
                    <button type="button" className="dheir-dialog__close" onClick={onClose} aria-label="Close">
                        <IconX size={20} stroke={1.5} />
                    </button>
                </div>

                <div className="admin-modal__body">
                    <div className="admin-modal__form">
                        <div className="admin-modal__fields">
                            <div className="portal-packages__field">
                                <span className="portal-packages__field-label">Customer code</span>
                                <p className="portal-home__empty" style={{ color: "var(--color-dheir-ink)" }}>
                                    {order.customer_code || "-"}
                                </p>
                            </div>

                            <div className="portal-packages__field">
                                <span className="portal-packages__field-label">Total price</span>
                                <p className="portal-home__empty" style={{ color: "var(--color-dheir-ink)" }}>
                                    {formatPaymentAmount(Number(order.total_price))}
                                </p>
                            </div>

                            <div className="portal-packages__field">
                                <span className="portal-packages__field-label">Delivery fee</span>
                                <p className="portal-home__empty" style={{ color: "var(--color-dheir-ink)" }}>
                                    {formatPaymentAmount(Number(order.delivery_fee))}
                                </p>
                            </div>

                            <div className="portal-packages__field">
                                <span className="portal-packages__field-label">Extra charges</span>
                                <p className="portal-home__empty" style={{ color: "var(--color-dheir-ink)" }}>
                                    {formatPaymentAmount(Number(order.extra_charges ?? 0))}
                                </p>
                            </div>

                            <div className="portal-packages__field">
                                <span className="portal-packages__field-label">Current status</span>
                                <p className="portal-home__empty" style={{ color: "var(--color-dheir-ink)" }}>
                                    {String(order.status || "-").replace(/_/g, " ")}
                                </p>
                            </div>

                            <div className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
                                <span className="portal-packages__field-label">Destination address</span>
                                <p className="portal-home__empty" style={{ color: "var(--color-dheir-ink)" }}>
                                    {order.destination_address || "-"}
                                </p>
                            </div>

                            <div className="portal-packages__field">
                                <span className="portal-packages__field-label">Created</span>
                                <p className="portal-home__empty" style={{ color: "var(--color-dheir-ink)" }}>
                                    {new Date(order.created_at || "").toDateString()}
                                </p>
                            </div>

                            <div className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
                                <span className="portal-packages__field-label">Items</span>
                                {loadingItems ? (
                                    <p className="portal-home__empty" style={{ color: "var(--color-dheir-muted)" }}>
                                        Loading items…
                                    </p>
                                ) : items.length === 0 ? (
                                    <p className="portal-home__empty" style={{ color: "var(--color-dheir-muted)" }}>
                                        No items found for this order.
                                    </p>
                                ) : (
                                    <div style={{ maxHeight: 280, overflowY: "auto", paddingRight: 6 }}>
                                        <div style={{ display: "grid", gap: 10 }}>
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        gap: 12,
                                                        padding: "10px 12px",
                                                        border: "1px solid var(--color-dheir-border)",
                                                        borderRadius: 12,
                                                        background: "var(--color-dheir-surface)",
                                                    }}
                                                >
                                                    <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                                                        <div
                                                            style={{
                                                                width: 44,
                                                                height: 44,
                                                                borderRadius: 10,
                                                                border: "1px solid var(--color-dheir-border)",
                                                                overflow: "hidden",
                                                                background: "var(--color-dheir-surface)",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.product_name ?? "Product image"}
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit: "cover",
                                                                        display: "block",
                                                                    }}
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="portal-order-item__placeholder">
                                                                    No image
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div style={{ minWidth: 0 }}>
                                                            <p
                                                                className="portal-home__empty"
                                                                style={{ color: "var(--color-dheir-ink)", margin: 0 }}
                                                            >
                                                                {item.product_name}
                                                            </p>
                                                            <p
                                                                className="portal-home__empty"
                                                                style={{ color: "var(--color-dheir-muted)", margin: "2px 0 0" }}
                                                            >
                                                                Qty {item.quantity} · {formatPaymentAmount(Number(item.unit_price))}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p
                                                        className="portal-home__empty tabular-nums"
                                                        style={{ color: "var(--color-dheir-ink)", margin: 0, whiteSpace: "nowrap" }}
                                                    >
                                                        {formatPaymentAmount(
                                                            Number(
                                                                item.subtotal ??
                                                                Number(item.unit_price) * Number(item.quantity)
                                                            )
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="admin-uploader">
                            <div className="admin-uploader__row">
                                <div>
                                    <p className="portal-packages__field-label" style={{ margin: 0 }}>
                                        Update status
                                    </p>
                                    <p className="admin-uploader__help">Changes apply immediately to this order.</p>
                                </div>
                            </div>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Status</span>
                                <DheirSelect
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as Order["status"])}
                                >
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </DheirSelect>
                            </label>

                            <div className="admin-modal__actions" style={{ marginTop: 12 }}>
                                <button
                                    type="button"
                                    onClick={updateStatus}
                                    disabled={isUpdating}
                                    className="portal-home__btn portal-home__btn--primary"
                                >
                                    {isUpdating ? <DheirLoader color="#fff" size={10} /> : "Update status"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Page