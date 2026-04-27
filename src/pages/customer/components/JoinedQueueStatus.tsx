import { Button } from '../../../components/ui/Button'
import { InstallButton } from '../../../components/ui/InstallButton'
import { StatCard } from '../../../components/ui/StatCard'
import type { JoinedCustomer } from '../../../services/supabase/queueService'
import type { QueueType } from '../../../types/queue'

type JoinedQueueStatusProps = {
  joinedQueue: JoinedCustomer
  queueType: QueueType
  onLeave: () => void
}

export function JoinedQueueStatus({
  joinedQueue,
  queueType,
  onLeave,
}: JoinedQueueStatusProps) {
  const peopleAhead = Math.max(joinedQueue.position - 1, 0)

  return (
    <section className="rounded-[2rem] bg-[var(--color-primary)] p-5 text-white shadow-xl shadow-[#0d2f64]/20 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white/60">
            Joined queue
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">
            You are in the {queueType.name} queue
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            We will keep your place while the queue moves.
          </p>
        </div>
        <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-white">
          {joinedQueue.status}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Your position" value={`#${joinedQueue.position}`} />
        <StatCard label="People ahead" value={String(peopleAhead)} />
        <StatCard
          label="Estimated wait"
          value={`${queueType.estimatedWaitMinutes}m`}
          tone="accent"
        />
      </div>

      <div className="mt-6 rounded-3xl bg-white/10 p-4">
        <p className="text-sm font-semibold text-white/60">Your details</p>
        <p className="mt-2 text-lg font-black">{joinedQueue.name}</p>
        <p className="text-sm text-white/70">{joinedQueue.phone}</p>
      </div>

      <div className="mt-6 rounded-3xl bg-white/10 p-4">
        <p className="text-sm font-semibold text-white/60">Keep QueueSkip handy</p>
        <p className="mt-2 text-sm leading-6 text-white/80">
          Install the app to check your queue faster next time and get back to your
          place in line with fewer taps.
        </p>
        <div className="mt-4">
          <InstallButton
            buttonClassName="bg-[var(--color-accent)] shadow-[#ed7f2c]/25"
            messageClassName="text-white/70"
          />
        </div>
      </div>

      <Button
        className="mt-6 w-full border-0 bg-white shadow-none"
        onClick={onLeave}
        type="button"
        variant="outline"
      >
        Leave Queue
      </Button>
    </section>
  )
}
