"use client"

import SearchComponent from '@/components/admin/shipments/accepted/SearchComponent'
import { Table } from '@/components/admin/table/Table'
import { generateTrackingNumber } from '@/lib/generators/generateTrackingNumber'
import { useShipmentStore } from '@/store/shipmentsStore'
import { useEditModalStore } from '@/types/editModalStore'
import { Shipment } from '@/types/entityTypeDef'
import { ShipmentStatus } from '@/types/statusTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaX } from 'react-icons/fa6'
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { deleteSelectedRows, formatDeleteFailures } from "@/lib/admin/deleteSelected"
import { matchesStatusFilter } from "@/lib/admin/tableFilters"
import { toast } from "@/lib/ui/toast"
import { IconChecks, IconInbox, IconPackage, IconPlane, IconTruck } from "@tabler/icons-react"

import { ShipmentBarcodeCell } from '@/components/admin/shipments/ShipmentBarcodeCell'

export type SearchProps = {
    search: string,
    status: string,
}

type currentSelectedStatus = {
    status: ShipmentStatus | ""
}

const columnHelper = createColumnHelper<Shipment>()


const Page: NextPage = () => {

    const { setSelectedShipment, shipmentTrigger } = useShipmentStore()
    const openModal = useEditModalStore((s) => s.openModal)

    const [shipments, setShipments] = useState<Shipment[]>([])
    const [filterValues, setFilterValues] = useState<SearchProps>({
        search: "",
        status: ""
    })


    const [isModalActive, setIsModalActive] = useState(false)
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [isUpdatingShipmentStatus, setIsUpdatingShipmentStatus] = useState(false)


    
    const [modalSelectedShipment, setModalSelectedShipmodalSelectedShipment] = useState<null | Shipment>(null)
    const [currentStatus, setCurrentStatus] = useState<currentSelectedStatus>({
        status: ""
    })


    const router = useRouter()

    const shipmentRequestColumnDef = [
        columnHelper.accessor("tracking_number", {
            header: "Tracking Number",
            cell: ({ getValue }) => <ShipmentBarcodeCell trackingNumber={getValue()} />
        }),
        columnHelper.accessor("customer_code", {
            header: "Customer Code"
        }),
        columnHelper.accessor("channel", {
            header: "Channel"
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: ({ getValue }) => {
                const status = getValue()
                let className = "portal-packages__badge"
                if (status === "processing") className = "portal-packages__badge portal-packages__badge--orange"
                else if (status === "shipped") className = "portal-packages__badge portal-packages__badge--blue"
                else if (status === "in_transit") className = "portal-packages__badge portal-packages__badge--blue"
                else if (status === "arrived") className = "portal-packages__badge portal-packages__badge--green"
                else if (status === "out_for_delivery") className = "portal-packages__badge portal-packages__badge--green"
                else if (status === "delivered") className = "portal-packages__badge portal-packages__badge--green"
                return <span className={className}>{status.replaceAll("_", " ")}</span>
            }
        }),
        columnHelper.accessor("payment_time", {
            header: "Payment Time",
            cell: ({ getValue }) => {
                const val = getValue() as unknown as string
                if (!val) return "-"
                // Handle raw "before" / "after" or "pay_before_shipment" / "pay_after_shipment"
                if (val === "before" || val === "pay_before_shipment") return "Pay before shipment"
                if (val === "after" || val === "pay_after_shipment") return "Pay after shipment"
                return val.replaceAll("_", " ")
            }
        }),
        columnHelper.accessor("paid_for", {
            header: "Paid For",
            cell: ({ getValue }) => {
                const paid = getValue()
                return (
                    <span className={`portal-packages__badge ${paid ? "portal-packages__badge--green" : "portal-packages__badge--muted"}`}>
                        {paid ? "Yes" : "No"}
                    </span>
                )
            }
        }),
        columnHelper.accessor("created_at", {
            header: "Accepted at",
            cell: ({getValue}) => <span>{new Date(getValue()).toDateString()}</span> 
        }),
        columnHelper.display({
            id: "Details",
            cell: ({row}) => 
            <button
            type="button"
            className="portal-home__table-btn"
            onClick={() => {
                setSelectedShipment(row.original)
                openModal()
            }}>
                View Shipment
            </button>
        })
    ]

    generateTrackingNumber()


    // Fetch Shipment 
    useEffect(() => {
        const fetchShipmentData = async () => {
            try{
                const res = await fetch(`/api/shipments`, {
                    method: "GET",
                    credentials: "include"
                })

                const data = await res.json()
                
                if(!res.ok){
                    toast.error(data.message)
                    return
                }

                setShipments(data.data)
            }
            catch(err){
                toast.error("Cannot fetch Shipment Data")
                console.error(err)
            }
            finally{
                setIsDataLoading(false) 
            }
        }

        fetchShipmentData()
    
    }, [shipmentTrigger])



    // Update Shipment Status
    const updateShipmentStatus = async() => {
        setIsUpdatingShipmentStatus(true)
        try{
            const res = await fetch(`/api/shipments/shipment-status/${modalSelectedShipment?.id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    status: currentStatus.status
                })
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("Shipment Status successfully updated")
            router.refresh()

        }
        catch(err){
            toast.error("ERR:: Updating shipment Status")
            console.error(err)
        }
        finally{
            setIsUpdatingShipmentStatus(false)
        }
    }

    const deleteShipments = async (rows: Shipment[]) => {
        const ids = rows.map((row) => String(row.id))
        try {
            const results = await deleteSelectedRows(ids, (id) =>
                fetch(`/api/shipments/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                })
            )

            const failureMessage = formatDeleteFailures(results)
            if (failureMessage) {
                if (/unauthorized/i.test(failureMessage)) {
                    toast.error("Session expired. Please sign in again.")
                    router.push("/auth/login")
                    return
                }
                toast.error(failureMessage)
                return
            }

            setShipments((prev) => prev.filter((item) => !ids.includes(String(item.id))))
            toast.success(`${ids.length} shipment(s) deleted.`)
        } catch (err) {
            console.error(err)
            toast.error("Failed to delete selected shipments.")
        }
    }

    const data = shipments.filter((x) =>
        matchesStatusFilter(x.status, filterValues.status)
    )


  return (
    <div className="portal-home">
      {isDataLoading ? (
        <div className="portal-home__panel portal-home__loader">
          <DHEIRLoader color="var(--color-dheir-blue)" size={12} />
        </div>
      ) : (
        <>
          <div className="portal-home__stats" role="list" aria-label="Shipments status">
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconPackage size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Processing</span>
                <span className="portal-home__stat-card-value">
                  {shipments.filter((x) => x.status === "processing").length}
                </span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconPlane size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Shipped</span>
                <span className="portal-home__stat-card-value">
                  {shipments.filter((x) => x.status === "shipped").length}
                </span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconTruck size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">In transit</span>
                <span className="portal-home__stat-card-value">
                  {shipments.filter((x) => x.status === "in_transit").length}
                </span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconInbox size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Arrived</span>
                <span className="portal-home__stat-card-value">
                  {shipments.filter((x) => x.status === "arrived").length}
                </span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconTruck size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Out for delivery</span>
                <span className="portal-home__stat-card-value">
                  {shipments.filter((x) => x.status === "out_for_delivery").length}
                </span>
              </span>
            </div>

            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconChecks size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Delivered</span>
                <span className="portal-home__stat-card-value">
                  {shipments.filter((x) => x.status === "delivered").length}
                </span>
              </span>
            </div>
          </div>

          <section className="portal-home__panel" aria-label="Filters">
            <div className="portal-home__panel-head">
              <div>
                <h2 className="portal-home__section-title">Filters</h2>
              </div>
            </div>
            <SearchComponent state={filterValues} setState={setFilterValues} />
          </section>

          <section className="portal-home__panel" aria-labelledby="shipment-records-heading">
            <div className="portal-home__panel-head">
              <div>
                <h2 id="shipment-records-heading" className="portal-home__section-title">
                  Shipment records
                </h2>
                <p className="portal-home__section-sub">
                  A live overview of all shipments in the system.
                </p>
              </div>
            </div>
            {shipments ? (
              <Table
                importedData={data}
                columnDef={shipmentRequestColumnDef}
                globalFilter={filterValues.search}
                pageSize={15}
                enableRowSelection
                getRowId={(row) => String(row.id)}
                onDeleteSelected={deleteShipments}
              />
            ) : null}
          </section>
        </>
      )}
    </div>
  )
}

export default Page