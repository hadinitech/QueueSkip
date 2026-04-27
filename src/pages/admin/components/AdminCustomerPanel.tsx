import { AppLoader } from '../../../components/ui/AppLoader'
import { Button } from '../../../components/ui/Button'
import type {
  AdminQueue,
  AdminQueueCustomer,
} from '../../../services/supabase/adminQueueService'

type AdminCustomerPanelProps = {
  canServeNext?: boolean
  customers: AdminQueueCustomer[]
  error: string | null
  emptyMessage?: string
  isLoading: boolean
  isManaging: boolean
  onRemoveCustomer: (customerId: string) => void
  onServeNext: () => void
  queue: AdminQueue | null
  rowActionLabel?: string
  servingCustomerName?: string | null
  showQueueName?: boolean
  subtitle?: string
  title?: string
}

export function AdminCustomerPanel({
  canServeNext,
  customers,
  error,
  emptyMessage = 'No active customers are waiting right now.',
  isLoading,
  isManaging,
  onRemoveCustomer,
  onServeNext,
  queue,
  rowActionLabel = 'Remove Customer',
  servingCustomerName,
  showQueueName = false,
  subtitle,
  title,
}: AdminCustomerPanelProps) {
  const canServe = canServeNext ?? Boolean(queue && customers.length > 0)
  const actionLabel = servingCustomerName || 'Now Serving'

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            Queue control
          </p>
          <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
            {title || queue?.name || 'All active customers'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {subtitle ||
              (queue
                ? 'Serve the next customer or save customers from this queue.'
                : 'Customers waiting across every queue.')}
          </p>
        </div>
        <Button
          disabled={!canServe || isManaging}
          onClick={onServeNext}
          type="button"
          variant="secondary"
        >
          {isManaging ? 'Updating...' : actionLabel}
        </Button>
      </div>

      {error && (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {isLoading && (
          <div className="rounded-3xl bg-slate-50 p-6">
            <AppLoader label="Loading customers..." />
          </div>
        )}

        {!isLoading && customers.length === 0 && (
          <p className="rounded-3xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
            {emptyMessage}
          </p>
        )}

        {!isLoading &&
          customers.map((customer) => (
            <article
              className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={customer.id}
            >
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-2xl bg-white font-black text-[var(--color-primary)] ring-1 ring-slate-100">
                  {customer.position}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-950">
                      {customer.name}
                    </h3>
                    <span className="rounded-full bg-[var(--color-secondary)]/10 px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">
                      {customer.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{customer.phone}</p>
                  {showQueueName && customer.queueName && (
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">
                      {customer.queueName}
                    </p>
                  )}
                </div>
              </div>
              <Button
                disabled={isManaging}
                onClick={() => onRemoveCustomer(customer.id)}
                type="button"
                variant="danger"
              >
                {rowActionLabel}
              </Button>
            </article>
          ))}
      </div>
    </section>
  )
}
