// Service Worker for Time Trainer PWA
const CACHE_NAME = 'time-trainer-v1';
const STATIC_CACHE = 'time-trainer-static-v1';
const RUNTIME_CACHE = 'time-trainer-runtime-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Old caches cleaned up');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (url.origin !== self.location.origin) {
        return;
    }
    
    // Handle static files with cache-first strategy
    if (STATIC_FILES.includes(url.pathname) || url.pathname === '/') {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('Serving from cache:', url.pathname);
                        return cachedResponse;
                    }
                    
                    console.log('Fetching from network:', url.pathname);
                    return fetch(request)
                        .then((networkResponse) => {
                            // Cache the response for future use
                            const responseClone = networkResponse.clone();
                            caches.open(STATIC_CACHE)
                                .then((cache) => {
                                    cache.put(request, responseClone);
                                });
                            return networkResponse;
                        })
                        .catch((error) => {
                            console.error('Network fetch failed:', error);
                            // Return offline fallback if available
                            if (url.pathname === '/' || url.pathname.includes('.html')) {
                                return caches.match('/index.html');
                            }
                            throw error;
                        });
                })
        );
    } else {
        // Handle other requests with network-first strategy
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    // Cache successful responses
                    if (networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('Serving from runtime cache:', url.pathname);
                                return cachedResponse;
                            }
                            throw new Error('Resource not available offline');
                        });
                })
        );
    }
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
            case 'CLEAR_CACHE':
                event.waitUntil(
                    caches.keys().then((cacheNames) => {
                        return Promise.all(
                            cacheNames.map((cacheName) => caches.delete(cacheName))
                        );
                    })
                );
                break;
            default:
                console.log('Unknown message type:', event.data.type);
        }
    }
});

// Background sync for storing statistics when offline
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-stats') {
        console.log('Background sync triggered for stats');
        event.waitUntil(syncStatistics());
    }
});

async function syncStatistics() {
    try {
        // This could be expanded to sync stats with a server
        console.log('Statistics sync completed');
    } catch (error) {
        console.error('Statistics sync failed:', error);
    }
}

// Push notification handling (future feature)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Time to practice your time perception!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: data,
            actions: [
                {
                    action: 'open',
                    title: 'Open App',
                    icon: '/icons/action-open.png'
                },
                {
                    action: 'close',
                    title: 'Dismiss',
                    icon: '/icons/action-close.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Time Trainer', options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
