// Service Worker for Mili ❤️ Sukhen Universe
// Handles Web Push Notifications and background offline delivery

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Mili ❤️ Sukhen Universe',
    body: 'New romantic moment shared!',
    url: '/',
    icon: '/icon.png',
    badge: '/icon.png',
    type: 'general',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (err) {
    try {
      if (event.data) {
        data.body = event.data.text();
      }
    } catch (textErr) {
      // default fallback
    }
  }

  const title = data.title || 'Mili ❤️ Sukhen Universe';
  const options = {
    body: data.body || 'You have a new update!',
    icon: data.icon || '/icon.png',
    badge: data.badge || '/icon.png',
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      type: data.type,
    },
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    tag: `mili-alert-${data.type || 'upload'}-${Date.now()}`,
    renotify: true,
    actions: [
      { action: 'open', title: 'Open & View ❤️' },
      { action: 'dismiss', title: 'Close' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url && 'navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
