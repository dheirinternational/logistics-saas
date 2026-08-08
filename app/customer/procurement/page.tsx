import { PortalProcurementHub } from "@/components/portal/procurement/PortalProcurementHub"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Procurement & Sourcing | DHEIR International",
  description: "Buy directly from 1688, Taobao, and Alibaba, source custom products, and audit Chinese factories.",
}

export default function CustomerProcurementPage() {
  return <PortalProcurementHub />
}
