"use client"

import Link from "next/link"

type LegalDocumentProps = {
  title: string
  /** Raw extracted text (wording preserved). */
  text: string
  /** Optional subtitle line shown under title. */
  subtitle?: string
  backHref?: string
  backLabel?: string
}

type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }

const EM_DASH = "—"

function stripSignatureBlock(input: string) {
  // Remove the signature/confirmation footer block the user asked to delete.
  const lines = input.split("\n")
  const start = lines.findIndex((l) => l.trim().startsWith("Customer Name:"))
  if (start === -1) return input
  return lines.slice(0, start).join("\n").trim()
}

function normalizeCharacters(input: string) {
  // Remove em dashes while keeping wording: replace with a simple hyphen.
  return input.replaceAll(EM_DASH, "-")
}

function isAllCapsish(s: string) {
  const letters = s.replace(/[^A-Za-z]/g, "")
  if (letters.length < 6) return false
  return letters === letters.toUpperCase()
}

function isSectionHeading(line: string) {
  // Examples:
  // "Preamble & Scope"
  // "1 Procurement & Pre-Order Process"
  // "2.1 Payment Methods Accepted"
  // "Core Refund Position - No Refunds After Payment"
  if (!line) return false
  if (/^\d+(\.\d+)?\s+/.test(line)) return true
  if (/^[A-Z][A-Za-z0-9 &'()/-]{4,}$/.test(line) && !line.endsWith(".")) {
    return true
  }
  return false
}

function isBulletLine(line: string) {
  const t = line.trim()
  return t.startsWith("• ") || t.startsWith("◦ ")
}

function joinWrappedLines(lines: string[]) {
  // Heuristic: join lines within a paragraph that were hard-wrapped in the PDF.
  const out: string[] = []
  let buf = ""
  for (const raw of lines) {
    const line = raw.trimEnd()
    const trimmed = line.trim()
    if (!trimmed) {
      if (buf.trim()) out.push(buf.trim())
      buf = ""
      continue
    }

    // Keep headings and bullet lines separate.
    if (isSectionHeading(trimmed) || isBulletLine(trimmed)) {
      if (buf.trim()) out.push(buf.trim())
      buf = ""
      out.push(trimmed)
      continue
    }

    // Join with space; repair hyphenated line breaks ("pre-\norder" -> "pre-order")
    if (buf.endsWith("-")) {
      buf = `${buf.slice(0, -1)}${trimmed}`
    } else {
      buf = buf ? `${buf} ${trimmed}` : trimmed
    }
  }
  if (buf.trim()) out.push(buf.trim())
  return out
}

function parseBlocks(input: string): Block[] {
  const cleaned = normalizeCharacters(stripSignatureBlock(input))
  const wrapped = joinWrappedLines(cleaned.split("\n"))

  const blocks: Block[] = []
  let listBuf: string[] = []

  const flushList = () => {
    if (listBuf.length) {
      blocks.push({ kind: "list", items: listBuf })
      listBuf = []
    }
  }

  for (const line of wrapped) {
    const t = line.trim()
    if (!t) continue

    if (isBulletLine(t)) {
      listBuf.push(t.replace(/^([•◦])\s+/, ""))
      continue
    }

    flushList()

    if (isSectionHeading(t)) {
      const level: 1 | 2 | 3 =
        /^\d+\s+/.test(t) || t === "Preamble & Scope" ? 1 : /^\d+\.\d+\s+/.test(t) ? 2 : 3
      blocks.push({ kind: "heading", level, text: t })
      continue
    }

    blocks.push({ kind: "paragraph", text: t })
  }

  flushList()
  return blocks
}

export function LegalDocument({ title, subtitle, text }: LegalDocumentProps) {
  const blocks = parseBlocks(text)

  return (
    <main className="bg-dheir-page text-dheir-ink">
      <div className="marketing-container py-16 md:py-24">
        <Link
          href="/"
          className="text-sm font-semibold text-dheir-blue no-underline hover:underline"
        >
          Back to home
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dheir-muted">
            {subtitle}
          </p>
        ) : null}

        <article className="legal-doc mt-10 max-w-3xl">
          {blocks.map((block, idx) => {
            if (block.kind === "heading") {
              const cls =
                block.level === 1
                  ? "legal-doc__h1"
                  : block.level === 2
                    ? "legal-doc__h2"
                    : "legal-doc__h3"
              return (
                <h2 key={idx} className={cls}>
                  {isAllCapsish(block.text) ? block.text.toUpperCase() : block.text}
                </h2>
              )
            }

            if (block.kind === "list") {
              return (
                <ul key={idx} className="legal-doc__list">
                  {block.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )
            }

            return (
              <p key={idx} className="legal-doc__p">
                {block.text}
              </p>
            )
          })}
        </article>
      </div>
    </main>
  )
}

