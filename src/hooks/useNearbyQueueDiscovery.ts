import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCurrentLocation,
  searchLocations,
  type LocationSuggestion,
} from '../services/locationSearch'
import type { QueueType } from '../types/queue'
import { DEFAULT_RADIUS_KM, filterQueuesWithinRadius } from '../utils/location'

type LocationSource = 'live' | 'manual' | null

type Coordinates = {
  latitude: number
  longitude: number
}

type NearbyQueueDiscoveryOptions = {
  initialLocationQuery?: string | null
}

export function useNearbyQueueDiscovery(
  queues: QueueType[],
  options: NearbyQueueDiscoveryOptions = {},
) {
  const [error, setError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationSource, setLocationSource] = useState<LocationSource>(null)
  const [manualAreaQuery, setManualAreaQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState<LocationSuggestion | null>(null)
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null)
  const [watchState, setWatchState] = useState<'blocked' | 'idle' | 'searching' | 'tracking'>('idle')
  const hasResolvedInitialLocation = useRef(false)

  useEffect(() => {
    const initialLocationQuery = options.initialLocationQuery?.trim()

    if (
      hasResolvedInitialLocation.current ||
      !initialLocationQuery ||
      locationSource !== null
    ) {
      return
    }

    hasResolvedInitialLocation.current = true

    searchLocations(initialLocationQuery)
      .then((matches) => {
        const matchedLocation = matches.at(0)

        if (!matchedLocation) {
          return
        }

        useManualArea(matchedLocation)
      })
      .catch(() => {
        // If the saved signup location cannot be resolved, the customer can still
        // use manual search or request live location from the public page.
      })
  }, [locationSource, options.initialLocationQuery])

  const nearbyQueues = useMemo(() => {
    if (!userCoordinates) {
      return []
    }

    return filterQueuesWithinRadius(
      queues,
      userCoordinates.latitude,
      userCoordinates.longitude,
      DEFAULT_RADIUS_KM,
    )
  }, [queues, userCoordinates])

  async function requestLiveLocation() {
    setError(null)
    setIsLocating(true)
    setWatchState('searching')

    try {
      const coordinates = await getCurrentLocation()
      setLocationSource('live')
      setSelectedArea(null)
      setUserCoordinates(coordinates)
      setWatchState('tracking')
    } catch (caughtError) {
      setLocationSource(null)
      setWatchState('blocked')
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Location access was blocked. Search your area manually instead.',
      )
    } finally {
      setIsLocating(false)
    }
  }

  function useManualArea(place: LocationSuggestion) {
    setError(null)
    setIsLocating(false)
    setLocationSource('manual')
    setManualAreaQuery(place.address)
    setSelectedArea(place)
    setUserCoordinates({
      latitude: place.latitude,
      longitude: place.longitude,
    })
    setWatchState('idle')
  }

  return {
    error,
    isLocating,
    locationSource,
    manualAreaQuery,
    nearbyQueues,
    requestLiveLocation,
    selectedArea,
    setManualAreaQuery,
    useManualArea,
    userCoordinates,
    watchState,
  }
}
