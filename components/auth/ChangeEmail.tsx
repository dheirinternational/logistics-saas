"use client"

import { AuthField } from "@/components/auth/AuthField"
import { AuthPageShell } from "@/components/auth/AuthPageShell"
import { BlurReveal } from "@/components/auth/BlurReveal"
import { IconMail } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useState } from "react"
import { DHEIRLoader } from "@/components/ui/DHEIRLoader"
import { toast } from "@/lib/ui/toast"

export default function ChangeEmail() {
  const params = useSearchParams()
  const router = useRouter()
  const [isChangingEmail, setIsChangingEmail] = useState(false)

  const changeEmail = async (newEmail: string) => {
    const token = params.get("token")
    if (!token) {
      toast.error("Invalid or expired link")
      return
    }

    setIsChangingEmail(true)
    try {
      const res = await fetch(`/api/auth/change-email?token=${token}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.push("/auth/login")
    } catch {
      toast.error("Could not update email. Try again.")
    } finally {
      setIsChangingEmail(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    changeEmail(data.email as string)
  }

  return (
    <AuthPageShell
      mobileTrailing={
        <Link
          href="/auth/login"
          className="text-sm font-medium text-dheir-muted no-underline hover:text-dheir-ink"
        >
          Log in
        </Link>
      }
    >
      <BlurReveal immediate>
        <h2 className="font-display text-[1.75rem] font-bold tracking-tight text-dheir-ink">
          New email
        </h2>
        <p className="mt-2 text-[15px] text-dheir-muted">
          Enter the address you want on your account.
        </p>
      </BlurReveal>

      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        <BlurReveal immediate delay={100}>
          <AuthField
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            icon={<IconMail size={18} stroke={1.5} />}
          />
        </BlurReveal>

        <BlurReveal immediate delay={180}>
          <button
            type="submit"
            disabled={isChangingEmail}
            className="dheir-btn-primary"
          >
            {isChangingEmail ? (
              <DHEIRLoader color="#fff" size={20} />
            ) : (
              "Save email"
            )}
          </button>
        </BlurReveal>
      </form>
    </AuthPageShell>
  )
}
