"use client"

import { FormEvent, useState } from "react"
import InputComponent from "../shipments/InputComponent"
import { LuHousePlus } from "react-icons/lu"
import { toast } from "@/lib/ui/toast"
import { DheirLoader } from "@/components/ui/DheirLoader"

type WarehouseValues = {
    name: string
    recipient_name: string
    phone: string
    country: string
    province: string
    city: string
    district: string
    street: string
    building: string
    postal_code: string
    manager_id: string
    type: "air" | "sea"
}

const AddWarehouse = () => {

    const [userValues, setUserValues] = useState<WarehouseValues>({
        name: "",
        recipient_name: "",
        phone: "",
        country: "",
        province: "",
        city: "",
        district: "",
        street: "",
        building: "",
        postal_code: "",
        manager_id: "",
        type: "air",
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)

        setIsSubmitting(true)
        setError("")

        try{
            const res = await fetch("/api/warehouses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(data)
            })

            if(!res.ok){
                const errorData = await res.json()
                throw new Error(errorData.error || "Error Adding Warehouse")
            }

            const result = await res.json()
            
            if(result.success){
                toast.success("Warehouse Added Successfully")
                setUserValues({
                    name: "",
                    recipient_name: "",
                    phone: "",
                    country: "",
                    province: "",
                    city: "",
                    district: "",
                    street: "",
                    building: "",
                    postal_code: "",
                    manager_id: "",
                    type: "air",
                })
            }
        }
        catch(err){
            const errorMsg = err instanceof Error ? err.message : "Something went wrong"
            setError(errorMsg)
            toast.error(errorMsg)
        }
        finally{
            setIsSubmitting(false)
        }
    }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Warehouse Details */}
        <div className="flex flex-col gap-3 border-b pb-4">
            <h3 className="font-semibold text-sm mb-2">Warehouse Details</h3>
            <InputComponent name="name" type="text" title="Warehouse Name" state={userValues} setState={setUserValues} required/>
            <InputComponent name="manager_id" type="text" title="Manager ID" state={userValues} setState={setUserValues} required/>
            <InputComponent name="type" type="text" title="Type" state={userValues} setState={setUserValues} required readonly select selectValues={[{name: "Air", value: "air"}, {name: "Sea", value: "sea"}]}/>
        </div>

        {/* Address Information */}
        <div className="flex flex-col gap-3 border-b pb-4">
            <h3 className="font-semibold text-sm mb-2">Address Information</h3>

            <InputComponent name="recipient_name" type="text" title="Recipient Name" state={userValues} setState={setUserValues} required/>
            <InputComponent name="country" type="text" title="Country" state={userValues} setState={setUserValues} required readonly select selectValues={[{name:"Nigeria", value: "NG"}, {name:"China", value: "CN"}]}/>
            <InputComponent name="province" type="text" title="Province" state={userValues} setState={setUserValues} required/>
            <InputComponent name="city" type="text" title="City" state={userValues} setState={setUserValues} required/>
            <InputComponent name="district" type="text" title="District" state={userValues} setState={setUserValues} />
            <InputComponent name="street" type="text" title="Street" state={userValues} setState={setUserValues} required/>
            <InputComponent name="building" type="text" title="Building" state={userValues} setState={setUserValues} />
            <InputComponent name="postal_code" type="text" title="Postal Code" state={userValues} setState={setUserValues} required/>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm mb-2">Contact</h3>
            <InputComponent name="phone" type="tel" title="Phone" state={userValues} setState={setUserValues} required/>
        </div>

        <div className="">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1 bg-accent-blue px-4 py-3 rounded-lg mt-4 float-right text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <DheirLoader color="#fff" size={15} />
                ) : (
                    <>
                        <LuHousePlus/>
                        <p className="text-xs font-bold">
                            Add Warehouse
                        </p>
                    </>
                )}
            </button>
        </div>
    </form>
  )
}

export default AddWarehouse