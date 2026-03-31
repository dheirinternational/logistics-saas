"use client"

import { FormEvent, useState } from "react"
import { IoCreate } from "react-icons/io5"
import { Package } from "@/types/entityTypeDef"
import InputComponent from "../shipments/InputComponent"


type PackageValues = Omit<Package, "id" | "createdAt" | "trackingNumber" | "shipmentId" | "userId" | "incoming_package_id" | "warehouseId" | "customerCode">

const AddPackage = () => {

    const [packageValues, setPackageValues] = useState<PackageValues>({
        packageName: "",
        actualWeight: 0,
        photos: [],
        condition: "good",
        status: "stored",
    })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputComponent name="packageName" type="text" title="Package Name" state={packageValues} setState={setPackageValues}/>
        <InputComponent name="actualWeight" type="number" title="Actual Weight of product" state={packageValues} setState={setPackageValues}/>
        {/* Photos <InputComponent name="destinationWarehouseId" type="text" title="Destination Warehouse ID" state={packageValues} setState={setPackageValues}/> */}
        <InputComponent 
        name="condition" 
        type="text" 
        title="Shipping Method" 
        state={packageValues} 
        setState={setPackageValues}
        readonly 
        select
        selectValues={["good" , "damaged"]}

        />
        <InputComponent 
        name="status" 
        type="text" 
        title="Status" 
        state={packageValues} 
        setState={setPackageValues}
        readonly
        select
        selectValues={["stored", "assigned_to_shipment"]}
        />
        <div className="">
            <button className="flex items-center justify-center gap-1 bg-accent-blue px-4 py-3 rounded-lg mt-4 float-right">
                <IoCreate/>
                <p className="text-xs font-bold">
                    Create
                </p>
            </button>
        </div>
    </form>
  )
}

export default AddPackage