const RETRY_DELAYS_MS = [200, 600, 1_500, 3_000]

export function isTransientConnectionError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  const code = (err as { code?: string })?.code

  return (
    message.includes("timeout exceeded when trying to connect") ||
    message.includes("Connection terminated") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ECONNRESET") ||
    message.includes("ENOTFOUND") ||
    message.includes("ETIMEDOUT") ||
    message.includes("max clients reached") ||
    message.includes("EMAXCONNSESSION") ||
    message.includes("too many connections") ||
    message.includes("remaining connection slots are reserved") ||
    message.includes("server closed the connection unexpectedly") ||
    code === "XX000" ||
    code === "53300" ||
    code === "57P01" ||
    code === "57P03" ||
    code === "08006" ||
    code === "08003"
  )
}

function jitter(base: number): number {
  return base + Math.floor(Math.random() * base * 0.3)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  label = "database operation"
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await operation()
    } catch (err) {
      lastError = err
      if (!isTransientConnectionError(err) || attempt >= RETRY_DELAYS_MS.length) {
        throw err
      }
      const delay = jitter(RETRY_DELAYS_MS[attempt])
      console.warn(
        `${label} failed (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length + 1}), retrying in ${delay}ms…`,
        err instanceof Error ? err.message : err
      )
      await sleep(delay)
    }
  }

  throw lastError
}
