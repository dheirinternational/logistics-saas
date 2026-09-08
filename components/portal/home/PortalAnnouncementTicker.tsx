"use client"

import Link from "next/link"
import { IconSpeakerphone, IconChevronRight } from "@tabler/icons-react"

export function PortalAnnouncementTicker() {
  return (
    <Link
      href="/customer/announcements"
      className="flex items-center gap-2.5 p-3 mb-4 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100/80 transition-colors"
    >
      <div className="w-6 h-6 rounded-lg bg-amber-200/80 flex items-center justify-center shrink-0 text-amber-800">
        <IconSpeakerphone size={14} stroke={2} />
      </div>
      <p className="text-xs font-medium truncate flex-1 leading-snug">
        <strong className="font-semibold mr-1">Flight Notice:</strong>
        Direct air cargo departs Guangzhou every Tuesday &amp; Friday. HK Express Air Cargo departs daily.
      </p>
      <IconChevronRight size={14} className="shrink-0 text-amber-600" />
    </Link>
  )
}
