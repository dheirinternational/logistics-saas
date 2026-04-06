"use client"

import { FormEvent, useState } from "react"
import InputComponent from "./InputComponent"
import { IoCreate } from "react-icons/io5"
import { Shipment } from "@/types/entityTypeDef"

type ShipmentValues = Omit<Shipment, "id" | "status" | "created_at" | "tracking_number" | "payment_time">

const CreateShipments = () => {

    const [shipmentValues, setShipmentValues] = useState<ShipmentValues>({
        customer_code: "",
        origin_warehouse_id: "",
        destination_warehouse_id: "",
        channel: "air",
        total_cost: 50000, 
        shipping_note: ""
    })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputComponent name="customerCode" type="text" title="Customer Code" state={shipmentValues} setState={setShipmentValues}/>
        <InputComponent name="originWarehouseId" type="text" title="Origin Warehouse ID" state={shipmentValues} setState={setShipmentValues}/>
        <InputComponent name="destinationWarehouseId" type="text" title="Destination Warehouse ID" state={shipmentValues} setState={setShipmentValues}/>
        <InputComponent name="shippingMethod" type="text" title="Shipping Method" state={shipmentValues} setState={setShipmentValues}/>
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