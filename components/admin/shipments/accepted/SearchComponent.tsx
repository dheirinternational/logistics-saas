"use client"

import { Dispatch, FormEvent, SetStateAction } from "react"
import InputComponent from "../InputComponent"

type InputSafe = string | number

type Props<T extends Record<string, InputSafe>> = {
  state: T
  setState: Dispatch<SetStateAction<T>>
}

const SearchComponent = <T extends Record<string, InputSafe>>({
  state,
  setState,
}: Props<T>) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className="admin-filters">
      <InputComponent
        name="search"
        title="Search"
        type="text"
        state={state}
        setState={setState}
        placeHolder="Tracking number or customer code…"
      />

      <InputComponent
        name="status"
        title="Status"
        type="text"
        state={state}
        setState={setState}
        select
        selectValues={[
          { name: "All statuses", value: "" },
          { name: "Processing", value: "processing" },
          { name: "Shipped", value: "shipped" },
          { name: "In Transit", value: "in_transit" },
          { name: "Arrived", value: "arrived" },
          { name: "Out for delivery", value: "out_for_delivery" },
          { name: "Delivered", value: "delivered" },
        ]}
      />
    </form>
  )
}

export default SearchComponent
