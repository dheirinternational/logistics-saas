"use client"

import { useNavbarStore } from "@/store/navBarStore"
import { IconMenu2 } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

export const Header = () => {
  const { setIsSideBarActive } = useNavbarStore()

  return (
    <header className="admin-header">
      <Link href="/admin" className="admin-header__brand">
        <Image
          src="/Dheir-logo.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 object-contain dheir-logo-img"
        />
        <span className="font-display text-base font-bold tracking-tight text-dheir-ink">
          DHEIR
        </span>
      </Link>
      <button
        type="button"
        className="admin-header__menu"
        onClick={() => setIsSideBarActive()}
        aria-label="Open menu"
        aria-controls="admin-sidebar"
        aria-expanded={false}
      >
        <IconMenu2 size={22} stroke={1.5} />
      </button>
    </header>
  )
}
