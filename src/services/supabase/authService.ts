import { supabase } from './client'

type LoginInput = {
  email: string
  password: string
}

type SignupInput = {
  email: string
  fullName: string
  location: string
  password: string
}

type ResetPasswordInput = {
  email: string
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Authentication is not available. Please check configuration.')
  }

  return supabase
}

export async function loginWithEmail({ email, password }: LoginInput) {
  const client = requireSupabase()
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signUpWithEmail({
  email,
  fullName,
  location,
  password,
}: SignupInput) {
  const client = requireSupabase()
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        location: location.trim(),
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function sendPasswordResetEmail({ email }: ResetPasswordInput) {
  const client = requireSupabase()
  const { data, error } = await client.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/login`,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function logout() {
  const client = requireSupabase()
  const { error } = await client.auth.signOut({ scope: 'global' })

  if (error) {
    throw new Error(error.message)
  }
}
