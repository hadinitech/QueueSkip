import { supabase } from './client'
import type { CustomerStatus, ProfileRole } from './database.types'

export type AdminQueue = {
  createdAt: string
  description: string
  estimatedWaitMinutes: number
  id: string
  lunchTime: string
  location: string
  name: string
  title: string
}

export type AdminQueueCustomer = {
  createdAt: string
  id: string
  name: string
  phone: string
  position: number
  queueId?: string
  queueName?: string
  status: CustomerStatus
}

export type CreateQueueInput = {
  description: string
  estimatedWaitMinutes: number
  lunchTime: string
  location: string
  name: string
  title: string
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Queue management is not available. Please check configuration.')
  }

  return supabase
}

type BusinessAccessProfile = {
  businessId: string | null
  profileLocation: string
  role: 'business' | 'super_admin'
  userId: string
}

function isBusinessRole(
  role: ProfileRole,
): role is BusinessAccessProfile['role'] {
  return ['business', 'super_admin'].includes(role)
}

async function getCurrentBusinessAccessProfile(): Promise<BusinessAccessProfile> {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('You must be logged in with a business account.')
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('business_id, location, role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (!profile || !isBusinessRole(profile.role)) {
    throw new Error('You do not have access to the business dashboard.')
  }

  return {
    businessId: profile.business_id,
    profileLocation: profile.location ?? '',
    role: profile.role,
    userId: data.user.id,
  }
}

async function assertOwnsQueue(queueId: string): Promise<void> {
  const client = requireSupabase()
  const accessProfile = await getCurrentBusinessAccessProfile()
  const { data, error } = await client
    .from('queues')
    .select('id')
    .eq('id', queueId)
    .or(
      accessProfile.businessId
        ? `business_id.eq.${accessProfile.businessId},owner_id.eq.${accessProfile.userId}`
        : `owner_id.eq.${accessProfile.userId}`,
    )
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('You do not have access to this queue.')
  }
}

function mapAdminQueue(row: {
  created_at: string
  description: string
  estimated_wait_minutes: number
  id: string
  lunch_time: string
  location: string
  name: string
  title: string
}): AdminQueue {
  return {
    createdAt: row.created_at,
    description: row.description,
    estimatedWaitMinutes: row.estimated_wait_minutes,
    id: row.id,
    lunchTime: row.lunch_time,
    location: row.location,
    name: row.name,
    title: row.title,
  }
}

function mapAdminQueueCustomer(row: {
  created_at: string
  id: string
  name: string
  phone: string
  position: number
  queue_id?: string
  queue_name?: string
  status: CustomerStatus
}): AdminQueueCustomer {
  return {
    createdAt: row.created_at,
    id: row.id,
    name: row.name,
    phone: row.phone,
    position: row.position,
    queueId: row.queue_id,
    queueName: row.queue_name,
    status: row.status,
  }
}

export async function getAdminQueues(): Promise<AdminQueue[]> {
  const client = requireSupabase()
  const accessProfile = await getCurrentBusinessAccessProfile()
  let query = client
    .from('queues')
    .select(
      'id, name, title, description, lunch_time, location, estimated_wait_minutes, created_at',
    )
    .order('created_at', { ascending: false })

  query =
    accessProfile.businessId
      ? query.eq('business_id', accessProfile.businessId)
      : query.eq('owner_id', accessProfile.userId)

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data.map(mapAdminQueue)
}

export async function getAdminDefaultQueueLocation(): Promise<string> {
  const client = requireSupabase()
  const accessProfile = await getCurrentBusinessAccessProfile()

  if (!accessProfile.businessId) {
    return accessProfile.profileLocation.trim()
  }

  const { data, error } = await client
    .from('businesses')
    .select('address, location, city, province, country')
    .eq('id', accessProfile.businessId)
    .maybeSingle()

  if (error) {
    return accessProfile.profileLocation.trim()
  }

  if (!data) {
    return accessProfile.profileLocation.trim()
  }

  return (
    data.address ||
    data.location ||
    data.city ||
    data.province ||
    data.country ||
    accessProfile.profileLocation ||
    ''
  )
}

async function resolveQueueLocationForBusiness(): Promise<string> {
  return getAdminDefaultQueueLocation()
}

