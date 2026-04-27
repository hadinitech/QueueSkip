import { useEffect, useRef, useState } from 'react'
import { AppLoader } from './AppLoader'
import {
  searchLocations,
  type LocationSuggestion,
} from '../../services/locationSearch'

type PlaceAutocompleteInputProps = {
  helperText?: string
  label: string
  onInputChange?: (value: string) => void
  onPlaceSelected: (place: LocationSuggestion) => void
  placeholder: string
  required?: boolean
  value: string
}

export function PlaceAutocompleteInput({
  helperText,
  label,
  onInputChange,
  onPlaceSelected,
  placeholder,
  required = false,
  value,
}: PlaceAutocompleteInputProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [predictions, setPredictions] = useState<LocationSuggestion[]>([])
  const [query, setQuery] = useState(value)
  const skipNextSearchRef = useRef(false)

  useEffect(() => {
    if (value === query) {
      return
    }

    skipNextSearchRef.current = true
    setQuery(value)
  }, [query, value])

  useEffect(() => {
    const normalizedQuery = query.trim()

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false
      setPredictions([])
      setIsLoading(false)
      return
    }

    if (normalizedQuery.length < 3) {
      setPredictions([])
      return
    }

    let isCancelled = false
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true)

      searchLocations(normalizedQuery)
        .then((nextPredictions) => {
          if (!isCancelled) {
            setPredictions(nextPredictions)
            setError(null)
          }
        })
        .catch((caughtError) => {
          if (!isCancelled) {
            setPredictions([])
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : 'Unable to load location suggestions.',
            )
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoading(false)
          }
        })
    }, 250)

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [query])

  function selectPrediction(place: LocationSuggestion) {
    skipNextSearchRef.current = true
    setError(null)
    setPredictions([])
    setQuery(place.address)
    onPlaceSelected(place)
  }

  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="relative">
        <input
          className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-secondary)] focus:ring-4 focus:ring-[var(--color-secondary)]/15"
          onBlur={() => {
            window.setTimeout(() => {
              setPredictions([])
            }, 120)
          }}
          onChange={(event) => {
            setQuery(event.currentTarget.value)
            onInputChange?.(event.currentTarget.value)
            setError(null)
          }}
          onFocus={() => {
            if (query.trim().length >= 3) {
              skipNextSearchRef.current = false
            }
          }}
          placeholder={placeholder}
          required={required}
          type="text"
          value={query}
        />

        {predictions.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
            {predictions.map((prediction) => (
              <button
                className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition last:border-b-0 hover:bg-slate-50"
                key={`${prediction.address}-${prediction.latitude}-${prediction.longitude}`}
                onMouseDown={(event) => {
                  event.preventDefault()
                  selectPrediction(prediction)
                }}
                type="button"
              >
                {prediction.address}
              </button>
            ))}
          </div>
        )}
      </div>

      {helperText && (
        <span className="text-xs font-semibold text-slate-500">{helperText}</span>
      )}

      {isLoading && (
        <AppLoader className="items-start gap-2" label="Searching locations..." size="sm" />
      )}

      {error && (
        <span className="text-xs font-semibold text-red-700">{error}</span>
      )}
    </label>
  )
}
