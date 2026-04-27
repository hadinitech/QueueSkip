import { useState } from 'react'
import {
  loginWithEmail,
  sendPasswordResetEmail,
  signUpWithEmail,
} from '../services/supabase/authService'
import { getCurrentUserProfile } from '../services/supabase/profileService'
import type { ProfileRole } from '../services/supabase/database.types'

type AuthStatus = {
  error: string | null
  isLoading: boolean
  message: string | null
}

const initialStatus: AuthStatus = {
  error: null,
  isLoading: false,
  message: null,
}

function getLandingPath(role: ProfileRole | undefined) {
  if (role === 'super_admin') {
    return '/customer'
  }

  if (role === 'business') {
    return '/admin/dashboard'
  }

  return '/customer/dashboard'
}

export function useAuthActions() {
  const [status, setStatus] = useState<AuthStatus>(initialStatus)

  async function runAuthAction(action: () => Promise<void>) {
    setStatus({ error: null, isLoading: true, message: null })

    try {
      await action()
    } catch (caughtError) {
      setStatus({
        error:
          caughtError instanceof Error
            ? caughtError.message
            : 'Something went wrong. Please try again.',
        isLoading: false,
        message: null,
      })
    }
  }

  async function login(
    email: string,
    password: string,
    onSuccess: (pathname: string) => void,
  ) {
    await runAuthAction(async () => {
      await loginWithEmail({ email, password })
      const profile = await getCurrentUserProfile()
      const landingPath = getLandingPath(profile?.role)

      setStatus({
        error: null,
        isLoading: false,
        message: 'Login successful.',
      })
      onSuccess(landingPath)
    })
  }

  async function signup(
    fullName: string,
    email: string,
    location: string,
    password: string,
    onSuccess: (pathname: string) => void,
  ) {
    await runAuthAction(async () => {
      const data = await signUpWithEmail({ email, fullName, location, password })

      if (data.session) {
        const profile = await getCurrentUserProfile()
        setStatus({
          error: null,
          isLoading: false,
          message: 'Account created successfully.',
        })
        onSuccess(getLandingPath(profile?.role))
        return
      }

      setStatus({
        error: null,
        isLoading: false,
        message: 'Account created. Please check your email to confirm it.',
      })
    })
  }

  async function sendResetEmail(email: string) {
    await runAuthAction(async () => {
      await sendPasswordResetEmail({ email })
      setStatus({
        error: null,
        isLoading: false,
        message: 'Password reset link sent. Please check your email.',
      })
    })
  }

  return {
    ...status,
    login,
    sendResetEmail,
    signup,
  }
}
