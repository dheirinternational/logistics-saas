import { AuthPageShell } from "@/components/auth/AuthPageShell"
import { ClipLoader } from "react-spinners"

export function AuthLoadingFallback() {
  return (
    <AuthPageShell>
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
        <ClipLoader color="#1A5FFF" size={28} />
        <p className="text-sm text-dheir-muted">Loading...</p>
      </div>
    </AuthPageShell>
  )
}
