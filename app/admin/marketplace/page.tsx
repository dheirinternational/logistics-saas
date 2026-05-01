"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { Table } from '@/components/admin/table/Table'
import { Product, ProductCategory } from '@/types/entityTypeDef'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import Link from 'next/link'
import { ChangeEvent, useEffect, useState } from 'react'
import { FaChevronDown, FaPlus } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

const columnHelper = createColumnHelper<Product>()

type FilterValue = {
    search: string
    status: string
    category: string
}


const Page: NextPage = ({}) => {

    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<ProductCategory[]>([])
    const [filterValue, setFilterValue] = useState<FilterValue>({
        search: "",
        status: "",
        category: "",
    })
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [productCategoryName, setProductCategoryName] = useState("")

    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false) 
    const [isEditStatusDropDownActive, setIsEditStatusDropDownActive] = useState(false)
    const [isEditFeaturedDropDownActive, setIsEditFeaturedDropDownActive] = useState(false)

    const [isDataLoading, setIsDataLoading] = useState(false)
    const [isSubmittingEditedData, setIsSubmittingEditedData] = useState(false)

    const fetchProducts = async () => {
        setIsDataLoading(true)
        try{
            const res = await fetch("/api/products")
            const resCat = await fetch("/api/products/categories")
            const result = await res.json()
            const categori = await resCat.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setProducts(result.data)
            setCategories(categori.data)
        }
        catch(err){
            toast.error("ERR:: Fetching Products")
            console.error("ERR:: Fetching Products", err)
        }
        finally{
            setIsDataLoading(false)
        }
    }

    // Fetch Products
    useEffect(() => {
        fetchProducts()
    }, [])

    // Find Category Name based by id
    useEffect(() => {
        if(selectedProduct){
            console.log(categories)
            console.log(selectedProduct.category_id)
            const name = categories.find( cat => cat.id === Number(selectedProduct.category_id) )?.name || ""
            setProductCategoryName(name)
        }
    }, [selectedProduct])

    // Table Def
    const productsTableDef = [
        columnHelper.accessor("id", {
            header: "ID"
        }),
        columnHelper.accessor("name", {
            header: "Product Name"
        }),
        columnHelper.accessor("price", {
            header: "Price",
            cell: ({getValue}) => <span>
                 ₦ {getValue()}
            </span>
        }),
        columnHelper.accessor("status", {
            header: "Status"
        }),
        columnHelper.accessor("weight", {
            header: "Weight",
            cell: ({getValue}) => <p>
                {getValue()} kg
            </p>
        }),
        columnHelper.accessor("is_featured", {
            header: "Featured"
        }),
        columnHelper.display({
            id: "action-btn",
            cell: (({row}) => {
                return <div className='space-x-2'> 
                    <button className='underline' 
                    onClick={() => {
                        setSelectedProduct(row.original)
                    }}>
                        view
                    </button>
                </div>
            })
        }),
    ]

    const data = products.filter( product => product.name.toLocaleLowerCase().includes(filterValue.search.toLowerCase())  && product.status.toLowerCase().includes(filterValue.status.toLowerCase()) 
    //&& product.category_id.toString().toLowerCase().includes(String(filterValue.category).toLowerCase()) 
    )

    // Categories
    const cate = categories.length > 0 ? categories.map( x => 
        ({name: `${x.name.charAt(0).toUpperCase()}${x.name.slice(1)}`, value: x.id.toString()})) 
        : []
    

    // Handle Input Change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {

        const { name, type } = e.currentTarget
        let { value } = e.currentTarget
        value = value.replace(/^0+(?=\d)/, "");
        
        setSelectedProduct( prev => {
            if (!prev) return prev
            return ({...prev, [name]: type === "number" ? Number(value) : value})
        })
    }


    // Submit edited Data  
    const updateProduct = async () => {
        setIsSubmittingEditedData(true)
        try{
            const res = await fetch(`/api/products`, {
                method: "PUT",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify(selectedProduct)
            })
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(`${selectedProduct?.name} successfully edited`)
            setSelectedProduct(null)
        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsSubmittingEditedData(false)
        }
    }




  return <div className='max-h-full h-full relative flex overflow-y-hidden'>
    <div className="h-full max-h-full overflow-y-auto flex-1 p-body space-y-body"> 

        <h2 className="text-2xl font-semibold">
            MarketPlace
        </h2>
        <p className="text-xs text-dark/50 mt-2">
            View all products in inventory.
        </p>

        {/* Add Product BTN */}
        <div className='rounded-lg '>
            <Link href={'/admin/marketplace/add_product'} className='rounded-lg border border-dark/20 flex w-30 items-center justify-center gap-3 text-xs py-3 bg-light'>
                <FaPlus />
                Add Product
            </Link>
        </div>

        {/* SEACRH Component */}
        <div className='p-body px-8 bg-light rounded-lg flex flex-col md:flex-row gap-4'>
            
            {/* Search Values */}
            <InputComponent 
            name="search" 
            title="Search" 
            type="text" 
            state={filterValue} 
            setState={setFilterValue}
            />

            {/* Status and Category */}
                
            {/* Status */}
            <InputComponent 
            name="status" 
            title="Status" 
            type="text" 
            state={filterValue} 
            setState={setFilterValue}
            readonly
            overshadow
            select
            placeHolder='select product status'
            selectValues={[
                {name: "-- none --", value: "" },
                {name: "Active", value: "active"}, 
                {name: "Inactive", value: "inactive"},
                {name: "Out_Of_Stock", value: "out_of_stock"}
            ]}
            />

            {/* Category */}
            <InputComponent
            name="category"
            title="Category"
            type="text"
            state={filterValue}
            setState={setFilterValue}
            readonly
            overshadow
            select
            selectValues={[{name: "-- none --", value: "" }, ...cate]}
            placeHolder='select product category'
            />
        </div>

        {/* Table */}
        <div className='bg-light p-body rounded-lg'>
            <h2 className='text-sm font-bold'>
                Products
            </h2>
            <p className='text-xs mt-2 opacity-70'>
                A list of all Products in the system.
            </p>
            <div className='mt-3 h-80 max-h-80 w-full max-w-full'>
                {
                    isDataLoading ?
                    <BeatLoader color='#f26430' size={12}/> :
                    <Table 
                    importedData={data}
                    columnDef={productsTableDef}
                    globalFilter=''
                    />
                }
            </div>
        </div>

    </div>



    <div className="h-full max-h-full bg-light w-70 p-body space-y-4 overflow-y-auto overflow-x-hidden min-h-180">
        <div>
            <h2 className='font-semibold'>
                Product Information
            </h2>          
            <p className='text-[10px] text-dark/60 my-3'>
                Manage and edit products in inventory
            </p>
        </div>  
        <div className='mt-8'>
            {
                selectedProduct &&
                <div className='space-y-4'>
                     
                     {/* product name */}
                    <div>
                    <label className='w-full flex flex-col relative text-[10px]'>
                        <span className='text-dark/60'>
                            Product Name
                        </span>
                        <input 
                        type="text" 
                        name="name" 
                        className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                        value={selectedProduct.name}
                        onChange={handleInputChange}
                        required
                        />
                    </label>
                    </div>

                    {/* Category */}
                    <div>
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Category
                            </span>
                            <input 
                            type="number" 
                            name="category_id" 
                            className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedProduct.category_id}
                            onChange={handleInputChange}
                            min={0}
                            required
                            readOnly
                            />

                            <div className="absolute right-1 bottom-2">
                                <button
                                className={`${isCategoryMenuOpen && "rotate-180"} p-1`}
                                onClick={() => {setIsCategoryMenuOpen(!isCategoryMenuOpen)}}
                                type="button"
                                
                                >
                                    <FaChevronDown />
                                </button>
            
                                <div className={`
                                    absolute right-0 top-10 p-3 w-40 rounded bg-light shadow z-1000 transition-set flex flex-col max-h-64 overflow-y-auto
                                    ${!isCategoryMenuOpen && "opacity-0 pointer-events-none translate-y-6"}    
                                `}>
                                    {
                                        categories.map( (cat, i) => 
                                            {
                                            return <button
                                                key={cat.id}
                                                className={`
                                                    py-3 
                                                    ${selectedProduct.category_id === cat.id && "bg-dark text-white rounded"}
                                                    ${i !== categories.length - 1 && "border-b border-dark/8"}
                                                `}
                                                onClick={() => {
                                                    setSelectedProduct( prev => {
                                                        if(!prev) return prev   
                                                        return ({...prev, category_id: cat.id})
                                                    })
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
                            <div className="bg-light w-fit absolute bottom-2 left-2">
                                {productCategoryName}
                            </div>
                        </label>
                    </div>
                    
                    {/* Price and discount price */}
                    <div className='flex gap-3'>
                        <label className='flex flex-col relative text-[10px] flex-1 min-w-20'>
                            <span className='text-dark/60'>
                                Price
                            </span>
                            <input 
                            type="number" 
                            name="price" 
                            className='border-b border-dark/10 p-2 pl-4 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedProduct.price}
                            onChange={handleInputChange}
                            required
                            />

                            <span className='absolute left-1 bottom-2.25'>
                                ₦
                            </span>
                        </label>

                        <label className='flex flex-col relative text-[10px] flex-1 min-w-20'>
                            <span className='text-dark/60'>
                                Discount Price
                            </span>
                            <input 
                            type="number" 
                            name="discount_price" 
                            className='border-b border-dark/10 p-2 pl-4 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedProduct.discount_price}
                            onChange={handleInputChange}
                            required
                            />

                            <span className='absolute left-1 bottom-2.25'>
                                ₦
                            </span>
                        </label>

                        <label className='flex flex-col relative text-[10px] flex-1 min-w-20'>
                            <span className='text-dark/60'>
                                Cost Price
                            </span>
                            <input 
                            type="number" 
                            name="cost_price" 
                            className='border-b border-dark/10 p-2 pl-4 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedProduct.cost_price}
                            onChange={handleInputChange}
                            required
                            />

                            <span className='absolute left-1 bottom-2.25'>
                                ₦
                            </span>
                        </label>
                     </div>

                     {/* Stock Quantity, low_stock_threshold, weight */}
                    <div className='flex gap-3'>
                        <label className='flex flex-col relative text-[10px] flex-1 min-w-20'>
                            <span className='text-dark/60'>
                                Weight
                            </span>
                            <input 
                            type="number" 
                            name="weight" 
                            className='border-b border-dark/10 p-2 pr-4 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedProduct.weight}
                            onChange={handleInputChange}
                            required
                            />

                            <span className='absolute right-1 bottom-2.25'>
                                kg
                            </span>
                        </label>

                        <label className='flex flex-col relative text-[10px] flex-1 min-w-20'>
                            <span className='text-dark/60'>
                                Stock Quantity
                            </span>
                            <input 
                            type="number" 
                            name="discount_price" 
                            className='border-b border-dark/10 p-2 pl-4 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedProduct.stock_quantity}
                            onChange={handleInputChange}
                            required
                            />
                        </label>

                        <label className='flex flex-col relative text-[10px] flex-1 min-w-20'>
                            <span className='text-dark/60'>
                                Threshold
                            </span>
                            <input 
                            type="number" 
                            name="low_stock_threshold" 
                            className='border-b border-dark/10 p-2 pl-4 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedProduct.low_stock_threshold}
                            onChange={handleInputChange}
                            required
                            />
                        </label>
                    </div>
                    
                    {/* Description */}
                    <div>
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Description
                            </span>
                            <input 
                            type="text" 
                            name="description" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedProduct.description}
                            onChange={handleInputChange}
                            required
                            />
                        </label>
                    </div>

                    {/* Featured and  Status*/}
                    <div className='flex gap-2'>
                        <label className='w-full flex flex-col relative text-[10px] max-w-30'>
                            <span className='text-dark/60'>
                                Status
                            </span>
                            <input 
                            type="text" 
                            name="status" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedProduct.status}
                            onChange={handleInputChange}
                            required
                            readOnly
                            />

                            <div className='absolute right-0 bottom-2.25'>
                                <button 
                                className={`${isEditStatusDropDownActive && "rotate-180"}`}
                                onClick={() => setIsEditStatusDropDownActive(prev => !prev)}
                                >
                                    <FaChevronDown />
                                </button>
                            </div>

                            <div className={`
                                absolute right-0 top-10 p-3 w-25 rounded bg-light shadow z-1000 transition-set flex flex-col max-h-64 overflow-y-auto
                                ${!isEditStatusDropDownActive && "opacity-0 pointer-events-none translate-y-6"}    
                            `}>
                                {
                                    [ "active", "inactive", "out_of_stock"].map( (cat, i) => 
                                        {
                                        return <button
                                            key={cat}
                                            className={`
                                                py-3 
                                                ${selectedProduct.status === cat && "bg-dark text-white rounded"}
                                                ${i !== categories.length - 1 && "border-b border-dark/8"}
                                            `}
                                            onClick={() => {
                                                setSelectedProduct( prev => {
                                                    if(!prev) return prev   
                                                    return ({...prev, status: cat as "active" | "inactive" | "out_of_stock"})
                                                })
                                                setIsEditStatusDropDownActive(false)
                                            }}
                                            type="button"
                                            >
                                                {cat}
                                            </button>
                                        }
                                    )
                                }
                            </div>
                        </label>

                        <label className='w-full flex flex-col relative text-[10px] max-w-30'>
                            <span className='text-dark/60'>
                                Featured
                            </span>
                            <input 
                            type="text" 
                            name="is_featured" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2 capitalize'
                            value={String(selectedProduct.is_featured)}
                            onChange={handleInputChange}
                            required
                            readOnly
                            />

                            <div className='absolute right-0 bottom-2.25'>
                                <button 
                                className={`${isEditFeaturedDropDownActive && "rotate-180"}`}
                                onClick={() => setIsEditFeaturedDropDownActive(prev => !prev)}
                                >
                                    <FaChevronDown />
                                </button>
                            </div>

                            <div className={`
                                absolute right-0 top-10 p-3 w-25 rounded bg-light shadow z-1000 transition-set flex flex-col max-h-64 overflow-y-auto capitalize
                                ${!isEditFeaturedDropDownActive && "opacity-0 pointer-events-none translate-y-6"}    
                            `}>
                                {
                                    [ "true", "false"].map( (cat, i) => 
                                        {
                                        return <button
                                            key={cat}
                                            className={`
                                                py-3 capitalize
                                                ${String(selectedProduct.is_featured) === cat && "bg-dark text-white rounded"}
                                                ${i !== categories.length - 1 && "border-b border-dark/8"}
                                            `}
                                            onClick={() => {
                                                setSelectedProduct( prev => {
                                                    if(!prev) return prev   
                                                    return ({...prev, is_featured: cat === "true" ? true : false})
                                                })
                                                setIsEditFeaturedDropDownActive(false)
                                            }}
                                            type="button"
                                            >
                                                {cat}
                                            </button>
                                        }
                                    )
                                }
                            </div>
                        </label>
                    </div>
                    
                    <div className='mt-14'>
                        <button 
                        className='bg-accent-red py-2 text-[10px] text-white w-full rounded '
                        onClick={updateProduct}
                        >
                            {
                                isSubmittingEditedData ?
                                <BeatLoader color='white' size={8}/> :
                                "Submit"
                            }
                        </button>
                    </div>

                </div>
            }
        </div>    
    </div>

  </div>
}


export default Page