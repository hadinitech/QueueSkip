export type QueueType = {
  address: string
  businessId: string | null
  city: string
  country: string
  id: string
  latitude: number | null
  longitude: number | null
  name: string
  province: string
  title: string
  description: string
  distanceKm?: number
  peopleWaiting: number
  estimatedWaitMinutes: number
  lunchTime: string
  location: string
}
