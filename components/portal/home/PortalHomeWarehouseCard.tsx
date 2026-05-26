"use client"

import { IconCopy } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "@/lib/ui/toast"

type PortalHomeWarehouseCardProps = {
  warehouseName: string
  copyText: string
}

export function PortalHomeWarehouseCard({
  warehouseName,
  copyText,
}: PortalHomeWarehouseCardProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2500)
    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      toast.success("Warehouse address copied")
    } catch {
      toast.error("Could not copy address")
    }
  }

  return (
    <section className="portal-home__warehouse-card">
      <div className="portal-home__warehouse-head">
        <div>
          <p className="portal-home__section-label">China warehouse</p>
          <h2 className="portal-home__warehouse-title">{warehouseName}</h2>
          <p className="portal-home__warehouse-hint">
            Send this to your supplier so we can receive your goods.
          </p>
        </div>
        <button
          type="button"
          className="portal-home__btn portal-home__btn--primary"
          onClick={handleCopy}
        >
          <IconCopy size={18} stroke={1.5} aria-hidden />
          {copied ? "Copied" : "Copy address"}
        </button>
      </div>
      <p className="portal-home__warehouse-preview">{copyText}</p>
      <Link href="/base/warehouse_address" className="portal-home__text-link">
        View full warehouse details
      </Link>
    </section>
  )
}
