"use client"

import { logoutAction } from "@/lib/db/actions"
import { IconLogout } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

export function PortalSidebarLogout() {
  const router = useRouter()

  const handleLogout = async () => {
    await logoutAction()
    router.push("/auth/login")
  }

  return (
    <button
      type="button"
      className="portal-sidebar__logout"
      onClick={handleLogout}
    >
      <IconLogout size={22} stroke={1.5} aria-hidden />
      <span>Log out</span>
    </button>
  )
}
