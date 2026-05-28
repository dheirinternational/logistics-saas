/** Default destination after public sign-in and account entry from marketing. */
export const CUSTOMER_PORTAL_ENTRY = "/customer/shop" as const

const ADMIN_PREFIX = "/admin"

/** Post-auth redirect for non-admin roles. Never returns an `/admin` URL. */
export function resolveCustomerPortalEntry(
  requested?: string | null,
): string {
  if (!requested?.trim()) {
    return CUSTOMER_PORTAL_ENTRY
  }

  const path = requested.startsWith("/") ? requested : `/${requested}`

  if (path === ADMIN_PREFIX || path.startsWith(`${ADMIN_PREFIX}/`)) {
    return CUSTOMER_PORTAL_ENTRY
  }

  return path
}
