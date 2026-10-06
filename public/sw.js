const CACHE_NAME = 'castov-cache-v1';

// Add core paths to cache immediately
const PRECACHE_URLS = [
  '/',
  '/tools',
  '/manifest.json',
  '/logo.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for navigation and static assets
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Don't intercept API calls or Supabase auth
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase.co')) {
    return;
  }

  // Network First, falling back to cache (Stale-While-Revalidate pattern)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache successful responses for future offline use
        if (networkResponse.ok && event.request.url.startsWith('http')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If network fails, return cached response if available
        return cachedResponse || new Response("You are offline and this page is not cached.", { status: 503, statusText: "Offline" });
      });

      // Return cached response immediately if we have it, but fetch in background to update cache
      return cachedResponse || fetchPromise;
    })
  );
});
