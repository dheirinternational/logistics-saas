"use client"

import { ChangeEvent, FormEvent, useState } from "react"
import { IoCreate } from "react-icons/io5"
import { IncomingPackage, Package } from "@/types/entityTypeDef"
import InputComponent from "../shipments/InputComponent"
import Image from "next/image"
import { toast } from "react-toastify"
import { BeatLoader } from "react-spinners"
import { useRouter } from "next/navigation"


type PackageValues = Omit<Package, "id" | "created_at" >

const AddPackage = ({props} : {props: IncomingPackage}) => {

    const [packageValues, setPackageValues] = useState<PackageValues>({
        package_name: props.declared_item_name,
        weight: 0,
        condition: "good",
        status: "stored",
        received_at: "",
        stored_at: "",
        customer_code: props.customer_code,
        warehouse_id: props.warehouse_id,
        user_id: props.user_id,
        incoming_package_id: props.incoming_tracking_number
    })
    const [images, setImages] = useState<File[]>([])
    const [previews,setPreviews] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const router = useRouter()

    

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        try{
            const res = await fetch("/api/packages", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                credentials: "include",
                body: JSON.stringify({...packageValues, inp_status: props.status})
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("Successfully Added package")
            router.push("/admin/shipments")
            
        }
        catch(err){
            toast.error("ERR adding package")
            console.error(err)
        }
        finally{
            setIsSubmitting(false)
        }
    }


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputComponent name="package_name" type="text" title="Package Name" state={packageValues} setState={setPackageValues} required readonly/>
        <InputComponent name="weight" type="number" title="Actual Weight of product" state={packageValues} setState={setPackageValues} required/>

        <InputComponent name="warehouse_id" type="text" title="Warehouse" state={packageValues} setState={setPackageValues} readonly required/>

        <InputComponent name="customer_code" type="text" title="Customer Code" state={packageValues} setState={setPackageValues} readonly required/>

        <InputComponent name="incoming_package_id" type="text" title="Incoming Package ID" state={packageValues} setState={setPackageValues} readonly required/>

        <InputComponent name="received_at" type="datetime-local" title="Date Received" state={packageValues} setState={setPackageValues} required/>

        <InputComponent name="stored_at" type="datetime-local" title="Date stored" state={packageValues} setState={setPackageValues} required/>





        <InputComponent 
        name="condition" 
        type="text" 
        title="Package Condition" 
        state={packageValues} 
        setState={setPackageValues}
        select
        selectValues={[{name: "Good", value: "good"} ,{name: "Damaged", value : "damaged"}]}
        required
        />


        <div className="flex gap-2">
            {previews.map( (x, i) => 
            <figure key={i} className="w-15 h-15 bg-accent-red rounded overflow-hidden relative">
                hey 
                <Image 
                    src={x}
                    alt=""
                    fill
                    />
                </figure>
        )}
        </div>
        {/* <button 
        type="button"
        onClick={handleImageUpload}
        >
            Submit
        </button> */}

        <div className="">
            <button className="flex items-center justify-center gap-1 bg-accent-blue px-4 py-3 rounded-lg mt-4 float-right text-white"
            disabled={isSubmitting}
            >
                {
                    isSubmitting ? 
                    <BeatLoader color="#FFF" size={15}/> :
                    <>
                        <IoCreate/>
                        <p className="text-xs font-bold">
                            Add
                        </p>
                    </>
                }
            </button>
        </div>
    </form>
  )
}

export default AddPackage