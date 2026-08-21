import { resolveDashboardHref } from "@/lib/auth/postAuthRedirect"

export type MarketingHeaderUser = {
  id: number
  email: string
  role: string
  firstName: string | null
  lastName: string | null
  profileImg: string | null
  displayName: string
  dashboardHref: string
  memberCode?: string | null
}

type SessionRow = {
  user_id: number
  email: string
  role: string
  first_name?: string | null
  last_name?: string | null
  profile_img?: string | null
  customer_code?: string | null
}

export function toMarketingHeaderUser(session: SessionRow): MarketingHeaderUser {
  const firstName = session.first_name?.trim() || null
  const lastName = session.last_name?.trim() || null
  const fullName = [firstName, lastName].filter(Boolean).join(" ")
  const displayName =
    fullName || session.email.split("@")[0] || "Account"

  return {
    id: session.user_id,
    email: session.email,
    role: session.role,
    firstName,
    lastName,
    profileImg: session.profile_img?.trim() || null,
    displayName,
    dashboardHref: resolveDashboardHref(session.role),
    memberCode: session.customer_code || String(session.user_id),
  }
}
