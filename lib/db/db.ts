import { Pool } from "pg"

declare global {
  var pgPool: Pool | undefined
}

const connectionString =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL
    : process.env.TEST_DATABASE_URL

if (!connectionString) {
  throw new Error("Missing DATABASE_URL")
}

/** Keep below Supabase session pooler limit (often 15). */
const POOL_MAX = Number(process.env.PG_POOL_MAX ?? 8)

export const pool =
  global.pgPool ??
  new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: POOL_MAX,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  })

global.pgPool = pool
