import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../services/supabase/client'
import {
  createAdminQueue,
  getAdminDefaultQueueLocation,
  getAllActiveQueueCustomers,
  getAdminQueues,
  getQueueCustomers,
  markCustomerServing,
  markNextCustomerServing,
  removeQueueCustomer,
  type AdminQueue,
  type AdminQueueCustomer,
  type CreateQueueInput,
} from '../services/supabase/adminQueueService'

export function useAdminQueues() {
  const [adminBusinessId, setAdminBusinessId] = useState<string | null>(null)
  const [defaultQueueLocation, setDefaultQueueLocation] = useState('')
  const [customerActionError, setCustomerActionError] = useState<string | null>(
    null,
  )
  const [customers, setCustomers] = useState<AdminQueueCustomer[]>([])
  const [liveCustomers, setLiveCustomers] = useState<AdminQueueCustomer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isManagingCustomers, setIsManagingCustomers] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [isLoadingLiveCustomers, setIsLoadingLiveCustomers] = useState(true)
  const [adminUserId, setAdminUserId] = useState<string | null>(null)
  const [queues, setQueues] = useState<AdminQueue[]>([])
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null)
  const adminQueueIdsKey = queues.map((queue) => queue.id).join(',')
  const loadQueues = useCallback(async () => {
    const data = await getAdminQueues()

    setQueues(data)
    setSelectedQueueId((currentQueueId) => {
      if (currentQueueId && data.some((queue) => queue.id === currentQueueId)) {
        return currentQueueId
      }

      return data[0]?.id ?? null
    })
    setError(null)
  }, [])

  useEffect(() => {
    if (!supabase) {
      return
    }

    const client = supabase
    let isMounted = true

    client.auth.getUser().then(async ({ data }) => {
      if (!isMounted) {
        return
      }

      const userId = data.user?.id ?? null
      setAdminUserId(userId)

      if (!userId) {
        setAdminBusinessId(null)
        return
      }

      const { data: profile } = await client
        .from('profiles')
        .select('business_id')
        .eq('id', userId)
        .maybeSingle()

      if (isMounted) {
        setAdminBusinessId(profile?.business_id ?? null)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])
  const loadCustomers = useCallback(async (queueId: string) => {
    const data = await getQueueCustomers(queueId)

    setCustomers(data)
    setCustomerActionError(null)
  }, [])
  const loadLiveCustomers = useCallback(async () => {
    const data = await getAllActiveQueueCustomers()

    setLiveCustomers(data)
    setCustomerActionError(null)
  }, [])

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
        if (isMounted) {
          setIsLoading(false)
        }
      })

    getAdminDefaultQueueLocation()
      .then((location) => {
        if (isMounted) {
          setDefaultQueueLocation(location)
        }
      })
      .catch(() => {
        if (isMounted) {
          setDefaultQueueLocation('')
        }
      })

    return () => {
      isMounted = false
    }
  }, [loadQueues])

  useEffect(() => {
    if (!selectedQueueId) {
      setCustomers([])
      return
    }

    let isMounted = true
    setIsLoadingCustomers(true)
    setCustomerActionError(null)

    loadCustomers(selectedQueueId)
      .catch((caughtError) => {
        if (!isMounted) {
          return
        }

        setCustomerActionError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load customers.',
        )
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCustomers(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [loadCustomers, selectedQueueId])

  useEffect(() => {
    let isMounted = true

    setIsLoadingLiveCustomers(true)

    loadLiveCustomers()
      .catch((caughtError) => {
        if (!isMounted) {
          return
        }

        setCustomerActionError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load live customers.',
        )
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingLiveCustomers(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [loadLiveCustomers])

  useEffect(() => {
    if (!supabase || (!adminUserId && !adminBusinessId)) {
      return
    }

    const client = supabase
    const channel = client
      .channel(`admin-queues-${adminBusinessId || adminUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: adminBusinessId
            ? `business_id=eq.${adminBusinessId}`
            : `owner_id=eq.${adminUserId}`,
          schema: 'public',
          table: 'queues',
        },
        () => {
          void loadQueues()
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [adminBusinessId, adminUserId, loadQueues])

  useEffect(() => {
    if (!supabase || !selectedQueueId) {
      return
    }

    const client = supabase
    const channel = client
      .channel(`admin-live-line-${selectedQueueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          filter: `queue_id=eq.${selectedQueueId}`,
          schema: 'public',
          table: 'customers',
        },
        () => {
          void loadCustomers(selectedQueueId)
          void loadLiveCustomers()
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [loadCustomers, loadLiveCustomers, selectedQueueId])

  useEffect(() => {
    if (!supabase || adminQueueIdsKey.length === 0) {
      return
    }

    const client = supabase
    const queueIds = adminQueueIdsKey.split(',')
    const channel = client
      .channel(`admin-all-live-customers-${queueIds.join('-')}`)

    queueIds.forEach((queueId) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          filter: `queue_id=eq.${queueId}`,
          schema: 'public',
          table: 'customers',
        },
        () => {
          void loadLiveCustomers()
        },
      )
    })

    channel.subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [adminQueueIdsKey, loadLiveCustomers])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadQueues()
      void loadLiveCustomers()

      if (selectedQueueId) {
        void loadCustomers(selectedQueueId)
      }
    }, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [loadCustomers, loadLiveCustomers, loadQueues, selectedQueueId])

  async function submitCreateQueue(input: CreateQueueInput): Promise<boolean> {
    setError(null)
    setIsCreating(true)

    try {
      const queue = await createAdminQueue(input)
      setQueues((currentQueues) => [queue, ...currentQueues])
      setSelectedQueueId(queue.id)
      return true
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to create queue.',
      )
      return false
    } finally {
      setIsCreating(false)
    }
  }

  async function serveNextCustomer() {
    if (!selectedQueueId) {
      return
    }

    setCustomerActionError(null)
    setIsManagingCustomers(true)

    try {
      await markNextCustomerServing(selectedQueueId)
      const data = await getQueueCustomers(selectedQueueId)
      setCustomers(data)
      await loadLiveCustomers()
    } catch (caughtError) {
      setCustomerActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update the queue.',
      )
    } finally {
      setIsManagingCustomers(false)
    }
  }

  async function removeCustomer(customerId: string) {
    setCustomerActionError(null)
    setIsManagingCustomers(true)

    try {
      await removeQueueCustomer(customerId)

      if (selectedQueueId) {
        const data = await getQueueCustomers(selectedQueueId)
        setCustomers(data)
      }

      await loadLiveCustomers()
    } catch (caughtError) {
      setCustomerActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to remove customer.',
      )
    } finally {
      setIsManagingCustomers(false)
    }
  }

  async function serveCustomer(customerId: string) {
    setCustomerActionError(null)
    setIsManagingCustomers(true)

    try {
      await markCustomerServing(customerId)

      if (selectedQueueId) {
        const data = await getQueueCustomers(selectedQueueId)
        setCustomers(data)
      }

      await loadLiveCustomers()
    } catch (caughtError) {
      setCustomerActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to serve customer.',
      )
    } finally {
      setIsManagingCustomers(false)
    }
  }

  return {
    customerActionError,
    customers,
    defaultQueueLocation,
    error,
    isCreating,
    isLoadingCustomers,
    isLoadingLiveCustomers,
    isLoading,
    isManagingCustomers,
    liveCustomers,
    queues,
    removeCustomer,
    serveCustomer,
    selectedQueueId,
    selectedQueue: queues.find((queue) => queue.id === selectedQueueId) ?? null,
    serveNextCustomer,
    setSelectedQueueId,
    submitCreateQueue,
  }
}
