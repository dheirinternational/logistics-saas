"use client"

import { DHEIRSelect } from "@/components/ui/DHEIRSelect"
import { Dispatch, SetStateAction } from "react"

export type MarketplaceFilterValue = {
    search: string
    status: string
    category: string
}

type CategoryOption = {
    name: string
    value: string
}

type Props = {
    filter: MarketplaceFilterValue
    setFilter: Dispatch<SetStateAction<MarketplaceFilterValue>>
    categories: CategoryOption[]
}

const SearchComponent = ({ filter, setFilter, categories }: Props) => {
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
                    placeholder="Search product name"
                />
            </label>

            <label className="portal-packages__field">
                <span className="portal-packages__field-label">Status</span>
                <DHEIRSelect
                    name="status"
                    value={filter.status}
                    onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
                >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of stock</option>
                </DHEIRSelect>
            </label>

            <label className="portal-packages__field">
                <span className="portal-packages__field-label">Category</span>
                <DHEIRSelect
                    name="category"
                    value={filter.category}
                    onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}
                >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.name}
                        </option>
                    ))}
                </DHEIRSelect>
            </label>
        </div>
    )
}

export default SearchComponent
