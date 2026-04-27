import { supabase } from './client'

export type BusinessStatus = 'active' | 'pending' | 'suspended' | 'trial'
export type PaymentStatus = 'overdue' | 'paid' | 'trial' | 'unpaid'

export type SubscriptionPlan = {
  description: string
  id: string
  isActive: boolean
  monthlyPrice: number
  name: string
  queueLimit: number | null
  staffLimit: number | null
}

export type OnboardingRequestStatus = 'approved' | 'contacted' | 'new'

export type BusinessRecord = {
  address: string
  businessEmail: string
  city: string
  country: string
  createdAt: string
  id: string
  latitude: number | null
  location: string
  longitude: number | null
  name: string
  ownerName: string
  paymentStatus: PaymentStatus
  phone: string
  planId: string | null
  planName: string | null
  province: string
  queueCount: number
  status: BusinessStatus
  totalCustomersServed: number
  trialEndsAt: string | null
}

export type BusinessOnboardingRequestRecord = {
  businessName: string
  createdAt: string
  email: string
  id: string
  location: string
  notes: string | null
  ownerName: string
  phone: string
  reviewedAt: string | null
  reviewedBy: string | null
  status: OnboardingRequestStatus
  updatedAt: string
}

export type PlatformOverview = {
  activeBusinesses: number
  activeQueues: number
  suspendedBusinesses: number
  totalBusinesses: number
  totalCustomersServed: number
  totalQueues: number
}

export type SaveBusinessInput = {
  address: string
  businessEmail: string
  city: string
  country: string
  id?: string
  latitude: number | null
  location: string
  longitude: number | null
  name: string
  ownerName: string
  paymentStatus: PaymentStatus
  phone: string
  planId: string | null
  province: string
  status: BusinessStatus
  trialEndsAt: string | null
}

export type CreatePlanInput = {
  description: string
  monthlyPrice: number
  name: string
  queueLimit: number | null
  staffLimit: number | null
}

export type UpdateOnboardingRequestStatusInput = {
  id: string
  reviewedBy: string | null
  status: OnboardingRequestStatus
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Super admin tools are not available. Please check configuration.')
  }

  return supabase
}

function mapSubscriptionPlan(row: {
  description: string
  id: string
  is_active: boolean
  monthly_price: number
  name: string
  queue_limit: number | null
  staff_limit: number | null
}): SubscriptionPlan {
  return {
    description: row.description,
    id: row.id,
    isActive: row.is_active,
    monthlyPrice: row.monthly_price,
    name: row.name,
    queueLimit: row.queue_limit,
    staffLimit: row.staff_limit,
  }
}

function normalizeDate(value: string | null) {
  if (!value) {
    return null
  }

  return value.slice(0, 10)
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('subscription_plans')
    .select('id, name, description, monthly_price, queue_limit, staff_limit, is_active')
    .order('monthly_price', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(mapSubscriptionPlan)
}

export async function createSubscriptionPlan(
  input: CreatePlanInput,
): Promise<SubscriptionPlan> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('subscription_plans')
    .insert({
      description: input.description.trim(),
      monthly_price: input.monthlyPrice,
      name: input.name.trim(),
      queue_limit: input.queueLimit,
      staff_limit: input.staffLimit,
    })
    .select('id, name, description, monthly_price, queue_limit, staff_limit, is_active')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapSubscriptionPlan(data)
}

