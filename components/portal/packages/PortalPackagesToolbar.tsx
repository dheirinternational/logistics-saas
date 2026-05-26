"use client"

import { DheirSelect } from "@/components/ui/DheirSelect"
import { IconSearch } from "@tabler/icons-react"

type PortalPackagesToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  statusOptions: readonly { value: string; label: string }[]
  searchPlaceholder?: string
}

export function PortalPackagesToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statusOptions,
  searchPlaceholder = "Search tracking or package name…",
}: PortalPackagesToolbarProps) {
  return (
    <div className="portal-packages__toolbar">
      <div className="portal-packages__search">
        <IconSearch size={18} stroke={1.5} className="portal-packages__search-icon" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="portal-packages__search-input"
        />
      </div>
      <label className="portal-packages__filter-select">
        <span className="sr-only">Filter by status</span>
        <DheirSelect
          compact
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </DheirSelect>
      </label>
    </div>
  )
}
