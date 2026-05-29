import { databaseCapacityMessage, databaseErrorResponse, isDatabaseCapacityError } from "@/lib/db/db"

export function loginErrorResponse(err: unknown): { error: string; status: number } {
  if (isDatabaseCapacityError(err)) {
    return {
      error: databaseCapacityMessage(),
      status: 503,
    }
  }

  if (err instanceof Error && err.message.includes("Missing DATABASE_URL")) {
    return {
      error: "Server database is not configured. Contact support.",
      status: 500,
    }
  }

  const { message, status } = databaseErrorResponse(err, "Something went wrong")
  return { error: message, status }
}
