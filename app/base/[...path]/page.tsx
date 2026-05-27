import { redirect } from "next/navigation"

export default async function BaseCatchAllRedirect({
  params,
}: {
  params: Promise<{ path?: string[] }>
}) {
  const { path = [] } = await params
  redirect(`/customer/${path.join("/")}`)
}

