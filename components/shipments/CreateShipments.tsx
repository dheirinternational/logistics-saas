"use client"

import { FormEvent, useState } from "react"
import InputComponent from "./InputComponent"
import { IoCreate } from "react-icons/io5"
import { Shipment } from "@/types/entityTypeDef"

type ShipmentValues = Omit<Shipment, "id" | "status" | "createdAt" | "trackingNumber">

const CreateShipments = () => {

    const [shipmentValues, setShipmentValues] = useState<ShipmentValues>({
        customerId: "",
        originAddressId: "",
        destinationAddressId: "",
        carrierId: "",
        warehouseId: "",
        totalCost: 0, 
    })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputComponent name="customerId" type="number" title="Customer" state={shipmentValues} setState={setShipmentValues}/>
        {shipmentValues.customerId}
        <InputComponent name="originAddressId" type="number" title="Origin Address" state={shipmentValues} setState={setShipmentValues}/>
        <InputComponent name="destinationAddressId" type="number" title="Destination Address" state={shipmentValues} setState={setShipmentValues}/>
        <InputComponent name="carrierId" type="number" title="Carrier" state={shipmentValues} setState={setShipmentValues}/>
        <InputComponent name="warehouseId" type="number" title="Warehouse" state={shipmentValues} setState={setShipmentValues}/>
        <InputComponent name="totalCost" type="number" title="Total Cost" state={shipmentValues} setState={setShipmentValues}/>
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

export default CreateShipments