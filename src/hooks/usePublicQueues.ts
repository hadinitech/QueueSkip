import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabase/client'
import { getPublicQueues } from '../services/supabase/queueService'
import type { QueueType } from '../types/queue'

export function usePublicQueues(location?: string) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [queues, setQueues] = useState<QueueType[]>([])
  const loadQueues = useCallback(async () => {
    const data = await getPublicQueues(location)

    setQueues(data)
    setError(null)
  }, [location])

  useEffect(() => {
    let isMounted = true

    loadQueues()
      .catch((caughtError) => {
        if (!isMounted) {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load queues.',
        )
      })
      .finally(() => {
        if (!isMounted) {
          return
        }

        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [loadQueues])

  useEffect(() => {
    if (!supabase) {
      return
    }

    const client = supabase
    const channel = client
      .channel('public-queue-counts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queues' },
        () => {
          void loadQueues()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          void loadQueues()
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [loadQueues])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadQueues()
    }, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [loadQueues])

  return {
    error,
    isLoading,
    queues,
  }
}
