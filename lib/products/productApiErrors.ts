import type { DatabaseError } from "pg"

export function productApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    if (err.message.includes("Supabase storage is not configured")) {
      return "Server storage is not configured. Add Supabase keys to production environment variables."
    }
    return err.message
  }

  const dbErr = err as DatabaseError
  if (dbErr?.code === "23503") {
    return "This record is linked to other data and could not be saved or removed."
  }
  if (dbErr?.code === "23505") {
    return "A product with this data already exists."
  }
  if (dbErr?.code === "ECONNREFUSED" || dbErr?.code === "53300") {
    return "Database is busy. Wait a moment and try again."
  }

  return fallback
}
