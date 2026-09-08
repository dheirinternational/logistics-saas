"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { PortalDashboardShipment } from "@/lib/portal/dashboard"
import { IconSearch, IconTruckDelivery, IconPlane, IconArrowRight, IconPackage } from "@tabler/icons-react"

type PortalHomeTrackingSnippetProps = {
  shipments: PortalDashboardShipment[]
}

export function PortalHomeTrackingSnippet({ shipments }: PortalHomeTrackingSnippetProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const activeShipment = shipments && shipments.length > 0 ? shipments[0] : null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/customer#tracking?num=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <IconTruckDelivery size={18} stroke={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Active Tracking</h3>
            <p className="text-[11px] text-slate-400">Real-time status updates from origin to doorstep</p>
          </div>
        </div>
        <Link
          href="/customer#tracking"
          className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0"
        >
          Track all
          <IconArrowRight size={14} stroke={1.5} />
        </Link>
      </div>

      {activeShipment ? (
        <div className="bg-slate-800/80 rounded-xl p-3.5 mt-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-mono font-medium text-blue-300">
              {activeShipment.trackingNumber}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300">
              {activeShipment.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5">
              <IconPlane size={14} className="text-slate-400" />
              <span>{activeShipment.originLabel || "China Warehouse"}</span>
              <span className="text-slate-500">to</span>
              <span>{activeShipment.destinationLabel || "Nigeria Warehouse"}</span>
            </div>
            {activeShipment.totalWeight > 0 && (
              <span className="text-slate-400 font-medium">
                {activeShipment.totalWeight} {activeShipment.totalWeightUnit || "kg"}
              </span>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSearch} className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <IconPackage
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter tracking number..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
          >
            <IconSearch size={14} stroke={2} />
            <span>Track</span>
          </button>
        </form>
      )}
    </div>
  )
}
