import type { ProfileRole } from '../../services/supabase/database.types'
import type { User } from '@supabase/supabase-js'
import { useState } from 'react'
import { FullPageLoader } from '../../components/ui/FullPageLoader'
import { useNearbyQueueDiscovery } from '../../hooks/useNearbyQueueDiscovery'
import { useMyQueues } from '../../hooks/useMyQueues'
import { usePublicQueues } from '../../hooks/usePublicQueues'
import type { QueueType } from '../../types/queue'
import { CustomerQueueDetail } from './components/CustomerQueueDetail'
import { MyQueuesPanel } from './components/MyQueuesPanel'
import { QueueTypeSelection } from './components/QueueTypeSelection'

type CustomerPageProps = {
  isAuthenticated: boolean
  isMobileNavOpen: boolean
  mode: 'dashboard' | 'public'
  onCloseMobileNav: () => void
  onLogout: () => void
  onNavigate: (pathname: string) => void
  profileLocation: string | null
  profileRole: ProfileRole | null
  user: User | null
}

export function CustomerPage({
  isAuthenticated,
  isMobileNavOpen,
  mode,
  onCloseMobileNav,
  onLogout,
  onNavigate,
  profileLocation,
  profileRole,
  user,
}: CustomerPageProps) {
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false)
  const { error, isLoading, queues } = usePublicQueues()
  const [myQueuesRefreshKey, setMyQueuesRefreshKey] = useState(0)
  const [selectedQueueType, setSelectedQueueType] = useState<QueueType | null>(
    null,
  )
  const myQueues = useMyQueues(myQueuesRefreshKey, isAuthenticated)
  const nearbyQueueDiscovery = useNearbyQueueDiscovery(queues, {
    initialLocationQuery:
      isAuthenticated && profileRole === 'customer' ? profileLocation : null,
  })
  const shouldBypassLocationFiltering =
    !isAuthenticated || (isAuthenticated && profileRole !== null && profileRole !== 'customer')
  const publicQueues = shouldBypassLocationFiltering
    ? queues
    : nearbyQueueDiscovery.nearbyQueues
  const shouldShowCustomerLocationPrompt =
    isAuthenticated &&
    profileRole === 'customer' &&
    mode === 'public' &&
    !shouldBypassLocationFiltering &&
    nearbyQueueDiscovery.locationSource !== 'live'
  const customerName =
    typeof user?.user_metadata.full_name === 'string' &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name
      : user?.email || 'Customer'

  function handleSelectQueue(queueType: QueueType) {
    if (!isAuthenticated) {
      onNavigate('/login')
      return
    }

    setSelectedQueueType(queueType)
  }

  if (!isAuthenticated && selectedQueueType) {
    return (
      <CustomerQueueDetail
        onBack={() => setSelectedQueueType(null)}
        queueType={selectedQueueType}
      />
    )
  }

  if (!isAuthenticated) {
    if (isLoading) {
      return <FullPageLoader />
    }

    return (
      <QueueTypeSelection
        error={error}
        isLoading={isLoading}
        isLocating={false}
        locationError={null}
        locationLabel={undefined}
        locationSource={null}
        onAreaSelected={undefined}
        onRequestLocation={undefined}
        onSelectQueue={handleSelectQueue}
        queues={publicQueues}
        searchQuery=""
        watchState="idle"
      />
    )
  }

  if (mode === 'public') {
    if (isLoading) {
      return <FullPageLoader />
    }

    return selectedQueueType ? (
      <CustomerQueueDetail
        onBack={() => setSelectedQueueType(null)}
        onJoined={() => setMyQueuesRefreshKey((key) => key + 1)}
        queueType={selectedQueueType}
      />
    ) : (
      <>
        <QueueTypeSelection
          error={error}
          isLoading={isLoading}
          isLocating={shouldBypassLocationFiltering ? false : nearbyQueueDiscovery.isLocating}
          locationError={shouldBypassLocationFiltering ? null : nearbyQueueDiscovery.error}
          locationLabel={
            shouldBypassLocationFiltering
              ? undefined
              : nearbyQueueDiscovery.selectedArea?.city ||
                nearbyQueueDiscovery.selectedArea?.address ||
                (nearbyQueueDiscovery.userCoordinates ? 'Current location' : undefined)
          }
          locationSource={shouldBypassLocationFiltering ? null : nearbyQueueDiscovery.locationSource}
          onAreaSelected={
            shouldBypassLocationFiltering ? undefined : nearbyQueueDiscovery.useManualArea
          }
          onRequestLocation={
            shouldBypassLocationFiltering
              ? undefined
              : () => setIsLocationPromptOpen(true)
          }
          onSelectQueue={handleSelectQueue}
          queues={publicQueues}
          searchQuery={shouldBypassLocationFiltering ? '' : nearbyQueueDiscovery.manualAreaQuery}
          watchState={shouldBypassLocationFiltering ? 'idle' : nearbyQueueDiscovery.watchState}
        />

        {shouldShowCustomerLocationPrompt && isLocationPromptOpen && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/45 p-4">
            <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-100 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                Location access
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--color-primary)]">
                Allow QueueSkip to use your location?
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                We can use your current location to show queues within 10km. If you
                prefer, you can keep using your signup location or search a different
                area manually.
              </p>

              {profileLocation && (
                <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-100">
                  Current saved area: {profileLocation}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="min-h-12 rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#ed7f2c]/20 transition hover:-translate-y-0.5 hover:opacity-95"
                  onClick={() => {
                    setIsLocationPromptOpen(false)
                    void nearbyQueueDiscovery.requestLiveLocation()
                  }}
                  type="button"
                >
                  Allow current location
                </button>
                <button
                  className="min-h-12 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[var(--color-primary)] shadow-sm transition hover:-translate-y-0.5"
                  onClick={() => setIsLocationPromptOpen(false)}
                  type="button"
                >
                  Keep saved location
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  if (myQueues.isLoading) {
    return <FullPageLoader />
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:py-12 lg:h-[calc(100vh-5rem)] lg:py-0">
      <div className="overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-slate-300/50 ring-1 ring-white/70 lg:grid lg:h-full lg:grid-cols-[18rem_1fr]">
        {isMobileNavOpen && (
          <button
            aria-label="Close customer menu"
            className="fixed inset-0 z-[110] bg-slate-950/40 lg:hidden"
            onClick={onCloseMobileNav}
            type="button"
          />
        )}

        <aside
          className={`${
            isMobileNavOpen ? 'fixed inset-y-0 left-0 z-[120] flex w-72' : 'hidden'
          } flex-col justify-between overflow-hidden bg-[var(--color-primary)] p-6 text-white lg:sticky lg:top-20 lg:z-auto lg:flex lg:h-[calc(100vh-5rem)] lg:w-auto lg:self-start`}
        >
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="break-words text-xl font-black leading-tight">
                {customerName}
              </p>
              <button
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-lg bg-white/10 text-2xl font-black leading-none text-white lg:hidden"
                onClick={onCloseMobileNav}
                type="button"
              >
                X
              </button>
            </div>

            <nav
              aria-label="Customer workspace"
              className="mt-10 flex flex-col gap-2"
            >
              <button
                className="flex w-full items-center justify-between rounded-lg border-l-4 border-[var(--color-accent)] bg-white px-4 py-3 text-left text-sm font-bold text-[var(--color-primary)] shadow-lg shadow-black/10 transition"
                onClick={() => {
                  setMyQueuesRefreshKey((key) => key + 1)
                  onCloseMobileNav()
                }}
                type="button"
              >
                <span>My Queues</span>
                <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-1 text-xs text-[var(--color-primary)]">
                  {myQueues.queues.length}
                </span>
              </button>
              <button
                className="flex w-full items-center justify-between rounded-lg border-l-4 border-transparent bg-white/5 px-4 py-3 text-left text-sm font-bold text-white/75 transition hover:bg-white/15 hover:text-white"
                onClick={() => {
                  onCloseMobileNav()
                  onNavigate('/customer')
                }}
                type="button"
              >
                <span>Browse Public Queues</span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white">
                  {queues.length}
                </span>
              </button>
            </nav>
          </div>
          <button
            className="mt-10 w-full rounded-lg bg-white px-4 py-3 text-sm font-black text-[var(--color-primary)] lg:hidden"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        </aside>

        <div className="scrollbar-hidden flex min-h-0 flex-col gap-8 p-5 sm:p-8 lg:h-full lg:overflow-y-auto lg:p-10">
          <MyQueuesPanel
            error={myQueues.error}
            isLoading={myQueues.isLoading}
            queues={myQueues.queues}
          />
        </div>
      </div>
    </section>
  )
}
