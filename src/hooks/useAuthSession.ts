import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase/client'
import {
  getCurrentUserProfile,
  type UserProfile,
} from '../services/supabase/profileService'

export function useAuthSession() {
  const [isLoadingSession, setIsLoadingSession] = useState(Boolean(supabase))
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!supabase) {
      return
    }

    let isMounted = true

    async function syncSession(nextSession: Session | null) {
      if (!isMounted) {
        return
      }

      setSession(nextSession)

      if (!nextSession) {
        setProfile(null)
        setIsLoadingSession(false)
        return
      }

      try {
        const nextProfile = await getCurrentUserProfile()

        if (isMounted) {
          setProfile(nextProfile)
        }
      } catch {
        if (isMounted) {
          setProfile(null)
        }
      }

      if (isMounted) {
        setIsLoadingSession(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setIsLoadingSession(Boolean(nextSession))
      void syncSession(nextSession)
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  return {
    isAuthenticated: Boolean(session),
    isLoadingSession,
    profile,
    session,
  }
}
