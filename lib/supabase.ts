import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wdqhjnpnkhfarcvwnumk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_6d7B8mTusYnkScx2GjOOjQ_fbrobyCP'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
