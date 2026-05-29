import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cached: SupabaseClient | null = null

/**
 * Single Supabase service-role client for the entire app.
 * Reuses the same instance across requests within a serverless invocation
 * to avoid spinning up duplicate HTTP connection pools.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached

  const url =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL_TEST
  const key =
    process.env.NODE_ENV === "production"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.SUPABASE_SERVICE_ROLE_KEY_TEST

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    )
  }

  cached = createClient(url, key)
  return cached
}
