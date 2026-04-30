"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import { Table } from '@/components/admin/table/Table'
import { Product, ProductCategory, ProductImage } from '@/types/entityTypeDef'
import { ProductStatus } from '@/types/statusTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FaPlus, FaStar } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6'
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
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [filterValue, setFilterValue] = useState<FilterValue>({
        search: "",
        status: "",
        category: "",
    })
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isModalActive, setIsModalActive] = useState(false)
    const [isEditModalActive, setIsEditModalActive] = useState(true)


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
                        setIsModalActive(true)
                        setSelectedProduct(row.original)
                    }}>
                        view
                    </button>
                    <span>/</span>
                    <button className='underline' 
                    onClick={() => {
                        setIsEditModalActive(true)
                        setSelectedProduct(row.original)
                    }}>
                        edit
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
    
    // View Information Modal
    const modalProps = {
        setModal: () => setIsModalActive(false),
        product: selectedProduct,
        categories
    }

  return <div className='space-y-body relative'>
    <h2 className="text-2xl font-semibold">
        MarketPlace
    </h2>
    <p className="text-xs text-dark/50 mt-2">
        Manage, edit and view all products in inventory.
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
    {
        isModalActive &&
        <Modal {...modalProps} />
    }
    {
        isEditModalActive && selectedProduct &&
        <EditModal 
            setModal={() => setIsEditModalActive(false)}
            product={selectedProduct}
            setProduct={setSelectedProduct as Dispatch<SetStateAction<Product>>}
            categories={categories}
            fetchProducts={fetchProducts}
        />
    }
  </div>
}


const Modal = ({setModal, product, categories} : {setModal : () => void, product: Product | null, categories: ProductCategory[]}) => {

    const [productImages, setProductImages] = useState<ProductImage[]>([])
    const [isImagesLoading, setIsImagesLoading] = useState(false)

    // Fetch Product Images
    useEffect(() => {
        async function fetchProductImages(){
            setIsImagesLoading(true)
            try{
                const res = await fetch(`/api/products/images/${product?.id}`)
                const result = await res.json()

                if(!res.ok){
                    toast.error("Error Fetching Images")
                    return
                }

                setProductImages(result.data)
            }
            catch(err){
                console.error("Error Fetching Images", err)
            }
            finally{
                setIsImagesLoading(false)
            }
        }

        fetchProductImages()
    }, [])

    const category = categories.filter( x => x.id === Number(product?.category_id) )

  return <div className='w-screen h-dvh bg-dark/40 fixed top-0 right-0  center-items'>
        <div className='w-80 h-100 bg-light rounded p-4 relative'>
            <button 
            className='text-sm absolute right-4 top-4'
            onClick={() => {
                setModal()
            }}
            >
                <FaX />
            </button>
            {/* Product Name */}
            <div className=''>
                <h2 className='font-bold'>
                    {product?.name}
                </h2>
            </div>
            <div className='h-82 overflow-y-auto mt-4 '>
                
                {/* Images */}
                <div className='h-30 bg-amber-50 flex gap-2 overflow-x-auto'>
                    {
                        isImagesLoading ? 
                        <BeatLoader color=' #f26430' size={12}/> :
                        productImages.map( x =>  
                            <figure
                            key={x.id} 
                            className='h-30 w-30 min-w-30 overflow-hidden rounded relative border-2 border-dark/30'>
                                <Image
                                src={x.image_url}
                                alt='product-images'
                                fill
                                className='ob'
                                />
                            </figure>
                        )
                    }
                </div>

                {/* Price */}
                <div className='mt-4 relative'>
                    <p className='font-bold text-sm'>
                        Prices
                    </p>
                    <div className='text-xs flex justify-between p-3'>
                        <p className='space-x-3'>Price: ₦<span>{product?.price}</span></p>
                        <p className='space-x-3'>Discount: ₦<span>{product?.discount_price || "nil"}</span></p>
                        <p className='space-x-3'>Cost: ₦<span>{product?.cost_price || "nil"}</span></p>
                    </div>

                    {/* Is featured */}
                    {
                        product?.is_featured && 
                        <p className='bg-green-100 flex items-center gap-2 text-xs p-2 rounded-full w-fit px-4 absolute -right-2 -top-2 scale-70'>
                            <FaStar/>
                            featured
                        </p>
                    }
                </div>
                    <hr className='border-dark/40 my-2'/>
                <div className='space-y-2'>
                    <p className='text-xs'>
                        <span className='font-semibold'>Category: </span>
                        {category[0].name}
                    </p>
                    <p className='text-xs mb-5'>
                        <span className='font-semibold'>Stock Quantity: </span>
                        {product?.stock_quantity}
                    </p>
                    <span className="text-xs font-bold italic ">Description</span>
                    <p className='border border-dark/20 p-2 text-xs rounded mt-2'>
                        {product?.description}
                    </p>
                </div>
                {/*  */}
            </div>
        </div>
    </div>
}

