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
import { DheirLoader } from "@/components/ui/DheirLoader"
import { DheirSelect } from "@/components/ui/DheirSelect"
import { matchesStatusFilter } from "@/lib/admin/tableFilters"
import { toast } from "@/lib/ui/toast"
import { IconChecks, IconClock } from "@tabler/icons-react"
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
    const [weightUnit, setWeightUnit] = useState<"kg" | "cbm">("kg")
    const [libraryMedia, setLibraryMedia] = useState<AdminMediaItem[]>([])
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploadOpen, setUploadOpen] = useState(false)



    const [isDataLoading, setIsDataLoading] = useState(true)
    const [isCreatingShipmentData, setIsCreatingShipmentData] = useState(false)
    const [isModalActive, setIsModalActive] = useState(false)
    
    
    
    const [filterValues, setFilterValues] = useState<SearchProps>({
        search: "",
        status: "",
    })

    const [modalSelectedRequest, setModalSelectedRequest] = useState<null | ShippingRequest>(null)
    
    useEffect(() => {
        const inferred = modalSelectedRequest?.channel === "sea" ? "cbm" : "kg"
        setWeightUnit((modalSelectedRequest?.total_weight_unit as any) ?? inferred)
        if (modalSelectedRequest?.total_weight != null) {
            setTotalWeight(String(Number(modalSelectedRequest.total_weight).toFixed(2)))
        }
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


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (libraryMedia.length < 1) {
            toast.error("Select at least one item from the media library")
            return
        }

        setIsCreatingShipmentData(true)
        const formData = new FormData(e.currentTarget)

        libraryMedia.forEach((item) => {
            formData.append("media_asset_ids", String(item.id))
        })

        formData.append("customer_code", modalSelectedRequest?.customer_code || "")
        formData.append("origin_warehouse_id", "1")
        formData.append("destination_warehouse_id", "2")
        formData.append("channel", modalSelectedRequest?.channel || "")
        formData.append("shipment_request_id", modalSelectedRequest?.id || "")
        formData.append("shipment_request_id", modalSelectedRequest?.id || "")
        formData.append("shipment_note", modalSelectedRequest?.customer_note || "")
        formData.append("user_id", `${modalSelectedRequest?.user_id}` || "")
        formData.append("payment_time", `${modalSelectedRequest?.payment_time}` || "")
        formData.append("package_ids", `${modalSelectedRequest?.package_ids}` || "")
        formData.append("total_weight_unit", weightUnit)

        console.log(Object.fromEntries(formData))

        if(Number(formData.get("total_price") || 0) < 1 || Number(formData.get("total_weight") || 0.01) < 0.01){
            toast.error("Input Price and Weight")
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
        columnHelper.accessor("status", {
            header: "Status"
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
            className={`portal-home__table-btn${row.original.status === "accepted" ? " hidden" : ""}`}
            onClick={() => {
                setModalSelectedRequest(row.original)
                setIsModalActive(true)
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
          <DheirLoader color="var(--color-dheir-blue)" size={12} />
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
                  <h2 className="dheir-dialog__title">Request details</h2>
                  <p className="admin-modal__subtitle">
                    Review the request, set price + {getProductWeightFieldLabel(weightUnit).toLowerCase()}, then accept.
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
                      <span className="portal-packages__field-label">Package IDs</span>
                      <p className="portal-home__empty tabular-nums" style={{ color: "var(--color-dheir-ink)" }}>
                        {(modalSelectedRequest?.package_ids ?? []).join(", ") || "-"}
                      </p>
                    </div>

                    <label className="portal-packages__field">
                      <span className="portal-packages__field-label">Total price (₦)</span>
                      <input
                        type="number"
                        name="total_price"
                        className="dheir-input"
                        value={totalPrice}
                        onChange={(e) => {
                          let { value } = e.currentTarget
                          value = value.replace(/^0+(?=\\d)/, "")
                          setTotalPrice(String(Number(value).toFixed(2)))
                        }}
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
                        onChange={(e) => {
                          let { value } = e.currentTarget
                          value = value.replace(/^0+(?=\\d)/, "")
                          setTotalWeight(String(Number(value).toFixed(2)))
                        }}
                        min={0}
                        step="0.01"
                        required
                      />
                    </label>

                    <label className="portal-packages__field">
                      <span className="portal-packages__field-label">Unit</span>
                      <DheirSelect
                        value={weightUnit}
                        onChange={(e) => setWeightUnit(e.target.value as "kg" | "cbm")}
                      >
                        <option value="kg">KG</option>
                        <option value="cbm">CBM</option>
                      </DheirSelect>
                    </label>

                    <div className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
                      <span className="portal-packages__field-label">Customer note</span>
                      <p className="admin-shipment-view__note" style={{ marginTop: 8 }}>
                        {modalSelectedRequest?.customer_note || "-"}
                      </p>
                    </div>
                  </div>

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
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="portal-home__btn portal-home__btn--primary"
                      disabled={isCreatingShipmentData}
                    >
                      {isCreatingShipmentData ? (
                        <DheirLoader color="#fff" size={10} />
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <BiCheck className="text-lg" />
                          Accept
                        </span>
                      )}
                    </button>
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