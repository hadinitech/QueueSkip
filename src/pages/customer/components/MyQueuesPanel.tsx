import { AppLoader } from '../../../components/ui/AppLoader'
import type { MyQueue } from '../../../services/supabase/queueService'

type MyQueuesPanelProps = {
  error: string | null
  isLoading: boolean
  queues: MyQueue[]
}

export function MyQueuesPanel({
  error,
  isLoading,
  queues,
}: MyQueuesPanelProps) {
  return (
    <section className="flex flex-col gap-5">
      <header>
        <p className="text-sm font-black text-[var(--color-primary)]">
          My queues
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Track the queues you have joined and see where you are in line.
        </p>
      </header>

      {isLoading && (
        <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
          <AppLoader label="Loading your queues..." />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[2rem] bg-red-50 p-6 text-sm font-semibold text-red-700 ring-1 ring-red-100">
          {error}
        </div>
      )}

      {!isLoading && !error && queues.length === 0 && (
        <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            Nothing joined yet
          </p>
          <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
            Your active queues will appear here.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Browse the public queue page, choose a queue, and join it to track
            your place.
          </p>
        </div>
      )}

      {!isLoading && !error && queues.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {queues.map((queue) => (
            <article
              className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100"
              key={queue.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                    {queue.queueName}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                    {queue.queueTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {queue.queueDescription}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-[var(--color-primary)]/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)]">
                  {queue.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">Position</p>
                  <p className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                    #{queue.position}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-500">
                    People ahead
                  </p>
                  <p className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                    {queue.peopleAhead}
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--color-accent)] p-4 text-white">
                  <p className="text-sm font-bold text-white/80">
                    Est. wait
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {queue.estimatedWaitMinutes}m
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
