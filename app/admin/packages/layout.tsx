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
import { DHEIRLoader } from "@/components/ui/DHEIRLoader";
import { IconX } from "@tabler/icons-react";
import { DHEIRSelect } from "@/components/ui/DHEIRSelect";
import { apiErrorMessage, parseJsonResponse } from "@/lib/api/parseJsonResponse";
import { toDateInputValue } from "@/lib/dates/toDateInputValue";
import { compressImage } from "@/lib/media/compressImage";
import { uploadAdminMediaFile } from "@/lib/media/uploadAdminMediaFile";
import { IconCamera, IconX as IconClose } from "@tabler/icons-react";
import { useRef } from "react";

export default function PageLayout({ children }: { children: ReactNode }) {
    const { isModalActive, setIsModalActive } = useEditModalStore()
    const { selectedPackage, setSelectedPackage, setReadOnly } = usePackageStore()
    const isEditing = Number(selectedPackage?.id ?? 0) > 0

    // Fetch warehouses for matching names from OCR scanner
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await fetch("/api/warehouses")
                const result = await res.json()
                if (res.ok) {
                    setWarehouses(result.data || [])
                }
            } catch (err) {
                console.error("Failed to load warehouses in layout", err)
            }
        }
        fetchWarehouses()
    }, [])

    useEffect(() => {
        const handlePackageScanned = (e: Event) => {
            const customEvent = e as CustomEvent<{
                customerCode: string | null
                warehouseName: string | null
                shippingId: string | null
            }>
            const { customerCode, warehouseName, shippingId } = customEvent.detail

            // Match warehouse name case-insensitively
            let matchedWarehouseId = 0
            if (warehouseName) {
                const matched = warehouses.find(
                    (w) =>
                        w.name.toLowerCase().includes(warehouseName.toLowerCase()) ||
                        warehouseName.toLowerCase().includes(w.name.toLowerCase())
                )
                if (matched) {
                    matchedWarehouseId = matched.id
                }
            }

            // Open modal and set state
            setReadOnly()
            setSelectedPackage({
                id: 0,
                incoming_package_id: shippingId || "",
                package_name: "",
                user_id: 0,
                customer_code: customerCode || "",
                warehouse_id: matchedWarehouseId,
                weight: 0,
                weight_unit: "kg",
                amount: 0,
                condition: "good",
                status: "stored",
                received_at: new Date().toISOString().split("T")[0],
                stored_at: new Date().toISOString().split("T")[0],
                created_at: "",
            })
            setIsModalActive()
            toast.success("Autofilled scanned details!")
        }

        window.addEventListener("admin-package-scanned", handlePackageScanned)
        return () => {
            window.removeEventListener("admin-package-scanned", handlePackageScanned)
        }
    }, [warehouses])

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

    const { setIsModalActive } = useEditModalStore()
    const { selectedPackage, handleSelectedPackageInput, handleSelectedPackageSelect, setPackageWarehouse, resetSelectedPackage, setTrigger, readonly } = usePackageStore()

    // Arrays
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [images, setImages] = useState<PackageImage[]>([])
    const [libraryMedia, setLibraryMedia] = useState<AdminMediaItem[]>([])
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploadOpen, setUploadOpen] = useState(false)

    // Camera states
    const [cameraOpen, setCameraOpen] = useState(false)
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
    const [isCapturing, setIsCapturing] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Selected Objects
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)


    // Fetching Data indicators 
    const [isFetchingWarehouse, setIsFetchingWarehouse] = useState(true)
    const [isUploadingPackage, setIsUploadingPackage] = useState(false)
    const [isFetchingImages, setIsFetchingImages] = useState(false)

    const packageId = Number(selectedPackage?.id ?? 0)

    // Camera Actions
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false
            })
            setCameraStream(stream)
            setCameraOpen(true)
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        } catch (err) {
            console.error("Camera error", err)
            toast.error("Could not access camera device.")
        }
    }

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop())
            setCameraStream(null)
        }
        setCameraOpen(false)
    }

    // Capture and Compress Image
    const handleCapture = async () => {
        if (!videoRef.current || isCapturing) return
        setIsCapturing(true)

        try {
            const video = videoRef.current
            const canvas = document.createElement("canvas")
            canvas.width = video.videoWidth || 640
            canvas.height = video.videoHeight || 480
            const ctx = canvas.getContext("2d")
            
            if (!ctx) {
                toast.error("Canvas context generation failed")
                return
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    toast.error("Failed to capture image blob")
                    setIsCapturing(false)
                    return
                }

                try {
                    // Compress client-side
                    const compressedBlob = await compressImage(blob)
                    const compressedFile = new File([compressedBlob], `package-photo-${Date.now()}.jpg`, {
                        type: "image/jpeg"
                    })

                    // Upload directly bypassing serverless body limits
                    const uploadResult = await uploadAdminMediaFile(compressedFile)
                    if (uploadResult.ok && uploadResult.asset) {
                        setLibraryMedia((prev) => [...prev, uploadResult.asset!])
                        toast.success("Photo captured and uploaded successfully!")
                    } else {
                        toast.error(uploadResult.message || "Failed to upload captured photo")
                    }
                } catch (err: any) {
                    toast.error(err.message || "Compression/Upload failed")
                } finally {
                    setIsCapturing(false)
                    stopCamera()
                }
            }, "image/jpeg", 0.95)
        } catch (err: any) {
            toast.error("Failed to capture frame")
            setIsCapturing(false)
        }
    }

    // Stop camera if component unmounts
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach((t) => t.stop())
            }
        }
    }, [cameraStream])
    const isEditing = Number.isFinite(packageId) && packageId > 0


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

    // Fetch Images 
    const fetchImages = async () => {
        setIsFetchingImages(true)
        try {
            const res = await fetch(`/api/packages/images/${Number(selectedPackage?.id)}`)
            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
                return
            }

            setImages(result.data ?? [])

        }
        catch (err) {
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally {
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

        try {
            const res = await fetch(
                isEditing ? `/api/packages/${packageId}` : "/api/packages",
                {
                    method: isEditing ? "PUT" : "POST",
                    credentials: "include",
                    body: formData
                }
            )

            const result = await parseJsonResponse(res)

            if (!res.ok) {
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
        catch (err) {
            const message = err instanceof Error ? err.message : "Network error"
            toast.error(message)
            console.error("Package save failed", err)
        }
        finally {
            setIsUploadingPackage(false)

        }
    }


    // Fetch Data upon initial load 
    useEffect(() => {
        fetchWarehouses()
    }, [])

    useEffect(() => {
        if (!selectedPackage) return
        if (isEditing) {
            fetchImages()
        } else {
            setImages([])
        }
        setLibraryMedia([])
    }, [selectedPackage?.id])

    // Set Selected Warehouse with fallback if current warehouse_id is invalid
    useEffect(() => {
        if (!selectedPackage || warehouses.length === 0) return

        const warehouse = warehouses.find(w => Number(selectedPackage.warehouse_id) === Number(w.id))
        if (warehouse) {
            setSelectedWarehouse(warehouse)
        } else if (warehouses[0]) {
            setPackageWarehouse(Number(warehouses[0].id))
            setSelectedWarehouse(warehouses[0])
        }
    }, [selectedPackage?.id, warehouses])


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
                    <DHEIRSelect
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

            <div className="admin-uploader" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                        <p className="portal-packages__field-label" style={{ margin: 0 }}>
                            Photos
                        </p>
                        <p className="admin-uploader__help">
                            {isEditing
                                ? "Existing photos plus any new items you pick from the media library."
                                : "Optional, choose photos or videos from the media library."}
                        </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
                        <button
                            type="button"
                            className="portal-home__btn portal-home__btn--secondary"
                            onClick={() => startCamera()}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", height: "42px", fontSize: "14px" }}
                        >
                            <IconCamera size={18} />
                            Take Photo
                        </button>
                        <button
                            type="button"
                            className="portal-home__btn portal-home__btn--secondary"
                            onClick={() => setPickerOpen(true)}
                            style={{ width: "100%", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
                        >
                            Choose from library
                        </button>
                        <button
                            type="button"
                            className="portal-home__btn portal-home__btn--primary"
                            onClick={() => setUploadOpen(true)}
                            style={{ width: "100%", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
                        >
                            Upload
                        </button>
                    </div>
                    {isEditing && isFetchingImages ? (
                        <DHEIRLoader color="var(--color-dheir-blue)" size={10} />
                    ) : null}
                </div>

                {cameraOpen && (
                    <div
                        className="dheir-dialog-backdrop"
                        role="presentation"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) stopCamera()
                        }}
                        style={{ zIndex: 1100, backgroundColor: "#000000" }}
                    >
                        {/* Custom styles for native camera UI look */}
                        <style>{`
                            .camera-viewport-container {
                                position: relative;
                                width: 100vw;
                                height: 100vh;
                                height: 100dvh;
                                background-color: #000;
                                display: flex;
                                flex-direction: column;
                                justify-content: space-between;
                                overflow: hidden;
                            }
                            .camera-video-element {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                                z-index: 1;
                            }
                            .camera-overlay-grid {
                                position: absolute;
                                inset: 0;
                                display: grid;
                                grid-template-columns: repeat(3, 1fr);
                                grid-template-rows: repeat(3, 1fr);
                                pointer-events: none;
                                z-index: 2;
                            }
                            .camera-grid-line-h {
                                border-bottom: 1px dashed rgba(255, 255, 255, 0.25);
                                width: 100%;
                                height: 100%;
                            }
                            .camera-grid-line-v {
                                border-right: 1px dashed rgba(255, 255, 255, 0.25);
                                width: 100%;
                                height: 100%;
                            }
                            .camera-top-controls {
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                height: 70px;
                                background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                padding: 0 20px;
                                z-index: 3;
                            }
                            .camera-close-btn {
                                border: none;
                                background: rgba(0, 0, 0, 0.5);
                                color: #fff;
                                width: 44px;
                                height: 44px;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                cursor: pointer;
                            }
                            .camera-bottom-panel {
                                position: absolute;
                                bottom: 0;
                                left: 0;
                                right: 0;
                                height: 130px;
                                background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                z-index: 3;
                            }
                            .camera-shutter-btn {
                                width: 72px;
                                height: 72px;
                                border-radius: 50%;
                                background-color: #ffffff;
                                border: 6px solid rgba(255, 255, 255, 0.3);
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: transform 0.1s ease;
                                padding: 0;
                            }
                            .camera-shutter-btn:active {
                                transform: scale(0.9);
                                background-color: #e0e0e0;
                            }
                            .camera-shutter-inner {
                                width: 100%;
                                height: 100%;
                                border-radius: 50%;
                                background-color: #ffffff;
                            }
                        `}</style>
                        <div className="camera-viewport-container">
                            {/* Live video */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="camera-video-element"
                            />

                            {/* Camera Rule-of-Thirds Grid Overlay */}
                            <div className="camera-overlay-grid">
                                <div className="camera-grid-line-v camera-grid-line-h" />
                                <div className="camera-grid-line-v camera-grid-line-h" />
                                <div className="camera-grid-line-h" />
                                <div className="camera-grid-line-v camera-grid-line-h" />
                                <div className="camera-grid-line-v camera-grid-line-h" />
                                <div className="camera-grid-line-h" />
                                <div className="camera-grid-line-v" />
                                <div className="camera-grid-line-v" />
                                <div />
                            </div>

                            {/* Top Bar Controls */}
                            <div className="camera-top-controls">
                                <button
                                    type="button"
                                    className="camera-close-btn"
                                    onClick={stopCamera}
                                    aria-label="Exit Camera"
                                >
                                    <IconClose size={24} />
                                </button>
                                <span style={{ color: "#fff", fontWeight: 600, fontSize: "14px", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                                    PACKAGE PHOTO
                                </span>
                                <div style={{ width: 44 }} /> {/* Spacer */}
                            </div>

                            {/* Bottom Panel with Shutter Button */}
                            <div className="camera-bottom-panel">
                                <button
                                    type="button"
                                    onClick={handleCapture}
                                    className="camera-shutter-btn"
                                    disabled={isCapturing}
                                    aria-label="Capture Photo"
                                >
                                    {isCapturing ? (
                                        <DHEIRLoader color="var(--color-dheir-blue)" size={10} />
                                    ) : (
                                        <div className="camera-shutter-inner" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                        <DHEIRLoader color="#fff" size={10} />
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
