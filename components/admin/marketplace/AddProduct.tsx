"use client"

import { DheirLoader } from "@/components/ui/DheirLoader"
import { DheirSelect } from "@/components/ui/DheirSelect"
import { toast } from "@/lib/ui/toast"
import { getProductWeightFieldLabel } from "@/lib/shop/productWeight"
import type { ProductWeightUnit } from "@/lib/shop/productWeight"
import { ProductCategory } from "@/types/entityTypeDef"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { IconPlayerPlay, IconX } from "@tabler/icons-react"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"

const MAX_MEDIA = 8

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

type MediaPreview = {
    id: string
    preview: string
    file: File
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
    const [images, setImages] = useState<MediaPreview[]>([])
    const [isAddingProduct, setIsAddingProduct] = useState(false)
    const [fullscreenVideoSrc, setFullscreenVideoSrc] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const imagesRef = useRef<MediaPreview[]>([])
    const router = useRouter()

    imagesRef.current = images

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsAddingProduct(true)

        if (images.length < 1) {
            toast.error("Select at least 1 media file")
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

        const formData = new FormData(e.currentTarget)
        images.forEach((image) => {
            formData.append("images", image.file)
        })

        if (productValues.is_featured) {
            formData.set("is_featured", "true")
        } else {
            formData.delete("is_featured")
        }
        if (productValues.discount_price === "") {
            formData.delete("discount_price")
        }
        if (productValues.discount_min_qty === "") {
            formData.delete("discount_min_qty")
        }

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                body: formData,
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message || "Could not add product")
                return
            }

            toast.success("Product successfully added to system")
            router.push("/admin/marketplace")
        } catch (err) {
            toast.error("ERR:: Adding product to system")
            console.error("ERR:: Adding product to system", err)
        } finally {
            setIsAddingProduct(false)
        }
    }

    const removeMedia = (id: string) => {
        setImages((prev) => {
            const target = prev.find((item) => item.id === id)
            if (target) URL.revokeObjectURL(target.preview)
            return prev.filter((item) => item.id !== id)
        })
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length < 1) return

        const remaining = MAX_MEDIA - images.length
        if (remaining <= 0) {
            toast.error(`Maximum ${MAX_MEDIA} media files per product`)
            if (fileInputRef.current) fileInputRef.current.value = ""
            return
        }

        const incoming = Array.from(files).slice(0, remaining)
        if (incoming.length < files.length) {
            toast.error(`Only ${remaining} more file(s) allowed (max ${MAX_MEDIA})`)
        }

        const added: MediaPreview[] = incoming.map((file) => ({
            id: crypto.randomUUID(),
            preview: URL.createObjectURL(file),
            file,
        }))

        setImages((prev) => [...prev, ...added])
        if (fileInputRef.current) fileInputRef.current.value = ""
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

    useEffect(() => {
        return () => {
            imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview))
        }
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
                            Upload at least 1 product media (images or videos). You can add more in batches (max {MAX_MEDIA}).
                        </p>
                    </div>
                    <button
                        type="button"
                        className="portal-home__btn portal-home__btn--secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {images.length > 0 ? "Add more media" : "Choose media"}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                    />
                </div>

                {images.length > 0 ? (
                    <div className="admin-uploader__previews">
                        {images.map((img) => {
                            const isVideo = img.file.type.startsWith("video/")
                            return (
                                <div key={img.id} className="admin-uploader__preview">
                                    <div className="admin-uploader__preview-media">
                                        {isVideo ? (
                                            <video
                                                src={img.preview}
                                                muted
                                                playsInline
                                                preload="metadata"
                                            />
                                        ) : (
                                            <Image src={img.preview} alt="" fill className="object-cover" unoptimized />
                                        )}
                                    </div>
                                    <div className="admin-uploader__preview-actions">
                                        {isVideo ? (
                                            <button
                                                type="button"
                                                className="admin-uploader__play-btn"
                                                onClick={() => setFullscreenVideoSrc(img.preview)}
                                                aria-label="Play video"
                                            >
                                                <IconPlayerPlay size={28} stroke={1.5} aria-hidden />
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            className="admin-uploader__remove-btn"
                                            onClick={() => removeMedia(img.id)}
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

            {fullscreenVideoSrc ? (
                <div
                    className="dheir-dialog-backdrop admin-media-lightbox"
                    role="presentation"
                    onClick={() => setFullscreenVideoSrc(null)}
                >
                    <div
                        className="admin-media-lightbox__panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Product video"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="dheir-dialog__close admin-media-lightbox__close"
                            onClick={() => setFullscreenVideoSrc(null)}
                            aria-label="Close video"
                        >
                            <IconX size={22} stroke={1.5} />
                        </button>
                        <video
                            src={fullscreenVideoSrc}
                            controls
                            autoPlay
                            playsInline
                            className="admin-media-lightbox__video"
                        />
                    </div>
                </div>
            ) : null}

            <div className="admin-modal__actions">
                <button type="submit" className="portal-home__btn portal-home__btn--primary" disabled={isAddingProduct}>
                    {isAddingProduct ? <DheirLoader color="#fff" size={10} /> : "Add product"}
                </button>
            </div>
        </form>
    )
}

export default AddProduct
