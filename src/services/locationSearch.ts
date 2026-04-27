export type LocationSuggestion = {
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  province: string
}

type NominatimResult = {
  addresstype?: string
  address?: {
    city?: string
    country?: string
    county?: string
    municipality?: string
    state?: string
    suburb?: string
    town?: string
    village?: string
  }
  display_name: string
  lat: string
  lon: string
}

function mapNominatimResult(result: NominatimResult): LocationSuggestion {
  return {
    address: result.display_name,
    city:
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.address?.suburb ||
      result.address?.municipality ||
      result.address?.county ||
      '',
    country: result.address?.country || '',
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    province: result.address?.state || '',
  }
}

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 3) {
    return []
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '5')
  url.searchParams.set('q', normalizedQuery)

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Unable to load location suggestions.')
  }

  const data = (await response.json()) as NominatimResult[]

  return data.map(mapNominatimResult)
}

export async function getCurrentLocation(): Promise<{
  latitude: number
  longitude: number
}> {
  if (!navigator.geolocation) {
    throw new Error('This browser does not support live location.')
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(
          new Error(
            error.message ||
              'Location access was blocked. Search your area manually instead.',
          ),
        )
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60 * 1000,
        timeout: 15 * 1000,
      },
    )
  })
}
