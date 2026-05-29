"use client"

import { DheirLoader } from "@/components/ui/DheirLoader"
import { DheirSelect } from "@/components/ui/DheirSelect"
import { apiErrorMessage, parseJsonResponse } from "@/lib/api/parseJsonResponse"
import { AdminMediaVideoLightbox } from "@/components/admin/media/AdminMediaVideoLightbox"
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal"
import type { AdminMediaItem } from "@/lib/media/adminMedia"
import { MAX_PRODUCT_MEDIA_COUNT } from "@/lib/products/productMediaLimits"
import { toast } from "@/lib/ui/toast"
import { getProductWeightFieldLabel } from "@/lib/shop/productWeight"
import type { ProductWeightUnit } from "@/lib/shop/productWeight"
import { ProductCategory } from "@/types/entityTypeDef"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { IconPlayerPlay, IconX } from "@tabler/icons-react"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"

type ProductValues = {
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

const AddProduct = () => {
    const [productValues, setProductValues] = useState<ProductValues>({
        name: "",
        description: "",
        category_id: 0,
        price: 0,
        discount_price: "",
        discount_min_qty: "",
        stock_quantity: 0,
        weight: 0,
        weight_unit: "kg",
        is_featured: false,
    })

    const [categories, setCategories] = useState<ProductCategory[]>([])
    const [selectedMedia, setSelectedMedia] = useState<AdminMediaItem[]>([])
    const [pickerOpen, setPickerOpen] = useState(false)
    const [isAddingProduct, setIsAddingProduct] = useState(false)
    const isSubmittingRef = useRef(false)
    const [fullscreenVideoSrc, setFullscreenVideoSrc] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (isSubmittingRef.current) return
        isSubmittingRef.current = true
        setIsAddingProduct(true)
        if (selectedMedia.length < 1) {
            toast.error("Select at least 1 item from the media library")
            setIsAddingProduct(false)
            return
        }

        if (productValues.price === 0) {
            toast.error("Price cannot be 0")
            setIsAddingProduct(false)
            return
        }
        if (productValues.stock_quantity === 0) {
            toast.error("Stock in inventory cannot be zero")
            setIsAddingProduct(false)
            return
        }
        if (
            productValues.discount_price !== "" &&
            Number(productValues.discount_price) > 0 &&
            Number(productValues.discount_price) >= Number(productValues.price)
        ) {
            toast.error("Discounted price must be less than price")
            setIsAddingProduct(false)
            return
        }
        if (
            productValues.discount_min_qty !== "" &&
            Number(productValues.discount_min_qty) < 1
        ) {
            toast.error("Qty for discounted price must be 2 or more")
            setIsAddingProduct(false)
            return
        }
        if (productValues.weight === 0) {
            toast.error("Product weight cannot be equal to or less than 0")
            setIsAddingProduct(false)
            return
        }

        const payload = {
            name: productValues.name,
            description: productValues.description,
            category_id: productValues.category_id,
            price: productValues.price,
            discount_price:
                productValues.discount_price === ""
                    ? 0
                    : Number(productValues.discount_price),
            discount_min_qty:
                productValues.discount_min_qty === ""
                    ? null
                    : Number(productValues.discount_min_qty),
            stock_quantity: productValues.stock_quantity,
            weight: productValues.weight,
            weight_unit: productValues.weight_unit,
            is_featured: productValues.is_featured,
        }

        let productId: number | null = null

        try {
            const createRes = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...payload,
                    media_asset_ids: selectedMedia.map((m) => m.id),
                }),
                credentials: "include",
            })

            const createResult = await parseJsonResponse(createRes)

            if (!createRes.ok) {
                toast.error(apiErrorMessage(createResult, "Could not add product"))
                return
            }

            productId = Number(createResult.id)
            if (!productId) {
                toast.error("Product was created but the server did not return an id")
                return
            }

            toast.success("Product successfully added to system")
            router.push("/admin/marketplace")
        } catch (err) {
            if (productId) {
                await fetch(`/api/products/${productId}`, {
                    method: "DELETE",
                    credentials: "include",
                }).catch(() => undefined)
            }
            const message =
                err instanceof Error ? err.message : "Could not add product"
            toast.error(message)
            console.error("Add product failed", err)
        } finally {
            isSubmittingRef.current = false
            setIsAddingProduct(false)
        }
    }

    const removeMedia = (assetId: number) => {
        setSelectedMedia((prev) => prev.filter((item) => item.id !== assetId))
    }

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/products/categories", { credentials: "include" })
                const result = await res.json()

                if (!res.ok) {
                    toast.error("Error fetching categories")
                    return
                }

                setCategories(result.data ?? [])
                if (result.data?.[0]?.id) {
                    setProductValues((prev) => ({ ...prev, category_id: result.data[0].id }))
                }
            } catch (err) {
                console.error("Error fetching categories", err)
                toast.error("Error fetching categories")
            }
        }

        fetchCategories()
    }, [])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, type } = e.currentTarget
        let { value } = e.currentTarget
        value = value.replace(/^0+(?=\d)/, "")

        setProductValues((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="admin-modal__form">
            <div className="admin-modal__fields">
                <label className="portal-packages__field">
                    <span className="portal-packages__field-label">Product name</span>
                    <input
                        type="text"
                        name="name"
                        className="dheir-input"
                        value={productValues.name}
                        onChange={handleInputChange}
                        required
                    />
                </label>

                <label className="portal-packages__field">
                    <span className="portal-packages__field-label">Category</span>
                    <DheirSelect
                        name="category_id"
                        value={String(productValues.category_id || "")}
                        onChange={(e) =>
                            setProductValues((prev) => ({ ...prev, category_id: Number(e.target.value) }))
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
                        value={productValues.price}
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
                        value={productValues.stock_quantity}
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
                        value={productValues.discount_price}
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
                        value={productValues.discount_min_qty}
                        onChange={handleInputChange}
                        min={2}
                        placeholder="Exact qty only (e.g. 4)"
                    />
                </label>

                <label className="portal-packages__field">
                    <span className="portal-packages__field-label">
                        {getProductWeightFieldLabel(productValues.weight_unit)}
                    </span>
                    <input
                        type="number"
                        name="weight"
                        className="dheir-input"
                        value={productValues.weight}
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
                        value={productValues.weight_unit}
                        onChange={(e) =>
                            setProductValues((prev) => ({
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
                        value={String(productValues.is_featured)}
                        onChange={(e) =>
                            setProductValues((prev) => ({ ...prev, is_featured: e.target.value === "true" }))
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
                        value={productValues.description}
                        onChange={handleInputChange}
                        rows={4}
                        required
                    />
                </label>
            </div>

            <div className="admin-uploader">
                <div className="admin-uploader__row">
                    <div>
                        <p className="portal-packages__field-label" style={{ margin: 0 }}>
                            Media
                        </p>
                        <p className="admin-uploader__help">
                            Select from the media library. Upload new files on Admin → Media.
                            Up to {MAX_PRODUCT_MEDIA_COUNT} per product.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="portal-home__btn portal-home__btn--secondary"
                        onClick={() => setPickerOpen(true)}
                    >
                        {selectedMedia.length > 0 ? "Change selection" : "Choose from library"}
                    </button>
                </div>

                {selectedMedia.length > 0 ? (
                    <div className="admin-uploader__previews">
                        {selectedMedia.map((item) => {
                            const isVideo = item.mediaType === "video"
                            return (
                                <div key={item.id} className="admin-uploader__preview">
                                    <div className="admin-uploader__preview-media">
                                        {isVideo ? (
                                            <video
                                                src={item.publicUrl}
                                                muted
                                                playsInline
                                                preload="metadata"
                                            />
                                        ) : (
                                            <Image
                                                src={item.publicUrl}
                                                alt=""
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        )}
                                    </div>
                                    <div className="admin-uploader__preview-actions">
                                        {isVideo ? (
                                            <button
                                                type="button"
                                                className="admin-uploader__play-btn"
                                                onClick={() => setFullscreenVideoSrc(item.publicUrl)}
                                                aria-label="Play video"
                                            >
                                                <IconPlayerPlay size={28} stroke={1.5} aria-hidden />
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            className="admin-uploader__remove-btn"
                                            onClick={() => removeMedia(item.id)}
                                            aria-label="Remove media"
                                        >
                                            <IconX size={18} stroke={2} aria-hidden />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="admin-uploader__help">No media selected yet.</p>
                )}
            </div>

            <MediaPickerModal
                open={pickerOpen}
                maxCount={MAX_PRODUCT_MEDIA_COUNT}
                initialSelected={selectedMedia}
                title="Product media"
                onClose={() => setPickerOpen(false)}
                onConfirm={setSelectedMedia}
            />

            {fullscreenVideoSrc ? (
                <AdminMediaVideoLightbox
                    src={fullscreenVideoSrc}
                    label="Product video"
                    onClose={() => setFullscreenVideoSrc(null)}
                />
            ) : null}

            <div className="admin-modal__actions">
                <button type="submit" className="portal-home__btn portal-home__btn--primary" disabled={isAddingProduct}>
                    {isAddingProduct ? (
                        <>
                            <DheirLoader color="#fff" size={10} />
                            Saving…
                        </>
                    ) : (
                        "Add product"
                    )}
                </button>
            </div>
        </form>
    )
}

export default AddProduct
