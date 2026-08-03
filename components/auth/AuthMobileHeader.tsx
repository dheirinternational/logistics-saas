import Image from "next/image"
import Link from "next/link"

type AuthMobileHeaderProps = {
  trailing?: React.ReactNode
}

export function AuthMobileHeader({ trailing }: AuthMobileHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between px-5 py-5 lg:hidden">
      <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
        <figure className="relative h-10 w-10 overflow-hidden rounded-lg bg-dheir-surface shadow-[var(--shadow-dheir-soft)]">
          <Image
            src="/DHEIR-logo.png"
            alt=""
            fill
            className="dheir-logo-img dheir-logo-img--invert object-contain p-0.5"
            priority
          />
        </figure>
        <span className="font-display text-sm font-bold text-dheir-ink">
          DHEIR
        </span>
      </Link>
      {trailing ?? (
        <Link
          href="/auth/login"
          className="text-sm font-medium text-dheir-muted no-underline hover:text-dheir-ink"
        >
          Log in
        </Link>
      )}
    </header>
  )
}
