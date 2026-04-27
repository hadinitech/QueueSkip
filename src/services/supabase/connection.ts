import { supabase } from './client'
import { supabaseConfig } from './config'

export type SupabaseConnectionStatus = {
  isConfigured: boolean
  message: string
}

export async function checkSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  if (!supabase || !supabaseConfig.isConfigured) {
    return {
      isConfigured: false,
      message: 'Supabase environment variables are not configured.',
    }
  }

  const { error } = await supabase.from('queues').select('id').limit(1)

  if (error) {
    return {
      isConfigured: true,
      message: error.message,
    }
  }

  return {
    isConfigured: true,
    message: 'Supabase connection is ready.',
  }
}
