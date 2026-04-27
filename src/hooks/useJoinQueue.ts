import { useState } from 'react'
import { joinQueue, type JoinedCustomer } from '../services/supabase/queueService'

type JoinQueuePayload = {
  name: string
  phone: string
  queueId: string
}

export function useJoinQueue() {
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [joinedCustomer, setJoinedCustomer] = useState<JoinedCustomer | null>(
    null,
  )

  async function submitJoinQueue(payload: JoinQueuePayload) {
    setError(null)
    setIsJoining(true)

    try {
      const customer = await joinQueue(payload)
      setJoinedCustomer(customer)
      return true
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to join the queue. Please try again.',
      )
      return false
    } finally {
      setIsJoining(false)
    }
  }

  function resetJoinedQueue() {
    setError(null)
    setJoinedCustomer(null)
  }

  return {
    error,
    isJoining,
    joinedCustomer,
    resetJoinedQueue,
    submitJoinQueue,
  }
}
