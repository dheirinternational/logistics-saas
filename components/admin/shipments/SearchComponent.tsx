"use client"

import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react"
import InputComponent from "./InputComponent"
import { Warehouse } from "@/types/entityTypeDef"
import { toast } from "@/lib/ui/toast"

type InputSafe = string | number

type Props<T extends Record<string, InputSafe>> = {
  state: T
  setState: Dispatch<SetStateAction<T>>
}

const SearchComponent = <T extends Record<string, InputSafe>>({
  state,
  setState,
}: Props<T>) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch("/api/warehouses", {
          method: "GET",
          credentials: "include",
        })

        const result = await res.json()

        if (!res.ok) {
          toast.error(result.message)
          return
        }

        setWarehouses(result.data ?? [])
      } catch (err) {
        console.error("Error Fetching Warehouses", err)
        toast.error("Error fetching warehouses")
      }
    }

    fetchWarehouses()
  }, [])

  const warehouseSelectValues = warehouses.map((w) => ({
    name: w.name,
    value: w.id.toString(),
  }))

  return (
    <form onSubmit={handleSubmit} className="admin-filters">
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
        select
        selectValues={[
          { name: "All statuses", value: "" },
          { name: "Expected", value: "expected" },
          { name: "Stored", value: "stored" },
        ]}
      />

      <InputComponent
        name="warehouse_id"
        title="Warehouse"
        type="text"
        state={state}
        setState={setState}
        select
        selectValues={[{ name: "All warehouses", value: "" }, ...warehouseSelectValues]}
      />
    </form>
  )
}

export default SearchComponent
