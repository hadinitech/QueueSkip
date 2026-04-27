import { BrandHeader } from '../../../components/shared/BrandHeader'
import { AppLoader } from '../../../components/ui/AppLoader'
import { Button } from '../../../components/ui/Button'
import { PlaceAutocompleteInput } from '../../../components/ui/PlaceAutocompleteInput'
import type { LocationSuggestion } from '../../../services/locationSearch'
import type { QueueType } from '../../../types/queue'
import { QueueTypeCard } from './QueueTypeCard'

type QueueTypeSelectionProps = {
  error: string | null
  isLoading: boolean
  isLocating?: boolean
  locationError?: string | null
  locationLabel?: string
  locationSource?: 'live' | 'manual' | null
  noOuterPadding?: boolean
  onAreaSelected?: (place: LocationSuggestion) => void
  onRequestLocation?: () => void
  onSelectQueue: (queueType: QueueType) => void
  queues: QueueType[]
  searchQuery?: string
  watchState?: 'blocked' | 'idle' | 'searching' | 'tracking'
}

export function QueueTypeSelection({
  error,
  isLoading,
  isLocating = false,
  locationError = null,
  locationLabel,
  locationSource = null,
  noOuterPadding = false,
  onAreaSelected,
  onRequestLocation,
  onSelectQueue,
  queues,
  searchQuery = '',
  watchState = 'idle',
}: QueueTypeSelectionProps) {
  return (
    <section
      className={`mx-auto flex w-full max-w-6xl flex-col gap-8 ${
        noOuterPadding ? 'px-0 py-0 sm:px-5 sm:py-12' : 'px-5 py-8 sm:py-12'
      }`}
    >
      <BrandHeader
        description="Pick the service you need, check the queue size, and join without standing in line."
        eyebrow="Customer queues"
        title="Choose the queue you want to join."
      />

      {(onRequestLocation || onAreaSelected) && (
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
          <div className="grid gap-0 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="flex flex-col gap-5 p-5 sm:p-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                  Nearby queues
                </p>
                <h2 className="mt-2 text-2xl font-black text-[var(--color-primary)]">
                  Find queues close to you
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                  QueueSkip shows queues within a 10km radius of your live location or
                  your searched area.
                </p>
              </div>

              {onRequestLocation && (
                <div className="flex flex-col items-start gap-3">
                  <Button
                    disabled={isLocating}
                    onClick={onRequestLocation}
                    type="button"
                    variant="secondary"
                  >
                    {isLocating ? 'Getting location...' : 'Use my location'}
                  </Button>
                  {locationLabel && (
                    <span className="rounded-full bg-[var(--color-primary)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-primary)]">
                      {locationSource === 'live' ? 'Live' : 'Manual'} · {locationLabel}
                    </span>
                  )}
                </div>
              )}

              {watchState === 'blocked' && (
                <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 ring-1 ring-amber-100">
                  Live location is blocked. Search your area manually instead.
                </p>
              )}

              {locationError && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
                  {locationError}
                </p>
              )}
            </div>

            {onAreaSelected && (
              <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6 lg:border-l lg:border-t-0">
                <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
                  <PlaceAutocompleteInput
                    helperText="Search your area manually if you do not want to share live location."
                    label="Search your area"
                    onPlaceSelected={onAreaSelected}
                    placeholder="Search suburb, city, or address"
                    value={searchQuery}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
          <AppLoader label="Loading queues..." />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-[2rem] bg-red-50 p-6 text-center text-sm font-semibold text-red-700 ring-1 ring-red-100">
          {error}
        </div>
      )}

      {!isLoading && !error && queues.length === 0 && (
        <div className="rounded-[2rem] bg-white p-6 text-center shadow-xl shadow-slate-200/70 ring-1 ring-slate-100">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            {locationSource ? 'No nearby queues' : 'Choose your area'}
          </p>
          <h2 className="mt-3 text-2xl font-black text-[var(--color-primary)]">
            {locationSource
              ? 'We could not find queues within 10km of your selected area.'
              : 'Share your location or search your area to see nearby queues.'}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {locationSource
              ? 'Try a different area or allow live location to see the closest queues.'
              : 'QueueSkip uses a 10km radius so customers only see queues close to them.'}
          </p>
        </div>
      )}

      {!isLoading && !error && queues.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {queues.map((queueType) => (
            <QueueTypeCard
              key={queueType.id}
              onSelect={onSelectQueue}
              queueType={queueType}
            />
          ))}
        </div>
      )}
    </section>
  )
}
