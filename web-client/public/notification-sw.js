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
    const url = process.env.NODE_ENV === 'production' ? 
    process.env.REACT_APP_URL : process.env.REACT_APP_LOCALHOST_URL;
    if (clients.openWindow) {
        return clients.openWindow(url);
    }
})