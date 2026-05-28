"use client"

import { DheirLoader } from "@/components/ui/DheirLoader"
import { DheirSelect } from "@/components/ui/DheirSelect"
import { toast } from "@/lib/ui/toast"
import { Product, ProductCategory } from "@/types/entityTypeDef"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"

type ProductValues = Omit<
    Product,
    "id" | "status" | "created_at" | "created_by" | "updated_by" | "updated_at" | "discount_price"
>

type ImagePreview = {
    preview: string
    file: File
}

const AddProduct = () => {
    const [productValues, setProductValues] = useState<ProductValues>({
        name: "",
        description: "",
        category_id: 0,
        price: 0,
        cost_price: 0,
        stock_quantity: 0,
        low_stock_threshold: 0,
        weight: 0,
        is_featured: false,
    })

    const [categories, setCategories] = useState<ProductCategory[]>([])
    const [images, setImages] = useState<ImagePreview[]>([])
    const [isAddingProduct, setIsAddingProduct] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const router = useRouter()

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

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                body: formData,
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
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

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length < 1) {
            toast.error("No media selected")
            return
        }

        images.forEach((image) => URL.revokeObjectURL(image.preview))
        const previewUrls = Array.from(files).map((file) => ({
            preview: URL.createObjectURL(file),
            file,
        }))
        setImages(previewUrls.slice(0, 8))
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
            images.forEach((image) => URL.revokeObjectURL(image.preview))
        }
    }, [images])

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
                    <span className="portal-packages__field-label">Cost price (₦)</span>
                    <input
                        type="number"
                        name="cost_price"
                        className="dheir-input"
                        value={productValues.cost_price}
                        onChange={handleInputChange}
                        min={0}
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
                    <span className="portal-packages__field-label">Low stock threshold</span>
                    <input
                        type="number"
                        name="low_stock_threshold"
                        className="dheir-input"
                        value={productValues.low_stock_threshold}
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
                        value={productValues.weight}
                        onChange={handleInputChange}
                        min={0}
                        step="0.01"
                        required
                    />
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
                        <p className="admin-uploader__help">Upload at least 1 product media (images or videos).</p>
                    </div>
                    <button
                        type="button"
                        className="portal-home__btn portal-home__btn--secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Choose media
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        name="images"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                    />
                </div>

                {images.length > 0 ? (
                    <div className="admin-uploader__previews">
                        {images.map((img, index) => (
                            <div key={img.preview + index} className="admin-uploader__preview">
                                {img.file.type.startsWith("video/") ? (
                                    <video
                                        src={img.preview}
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
                                    <Image src={img.preview} alt="" fill className="object-cover" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="admin-uploader__help">No media selected yet.</p>
                )}
            </div>

            <div className="admin-modal__actions">
                <button type="submit" className="portal-home__btn portal-home__btn--primary" disabled={isAddingProduct}>
                    {isAddingProduct ? <DheirLoader color="#fff" size={10} /> : "Add product"}
                </button>
            </div>
        </form>
    )
}

export default AddProduct
