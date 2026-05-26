"use client"

import { Dispatch, SetStateAction } from "react"

type FilterParams = {
    search: string
}

type Props = {
    filter: FilterParams
    setFilter: Dispatch<SetStateAction<FilterParams>>
}

const SearchComponent = ({ filter, setFilter }: Props) => {
    return (
        <div className="admin-filters">
            <label className="portal-packages__field">
                <span className="portal-packages__field-label">Search</span>
                <input
                    type="text"
                    name="search"
                    className="dheir-input"
                    value={filter.search}
                    onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder="Search customer code or email"
                />
            </label>
        </div>
    )
}

export default SearchComponent
