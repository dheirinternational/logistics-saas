"use client"

import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import { MediaUploadModal } from "@/components/admin/media/MediaUploadModal";
import { usePackageStore } from "@/store/incomingPackagesStore";
import { useShipmentStore } from "@/store/shipmentsStore";
import { useEditModalStore } from "@/types/editModalStore";
import type { AdminMediaItem } from "@/lib/media/adminMedia";
import { Warehouse } from "@/types/entityTypeDef";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { FaGlobe, FaImage, FaPlus } from "react-icons/fa";
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast";
import { IconX } from "@tabler/icons-react"
import { DHEIRSelect } from "@/components/ui/DHEIRSelect"
import { AdminShipmentViewModal } from "@/components/admin/shipments/AdminShipmentViewModal"
import CreateShipmentRequestModal from "@/components/admin/shipments/forms/CreateShipmentRequestModal"
import CreateManualShipmentModal from "@/components/admin/shipments/forms/CreateManualShipmentModal"

const pages = [
    {
        name: "expected_shipments",
        link: "/admin/shipments"
    },
    {
        name: "shipment_requests",
        link: "/admin/shipments/requests"
    },
    {
        name: "accepted_requests",
        link: "/admin/shipments/accepted_shipments"
    }
]

export default function ShipmentsLayouts({ children }: { children: ReactNode }) {

    const pathName = usePathname()
    const { isModalActive, setIsModalActive, closeModal } = useEditModalStore()
    const { selectedPackage, setSelectedPackage, setReadOnly, resetSelectedPackage } = usePackageStore()
    const { selectedShipment, resetSelectedShipment, setShipmentrigger } = useShipmentStore()


    const [currentPage, setCurrentPage] = useState<"expected_shipments" | "shipment_requests" | "accepted_requests" | "">("")
    const [isPageSelectorActive, setIsPageSelectorActive] = useState(false)

    // Cached states
    const [cachedCustomers, setCachedCustomers] = useState<any[]>([])
    const [cachedPackages, setCachedPackages] = useState<any[]>([])
    const [cachedWarehouses, setCachedWarehouses] = useState<Warehouse[]>([])
    const [cacheLoaded, setCacheLoaded] = useState(false)

    useEffect(() => {
        async function prefetchData() {
            try {
                const [usersRes, pkgsRes, whsRes] = await Promise.all([
                    fetch("/api/users"),
                    fetch("/api/packages"),
                    fetch("/api/warehouses")
                ])
                const usersData = await usersRes.json()
                const pkgsData = await pkgsRes.json()
                const whsData = await whsRes.json()

                if (usersData.success) setCachedCustomers(usersData.data || [])
                if (pkgsData.success) setCachedPackages(pkgsData.data || [])
                if (whsData.success) setCachedWarehouses(whsData.data || [])
            } catch (err) {
                console.error("Error prefetching layout data", err)
            } finally {
                setCacheLoaded(true)
            }
        }
        prefetchData()
    }, [])

    useEffect(() => {
        function setPageTitle() {
            switch (pathName) {
                case "/admin/shipments/requests":
                    setCurrentPage("shipment_requests")
                    break
                case "/admin/shipments":
                    setCurrentPage("expected_shipments")
                    break
                case "/admin/shipments/accepted_shipments":
                    setCurrentPage("accepted_requests")
                    break
            }

        }

        setPageTitle()
    }, [pathName])


    // Set Selected Edit component based on page
    const EditComponent = () => {
        if (selectedPackage) {
            return <IncomingPackageEditComponent preloadedWarehouses={cachedWarehouses} />
        }
        switch (currentPage) {
            case "expected_shipments":
                return <IncomingPackageEditComponent preloadedWarehouses={cachedWarehouses} />
            case "shipment_requests":
                return (
                    <CreateShipmentRequestModal
                        onClose={closeShipmentsModal}
                        onSuccess={() => {
                            closeShipmentsModal()
                            window.location.reload()
                        }}
                        preloadedCustomers={cachedCustomers}
                        preloadedPackages={cachedPackages}
                    />
                )
            case "accepted_requests":
                if (selectedShipment) {
                    return <AdminShipmentViewModal />
                } else {
                    return (
                        <CreateManualShipmentModal
                            onClose={closeShipmentsModal}
                            onSuccess={() => {
                                closeShipmentsModal()
                                setShipmentrigger()
                            }}
                            preloadedCustomers={cachedCustomers}
                            preloadedPackages={cachedPackages}
                            preloadedWarehouses={cachedWarehouses}
                        />
                    )
                }
            default:
                return <div></div>
        }
    }

    const closeShipmentsModal = () => {
        closeModal()
        resetSelectedPackage()
        if (currentPage === "accepted_requests") {
            resetSelectedShipment()
        }
    }

    let modalTitle = "Add package"
    let modalSubtitle = "Add packages to warehouse with photos and details."

    if (selectedPackage) {
        modalTitle = "Edit package details"
        modalSubtitle = "Update stored package weight, dimensions, and photos."
    } else if (currentPage === "expected_shipments") {
        modalTitle = "Add package"
        modalSubtitle = "Add expected package to warehouse with photos and details."
    } else if (currentPage === "shipment_requests") {
        modalTitle = "Add shipment request"
        modalSubtitle = "Submit a consolidation shipment request on behalf of a customer."
    } else if (currentPage === "accepted_requests") {
        if (selectedShipment) {
            modalTitle = "View shipment"
            modalSubtitle = "View shipment details and update status."
        } else {
            modalTitle = "Add shipment"
            modalSubtitle = "Manually generate a new shipment with price, weight, and photos."
        }
    }

    return (
        <div className='max-h-full h-full overflow-hidden relative flex'>
            <div className="portal-home overflow-y-auto max-h-full h-full flex-1">
                <header className="portal-home__greeting">
                    <div>
                        <p className="portal-home__greeting-label">Admin</p>
                        <h1 className="portal-home__greeting-title">Shipments</h1>
                        <p className="portal-home__greeting-sub">
                            Monitor, filter, and manage shipments from one control deck.
                        </p>
                    </div>
                </header>

                <div className="portal-home__toolbar">
                    <div className="portal-home__tabs" role="tablist" aria-label="Shipments pages">
                        {pages.map((x) => {
                            const isActive = pathName === x.link
                            return (
                                <Link
                                    key={x.name}
                                    href={x.link}
                                    className={`portal-home__tab${isActive ? " is-active" : ""}`}
                                    role="tab"
                                    aria-selected={isActive}
                                >
                                    {`${x.name.charAt(0).toUpperCase() + x.name.slice(1)}`.split("_").join(" ")}
                                </Link>
                            )
                        })}
                    </div>

                    {currentPage === "expected_shipments" || currentPage === "shipment_requests" || currentPage === "accepted_requests" ? (
                        <button
                            type="button"
                            className="portal-home__btn portal-home__btn--primary"
                            onClick={() => {
                                setReadOnly()
                                resetSelectedPackage() // Make sure selectedPackage is reset so it triggers creation modal components
                                if (currentPage === "expected_shipments") {
                                    setSelectedPackage({
                                        id: 0,
                                        incoming_package_id: "",
                                        package_name: "",
                                        user_id: 0,
                                        customer_code: "",
                                        warehouse_id: 0,
                                        weight: 0,
                                        amount: 0,
                                        condition: "good",
                                        status: "stored",
                                        received_at: "",
                                        stored_at: "",
                                        created_at: "",
                                    })
                                }
                                setIsModalActive()
                            }}
                        >
                            {currentPage === "expected_shipments"
                                ? "Add package"
                                : currentPage === "shipment_requests"
                                ? "Add request"
                                : "Add shipment"}
                        </button>
                    ) : null}
                </div>

                {children}

            </div>

            {isModalActive ? (
                <div
                    className="dheir-dialog-backdrop"
                    role="presentation"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeShipmentsModal()
                    }}
                >
                    <div
                        className="dheir-dialog admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={modalTitle}
                    >
                        <div className="dheir-dialog__head">
                            <div>
                                <h2 className="dheir-dialog__title">{modalTitle}</h2>
                                <p className="admin-modal__subtitle">
                                    {modalSubtitle}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="dheir-dialog__close"
                                onClick={closeShipmentsModal}
                                aria-label="Close"
                            >
                                <IconX size={20} stroke={1.5} />
                            </button>
                        </div>
                        <div className="admin-modal__body">
                            {EditComponent()}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}





const IncomingPackageEditComponent = ({ preloadedWarehouses }: { preloadedWarehouses?: Warehouse[] }) => {

    const { setIsModalActive } = useEditModalStore()
    const { selectedPackage, handleSelectedPackageInput, handleSelectedPackageSelect, setPackageWarehouse, resetSelectedPackage, setTrigger, readonly } = usePackageStore()

    // Arrays
    const [warehouses, setWarehouses] = useState<Warehouse[]>(preloadedWarehouses || [])
    const [libraryMedia, setLibraryMedia] = useState<AdminMediaItem[]>([])
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploadOpen, setUploadOpen] = useState(false)

    // Selected Objects
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)


    // Fetching Data indicators 
    const [isFetchingWarehouse, setIsFetchingWarehouse] = useState(!preloadedWarehouses)
    const [isUploadingPackage, setIsUploadingPackage] = useState(false)


    // Set DropDown States
    const [isWarehouseDropDownActive, setIsWarehouseDropDownActice] = useState(false)
    // Fetch Warehouses
    const fetchWarehouses = async () => {
        setIsFetchingWarehouse(true)
        try {
            const res = await fetch(`/api/warehouses`)
            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
                return
            }

            setWarehouses(result.data)

        }
        catch (err) {
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally {
            setIsFetchingWarehouse(false)
        }
    }

    // handle uploading packages
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsUploadingPackage(true)

        const formData = new FormData(e.currentTarget)
        libraryMedia.forEach((item) => {
            formData.append("media_asset_ids", String(item.id))
        })
        formData.append("inp_status", "stored")
        formData.append("user_id", String(selectedPackage?.user_id))

        try {
            const res = await fetch("/api/packages", {
                method: "POST",
                body: formData
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
                return
            }

            toast.success("Successfully Added package")
            setTrigger()
            resetSelectedPackage()
            setIsModalActive()
        }
        catch (err) {
            toast.error("Network Error")
            console.error("Network Error", err)
        }
        finally {
            setIsUploadingPackage(false)

        }
    }


    // Fetch Data upon initial load 
    useEffect(() => {
        if (preloadedWarehouses && preloadedWarehouses.length > 0) {
            setWarehouses(preloadedWarehouses)
            setIsFetchingWarehouse(false)
            return
        }
        fetchWarehouses()
    }, [preloadedWarehouses])


    // Set Selected Warehouse
    useEffect(() => {
        if (!selectedPackage) return

        const warehouse = warehouses.find(warehouse =>
            selectedPackage.warehouse_id === warehouse.id
        )

        setSelectedWarehouse(warehouse || null)


    }, [selectedPackage])




    return (
        <form onSubmit={handleSubmit} className="admin-modal__form">
            {selectedPackage ? (
                <>
                    <div className="admin-modal__fields">
                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Package name</span>
                            <input
                                type="text"
                                name="package_name"
                                className="dheir-input"
                                value={selectedPackage.package_name}
                                onChange={handleSelectedPackageInput}
                                required
                                readOnly={readonly}
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Warehouse</span>
                            <DHEIRSelect
                                name="warehouse_id"
                                value={String(selectedPackage.warehouse_id ?? "")}
                                onChange={(e) => setPackageWarehouse(Number(e.target.value))}
                                required
                            >
                                <option value="">Select warehouse</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </DHEIRSelect>
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Customer code</span>
                            <input
                                type="text"
                                name="customer_code"
                                className="dheir-input"
                                value={selectedPackage.customer_code}
                                onChange={handleSelectedPackageInput}
                                required
                                readOnly={readonly}
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Package identifier</span>
                            <input
                                type="text"
                                name="incoming_package_id"
                                className="dheir-input"
                                value={selectedPackage.incoming_package_id}
                                onChange={handleSelectedPackageInput}
                                required
                                readOnly={readonly}
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">
                                {selectedPackage.weight_unit === "cbm" ? "Volume (CBM)" : "Weight (kg)"}
                            </span>
                            <input
                                type="number"
                                name="weight"
                                className="dheir-input"
                                value={selectedPackage.weight}
                                onChange={handleSelectedPackageInput}
                                min={0}
                                step="0.01"
                                required
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Unit</span>
                            <DHEIRSelect
                                name="weight_unit"
                                value={selectedPackage.weight_unit ?? "kg"}
                                onChange={handleSelectedPackageSelect}
                                required
                            >
                                <option value="kg">KG</option>
                                <option value="cbm">CBM</option>
                            </DHEIRSelect>
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">No. of items</span>
                            <input
                                type="number"
                                name="amount"
                                className="dheir-input"
                                value={selectedPackage.amount}
                                onChange={handleSelectedPackageInput}
                                min={0}
                                required
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Condition</span>
                            <input
                                type="text"
                                name="condition"
                                className="dheir-input"
                                value={selectedPackage.condition}
                                onChange={handleSelectedPackageInput}
                                required
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Received</span>
                            <input
                                type="date"
                                name="received_at"
                                className="dheir-input"
                                value={selectedPackage.received_at}
                                onChange={handleSelectedPackageInput}
                                required
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Stored</span>
                            <input
                                type="date"
                                name="stored_at"
                                className="dheir-input"
                                value={selectedPackage.stored_at}
                                onChange={handleSelectedPackageInput}
                                required
                            />
                        </label>
                    </div>

                    <div className="admin-uploader">
                        <div className="admin-uploader__row">
                            <div>
                                <p className="portal-packages__field-label" style={{ margin: 0 }}>
                                    Photos
                                </p>
                                <p className="admin-uploader__help">
                                    Optional, hoose photos or videos from the media library.
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    type="button"
                                    className="portal-home__btn portal-home__btn--secondary"
                                    onClick={() => setPickerOpen(true)}
                                >
                                    Choose from library
                                </button>
                                <button
                                    type="button"
                                    className="portal-home__btn portal-home__btn--primary"
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
                        minCount={0}
                        initialSelected={libraryMedia}
                        title="Package media"
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
                            type="submit"
                            className="portal-home__btn portal-home__btn--primary"
                            disabled={isUploadingPackage}
                        >
                            {isUploadingPackage ? (
                                <DHEIRLoader color="#fff" size={10} />
                            ) : (
                                "Add package"
                            )}
                        </button>
                    </div>
                </>
            ) : (
                <div className="portal-home__panel-empty">
                    <p className="portal-home__section-sub">
                        Select an incoming package to add details.
                    </p>
                </div>
            )}
        </form>
    )
}




