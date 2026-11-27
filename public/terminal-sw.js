// Retire the former stdin endpoint when a previously registered copy updates.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.registration.unregister()))
