import { isTransientConnectionError, withDbRetry } from "@/lib/db/retry"
import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from "pg"

declare global {
  var pgPool: Pool | undefined
}

const DB_BUSY_MESSAGE =
  "Database is busy (too many connections). Wait 10–20 seconds and try again."

export class DatabaseUnavailableError extends Error {
  constructor(message = DB_BUSY_MESSAGE) {
    super(message)
    this.name = "DatabaseUnavailableError"
  }
}

export { isTransientConnectionError, withDbRetry }

/**
 * Supabase session pooler (:5432) allows ~15 connections total across all
 * serverless instances. Production must use transaction pooler (:6543).
 */
function withPgbouncer(url: string): string {
  if (/[?&]pgbouncer=true/i.test(url)) {
    return url
  }
  return url.includes("?") ? `${url}&pgbouncer=true` : `${url}?pgbouncer=true`
}

function toTransactionPoolerUrl(url: string): string {
  if (!url.includes("pooler.supabase.com")) {
    return url
  }
  if (url.includes(":6543")) {
    return withPgbouncer(url)
  }
  // Session mode :5432 → transaction mode :6543
  return withPgbouncer(url.replace(/:5432(?=\/|$)/, ":6543"))
}

function resolveConnectionString(): string {
  const isProd = process.env.NODE_ENV === "production"
  const raw = isProd ? process.env.DATABASE_URL : process.env.TEST_DATABASE_URL

  if (!raw) {
    throw new Error("Missing DATABASE_URL")
  }

  if (process.env.DATABASE_URL_TRANSACTION) {
    return withPgbouncer(process.env.DATABASE_URL_TRANSACTION)
  }

  if (isProd && process.env.USE_SUPABASE_SESSION_POOLER !== "true") {
    return toTransactionPoolerUrl(raw)
  }

  return raw
}

const connectionString = resolveConnectionString()

const isTransactionPooler =
  connectionString.includes(":6543") || connectionString.includes("pgbouncer=true")

/** One connection per serverless instance; transaction pooler supports many instances. */
const POOL_MAX = Number(
  process.env.PG_POOL_MAX ?? (process.env.NODE_ENV === "production" ? 1 : 8)
)

const poolConfig: PoolConfig = {
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: POOL_MAX,
  min: 0,
  idleTimeoutMillis: 5_000,
  connectionTimeoutMillis:
    process.env.NODE_ENV === "production" ? 25_000 : 10_000,
  allowExitOnIdle: true,
}

// Transaction pooler (PgBouncer) does not support prepared statements.
if (isTransactionPooler) {
  ;(poolConfig as PoolConfig & { prepare?: boolean }).prepare = false
}

export const pool = global.pgPool ?? new Pool(poolConfig)

global.pgPool = pool

pool.on("error", (err) => {
  console.error("Postgres pool error:", err)
})

export function isDatabaseCapacityError(err: unknown): boolean {
  return isTransientConnectionError(err)
}

export async function dbQuery<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<R>> {
  return withDbRetry(() => pool.query<R>(text, params), "dbQuery")
}

export function databaseCapacityMessage(): string {
  return DB_BUSY_MESSAGE
}

export function databaseErrorResponse(
  err: unknown,
  fallback: string
): { message: string; status: number } {
  if (err instanceof DatabaseUnavailableError) {
    return { message: err.message, status: 503 }
  }

  if (isDatabaseCapacityError(err)) {
    return { message: DB_BUSY_MESSAGE, status: 503 }
  }

  if (
    err instanceof Error &&
    err.message.includes("timeout exceeded when trying to connect")
  ) {
    return { message: DB_BUSY_MESSAGE, status: 503 }
  }

  if (err instanceof Error && err.message.includes("Missing DATABASE_URL")) {
    return {
      message: "Server database is not configured. Contact support.",
      status: 500,
    }
  }

  if (err instanceof Error && err.message) {
    return { message: err.message, status: 500 }
  }

  return { message: fallback, status: 500 }
}
