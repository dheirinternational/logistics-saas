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
        placeHolder="Customer code…"
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
          { name: "Pending", value: "pending" },
          { name: "Accepted", value: "accepted" },
        ]}
      />
    </form>
  )
}

export default SearchComponent
