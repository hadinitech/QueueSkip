import { BrandHeader } from '../../../components/shared/BrandHeader'
import { Button } from '../../../components/ui/Button'
import { StatCard } from '../../../components/ui/StatCard'
import { useJoinQueue } from '../../../hooks/useJoinQueue'
import type { QueueType } from '../../../types/queue'
import { CustomerJoinCard } from './CustomerJoinCard'
import { JoinedQueueStatus } from './JoinedQueueStatus'

type CustomerQueueDetailProps = {
  queueType: QueueType
  noOuterPadding?: boolean
  onBack: () => void
  onJoined?: () => void
}

export function CustomerQueueDetail({
  noOuterPadding = false,
  queueType,
  onBack,
  onJoined,
}: CustomerQueueDetailProps) {
  const {
    error,
    isJoining,
    joinedCustomer,
    resetJoinedQueue,
    submitJoinQueue,
  } = useJoinQueue()

  return (
    <section
      className={`mx-auto flex w-full max-w-4xl flex-col ${
        noOuterPadding ? 'px-0 py-0 sm:px-5 sm:py-12' : 'px-5 py-8 sm:py-12'
      }`}
    >
      <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <BrandHeader
              description={queueType.description}
              eyebrow={`${queueType.name} queue`}
              title={queueType.title}
            />
            <Button
              className="w-full shrink-0 sm:w-44"
              onClick={onBack}
              type="button"
              variant="outline"
            >
              Back to queues
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              label="People in queue"
              value={String(queueType.peopleWaiting)}
            />
            <StatCard
              label="Estimated wait"
              value={`${queueType.estimatedWaitMinutes}m`}
              tone="accent"
            />
            <div className="col-span-2 sm:col-span-1">
              <StatCard label="Lunch time" value={queueType.lunchTime} />
            </div>
          </div>

          {joinedCustomer ? (
            <JoinedQueueStatus
              joinedQueue={joinedCustomer}
              onLeave={resetJoinedQueue}
              queueType={queueType}
            />
          ) : (
            <CustomerJoinCard
              error={error}
              isJoining={isJoining}
              onJoinQueue={({ name, phone }) =>
                void submitJoinQueue({
                  name,
                  phone,
                  queueId: queueType.id,
                }).then((wasJoined) => {
                  if (wasJoined) {
                    onJoined?.()
                  }
                })
              }
              queueName={queueType.name}
            />
          )}
        </div>
    </section>
  )
}
