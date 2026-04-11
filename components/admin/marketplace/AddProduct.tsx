"use client"

import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { Product, ProductCategory} from "@/types/entityTypeDef"
import InputComponent from "../shipments/InputComponent"
import { toast } from "react-toastify"
import { IoCreate } from "react-icons/io5"
import Image from "next/image"
import { BeatLoader } from "react-spinners"
import { useRouter } from "next/navigation"

type ProductValues = Omit<Product, "id" | "status" | "created_at" | "created_by" | "updated_by" | "created_at" | "updated_at" | "discount_price">

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
        is_featured: "",
    })

    const [categories, setCategories] = useState<ProductCategory[]>([])
    const [images, setImages] = useState<ImagePreview[]>([])
    const [isAddingPackage, setIsAddingPackage] = useState(false)

    const router = useRouter()

    // Add Package to backend
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsAddingPackage(true)
        const formData = new FormData(e.currentTarget)
        if(images.length !== 4){
            toast.error("Select 4 images")
            return
        }
        images.forEach((image) => {
            formData.append("images", image.file)
        })

        try{
            const res = await fetch("/api/products", {
                method: "POST",
                body: formData
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
            }

            toast.success("Product Successfully Added to System")
            router.push("/admin/marketplace")
        }
        catch(err){
            toast.error("ERR:: Adding Product to System")
            console.error("ERR:: Adding Product to System", err)
        }
        finally{
            setIsAddingPackage(false)
        }   
    }
    
    // Handle Images selection
    const hanldeImageChange = (e: ChangeEvent<HTMLInputElement>) => {

        const files = e.target.files

        if(!files || files.length < 1){ 
            toast.error("No Images Selected")
            return
        }

        if(files.length !== 4){
            toast.error("Select 4 images")
            return
        }
        
        const previewUrls = Array.from(files).map( file => {
            return {
                preview: URL.createObjectURL(file),
                file
            }
        })

        setImages(previewUrls)
        
    }

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async() => {
            try{
                const res = await fetch("/api/products/categories")
                const result = await res.json()

                if(!res.ok){
                    toast.error("Error Fetching Categories")
                    return
                }

                setCategories(result.data)

            }
            catch(err){
                console.error("Error fetching Categories", err)
                toast.error("Error Fetching Categories")
            }
        }

        fetchCategories()
    }, [])


    const cate = categories.length > 0 ? categories.map( x => 
        ({name: `${x.name.charAt(0).toUpperCase()}${x.name.slice(1)}`, value: x.id})) 
        : []

    // Clean up object Url
    useEffect(() => {
        return () => {
            images.forEach( image => URL.revokeObjectURL(image.preview) )
        }
    }, [images])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Product Name */}
        <InputComponent 
        name="name" 
        type="text" 
        title="Product Name" 
        state={productValues} 
        setState={setProductValues}
        required
        />

        {/* Description */}
        <InputComponent 
        name="description" 
        type="text" 
        title="Description" 
        state={productValues} 
        setState={setProductValues} 
        textarea
        required
        />

        {/* Category Ids */}
        <InputComponent 
        name="category_id" 
        type="text" 
        title="Category ID" 
        state={productValues} 
        setState={setProductValues}
        readonly
        select
        selectValues={[...cate]}
        overshadow
        required
        />

        {/* Price */}
        <InputComponent 
        name="price" 
        type="number" 
        title="Price" 
        state={productValues} 
        setState={setProductValues}
        required
        />

        {/* Cost Price? */}
        <InputComponent 
        name="cost_price" 
        type="number" 
        title="Cost Price" 
        state={productValues} 
        setState={setProductValues}
        />

        {/* Quantity */}
        <InputComponent 
        name="stock_quantity" 
        type="number" 
        title="Stock Quantity" 
        state={productValues} 
        setState={setProductValues}
        required
        />
        
        {/* Threshold */}
        <InputComponent 
        name="low_stock_threshold" 
        type="number" 
        title="Low Stock Threshold" 
        state={productValues} 
        setState={setProductValues}
        required
        />

        {/* Weight */}
        <InputComponent 
        name="weight" 
        type="number" 
        title="Weight" 
        state={productValues} 
        setState={setProductValues}
        required
        />

        {/* Is Featured */}
        <InputComponent 
        name="is_featured" 
        type="text" 
        title="Featured Product" 
        state={productValues} 
        setState={setProductValues}
        readonly
        select
        selectValues={[{name: "True", value: "true"}, {name: "False", value: "false"}]}
        required
        />

        <input 
        type="file" 
        accept="image/*"
        multiple
        className="bg-light/70 border border-dark/20 text-xs p-2 w-fit"
        onChange={hanldeImageChange}
        required
        />

        <div className="w-full max-w-full overflow-auto flex gap-2">
            {
                images.map( (x, index) => 
                    <figure key={index} className="w-20 h-20 relative rounded overflow-hidden min-w-20">
                        <Image
                        src={x.preview}
                        fill
                        alt={`images ${index}`}
                        className="object-cover"
                        />
                    </figure>
                )
            }
        </div>

        <div className="pb-10">
            <button className="flex items-center justify-center gap-1 bg-accent-blue px-4 py-3 rounded-lg mt-4 float-right text-white" 
            disabled={isAddingPackage}
            >
                {
                    isAddingPackage ?
                    <BeatLoader color="#fff" size={10}/> :
                    <>
                        <IoCreate/>
                        <p className="text-xs font-bold">
                            Add
                        </p>
                    </>
                }
            </button>
        </div>
    </form>
  )
}

export default AddProduct