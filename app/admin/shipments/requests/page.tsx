"use client"

import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal"
import { MediaUploadModal } from "@/components/admin/media/MediaUploadModal"
import type { AdminMediaItem } from "@/lib/media/adminMedia"
import SearchComponent from '@/components/admin/shipments/requests/SearchComponent'
import { Table } from '@/components/admin/table/Table'
import { ShipmentImage, ShippingRequest } from '@/types/entityTypeDef'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { BiCheck } from 'react-icons/bi'
import { FaImage } from 'react-icons/fa'
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { DHEIRSelect } from "@/components/ui/DHEIRSelect"
import { matchesStatusFilter } from "@/lib/admin/tableFilters"
import { toast } from "@/lib/ui/toast"
import { IconChecks, IconClock, IconFileSearch, IconCircleX } from "@tabler/icons-react"
import { getProductWeightFieldLabel } from "@/lib/shop/productWeight"
import { IconX } from "@tabler/icons-react"

export type SearchProps = {
    search: string
    status: string
}

const columnHelper = createColumnHelper<ShippingRequest>()


const Page: NextPage = () => {

    const router = useRouter()

    const [shipmentRequests, setShipmentRequests] = useState<ShippingRequest[]>([])



    const [totalPrice, setTotalPrice] = useState("") 
    const [totalWeight, setTotalWeight] = useState("")
    const [totalPieces, setTotalPieces] = useState("1")
    const [loadingDate, setLoadingDate] = useState("")
    const [expectedArrivalDate, setExpectedArrivalDate] = useState("")
    const [weightUnit, setWeightUnit] = useState<"kg" | "cbm">("kg")
    const [libraryMedia, setLibraryMedia] = useState<AdminMediaItem[]>([])
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploadOpen, setUploadOpen] = useState(false)

    // Two-step vetting states
    const [rejectionNote, setRejectionNote] = useState("")
    const [isRejecting, setIsRejecting] = useState(false)

    const [isDataLoading, setIsDataLoading] = useState(true)
    const [isCreatingShipmentData, setIsCreatingShipmentData] = useState(false)
    const [isModalActive, setIsModalActive] = useState(false)
    
    
    
    const [filterValues, setFilterValues] = useState<SearchProps>({
        search: "",
        status: "",
    })

    const [modalSelectedRequest, setModalSelectedRequest] = useState<null | ShippingRequest>(null)
    const [adminReply, setAdminReply] = useState("")
    
    // Air GZ Cargo States
    const [airGzWeight, setAirGzWeight] = useState("")
    const [airGzPrice, setAirGzPrice] = useState("")
    const [airGzPieces, setAirGzPieces] = useState("")
    const [airGzLoadingDate, setAirGzLoadingDate] = useState("")
    const [airGzExpectedArrivalDate, setAirGzExpectedArrivalDate] = useState("")

    // Air HK Cargo States
    const [airHkWeight, setAirHkWeight] = useState("")
    const [airHkPrice, setAirHkPrice] = useState("")
    const [airHkPieces, setAirHkPieces] = useState("")
    const [airHkLoadingDate, setAirHkLoadingDate] = useState("")
    const [airHkExpectedArrivalDate, setAirHkExpectedArrivalDate] = useState("")

    useEffect(() => {
        const inferred = modalSelectedRequest?.channel === "sea" ? "cbm" : "kg"
        setWeightUnit((modalSelectedRequest?.total_weight_unit as any) ?? inferred)
        if (modalSelectedRequest?.total_weight != null) {
            setTotalWeight(String(Number(modalSelectedRequest.total_weight).toFixed(2)))
        } else {
            setTotalWeight("")
        }
        setTotalPrice(modalSelectedRequest?.total_price ? String(modalSelectedRequest.total_price) : "")
        setTotalPieces(String(modalSelectedRequest?.total_pieces ?? modalSelectedRequest?.package_ids?.length ?? 1))
        setLoadingDate(modalSelectedRequest?.loading_date ? modalSelectedRequest.loading_date.split("T")[0] : "")
        setExpectedArrivalDate(modalSelectedRequest?.expected_arrival_date ? modalSelectedRequest.expected_arrival_date.split("T")[0] : "")
        
        setAirGzWeight(modalSelectedRequest?.air_gz_weight != null ? String(modalSelectedRequest.air_gz_weight) : "")
        setAirGzPrice(modalSelectedRequest?.air_gz_cost != null ? String(modalSelectedRequest.air_gz_cost) : "")
        setAirGzPieces(modalSelectedRequest?.air_gz_pieces != null ? String(modalSelectedRequest.air_gz_pieces) : "")
        setAirGzLoadingDate(modalSelectedRequest?.air_gz_loading_date ? modalSelectedRequest.air_gz_loading_date.split("T")[0] : "")
        setAirGzExpectedArrivalDate(modalSelectedRequest?.air_gz_expected_arrival_date ? modalSelectedRequest.air_gz_expected_arrival_date.split("T")[0] : "")

        setAirHkWeight(modalSelectedRequest?.air_hk_weight != null ? String(modalSelectedRequest.air_hk_weight) : "")
        setAirHkPrice(modalSelectedRequest?.air_hk_cost != null ? String(modalSelectedRequest.air_hk_cost) : "")
        setAirHkPieces(modalSelectedRequest?.air_hk_pieces != null ? String(modalSelectedRequest.air_hk_pieces) : "")
        setAirHkLoadingDate(modalSelectedRequest?.air_hk_loading_date ? modalSelectedRequest.air_hk_loading_date.split("T")[0] : "")
        setAirHkExpectedArrivalDate(modalSelectedRequest?.air_hk_expected_arrival_date ? modalSelectedRequest.air_hk_expected_arrival_date.split("T")[0] : "")

        setAdminReply(modalSelectedRequest?.admin_reply || "")
    }, [modalSelectedRequest])

    const fetchShipmentData = async () => {
        try{
            const res = await fetch(`/api/shipment-requests`, {
                method: "GET",
                credentials: "include"
            })

            const data = await res.json()
            
            if(!res.ok){
                toast.error(data.message)
                return
            }

            setShipmentRequests(data.data)
        }
        catch(err){
            toast.error("Cannot fetch Shipment Data")
            console.error(err)
        }
        finally{
            setIsDataLoading(false) 
        }
    }

    const deleteShipmentRequests = async (rows: ShippingRequest[]) => {
        const ids = rows.map((row) => String(row.id))
        try {
            const results = await Promise.all(
                ids.map(async (id) => {
                    const res = await fetch(`/api/shipment-requests/${id}`, {
                        method: "DELETE",
                        credentials: "include"
                    })
                    return { ok: res.ok, id }
                })
            )

            const failed = results.filter((x) => !x.ok)
            if (failed.length > 0) {
                toast.error(`Failed to delete ${failed.length} shipment request(s).`)
                return
            }

            setShipmentRequests((prev) => prev.filter((item) => !ids.includes(String(item.id))))
            toast.success(`${ids.length} shipment request(s) deleted.`)
        } catch (err) {
            console.error(err)
            toast.error("Failed to delete selected shipment requests.")
        }
    }

    const handleVetRequest = async (action: 'accept' | 'reject') => {
        if (action === 'reject' && !rejectionNote.trim()) {
            toast.error("Rejection note is required")
            return
        }

        setIsCreatingShipmentData(true)
        try {
            const res = await fetch(`/api/shipment-requests/${modalSelectedRequest?.id}/vet`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    rejection_note: action === 'reject' ? rejectionNote.trim() : undefined,
                    admin_reply: adminReply.trim() || undefined,
                })
            })
            const result = await res.json()
            if (!res.ok) {
                toast.error(result.message)
                return
            }
            toast.success(`Request successfully ${action === 'accept' ? 'accepted/vetted' : 'rejected'}`)
            setIsModalActive(false)
            setModalSelectedRequest(null)
            setRejectionNote("")
            setAdminReply("")
            setIsRejecting(false)
            fetchShipmentData()
        } catch (err: any) {
            toast.error("Failed to vet request")
            console.error(err)
        } finally {
            setIsCreatingShipmentData(false)
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setIsCreatingShipmentData(true)
        const formData = new FormData(e.currentTarget)

        libraryMedia.forEach((item) => {
            formData.append("media_asset_ids", String(item.id))
        })

        const isAir = modalSelectedRequest?.channel !== "sea"
        const gzCost = Number(airGzPrice) || 0
        const hkCost = Number(airHkPrice) || 0
        const gzWeight = Number(airGzWeight) || 0
        const hkWeight = Number(airHkWeight) || 0
        const gzPieces = Number(airGzPieces) || 0
        const hkPieces = Number(airHkPieces) || 0

        let finalPrice = totalPrice
        let finalWeight = totalWeight
        let finalPieces = totalPieces
        let finalLd = loadingDate
        let finalEdd = expectedArrivalDate

        if (isAir && (gzCost > 0 || hkCost > 0 || gzWeight > 0 || hkWeight > 0)) {
            finalPrice = String(gzCost + hkCost)
            finalWeight = String((gzWeight + hkWeight).toFixed(2))
            finalPieces = String((gzPieces + hkPieces) || 1)
            finalLd = airGzLoadingDate || airHkLoadingDate || loadingDate
            finalEdd = airGzExpectedArrivalDate || airHkExpectedArrivalDate || expectedArrivalDate

            if (gzWeight > 0 || gzCost > 0) {
                formData.append("air_gz_weight", String(gzWeight))
                formData.append("air_gz_cost", String(gzCost))
                formData.append("air_gz_pieces", String(gzPieces || 1))
                formData.append("air_gz_loading_date", airGzLoadingDate)
                formData.append("air_gz_expected_arrival_date", airGzExpectedArrivalDate)
            }
            if (hkWeight > 0 || hkCost > 0) {
                formData.append("air_hk_weight", String(hkWeight))
                formData.append("air_hk_cost", String(hkCost))
                formData.append("air_hk_pieces", String(hkPieces || 1))
                formData.append("air_hk_loading_date", airHkLoadingDate)
                formData.append("air_hk_expected_arrival_date", airHkExpectedArrivalDate)
            }
        }

        formData.append("customer_code", modalSelectedRequest?.customer_code || "")
        formData.append("origin_warehouse_id", "1")
        formData.append("destination_warehouse_id", "2")
        formData.append("channel", modalSelectedRequest?.channel || "")
        formData.append("shipment_request_id", modalSelectedRequest?.id || "")
        formData.append("shipment_note", modalSelectedRequest?.customer_note || "")
        formData.append("user_id", `${modalSelectedRequest?.user_id}` || "")
        formData.append("payment_time", `${modalSelectedRequest?.payment_time}` || "")
        formData.append("package_ids", `${modalSelectedRequest?.package_ids}` || "")
        formData.append("total_weight_unit", weightUnit)
        formData.append("total_pieces", finalPieces || "1")
        formData.append("loading_date", finalLd)
        formData.append("expected_arrival_date", finalEdd)
        formData.append("total_price", finalPrice)
        formData.append("total_weight", finalWeight)
        formData.append("admin_reply", adminReply.trim())

        if(Number(finalPrice || 0) < 1 || Number(finalWeight || 0.01) < 0.01){
            toast.error("Input Price and Weight for Air GZ or Air HK")
            setIsCreatingShipmentData(false)
            return 
        }

        try{
            const res = await fetch(`/api/shipments`, {
                method: "POST",
                body: formData
            })
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("Shipment created")
            fetchShipmentData()
        }
        catch(err: any){
            console.error(err.message, err)
            toast.error(err.message)
        }
        finally{
            setIsCreatingShipmentData(false)
            setIsModalActive(false)
            setModalSelectedRequest(null)
            setLibraryMedia([])
        }
    }


    const shipmentRequestColumnDef = [
        columnHelper.accessor("id", {
            header: "Id"
        }),
        columnHelper.accessor("customer_code", {
            header: "Customer Code"
        }),
        columnHelper.accessor("channel", {
            header: "Channel"
        }),
        columnHelper.display({
            header: "No. Of Packages",
            cell: ({row}) => <p>{row.original.package_ids.length}</p>
        }),
        columnHelper.accessor("total_pieces", {
            header: "PCS",
            cell: ({ getValue, row }) => <span className="tabular-nums font-semibold">{getValue() ?? row.original.package_ids?.length ?? 1}</span>
        }),
        columnHelper.accessor("loading_date", {
            header: "LD",
            cell: ({ getValue }) => {
                const val = getValue()
                return val ? <span>{new Date(val).toLocaleDateString()}</span> : <span style={{ color: "var(--color-dheir-muted)" }}>-</span>
            }
        }),
        columnHelper.accessor("expected_arrival_date", {
            header: "EDD",
            cell: ({ getValue }) => {
                const val = getValue()
                return val ? <span>{new Date(val).toLocaleDateString()}</span> : <span style={{ color: "var(--color-dheir-muted)" }}>-</span>
            }
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: ({ getValue }) => {
                const status = getValue()
                let className = "portal-packages__badge"
                if (status === "pending") className = "portal-packages__badge portal-packages__badge--orange"
                else if (status === "vetted") className = "portal-packages__badge portal-packages__badge--blue"
                else if (status === "accepted") className = "portal-packages__badge portal-packages__badge--green"
                else if (status === "rejected") className = "portal-packages__badge portal-packages__badge--muted"
                return <span className={className}>{status}</span>
            }
        }),
        columnHelper.accessor("packaging", {
            header: "Packaging type"
        }),
        columnHelper.accessor("created_at", {
            header: "Requested at",
            cell: ({getValue}) => <p>{new Date(getValue()).toDateString()}</p>,
        }),
        columnHelper.display({
            id: "Details",
            cell: ({row}) => 
            <button 
            className="portal-home__table-btn"
            onClick={() => {
                setModalSelectedRequest(row.original)
                setIsModalActive(true)
                setRejectionNote(row.original.rejection_note || "")
                setIsRejecting(false)
            }}>
                View Request
            </button>
        })
    ]



    useEffect(() => {
    
        fetchShipmentData()
    
    }, [])

    const data = shipmentRequests.filter((x) =>
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
          <div className="portal-home__stats" role="list" aria-label="Shipment requests status">
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconClock size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Pending</span>
                <span className="portal-home__stat-card-value">
                  {shipmentRequests.filter((x) => x.status === "pending").length}
                </span>
              </span>
            </div>
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconFileSearch size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Vetted</span>
                <span className="portal-home__stat-card-value">
                  {shipmentRequests.filter((x) => x.status === "vetted").length}
                </span>
              </span>
            </div>
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconCircleX size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Rejected</span>
                <span className="portal-home__stat-card-value">
                  {shipmentRequests.filter((x) => x.status === "rejected").length}
                </span>
              </span>
            </div>
            <div className="portal-home__stat-card" role="listitem">
              <span className="portal-home__stat-card-icon" aria-hidden>
                <IconChecks size={22} stroke={1.5} />
              </span>
              <span className="portal-home__stat-card-body">
                <span className="portal-home__stat-card-label">Accepted</span>
                <span className="portal-home__stat-card-value">
                  {shipmentRequests.filter((x) => x.status === "accepted").length}
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

          <section className="portal-home__panel" aria-labelledby="shipment-requests-heading">
            <div className="portal-home__panel-head">
              <div>
                <h2 id="shipment-requests-heading" className="portal-home__section-title">
                  Shipment records
                </h2>
                <p className="portal-home__section-sub">
                  A live overview of all shipment requests in the system.
                </p>
              </div>
            </div>
            {shipmentRequests ? (
              <Table
                importedData={data}
                columnDef={shipmentRequestColumnDef}
                globalFilter={`${filterValues.search}`}
                pageSize={15}
                enableRowSelection
                getRowId={(row) => String(row.id)}
                onDeleteSelected={deleteShipmentRequests}
              />
            ) : null}
          </section>



        {isModalActive ? (
          <div
            className="dheir-dialog-backdrop"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalActive(false)
            }}
          >
            <div className="dheir-dialog admin-modal" role="dialog" aria-modal="true" aria-label="Request details">
              <div className="dheir-dialog__head">
                <div>
                  <h2 className="dheir-dialog__title">Request details ({modalSelectedRequest?.status})</h2>
                  <p className="admin-modal__subtitle">
                    {modalSelectedRequest?.status === "pending"
                      ? "Vet the consolidation request. Decide to accept or reject."
                      : modalSelectedRequest?.status === "vetted"
                      ? "Set final price and weight details to generate the active shipment."
                      : modalSelectedRequest?.status === "rejected"
                      ? "Review the rejected request details."
                      : "Review the details of this completed shipment request."}
                  </p>
                </div>
                <button
                  type="button"
                  className="dheir-dialog__close"
                  onClick={() => setIsModalActive(false)}
                  aria-label="Close"
                  disabled={isCreatingShipmentData}
                >
                  <IconX size={20} stroke={1.5} aria-hidden />
                </button>
              </div>

              <div className="admin-modal__body">
                <form onSubmit={handleSubmit} className="admin-modal__form">
                  <div className="admin-modal__fields">
                    <div className="portal-packages__field">
                      <span className="portal-packages__field-label">Requested at</span>
                      <p className="portal-home__empty" style={{ color: "var(--color-dheir-ink)" }}>
                        {modalSelectedRequest?.created_at
                          ? new Date(modalSelectedRequest.created_at).toDateString()
                          : "-"}
                      </p>
                    </div>

                    <div className="portal-packages__field">
                      <span className="portal-packages__field-label">Customer code</span>
                      <p className="portal-home__empty" style={{ color: "var(--color-dheir-ink)" }}>
                        {modalSelectedRequest?.customer_code || "-"}
                      </p>
                    </div>

                    <div className="portal-packages__field">
                      <span className="portal-packages__field-label">Channel requested</span>
                      <p className="portal-home__empty capitalize" style={{ color: "var(--color-dheir-ink)" }}>
                        {modalSelectedRequest?.channel || "-"}
                      </p>
                    </div>

                    <div className="portal-packages__field">
                      <span className="portal-packages__field-label">Payment time</span>
                      <p className="portal-home__empty capitalize" style={{ color: "var(--color-dheir-ink)" }}>
                        {modalSelectedRequest?.payment_time?.replaceAll("_", " ") || "-"}
                      </p>
                    </div>

                    <div className="portal-packages__field">
                      <span className="portal-packages__field-label">Packaging type</span>
                      <p className="portal-home__empty" style={{ color: "var(--color-dheir-ink)" }}>
                        {modalSelectedRequest?.packaging || "-"}
                      </p>
                    </div>

                    <div className="portal-packages__field">
                      <span className="portal-packages__field-label">
                        Package IDs ({modalSelectedRequest?.package_ids?.length ?? 0})
                      </span>
                      <p className="portal-home__empty tabular-nums" style={{ color: "var(--color-dheir-ink)" }}>
                        {(modalSelectedRequest?.package_ids ?? []).join(", ") || "-"}
                      </p>
                    </div>

                    <div className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
                      <span className="portal-packages__field-label">Customer note</span>
                      <p className="admin-shipment-view__note" style={{ marginTop: 8 }}>
                        {modalSelectedRequest?.customer_note || "-"}
                      </p>
                    </div>

                    {modalSelectedRequest?.status === "rejected" && (
                      <div className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
                        <span className="portal-packages__field-label" style={{ color: "var(--color-dheir-orange)" }}>Rejection Note</span>
                        <p className="admin-shipment-view__note" style={{ marginTop: 8, color: "var(--color-dheir-orange)", fontWeight: 500 }}>
                          {modalSelectedRequest?.rejection_note || "No feedback provided."}
                        </p>
                      </div>
                    )}

                    {modalSelectedRequest?.status === "accepted" && (
                      <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {(modalSelectedRequest.air_gz_cost != null || modalSelectedRequest.air_gz_weight != null) && (
                          <div style={{ padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#f8fafc" }}>
                            <strong style={{ fontSize: "12px", color: "var(--color-dheir-blue)" }}>✈️ Air GZ Cargo (Guangzhou)</strong>
                            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "4px", fontSize: "12px", color: "var(--color-dheir-ink)" }}>
                              <span><strong>Cost:</strong> ₦{Number(modalSelectedRequest.air_gz_cost || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
                              <span><strong>Weight:</strong> {Number(modalSelectedRequest.air_gz_weight || 0).toFixed(2)} KG</span>
                              <span><strong>Pieces:</strong> {modalSelectedRequest.air_gz_pieces || 1} PCS</span>
                              {modalSelectedRequest.air_gz_loading_date && <span><strong>LD:</strong> {modalSelectedRequest.air_gz_loading_date.split("T")[0]}</span>}
                              {modalSelectedRequest.air_gz_expected_arrival_date && <span><strong>EDD:</strong> {modalSelectedRequest.air_gz_expected_arrival_date.split("T")[0]}</span>}
                            </div>
                          </div>
                        )}
                        {(modalSelectedRequest.air_hk_cost != null || modalSelectedRequest.air_hk_weight != null) && (
                          <div style={{ padding: "10px 12px", border: "1px solid #fed7aa", borderRadius: "6px", background: "#fffaf5" }}>
                            <strong style={{ fontSize: "12px", color: "var(--color-dheir-orange)" }}>✈️ Air HK Cargo (Hong Kong)</strong>
                            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "4px", fontSize: "12px", color: "var(--color-dheir-ink)" }}>
                              <span><strong>Cost:</strong> ₦{Number(modalSelectedRequest.air_hk_cost || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
                              <span><strong>Weight:</strong> {Number(modalSelectedRequest.air_hk_weight || 0).toFixed(2)} KG</span>
                              <span><strong>Pieces:</strong> {modalSelectedRequest.air_hk_pieces || 1} PCS</span>
                              {modalSelectedRequest.air_hk_loading_date && <span><strong>LD:</strong> {modalSelectedRequest.air_hk_loading_date.split("T")[0]}</span>}
                              {modalSelectedRequest.air_hk_expected_arrival_date && <span><strong>EDD:</strong> {modalSelectedRequest.air_hk_expected_arrival_date.split("T")[0]}</span>}
                            </div>
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f1f5f9", borderRadius: "6px", fontSize: "12px" }}>
                          <span><strong>Total Price:</strong> {modalSelectedRequest.total_price != null ? `₦${Number(modalSelectedRequest.total_price).toLocaleString("en-NG", { minimumFractionDigits: 2 })}` : "Not recorded"}</span>
                          <span><strong>Total Weight:</strong> {modalSelectedRequest.total_weight != null ? `${Number(modalSelectedRequest.total_weight).toFixed(2)} ${(modalSelectedRequest.total_weight_unit ?? "kg").toUpperCase()}` : "Not recorded"}</span>
                          <span><strong>Total Pieces:</strong> {modalSelectedRequest.total_pieces || 1} PCS</span>
                        </div>
                      </div>
                    )}

                    {modalSelectedRequest?.status === "vetted" && (
                      modalSelectedRequest.channel === "sea" ? (
                        <>
                          <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Total price (₦)</span>
                            <input
                              type="number"
                              name="total_price"
                              className="dheir-input"
                              value={totalPrice}
                              onChange={(e) => setTotalPrice(e.target.value)}
                              min={0}
                              step="0.01"
                              required
                            />
                          </label>

                          <label className="portal-packages__field">
                            <span className="portal-packages__field-label">
                              {getProductWeightFieldLabel(weightUnit)}
                            </span>
                            <input
                              type="number"
                              name="total_weight"
                              className="dheir-input"
                              value={totalWeight}
                              onChange={(e) => setTotalWeight(e.target.value)}
                              min={0}
                              step="0.01"
                              required
                            />
                          </label>

                          <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Pieces (PCS)</span>
                            <input
                              type="number"
                              name="total_pieces"
                              className="dheir-input"
                              value={totalPieces}
                              onChange={(e) => setTotalPieces(e.target.value)}
                              min={1}
                              step="1"
                              placeholder="e.g. 5"
                              required
                            />
                          </label>

                          <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Loading Date (LD)</span>
                            <input
                              type="date"
                              name="loading_date"
                              className="dheir-input"
                              value={loadingDate}
                              onChange={(e) => setLoadingDate(e.target.value)}
                            />
                          </label>

                          <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Expected Arrival Date (EDD)</span>
                            <input
                              type="date"
                              name="expected_arrival_date"
                              className="dheir-input"
                              value={expectedArrivalDate}
                              onChange={(e) => setExpectedArrivalDate(e.target.value)}
                            />
                          </label>
                        </>
                      ) : (
                        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {/* Air GZ Box */}
                          <div style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#f8fafc" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "4px" }}>
                              <strong style={{ fontSize: "13px", color: "var(--color-dheir-blue)" }}>✈️ Air GZ Cargo (Guangzhou - Normal Goods)</strong>
                              <span style={{ fontSize: "11px", color: "var(--color-dheir-muted)" }}>Clothes, bags, shoes, general items</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                              <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Price (₦)</span>
                                <input
                                  type="number"
                                  className="dheir-input"
                                  value={airGzPrice}
                                  onChange={(e) => setAirGzPrice(e.target.value)}
                                  min={0}
                                  step="0.01"
                                  placeholder="e.g. 25000"
                                />
                              </label>
                              <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Weight (KG)</span>
                                <input
                                  type="number"
                                  className="dheir-input"
                                  value={airGzWeight}
                                  onChange={(e) => setAirGzWeight(e.target.value)}
                                  min={0}
                                  step="0.01"
                                  placeholder="e.g. 5.2"
                                />
                              </label>
                              <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Pieces (PCS)</span>
                                <input
                                  type="number"
                                  className="dheir-input"
                                  value={airGzPieces}
                                  onChange={(e) => setAirGzPieces(e.target.value)}
                                  min={1}
                                  step="1"
                                  placeholder="e.g. 3"
                                />
                              </label>
                              <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Loading Date (LD)</span>
                                <input
                                  type="date"
                                  className="dheir-input"
                                  value={airGzLoadingDate}
                                  onChange={(e) => setAirGzLoadingDate(e.target.value)}
                                />
                              </label>
                              <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Arrival Date (EDD)</span>
                                <input
                                  type="date"
                                  className="dheir-input"
                                  value={airGzExpectedArrivalDate}
                                  onChange={(e) => setAirGzExpectedArrivalDate(e.target.value)}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Air HK Box */}
                          <div style={{ padding: "12px", border: "1px solid #fed7aa", borderRadius: "8px", background: "#fffaf5" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "4px" }}>
                              <strong style={{ fontSize: "13px", color: "var(--color-dheir-orange)" }}>✈️ Air HK Cargo (Hong Kong - Sensitive Goods)</strong>
                              <span style={{ fontSize: "11px", color: "var(--color-dheir-muted)" }}>Phones, batteries, liquids, branded items</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                              <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Price (₦)</span>
                                <input
                                  type="number"
                                  className="dheir-input"
                                  value={airHkPrice}
                                  onChange={(e) => setAirHkPrice(e.target.value)}
                                  min={0}
                                  step="0.01"
                                  placeholder="e.g. 15000"
                                />
                              </label>
                              <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Weight (KG)</span>
                                <input
                                  type="number"
                                  className="dheir-input"
                                  value={airHkWeight}
                                  onChange={(e) => setAirHkWeight(e.target.value)}
                                  min={0}
                                  step="0.01"
                                  placeholder="e.g. 2.1"
                                />
                              </label>
                              <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Pieces (PCS)</span>
                                <input
                                  type="number"
                                  className="dheir-input"
                                  value={airHkPieces}
                                  onChange={(e) => setAirHkPieces(e.target.value)}
                                  min={1}
                                  step="1"
                                  placeholder="e.g. 1"
                                />
                              </label>
                              <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Loading Date (LD)</span>
                                <input
                                  type="date"
                                  className="dheir-input"
                                  value={airHkLoadingDate}
                                  onChange={(e) => setAirHkLoadingDate(e.target.value)}
                                />
                              </label>
                              <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Arrival Date (EDD)</span>
                                <input
                                  type="date"
                                  className="dheir-input"
                                  value={airHkExpectedArrivalDate}
                                  onChange={(e) => setAirHkExpectedArrivalDate(e.target.value)}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Combined Summary */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f1f5f9", borderRadius: "6px", fontSize: "13px", flexWrap: "wrap", gap: "8px" }}>
                            <span><strong>Total Calculated Price:</strong> ₦{((Number(airGzPrice) || 0) + (Number(airHkPrice) || 0)).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
                            <span><strong>Total Weight:</strong> {((Number(airGzWeight) || 0) + (Number(airHkWeight) || 0)).toFixed(2)} KG</span>
                            <span><strong>Total Pieces:</strong> {((Number(airGzPieces) || 0) + (Number(airHkPieces) || 0)) || 1} PCS</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {modalSelectedRequest?.status === "vetted" && (
                    <div className="admin-uploader">
                      <div className="admin-uploader__row">
                        <div>
                          <p className="portal-packages__field-label" style={{ margin: 0 }}>
                            Images
                          </p>
                          <p className="admin-uploader__help">
                            Choose photos or videos from the media library (required).
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            type="button"
                            className="portal-home__btn portal-home__btn--secondary"
                            disabled={isCreatingShipmentData}
                            onClick={() => setPickerOpen(true)}
                          >
                            <span className="inline-flex items-center gap-2">
                              Choose from library <FaImage />
                            </span>
                          </button>
                          <button
                            type="button"
                            className="portal-home__btn portal-home__btn--primary"
                            disabled={isCreatingShipmentData}
                            onClick={() => setUploadOpen(true)}
                          >
                            Upload
                          </button>
                        </div>
                      </div>

                      {libraryMedia.length > 0 ? (
                        <div className="admin-uploader__previews">
                          {libraryMedia.map((item) => (
                            <div key={item.id} className="admin-uploader__preview">
                              {item.mediaType === "video" ? (
                                <video
                                  src={item.publicUrl}
                                  muted
                                  playsInline
                                  preload="metadata"
                                  className="object-cover"
                                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                                />
                              ) : (
                                <Image src={item.publicUrl} alt="" fill className="object-cover" unoptimized />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="admin-uploader__help">No media selected yet.</p>
                      )}
                    </div>
                  )}

                   {/* Admin Reply - Read-only for completed status, editable for vetting/pending */}
                   {(modalSelectedRequest?.status === "accepted" || modalSelectedRequest?.status === "rejected") ? (
                     modalSelectedRequest?.admin_reply ? (
                       <div className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
                         <span className="portal-packages__field-label">Admin Reply</span>
                         <p className="admin-shipment-view__note" style={{ marginTop: 8 }}>
                           {modalSelectedRequest.admin_reply}
                         </p>
                       </div>
                     ) : null
                   ) : (
                     <div className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
                       <span className="portal-packages__field-label">Admin Reply</span>
                       <textarea
                         className="dheir-input"
                         rows={2}
                         value={adminReply}
                         onChange={(e) => setAdminReply(e.target.value)}
                         placeholder="Add reply or internal feedback..."
                         style={{ width: "100%", marginTop: 8 }}
                       />
                     </div>
                   )}

                  {modalSelectedRequest?.status === "pending" && isRejecting && (
                    <div className="portal-packages__field" style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
                      <span className="portal-packages__field-label">Rejection Reason / Note</span>
                      <textarea
                        className="dheir-input"
                        rows={3}
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                        placeholder="Provide details on why this request is being rejected..."
                        required
                        style={{ width: "100%", marginTop: 8 }}
                      />
                    </div>
                  )}

                  <MediaPickerModal
                    open={pickerOpen}
                    maxCount={8}
                    minCount={1}
                    initialSelected={libraryMedia}
                    title="Shipment media"
                    onClose={() => setPickerOpen(false)}
                    onConfirm={setLibraryMedia}
                  />

                  <MediaUploadModal
                    open={uploadOpen}
                    onClose={() => setUploadOpen(false)}
                    onFinished={(assets) => {
                      setLibraryMedia((prev) => [...prev, ...assets])
                      setUploadOpen(false)
                    }}
                  />

                  <div className="admin-modal__actions">
                    <button
                      type="button"
                      className="portal-home__btn portal-home__btn--secondary"
                      onClick={() => setIsModalActive(false)}
                      disabled={isCreatingShipmentData}
                    >
                      Close
                    </button>

                    {modalSelectedRequest?.status === "pending" && (
                      <>
                        {!isRejecting ? (
                          <>
                            <button
                              type="button"
                              className="portal-home__btn portal-home__btn--secondary"
                              style={{ borderColor: "var(--color-dheir-orange)", color: "var(--color-dheir-orange)" }}
                              disabled={isCreatingShipmentData}
                              onClick={() => setIsRejecting(true)}
                            >
                              Reject Request
                            </button>
                            <button
                              type="button"
                              className="portal-home__btn portal-home__btn--primary"
                              disabled={isCreatingShipmentData}
                              onClick={() => handleVetRequest("accept")}
                            >
                              {isCreatingShipmentData ? (
                                <DHEIRLoader color="#fff" size={10} />
                              ) : (
                                <span className="inline-flex items-center gap-2">
                                  <BiCheck className="text-lg" />
                                  Accept Request
                                </span>
                              )}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="portal-home__btn portal-home__btn--secondary"
                              onClick={() => setIsRejecting(false)}
                              disabled={isCreatingShipmentData}
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              className="portal-home__btn portal-home__btn--primary"
                              style={{ backgroundColor: "var(--color-dheir-orange)", borderColor: "var(--color-dheir-orange)" }}
                              disabled={isCreatingShipmentData}
                              onClick={() => handleVetRequest("reject")}
                            >
                              {isCreatingShipmentData ? (
                                <DHEIRLoader color="#fff" size={10} />
                              ) : (
                                <span>Submit Rejection</span>
                              )}
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {modalSelectedRequest?.status === "vetted" && (
                      <button
                        type="submit"
                        className="portal-home__btn portal-home__btn--primary"
                        disabled={isCreatingShipmentData}
                      >
                        {isCreatingShipmentData ? (
                          <DHEIRLoader color="#fff" size={10} />
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <BiCheck className="text-lg" />
                            Generate Shipment
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}
    </>
  )}
  </div>
  )
}

export default Page