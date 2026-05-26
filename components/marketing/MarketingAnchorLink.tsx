"use client"

import { smoothScrollToHash } from "@/lib/marketing/smoothScrollTo"
import type { AnchorHTMLAttributes, MouseEvent } from "react"

type MarketingAnchorLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

export function MarketingAnchorLink({
  href,
  onClick,
  children,
  ...rest
}: MarketingAnchorLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    if (!href.startsWith("#")) return

    if (smoothScrollToHash(href)) {
      e.preventDefault()
    }
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
