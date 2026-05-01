"use client"

import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { Product, ProductCategory} from "@/types/entityTypeDef"
import { toast } from "react-toastify"
import { IoCreate } from "react-icons/io5"
import Image from "next/image"
import { BeatLoader } from "react-spinners"
import { useRouter } from "next/navigation"
import { FaChevronDown } from "react-icons/fa"

type ProductValues = Omit<Product, "id" | "status" | "created_at" | "created_by" | "updated_by" | "created_at" | "updated_at" | "discount_price">

type ImagePreview = {
    preview: string
    file: File
}

const AddProduct = () => {

    const [productValues, setProductValues] = useState<ProductValues>({
        name: "", //
        description: "",
        category_id: 0,
        price: 0, //
        cost_price: 0, //
        stock_quantity: 0, //
        low_stock_threshold: 0, //
        weight: 0, //
        is_featured: false,
    })

    const [categories, setCategories] = useState<ProductCategory[]>([])
    const [images, setImages] = useState<ImagePreview[]>([])
    const [isAddingPackage, setIsAddingPackage] = useState(false)

    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)


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

        if (productValues.price === 0){
            toast.error("Price cannot be 0")
            setIsAddingPackage(false)
            return
        }
        if(productValues.stock_quantity === 0){
            toast.error("Stock in inventory cannot be zero")
            setIsAddingPackage(false)
            return
        }
        if(productValues.weight === 0){
            toast.error("Product Weight cannot be equal to or less than 0")
            setIsAddingPackage(false)
            return
        }


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
            // console.log(Object.fromEntries(formData))
            
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
                setProductValues( prev => ({...prev, category_id: result.data[0].id}))

            }
            catch(err){
                console.error("Error fetching Categories", err)
                toast.error("Error Fetching Categories")
            }
        }

        fetchCategories()
    }, [])


    // Clean up object Url
    useEffect(() => {
        return () => {
            images.forEach( image => URL.revokeObjectURL(image.preview) )
        }
    }, [images])


    // Handle Input Change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {

        const { name } = e.currentTarget
        let { value } = e.currentTarget
        value = value.replace(/^0+(?=\d)/, "");
        setProductValues( prev => ({...prev, [name]: value}) )
    }

    console.log(categories)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
     
        <div className="flex gap-4">

            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Product Name
                </span>
                <input 
                type="text" 
                name="name" 
                className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                value={productValues.name}
                onChange={handleInputChange}
                required
                />
            </label>

            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Price
                </span>
                <input 
                type="number" 
                name="price" 
                className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                value={productValues.price}
                onChange={handleInputChange}
                min={0}
                required
                />
                <span className="absolute left-1 bottom-2">
                    ₦
                </span>
            </label>

            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Cost Price
                </span>
                <input 
                type="number" 
                name="cost_price" 
                className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                value={productValues.cost_price}
                onChange={handleInputChange}
                min={0}
                />
                <span className="absolute left-1 bottom-2">
                    ₦
                </span>
            </label>

        </div>

        <div className="flex gap-4">

            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Stock Quantity
                </span>
                <input 
                type="number" 
                name="stock_quantity" 
                className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                value={productValues.stock_quantity}
                onChange={handleInputChange}
                min={0}
                required
                />
            </label>

            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Low Stock Threshold
                </span>
                <input 
                type="number" 
                name="low_stock_threshold" 
                className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                value={productValues.low_stock_threshold}
                onChange={handleInputChange}
                min={0}
                required
                />
            </label>

            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Weight
                </span>
                <input 
                type="number" 
                name="weight" 
                className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                value={productValues.weight}
                onChange={handleInputChange}
                min={0}
                required
                />
                <span className="text-dark/60 absolute bottom-2 right-1">
                    Kg
                </span>
            </label>

        </div>

        <div className="flex gap-4">
            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Description
                </span>
                <input 
                type="text" 
                name="description" 
                className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-2'
                value={productValues.description}
                onChange={handleInputChange}
                required
                />
            </label>

            <label className='w-full flex flex-col relative text-[10px]'>
                <span className='text-dark/60'>
                    Category
                </span>
                <input 
                type="number" 
                name="category_id" 
                className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                value={productValues.category_id}
                onChange={handleInputChange}
                min={0}
                required
                readOnly
                />
                <div className="absolute right-1 bottom-2">
                    <button
                    className={`${isCategoryMenuOpen && "rotate-180"}`}
                    onClick={() => {setIsCategoryMenuOpen(!isCategoryMenuOpen)}}
                    type="button"
                    >
                        <FaChevronDown/>
                    </button>

                    <div className={`
                        absolute right-0 top-10 p-3 w-40 rounded bg-light shadow z-1000 transition-set flex flex-col max-h-64 overflow-y-auto
                        ${!isCategoryMenuOpen && "opacity-0 pointer-events-none translate-y-6"}    
                    `}>
                        {
                            categories.map( (cat, i) => 
                                {
                                    console.log(cat)
                                return <button
                                    key={cat.id}
                                    className={`
                                        py-3 
                                        ${productValues.category_id === cat.id && "bg-dark text-white rounded"}
                                        ${i !== categories.length - 1 && "border-b border-dark/8"}
                                    `}
                                    onClick={() => {
                                        setProductValues( prev => ({...prev, category_id: cat.id}))
                                        setIsCategoryMenuOpen(false)
                                    }}
                                    type="button"
                                    >
                                        {cat.name}
                                    </button>
                                }
                             )
                        }
                    </div>
                </div>

                {/* Overlay */}
                <div className="bg-gray-100 w-fit absolute bottom-2 left-6">
                    {categories.find( cat => cat.id === productValues.category_id )?.name}
                </div>
            </label>
        </div>

        <div className="flex gap-8 mt-10">
            <label className="text-[10px] center-items gap-1">
                Add to Featured
                <input 
                type="checkbox"
                name="is_featured"
                checked={productValues.is_featured}
                value={"true"}
                onChange={(e) => {

                    const isChecked = e.currentTarget.checked
                    console.log(isChecked)
                    const value = isChecked
                    console.log(value)
                    setProductValues( prev => ({...prev, is_featured: value}))
                }}
                />
            </label>

            <label>
                <input 
                type="file" 
                accept="image/*"
                multiple
                className="bg-light/70 border border-dark/20 text-xs p-2 w-fit"
                onChange={hanldeImageChange}
                required
                />
            </label>
        </div>
        

    

        

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

        <div className="">
            <button className="flex items-center justify-center gap-1 bg-accent-blue px-8 py-3 rounded-lg mt-4 float-right text-white" 
            disabled={isAddingPackage}
            >
                {
                    isAddingPackage ?
                    <BeatLoader color="#fff" size={9}/> :
                    <>
                        <IoCreate className="text-[12px]"/>
                        <p className="text-[10px] font-bold">
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