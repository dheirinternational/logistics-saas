"use client"

import { usePackageStore } from "@/store/incomingPackagesStore";
import { useShipmentStore } from "@/store/shipmentsStore";
import { useEditModalStore } from "@/types/editModalStore";
import { Warehouse } from "@/types/entityTypeDef";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import { FaChevronDown, FaGlobe, FaImage } from "react-icons/fa";
import { BeatLoader } from "react-spinners";
import { toast } from "react-toastify";

const pages = [
    {
        name: "expected_shipments",
        link: "/admin/shipments"
    },
    {
        name: "shipment_requests",
        link: "/admin/shipments/requests"
    },
    {
        name: "accepted_requests",
        link: "/admin/shipments/accepted_shipments"
    }
]

export default function ShipmentsLayouts({children}: {children:ReactNode}){

    const pathName = usePathname()
    const {isModalActive, setIsModalActive} = useEditModalStore()


    const [currentPage, setCurrentPage] = useState<"expected_shipments" | "shipment_requests" | "accepted_requests" | "">("")
    const [isPageSelectorActive, setIsPageSelectorActive] = useState(false)

    // console.log(pathName)

    useEffect(() => {
        function setPageTitle(){
            switch(pathName) {
                case "/admin/shipments/requests" :
                    setCurrentPage("shipment_requests")
                    break
                case "/admin/shipments" :
                    setCurrentPage("expected_shipments")
                    break
                case "/admin/shipments/accepted_shipments" :
                    setCurrentPage("accepted_requests")
                    break
            }

        }   

        setPageTitle()
    }, [pathName])


    // Set Selected Edit component based on page
    const EditComponent = () => {
        switch(currentPage){
            case "expected_shipments" :
                return <IncomingPackageEditComponent/>
            case "accepted_requests" :
                return <AcceptedShipmentsEditComponent />
            default :
                return <div></div>
        }
    } 

    return(
        <div className='max-h-full h-full overflow-hidden relative flex'>
            <div className="p-body overflow-y-auto max-h-full h-full flex-1">
                <h2 className="text-2xl font-semibold">
                    Shipments
                </h2>
                <p className="text-xs text-dark/50 mt-2">
                    Monitor, filter, and manage all outgoing shipments from one control deck.
                </p>
                
                {/* Page Selector */}
                <div className="mt-8 mb-6">
                    <label className='w-full flex flex-col relative max-w-70 text-xs'>
                        <span className='text-dark/80'>
                            Page
                        </span>
                        <input 
                        type="text" 
                        name="current_page" 
                        className='border-b border-dark/10 p-2 pl-7 outline-0 focus:border-dark transition-set pr-14'
                        value={currentPage}
                        readOnly
                        onChange={ (e) => setCurrentPage(e.currentTarget.value as "expected_shipments" | "shipment_requests" | "accepted_requests")}
                        />
                        <FaGlobe className='absolute left-1 bottom-2.5 text-dark/60'/>
                        <div className="absolute right-1 bottom-1.5">
                            <button
                            onClick={() => setIsPageSelectorActive(prev => !prev)}
                            className={`${isPageSelectorActive && "rotate-180"} transition-set`}
                            >
                                <FaChevronDown/>
                            </button>


                            {/* LINKS */}
                            <div className={`
                                absolute right-0 top-[110%] bg-light shadow shadow-dark/20 p-2 z-1000 rounded w-40 transition-set flex flex-col gap-1
                                ${!isPageSelectorActive && "opacity-0 translate-y-8 pointer-events-none"}
                            `}>
                                {
                                    pages.map( (x, i) => 
                                        <Link 
                                        key={x.name} 
                                        href={x.link} 
                                        className={`z-50 relative border-dark/20 px-3 py-2 text-center
                                        ${pathName === x.link && "bg-dark text-white rounded"}
                                        ${i !== 2 && "border-b"}
                                        `}
                                        
                                        onClick={() => setIsPageSelectorActive(false)}
                                        >
                                            {`${x.name.charAt(0).toUpperCase() + x.name.slice(1)}`.split("_").join(" ")}
                                        </Link>
                                    )
                                }
                            </div>
                        </div>
                    </label>
                </div>

                {children}

            </div>

            <div className={` 
                bg-light w-70
                max-sm:fixed max-sm:w-screen 
                ${isModalActive ? "max-sm:right-0" : "max-sm:-right-full"}
            `}>
                {EditComponent()}
            </div>    
        </div>
    )
}





