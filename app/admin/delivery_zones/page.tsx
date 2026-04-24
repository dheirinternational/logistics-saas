"use client"

import { Table } from "@/components/admin/table/Table"
import { createColumnHelper } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"

type Delivery_Locations = {id: number, state: string, price: number}

const columnHelper = createColumnHelper<Delivery_Locations>()

export default function Page(){

    const [isDataLoading, setIsDataLoading] = useState(false)
    const [deliveryLocations, setDeliveryLocations] = useState<Delivery_Locations[]>([])
    
    const fetchDeliveryLocations = async () => {
        setIsDataLoading(true)
        try{
            const res = await fetch("/api/delivery-zones", {
                method: "GET",
                credentials: "include"
            }) 
            const response = await res.json()

            if(!res.ok){
                toast.error(response.message)
                return
            }

            setDeliveryLocations(response.data)
            console.log(response.data)
        }
        catch(err){
            console.error("ERR:: Fetching Delivery Locations", err)
            toast.error("ERR:: Fetching Delivery Locations")
        }
        finally{
            setIsDataLoading(false)
        }
    }
    
    useEffect(() => {
        

        fetchDeliveryLocations()
    }, [])

    const columnDef = [
        columnHelper.accessor("state", {
            header: "State"
        }),
        columnHelper.accessor("price", {
            header: "Price",
            cell: ({getValue, row}) => {
                return <PriceCell {...{fetchDeliveryLocations, row}}/>
            }
        })

    ]


    return <div className="h-dvh p-body">
        <div className='p-4 bg-accent-red rounded-lg text-white'>
            <span className='text-xs opacity-80'>
                Admin/Operations
            </span>
            <h1 className='font-bold mt-4 mb-2 text-xl'>
                Manage Delivery Location and Pricing
            </h1>
            <div>
                <p className='text-[10px] opacity-70'>
                    Monitor, filter, and manage all Delivery Locations and pricing from one control deck.
                </p>
            </div>
        </div>
        
        <div className='bg-light p-body rounded-lg mt-4'>
            <h2 className='text-sm font-bold'>
                Packages 
            </h2>
            <p className='text-xs mt-2 opacity-70'>
                A record of all Delivery Zones in the system.
            </p>
            <div className='mt-4'>
                {isDataLoading ? (
                    <div className='flex justify-center items-center py-8'>
                        <BeatLoader color="#3B82F6" size={15} />
                        <span className='ml-2 text-sm'>Loading Delivery Locations ...</span>
                    </div>
                ) : (
                    <Table 
                        importedData={deliveryLocations}
                        columnDef={columnDef}
                        globalFilter=''
                    />
                )}
            </div>
        </div>
    </div>
}

function PriceCell({fetchDeliveryLocations, row}){

    const [value, setValue] = useState(0)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        setValue(row.original.price)
    }, [])

    // Edit Delivery_zone price
    const editDeliveryZonePrice = async (id: number, price: number) => {
        setIsEditing(true)
        try{

            const res = await fetch("/api/delivery-zones", {
                method: "PUT",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({id, price})
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return 
            }

            toast.success(result.message)
            fetchDeliveryLocations()

        }
        catch(err){
            toast.error("ERR:: Editing Delivery Zone Price")
            console.error("ERR:: Editing Delivery Zone Price", err)
        }
        finally{
            setIsEditing(false)
        }
    }

    return <div>
        ₦ <input 
            type="number" 
            value={value}
            onChange={(e) => {setValue(Number(e.currentTarget.value))}}
            onBlur={() => {setTimeout(() => setValue(row.original.price), 2000) }}
            className="outline-0 border-0 focus:border w-10 rounded  "
            />
        {
            value !== row.original.price &&
            <button 
            className=""
            onClick={() => {editDeliveryZonePrice(row.original.id, value)}}
            >
                {
                    isEditing ?
                    <BeatLoader color="blue" size={5}/> : 
                    "Edit"
                }
            </button>
        }
    </div>
}