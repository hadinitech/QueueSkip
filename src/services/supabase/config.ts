export type SupabaseConfig = {
  anonKey: string
  isConfigured: boolean
  url: string
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabaseConfig: SupabaseConfig = {
  anonKey: supabaseAnonKey,
  isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  url: supabaseUrl,
}
