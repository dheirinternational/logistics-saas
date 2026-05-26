/** Precomputed dial ticks — avoids SSR/client float hydration mismatches. */

const fmt = (n: number) => Number(n.toFixed(2))

export type TrustDialTick = {
  x1: number
  y1: number
  x2: number
  y2: number
  major: boolean
}

export const TRUST_DIAL_TICKS: TrustDialTick[] = Array.from(
  { length: 72 },
  (_, i) => {
    const angle = (i / 72) * Math.PI * 2 - Math.PI / 2
    return {
      x1: fmt(210 + Math.cos(angle) * 198),
      y1: fmt(210 + Math.sin(angle) * 198),
      x2: fmt(210 + Math.cos(angle) * 208),
      y2: fmt(210 + Math.sin(angle) * 208),
      major: i % 6 === 0,
    }
  }
)
