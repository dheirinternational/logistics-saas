"use client"

import { usePackageStore } from "@/store/incomingPackagesStore";
import { useEditModalStore } from "@/types/editModalStore";
import { PackageImage, Warehouse } from "@/types/entityTypeDef";
import Image from "next/image";
import {  FormEvent, ReactNode, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";

export default function PageLayout({children}: {children: ReactNode}){
    return <div className="h-full max-h-full w-full flex overflow-y-hidden">
        <div className="h-full max-h-full overflow-y-auto flex-1 p-body">
            {children}
        </div>
        <div className="h-full max-h-full bg-light w-70">
            <PackageEditComponent />
        </div>
    </div>
}



const PackageEditComponent = () => {

    const {setIsModalActive} = useEditModalStore()
    const {selectedPackage, handleSelectedPackageInput, setPackageWarehouse, resetSelectedPackage, setTrigger} = usePackageStore()

    // Arrays
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [images, setImages] = useState<PackageImage[]>([])

    // Selected Objects
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
        

    // Fetching Data indicators 
    const [isFetchingWarehouse, setIsFetchingWarehouse] = useState(true)
    const [isUploadingPackage, setIsUploadingPackage] = useState(false)
    const [isFetchingImages, setIsFetchingImages] = useState(false)


    // Set DropDown States
    const [isWarehouseDropDownActive, setIsWarehouseDropDownActice] = useState(false)

    


    // Fetch Warehouses
    const fetchWarehouses = async () => {
        setIsFetchingWarehouse(true)
        try{
            const res = await fetch(`/api/warehouses`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            setWarehouses(result.data)

        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingWarehouse(false)
        }
    }

    // Fetch Images 
    const fetchImages = async () => {
        setIsFetchingImages(true)
        try{
            const res = await fetch(`/api/packages/images/${Number(selectedPackage?.id)}`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            console.log(result.data)
            setImages(result.data)

        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsFetchingImages(false)
        }
    }

    // handle uploading packages
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsUploadingPackage(true)

        const formData = new FormData(e.currentTarget)

        try{
            const res = await fetch("/api/packages", {
                method: "POST",
                body: formData
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("Successfully Added package")
            setTrigger()
            resetSelectedPackage()
            setIsModalActive()
            setImages([])
        }
        catch(err){
            toast.error("Network Error")
            console.error("Network Error",err)
        }
        finally{
            setIsUploadingPackage(false)
            
        }
    }

    
    // Fetch Data upon initial load 
    useEffect(() => {
        if(!selectedPackage) return
        fetchWarehouses()
        fetchImages()
    }, [selectedPackage])


    // Set Selected Warehouse
    useEffect(() => {
        if (!selectedPackage) return

        const warehouse = warehouses.find( warehouse =>
            Number(selectedPackage.warehouse_id) === Number(warehouse.id)
        )

        console.log(warehouse)

        setSelectedWarehouse(warehouse || null)
        

    }, [selectedPackage])


    console.log(images)


    return <div className="h-full max-h-full bg-light w-70 p-body space-y-4 overflow-y-auto overflow-x-hidden min-h-180 "> 
        <div>
            <h2 className='font-semibold'>
                Edit Packages
            </h2>          
            <p className='text-[10px] text-dark/60 my-3'>
                Manage, view and edit Packages stored in warehouse
            </p>
        </div>  

        <form className='mt-8' onSubmit={handleSubmit}>

            {
                selectedPackage &&
                <div className='space-y-4'> 

                    {/* Package Name */}
                    <div>
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Package Name
                            </span>
                            <input 
                            type="text" 
                            name="package_name" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedPackage.package_name}
                            // onChange={handleInputChange}
                            required
                            readOnly
                            />
                        </label>
                    </div>

                    {/* Package Warehouse */}
                    <div>
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Warehouse
                            </span>
                            <input 
                            type="number" 
                            name="warehouse_id" 
                            className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedPackage.warehouse_id}
                            onChange={handleSelectedPackageInput}
                            min={0}
                            required
                            readOnly
                            />

                            <div className="absolute right-1 bottom-2">
                                <button
                                className={`${isWarehouseDropDownActive && "rotate-180"} p-1`}
                                onClick={() => {setIsWarehouseDropDownActice(!isWarehouseDropDownActive)}}
                                type="button"
                                
                                >
                                    <FaChevronDown />
                                </button>
            
                                <div className={`
                                    absolute right-0 top-10 p-3 w-40 rounded bg-light shadow z-1000 transition-set flex flex-col max-h-64 overflow-y-auto
                                    ${!isWarehouseDropDownActive && "opacity-0 pointer-events-none translate-y-6"}    
                                `}>
                                    {
                                        warehouses.map( (warehouse, i) => 
                                            {
                                            return <button
                                                key={warehouse.id}
                                                className={`
                                                    py-3 
                                                    ${selectedPackage.warehouse_id === warehouse.id && "bg-dark text-white rounded"}
                                                    ${i !== warehouses.length - 1 && "border-b border-dark/8"}
                                                `}
                                                onClick={() => {
                                                    setPackageWarehouse(warehouse.id)
                                                    setIsWarehouseDropDownActice(false)
                                                }}
                                                type="button"
                                                >
                                                    {warehouse.name}
                                                </button>
                                            }
                                        )
                                    }
                                </div>
                            </div>
            
                            {/* Overlay */}
                                <div className="bg-light w-fit absolute bottom-2 left-2">
                                    {selectedWarehouse?.name}
                                </div>
                        </label>
                    </div>
                    
                    {/* Customer Code */}
                    <div>
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Customer Code
                            </span>
                            <input 
                            type="text" 
                            name="customer_code" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedPackage.customer_code}
                            // onChange={handleInputChange}
                            required
                            readOnly
                            />
                        </label>
                    </div>

                    {/* Package Identifier */}
                    <div>
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Package Identifier
                            </span>
                            <input 
                            type="text" 
                            name="incoming_package_id" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedPackage.incoming_package_id}
                            // onChange={handleInputChange}
                            required
                            readOnly
                            />
                        </label>
                    </div>
                    
                    {/* Weight */}
                    <div className="flex gap-2">
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Weight (kg)
                            </span>
                            <input 
                            type="number" 
                            name="weight" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedPackage.weight}
                            onChange={handleSelectedPackageInput}
                            min={0}
                            required
                            />
                        </label>

                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                No. of items
                            </span>
                            <input 
                            type="number" 
                            name="amount" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedPackage.amount}
                            onChange={handleSelectedPackageInput}
                            min={0}
                            required
                            />
                        </label>
                    </div>


                    {/* condition   Received_at   stored_at */}
                    <div className="flex gap-2">
                        <label className='w-18.5 flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Status
                            </span>
                            <input 
                            type="text" 
                            name="condition" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedPackage.condition}
                            onChange={handleSelectedPackageInput}
                            required
                            readOnly
                            />
                        </label>


                        <label className='w-18.5 flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Received
                            </span>
                            <input 
                            type="date" 
                            name="received_at" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedPackage.received_at}
                            onChange={handleSelectedPackageInput}
                            required
                            />
                        </label>


                        <label className='w-18.5 flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Stored
                            </span>
                            <input 
                            type="date" 
                            name="stored_at" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedPackage.stored_at}
                            onChange={handleSelectedPackageInput}
                            required
                            />
                        </label>
                    </div>

                    {/* Images */}
                    {
                    images.length > 0 &&
                    <div className="border border-dark/20 border-dashed p-4 rounded flex gap-1 bg-gray-200">
                        {
                            images.map( (image, i) =>
                                <figure
                                key={i}
                                className="w-13 h-13 bg-red-400 rounded overflow-hidden relative"
                                >
                                    <Image 
                                    src={image.image_url}
                                    alt="product image"
                                    className="object-cover"
                                    fill
                                    />
                                </figure>
                            )
                        }
                    </div>
                    }
                    
                </div>
            }
        </form>
    </div>
}
