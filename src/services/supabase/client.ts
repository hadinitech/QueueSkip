import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'
import type { Database } from './database.types'

export const supabase = supabaseConfig.isConfigured
  ? createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey)
  : null
