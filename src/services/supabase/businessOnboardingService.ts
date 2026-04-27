import { supabase } from './client'

export type BusinessOnboardingRequestInput = {
  businessName: string
  email: string
  location: string
  notes: string
  ownerName: string
  phone: string
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Business onboarding is not available. Please check configuration.')
  }

  return supabase
}

export async function submitBusinessOnboardingRequest(
  input: BusinessOnboardingRequestInput,
): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('business_onboarding_requests').insert({
    business_name: input.businessName.trim(),
    email: input.email.trim(),
    location: input.location.trim(),
    notes: input.notes.trim() || null,
    owner_name: input.ownerName.trim(),
    phone: input.phone.trim(),
  })

  if (error) {
    throw new Error(error.message)
  }
}
