import type { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Payment confirmations",
}

export default function AdminPaymentsLayout({ children }: { children: ReactNode }) {
  return children
}
