import { supabase } from './client'
import type { ProfileRole } from './database.types'

export type UserProfile = {
  businessId: string | null
  email: string
  fullName: string
  id: string
  location: string
  role: ProfileRole
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Profile service is not available. Please check configuration.')
  }

  return supabase
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const client = requireSupabase()
  const { data: authData, error: authError } = await client.auth.getUser()

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user) {
    return null
  }

  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, email, location, role, business_id')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return {
      businessId: null,
      email: authData.user.email || '',
      fullName:
        typeof authData.user.user_metadata.full_name === 'string'
          ? authData.user.user_metadata.full_name
          : '',
      id: authData.user.id,
      location:
        typeof authData.user.user_metadata.location === 'string'
          ? authData.user.user_metadata.location
          : '',
      role: 'customer',
    }
  }

  return {
    email: data.email,
    fullName: data.full_name,
    id: data.id,
    location: data.location,
    role: data.role,
    businessId: data.business_id,
  }
}