export async function getBusinesses(): Promise<BusinessRecord[]> {
  const client = requireSupabase()
  const [{ data: businesses, error: businessesError }, { data: plans, error: plansError }, { data: queues, error: queuesError }, { data: customers, error: customersError }] =
    await Promise.all([
      client
        .from('businesses')
        .select(
          'id, name, business_email, owner_name, phone, location, address, latitude, longitude, city, province, country, subscription_plan_id, trial_ends_at, payment_status, status, created_at',
        )
        .order('created_at', { ascending: false }),
      client
        .from('subscription_plans')
        .select('id, name'),
      client
        .from('queues')
        .select('id, business_id'),
      client
        .from('customers')
        .select('queue_id, status'),
    ])

  if (businessesError) {
    throw new Error(businessesError.message)
  }

  if (plansError) {
    throw new Error(plansError.message)
  }

  if (queuesError) {
    throw new Error(queuesError.message)
  }

  if (customersError) {
    throw new Error(customersError.message)
  }

  const planNames = new Map(plans.map((plan) => [plan.id, plan.name]))
  const queueBusinessIds = new Map(queues.map((queue) => [queue.id, queue.business_id]))
  const queueCountByBusiness = new Map<string, number>()
  const activeQueueIds = new Set<string>()
  const servedCustomersByBusiness = new Map<string, number>()

  queues.forEach((queue) => {
    if (!queue.business_id) {
      return
    }

    queueCountByBusiness.set(
      queue.business_id,
      (queueCountByBusiness.get(queue.business_id) ?? 0) + 1,
    )
  })

  customers.forEach((customer) => {
    const businessId = queueBusinessIds.get(customer.queue_id)

    if (!businessId) {
      return
    }

    if (customer.status === 'waiting' || customer.status === 'serving') {
      activeQueueIds.add(customer.queue_id)
    }

    if (customer.status === 'done') {
      servedCustomersByBusiness.set(
        businessId,
        (servedCustomersByBusiness.get(businessId) ?? 0) + 1,
      )
    }
  })

  return businesses.map((business) => ({
    address: business.address,
    businessEmail: business.business_email,
    city: business.city,
    country: business.country,
    createdAt: business.created_at,
    id: business.id,
    latitude: business.latitude,
    location: business.location,
    longitude: business.longitude,
    name: business.name,
    ownerName: business.owner_name,
    paymentStatus: business.payment_status,
    phone: business.phone,
    planId: business.subscription_plan_id,
    planName: business.subscription_plan_id
      ? (planNames.get(business.subscription_plan_id) ?? null)
      : null,
    province: business.province,
    queueCount: queueCountByBusiness.get(business.id) ?? 0,
    status: business.status,
    totalCustomersServed: servedCustomersByBusiness.get(business.id) ?? 0,
    trialEndsAt: normalizeDate(business.trial_ends_at),
  }))
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const client = requireSupabase()
  const [{ count: totalBusinesses, error: businessesError }, { count: activeBusinesses, error: activeBusinessesError }, { count: suspendedBusinesses, error: suspendedBusinessesError }, { data: queues, error: queuesError }, { data: customers, error: customersError }] =
    await Promise.all([
      client.from('businesses').select('id', { count: 'exact', head: true }),
      client
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      client
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'suspended'),
      client
        .from('queues')
        .select('id'),
      client
        .from('customers')
        .select('queue_id, status'),
    ])

  if (businessesError || activeBusinessesError || suspendedBusinessesError) {
    throw new Error(
      businessesError?.message ||
        activeBusinessesError?.message ||
        suspendedBusinessesError?.message ||
        'Unable to load platform overview.',
    )
  }

  if (queuesError) {
    throw new Error(queuesError.message)
  }

  if (customersError) {
    throw new Error(customersError.message)
  }

  const activeQueueIds = new Set<string>()
  let totalCustomersServed = 0

  customers.forEach((customer) => {
    if (customer.status === 'done') {
      totalCustomersServed += 1
    }

    if (customer.status === 'waiting' || customer.status === 'serving') {
      activeQueueIds.add(customer.queue_id)
    }
  })

  return {
    activeBusinesses: activeBusinesses ?? 0,
    activeQueues: activeQueueIds.size,
    suspendedBusinesses: suspendedBusinesses ?? 0,
    totalBusinesses: totalBusinesses ?? 0,
    totalCustomersServed,
    totalQueues: queues.length,
  }
}

export async function getBusinessOnboardingRequests(): Promise<
  BusinessOnboardingRequestRecord[]
> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('business_onboarding_requests')
    .select(
      'id, business_name, owner_name, email, phone, location, notes, status, reviewed_at, reviewed_by, created_at, updated_at',
    )
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data.map((request) => ({
    businessName: request.business_name,
    createdAt: request.created_at,
    email: request.email,
    id: request.id,
    location: request.location,
    notes: request.notes,
    ownerName: request.owner_name,
    phone: request.phone,
    reviewedAt: request.reviewed_at,
    reviewedBy: request.reviewed_by,
    status: request.status,
    updatedAt: request.updated_at,
  }))
}

export async function updateBusinessOnboardingRequestStatus(
  input: UpdateOnboardingRequestStatusInput,
): Promise<void> {
  const client = requireSupabase()
  const now = new Date().toISOString()
  const { error } = await client
    .from('business_onboarding_requests')
    .update({
      reviewed_at: input.status === 'new' ? null : now,
      reviewed_by: input.status === 'new' ? null : input.reviewedBy,
      status: input.status,
      updated_at: now,
    })
    .eq('id', input.id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function saveBusiness(
  input: SaveBusinessInput,
): Promise<void> {
  const client = requireSupabase()
  const payload = {
    address: input.address.trim(),
    business_email: input.businessEmail.trim(),
    city: input.city.trim(),
    country: input.country.trim(),
    latitude: input.latitude,
    location: input.location.trim(),
    longitude: input.longitude,
    name: input.name.trim(),
    owner_name: input.ownerName.trim(),
    payment_status: input.paymentStatus,
    phone: input.phone.trim(),
    province: input.province.trim(),
    status: input.status,
    subscription_plan_id: input.planId,
    trial_ends_at: input.trialEndsAt ? `${input.trialEndsAt}T00:00:00Z` : null,
    updated_at: new Date().toISOString(),
  }

  const query = input.id
    ? client.from('businesses').update(payload).eq('id', input.id)
    : client.from('businesses').insert(payload)

  const { error } = await query

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateBusinessStatus(
  businessId: string,
  status: BusinessStatus,
): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from('businesses')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', businessId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteBusiness(businessId: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('businesses').delete().eq('id', businessId)

  if (error) {
    throw new Error(error.message)
  }
}
