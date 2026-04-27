import { useCallback, useEffect, useState } from 'react'
import {
  getBusinessOnboardingRequests,
  createSubscriptionPlan,
  updateBusinessOnboardingRequestStatus,
  deleteBusiness,
  getBusinesses,
  getPlatformOverview,
  getSubscriptionPlans,
  saveBusiness,
  updateBusinessStatus,
  type BusinessStatus,
  type BusinessRecord,
  type BusinessOnboardingRequestRecord,
  type CreatePlanInput,
  type OnboardingRequestStatus,
  type PaymentStatus,
  type PlatformOverview,
  type SaveBusinessInput,
  type SubscriptionPlan,
} from '../services/supabase/superAdminService'

type BusinessFormState = {
  address: string
  businessEmail: string
  city: string
  country: string
  id: string | null
  latitude: number | null
  location: string
  longitude: number | null
  name: string
  ownerName: string
  paymentStatus: PaymentStatus
  phone: string
  planId: string
  province: string
  status: BusinessStatus
  trialEndsAt: string
}

type PlanFormState = {
  description: string
  monthlyPrice: string
  name: string
  queueLimit: string
  staffLimit: string
}

const emptyBusinessForm: BusinessFormState = {
  address: '',
  businessEmail: '',
  city: '',
  country: '',
  id: null,
  latitude: null,
  location: '',
  longitude: null,
  name: '',
  ownerName: '',
  paymentStatus: 'trial',
  phone: '',
  planId: '',
  province: '',
  status: 'pending',
  trialEndsAt: '',
}

const emptyPlanForm: PlanFormState = {
  description: '',
  monthlyPrice: '',
  name: '',
  queueLimit: '',
  staffLimit: '',
}

const emptyOverview: PlatformOverview = {
  activeBusinesses: 0,
  activeQueues: 0,
  suspendedBusinesses: 0,
  totalBusinesses: 0,
  totalCustomersServed: 0,
  totalQueues: 0,
}

function mapBusinessToFormState(business: BusinessRecord): BusinessFormState {
  return {
    address: business.address,
    businessEmail: business.businessEmail,
    city: business.city,
    country: business.country,
    id: business.id,
    latitude: business.latitude,
    location: business.location,
    longitude: business.longitude,
    name: business.name,
    ownerName: business.ownerName,
    paymentStatus: business.paymentStatus,
    phone: business.phone,
    planId: business.planId ?? '',
    province: business.province,
    status: business.status,
    trialEndsAt: business.trialEndsAt ?? '',
  }
}

function parseNullableNumber(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  return Number(trimmedValue)
}

export function useSuperAdminDashboard() {
  const [businessActionError, setBusinessActionError] = useState<string | null>(
    null,
  )
  const [businessForm, setBusinessForm] = useState<BusinessFormState>(
    emptyBusinessForm,
  )
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([])
  const [businessRequests, setBusinessRequests] = useState<
    BusinessOnboardingRequestRecord[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingBusiness, setIsSavingBusiness] = useState(false)
  const [isSavingPlan, setIsSavingPlan] = useState(false)
  const [isUpdatingRequest, setIsUpdatingRequest] = useState<string | null>(null)
  const [overview, setOverview] = useState<PlatformOverview>(emptyOverview)
  const [planActionError, setPlanActionError] = useState<string | null>(null)
  const [planForm, setPlanForm] = useState<PlanFormState>(emptyPlanForm)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])

  const refreshDashboard = useCallback(async () => {
    const [nextOverview, nextBusinesses, nextPlans, nextBusinessRequests] = await Promise.all([
      getPlatformOverview(),
      getBusinesses(),
      getSubscriptionPlans(),
      getBusinessOnboardingRequests(),
    ])

    setOverview(nextOverview)
    setBusinesses(nextBusinesses)
    setBusinessRequests(nextBusinessRequests)
    setPlans(nextPlans)
  }, [])

  useEffect(() => {
    let isMounted = true

    refreshDashboard()
      .catch((caughtError) => {
        if (!isMounted) {
          return
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load super admin data.'

        setBusinessActionError(message)
        setPlanActionError(message)
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [refreshDashboard])

  async function submitBusiness() {
    setIsSavingBusiness(true)
    setBusinessActionError(null)

    try {
      const payload: SaveBusinessInput = {
        address: businessForm.address,
        businessEmail: businessForm.businessEmail,
        city: businessForm.city,
        country: businessForm.country,
        id: businessForm.id ?? undefined,
        latitude: businessForm.latitude,
        location: businessForm.location,
        longitude: businessForm.longitude,
        name: businessForm.name,
        ownerName: businessForm.ownerName,
        paymentStatus: businessForm.paymentStatus,
        phone: businessForm.phone,
        planId: businessForm.planId || null,
        province: businessForm.province,
        status: businessForm.status,
        trialEndsAt: businessForm.trialEndsAt || null,
      }

      await saveBusiness(payload)
      await refreshDashboard()
      setBusinessForm(emptyBusinessForm)
      return true
    } catch (caughtError) {
      setBusinessActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to save business.',
      )
      return false
    } finally {
      setIsSavingBusiness(false)
    }
  }

  async function submitPlan() {
    setIsSavingPlan(true)
    setPlanActionError(null)

    try {
      const payload: CreatePlanInput = {
        description: planForm.description,
        monthlyPrice: Number(planForm.monthlyPrice || 0),
        name: planForm.name,
        queueLimit: parseNullableNumber(planForm.queueLimit),
        staffLimit: parseNullableNumber(planForm.staffLimit),
      }

      await createSubscriptionPlan(payload)
      await refreshDashboard()
      setPlanForm(emptyPlanForm)
      return true
    } catch (caughtError) {
      setPlanActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to create plan.',
      )
      return false
    } finally {
      setIsSavingPlan(false)
    }
  }

  async function changeBusinessStatus(businessId: string, status: BusinessStatus) {
    setBusinessActionError(null)

    try {
      await updateBusinessStatus(businessId, status)
      await refreshDashboard()
    } catch (caughtError) {
      setBusinessActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update business status.',
      )
    }
  }

  async function removeBusiness(businessId: string) {
    setBusinessActionError(null)

    try {
      await deleteBusiness(businessId)
      if (businessForm.id === businessId) {
        setBusinessForm(emptyBusinessForm)
      }
      await refreshDashboard()
    } catch (caughtError) {
      setBusinessActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to delete business.',
      )
    }
  }

  async function updateRequestStatus(
    requestId: string,
    status: OnboardingRequestStatus,
  ) {
    setBusinessActionError(null)
    setIsUpdatingRequest(requestId)

    try {
      await updateBusinessOnboardingRequestStatus({
        id: requestId,
        reviewedBy: null,
        status,
      })
      await refreshDashboard()
    } catch (caughtError) {
      setBusinessActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update business request.',
      )
    } finally {
      setIsUpdatingRequest(null)
    }
  }

  return {
    businessActionError,
    businessForm,
    businessRequests,
    businesses,
    changeBusinessStatus,
    editBusiness: (business: BusinessRecord) =>
      setBusinessForm(mapBusinessToFormState(business)),
    isLoading,
    isSavingBusiness,
    isSavingPlan,
    isUpdatingRequest,
    overview,
    planActionError,
    planForm,
    plans,
    removeBusiness,
    resetBusinessForm: () => {
      setBusinessActionError(null)
      setBusinessForm(emptyBusinessForm)
    },
    setBusinessForm,
    setPlanForm,
    submitBusiness,
    submitPlan,
    updateRequestStatus,
  }
}