const EditModal = ({setModal, product, setProduct, categories, fetchProducts} : {setModal : () => void, product: Product, setProduct: Dispatch<SetStateAction<Product >>, categories: ProductCategory[], fetchProducts: () => Promise<void>}) => {

    const [isUpdatingProuduct, setIsUpdatingProduct] = useState(false) 


    const handleProductUpdate = async () => {
        setIsUpdatingProduct(true)
        try{
            const res = await fetch("/api/products", {
                method: "PUT",
                headers: {
                    "Content-Type" : "application/json"
                },
                credentials: "include",
                body: JSON.stringify(product)
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            fetchProducts()
            toast.success(result.message)
            setModal()
            
        }
        catch(err){
            console.error("ERR:: Updating Product details", err)
            toast.error("ERR:: Updating Product details")
        }
    }

    return <div className='w-screen h-dvh bg-dark/40 fixed top-0 right-0  center-items'>
        <div className='w-80 h-100 bg-light rounded p-4 relative'>
            
            {/* Close Button */}
            <div className='flex justify-between mb-2'>
                <h2 className='font-bold'>
                    Edit Product
                </h2>
                <button 
                className='text-sm'
                disabled={isUpdatingProuduct}
                onClick={() => {
                    setModal()
                }}
                >
                    <FaX />
                </button>
            </div>
            
            {/* Inputs */}
            {/* <div className='h-70 max-h-70 overflow-y-auto pt-3 space-y-3'>
                <InputComponent
                name='name'
                state={product}
                setState={setProduct}
                type='text'
                title='Name'
                />

                <div className='flex gap-4'>
                    <InputComponent
                    name='price'
                    state={product}
                    setState={setProduct}
                    type='number'
                    title='Price'
                    />

                    <InputComponent
                    name='discount_price'
                    state={product}
                    setState={setProduct}
                    type='number'
                    title='Discount Price'
                    />

                    <InputComponent
                    name='cost_price'
                    state={product}
                    setState={setProduct}
                    type='number'
                    title='Cost Price'
                    />
                </div>

                <div className='flex gap-4'>    

                    <InputComponent
                    name='stock_quantity'
                    state={product}
                    setState={setProduct}
                    type='number'
                    title='Stock Quantity'
                    />

                    <InputComponent
                    name='low_stock_threshold'
                    state={product}
                    setState={setProduct}
                    type='number'
                    title='Low Stock Threshold'
                    />

                </div>

                <div className='flex gap-4'>
                
                    <InputComponent
                    name='is_featured'
                    state={product}
                    setState={setProduct}
                    type="text"
                    title='Is Featured'
                    readonly
                    select selectValues={[{name: "True", value: "true"}, {name: "False", value: 'false'}]}
                    />

                    <InputComponent
                    name='status'
                    state={product}
                    setState={setProduct}
                    type='text'
                    title='Status'
                    readonly
                    select
                    selectValues={[
                        {name: "Active", value: "active"},
                        {name: "Inactive", value: "inactive"},
                        {name: "Out Of Stock", value: "out_of_stock"}
                    ]}
                    />

                    <InputComponent
                    name='weight'
                    state={product}
                    setState={setProduct}
                    type='number'
                    title='Weight'
                    />
                </div>
                <InputComponent
                name='description'
                state={product}
                setState={setProduct}
                type='text'
                title='Status'
                textarea
                />
                 */}
                {/* 
                export type Product = {
                // id: number // unique
                // name: string
                // description: string
                // category_id: number
                // price: number
                // discount_price?: number | null
                // cost_price: number
                // stock_quantity: number
                low_stock_threshold: number
                weight: number
                status: ProductStatus
                is_featured: string
                created_by: string
                updated_by: string
                created_at: string
                updated_at: string 
            } */}
            {/* </div> */}

             {/* Submit BTN */}
            <div  className='mt-2'>
                <button 
                className='h-13 w-full bg-accent-red rounded text-white'
                disabled={isUpdatingProuduct}
                onClick={handleProductUpdate}
                >
                    {
                    isUpdatingProuduct ?
                    <BeatLoader color='#fff' size={10} speedMultiplier={0.5}/> :
                    "Submit Edit"
                    }
                </button>
            </div>
        </div> 
    </div>
}



export default Page