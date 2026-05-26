"use client"

import { DheirSelect } from "@/components/ui/DheirSelect"
import { Dispatch, SetStateAction } from "react"

type InputSafe = string | number

type Props<T extends Record<string, InputSafe>> = {
    state: T
    setState: Dispatch<SetStateAction<T>>
}

const SearchComponent = <T extends Record<string, InputSafe>,>({ state, setState }: Props<T>) => {
    return (
        <div className="admin-filters">
            <label className="portal-packages__field">
                <span className="portal-packages__field-label">Search</span>
                <input
                    type="text"
                    name="search"
                    className="dheir-input"
                    value={String(state.search ?? "")}
                    onChange={(e) => setState((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder="Tracking Number, Customer Code, Package Name..."
                />
            </label>

            <label className="portal-packages__field">
                <span className="portal-packages__field-label">Status</span>
                <DheirSelect
                    name="status"
                    value={String(state.status ?? "")}
                    onChange={(e) => setState((prev) => ({ ...prev, status: e.target.value }))}
                >
                    <option value="">All statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </DheirSelect>
            </label>
        </div>
    )
}

export default SearchComponent