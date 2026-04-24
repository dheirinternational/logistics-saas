"use client"

import { useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"


export default function Page(){

    const [shippingMethods, setShippingMethods] = useState<{id: number, name: string, price: number}[]>([])
    const [wrappingMethods, setWrappingMethods] = useState<{id: number, name: string, price: number}[]>([])
    const [itemPricinigMethods, setItemPricingMethods] = useState<{id: number, name: string, price_per_kg: number}[]>([])
    const [otherPricingMethods, setOtherPricingMethods] = useState<{id: number, name: string, price: number}[]>([])

    const [isShipmentMethodLoading, setIsShipmentMethodLoading] = useState(true)
    const [isWrappingMethodLoading, setIsWrappingMethodLoading] = useState(true)
    const [isItemPricingMethodLoading, setIsItemPricingMethodLoading] = useState(true)
    const [isOtherPricingMethodLoading, setIsOtherPricingMethodLoading] = useState(true)


    const fetchShippingMethods = async () => {
        setIsShipmentMethodLoading(true)
        try{
            const res = await fetch("/api/pricing_methods/shipping")
            const result = await res.json()
            
            if(!res.ok){
                toast.error(result.message)
                return
            }

            setShippingMethods(result.data)
        }
        catch(err){
            toast.error("ERR:: Fetching Shipment Method Pricing Data from Database")
            console.error("ERR:: Fetching Shipment Method Pricing Data from Database", err)
        }
        finally{
            setIsShipmentMethodLoading(false)
        }
    } 

    const fetchWrappingMethods = async () => {
        setIsWrappingMethodLoading(true)
        try{
            const res = await fetch("/api/pricing_methods/wrapping")
            const result = await res.json()
            
            if(!res.ok){
                toast.error(result.message)
                return
            }

            setWrappingMethods(result.data)
        }
        catch(err){
            toast.error("ERR:: Fetching Wrapping Method Pricing Data from Database")
            console.error("ERR:: Fetching Wrapping Method Pricing Data from Database", err)
        }
        finally{
            setIsWrappingMethodLoading(false)
        }
    }

    const fetchItemPricingMethods = async () => {
        setIsItemPricingMethodLoading(true)
        try{
            const res = await fetch("/api/pricing_methods/item-pricing")
            const result = await res.json()
            
            if(!res.ok){
                toast.error(result.message)
                return
            }

            setItemPricingMethods(result.data)
        }
        catch(err){
            toast.error("ERR:: Fetching Item Pricing Method Pricing Data from Database")
            console.error("ERR:: Fetching Item Pricing Method Pricing Data from Database", err)
        }
        finally{
            setIsItemPricingMethodLoading(false)
        }
    }

    const fetchOtherPricingMethods = async () => {
        setIsOtherPricingMethodLoading(true)
        try{
            const res = await fetch("/api/pricing_methods/others")
            const result = await res.json()
            
            if(!res.ok){
                toast.error(result.message)
                return
            }

            setOtherPricingMethods(result.data)
        }
        catch(err){
            toast.error("ERR:: Fetching Other Pricing Method Pricing Data from Database")
            console.error("ERR:: Fetching Other Pricing Method Pricing Data from Database", err)
        }
        finally{
            setIsOtherPricingMethodLoading(false)
        }
    }


    useEffect(() => {
        fetchShippingMethods()
        fetchWrappingMethods()
        fetchItemPricingMethods()
        fetchOtherPricingMethods()
    }, [])


    return <div className="h-dvh p-body">
        <div className='p-4 bg-accent-red rounded-lg text-white'>
            <span className='text-xs opacity-80'>
                Admin/Operations
            </span>
            <h1 className='font-bold mt-4 mb-2 text-xl'>
                Manage Pricing List
            </h1>
            <div>
                <p className='text-[10px] opacity-70'>
                    Monitor, filter, and manage all Pricing List from one control deck.
                </p>
            </div>
        </div>

        <div className="mt-4 bg-white shadow shadow-dark/10 rounded p-4     ">
            <div className="mt-4 text-xs">
                <h2 className="font-bold">
                    Shipping Method
                </h2>

                <ol className="list-decimal pl-6 mt-4 space-y-2">
                    {
                        isShipmentMethodLoading ? 
                        <BeatLoader color="orange" size={10}/> :
                        <>
                            {
                            shippingMethods.map( (method, i) =>  {
                                return <PriceList key={i} index={i} method={method} fetchPricingList={fetchShippingMethods} type="shipping"/>
                            }
                            )
                            }
                        </>
                    }
                </ol>
            </div>

            <div className="mt-4 text-xs">
                <h2 className="font-bold">
                    Wrapping Method
                </h2>

                <ol className="list-decimal pl-6 mt-4 space-y-2">
                    {
                        isWrappingMethodLoading ? 
                        <BeatLoader color="orange" size={10}/> :
                        <>
                            {
                            wrappingMethods.filter(x => x.name !== "Gift Wrap").map( (method, i) =>  {
                                return <PriceList key={i} index={i} method={method} fetchPricingList={fetchWrappingMethods  } type="wrapping"/>
                            }
                            )
                            }
                        </>
                    }
                </ol>
            </div>


            <div className="mt-4 text-xs">
                <h2 className="font-bold">
                    Item Pricing Method
                </h2>

                <ol className="list-decimal pl-6 mt-4 space-y-2">
                    {
                        isItemPricingMethodLoading ? 
                        <BeatLoader color="orange" size={10}/> :
                        <>
                            {
                            itemPricinigMethods
                                .map( (method, i) =>  {
                                return <PriceList key={i} index={i} method={method} fetchPricingList={fetchItemPricingMethods} type="item-pricing"/>
                                // .filter(x => {
                                //     /* x.name === "Gift Wrap"*/
                                //     return true
                                // })
                            }
                            )
                            }
                        </>
                    }
                </ol>
            </div>

            <div className="mt-4 text-xs">
                <h2 className="font-bold">
                    Other Pricing Methods
                </h2>

                <ol className="list-decimal pl-6 mt-4 space-y-2">
                    {
                        isOtherPricingMethodLoading ? 
                        <BeatLoader color="orange" size={10}/> :
                        <>
                            {
                            otherPricingMethods
                                .map( (method, i) =>  {
                                return <PriceList key={i} index={i} method={method} fetchPricingList={fetchOtherPricingMethods} type="others"/>
                            }
                            )
                            }
                        </>
                    }
                </ol>
            </div>
        </div>
        
    </div>
}




const PriceList = (
    {index, method, fetchPricingList, type}: 
    {index: number, method: { id: number; name: string; price?: number; price_per_kg?: number; }, fetchPricingList: () => void, type: "shipping" | "wrapping" | "item-pricing" | "others"
}
) => {

    const [value, setValue] = useState(method.price ?? method.price_per_kg)
    const [isEditingData, setIsEditingData] = useState(false) 

    const price = method.price ?? method.price_per_kg

    // console.log(index)

    const editPricingMethod = async (id, price) => {
        setIsEditingData(true)

        try{
            const res = await fetch(`/api/pricing_methods/${type}`, {
                method: "PUT",
                headers: {
                    "Content-Type" : "application/json"
                },
                credentials: "include",
                body: JSON.stringify({id, price})
            })

            const result = await res.json()
            
            if (!res.ok){
                toast.error(result.message)
                return
            }

            toast.success("Successfully updated selected pricing list")
            fetchPricingList()
        }
        catch(err){
            toast.error("ERR:: Updating selected pricing list")
            console.error("ERR:: Updating selected pricing list", err)
        }
        finally{
            setIsEditingData(false)
        }
    }

    return <li 
    className="list-decimal flex gap-4"
    >
        <div className="flex">
            <p className="w-26">
                {index + 1}.  {method.name}
            </p>
            <div className="space-x-1">
                <span>
                    ₦
                </span>
                <input 
                type="number" 
                value={value}
                onChange={(e) => {setValue(Number(e.currentTarget.value))}}
                onBlur={() => {setTimeout(() => setValue(method.price), 2000) }}
                className="outline-0 border-0 focus:border rounded  w-30 ml-1"
                />
            </div>
        </div>
        {
            value !== price &&
            <button 
            className="underline"
            disabled={isEditingData}
            onClick={ () => editPricingMethod(method.id, value)}
            >
                {
                    isEditingData ? 
                    <BeatLoader size={10} color="blue"/> :  
                    "Edit"
                }
            </button>
        }
    </li>
}


