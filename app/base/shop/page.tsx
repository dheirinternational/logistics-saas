import { PortalShopPage } from "@/components/portal/shop/PortalShopPage"
import { Suspense } from "react"

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
