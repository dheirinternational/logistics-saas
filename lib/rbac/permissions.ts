export type StaffSubRole = "super_admin" | "customer_service" | "marketing"

export type StaffPermission =
  | "announcements:write"
  | "shipments:read"
  | "packages:read"
  | "procurement:manage"
  | "inbox:write"
  | "users:manage"
  | "pricing:manage"
  | "payments:manage"
  | "warehouses:manage"
  | "marketplace:manage"
  | "full_admin"

export const STAFF_PERMISSIONS: Record<StaffSubRole, readonly StaffPermission[]> = {
  super_admin: ["full_admin"],
  customer_service: [
    "announcements:write",  // Dashboard: Send announcements
    "shipments:read",       // Shipment: Access as viewer
    "procurement:manage",   // Procurement: Access & quote
    "inbox:write",          // Inbox: Send & reply to messages
  ],
  marketing: [
    "announcements:write",  // Dashboard: Overview & announcements
    "users:manage",         // Users: Access customers & addresses
    "procurement:manage",   // Procurement: Access & review
    "inbox:write",          // Inbox: Send & reply
  ],
}

/**
 * Determines which sidebar routes a specific staff role is allowed to access.
 */
export function getStaffAllowedRoutes(subRole: StaffSubRole): string[] {
  if (subRole === "super_admin") {
    return [
      "/admin",
      "/admin/shipments",
      "/admin/packages",
      "/admin/procurement",
      "/admin/users",
      "/admin/warehouses",
      "/admin/marketplace",
      "/admin/shop_catalog",
      "/admin/media",
      "/admin/orders",
      "/admin/payments/confirmations",
      "/admin/payments/summary",
      "/admin/delivery_zones",
      "/admin/pricing_list",
      "/admin/inbox",
      "/admin/profile",
    ]
  }

  if (subRole === "customer_service") {
    return [
      "/admin",               // Dashboard (overview & announcements)
      "/admin/shipments",     // Shipments viewer
      "/admin/procurement",   // Procurement
      "/admin/inbox",         // Inbox
      "/admin/profile",
    ]
  }

  if (subRole === "marketing") {
    return [
      "/admin",               // Dashboard
      "/admin/users",         // Users
      "/admin/procurement",   // Procurement
      "/admin/inbox",         // Inbox
      "/admin/profile",
    ]
  }

  return ["/admin"]
}

export function isStaffAllowedRoute(subRole: StaffSubRole | undefined, pathname: string): boolean {
  if (!subRole || subRole === "super_admin") return true
  const allowed = getStaffAllowedRoutes(subRole)
  return allowed.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}
