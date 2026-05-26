/** Where portal header search should land based on current area. */
export function getPortalSearchHref(query: string, pathname: string): string {
  const trimmed = query.trim()
  if (!trimmed) {
    return pathname.startsWith("/base/shop") ||
      pathname.startsWith("/base/marketplace")
      ? "/base/shop"
      : "/base/packages"
  }

  const encoded = encodeURIComponent(trimmed)

  if (
    pathname.startsWith("/base/shop") ||
    pathname.startsWith("/base/marketplace")
  ) {
    return `/base/shop?search=${encoded}`
  }

  return `/base/packages?search=${encoded}`
}
