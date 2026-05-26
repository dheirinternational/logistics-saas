import Link from "next/link"

type LegalPlaceholderProps = {
  title: string
}

export function LegalPlaceholder({ title }: LegalPlaceholderProps) {
  return (
    <article className="mx-auto max-w-2xl px-5 py-16 md:py-24">
      <Link
        href="/"
        className="text-sm font-semibold text-dheir-blue no-underline hover:underline"
      >
        Back to home
      </Link>
      <h1 className="font-display mt-6 text-2xl font-bold tracking-tight text-dheir-ink md:text-3xl">
        {title}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-dheir-muted">
        Full legal text is being prepared. For questions, contact{" "}
        <a
          href="mailto:support@dheirinternational.com"
          className="font-semibold text-dheir-blue"
        >
          support@dheirinternational.com
        </a>
        .
      </p>
    </article>
  )
}
