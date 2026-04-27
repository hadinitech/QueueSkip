import type { User } from '@supabase/supabase-js'
import { useState } from 'react'
import { FullPageLoader } from '../../components/ui/FullPageLoader'
import { Button } from '../../components/ui/Button'
import { StatCard } from '../../components/ui/StatCard'
import { useAdminQueues } from '../../hooks/useAdminQueues'
import { AdminCustomerPanel } from './components/AdminCustomerPanel'
import { AdminQueueControls } from './components/AdminQueueControls'
import { AdminQueueList } from './components/AdminQueueList'

type AdminDashboardProps = {
  isMobileNavOpen: boolean
  onCloseMobileNav: () => void
  onLogout: () => void
  user: User | null
}

type AdminTab =
  | 'overview'
  | 'manage-queues'
  | 'create-queue'
  | 'live-line'

export function AdminDashboard({
  isMobileNavOpen,
  onCloseMobileNav,
  onLogout,
  user,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const adminName =
    typeof user?.user_metadata.full_name === 'string' &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name
      : user?.email || 'Admin'
  const {
    customerActionError,
    customers,
    defaultQueueLocation,
    error,
    isCreating,
    isLoading,
    isLoadingLiveCustomers,
    isManagingCustomers,
    liveCustomers,
    queues,
    serveCustomer,
    selectedQueue,
    selectedQueueId,
    serveNextCustomer,
    setSelectedQueueId,
    submitCreateQueue,
  } = useAdminQueues()
  const servingCustomer = liveCustomers.find(
    (customer) => customer.status === 'serving',
  )
  const waitingLiveCustomers = liveCustomers.filter(
    (customer) => customer.status === 'waiting',
  )
  const queueWithLongestWait = queues.reduce<typeof queues[number] | null>(
    (longestQueue, queue) => {
      if (!longestQueue || queue.estimatedWaitMinutes > longestQueue.estimatedWaitMinutes) {
        return queue
      }

      return longestQueue
    },
    null,
  )
  const averageQueueWait =
    queues.length > 0
      ? Math.round(
          queues.reduce((total, queue) => total + queue.estimatedWaitMinutes, 0) /
            queues.length,
        )
      : 0
  const recentQueues = queues.slice(0, 3)
  const recentLiveCustomers = liveCustomers.slice(0, 4)
  const getTabClassName = (tab: AdminTab) => {
    const baseClassName =
      'flex w-full items-center justify-between rounded-lg border-l-4 px-4 py-3 text-left text-sm font-bold transition'

    if (activeTab === tab) {
      return `${baseClassName} border-[var(--color-accent)] bg-white text-[var(--color-primary)] shadow-lg shadow-black/10`
    }

    return `${baseClassName} border-transparent bg-white/5 text-white/75 hover:bg-white/15 hover:text-white`
  }
  const selectTab = (tab: AdminTab) => {
    setActiveTab(tab)
    onCloseMobileNav()
  }
  const createQueueButton = (
    <Button
      className="bg-[var(--color-accent)] px-7 text-base shadow-lg shadow-[#ed7f2c]/20"
      disabled={activeTab === 'create-queue'}
      onClick={() => selectTab('create-queue')}
      type="button"
      variant="secondary"
    >
      + Create Queue
    </Button>
  )

  if (isLoading || isLoadingLiveCustomers) {
    return <FullPageLoader />
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:py-12 lg:h-[calc(100vh-5rem)] lg:py-0">
      <div className="overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-slate-300/50 ring-1 ring-white/70 lg:grid lg:h-full lg:grid-cols-[18rem_1fr]">
        {isMobileNavOpen && (
          <button
            aria-label="Close admin menu"
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
              <div>
                <p className="text-xs font-black uppercase text-white/50">
                  Signed in as
                </p>
                <p className="mt-2 break-words text-xl font-black leading-tight">
                  {adminName}
                </p>
              </div>
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
              aria-label="Admin workspace"
              className="mt-10 flex flex-col gap-2"
            >
              <button
                className={getTabClassName('overview')}
                onClick={() => selectTab('overview')}
                type="button"
              >
                <span>Overview</span>
                <span
                  className={`text-xs ${
                    activeTab === 'overview'
                      ? 'text-[var(--color-accent)]'
                      : 'text-white/50'
                  }`}
                >
                  Home
                </span>
              </button>
              <button
                className={getTabClassName('manage-queues')}
                onClick={() => selectTab('manage-queues')}
                type="button"
              >
                <span>Manage queues</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    activeTab === 'manage-queues'
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'bg-white/15 text-white'
                  }`}
                >
                  {queues.length}
                </span>
              </button>
              <button
                className={getTabClassName('create-queue')}
                onClick={() => selectTab('create-queue')}
                type="button"
              >
                <span>Create queue</span>
                <span
                  className={`text-xs ${
                    activeTab === 'create-queue'
                      ? 'text-[var(--color-accent)]'
                      : 'text-white/50'
                  }`}
                >
                  New
                </span>
              </button>
              <button
                className={getTabClassName('live-line')}
                onClick={() => selectTab('live-line')}
                type="button"
              >
                <span>Live line</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    activeTab === 'live-line'
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {waitingLiveCustomers.length}
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
          {activeTab === 'overview' && (
            <section className="flex flex-col gap-8">
              <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[var(--color-primary)]">
                    Overview
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--color-primary)]">
                    Business dashboard
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                    Track your live queues, monitor wait pressure, and jump into the
                    next action quickly.
                  </p>
                </div>
                {createQueueButton}
              </header>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Active queues" value={String(queues.length)} />
                <StatCard
                  label="Customers in line"
                  value={String(waitingLiveCustomers.length)}
                />
                <StatCard
                  label="Avg wait"
                  value={queues.length > 0 ? `${averageQueueWait} min` : '0 min'}
                />
                <StatCard
                  label="Now serving"
                  tone="accent"
                  value={servingCustomer ? servingCustomer.name : 'None'}
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                        Performance snapshot
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                        Queue health
                      </h2>
                    </div>
                    <button
                      className="text-sm font-black text-[var(--color-secondary)]"
                      onClick={() => selectTab('manage-queues')}
                      type="button"
                    >
                      View all queues
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <article className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Highest estimated wait
                      </p>
                      <p className="mt-3 text-xl font-black text-[var(--color-primary)]">
                        {queueWithLongestWait ? queueWithLongestWait.name : 'No queues yet'}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {queueWithLongestWait
                          ? `${queueWithLongestWait.estimatedWaitMinutes} minutes estimated`
                          : 'Create a queue to start monitoring wait pressure.'}
                      </p>
                    </article>

                    <article className="rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Selected queue
                      </p>
                      <p className="mt-3 text-xl font-black text-[var(--color-primary)]">
                        {selectedQueue ? selectedQueue.name : 'No queue selected'}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {selectedQueue
                          ? `${customers.length} active customers in this queue`
                          : 'Pick a queue from Manage queues to focus your team.'}
                      </p>
                    </article>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {recentQueues.length === 0 && (
                      <p className="rounded-[1.5rem] bg-slate-50 p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-100">
                        No queues created yet.
                      </p>
                    )}

                    {recentQueues.map((queue) => (
                      <article
                        className="flex flex-col gap-3 rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between"
                        key={queue.id}
                      >
                        <div>
                          <h3 className="text-lg font-black text-[var(--color-primary)]">
                            {queue.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">{queue.title}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.14em]">
                          <span className="rounded-full bg-[var(--color-primary)]/8 px-3 py-2 text-[var(--color-primary)]">
                            {queue.estimatedWaitMinutes} min wait
                          </span>
                          <span className="rounded-full bg-[var(--color-secondary)]/10 px-3 py-2 text-[var(--color-secondary)]">
                            {queue.location}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="flex flex-col gap-5">
                  <section className="rounded-[2rem] bg-[var(--color-primary)] p-6 text-white shadow-xl shadow-[#0d2f64]/20">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
                      Quick actions
                    </p>
                    <h2 className="mt-2 text-2xl font-black">Keep the line moving</h2>
                    <div className="mt-5 grid gap-3">
                      <Button
                        className="justify-center bg-white text-[var(--color-primary)]"
                        onClick={() => selectTab('live-line')}
                        type="button"
                        variant="outline"
                      >
                        Open live line
                      </Button>
                      <Button
                        className="justify-center"
                        onClick={() => selectTab('manage-queues')}
                        type="button"
                        variant="secondary"
                      >
                        Manage queues
                      </Button>
                    </div>
                  </section>

                  <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                      Live activity
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                      Waiting now
                    </h2>

                    <div className="mt-5 flex flex-col gap-3">
                      {recentLiveCustomers.length === 0 && (
                        <p className="rounded-[1.5rem] bg-slate-50 p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-100">
                          No customers are currently waiting.
                        </p>
                      )}

                      {recentLiveCustomers.map((customer) => (
                        <article
                          className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100"
                          key={customer.id}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-black text-[var(--color-primary)]">
                                {customer.name}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                {customer.queueName || 'Queue'}
                              </p>
                            </div>
                            <span className="rounded-full bg-[var(--color-accent)]/12 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-accent)]">
                              #{customer.position}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                </section>
              </div>
            </section>
          )}

          {activeTab === 'create-queue' && (
            <section className="flex flex-col gap-5">
              <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                <p className="text-sm font-black text-[var(--color-primary)]">
                  Create queue
                </p>
                </div>
                {createQueueButton}
              </header>
              <AdminQueueControls
                defaultLocation={defaultQueueLocation}
                error={error}
                isCreating={isCreating}
                onClose={() => setActiveTab('manage-queues')}
                onCreateQueue={submitCreateQueue}
              />
            </section>
          )}

          {activeTab === 'manage-queues' && (
            <section className="flex flex-col gap-5">
              <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                <p className="text-sm font-black text-[var(--color-primary)]">
                  Manage queues
                </p>
                </div>
                {createQueueButton}
              </header>
              <AdminQueueList
                isLoading={isLoading}
                onSelectQueue={setSelectedQueueId}
                queues={queues}
                selectedQueueId={selectedQueueId}
              />
            </section>
          )}

          {activeTab === 'live-line' && (
            <section className="flex flex-col gap-5">
              <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                <p className="text-sm font-black text-[var(--color-primary)]">
                  Live line
                </p>
                </div>
                {createQueueButton}
              </header>
              <AdminCustomerPanel
                canServeNext={Boolean(selectedQueue && customers.length > 0)}
                customers={waitingLiveCustomers}
                emptyMessage="No customers are waiting in any queue right now."
                error={customerActionError}
                isLoading={isLoadingLiveCustomers}
                isManaging={isManagingCustomers}
                onRemoveCustomer={(customerId) =>
                  void serveCustomer(customerId)
                }
                onServeNext={() => void serveNextCustomer()}
                queue={null}
                rowActionLabel="Serve Customer"
                servingCustomerName={servingCustomer?.name ?? null}
                showQueueName
                subtitle="Customers waiting across every queue. Serve a customer when their request is complete."
                title="Live line"
              />
            </section>
          )}
        </div>
      </div>
    </section>
  )
}
