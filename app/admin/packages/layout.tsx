"use client"

import { usePackageStore } from "@/store/incomingPackagesStore";
import { useEditModalStore } from "@/types/editModalStore";
import { PackageImage, Warehouse } from "@/types/entityTypeDef";
import Image from "next/image";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { toast } from "@/lib/ui/toast";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import { MediaUploadModal } from "@/components/admin/media/MediaUploadModal";
import type { AdminMediaItem } from "@/lib/media/adminMedia";
import { DheirLoader } from "@/components/ui/DheirLoader";
import { IconX } from "@tabler/icons-react";
import { DheirSelect } from "@/components/ui/DheirSelect";
import { apiErrorMessage, parseJsonResponse } from "@/lib/api/parseJsonResponse";
import { toDateInputValue } from "@/lib/dates/toDateInputValue";

export default function PageLayout({children}: {children: ReactNode}){
    const { isModalActive, setIsModalActive } = useEditModalStore()
    const selectedPackage = usePackageStore((s) => s.selectedPackage)
    const isEditing = Number(selectedPackage?.id ?? 0) > 0

    return (
        <div className="h-full max-h-full w-full overflow-y-auto">
            <div className="p-body">{children}</div>

            {isModalActive ? (
                <div
                    className="dheir-dialog-backdrop"
                    role="presentation"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalActive()
                    }}
                >
                    <div
                        className="dheir-dialog admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={isEditing ? "Edit package" : "Add package"}
                    >
                        <div className="dheir-dialog__head">
                            <div>
                                <h2 className="dheir-dialog__title">
                                    {isEditing ? "Edit package" : "Add package"}
                                </h2>
                                <p className="admin-modal__subtitle">
                                    {isEditing
                                        ? "Update package details and optionally add photos."
                                        : "Register a package in the warehouse. Photos are optional."}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="dheir-dialog__close"
                                onClick={() => setIsModalActive()}
                                aria-label="Close"
                            >
                                <IconX size={20} stroke={1.5} />
                            </button>
                        </div>
                        <div className="admin-modal__body">
                            <PackageEditComponent />
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}



const PackageEditComponent = () => {

    const {setIsModalActive} = useEditModalStore()
    const {selectedPackage, handleSelectedPackageInput, handleSelectedPackageSelect, setPackageWarehouse, resetSelectedPackage, setTrigger, readonly} = usePackageStore()

    // Arrays
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [images, setImages] = useState<PackageImage[]>([])
    const [libraryMedia, setLibraryMedia] = useState<AdminMediaItem[]>([])
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploadOpen, setUploadOpen] = useState(false)

    // Selected Objects
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
        

    // Fetching Data indicators 
    const [isFetchingWarehouse, setIsFetchingWarehouse] = useState(true)
    const [isUploadingPackage, setIsUploadingPackage] = useState(false)
    const [isFetchingImages, setIsFetchingImages] = useState(false)

    const packageId = Number(selectedPackage?.id ?? 0)
    const isEditing = Number.isFinite(packageId) && packageId > 0


    // Fetch Warehouses
    const fetchWarehouses = async () => {
        setIsFetchingWarehouse(true)
        try{
            const res = await fetch(`/api/warehouses`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setWarehouses(result.data)

        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingWarehouse(false)
        }
    }

    // Fetch Images 
    const fetchImages = async () => {
        setIsFetchingImages(true)
        try{
            const res = await fetch(`/api/packages/images/${Number(selectedPackage?.id)}`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setImages(result.data ?? [])

        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingImages(false)
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

        try{
            const res = await fetch(
                isEditing ? `/api/packages/${packageId}` : "/api/packages",
                {
                    method: isEditing ? "PUT" : "POST",
                    credentials: "include",
                    body: formData
                }
            )

            const result = await parseJsonResponse(res)

            if(!res.ok){
                toast.error(apiErrorMessage(result, "Could not save package"))
                return
            }

            toast.success(isEditing ? "Package updated successfully" : "Successfully Added package")
            setTrigger()
            resetSelectedPackage()
            setIsModalActive()
            setImages([])
            setLibraryMedia([])
        }
        catch(err){
            const message = err instanceof Error ? err.message : "Network error"
            toast.error(message)
            console.error("Package save failed", err)
        }
        finally{
            setIsUploadingPackage(false)
            
        }
    }

    
    // Fetch Data upon initial load 
    useEffect(() => {
        if (!selectedPackage) return
        fetchWarehouses()
        if (isEditing) {
            fetchImages()
        } else {
            setImages([])
        }
        setLibraryMedia([])
    }, [selectedPackage?.id])


    // Set Selected Warehouse
    useEffect(() => {
        if (!selectedPackage) return

        const warehouse = warehouses.find( warehouse =>
            Number(selectedPackage.warehouse_id) === Number(warehouse.id)
        )

        setSelectedWarehouse(warehouse || null)
        

    }, [selectedPackage])


    if (!selectedPackage) {
        return (
            <div className="portal-home__panel-empty">
                <p className="portal-home__section-sub">Select a package from the table to edit.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="admin-modal__form">
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
                    <DheirSelect
                        name="warehouse_id"
                        value={String(selectedPackage.warehouse_id ?? "")}
                        onChange={(e) => setPackageWarehouse(Number(e.target.value))}
                        required
                    >
                        <option value="">{isFetchingWarehouse ? "Loading warehouses..." : "Select warehouse"}</option>
                        {warehouses.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.name}
                            </option>
                        ))}
                    </DheirSelect>
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
                    <DheirSelect
                        name="weight_unit"
                        value={selectedPackage.weight_unit ?? "kg"}
                        onChange={handleSelectedPackageSelect}
                        required
                    >
                        <option value="kg">KG</option>
                        <option value="cbm">CBM</option>
                    </DheirSelect>
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
                        readOnly={readonly}
                    />
                </label>

                <label className="portal-packages__field">
                    <span className="portal-packages__field-label">Received</span>
                    <input
                        type="date"
                        name="received_at"
                        className="dheir-input"
                        value={toDateInputValue(selectedPackage.received_at)}
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
                        value={toDateInputValue(selectedPackage.stored_at)}
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
                                    {isEditing
                                ? "Existing photos plus any new items you pick from the media library."
                                : "Optional — choose photos or videos from the media library."}
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
                    {isEditing && isFetchingImages ? (
                        <DheirLoader color="var(--color-dheir-blue)" size={10} />
                    ) : null}
                </div>

                {images.length > 0 ? (
                    <div className="admin-uploader__previews">
                        {images.map((img) => (
                            <div key={img.id} className="admin-uploader__preview">
                                <Image src={img.image_url} alt="" fill className="object-cover" unoptimized />
                            </div>
                        ))}
                    </div>
                ) : isEditing ? (
                    <p className="admin-uploader__help">No images for this package yet.</p>
                ) : null}

                {libraryMedia.length > 0 ? (
                    <div className="admin-uploader__previews" style={{ marginTop: "0.75rem" }}>
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
                ) : null}
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
                        <DheirLoader color="#fff" size={10} />
                    ) : isEditing ? (
                        "Save changes"
                    ) : (
                        "Add package"
                    )}
                </button>
            </div>
        </form>
    )
}
