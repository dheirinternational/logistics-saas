/** Scroll to a same-page hash target; respects reduced motion. */
export function smoothScrollToHash(hash: string) {
  const id = decodeURIComponent(hash.replace(/^#/, ""))
  if (!id) return false

  const target = document.getElementById(id)
  if (!target) return false

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches

  target.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  })

  if (window.location.hash !== `#${id}`) {
    window.history.pushState(null, "", `#${id}`)
  }

  return true
}
