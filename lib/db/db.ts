import { isTransientConnectionError, withDbRetry } from "@/lib/db/retry"
import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from "pg"

declare global {
  var pgPool: Pool | undefined
}

const DB_BUSY_MESSAGE =
  "The server could not reach the database in time. Wait a few seconds and try again. If this keeps happening, avoid opening many admin tabs at once."

export class DatabaseUnavailableError extends Error {
  constructor(message = DB_BUSY_MESSAGE) {
    super(message)
    this.name = "DatabaseUnavailableError"
  }
}

export { isTransientConnectionError, withDbRetry }

/**
 * Supabase session pooler (:5432) allows ~15 connections total across all
 * serverless instances. Production should use transaction pooler (:6543).
 *
 * DATABASE_URL_TRANSACTION is optional. If unset, DATABASE_URL is auto-rewritten
 * :5432 → :6543 on pooler hosts. Only set TRANSACTION if you paste the
 * "Transaction" URI from Supabase (port 6543), not Session (5432) or direct db.*.
 */
function stripEnvQuotes(value: string) {
  const t = value.trim()
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim()
  }
  return t
}

function withPgbouncer(url: string): string {
  if (/[?&]pgbouncer=true/i.test(url)) {
    return url
  }
  return url.includes("?") ? `${url}&pgbouncer=true` : `${url}?pgbouncer=true`
}

function isDirectSupabaseHost(url: string): boolean {
  return /db\.[a-z0-9]+\.supabase\.co/i.test(url) && !url.includes("pooler.supabase.com")
}

function isPoolerHost(url: string): boolean {
  return url.includes("pooler.supabase.com")
}

/** Normalize any Supabase pooler URL to transaction mode (:6543) + pgbouncer. */
function normalizePoolerUrl(url: string): string {
  let out = stripEnvQuotes(url)
  if (!out.startsWith("postgres")) {
    throw new Error("Database URL must start with postgresql:// or postgres://")
  }
  if (isDirectSupabaseHost(out)) {
    throw new Error("Use the pooler host (pooler.supabase.com:6543), not db.*.supabase.co")
  }
  if (isPoolerHost(out)) {
    out = out.replace(/:5432(?=\/|$)/, ":6543")
  }
  return withPgbouncer(out)
}

function toTransactionPoolerUrl(url: string): string {
  return normalizePoolerUrl(url)
}

function resolveConnectionString(): string {
  const isProd = process.env.NODE_ENV === "production"
  const raw = stripEnvQuotes(
    (isProd ? process.env.DATABASE_URL : process.env.TEST_DATABASE_URL) ?? ""
  )

  if (!raw) {
    throw new Error("Missing DATABASE_URL")
  }

  const transactionOverride = stripEnvQuotes(process.env.DATABASE_URL_TRANSACTION ?? "")

  if (transactionOverride && isProd) {
    try {
      return normalizePoolerUrl(transactionOverride)
    } catch (err) {
      console.error(
        "DATABASE_URL_TRANSACTION is invalid; falling back to DATABASE_URL with :6543 rewrite:",
        err instanceof Error ? err.message : err
      )
    }
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
