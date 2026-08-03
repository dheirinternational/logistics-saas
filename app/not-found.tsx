import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-dheir-page px-4 py-16 text-dheir-ink">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <Image
            src="/DHEIR colored.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
          <span className="font-display text-2xl font-bold tracking-tight">
            DHEIR
          </span>
        </div>

        <p className="mt-10 text-[12px] font-semibold uppercase tracking-[0.22em] text-dheir-muted">
          404 · Page not found
        </p>
        <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          We can’t find that page.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-dheir-muted sm:text-base">
          The link may be outdated, or the page may have moved.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="dheir-btn-primary min-h-11 w-full rounded-full sm:w-auto sm:px-8">
            Go to homepage
          </Link>
          <Link
            href="/customer"
            className="dheir-btn-secondary min-h-11 w-full rounded-full sm:w-auto sm:px-8"
          >
            Customer dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}

