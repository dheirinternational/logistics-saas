import { resolvePostAuthEntry } from "@/lib/auth/postAuthRedirect"
import { getSession } from "@/lib/db/session"
import { redirect } from "next/navigation"

export default async function BaseRedirect() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/login")
  }
  redirect(resolvePostAuthEntry(session.role, null))
}

