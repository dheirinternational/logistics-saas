"use client"

import { usePackageStore } from "@/store/incomingPackagesStore";
import { useShipmentStore } from "@/store/shipmentsStore";
import { useEditModalStore } from "@/types/editModalStore";
import { Warehouse } from "@/types/entityTypeDef";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { FaGlobe, FaImage, FaPlus } from "react-icons/fa";
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast";
import { IconX } from "@tabler/icons-react"
import { DheirSelect } from "@/components/ui/DheirSelect"
import { AdminShipmentViewModal } from "@/components/admin/shipments/AdminShipmentViewModal"

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
    const { isModalActive, setIsModalActive, closeModal } = useEditModalStore()
    const { setSelectedPackage, setReadOnly } = usePackageStore()
    const { resetSelectedShipment } = useShipmentStore()


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
                return <AdminShipmentViewModal />
            default :
                return <div></div>
        }
    }

    const closeShipmentsModal = () => {
        closeModal()
        if (currentPage === "accepted_requests") {
            resetSelectedShipment()
        }
    }

    const modalTitle =
        currentPage === "accepted_requests" ? "View shipment" : "Add packages"
    const modalSubtitle =
        currentPage === "accepted_requests"
            ? "View shipment details and update status."
            : "Add packages to warehouse with photos and details."

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
                        if (e.target === e.currentTarget) closeShipmentsModal()
                    }}
                >
                    <div
                        className="dheir-dialog admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={modalTitle}
                    >
                        <div className="dheir-dialog__head">
                            <div>
                                <h2 className="dheir-dialog__title">{modalTitle}</h2>
                                <p className="admin-modal__subtitle">
                                    {modalSubtitle}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="dheir-dialog__close"
                                onClick={closeShipmentsModal}
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
    const {selectedPackage, handleSelectedPackageInput, handleSelectedPackageSelect, setPackageWarehouse, resetSelectedPackage, setTrigger, readonly} = usePackageStore()

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
                            <span className="portal-packages__field-label">
                                {selectedPackage.weight_unit === "cbm" ? "Volume (CBM)" : "Weight (kg)"}
                            </span>
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
                            <span className="portal-packages__field-label">Unit</span>
                            <DheirSelect
                                name="weight_unit"
                                value={selectedPackage.weight_unit ?? "kg"}
                                onChange={handleSelectedPackageSelect}
                                required
                            >
                                <option value="kg">KG</option>
                                <option value="cbm">CBM</option>
                            </DheirSelect>
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




