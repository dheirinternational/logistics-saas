"use client"

import { Dispatch, FormEvent, SetStateAction, useState } from "react"
import InputComponent from "../shipments/InputComponent"

type FilterParams = {
    search: string, 
}

type Props = {
    filter: FilterParams,
    setFilter: Dispatch<SetStateAction<FilterParams>>
}


const SearchComponent = ({filter, setFilter} : Props) => {

    // ! Make the role text inputs checkboxes instead, and select one of the three types of users

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

  return (
    <form onSubmit={handleSubmit} className='p-body px-8 bg-light rounded-lg flex flex-col gap-4 w-1/2'>
        <InputComponent name="search" type="text" state={filter} setState={setFilter} placeHolder="Search Customer code, email"/>
        
    </form>
  )
}

export default SearchComponent