import { AppLoader } from '../../../components/ui/AppLoader'
import type { AdminQueue } from '../../../services/supabase/adminQueueService'

type AdminQueueListProps = {
  isLoading: boolean
  onSelectQueue: (queueId: string) => void
  queues: AdminQueue[]
  selectedQueueId: string | null
}

export function AdminQueueList({
  isLoading,
  onSelectQueue,
  queues,
  selectedQueueId,
}: AdminQueueListProps) {
  return (
    <section>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && (
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
            <AppLoader label="Loading queues..." />
          </div>
        )}

        {!isLoading && queues.length === 0 && (
          <div className="col-span-full rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100 sm:p-8">
            <div className="flex max-w-2xl flex-col gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                  Queue cards
                </p>
                <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                  No queues created yet
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create your first queue card so customers can join a line and
                  admins can manage the flow from this workspace.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading &&
          queues.map((queue) => (
            <button
              className={`group flex min-h-72 flex-col overflow-hidden rounded-2xl bg-white text-left shadow-xl shadow-slate-200/70 ring-1 transition hover:-translate-y-1 ${
                selectedQueueId === queue.id
                  ? 'ring-[var(--color-accent)]'
                  : 'ring-slate-100 hover:ring-[var(--color-secondary)]/40'
              }`}
              key={queue.id}
              onClick={() => onSelectQueue(queue.id)}
              type="button"
            >
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl font-black leading-tight text-[var(--color-primary)]">
                  {queue.name}
                </h3>
                <p className="mt-5 text-sm font-black text-slate-950">
                  Estimate: {queue.estimatedWaitMinutes} minutes
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700">
                  Lunch: {queue.lunchTime}
                </p>
                <p className="mt-4 flex-1 text-base leading-7 text-slate-500">
                  {queue.description}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500">
                <span className="grid size-8 place-items-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  ▣
                </span>
                <span>{queue.title}</span>
              </div>
            </button>
          ))}
      </div>
    </section>
  )
}
