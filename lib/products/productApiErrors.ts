import { databaseErrorResponse } from "@/lib/db/db"

export function productApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.includes("Supabase storage is not configured")) {
    return "Server storage is not configured. Add Supabase keys to production environment variables."
  }

  return databaseErrorResponse(err, fallback).message
}

export function productApiErrorStatus(err: unknown, fallbackStatus = 500): number {
  return databaseErrorResponse(err, "").status || fallbackStatus
}
