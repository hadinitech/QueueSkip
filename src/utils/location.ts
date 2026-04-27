import type { QueueType } from '../types/queue'

export const DEFAULT_RADIUS_KM = 10

const EARTH_RADIUS_KM = 6371

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const deltaLatitude = toRadians(lat2 - lat1)
  const deltaLongitude = toRadians(lon2 - lon1)
  const originLatitude = toRadians(lat1)
  const destinationLatitude = toRadians(lat2)

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2)

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function filterQueuesWithinRadius(
  queues: QueueType[],
  userLat: number,
  userLng: number,
  radiusKm: number,
) {
  return queues
    .filter((queue) => queue.latitude !== null && queue.longitude !== null)
    .map((queue) => ({
      ...queue,
      distanceKm: calculateDistanceKm(
        userLat,
        userLng,
        queue.latitude as number,
        queue.longitude as number,
      ),
    }))
    .filter((queue) => (queue.distanceKm ?? Number.POSITIVE_INFINITY) <= radiusKm)
    .sort((left, right) => (left.distanceKm ?? 0) - (right.distanceKm ?? 0))
}
