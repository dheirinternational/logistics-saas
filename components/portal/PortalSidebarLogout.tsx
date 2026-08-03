"use client"

import { DHEIRConfirmDialog } from "@/components/ui/DHEIRConfirmDialog"
import { logoutAction } from "@/lib/db/actions"
import { IconLogout } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "@/lib/ui/toast"

export function PortalSidebarLogout() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logoutAction()
    } catch (err) {
      const digest = err && typeof err === "object" && "digest" in err ? String(err.digest) : ""
      if (digest.startsWith("NEXT_REDIRECT")) return
      console.error(err)
      toast.error("Could not log out. Try again.")
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="portal-sidebar__logout"
        onClick={() => setConfirmOpen(true)}
      >
        <IconLogout size={22} stroke={1.5} aria-hidden />
        <span>Log out</span>
      </button>

      <DHEIRConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (!loading) setConfirmOpen(false)
        }}
        onConfirm={handleLogout}
        title="Log out?"
        description="You will need to sign in again to access your packages and account."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        variant="danger"
        loading={loading}
      />
    </>
  )
}
