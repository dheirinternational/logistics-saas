import { Suspense } from "react"
import ChangeEmail from "@/components/auth/ChangeEmail"

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ChangeEmail />
    </Suspense>
  )
}