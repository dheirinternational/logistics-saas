"use client"

import { DHEIRConfirmDialog } from "@/components/ui/DHEIRConfirmDialog"
import { logoutAction } from "@/lib/db/actions"
import { toast } from "@/lib/ui/toast"
import { useState } from "react"
import { IconChevronRight, IconLogout } from "@tabler/icons-react"

const LogoutButton = () => {
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
        className="portal-account__link"
        onClick={() => setConfirmOpen(true)}
      >
        <span className="portal-account__link-icon" aria-hidden style={{ background: "color-mix(in srgb, var(--color-dheir-red) 12%, transparent)", color: "var(--color-dheir-red)" }}>
          <IconLogout size={22} stroke={1.5} />
        </span>
        <span className="portal-account__link-body">
          <span className="portal-account__link-label">Log out</span>
        </span>
        <IconChevronRight
          size={18}
          stroke={1.5}
          className="portal-account__link-chevron"
          aria-hidden
        />
      </button>

      <DHEIRConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (!loading) setConfirmOpen(false)
        }}
        onConfirm={handleLogout}
        title="Log out?"
        description="You will need to sign in again to access the admin portal."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        variant="danger"
        loading={loading}
      />
    </>
  )
}

export default LogoutButton
