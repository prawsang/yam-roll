self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('New Notification', data);
    const options = {
        body: data.body
    }
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
self.addEventListener('notificationclick', event => {
    const url = 'http://192.168.1.36:3000';
    if (clients.openWindow) {
        return clients.openWindow(url);
    }
})