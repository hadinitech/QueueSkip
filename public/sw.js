const CACHE_NAME = 'queueskip-static-v1'

self.addEventListener('install', (event) => {
  // Activate the new service worker as soon as it finishes installing.
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  // Take control of open pages immediately after activation.
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request)

      if (cachedResponse) {
        return cachedResponse
      }

      const networkResponse = await fetch(event.request)

      // Cache same-origin successful responses for faster repeat visits.
      if (
        event.request.url.startsWith(self.location.origin) &&
        networkResponse.ok
      ) {
        cache.put(event.request, networkResponse.clone())
      }

      return networkResponse
    }),
  )
})
