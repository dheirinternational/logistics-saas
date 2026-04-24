"use client"

import InputComponent from "@/components/admin/shipments/InputComponent"
import { Address } from "@/types/entityTypeDef"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaChevronLeft, FaUser } from "react-icons/fa"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"


export default function MyAddressPage(){

    type AddressState = Omit<Address, 'id' | 'created_at' | 'user_id'>
    const [address, setAddress] = useState<AddressState>({
        country: "",
        state: "",
        city: "",
        street: "",
        postal_code: "",
    })
    const [isAddressExisting, setIsAddressExisting] = useState(false)
    const [isUploadingAddress, setIsUploadingAddress] = useState(false)

    const addAddress = async() => {
        setIsUploadingAddress(true)
        try{
            const res = await fetch("/api/addresses", {
                method: "POST",
                headers: {              
                     "Content-Type": "application/json"
                },
                body: JSON.stringify(address)
            })
            const data = await res.json()
            
            if(!res.ok){
                toast.error(data.message)
                return
            }   
            
            if (data.success){
                toast.success(data.message)
                router.push("/base/profile")
            }
            else{
                toast.error(data.message)
            }
        }
        catch(err){
            console.error("Error Adding Address", err)
            toast.error("Error Adding Address")
        }   
    }

    const updateAddress = async() => {
        if (!address) {
            toast.error("No address to update")
            return
        }
        setIsUploadingAddress(true)
        try{
            const res = await fetch("/api/addresses/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify(address)
            })

            const data = await res.json()
            if(!res.ok){
                toast.error(data.message)
                return
            }

            toast.success(data.message)

        }catch(err){
            console.error("Error Updating Address", err)
            toast.error("Error Updating Address")
        }
        finally{
            setIsUploadingAddress(false)
        }
    }

    useEffect(() => {
        const fetchAddress = async() => {
        
            try{
                const res = await fetch("/api/addresses/user")
                const data = await res.json()
                
                if(!res.ok){
                    toast.error(data.message)
                    return
                }

                if (data.success && data.data.length > 0) {
                    setAddress(data.data[0])
                    setIsAddressExisting(true)
                } else {
                    setIsAddressExisting(false)
                }

                
            }
            catch(err){
                console.error("Error Fetching Address", err)
                toast.error("Error Fetching Address")
            }
        }
        fetchAddress()
    }, [])

    const router = useRouter()

    return(
        <div className="h-full w-full space-y-2">
            <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
                <button 
                className='flex gap-2 flex-1 justify-start'
                onClick={() => {router.back()}}
                >
                    <FaChevronLeft />
                    <span className='text-xs font-semibold'>
                        Go Back
                    </span>
                </button>
                <h1 className='font-semibold text-sm'>
                    My Address
                </h1>
                <Link href={"/base/profile"} className='flex-1 flex justify-end'>
                    <FaUser/>
                </Link>
            </div>

            <div className="md:max-w-125 md:mx-auto">
                <div className="p-4 space-y-3 bg-light">
                    <InputComponent
                    title="Country"
                    name="country"
                    type="text"
                    state={address}
                    setState={setAddress}
                    />
                    <InputComponent
                    title="State"
                    name="state"
                    type="text"
                    state={address}
                    setState={setAddress}
                    />
                    <InputComponent
                    title="City"
                    name="city"
                    type="text"
                    state={address}
                    setState={setAddress}
                    />
                    <InputComponent
                    title="Street"
                    name="street"
                    type="text"
                    state={address}
                    setState={setAddress}
                    />
                    <InputComponent
                    title="Postal Code"
                    name="postal_code"
                    type="text"
                    state={address}
                    setState={setAddress}
                    />
                </div>

                <div className="pb-10 p-4">
                    <button 
                    className="bg-accent-red text-white w-full py-4 rounded text-xs"
                    onClick={isAddressExisting ? updateAddress : addAddress}
                    >
                        {isUploadingAddress ? <BeatLoader color="#fff" size={10}/> : isAddressExisting ? "Update Address" : "Add Address"}  
                    </button>
                </div>
            </div>
            
        </div>
    )
}