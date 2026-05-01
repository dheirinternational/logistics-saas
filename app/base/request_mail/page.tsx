"use client"

import InputComponent from '@/components/admin/shipments/InputComponent'
import RequestMailProduct from '@/components/base/RequestMailProduct'
import { Package } from '@/types/entityTypeDef'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

const Page: NextPage = () => {


    const [packages, setPackages] = useState<Package[]>([])
    const [selectedPackages, setSelectedPackages] = useState<Package[]>([])
    const [isDataLoading, setIsDataLoading] = useState(false)
    const [isPostingData, setIsPostingData] = useState(false)
    const [isConfirmModal, setIsConfirmModal] = useState(false)
    const [shippingMethod, setShippingMethod] = useState<"air" | "sea" | "express">("air")
    const [shippingPayment, setShippingPayment] = useState<"pay_before_shipment" | "pay_after_shipment">("pay_before_shipment")

    const [filterValues, setFilterValues] = useState({
        warehouse_id: "",
        tracking_id: "" 
    })

    const router = useRouter()

  

    const fetchPackages = async () => {
        setIsDataLoading(true)
        try{
            const res = await fetch("/api/packages/user")
            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
                return
            }

            setPackages(result.data)
        }
        catch(err){
            console.error("ERR Fetching packages", err)
            toast.error("ERR fetchng packages")
            return
        }
        finally{
            setIsDataLoading(false)
        }
    }


    const handleSubmit = async () => {
        setIsPostingData(true)
        try{
            const res = await fetch("/api/shipment-requests", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    package_ids: selectedPackages.map( x => x.id ),
                    user_id: selectedPackages[0].user_id,
                    customer_code: selectedPackages[0].customer_code,
                    channel: shippingMethod,
                    payment_time: shippingPayment,
                    total_weight: selectedPackages.reduce((acc, pack) => acc + pack.weight, 0)
                })
            })
            const result = await res.json()

            if (!res.ok){
                toast.error(result.message)
                return
            }

            fetchPackages()
            toast.success("Shipment Request Successfully made")
        }
        catch(err){ 
            toast.error("ERR:: making shipment request");
            console.error("ERR:: making shipment request", err)
        }
        finally{
            setIsPostingData(false)
            setIsConfirmModal(false)
        }
    }



    // Fetch Packages
    useEffect(() => {
   
        fetchPackages()
        
    }, [])

    const data = packages
        .filter( x => x.incoming_package_id.toLowerCase().includes(filterValues.tracking_id.toLowerCase()) || x.package_name.toLowerCase().includes(filterValues.tracking_id.toLowerCase()))
        .filter(x => x.status === "stored")

  return <div className='h-full w-full space-y-2'>
    {/* Header */}
    <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
        <button 
        className='flex flex-1 justify-start w-fit gap-1'
        onClick={() => {router.back()}}
        >
            <span className='text-xs font-semibold'>
                Go Back
            </span>
        </button>
        <h1 className='font-semibold'>
            Request Mail
        </h1>
        <Link href={"/base/profile"} className='flex-1 flex justify-end'>
            <FaUser/>
        </Link>
    </div>


    {/* Search Component */}
    <div className='bg-white p-4 flex flex-col gap-2 md:max-w-150 md:mx-auto'> 
        <div className='w-40 -mt-2'>

        </div>
        <div className='flex items-center text-xs gap-1'>
            <InputComponent
            name='tracking_id'
            type='text'
            state={filterValues}
            setState={setFilterValues}
            placeHolder='Tracking Id, package name...'
            />
            <button className='h-full px-4 py-2 bg-accent-red text-white rounded'>
                Search
            </button>
        </div>
    </div>


    {/* Input Fields */}
    <div className='bg-light px-4 py-2 md:max-w-150 md:mx-auto'>
        <span className='text-xs'>
            Selected Packages: <span className='text-accent-red font-bold text-sm'>{selectedPackages.length}</span> 
        </span>
        
        {/* Shipping method */}
        <fieldset className='text-xs flex gap-4 mt-2'>
            <span>Shipping Method :</span>
            <label className='flex items-center gap-2'>
                <span>Air</span>
                <input 
                type="radio" 
                name='shipping'
                value={"air"}
                checked={shippingMethod === "air"}
                onChange={(e) => setShippingMethod(e.target.value as "air")}
                />
            </label>
            <label className='flex items-center gap-2'>
                <span>Sea</span>
                <input 
                type="radio" 
                name='shipping'
                value={"sea"}
                checked={shippingMethod === "sea"}
                onChange={(e) => setShippingMethod(e.target.value as "sea")}
                />
            </label>
            <label className='flex items-center gap-2'>
                <span>Express</span>
                <input 
                type="radio" 
                name='shipping'
                value={"express"}
                checked={shippingMethod === "express"}
                onChange={(e) => setShippingMethod(e.target.value as "express")}
                />
            </label>
            
        </fieldset>

        {/* Payment Type */}
        <fieldset className='text-xs flex gap-2 mt-2'>
            <span className='whitespace-nowrap'>Payment Time:</span>
            <label className='flex items-center gap-2'>
                <span className='whitespace-nowrap'>Pay Before Shipment</span>
                <input 
                type="radio" 
                name='payment_time'
                value={"pay_before_shipment"}
                checked={shippingPayment === "pay_before_shipment"}
                onChange={(e) => setShippingPayment(e.target.value as "pay_before_shipment")}
                />
            </label>
            <label className='flex items-center gap-2'>
                <span className='whitespace-nowrap'>Pay After Shipment</span>
                <input 
                type="radio" 
                name='payment_time'
                value={"pay_after_shipment"}
                checked={shippingPayment === "pay_after_shipment"}
                onChange={(e) => setShippingPayment(e.target.value as "pay_after_shipment")}
                />
            </label>
        </fieldset>
    </div>

    <div className='bg-light p-4 min-h-68 h-68 max-h-68 space-y-2 overflow-y-scroll md:max-w-150 md:mx-auto'>
        {
            data.length < 1 && 
            <p className='text-xs italic'>
                ...No package available for request mail. Be sure to have at least one package with status {"stored"} to be able to make a shipment request.
            </p>
        }
        {
            !isDataLoading ?
            data
                // .filter( pack => pack.status === "stored" )
                .map( packag => 
                    <RequestMailProduct key={packag.id} prop={packag} handlePackage={setSelectedPackages}/>   
                ) :
                <div className='w-full h-full center-items'>
                    <BeatLoader color='#f26430' size={15}/>
                </div>
        }
    </div>

    <div className='p-body pb-20 md:max-w-158 md:mx-auto'>
        <button 
        className='bg-accent-red text-white w-full text-sm py-3 rounded'
        onClick={() => {
           if ( selectedPackages.length > 0){
                setIsConfirmModal(true)
            } else{
                toast.error("Select package")
            }
        }}
        >
            Request Shipment
        </button>
    </div>

    {
        isConfirmModal &&
        <div className='w-screen h-dvh fixed top-0 right-0 center-items bg-accent-blue/20'>
            <div className=' w-[90%] max-w-125 h-70 bg-light border border-dark/10 shadow shadow-dark rounded p-4 text-[10px] flex flex-col justify-between'>
                <div>
                    <hr className='border-dark/10 '/>
                    <p className='mt-4'>
                        Dear Customer, the following is a reminder to confirm the content of the item being mailed, be sure to comfirm it carefully!
                    </p>
                    <p className='mt-4'>
                        Mail Item confirmation <span className='text-accent-red'>( the following three ) :</span>
                    </p>
                    <ol>
                        
                    </ol>
                </div>

                <div className='flex justify-end space-x-2'>
                    <button 
                    className='px-3 py-2 border border-dark/10 rounded'
                    onClick={() => setIsConfirmModal(false)}
                    disabled={isPostingData}
                    >
                        Go back
                    </button>
                    <button className='px-3 py-2 text-white bg-accent-blue rounded'
                    onClick={handleSubmit}
                    disabled={isPostingData}
                    >
                        {
                            isPostingData ?
                            <BeatLoader color='#FFF' size={10}/> : "Confirm Submit"
                        }
                    </button>
                </div>
            </div>
        </div>
    }
  </div>
}

export default Page