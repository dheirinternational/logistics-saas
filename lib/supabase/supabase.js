import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL_TEST,
  process.env.NODE_ENV === "production" ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY_TEST
)