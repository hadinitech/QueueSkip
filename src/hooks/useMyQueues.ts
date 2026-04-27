import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabase/client'
import { getMyQueues, type MyQueue } from '../services/supabase/queueService'

export function useMyQueues(refreshKey: number, enabled = true) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [queues, setQueues] = useState<MyQueue[]>([])
  const loadQueues = useCallback(async () => {
    const nextQueues = await getMyQueues()

    setQueues(nextQueues)
    setError(null)
  }, [])

  useEffect(() => {
    let isMounted = true

    if (!enabled) {
      setError(null)
      setIsLoading(false)
      setQueues([])
      return () => {
        isMounted = false
      }
    }

    setError(null)
    setIsLoading(true)

    loadQueues()
      .catch((caughtError) => {
        if (!isMounted) {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load your queues.',
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
  }, [enabled, loadQueues, refreshKey])

  useEffect(() => {
    if (!enabled || !supabase) {
      return
    }

    const client = supabase
    const channel = client
      .channel('my-queues-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          void loadQueues()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queues' },
        () => {
          void loadQueues()
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [enabled, loadQueues])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const intervalId = window.setInterval(() => {
      void loadQueues()
    }, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [enabled, loadQueues])

  return { error, isLoading, queues }
}
