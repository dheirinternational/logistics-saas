"use client"

import Link from "next/link"
import type { PortalDashboardCounts } from "@/lib/portal/dashboard"
import {
  IconPlus,
  IconInbox,
  IconBuildingWarehouse,
  IconPackages,
  IconArchive,
  IconPlaneDeparture,
  IconCreditCard,
  IconCircleCheck,
} from "@tabler/icons-react"
import type { TablerIcon } from "@tabler/icons-react"

type PortalWorkflowStatusGridProps = {
  counts: PortalDashboardCounts
}

type WorkflowItem = {
  id: string
  label: string
  href: string
  icon: TablerIcon
  count?: number
  iconColorClass: string
  iconBgClass: string
}

export function PortalWorkflowStatusGrid({ counts }: PortalWorkflowStatusGridProps) {
  const workflowItems: WorkflowItem[] = [
    {
      id: "add_package",
      label: "Pre-add Parcels",
      href: "/customer/add_package",
      icon: IconPlus,
      iconColorClass: "text-blue-600",
      iconBgClass: "bg-blue-50",
    },
    {
      id: "to_be_received",
      label: "To be received",
      href: "/customer/waiting_to_be_stored",
      icon: IconInbox,
      count: counts.waiting_to_be_stored,
      iconColorClass: "text-amber-600",
      iconBgClass: "bg-amber-50",
    },
    {
      id: "in_warehouse",
      label: "In warehouse",
      href: "/customer/packages",
      icon: IconBuildingWarehouse,
      count: counts.total_packages,
      iconColorClass: "text-indigo-600",
      iconBgClass: "bg-indigo-50",
    },
    {
      id: "request_mail",
      label: "Apply to pack",
      href: "/customer/request_mail",
      icon: IconPackages,
      count: counts.request_mail,
      iconColorClass: "text-emerald-600",
      iconBgClass: "bg-emerald-50",
    },
    {
      id: "under_packing",
      label: "Under Packing",
      href: "/customer/waiting_to_be_released",
      icon: IconArchive,
      iconColorClass: "text-orange-600",
      iconBgClass: "bg-orange-50",
    },
    {
      id: "orders_shipped",
      label: "Shipment Exported",
      href: "/customer/orders_shipped",
      icon: IconPlaneDeparture,
      count: counts.shipment,
      iconColorClass: "text-sky-600",
      iconBgClass: "bg-sky-50",
    },
    {
      id: "pending_payments",
      label: "Pending Payment",
      href: "/customer/pending_payments",
      icon: IconCreditCard,
      count: counts.pending_payments,
      iconColorClass: "text-rose-600",
      iconBgClass: "bg-rose-50",
    },
    {
      id: "delivered",
      label: "Signed",
      href: "/customer/orders_shipped?status=delivered",
      icon: IconCircleCheck,
      count: counts.delivered_shipments,
      iconColorClass: "text-teal-600",
      iconBgClass: "bg-teal-50",
    },
  ]

  return (
    <div className="bg-white rounded-2xl p-4 mb-4">
      <div className="grid grid-cols-4 gap-y-4 gap-x-2">
        {workflowItems.map((item) => {
          const Icon = item.icon
          const hasBadge = item.count !== undefined && item.count > 0

          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${item.iconBgClass} ${item.iconColorClass}`}
                >
                  <Icon size={24} stroke={1.75} />
                </div>
                {hasBadge && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.count! > 99 ? "99+" : item.count}
                  </span>
                )}
              </div>
              <span className="mt-2 text-[11px] font-medium text-slate-700 leading-tight line-clamp-2 px-0.5">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
