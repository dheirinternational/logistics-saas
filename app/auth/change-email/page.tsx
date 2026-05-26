import { AuthLoadingFallback } from "@/components/auth/AuthLoadingFallback"
import ChangeEmail from "@/components/auth/ChangeEmail"
import { Suspense } from "react"

export default function ChangeEmailPage() {
  return (
    <Suspense fallback={<AuthLoadingFallback />}>
      <ChangeEmail />
    </Suspense>
  )
}
