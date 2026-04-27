import { supabase } from './client'
import type { CustomerStatus } from './database.types'
import type { QueueType } from '../../types/queue'

export type JoinedCustomer = {
  createdAt: string
  id: string
  name: string
  phone: string
  position: number
  queueId: string
  status: CustomerStatus
}

export type MyQueue = {
  createdAt: string
  estimatedWaitMinutes: number
  id: string
  peopleAhead: number
  position: number
  queueDescription: string
  queueId: string
  queueName: string
  queueTitle: string
  status: CustomerStatus
}

type JoinQueueInput = {
  name: string
  phone: string
  queueId: string
}

function mapJoinedCustomer(row: {
  created_at: string
  id: string
  name: string
  phone: string
  position: number
  queue_id: string
  status: CustomerStatus
}): JoinedCustomer {
  return {
    createdAt: row.created_at,
    id: row.id,
    name: row.name,
    phone: row.phone,
    position: row.position,
    queueId: row.queue_id,
    status: row.status,
  }
}

function mapPublicQueue(row: {
  address: string
  business_id: string | null
  city: string
  country: string
  description: string
  estimated_wait_minutes: number
  id: string
  latitude: number | null
  lunch_time: string
  location: string
  longitude: number | null
  name: string
  people_waiting: number
  province: string
  title: string
}): QueueType {
  return {
    address: row.address,
    businessId: row.business_id,
    city: row.city,
    country: row.country,
    description: row.description,
    estimatedWaitMinutes: row.estimated_wait_minutes,
    id: row.id,
    latitude: row.latitude,
    lunchTime: row.lunch_time,
    location: row.location,
    longitude: row.longitude,
    name: row.name,
    peopleWaiting: row.people_waiting,
    province: row.province,
    title: row.title,
  }
}

function mapMyQueue(row: {
  created_at: string
  estimated_wait_minutes: number
  id: string
  people_ahead: number
  position: number
  queue_description: string
  queue_id: string
  queue_name: string
  queue_title: string
  status: CustomerStatus
}): MyQueue {
  return {
    createdAt: row.created_at,
    estimatedWaitMinutes: row.estimated_wait_minutes,
    id: row.id,
    peopleAhead: row.people_ahead,
    position: row.position,
    queueDescription: row.queue_description,
    queueId: row.queue_id,
    queueName: row.queue_name,
    queueTitle: row.queue_title,
    status: row.status,
  }
}

export async function getPublicQueues(location?: string): Promise<QueueType[]> {
  if (!supabase) {
    throw new Error('Queue service is not available. Please check configuration.')
  }

  const { data, error } = await supabase.rpc('list_public_queues', {
    location_param: location === undefined ? null : location.trim(),
  })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(mapPublicQueue)
}

export async function joinQueue({
  name,
  phone,
  queueId,
}: JoinQueueInput): Promise<JoinedCustomer> {
  if (!supabase) {
    throw new Error('Queue service is not available. Please check configuration.')
  }

  const { data, error } = await supabase.rpc('join_queue_by_id', {
    customer_name_param: name,
    customer_phone_param: phone,
    queue_id_param: queueId,
  })

  if (error) {
    if (
      error.message.includes('schema cache') ||
      error.message.includes('Could not find the function')
    ) {
      throw new Error(
        'Queue joining is not set up in Supabase yet. Apply the latest database migration and try again.',
      )
    }

    throw new Error(error.message)
  }

  const joinedCustomer = data.at(0)

  if (!joinedCustomer) {
    throw new Error('Unable to join the queue. Please try again.')
  }

  return mapJoinedCustomer(joinedCustomer)
}

export async function getQueueLocations(): Promise<string[]> {
  if (!supabase) {
    throw new Error('Queue service is not available. Please check configuration.')
  }

  const { data, error } = await supabase.rpc('list_queue_locations')

  if (error) {
    throw new Error(error.message)
  }

  return data.map((row) => row.location)
}

export async function getMyQueues(): Promise<MyQueue[]> {
  if (!supabase) {
    throw new Error('Queue service is not available. Please check configuration.')
  }

  const { data, error } = await supabase.rpc('list_my_queues')

  if (error) {
    if (
      error.message.includes('schema cache') ||
      error.message.includes('Could not find the function')
    ) {
      throw new Error(
        'Your queues are not set up in Supabase yet. Apply the latest database migration and try again.',
      )
    }

    throw new Error(error.message)
  }

  return data.map(mapMyQueue)
}
