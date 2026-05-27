import { PortalShopPage } from "@/components/portal/shop/PortalShopPage"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Shop | DHEIR International",
  description: "Browse marketplace products and add them to your cart.",
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="portal-shop flex min-h-[40vh] items-center justify-center text-dheir-muted">
          Loading shop…
        </div>
      }
    >
      <PortalShopPage />
    </Suspense>
  )
}
