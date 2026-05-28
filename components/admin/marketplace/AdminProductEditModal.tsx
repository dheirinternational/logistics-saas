"use client"

import { DheirLoader } from "@/components/ui/DheirLoader"
import { DheirSelect } from "@/components/ui/DheirSelect"
import { toast } from "@/lib/ui/toast"
import { Product, ProductCategory, ProductImage } from "@/types/entityTypeDef"
import { IconHelp, IconStar, IconStarFilled, IconTrash, IconX } from "@tabler/icons-react"
import Image from "next/image"
import { ChangeEvent, useEffect, useRef, useState } from "react"

type Props = {
    product: Product
    categories: ProductCategory[]
    onClose: () => void
    onSaved: () => void
}

export default function AdminProductEditModal({ product, categories, onClose, onSaved }: Props) {
    const [draft, setDraft] = useState<Product>(product)
    const [images, setImages] = useState<ProductImage[]>([])
    const [isFetchingImages, setIsFetchingImages] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadingMedia, setUploadingMedia] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        const fetchImages = async () => {
            setIsFetchingImages(true)
            try {
                const res = await fetch(`/api/products/images/${product.id}`, { credentials: "include" })
                const result = await res.json()

                if (!res.ok) {
                    toast.error(result.message ?? "Error fetching product images")
                    return
                }

                setImages(result.data ?? [])
            } catch (err) {
                console.error("Error fetching product images", err)
            } finally {
                setIsFetchingImages(false)
            }
        }

        fetchImages()
    }, [product.id])

    const refreshMedia = async () => {
        setIsFetchingImages(true)
        try {
            const res = await fetch(`/api/products/images/${product.id}`, { credentials: "include" })
            const result = await res.json()
            if (!res.ok) {
                toast.error(result.message ?? "Error fetching product media")
                return
            }
            setImages(result.data ?? [])
        } catch {
            toast.error("Could not load product media")
        } finally {
            setIsFetchingImages(false)
        }
    }

    const uploadMedia = async (files: FileList | null) => {
        if (!files || files.length < 1) return
        const formData = new FormData()
        Array.from(files)
            .slice(0, 8)
            .forEach((file) => formData.append("media", file))

        setUploadingMedia(true)
        try {
            const res = await fetch(`/api/products/images/${product.id}`, {
                method: "POST",
                credentials: "include",
                body: formData,
            })
            const result = await res.json()
            if (!res.ok) {
                toast.error(result.message ?? "Could not upload media")
                return
            }
            toast.success("Media uploaded")
            if (fileInputRef.current) fileInputRef.current.value = ""
            await refreshMedia()
        } catch (err) {
            console.error(err)
            toast.error("Could not upload media")
        } finally {
            setUploadingMedia(false)
        }
    }

    const removeMedia = async (imageId: number) => {
        try {
            const res = await fetch(
                `/api/products/images/${product.id}?image_id=${encodeURIComponent(String(imageId))}`,
                { method: "DELETE", credentials: "include" }
            )
            const result = await res.json()
            if (!res.ok) {
                toast.error(result.message ?? "Could not remove media")
                return
            }
            toast.success("Media removed")
            await refreshMedia()
        } catch (err) {
            console.error(err)
            toast.error("Could not remove media")
        }
    }

    const setCover = async (imageId: number) => {
        try {
            const res = await fetch(`/api/products/images/${product.id}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image_id: imageId }),
            })
            const result = await res.json()
            if (!res.ok) {
                toast.error(result.message ?? "Could not set cover")
                return
            }
            toast.success("Cover updated")
            await refreshMedia()
        } catch (err) {
            console.error(err)
            toast.error("Could not set cover")
        }
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, type } = e.currentTarget
        let { value } = e.currentTarget
        value = value.replace(/^0+(?=\d)/, "")

        setDraft((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        }))
    }

    const updateProduct = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch("/api/products", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
            })
            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
                return
            }

            toast.success(`${draft.name} successfully edited`)
            onSaved()
            onClose()
        } catch (err) {
            console.error("Network Error", err)
            toast.error("Network Error")
        } finally {
            setIsSubmitting(false)
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
            <div className="dheir-dialog admin-modal" role="dialog" aria-modal="true" aria-label="Edit product">
                <div className="dheir-dialog__head">
                    <div>
                        <h2 className="dheir-dialog__title">Edit product</h2>
                        <p className="admin-modal__subtitle">Manage and edit products in inventory.</p>
                    </div>
                    <button type="button" className="dheir-dialog__close" onClick={onClose} aria-label="Close">
                        <IconX size={20} stroke={1.5} />
                    </button>
                </div>

                <div className="admin-modal__body">
                    <form
                        className="admin-modal__form"
                        onSubmit={(e) => {
                            e.preventDefault()
                            updateProduct()
                        }}
                    >
                        <div className="admin-modal__fields">
                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Product name</span>
                                <input
                                    type="text"
                                    name="name"
                                    className="dheir-input"
                                    value={draft.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Category</span>
                                <DheirSelect
                                    name="category_id"
                                    value={String(draft.category_id ?? "")}
                                    onChange={(e) =>
                                        setDraft((prev) => ({ ...prev, category_id: Number(e.target.value) }))
                                    }
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </DheirSelect>
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Price (₦)</span>
                                <input
                                    type="number"
                                    name="price"
                                    className="dheir-input"
                                    value={draft.price}
                                    onChange={handleInputChange}
                                    min={0}
                                    required
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Discount price (₦)</span>
                                <input
                                    type="number"
                                    name="discount_price"
                                    className="dheir-input"
                                    value={draft.discount_price ?? ""}
                                    onChange={handleInputChange}
                                    min={0}
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Cost price (₦)</span>
                                <input
                                    type="number"
                                    name="cost_price"
                                    className="dheir-input"
                                    value={draft.cost_price}
                                    onChange={handleInputChange}
                                    min={0}
                                    required
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Weight (kg)</span>
                                <input
                                    type="number"
                                    name="weight"
                                    className="dheir-input"
                                    value={draft.weight}
                                    onChange={handleInputChange}
                                    min={0}
                                    step="0.01"
                                    required
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Stock quantity</span>
                                <input
                                    type="number"
                                    name="stock_quantity"
                                    className="dheir-input"
                                    value={draft.stock_quantity}
                                    onChange={handleInputChange}
                                    min={0}
                                    required
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Low stock threshold</span>
                                <input
                                    type="number"
                                    name="low_stock_threshold"
                                    className="dheir-input"
                                    value={draft.low_stock_threshold}
                                    onChange={handleInputChange}
                                    min={0}
                                    required
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Status</span>
                                <DheirSelect
                                    name="status"
                                    value={draft.status}
                                    onChange={(e) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            status: e.target.value as Product["status"],
                                        }))
                                    }
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="out_of_stock">Out of stock</option>
                                </DheirSelect>
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Featured</span>
                                <DheirSelect
                                    name="is_featured"
                                    value={String(draft.is_featured)}
                                    onChange={(e) =>
                                        setDraft((prev) => ({ ...prev, is_featured: e.target.value === "true" }))
                                    }
                                    required
                                >
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </DheirSelect>
                            </label>

                            <label className="portal-packages__field" style={{ gridColumn: "1 / -1" }}>
                                <span className="portal-packages__field-label">Description</span>
                                <textarea
                                    name="description"
                                    className="dheir-input portal-packages__textarea"
                                    value={draft.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    required
                                />
                            </label>
                        </div>

                        <div className="admin-uploader">
                            <div className="admin-uploader__row">
                                <div>
                                    <p className="portal-packages__field-label" style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                                        Media
                                        <span className="dheir-tooltip">
                                            <button
                                                type="button"
                                                className="dheir-tooltip__trigger"
                                                aria-label="Media help"
                                            >
                                                <IconHelp size={16} stroke={1.5} aria-hidden />
                                            </button>
                                            <span className="dheir-tooltip__content">
                                                Star = set cover. Bin = remove media.
                                            </span>
                                        </span>
                                    </p>
                                    <p className="admin-uploader__help">
                                        Images and videos shown in the marketplace. Upload at least 1.
                                    </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {(isFetchingImages || uploadingMedia) ? (
                                        <DheirLoader color="var(--color-dheir-blue)" size={10} />
                                    ) : null}
                                    <button
                                        type="button"
                                        className="portal-home__btn portal-home__btn--secondary"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingMedia}
                                    >
                                        Add media
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={(e) => uploadMedia(e.currentTarget.files)}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>

                            {images.length > 0 ? (
                                <div className="admin-uploader__previews">
                                    {images.map((img) => (
                                        <div key={img.id} className="admin-uploader__preview">
                                            {img.media_type === "video" ? (
                                                <video
                                                    src={img.image_url}
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    className="object-cover"
                                                    style={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        width: "100%",
                                                        height: "100%",
                                                    }}
                                                />
                                            ) : (
                                                <Image src={img.image_url} alt={img.alt_text || ""} fill className="object-cover" />
                                            )}
                                            <div style={{ position: "absolute", inset: 8, display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "flex-start" }}>
                                                <button
                                                    type="button"
                                                    className="portal-home__table-btn"
                                                    onClick={() => setCover(img.id)}
                                                    disabled={uploadingMedia || isFetchingImages}
                                                    aria-label={img.is_primary ? "Cover" : "Set cover"}
                                                    title={img.is_primary ? "Cover" : "Set cover"}
                                                >
                                                    {img.is_primary ? (
                                                        <IconStarFilled size={16} aria-hidden />
                                                    ) : (
                                                        <IconStar size={16} aria-hidden />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="portal-home__table-btn"
                                                    onClick={() => removeMedia(img.id)}
                                                    disabled={uploadingMedia || isFetchingImages}
                                                    aria-label="Remove"
                                                    title="Remove"
                                                >
                                                    <IconTrash size={16} aria-hidden />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="admin-uploader__help">No media for this product yet.</p>
                            )}
                        </div>

                        <div className="admin-modal__actions">
                            <button
                                type="submit"
                                className="portal-home__btn portal-home__btn--primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <DheirLoader color="#fff" size={10} /> : "Save changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
