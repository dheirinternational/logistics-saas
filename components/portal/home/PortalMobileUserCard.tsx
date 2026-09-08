"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { IconSettings, IconCopy, IconCheck, IconUser, IconPhone, IconId } from "@tabler/icons-react"

type PortalMobileUserCardProps = {
  firstName: string
  lastName?: string
  memberCode: string
  phone?: string
  profileImg?: string
}

export function PortalMobileUserCard({
  firstName,
  lastName,
  memberCode,
  phone,
  profileImg,
}: PortalMobileUserCardProps) {
  const [copied, setCopied] = useState(false)
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Valued Customer"
  const displayPhone = phone?.trim() || "08167278847"

  const handleCopyCode = async () => {
    if (!memberCode) return
    try {
      await navigator.clipboard.writeText(memberCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="md:hidden block mb-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-blue-800/60 flex items-center justify-center shrink-0">
            {profileImg ? (
              <Image
                src={profileImg}
                alt={fullName}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <span className="text-xl font-bold tracking-tight text-white">
                {firstName ? firstName.charAt(0).toUpperCase() : "D"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white tracking-tight truncate leading-tight">
              {fullName}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
              <IconPhone size={13} stroke={1.5} className="shrink-0 text-blue-400" />
              <span className="truncate">{displayPhone}</span>
            </div>
            {memberCode && (
              <div className="flex items-center gap-1.5 text-xs text-blue-200 mt-1">
                <IconId size={13} stroke={1.5} className="shrink-0 text-blue-400" />
                <span className="font-medium">Member Number : {memberCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 text-slate-300 hover:text-white transition-colors"
                  aria-label="Copy member number"
                >
                  {copied ? (
                    <IconCheck size={13} stroke={2} className="text-emerald-400" />
                  ) : (
                    <IconCopy size={13} stroke={1.5} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/customer/profile"
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
          aria-label="Account Settings"
        >
          <IconSettings size={20} stroke={1.5} />
        </Link>
      </div>
    </div>
  )
}