const IncomingPackageEditComponent = () => {

    const {setIsModalActive} = useEditModalStore()
    const {selectedPackage, handleSelectedPackageInput, setPackageWarehouse, resetSelectedPackage, setTrigger} = usePackageStore()

    // Arrays
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [images, setImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    // Selected Objects
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
        

    // Fetching Data indicators 
    const [isFetchingWarehouse, setIsFetchingWarehouse] = useState(true)
    const [isUploadingPackage, setIsUploadingPackage] = useState(false)


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

    // handle image selection
    const hanldeImageChange = (e:ChangeEvent<HTMLInputElement>) => {

        if(!e.target.files) return

        const files = Array.from(e.target.files)

        if(files.length < 1){
            toast.error("Select Images")
            return
        }

        const urls = files.map( file => URL.createObjectURL(file) )
        setPreviews(urls)
        setImages(files)
    }

    // handle uploading packages
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsUploadingPackage(true)

        const formData = new FormData(e.currentTarget)
        formData.append("inp_status", "stored")
        formData.append("user_id", String(selectedPackage?.user_id))

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
        fetchWarehouses()
    }, [])


    // Set Selected Warehouse
    useEffect(() => {
        if (!selectedPackage) return

        const warehouse = warehouses.find( warehouse => 
            selectedPackage.warehouse_id === warehouse.id
        )

        setSelectedWarehouse(warehouse || null)
        

    }, [selectedPackage])




    return <div className="h-full max-h-full bg-light w-70 p-body space-y-4 overflow-y-auto overflow-x-hidden min-h-180 "> 
        <div>
            <h2 className='font-semibold'>
                Add Packages
            </h2>          
            <p className='text-[10px] text-dark/60 my-3'>
                Add Packages to warehouse
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
                                Category
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

                    {/* Package user_id */}
                    <div>
                        
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
                    <div>
                        <div className="w-fit h-fit overflow-hidden max-w-fit max-h-fit relative rounded">
                            <button 
                            className="text-[10px] border border-dark/30 rounded px-4 py-2 flex gap-1 items-center relative z-100"
                            type="button"
                            >
                                Select Images
                                <FaImage />
                            </button>
                            <input 
                            type="file" 
                            accept="image/*"
                            multiple
                            name="images"
                            onChange={hanldeImageChange}
                            className="w-full h-full bg-red-400 absolute z-1000 top-0 left-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="border border-dark/40 rounded py-2 mt-4">
                            <div className="flex justify-center w-full gap-4">
                                {previews.map( (x, i) => 
                                <figure key={i} className="w-10 h-10 bg-accent-red rounded overflow-hidden relative">
                                    <Image
                                        src={x}
                                        alt=""
                                        fill
                                        className="object-fill"
                                        />
                                    </figure>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-16 mb-40">
                        <button 
                        className="bg-accent-red text-white text-[10px] w-full py-2 rounded"
                        onClick={() => console.log(selectedPackage)}
                        disabled={isUploadingPackage}
                        >
                            {
                                isUploadingPackage ? 
                                <BeatLoader color="#FFF" size={8}/> :
                                <>
                                    <p>
                                        Add Package
                                    </p>
                                </>
                            }
                        </button>
                    </div>
                </div>
            }

        </form>
    </div>
}




