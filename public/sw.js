
// Simple Service Worker for static asset caching
const CACHE_NAME = 'tiertrainer-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/placeholder.svg'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('Service worker cache failed:', error);
        self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-http(s) requests
  if (!event.request.url.startsWith('http')) return;

  // Skip external tracking/analytics requests (Google, Facebook, etc.)
  const url = new URL(event.request.url);
  const skipDomains = [
    'www.google.com',
    'www.googleadservices.com', 
    'www.google-analytics.com',
    'googleads.g.doubleclick.net',
    'www.facebook.com',
    'connect.facebook.net'
  ];
  
  if (skipDomains.includes(url.hostname)) {
    return; // Let the browser handle these requests normally
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Don't cache non-successful responses
            if (!fetchResponse.ok) return fetchResponse;

            // Clone response for caching
            const responseClone = fetchResponse.clone();

            // Cache static assets (js, css, images)
            if (event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg)$/)) {
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone))
                .catch(() => {}); // Silently fail cache operations
            }

            return fetchResponse;
          })
          .catch((error) => {
            console.log('Fetch failed for:', event.request.url);
            
            // Fallback for offline scenarios
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            
            // For other failed requests, return a basic response
            return new Response('', { 
              status: 408, 
              statusText: 'Request timeout' 
            });
          });
      })
      .catch((error) => {
        console.log('Cache match failed:', error);
        // Return a basic response for any cache errors
        return new Response('', { 
          status: 500, 
          statusText: 'Service worker error' 
        });
      })
  );
});
