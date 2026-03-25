"use client"

import { FormEvent, useState } from "react"
import InputComponent from "../shipments/InputComponent"
import { IoCreate } from "react-icons/io5"
import { Warehouse } from "@/types/entityTypeDef"

type WarehouseValues = Omit<Warehouse, "id" >

const AddWarehouse = () => {

    const [userValues, setUserValues] = useState<WarehouseValues>({
        name: "",
        location: "",
        capacity: "",
        managerId: "",
        type: "local",
        phone: "",
    })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputComponent name="name" type="text" title="Warehouse Name" state={userValues} setState={setUserValues}/>
        <InputComponent name="location" type="text" title="Location" state={userValues} setState={setUserValues}/>
        <InputComponent name="capacity" type="text" title="Capacity" state={userValues} setState={setUserValues}/>
        <InputComponent name="managerId" type="text" title="Manager ID" state={userValues} setState={setUserValues}/>
        <InputComponent name="type" type="text" title="Type" state={userValues} setState={setUserValues}/>
        <InputComponent name="phone" type="tel" title="Phone" state={userValues} setState={setUserValues}/>
        <div className="">
            <button className="flex items-center justify-center gap-1 bg-accent-blue px-4 py-3 rounded-lg mt-4 float-right">
                <IoCreate/>
                <p className="text-xs font-bold">
                    Add
                </p>
            </button>
        </div>
    </form>
  )
}

export default AddWarehouse