export async function createAdminQueue({
  description,
  estimatedWaitMinutes,
  lunchTime,
  location,
  name,
  title,
}: CreateQueueInput): Promise<AdminQueue> {
  const client = requireSupabase()
  const accessProfile = await getCurrentBusinessAccessProfile()
  const resolvedLocation = location.trim()
    ? location.trim()
    : await resolveQueueLocationForBusiness()

  const { data, error } = await client
    .from('queues')
    .insert({
      business_id: accessProfile.businessId,
      description: description.trim(),
      estimated_wait_minutes: estimatedWaitMinutes,
      lunch_time: lunchTime.trim(),
      location: resolvedLocation,
      name: name.trim(),
      owner_id: accessProfile.userId,
      title: title.trim(),
    })
    .select(
      'id, name, title, description, lunch_time, location, estimated_wait_minutes, created_at',
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapAdminQueue(data)
}

export async function getQueueCustomers(
  queueId: string,
): Promise<AdminQueueCustomer[]> {
  const client = requireSupabase()
  await assertOwnsQueue(queueId)

  const { data, error } = await client
    .from('customers')
    .select('id, name, phone, position, status, created_at')
    .eq('queue_id', queueId)
    .in('status', ['waiting', 'serving'])
    .order('position', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(mapAdminQueueCustomer)
}

export async function getAllActiveQueueCustomers(): Promise<
  AdminQueueCustomer[]
> {
  const client = requireSupabase()
  const accessProfile = await getCurrentBusinessAccessProfile()
  let query = client
    .from('customers')
    .select(
      'id, name, phone, queue_id, position, status, created_at, queues!inner(name, owner_id, business_id)',
    )
    .in('status', ['waiting', 'serving'])
    .order('created_at', { ascending: false })

  query =
    accessProfile.businessId
      ? query.eq('queues.business_id', accessProfile.businessId)
      : query.eq('queues.owner_id', accessProfile.userId)

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data.map((row) => {
    const queue = Array.isArray(row.queues) ? row.queues[0] : row.queues

    return mapAdminQueueCustomer({
      created_at: row.created_at,
      id: row.id,
      name: row.name,
      phone: row.phone,
      position: row.position,
      queue_id: row.queue_id,
      queue_name: queue?.name,
      status: row.status,
    })
  })
}

export async function markNextCustomerServing(
  queueId: string,
): Promise<AdminQueueCustomer | null> {
  const client = requireSupabase()
  await assertOwnsQueue(queueId)

  const { error: doneError } = await client
    .from('customers')
    .update({ status: 'done' })
    .eq('queue_id', queueId)
    .eq('status', 'serving')

  if (doneError) {
    throw new Error(doneError.message)
  }

  const { data: nextCustomer, error: nextCustomerError } = await client
    .from('customers')
    .select('id, name, phone, position, status, created_at')
    .eq('queue_id', queueId)
    .eq('status', 'waiting')
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (nextCustomerError) {
    throw new Error(nextCustomerError.message)
  }

  if (!nextCustomer) {
    return null
  }

  const { data, error } = await client
    .from('customers')
    .update({ status: 'serving' })
    .eq('id', nextCustomer.id)
    .select('id, name, phone, position, status, created_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapAdminQueueCustomer(data)
}

export async function markCustomerServing(
  customerId: string,
): Promise<AdminQueueCustomer> {
  const client = requireSupabase()
  const accessProfile = await getCurrentBusinessAccessProfile()
  const { data: customer, error: customerError } = await client
    .from('customers')
    .select('id, queue_id, queues!inner(owner_id, business_id)')
    .eq('id', customerId)
    .single()

  if (customerError) {
    throw new Error(customerError.message)
  }

  const customerQueue = Array.isArray(customer.queues)
    ? customer.queues[0]
    : customer.queues

  const hasAccess =
    customerQueue?.owner_id === accessProfile.userId ||
    (accessProfile.businessId !== null &&
      customerQueue?.business_id === accessProfile.businessId)

  if (!hasAccess) {
    throw new Error('You do not have access to this customer.')
  }

  let adminQueuesQuery = client
    .from('queues')
    .select('id')

  adminQueuesQuery =
    accessProfile.businessId
      ? adminQueuesQuery.eq('business_id', accessProfile.businessId)
      : adminQueuesQuery.eq('owner_id', accessProfile.userId)

  const { data: adminQueues, error: queuesError } = await adminQueuesQuery

  if (queuesError) {
    throw new Error(queuesError.message)
  }

  const adminQueueIds = adminQueues.map((queue) => queue.id)

  if (adminQueueIds.length > 0) {
    const { error: doneError } = await client
      .from('customers')
      .update({ status: 'done' })
      .in('queue_id', adminQueueIds)
      .eq('status', 'serving')

    if (doneError) {
      throw new Error(doneError.message)
    }
  }

  const { data, error } = await client
    .from('customers')
    .update({ status: 'serving' })
    .eq('id', customer.id)
    .select('id, name, phone, queue_id, position, status, created_at')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapAdminQueueCustomer(data)
}

export async function removeQueueCustomer(customerId: string): Promise<void> {
  const client = requireSupabase()
  const accessProfile = await getCurrentBusinessAccessProfile()
  const { data: customer, error: customerError } = await client
    .from('customers')
    .select('id, queues!inner(owner_id, business_id)')
    .eq('id', customerId)
    .single()

  if (customerError) {
    throw new Error(customerError.message)
  }

  const customerQueue = Array.isArray(customer.queues)
    ? customer.queues[0]
    : customer.queues

  const hasAccess =
    customerQueue?.owner_id === accessProfile.userId ||
    (accessProfile.businessId !== null &&
      customerQueue?.business_id === accessProfile.businessId)

  if (!customer || !hasAccess) {
    throw new Error('You do not have access to this customer.')
  }

  const { error } = await client
    .from('customers')
    .update({ status: 'done' })
    .eq('id', customerId)

  if (error) {
    throw new Error(error.message)
  }
}
