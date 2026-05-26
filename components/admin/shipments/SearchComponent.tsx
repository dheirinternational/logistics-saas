"use client"

import { Dispatch, FormEvent, SetStateAction, useEffect, useState} from "react"
import InputComponent from "./InputComponent"
import { Warehouse } from "@/types/entityTypeDef"
import { toast } from "@/lib/ui/toast"

type InputSafe = string | number 

type Props<T extends Record<string, InputSafe>> = {
    state: T,
    setState: Dispatch<SetStateAction<T>>,
    globalFilter?: string
    onGlobalFilterChange?: (value: string) => void;
}


const SearchComponent = <T extends Record<string, InputSafe>,>({state, setState}: Props<T>) => {

    const [warehouses, setWareHouses] = useState<Warehouse[]>([])

    
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }


    useEffect(() => {
    const fetchWarehouses = async () => {
        try {
            const res = await fetch("/api/warehouses", {
                method: "GET",
                credentials: "include"
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.message)
                return
            }

            setWareHouses(result.data)

            const firstWarehouseId = result.data?.[0]?.id

            if (firstWarehouseId) {
                setState(prev => ({
                    ...prev,
                    warehouses: firstWarehouseId
                }))
            }

        } catch (err) {
                console.error("Error Fetching Warehouses", err)
                toast.error("Error fetching warehouses")
            }
        }

        fetchWarehouses()
    }, [])


    
    const warehouseSelectValues = warehouses.map( x => ({
        name: x.name, value: x.id.toString()
    }))

  return (
    <form
      onSubmit={handleSubmit}
      className="admin-filters"
    >


        <InputComponent 
        name="search" 
        title="Search" 
        type="text" 
        state={state} 
        setState={setState}
        placeHolder="Search tracking number or customer code…"        
        />

        <InputComponent 
        name="status" 
        title="Status" 
        type="text" 
        state={state} 
        setState={setState}
        readonly
        select
        overshadow
        selectValues={[{name: "-- none --", value: "" }, { name: "Expected", value: "expected"}, {name: "Stored", value: "stored"}]}
        placeHolder="select shipment status"
        />

        <InputComponent 
        name="warehouse_id" 
        title="Warehouse" 
        type="text" 
        state={state} 
        setState={setState}
        readonly
        select
        selectValues={[{name: "-- none --", value: ""}, ...warehouseSelectValues]}
        overshadow
        placeHolder="select shipment warehouse..."
        />
        
    </form>
  )
}

export default SearchComponent