const AcceptedShipmentsEditComponent = () => {

    const {selectedShipment, handleSelectedShipmentInput, setShipmentStatus,resetSelectedShipment, setShipmentrigger} = useShipmentStore()

    // Arrays
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])

    // Selected Objects
        

    // Fetching Data indicators 
    const [isFetchingWarehouse, setIsFetchingWarehouse] = useState(true)
    const [isUpdatingShipmentStatus, setIsUpdatingShipmentStatus] = useState(false)

    // Set DropDown States
    const [isStatusDropDownActive, setIsStatusDropDownActive] = useState(false)

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

    // handle image selection

    // handle uploading packages
    const handleUpdateStatus = async (id, status: string) => {
        setIsUpdatingShipmentStatus(true)
        try{
            const res = await fetch(`/api/shipments/update-status`, {
                method: "PUT",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({
                    id,
                    status
                })
            })
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success(result.message)
            setShipmentrigger()
            resetSelectedShipment()

        }
        catch(err){
            console.error("Network Error", err)
            toast.error("Network Error")
        }
        finally{
            setIsUpdatingShipmentStatus(false)
        }
    }

    
    // Fetch Data upon initial load 
    useEffect(() => {
        fetchWarehouses()
    }, [])

    // Set Selected Warehouse


    // Static Data
    const status = ["processing" , "shipped" , "in_transit" , "arrived" , "out_for_delivery" , "delivered"]

    return <div className="h-full max-h-full bg-light w-70 p-body space-y-4 overflow-y-auto overflow-x-hidden min-h-180 "> 
        <div>
            <h2 className='font-semibold'>
                View Shipment
            </h2>          
            <p className='text-[10px] text-dark/60 my-3'>
                View shipment details and edit shipment status
            </p>
        </div>  


        <div className='mt-8'>
            {
                selectedShipment &&
                <div className='space-y-4'> 

                    {/* Tracking Id */}
                    <div>
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Tracking Id
                            </span>
                            <input 
                            type="text" 
                            name="tracking_number" 
                            className='border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedShipment.tracking_number}
                            // onChange={handleInputChange}
                            required
                            readOnly
                            />
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
                            value={selectedShipment.customer_code}
                            // onChange={handleInputChange}
                            required
                            readOnly
                            />
                        </label>
                    </div>

                    {/* Origin Warehouse */}
                    <div>
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Origin Warehouse
                            </span>
                            <input 
                            type="number" 
                            name="origin_warehouse_id" 
                            className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedShipment.origin_warehouse_id}
                            onChange={handleSelectedShipmentInput}
                            required
                            readOnly
                            /> 
                        </label>
                    </div>

                    {/* Destination Warehouse */}
                    <div>
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Destination Warehouse
                            </span>
                            <input 
                            type="number" 
                            name="destination_warehouse_id" 
                            className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedShipment.destination_warehouse_id}
                            onChange={handleSelectedShipmentInput}
                            required
                            readOnly
                            /> 
                        </label>
                    </div>

                    {/* Channel, price, weight */}
                    <div className="flex gap-3">
                        <label className='flex flex-1 flex-col relative text-[10px] w-18'>
                            <span className='text-dark/60'>
                                Channel
                            </span>
                            <input 
                            type="text" 
                            name="channel" 
                            className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2 capitalize'
                            value={selectedShipment.channel}
                            onChange={handleSelectedShipmentInput}
                            required
                            readOnly
                            /> 
                        </label>

                        <label className='flex flex-1 flex-col relative text-[10px] w-18'>
                            <span className='text-dark/60'>
                                T. Cost
                            </span>
                            <input 
                            type="number" 
                            name="total_cost" 
                            className='select-none cursor-default border-b border-dark/10 p-2 pl-6 outline-0 focus:border-dark transition-set pr-2 capitalize'
                            value={selectedShipment.total_cost}
                            onChange={handleSelectedShipmentInput}
                            required
                            readOnly
                            /> 
                            <span className="left-1 bottom-2.25 absolute">
                                ₦
                            </span>
                        </label>

                        <label className='flex flex-1 flex-col relative text-[10px] w-18'>
                            <span className='text-dark/60'>
                                T. Weight (kg)
                            </span>
                            <input 
                            type="number" 
                            name="weight" 
                            className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2 capitalize'
                            value={selectedShipment.total_weight}
                            onChange={handleSelectedShipmentInput}
                            required
                            readOnly
                            /> 
                        </label>
                    </div>

                    {/* Shipment */}
                    <div className="border border-dark/20 text-[10px] p-3 rounded border-dashed space-y-1 capitalize text-dark/60">
                        <p>Payment Period: {" "} 
                            <span className="text-dark">
                                {selectedShipment.payment_time.split("_").join(" ")}
                            </span>
                        </p>
                        <p>Payment Status: 
                            <span className="text-dark">
                                {selectedShipment.paid_for ? "Paid" : "Pending"}
                            </span>
                        </p>
                    </div>

                    {/* Status */}


                    <div className="pb-80 relative">
                        <label className='w-full flex flex-col relative text-[10px]'>
                            <span className='text-dark/60'>
                                Shipment Status
                            </span>
                            <input 
                            type="text" 
                            name="warehouse_id" 
                            className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                            value={selectedShipment.status}
                            onChange={handleSelectedShipmentInput}
                            min={0}
                            required
                            readOnly
                            />

                            <div className="absolute right-1 bottom-2">
                                <button
                                className={`${isStatusDropDownActive
                                     && "rotate-180"} p-1`}
                                onClick={() => {setIsStatusDropDownActive(!isStatusDropDownActive)}}
                                type="button"
                                disabled={isUpdatingShipmentStatus}
                                >
                                    <FaChevronDown />
                                </button>
            
                                <div className={`
                                    absolute right-0 top-10 p-3 w-40 rounded bg-light shadow z-1000 transition-set flex flex-col max-h-40 overflow-y-auto
                                    ${!isStatusDropDownActive && "opacity-0 pointer-events-none translate-y-6"}    
                                `}>
                                    {
                                        status.map( (stat, i) => 
                                            {
                                            return <button
                                                key={stat}
                                                className={`
                                                    py-3 capitalize
                                                    ${selectedShipment.status === stat && "bg-dark text-white rounded"}
                                                    ${i !== stat.length - 1 && "border-b border-dark/8"}
                                                `}
                                                onClick={() => {
                                                    // setPackageWarehouse(warehouse.id)
                                                    setIsStatusDropDownActive(false)
                                                    handleUpdateStatus(selectedShipment.id, stat)
                                                }}
                                                disabled={isUpdatingShipmentStatus}
                                                type="button"
                                                >
                                                    {stat.split("_").join(" ")}
                                                </button>
                                            }
                                        )
                                    }
                                </div>
                            </div>
                        </label>
                        {
                            isUpdatingShipmentStatus && 
                            <div className="text-[8px] text-yellow-600 flex items-center gap-2 mt-3 absolute top-10 z-1000 left-0">
                                <p>Updating Status</p>
                                <BeatLoader color="black" size={4}/>
                            </div>
                        } 
                    </div>

                </div>
            }

        </div>
    </div>
}

