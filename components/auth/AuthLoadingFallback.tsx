import { AuthPageShell } from "@/components/auth/AuthPageShell"
import { DheirLoader } from "@/components/ui/DheirLoader"

export function AuthLoadingFallback() {
  return (
    <AuthPageShell>
      <DheirLoader block size="lg" label="Loading…" />
    </AuthPageShell>
  )
}
