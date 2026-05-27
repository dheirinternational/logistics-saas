import { redirect } from "next/navigation"

export default async function MarketplaceRedirect({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  if (params.search) query.set("search", params.search)
  if (params.category) query.set("category", params.category)
  const qs = query.toString()
  redirect(`/customer/shop${qs ? `?${qs}` : ""}`)
}
