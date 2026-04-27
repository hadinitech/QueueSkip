import type { QueueType } from '../../../types/queue'

type QueueTypeCardProps = {
  queueType: QueueType
  onSelect: (queueType: QueueType) => void
}

export function QueueTypeCard({ queueType, onSelect }: QueueTypeCardProps) {
  const secondaryLocationLine =
    queueType.address &&
    queueType.address.trim().toLowerCase() !== queueType.location.trim().toLowerCase()
      ? queueType.address
      : null
  const primaryLocation =
    queueType.city || queueType.location || queueType.province || queueType.country
  const description =
    queueType.description.trim() ||
    `Skip the waiting line and join the queue for ${queueType.title.toLowerCase()}.`
  const waitLabel =
    queueType.estimatedWaitMinutes > 0
      ? `About ${queueType.estimatedWaitMinutes} min wait`
      : `${queueType.peopleWaiting} currently waiting`

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-[0_24px_50px_-24px_rgba(15,23,42,0.22)] ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-28px_rgba(13,47,100,0.28)]">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center rounded-full bg-[var(--color-secondary)]/10 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--color-secondary)]">
          {queueType.peopleWaiting} waiting
        </span>
        <div className="grid size-12 place-items-center rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)] shadow-inner shadow-white/80 ring-1 ring-[var(--color-primary)]/8">
          <svg
            aria-hidden="true"
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle cx="7" cy="7" r="2.25" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17" cy="17" r="2.25" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M8.7 8.7L15.3 15.3M15.8 8.2L11.4 12.6M8.2 15.8l3.4-3.4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-2xl font-black leading-tight tracking-tight text-[var(--color-primary)]">
          {queueType.name}
        </h2>
        <p className="mt-1.5 text-xs font-bold text-[var(--color-secondary)] sm:text-sm">
          Join the queue for {queueType.title}
        </p>
      </div>

      <p className="mt-3 flex-1 text-xs leading-6 text-slate-600 sm:text-sm">
        {description}
      </p>

      <div className="mt-3 rounded-2xl bg-[var(--color-primary)]/4 px-3.5 py-2.5 text-xs font-semibold text-[var(--color-primary)] sm:text-sm">
        {queueType.distanceKm === undefined
          ? waitLabel
          : `${queueType.distanceKm.toFixed(1)}km away · ${waitLabel}`}
      </div>

      <div className="mt-4 border-t border-slate-200/80 pt-4">
        <div className="flex items-start gap-3">
          <svg
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 21s6-5.73 6-11a6 6 0 10-12 0c0 5.27 6 11 6 11z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-primary)]">
              {primaryLocation}
            </p>
            {secondaryLocationLine && (
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                {secondaryLocationLine}
              </p>
            )}
            {!secondaryLocationLine && queueType.province && queueType.country && (
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                {queueType.province}, {queueType.country}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        className="mt-5 flex min-h-11 w-full items-center justify-center gap-2.5 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[#ed7f2c]/20 transition hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-[var(--color-secondary)]/20 sm:text-sm"
        onClick={() => onSelect(queueType)}
        type="button"
      >
        <span>Choose queue</span>
        <span className="grid size-5 place-items-center rounded-full bg-white/15 text-sm leading-none">
          →
        </span>
      </button>
    </article>
  )
}
