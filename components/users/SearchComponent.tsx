"use client"

import { FormEvent, useState } from "react"
import InputComponent from "../shipments/InputComponent"

export type FilterParams = {
    search: string, 
    role: string, 
}


const SearchComponent = () => {

    // ! Make the role text inputs checkboxes instead, and select one of the three types of users

    const [filterParams, setFilterParams] = useState<FilterParams>({search: "", role: ""})

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

  return (
    <form onSubmit={handleSubmit} className='p-body px-8 bg-light rounded-lg flex flex-col gap-4'>
        <InputComponent name="search" title="Search" type="text" state={filterParams} setState={setFilterParams}/>
        {filterParams.search}
        <InputComponent name="role" title="Role" type="text" state={filterParams} setState={setFilterParams}/>
        
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