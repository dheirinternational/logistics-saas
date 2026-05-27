import { PortalPackagesHub } from "@/components/portal/packages/PortalPackagesHub"
import { Suspense } from "react"

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="portal-packages portal-packages__loading">Loading…</div>
      }
    >
      <PortalPackagesHub />
    </Suspense>
  )
}
