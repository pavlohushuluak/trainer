self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

// passthrough fetch handler (no caching). Customize later if needed.
self.addEventListener('fetch', () => {});


