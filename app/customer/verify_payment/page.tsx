import { redirect } from "next/navigation"

export default async function VerifyPayment({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const reference =
    (typeof params.paymentReference === "string" && params.paymentReference) ||
    (typeof params.reference === "string" && params.reference) ||
    (typeof params.transactionReference === "string" && params.transactionReference)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || ""
  const fallback = `${appUrl}/customer/pending_payments`

  if (!reference) {
    redirect(fallback)
  }

  try {
    const res = await fetch(
      `${appUrl}/api/monnify/verify/shipment/${encodeURIComponent(reference)}`,
      { cache: "no-store" }
    )
    const result = await res.json()
    redirect(result.redirect_to || fallback)
  } catch {
    redirect(fallback)
  }
}
