"use client"

import { Dispatch, FormEvent, SetStateAction, useEffect, useState} from "react"
import InputComponent from "./InputComponent"
import { Warehouse } from "@/types/entityTypeDef"
import { toast } from "react-toastify"

type InputSafe = string | number 

type Props<T extends Record<string, InputSafe>> = {
    state: T,
    setState: Dispatch<SetStateAction<T>>
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
        <InputComponent name="search" title="Search" type="text" state={state} setState={setState}/>
        {state.search}
        <InputComponent 
        name="status" 
        title="Status" 
        type="text" 
        state={state} 
        setState={setState}
        readonly
        select
        selectValues={[{name: "Expected", value: "expected"}, {name: "Received", value: "received"}]}
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
        
        {/* Btns */}
        <div className="space-x-2 mt-5">
            <button className="text-xs px-5 py-2 bg-accent-blue rounded-lg text-white">
                Apply
            </button>

            <button
            type="button"
            className="text-xs px-5 py-2 border border-dark/30 rounded-lg"
            >
                Reset
            </button>
        </div>
    </form>
  )
}

export default SearchComponent