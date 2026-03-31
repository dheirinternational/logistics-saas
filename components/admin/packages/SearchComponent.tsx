"use client"

import { FormEvent, useState } from "react"
import InputComponent from "../shipments/InputComponent"

type FilterParams = {
    search: string, 
    status: string, 
    warehouse: string,
}


const SearchComponent = () => {

    const [filterParams, setFilterParams] = useState<FilterParams>({search: "", status: "", warehouse: ""})

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

  return (
    <form onSubmit={handleSubmit} className='p-body px-8 bg-light rounded-lg flex flex-col gap-4'>
        <InputComponent name="search" title="Search" type="text" state={filterParams} setState={setFilterParams}/>
        {filterParams.search}
        <InputComponent name="status" title="Status" type="text" state={filterParams} setState={setFilterParams}/>
        <InputComponent name="warehouse" title="Warehouse" type="text" state={filterParams} setState={setFilterParams}/>
        
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