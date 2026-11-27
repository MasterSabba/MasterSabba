self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'Nuova sfida disponibile!',
        icon: 'Image/OriginalArcade.jpeg',
        badge: 'Image/OriginalArcade.jpeg',
        silent: true,      // Disattiva il suono
        vibrate: [],       // Array vuoto per bloccare la vibrazione
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'MasterSabba Arcade', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
