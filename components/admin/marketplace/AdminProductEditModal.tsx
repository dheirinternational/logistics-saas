"use client"

import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal"
import { MediaUploadModal } from "@/components/admin/media/MediaUploadModal"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { DheirSelect } from "@/components/ui/DheirSelect"
import { apiErrorMessage, parseJsonResponse } from "@/lib/api/parseJsonResponse"
import { MAX_PRODUCT_MEDIA_COUNT } from "@/lib/products/productMediaLimits"
import { toast } from "@/lib/ui/toast"
import { getProductWeightFieldLabel } from "@/lib/shop/productWeight"
import type { ProductWeightUnit } from "@/lib/shop/productWeight"
import { Product, ProductCategory, ProductImage } from "@/types/entityTypeDef"
import { IconHelp, IconStar, IconStarFilled, IconTrash, IconX } from "@tabler/icons-react"
import Image from "next/image"
import { ChangeEvent, useEffect, useState } from "react"

type ProductDraft = {
    id: number
    name: string
    description: string
    category_id: number
    price: number
    discount_price: number | ""
    discount_min_qty: number | ""
    stock_quantity: number
    weight: number
    weight_unit: ProductWeightUnit
    is_featured: boolean
}

type Props = {
    product: Product
    categories: ProductCategory[]
    onClose: () => void
    onSaved: () => void
}

function toDraft(product: Product): ProductDraft {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        price: product.price,
        discount_price: product.discount_price ? product.discount_price : "",
        discount_min_qty:
            product.discount_min_qty != null && product.discount_min_qty > 0
                ? product.discount_min_qty
                : "",
        stock_quantity: product.stock_quantity,
        weight: product.weight,
        weight_unit: product.weight_unit ?? "kg",
        is_featured: product.is_featured,
    }
}

export default function AdminProductEditModal({ product, categories, onClose, onSaved }: Props) {
    const [draft, setDraft] = useState<ProductDraft>(() => toDraft(product))
    const [images, setImages] = useState<ProductImage[]>([])
    const [isFetchingImages, setIsFetchingImages] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadingMedia, setUploadingMedia] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [uploadOpen, setUploadOpen] = useState(false)

    useEffect(() => {
        setDraft(toDraft(product))
    }, [product])

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

    const linkMediaFromLibrary = async (assetIds: number[]) => {
        if (assetIds.length < 1) return
        setUploadingMedia(true)
        try {
            const res = await fetch(`/api/products/images/${product.id}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ media_asset_ids: assetIds }),
            })
            const result = await res.json()
            if (!res.ok) {
                toast.error(result.message ?? "Could not add media")
                return
            }
            toast.success("Media added")
            await refreshMedia()
        } catch (err) {
            console.error(err)
            toast.error("Could not add media")
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
        if (draft.price === 0) {
            toast.error("Price cannot be 0")
            return
        }
        if (draft.stock_quantity === 0) {
            toast.error("Stock in inventory cannot be zero")
            return
        }
        if (
            draft.discount_price !== "" &&
            Number(draft.discount_price) > 0 &&
            Number(draft.discount_price) >= Number(draft.price)
        ) {
            toast.error("Discounted price must be less than price")
            return
        }
        if (draft.discount_min_qty !== "" && Number(draft.discount_min_qty) < 1) {
            toast.error("Qty for discounted price must be 2 or more")
            return
        }
        if (draft.weight === 0) {
            toast.error("Product weight cannot be equal to or less than 0")
            return
        }

        const payload = {
            id: draft.id,
            name: draft.name,
            description: draft.description,
            category_id: draft.category_id,
            price: draft.price,
            discount_price: draft.discount_price === "" ? 0 : Number(draft.discount_price),
            discount_min_qty:
                draft.discount_min_qty === "" ? null : Number(draft.discount_min_qty),
            stock_quantity: draft.stock_quantity,
            weight: draft.weight,
            weight_unit: draft.weight_unit,
            is_featured: draft.is_featured,
        }

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/products", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            })
            const result = await parseJsonResponse(res)

            if (!res.ok) {
                toast.error(apiErrorMessage(result, "Could not save product"))
                return
            }

            toast.success(`${draft.name} successfully edited`)
            onSaved()
            onClose()
        } catch (err) {
            const message = err instanceof Error ? err.message : "Network error"
            toast.error(message)
            console.error("Product update failed", err)
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
                                <span className="portal-packages__field-label">Discounted price (₦)</span>
                                <input
                                    type="number"
                                    name="discount_price"
                                    className="dheir-input"
                                    value={draft.discount_price}
                                    onChange={handleInputChange}
                                    min={0}
                                    placeholder="Optional"
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">Qty for discounted price</span>
                                <input
                                    type="number"
                                    name="discount_min_qty"
                                    className="dheir-input"
                                    value={draft.discount_min_qty}
                                    onChange={handleInputChange}
                                    min={2}
                                    placeholder="Exact qty only (e.g. 4)"
                                />
                            </label>

                            <label className="portal-packages__field">
                                <span className="portal-packages__field-label">
                                    {getProductWeightFieldLabel(draft.weight_unit)}
                                </span>
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
                                <span className="portal-packages__field-label">Unit</span>
                                <DheirSelect
                                    name="weight_unit"
                                    value={draft.weight_unit}
                                    onChange={(e) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            weight_unit: e.target.value as ProductWeightUnit,
                                        }))
                                    }
                                    required
                                >
                                    <option value="kg">KG</option>
                                    <option value="cbm">CBM</option>
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
                                >
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
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
                                        Choose from the media library. Upload new files on Admin → Media.
                                    </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {(isFetchingImages || uploadingMedia) ? (
                                        <DheirLoader color="var(--color-dheir-blue)" size={10} />
                                    ) : null}
                                    <button
                                        type="button"
                                        className="portal-home__btn portal-home__btn--secondary"
                                        onClick={() => setPickerOpen(true)}
                                        disabled={uploadingMedia || images.length >= MAX_PRODUCT_MEDIA_COUNT}
                                    >
                                        Add from library
                                    </button>
                                    <button
                                        type="button"
                                        className="portal-home__btn portal-home__btn--primary"
                                        onClick={() => setUploadOpen(true)}
                                        disabled={uploadingMedia || images.length >= MAX_PRODUCT_MEDIA_COUNT}
                                    >
                                        Upload
                                    </button>
                                </div>
                            </div>

                            <MediaPickerModal
                                open={pickerOpen}
                                maxCount={Math.max(1, MAX_PRODUCT_MEDIA_COUNT - images.length)}
                                minCount={1}
                                title="Add product media"
                                onClose={() => setPickerOpen(false)}
                                onConfirm={(items) => linkMediaFromLibrary(items.map((m) => m.id))}
                            />

                            <MediaUploadModal
                                open={uploadOpen}
                                onClose={() => setUploadOpen(false)}
                                onFinished={async (assets) => {
                                    setUploadOpen(false)
                                    if (assets.length > 0) {
                                        await linkMediaFromLibrary(assets.map((m) => m.id))
                                    }
                                }}
                            />

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
