import { createClient } from '@supabase/supabase-js'

export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role key for server-side
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}