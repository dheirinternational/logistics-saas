/** Where portal header search should land based on current area. */
export function getPortalSearchHref(query: string, pathname: string): string {
  const trimmed = query.trim()
  if (!trimmed) {
    return pathname.startsWith("/customer/shop") ||
      pathname.startsWith("/customer/marketplace")
      ? "/customer/shop"
      : "/customer/packages"
  }

  const encoded = encodeURIComponent(trimmed)

  if (
    pathname.startsWith("/customer/shop") ||
    pathname.startsWith("/customer/marketplace")
  ) {
    return `/customer/shop?search=${encoded}`
  }

  return `/customer/packages?search=${encoded}`
}
