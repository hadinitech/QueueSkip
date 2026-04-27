import { useEffect, useState } from 'react'
import { getQueueLocations } from '../services/supabase/queueService'

export function useQueueLocations() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locations, setLocations] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    getQueueLocations()
      .then((nextLocations) => {
        if (!isMounted) {
          return
        }

        setLocations(nextLocations)
        setError(null)
      })
      .catch((caughtError) => {
        if (!isMounted) {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load locations.',
        )
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { error, isLoading, locations }
}
