import {
  CUSTOMER_PORTAL_ENTRY,
  resolveCustomerPortalEntry,
} from "@/lib/portal/customerEntry"

export const ADMIN_PORTAL_ENTRY = "/admin" as const

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "staff"
}

/** Landing header profile link and default dashboard entry by role. */
export function resolveDashboardHref(role: string): string {
  return isAdminRole(role) ? ADMIN_PORTAL_ENTRY : CUSTOMER_PORTAL_ENTRY
}

/**
 * Post sign-in redirect. Admins may only land on `/admin` paths; everyone else
 * is kept on customer routes and never sent to `/admin`.
 */
export function resolvePostAuthEntry(
  role: string,
  requested?: string | null,
): string {
  if (isAdminRole(role)) {
    if (!requested?.trim()) {
      return ADMIN_PORTAL_ENTRY
    }
    const path = requested.startsWith("/") ? requested : `/${requested}`
    if (path === ADMIN_PORTAL_ENTRY || path.startsWith(`${ADMIN_PORTAL_ENTRY}/`)) {
      return path
    }
    return ADMIN_PORTAL_ENTRY
  }

  return resolveCustomerPortalEntry(requested)
}
