import { redirect } from "next/navigation"

export default async function AllPackagesRedirect({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tab?: string }>
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  if (params.search) query.set("search", params.search)
  if (params.tab) query.set("tab", params.tab)
  const qs = query.toString()
  redirect(`/customer/packages${qs ? `?${qs}` : ""}`)
}
