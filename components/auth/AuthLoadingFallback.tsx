import { AuthPageShell } from "@/components/auth/AuthPageShell"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"

export function AuthLoadingFallback() {
  return (
    <AuthPageShell>
      <DHEIRLoader block size="lg" label="Loading…" />
    </AuthPageShell>
  )
}
