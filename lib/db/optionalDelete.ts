import type { PoolClient } from "pg"
import type { DatabaseError } from "pg"

/**
 * Run a delete that may fail if the table was never migrated in.
 * Uses a SAVEPOINT so a missing table (42P01) does not abort the whole transaction.
 */
export async function optionalDelete(
  client: PoolClient,
  sql: string,
  params: unknown[] = []
): Promise<void> {
  await client.query("SAVEPOINT optional_delete")
  try {
    await client.query(sql, params)
    await client.query("RELEASE SAVEPOINT optional_delete")
  } catch (err) {
    await client.query("ROLLBACK TO SAVEPOINT optional_delete")
    const dbErr = err as DatabaseError
    if (dbErr.code === "42P01") return
    throw err
  }
}
