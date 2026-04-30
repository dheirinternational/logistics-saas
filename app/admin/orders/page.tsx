"use client"

import SearchComponent from '@/components/admin/orders/SearchComponent'
import { Table } from '@/components/admin/table/Table'
import { Order } from '@/types/entityTypeDef'
import { OrderStatus } from '@/types/statusTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { FaX } from 'react-icons/fa6'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'


type FilterValues = {
    search: string
    status: string
}

const Page: NextPage = () => {

    const [orders, setOrders] = useState<Order[]>([])
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isModalActive, setIsModalActive] = useState(false)

    const [filterValues, setFilterValues] = useState<FilterValues>({
        search: "",
        status: ""
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
            header: "Order ID"
        }),
        columnHelper.accessor("customer_code", {
            header: "Customer Code"
        }),
        columnHelper.accessor("total_price", {
            header: "Total Price"
        }),
        columnHelper.accessor("delivery_fee", {
            header: "Delivery Fee"
        }),
        columnHelper.accessor("status", {
            header: "Status"
        }),
        columnHelper.accessor("created_at", {
            header: "Created At",
            cell: ({ getValue }) => (
                <p>{new Date(getValue()).toDateString()}</p>
            )
        }),
        columnHelper.display({
            id: "action-btns",
            cell: ({ row }) => (
                <button
                    onClick={() => {
                        setSelectedOrder(row.original)
                        setIsModalActive(true)
                    }}
                >
                    view
                </button>
            )
        })
    ]

    const filteredData = orders
        .filter(x =>
            x.order_id.toLowerCase().includes(filterValues.search.toLowerCase())
        )
        .filter( x =>  
            x.status.toLowerCase().includes(filterValues.status.toLowerCase())
        )


    return (
        <div className='h-full space-y-4'>

            <h2 className="text-2xl font-semibold">
                Orders
            </h2>
            <p className="text-xs text-dark/50 mt-2">
                Manage, edit and view all Orders.
            </p>

            {/* SEARCH COMPONENT */}
            <SearchComponent state={filterValues} setState={setFilterValues} />

            {/* TABLE */}
            <div className='bg-light p-body rounded-lg mt-4'>
                <h2 className='text-sm font-bold'>
                    Orders
                </h2>

                <p className='text-xs mt-2 opacity-70'>
                    A live record of all customer orders.
                </p>

                <div className='mt-4'>
                    {isDataLoading ? (
                        <div className='flex justify-center items-center py-8'>
                            <BeatLoader color="#3B82F6" size={15} />
                            <span className='ml-2 text-sm'>Loading orders...</span>
                        </div>
                    ) : error ? (
                        <div className='text-center py-8'>
                            <p className='text-red-500 text-sm'>{error}</p>
                        </div>
                    ) : (
                        <Table
                            importedData={filteredData}
                            columnDef={columnDef}
                            globalFilter=''
                        />
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalActive && selectedOrder && (
                <OrderModal
                    order={selectedOrder}
                    setModal={() => setIsModalActive(false)}
                />
            )}
        </div>
    )
}

const OrderModal = ({
    order,
    setModal
}: {
    order: Order | null
    setModal: () => void
}) => {

    const [status, setStatus] = useState<Order["status"]>(
        order?.status || "Confirmed"
    )

    const [isUpdating, setIsUpdating] = useState(false)

    const updateStatus = async () => {
        if (!order) return

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

        } catch (err) {
            console.error("Update error:", err)
            toast.error("Something went wrong")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className='w-screen h-dvh bg-dark/40 fixed top-0 right-0 center-items'>

            <div className='w-96 bg-light rounded p-4 relative'>

                {/* CLOSE BUTTON */}
                <button
                    className='absolute right-4 top-4'
                    onClick={setModal}
                >
                    <FaX />
                </button>

                {/* HEADER */}
                <h2 className='font-bold text-lg'>
                    {order?.order_id}
                </h2>

                {/* ORDER DETAILS */}
                <div className='text-xs space-y-2 mt-4'>

                    <p><b>Customer:</b> {order?.customer_code}</p>
                    <p><b>Total:</b> ₦{order?.total_price}</p>
                    <p><b>Delivery Fee:</b> ₦{order?.delivery_fee}</p>
                    <p><b>Extra Charges:</b> ₦{order?.extra_charges}</p>

                    <p><b>Status:</b> {order?.status}</p>

                    <p>
                        <b>Address:</b> {order?.destination_address}
                    </p>

                    <p>
                        <b>Created:</b>{" "}
                        {new Date(order?.created_at || "").toDateString()}
                    </p>
                </div>

                <hr className='my-3 border-dark/30' />

                {/* STATUS UPDATE */}
                <div className='space-y-2'>

                    <label className='text-xs font-semibold'>
                        Update Order Status
                    </label>

                    <select
                        className='w-full border p-2 text-xs rounded'
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value as Order["status"])
                        }
                    >
                        <option value="Confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                        onClick={updateStatus}
                        disabled={isUpdating}
                        className='w-full bg-accent-red text-white py-2 rounded text-xs'
                    >
                        {isUpdating ? "Updating..." : "Update Status"}
                    </button>

                </div>

            </div>
        </div>
    )
}


export default Page