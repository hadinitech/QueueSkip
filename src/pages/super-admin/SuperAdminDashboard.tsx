import type { User } from '@supabase/supabase-js'
import { useState } from 'react'
import { AppLoader } from '../../components/ui/AppLoader'
import { Button } from '../../components/ui/Button'
import { FullPageLoader } from '../../components/ui/FullPageLoader'
import { PlaceAutocompleteInput } from '../../components/ui/PlaceAutocompleteInput'
import { SelectInput } from '../../components/ui/SelectInput'
import { StatCard } from '../../components/ui/StatCard'
import { TextArea } from '../../components/ui/TextArea'
import { TextInput } from '../../components/ui/TextInput'
import { useSuperAdminDashboard } from '../../hooks/useSuperAdminDashboard'

type SuperAdminDashboardProps = {
  user: User | null
}

type SuperAdminTab = 'businesses' | 'overview' | 'plans' | 'requests'

const businessStatusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Trial', value: 'trial' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
] as const

const paymentStatusOptions = [
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Trial', value: 'trial' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
] as const

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(value)
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('overview')
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const displayName =
    typeof user?.user_metadata.full_name === 'string' &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name
      : user?.email || 'Super Admin'
  const {
    businessActionError,
    businessForm,
    businessRequests,
    businesses,
    changeBusinessStatus,
    editBusiness,
    isLoading,
    isSavingBusiness,
    isSavingPlan,
    isUpdatingRequest,
    overview,
    planActionError,
    planForm,
    plans,
    removeBusiness,
    resetBusinessForm,
    setBusinessForm,
    setPlanForm,
    submitBusiness,
    submitPlan,
    updateRequestStatus,
  } = useSuperAdminDashboard()
  const openNewBusinessModal = () => {
    resetBusinessForm()
    setIsBusinessModalOpen(true)
  }
  const openEditBusinessModal = () => {
    setIsBusinessModalOpen(true)
  }
  const getTabClassName = (tab: SuperAdminTab) => {
    const baseClassName =
      'flex w-full items-center justify-between rounded-lg border-l-4 px-4 py-3 text-left text-sm font-bold transition'

    if (activeTab === tab) {
      return `${baseClassName} border-[var(--color-accent)] bg-white text-[var(--color-primary)] shadow-lg shadow-black/10`
    }

    return `${baseClassName} border-transparent bg-white/5 text-white/75 hover:bg-white/15 hover:text-white`
  }

  if (isLoading) {
    return <FullPageLoader />
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:py-12 lg:h-[calc(100vh-5rem)] lg:py-0">
      <div className="overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-slate-300/50 ring-1 ring-white/70 lg:grid lg:h-full lg:grid-cols-[18rem_1fr]">
        <aside className="flex flex-col justify-between overflow-hidden bg-[var(--color-primary)] p-6 text-white lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]">
          <div>
            <p className="text-xs font-black uppercase text-white/50">
              Signed in as
            </p>
            <p className="mt-2 break-words text-xl font-black leading-tight">
              {displayName}
            </p>

            <nav aria-label="Super admin workspace" className="mt-10 flex flex-col gap-2">
              <button
                className={getTabClassName('overview')}
                onClick={() => setActiveTab('overview')}
                type="button"
              >
                <span>Overview</span>
                <span className="text-xs text-white/50">Live</span>
              </button>
              <button
                className={getTabClassName('businesses')}
                onClick={() => setActiveTab('businesses')}
                type="button"
              >
                <span>Businesses</span>
                <span className="rounded-full bg-white/15 px-2 py-1 text-xs text-white">
                  {businesses.length}
                </span>
              </button>
              <button
                className={getTabClassName('requests')}
                onClick={() => setActiveTab('requests')}
                type="button"
              >
                <span>Requests</span>
                <span className="rounded-full bg-white/15 px-2 py-1 text-xs text-white">
                  {businessRequests.length}
                </span>
              </button>
              <button
                className={getTabClassName('plans')}
                onClick={() => setActiveTab('plans')}
                type="button"
              >
                <span>Plans</span>
                <span className="rounded-full bg-white/15 px-2 py-1 text-xs text-white">
                  {plans.length}
                </span>
              </button>
            </nav>
          </div>
        </aside>

        <div className="scrollbar-hidden flex min-h-0 flex-col gap-8 p-5 sm:p-8 lg:h-full lg:overflow-y-auto lg:p-10">
          {activeTab === 'overview' && (
            <section className="flex flex-col gap-6">
              <header className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                  Platform control
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--color-primary)]">
                  Super admin workspace
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  Manage client onboarding, assign subscription plans, and monitor queue usage
                  across the platform from one place.
                </p>
              </header>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Total businesses" value={String(overview.totalBusinesses)} />
                <StatCard label="Active businesses" value={String(overview.activeBusinesses)} />
                <StatCard
                  label="Suspended businesses"
                  value={String(overview.suspendedBusinesses)}
                />
                <StatCard label="Total queues" value={String(overview.totalQueues)} />
                <StatCard label="Active queues" value={String(overview.activeQueues)} />
                <StatCard
                  label="Customers served"
                  tone="accent"
                  value={String(overview.totalCustomersServed)}
                />
              </div>

              <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                      Usage per business
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                      Business activity snapshot
                    </h2>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  {isLoading && (
                    <div className="rounded-3xl bg-slate-50 p-6">
                      <AppLoader label="Loading platform activity..." />
                    </div>
                  )}

                  {!isLoading &&
                    businesses.map((business) => (
                      <article
                        className="grid gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr]"
                        key={business.id}
                      >
                        <div>
                          <h3 className="font-black text-slate-950">{business.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {business.ownerName} · {business.businessEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Status
                          </p>
                          <p className="mt-2 text-sm font-bold capitalize text-[var(--color-primary)]">
                            {business.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Queues
                          </p>
                          <p className="mt-2 text-sm font-bold text-[var(--color-primary)]">
                            {business.queueCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Served
                          </p>
                          <p className="mt-2 text-sm font-bold text-[var(--color-primary)]">
                            {business.totalCustomersServed}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              </section>
            </section>
          )}

          {activeTab === 'businesses' && (
            <section className="flex flex-col gap-6">
              <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                      Client list
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                      Onboarded businesses
                    </h2>
                  </div>
                  <Button onClick={openNewBusinessModal} type="button" variant="secondary">
                    Add business
                  </Button>
                </div>

                {businessActionError && (
                  <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                    {businessActionError}
                  </p>
                )}

                <div className="mt-5 flex flex-col gap-3">
                  {isLoading && (
                    <div className="rounded-3xl bg-slate-50 p-6">
                      <AppLoader label="Loading businesses..." />
                    </div>
                  )}

                  {!isLoading && businesses.length === 0 && (
                    <p className="rounded-3xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                      No businesses have been onboarded yet.
                    </p>
                  )}

                  {!isLoading &&
                    businesses.map((business) => (
                      <article
                        className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
                        key={business.id}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-black text-slate-950">
                                {business.name}
                              </h3>
                              <span className="rounded-full bg-[var(--color-secondary)]/10 px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">
                                {business.status}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              {business.ownerName} · {business.businessEmail}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {business.location} · {business.phone}
                            </p>
                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                              Plan: {business.planName || 'Unassigned'} · Payment:{' '}
                              {business.paymentStatus}
                            </p>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Button
                              onClick={() => {
                                editBusiness(business)
                                openEditBusinessModal()
                              }}
                              type="button"
                              variant="outline"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() =>
                                void changeBusinessStatus(
                                  business.id,
                                  business.status === 'suspended' ? 'active' : 'suspended',
                                )
                              }
                              type="button"
                              variant={business.status === 'suspended' ? 'secondary' : 'danger'}
                            >
                              {business.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </Button>
                            <Button
                              onClick={() => void changeBusinessStatus(business.id, 'active')}
                              type="button"
                              variant="primary"
                            >
                              Mark active
                            </Button>
                            <Button
                              onClick={() => void removeBusiness(business.id)}
                              type="button"
                              variant="danger"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                              Queues
                            </p>
                            <p className="mt-2 text-lg font-black text-[var(--color-primary)]">
                              {business.queueCount}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                              Served
                            </p>
                            <p className="mt-2 text-lg font-black text-[var(--color-primary)]">
                              {business.totalCustomersServed}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                              Trial ends
                            </p>
                            <p className="mt-2 text-lg font-black text-[var(--color-primary)]">
                              {business.trialEndsAt || 'Not set'}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              </section>
            </section>
          )}

          {activeTab === 'requests' && (
            <section className="flex flex-col gap-6">
              <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                      New business leads
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                      Onboarding requests
                    </h2>
                  </div>
                </div>

                {businessActionError && (
                  <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                    {businessActionError}
                  </p>
                )}

                <div className="mt-5 flex flex-col gap-3">
                  {!isLoading && businessRequests.length === 0 && (
                    <p className="rounded-3xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                      No onboarding requests yet.
                    </p>
                  )}

                  {businessRequests.map((request) => (
                    <article
                      className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                      key={request.id}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black text-slate-950">
                              {request.businessName}
                            </h3>
                            <span className="rounded-full bg-[var(--color-secondary)]/10 px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">
                              {request.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {request.ownerName} · {request.email}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {request.location} · {request.phone}
                          </p>
                          {request.notes && (
                            <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600 ring-1 ring-slate-100">
                              {request.notes}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                          <Button
                            disabled={isUpdatingRequest === request.id}
                            onClick={() => void updateRequestStatus(request.id, 'contacted')}
                            type="button"
                            variant="outline"
                          >
                            Contacted
                          </Button>
                          <Button
                            disabled={isUpdatingRequest === request.id}
                            onClick={() => void updateRequestStatus(request.id, 'approved')}
                            type="button"
                            variant="secondary"
                          >
                            Approve
                          </Button>
                          <Button
                            disabled={isUpdatingRequest === request.id}
                            onClick={() => void updateRequestStatus(request.id, 'new')}
                            type="button"
                            variant="primary"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Submitted
                          </p>
                          <p className="mt-2 text-sm font-bold text-[var(--color-primary)]">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Last updated
                          </p>
                          <p className="mt-2 text-sm font-bold text-[var(--color-primary)]">
                            {new Date(request.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </section>
          )}

          {activeTab === 'plans' && (
            <section className="flex flex-col gap-6">
              <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                      Available plans
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                      Subscription catalog
                    </h2>
                  </div>
                  <Button
                    onClick={() => setIsPlanModalOpen(true)}
                    type="button"
                    variant="secondary"
                  >
                    Add plan
                  </Button>
                </div>

                {planActionError && (
                  <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                    {planActionError}
                  </p>
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {isLoading && (
                    <div className="rounded-3xl bg-slate-50 p-6 md:col-span-2">
                      <AppLoader label="Loading plans..." />
                    </div>
                  )}

                  {!isLoading && plans.length === 0 && (
                    <p className="rounded-3xl bg-slate-50 p-5 text-sm font-semibold text-slate-500 md:col-span-2">
                      No plans have been created yet.
                    </p>
                  )}

                  {!isLoading &&
                    plans.map((plan) => (
                      <article
                        className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                        key={plan.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-black text-slate-950">{plan.name}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {plan.description}
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)] ring-1 ring-slate-200">
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="mt-4 text-3xl font-black tracking-tight text-[var(--color-primary)]">
                          {formatCurrency(plan.monthlyPrice)}
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                              Queue limit
                            </p>
                            <p className="mt-2 text-lg font-black text-[var(--color-primary)]">
                              {plan.queueLimit ?? 'Unlimited'}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                              Staff limit
                            </p>
                            <p className="mt-2 text-lg font-black text-[var(--color-primary)]">
                              {plan.staffLimit ?? 'Unlimited'}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              </section>
            </section>
          )}
        </div>
      </div>

      {isBusinessModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="scrollbar-hidden max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-100 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                  Onboarding
                </p>
                <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                  {businessForm.id ? 'Edit business' : 'Add business'}
                </h2>
              </div>
              <button
                aria-label="Close add business dialog"
                className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-xl font-black text-[var(--color-primary)]"
                onClick={() => {
                  setIsBusinessModalOpen(false)
                  resetBusinessForm()
                }}
                type="button"
              >
                X
              </button>
            </div>

            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault()
                void submitBusiness().then((wasSuccessful) => {
                  if (!wasSuccessful) {
                    return
                  }

                  setIsBusinessModalOpen(false)
                })
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput
                  label="Business name"
                  name="businessName"
                  onChange={(value) =>
                    setBusinessForm((current) => ({ ...current, name: value }))
                  }
                  placeholder="QueueSkip Salon"
                  required
                  value={businessForm.name}
                />
                <TextInput
                  label="Business email"
                  name="businessEmail"
                  onChange={(value) =>
                    setBusinessForm((current) => ({
                      ...current,
                      businessEmail: value,
                    }))
                  }
                  placeholder="owner@business.com"
                  required
                  type="email"
                  value={businessForm.businessEmail}
                />
                <TextInput
                  label="Owner name"
                  name="ownerName"
                  onChange={(value) =>
                    setBusinessForm((current) => ({ ...current, ownerName: value }))
                  }
                  placeholder="Nomsa Dlamini"
                  required
                  value={businessForm.ownerName}
                />
                <TextInput
                  label="Phone number"
                  name="phone"
                  onChange={(value) =>
                    setBusinessForm((current) => ({ ...current, phone: value }))
                  }
                  placeholder="+27123456789"
                  required
                  type="tel"
                  value={businessForm.phone}
                />
                <div className="md:col-span-2">
                  <PlaceAutocompleteInput
                    helperText="Search the business address and select the correct result."
                    label="Business address"
                    onPlaceSelected={(place) =>
                      setBusinessForm((current) => ({
                        ...current,
                        address: place.address,
                        city: place.city,
                        country: place.country,
                        latitude: place.latitude,
                        location: place.city || place.province || place.country,
                        longitude: place.longitude,
                        province: place.province,
                      }))
                    }
                    placeholder="Search business address"
                    value={businessForm.address}
                  />
                </div>
                <TextInput
                  label="City / area label"
                  name="location"
                  onChange={(value) =>
                    setBusinessForm((current) => ({ ...current, location: value }))
                  }
                  placeholder="Johannesburg"
                  required
                  value={businessForm.location}
                />
                <TextInput
                  label="City"
                  name="city"
                  onChange={(value) =>
                    setBusinessForm((current) => ({ ...current, city: value }))
                  }
                  placeholder="Johannesburg"
                  value={businessForm.city}
                />
                <TextInput
                  label="Province"
                  name="province"
                  onChange={(value) =>
                    setBusinessForm((current) => ({ ...current, province: value }))
                  }
                  placeholder="Gauteng"
                  value={businessForm.province}
                />
                <TextInput
                  label="Country"
                  name="country"
                  onChange={(value) =>
                    setBusinessForm((current) => ({ ...current, country: value }))
                  }
                  placeholder="South Africa"
                  value={businessForm.country}
                />
                <TextInput
                  label="Trial end date"
                  name="trialEndsAt"
                  onChange={(value) =>
                    setBusinessForm((current) => ({
                      ...current,
                      trialEndsAt: value,
                    }))
                  }
                  placeholder="YYYY-MM-DD"
                  type="date"
                  value={businessForm.trialEndsAt}
                />
                <SelectInput
                  label="Business status"
                  name="status"
                  onChange={(value) =>
                    setBusinessForm((current) => ({
                      ...current,
                      status: value as (typeof businessStatusOptions)[number]['value'],
                    }))
                  }
                  options={businessStatusOptions.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  placeholder="Choose status"
                  required
                  value={businessForm.status}
                />
                <SelectInput
                  label="Payment status"
                  name="paymentStatus"
                  onChange={(value) =>
                    setBusinessForm((current) => ({
                      ...current,
                      paymentStatus:
                        value as (typeof paymentStatusOptions)[number]['value'],
                    }))
                  }
                  options={paymentStatusOptions.map((option) => ({
                    label: option.label,
                    value: option.value,
                  }))}
                  placeholder="Choose payment status"
                  required
                  value={businessForm.paymentStatus}
                />
              </div>

              <div className="mt-4">
                <SelectInput
                  disabled={plans.length === 0}
                  label="Subscription plan (optional)"
                  name="planId"
                  onChange={(value) =>
                    setBusinessForm((current) => ({ ...current, planId: value }))
                  }
                  options={plans.map((plan) => ({
                    label: `${plan.name} · ${formatCurrency(plan.monthlyPrice)}`,
                    value: plan.id,
                  }))}
                  placeholder={
                    plans.length === 0 ? 'Create a plan first' : 'Choose a plan'
                  }
                  value={businessForm.planId}
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <TextInput
                  disabled
                  label="Latitude"
                  name="latitude"
                  placeholder="Auto-filled from location search"
                  value={
                    businessForm.latitude === null
                      ? ''
                      : String(businessForm.latitude)
                  }
                />
                <TextInput
                  disabled
                  label="Longitude"
                  name="longitude"
                  placeholder="Auto-filled from location search"
                  value={
                    businessForm.longitude === null
                      ? ''
                      : String(businessForm.longitude)
                  }
                />
              </div>

              {businessActionError && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                  {businessActionError}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button disabled={isSavingBusiness} type="submit" variant="secondary">
                  {isSavingBusiness
                    ? 'Saving...'
                    : businessForm.id
                      ? 'Update business'
                      : 'Add business'}
                </Button>
                <Button
                  onClick={() => {
                    setIsBusinessModalOpen(false)
                    resetBusinessForm()
                  }}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPlanModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="scrollbar-hidden max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-100 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                  Subscription setup
                </p>
                <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                  Create plan
                </h2>
              </div>
              <button
                aria-label="Close add plan dialog"
                className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-xl font-black text-[var(--color-primary)]"
                onClick={() => {
                  setIsPlanModalOpen(false)
                  setPlanForm({
                    description: '',
                    monthlyPrice: '',
                    name: '',
                    queueLimit: '',
                    staffLimit: '',
                  })
                }}
                type="button"
              >
                X
              </button>
            </div>

            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault()
                void submitPlan().then((wasSuccessful) => {
                  if (!wasSuccessful) {
                    return
                  }

                  setIsPlanModalOpen(false)
                })
              }}
            >
              <div className="grid gap-4">
                <TextInput
                  label="Plan name"
                  name="planName"
                  onChange={(value) =>
                    setPlanForm((current) => ({ ...current, name: value }))
                  }
                  placeholder="Growth"
                  required
                  value={planForm.name}
                />
                <TextArea
                  label="Description"
                  name="description"
                  onChange={(value) =>
                    setPlanForm((current) => ({
                      ...current,
                      description: value,
                    }))
                  }
                  placeholder="Best for growing queue-heavy businesses."
                  required
                  value={planForm.description}
                />
                <div className="grid gap-4 md:grid-cols-3">
                  <TextInput
                    label="Monthly price"
                    name="monthlyPrice"
                    onChange={(value) =>
                      setPlanForm((current) => ({
                        ...current,
                        monthlyPrice: value,
                      }))
                    }
                    placeholder="199"
                    required
                    type="number"
                    value={planForm.monthlyPrice}
                  />
                  <TextInput
                    label="Queue limit"
                    name="queueLimit"
                    onChange={(value) =>
                      setPlanForm((current) => ({
                        ...current,
                        queueLimit: value,
                      }))
                    }
                    placeholder="10"
                    type="number"
                    value={planForm.queueLimit}
                  />
                  <TextInput
                    label="Staff limit"
                    name="staffLimit"
                    onChange={(value) =>
                      setPlanForm((current) => ({
                        ...current,
                        staffLimit: value,
                      }))
                    }
                    placeholder="20"
                    type="number"
                    value={planForm.staffLimit}
                  />
                </div>
              </div>

              {planActionError && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                  {planActionError}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <Button disabled={isSavingPlan} type="submit" variant="secondary">
                  {isSavingPlan ? 'Saving...' : 'Create plan'}
                </Button>
                <Button
                  onClick={() => {
                    setIsPlanModalOpen(false)
                    setPlanForm({
                      description: '',
                      monthlyPrice: '',
                      name: '',
                      queueLimit: '',
                      staffLimit: '',
                    })
                  }}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
