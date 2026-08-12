import { createClient } from '@supabase/supabase-js'

// Supabase project credentials, exposed to the browser via NEXT_PUBLIC_ env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Shared Supabase client used across the app for auth + database access
export const supabase = createClient(supabaseUrl, supabaseAnonKey)