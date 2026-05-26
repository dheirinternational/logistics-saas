"use client"

import { usePackageStore } from "@/store/incomingPackagesStore";
import { useShipmentStore } from "@/store/shipmentsStore";
import { useEditModalStore } from "@/types/editModalStore";
import { Warehouse } from "@/types/entityTypeDef";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { FaChevronDown, FaGlobe, FaImage, FaPlus } from "react-icons/fa";
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast";
import { IconX } from "@tabler/icons-react"
import { DheirSelect } from "@/components/ui/DheirSelect"

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
    const {setSelectedPackage, setReadOnly} = usePackageStore()


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
            <div className="portal-home overflow-y-auto max-h-full h-full flex-1">
                <header className="portal-home__greeting">
                    <div>
                        <p className="portal-home__greeting-label">Admin</p>
                        <h1 className="portal-home__greeting-title">Shipments</h1>
                        <p className="portal-home__greeting-sub">
                            Monitor, filter, and manage shipments from one control deck.
                        </p>
                    </div>
                </header>

                <div className="portal-home__toolbar">
                    <div className="portal-home__tabs" role="tablist" aria-label="Shipments pages">
                        {pages.map((x) => {
                            const isActive = pathName === x.link
                            return (
                                <Link
                                    key={x.name}
                                    href={x.link}
                                    className={`portal-home__tab${isActive ? " is-active" : ""}`}
                                    role="tab"
                                    aria-selected={isActive}
                                >
                                    {`${x.name.charAt(0).toUpperCase() + x.name.slice(1)}`.split("_").join(" ")}
                                </Link>
                            )
                        })}
                    </div>

                    {currentPage === "expected_shipments" ? (
                        <button
                            type="button"
                            className="portal-home__btn portal-home__btn--primary"
                            onClick={() => {
                                setReadOnly()
                                setSelectedPackage({
                                    id: 0, 
                                    incoming_package_id: "", 
                                    package_name: "",
                                    user_id: 0,  
                                    customer_code: "", 
                                    warehouse_id: 0, 
                                    weight: 0,
                                    amount: 0,
                                    condition: "good",
                                    status: "stored",
                                    received_at: "",
                                    stored_at: "",
                                    created_at: "",
                                })
                                setIsModalActive()
                            }}
                        >
                            Add package
                        </button>
                    ) : null}
                </div>

                {children}

            </div>

            {isModalActive ? (
                <div
                    className="dheir-dialog-backdrop"
                    role="presentation"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsModalActive()
                    }}
                >
                    <div
                        className="dheir-dialog admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Add packages"
                    >
                        <div className="dheir-dialog__head">
                            <div>
                                <h2 className="dheir-dialog__title">Add packages</h2>
                                <p className="admin-modal__subtitle">
                                    Add packages to warehouse with photos and details.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="dheir-dialog__close"
                                onClick={() => setIsModalActive()}
                                aria-label="Close"
                            >
                                <IconX size={20} stroke={1.5} />
                            </button>
                        </div>
                        <div className="admin-modal__body">
                            {EditComponent()}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}





const IncomingPackageEditComponent = () => {

    const {setIsModalActive} = useEditModalStore()
    const {selectedPackage, handleSelectedPackageInput, setPackageWarehouse, resetSelectedPackage, setTrigger, readonly} = usePackageStore()

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
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    


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




    return (
        <form onSubmit={handleSubmit} className="admin-modal__form">
            {selectedPackage ? (
                <>
                    <div className="admin-modal__fields">
                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Package name</span>
                            <input
                                type="text"
                                name="package_name"
                                className="dheir-input"
                                value={selectedPackage.package_name}
                                onChange={handleSelectedPackageInput}
                                required
                                readOnly={readonly}
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Warehouse</span>
                            <DheirSelect
                                name="warehouse_id"
                                value={String(selectedPackage.warehouse_id ?? "")}
                                onChange={(e) => setPackageWarehouse(Number(e.target.value))}
                                required
                            >
                                <option value="">Select warehouse</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </DheirSelect>
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Customer code</span>
                            <input
                                type="text"
                                name="customer_code"
                                className="dheir-input"
                                value={selectedPackage.customer_code}
                                onChange={handleSelectedPackageInput}
                                required
                                readOnly={readonly}
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Package identifier</span>
                            <input
                                type="text"
                                name="incoming_package_id"
                                className="dheir-input"
                                value={selectedPackage.incoming_package_id}
                                onChange={handleSelectedPackageInput}
                                required
                                readOnly={readonly}
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Weight (kg)</span>
                            <input
                                type="number"
                                name="weight"
                                className="dheir-input"
                                value={selectedPackage.weight}
                                onChange={handleSelectedPackageInput}
                                min={0}
                                step="0.01"
                                required
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">No. of items</span>
                            <input
                                type="number"
                                name="amount"
                                className="dheir-input"
                                value={selectedPackage.amount}
                                onChange={handleSelectedPackageInput}
                                min={0}
                                required
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Condition</span>
                            <input
                                type="text"
                                name="condition"
                                className="dheir-input"
                                value={selectedPackage.condition}
                                onChange={handleSelectedPackageInput}
                                required
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Received</span>
                            <input
                                type="date"
                                name="received_at"
                                className="dheir-input"
                                value={selectedPackage.received_at}
                                onChange={handleSelectedPackageInput}
                                required
                            />
                        </label>

                        <label className="portal-packages__field">
                            <span className="portal-packages__field-label">Stored</span>
                            <input
                                type="date"
                                name="stored_at"
                                className="dheir-input"
                                value={selectedPackage.stored_at}
                                onChange={handleSelectedPackageInput}
                                required
                            />
                        </label>
                    </div>

                    <div className="admin-uploader">
                            <div className="admin-uploader__row">
                                <div>
                                    <p className="portal-packages__field-label" style={{ margin: 0 }}>
                                        Photos
                                    </p>
                                    <p className="admin-uploader__help">
                                        Upload clear images of the package. You can select multiple.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="portal-home__btn portal-home__btn--secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Choose images
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    name="images"
                                    onChange={hanldeImageChange}
                                    style={{ display: "none" }}
                                />
                            </div>

                            {previews.length > 0 ? (
                                <div className="admin-uploader__previews">
                                    {previews.map((src, i) => (
                                        <div key={src + i} className="admin-uploader__preview">
                                            <Image src={src} alt="" fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="admin-uploader__help">No images selected yet.</p>
                            )}
                        </div>

                    <div className="admin-modal__actions">
                            <button
                                type="submit"
                                className="portal-home__btn portal-home__btn--primary"
                                disabled={isUploadingPackage}
                            >
                                {isUploadingPackage ? (
                                    <DheirLoader color="#fff" size={10} />
                                ) : (
                                    "Add package"
                                )}
                            </button>
                    </div>
                </>
            ) : (
                <div className="portal-home__panel-empty">
                    <p className="portal-home__section-sub">
                        Select an incoming package to add details.
                    </p>
                </div>
            )}
        </form>
    )
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
                            step="0.01"
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
                            step="0.01"
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
                                <DheirLoader color="black" size={4}/>
                            </div>
                        } 
                    </div>

                </div>
            }

        </div>
    </div>
}

