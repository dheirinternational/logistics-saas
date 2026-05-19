"use client"

import InputComponent from "@/components/admin/shipments/InputComponent"
import { Address } from "@/types/entityTypeDef"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaChevronDown, FaChevronLeft, FaUser } from "react-icons/fa"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"



type AddressState = Omit<Address, 'id' | 'created_at' | 'user_id'>
type State = {
    id: number,
    name: string,
}


export default function MyAddressPage(){

    const [address, setAddress] = useState<AddressState>({
        country: "",
        state: "",
        city: "",
        street: "",
        postal_code: "",
    })
    const [states, setStates] = useState<State[]>([])

    const [isAddressExisting, setIsAddressExisting] = useState(false)
    const [isCountryDropDownActive, setIsCountryDropDownActice] = useState(false)
    const [isStateDropDownActive, setIsStateDropDownActive] = useState(false)
    
    const [isUploadingAddress, setIsUploadingAddress] = useState(false)
    const [isFetchingStates, setIsFetchingStates] = useState(false)
    const [isFetchingAddress, setIsFetchingAddress] = useState(true)

    
    
    
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
        finally{
            setIsUploadingAddress(false)
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


    const fetchStates = async() => {
        setIsFetchingStates(true)
        try{
            const res = await fetch(`/api/states`)
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }

            console.log(result.data)
            console.log(res)
            setStates(result.data)

        }
        catch(err: any){
            console.error("Error Fetching States", err)
            toast.error(err.message || "Error Fetching States")
        }
        finally{
            setIsFetchingStates(false)
        }
    }



    useEffect(() => {
        const fetchAddress = async() => {
            setIsFetchingAddress(true)
            try{
                const res = await fetch("/api/addresses/user")
                const data = await res.json()
                
                if(!res.ok){
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
            finally{
                setIsFetchingAddress(false)
            }
        }
        fetchAddress()
        fetchStates()
    }, [])

    const router = useRouter()

    return(
        <div className="h-full w-full ">
            
            {
                isFetchingStates || isFetchingAddress ? 
                <div className="h-full w-full flex items-center justify-center">
                    <BeatLoader color="#000" size={6}/>
                </div>
                :
                <>
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

                <div className="">
                    <div className="p-8 pt-5"> 
                        <p className="font-semibold">
                            Your Address For delivery
                        </p>


                        <div className="mt-8 flex flex-col gap-6 items-center">
                            
                            
                            {/* Country */}
                            <div>
                                <label className='w-full flex flex-col relative text-[10px] min-w-87.5'>
                                    <span className='text-dark/60'>
                                        Country
                                    </span>
                                    <input 
                                    type="text" 
                                    name="warehouse_id" 
                                    className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                                    value={address.country}
                                    onChange={(e) => setAddress({...address, country: e.target.value})}
                                    required
                                    readOnly
                                    />
        
                                    <div className="absolute right-1 bottom-2">
                                        <button
                                        className={`${isCountryDropDownActive && "rotate-180"} p-1`}
                                        onClick={() => {setIsCountryDropDownActice(!isCountryDropDownActive)}}
                                        type="button"
                                        
                                        >
                                            <FaChevronDown />
                                        </button>
                    
                                        <div className={`
                                            absolute right-0 top-10 p-3 w-40 rounded bg-light shadow z-1000 transition-set flex flex-col max-h-64 overflow-y-auto
                                            ${!isCountryDropDownActive && "opacity-0 pointer-events-none translate-y-6"}    
                                        `}>
                                            {
                                                ["Nigeria"].map( (country, i, arr) => 
                                                    {
                                                    return <button
                                                        key={country}
                                                        className={`
                                                            py-3 
                                                            ${country === address.country && "bg-dark text-white rounded"}
                                                            ${i !== arr.length - 1 && "border-b border-dark/8"}
                                                        `}
                                                        onClick={() => {
                                                            setAddress({...address, country})
                                                            setIsCountryDropDownActice(false)
                                                        }}
                                                        type="button"
                                                        >
                                                            {country}
                                                        </button>
                                                    }
                                                )
                                            }
                                        </div>
                                    </div>                            
                                </label>
                            </div>


                            {/* State */}
                            <div>
                                <label className='w-full flex flex-col relative text-[10px] min-w-87.5'>
                                    <span className='text-dark/60'>
                                        State
                                    </span>
                                    <input 
                                    type="text" 
                                    name="warehouse_id" 
                                    className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                                    value={address.state}
                                    onChange={(e) => setAddress({...address, state: e.target.value})}
                                    required
                                    readOnly
                                    />
        
                                    <div className="absolute right-1 bottom-2">
                                        <button
                                        className={`${isStateDropDownActive && "rotate-180"} p-1`}
                                        onClick={() => {setIsStateDropDownActive(!isStateDropDownActive)}}
                                        type="button"
                                        
                                        >
                                            <FaChevronDown />
                                        </button>
                    
                                        <div className={`
                                            absolute right-0 top-10 p-3 w-40 rounded bg-light shadow z-1000 transition-set flex flex-col max-h-64 overflow-y-auto
                                            ${!isStateDropDownActive && "opacity-0 pointer-events-none translate-y-6"}    
                                        `}>
                                            {
                                                states.map( (state, i, arr) => 
                                                    {
                                                    return <button
                                                        key={state.id}
                                                        className={`
                                                            py-3 
                                                            ${state.name === address.state && "bg-dark text-white rounded"}
                                                            ${i !== arr.length - 1 && "border-b border-dark/8"}
                                                        `}
                                                        onClick={() => {
                                                            setAddress({...address, state: state.name})
                                                            setIsStateDropDownActive(false)
                                                        }}
                                                        type="button"
                                                        >
                                                            {state.name}
                                                        </button>
                                                    }
                                                )
                                            }
                                        </div>
                                    </div>                            
                                </label>
                            </div>


                            {/* City */}
                            <div>
                                <label className='w-full flex flex-col relative text-[10px] min-w-87.5'>
                                    <span className='text-dark/60'>
                                        City
                                    </span>
                                    <input 
                                    type="text" 
                                    className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                                    value={address.city}
                                    onChange={(e) => setAddress({...address, city: e.target.value})}
                                    required
                                    /> 
                                </label>
                            </div>



                            {/* Street */}
                            <div>
                                <label className='w-full flex flex-col relative text-[10px] min-w-87.5'>
                                    <span className='text-dark/60'>
                                        Street
                                    </span>
                                    <input 
                                    type="text" 
                                    className='select-none cursor-default border-b border-dark/10 p-2 pl-2 outline-0 focus:border-dark transition-set pr-2'
                                    value={address.street}
                                    onChange={(e) => setAddress({...address, street: e.target.value})}
                                    required
                                    /> 
                                </label>
                            <div>

                        </div>

                    </div>

                    <div className="pb-10 p-4">
                        <button 
                        className="bg-accent-red text-white w-full py-2.5 rounded text-[10px] min-w-87.5"
                        onClick={isAddressExisting ? updateAddress : addAddress}
                        >
                            {isUploadingAddress ? <BeatLoader color="#fff" size={10}/> : isAddressExisting ? "Update Address" : "Add Address"}  
                        </button>
                    </div>
                </div>
                

                
                </div> 
            </div>
                </>
            } 
        </div>
    )
}