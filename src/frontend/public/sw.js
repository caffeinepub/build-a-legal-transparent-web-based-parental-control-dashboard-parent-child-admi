const CACHE_NAME = 'parental-control-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/generated/pc-logo.dim_256x256.png',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.error('Failed to cache assets:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
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
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Background sync event - retry queued location updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'location-sync') {
    event.waitUntil(syncLocationUpdates());
  }
});

// Periodic background sync event (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'location-periodic-sync') {
    event.waitUntil(syncLocationUpdates());
  }
});

async function syncLocationUpdates() {
  try {
    // Get queued updates from IndexedDB or localStorage
    const queue = await getLocationQueue();
    
    if (queue.length === 0) {
      return;
    }

    // Process queue
    for (const update of queue) {
      try {
        await submitLocationUpdate(update);
        await removeFromQueue(update);
      } catch (error) {
        console.error('Failed to sync location update:', error);
        // Keep in queue for next sync
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getLocationQueue() {
  try {
    const stored = localStorage.getItem('location_update_queue');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get location queue:', error);
    return [];
  }
}

async function removeFromQueue(update) {
  try {
    const queue = await getLocationQueue();
    const filtered = queue.filter(
      (item) => item.timestamp !== update.timestamp
    );
    localStorage.setItem('location_update_queue', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from queue:', error);
  }
}

async function submitLocationUpdate(update) {
  // This would need to call the backend API
  // For now, just log it
  console.log('Syncing location update:', update);
  // In a real implementation, this would make an authenticated API call
  // to the backend canister
}
