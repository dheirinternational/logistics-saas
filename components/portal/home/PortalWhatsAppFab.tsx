"use client"

import { useState } from "react"
import { IconBrandTelegram, IconBrandWhatsapp, IconX } from "@tabler/icons-react"

const TELEGRAM_CHINA = "https://t.me/+2348173216304" // Lucy - China Warehouse
const WHATSAPP_NIGERIA = "https://wa.link/68r8i8" // Grace - Nigeria Clearing

export function PortalWhatsAppFab() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 z-40 flex flex-col items-end">
      {open && (
        <div className="mb-3 flex flex-col gap-2 items-end">
          <a
            href={TELEGRAM_CHINA}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors"
          >
            <IconBrandTelegram size={18} stroke={1.5} />
            <span>Lucy (China Warehouse Support)</span>
          </a>
          <a
            href={WHATSAPP_NIGERIA}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
          >
            <IconBrandWhatsapp size={18} stroke={1.5} />
            <span>Grace (Nigeria Clearing and Delivery)</span>
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-transform hover:scale-105"
        aria-label="Customer Support"
      >
        {open ? (
          <IconX size={24} stroke={2} />
        ) : (
          <IconBrandWhatsapp size={28} stroke={1.5} />
        )}
      </button>
    </div>
  )
}
