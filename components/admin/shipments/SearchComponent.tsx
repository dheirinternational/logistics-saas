"use client"

import { Dispatch, FormEvent, SetStateAction, useEffect, useState} from "react"
import InputComponent from "./InputComponent"
import { Warehouse } from "@/types/entityTypeDef"
import { toast } from "react-toastify"

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
            try{
                const res = await fetch("/api/warehouses", {
                    method: "GET",
                    credentials: "include"
                })

                const result = await res.json()
                if(!res.ok){
                    toast.error(result.message)
                    return
                }

                setWareHouses(result.data)
                setState( prev => ({...prev, ["warehouses"]: result.data[0].id}))
                
            }
            catch(err){
                console.error("Error Fetching Warehouses", err)
                toast.error("Error fetching warehouses")
            }
        }

        fetchWarehouses()
    }, [])


  return (
    <form onSubmit={handleSubmit} className='p-body px-8 bg-light rounded-lg flex flex-col gap-4'>


        <InputComponent 
        name="search" 
        title="Search" 
        type="text" 
        state={state} 
        setState={setState}
        placeHolder="Seacrch Tracking Number, Customer Code..."        
        />

        <InputComponent 
        name="status" 
        title="Status" 
        type="text" 
        state={state} 
        setState={setState}
        readonly
        select
        selectValues={[{name: "Expected", value: "expected"}, {name: "Stored", value: "stored"}]}
        />

        <InputComponent 
        name="warehouse" 
        title="Warehouse" 
        type="number" 
        state={state} 
        setState={setState}
        readonly
        select
        selectValues={warehouses.map( x => ({
            name: x.name, value: x.id
        }))}
        overshadow
        />
        
    </form>
  )
}

export default SearchComponent